# Pomodoro Browser Extension — Implementation Specification

## 1. Mục tiêu

Xây dựng browser extension Pomodoro chạy trên Chrome và có thể đóng gói để cài trên Firefox.

MVP phải hỗ trợ:

- Focus, short break và long break.
- Mục tiêu số phiên focus trong ngày.
- Tự động chọn short break/long break theo chu kỳ.
- Reset bộ đếm khi sang ngày mới.
- Thống kê focus, short break và long break theo ngày.
- Tuỳ chỉnh thời lượng từng phase.
- Pause, resume, skip và reset.
- Countdown tiếp tục chính xác khi popup đóng, chuyển tab hoặc chuyển app.
- Notification khi phase kết thúc.
- Chrome Manifest V3 và Firefox WebExtensions.

## 2. Quy tắc Pomodoro

### 2.1. Settings cốt lõi

- dailyFocusGoal: số focus mục tiêu trong ngày, mặc định 12.
- longBreakInterval: sau bao nhiêu focus thì có long break, mặc định 4.
- focusMinutes: mặc định 25.
- shortBreakMinutes: mặc định 5.
- longBreakMinutes: mặc định 15.

Với dailyFocusGoal = 12 và longBreakInterval = 4:

~~~text
Focus 1 → Short
Focus 2 → Short
Focus 3 → Short
Focus 4 → Long
Focus 5 → Short
Focus 6 → Short
Focus 7 → Short
Focus 8 → Long
Focus 9 → Short
Focus 10 → Short
Focus 11 → Short
Focus 12 → Long
~~~

Kết quả là 12 focus, 9 short break và 3 long break nếu tất cả phase đều hoàn thành. Diễn giải “12 focus → 3 short break + 1 long break” không phù hợp với quy tắc cứ 4 focus có 1 long break; nó chỉ tương ứng với một chu kỳ 4 focus.

### 2.2. Phase tiếp theo

~~~ts
function getNextPhase(
  currentPhase: Phase,
  completedFocusToday: number,
  longBreakInterval: number,
): Phase {
  if (currentPhase !== "focus") return "focus";

  if (completedFocusToday % longBreakInterval === 0) {
    return "longBreak";
  }

  return "shortBreak";
}
~~~

Hàm được gọi sau khi focus hoàn thành và bộ đếm focus đã tăng lên.

## 3. Data model

### 3.1. Timer state

~~~ts
type Phase = "focus" | "shortBreak" | "longBreak";
type TimerStatus = "idle" | "running" | "paused";

type TimerState = {
  phase: Phase;
  status: TimerStatus;
  startedAt?: number;
  endAt?: number;
  pausedRemainingMs?: number;

  cyclePosition: number;
  completedFocusToday: number;
  completedShortBreakToday: number;
  completedLongBreakToday: number;

  // YYYY-MM-DD theo local timezone.
  dayKey: string;
};
~~~

### 3.2. Settings

~~~ts
type Settings = {
  dailyFocusGoal: number;
  longBreakInterval: number;

  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;

  autoStartBreak: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
  notificationEnabled: boolean;
};
~~~

Giá trị mặc định:

~~~ts
const DEFAULT_SETTINGS = {
  dailyFocusGoal: 12,
  longBreakInterval: 4,
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  autoStartBreak: true,
  autoStartFocus: false,
  soundEnabled: true,
  notificationEnabled: true,
};
~~~

Validation:

- Duration: số nguyên 1–180 phút.
- dailyFocusGoal: 1–100.
- longBreakInterval: 1–20.
- Nếu đổi setting khi timer đang chạy, phase hiện tại giữ duration cũ; setting mới áp dụng từ phase kế tiếp.

### 3.3. Daily statistics

Chỉ phase hoàn thành đầy đủ mới được tính vào completed count.

~~~ts
type DailyStats = {
  date: string; // YYYY-MM-DD
  focusCompleted: number;
  shortBreakCompleted: number;
  longBreakCompleted: number;
  focusDurationMs: number;
  skippedFocus: number;
  skippedShortBreak: number;
  skippedLongBreak: number;
};
~~~

Lưu theo key stats:YYYY-MM-DD. Không xoá history của các ngày trước.

## 4. Reset theo ngày

~~~ts
function getLocalDayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return year + "-" + month + "-" + day;
}
~~~

Mỗi khi extension được mở, popup được mở, alarm được xử lý hoặc message được nhận:

1. Đọc dayKey hiện tại.
2. So sánh với getLocalDayKey().
3. Nếu khác, bắt đầu thống kê ngày mới từ 0.
4. Giữ lại history ngày trước.
5. Dùng local timezone của thiết bị.

Đề xuất MVP: nếu timer chạy qua nửa đêm, phase đang chạy thuộc ngày bắt đầu; phase kế tiếp thuộc ngày mới.

## 5. Countdown và persistence

### 5.1. Nguồn sự thật

Không dùng setInterval trong popup làm nguồn sự thật. Popup có thể đóng khi chuyển tab.

Khi start:

~~~ts
const endAt = Date.now() + durationMs;
~~~

UI tính:

~~~ts
const remainingMs = Math.max(0, endAt - Date.now());
~~~

Popup chỉ dùng timer ngắn để refresh giao diện mỗi 250–1000ms.

### 5.2. Alarms API

Khi start:

~~~ts
await browserApi.alarms.create("pomodoro-end", {
  when: endAt,
});
~~~

Khi alarm chạy:

1. Đọc state mới nhất từ storage.
2. Kiểm tra timer còn running.
3. Kiểm tra Date.now() >= endAt.
4. Ghi nhận phase hoàn thành.
5. Chuyển sang phase kế tiếp.
6. Auto-start hoặc chờ người dùng.
7. Gửi notification và cập nhật badge.

Khi service worker khởi động lại:

1. Đọc state từ storage.
2. Nếu timer đang chạy và endAt chưa tới, tạo lại alarm.
3. Nếu endAt đã qua, gọi logic complete phase.
4. Không phụ thuộc vào biến global trong service worker.

Nếu máy sleep, alarm có thể chạy sau khi máy thức dậy. Luôn dùng endAt để tính lại trạng thái.

## 6. User actions

### Start

- Chỉ start khi idle hoặc paused.
- Với idle: set startedAt = Date.now(), endAt = Date.now() + durationMs.
- Với paused: dùng pausedRemainingMs.
- Lưu state trước khi tạo alarm.

### Pause

- Chỉ hoạt động khi running.
- Lưu pausedRemainingMs = max(0, endAt - Date.now()).
- Xoá alarm.
- Chuyển status thành paused.

### Resume

- Chỉ hoạt động khi paused.
- Set startedAt = Date.now().
- Set endAt = Date.now() + pausedRemainingMs.
- Tạo lại alarm.
- Chuyển status thành running.

### Skip

- Xoá alarm hiện tại.
- Không tăng completed count.
- Tăng skipped count tương ứng.
- Chuyển phase.
- Auto-start phase mới nếu setting tương ứng bật.

### Reset

- Xoá alarm.
- Đưa timer về idle.
- Giữ nguyên thống kê đã hoàn thành.
- Phase sau reset là focus.

### Complete

- Mỗi phase chỉ được ghi nhận một lần.
- Chống xử lý trùng nếu click và alarm xảy ra gần nhau.

## 7. Kiến trúc source

~~~text
src/
  background/
    index.ts
    timer-engine.ts
    alarm-manager.ts
    storage.ts
    notifications.ts
    badge.ts

  popup/
    App.tsx
    components/
      TimerView.tsx
      ProgressView.tsx
      StatisticsView.tsx
      SettingsView.tsx

  shared/
    types.ts
    constants.ts
    date.ts
    browser-api.ts
~~~

Background service worker chịu trách nhiệm timer state, alarms, chuyển phase, storage, daily reset, notification và badge.

Popup chỉ hiển thị state, gửi command tới background, refresh countdown theo endAt và hiển thị statistics/settings. Popup không tự quyết định việc complete phase.

### Message protocol

~~~ts
type Command =
  | { type: "GET_STATE" }
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "SKIP" }
  | { type: "RESET" }
  | { type: "UPDATE_SETTINGS"; settings: Partial<Settings> };

type Response = {
  ok: boolean;
  state?: TimerState;
  settings?: Settings;
  error?: string;
};
~~~

## 8. UI/UX MVP

### Timer view

- Tên phase.
- Countdown MM:SS.
- Start/Pause/Resume.
- Skip.
- Reset.
- Tiến độ completedFocusToday / dailyFocusGoal.
- Số phase đã hoàn thành trong ngày.

### Statistics view

- Focus hoàn thành hôm nay.
- Short break hoàn thành hôm nay.
- Long break hoàn thành hôm nay.
- Tổng thời gian focus.
- Số phase bị skip.

### Settings view

- Daily focus goal.
- Long break interval.
- Focus duration.
- Short break duration.
- Long break duration.
- Auto-start break.
- Auto-start focus.
- Notification.
- Sound.

## 9. Notifications và badge

Khi phase kết thúc:

- Gửi desktop notification nếu enabled.
- Cập nhật extension badge.
- Đổi title/icon theo phase.
- Phát âm thanh nếu browser cho phép.

Notification là cơ chế chính; không phụ thuộc hoàn toàn vào audio vì autoplay policy có thể chặn âm thanh.

## 10. Chrome/Firefox compatibility

### API abstraction

~~~ts
export const browserApi =
  globalThis.browser ?? globalThis.chrome;
~~~

Có thể dùng webextension-polyfill để có Promise API thống nhất.

API chính:

- storage.local
- alarms
- notifications
- runtime
- action

### Manifest

Dùng Manifest V3:

~~~json
{
  "permissions": [
    "storage",
    "alarms",
    "notifications"
  ]
}
~~~

Không cần host permission trong MVP.

Có thể thêm Firefox metadata:

~~~json
{
  "browser_specific_settings": {
    "gecko": {
      "id": "pomodoro@example.com"
    }
  }
}
~~~

Build tạo hai output:

~~~text
dist/chrome/
dist/firefox/
~~~

Source core dùng chung; manifest có thể override nếu hai browser cần khác nhau.

## 11. Tính năng nâng cao từ đối thủ

Các nhóm tính năng nên tham khảo:

- Countdown trên toolbar icon.
- Lịch sử và thống kê.
- Custom duration.
- Configurable long-break interval.
- Desktop/tab notifications.
- Nhiều âm báo và ticking sound.
- Task list.
- Task templates.
- Báo cáo ngày/tuần/tháng.
- Export CSV.
- Background sounds.
- Ước tính thời gian hoàn thành.
- Todoist/webhook integration.

Ưu tiên sau MVP:

1. Task list và gán focus cho task.
2. History theo tuần/tháng.
3. Export CSV/JSON.
4. Keyboard shortcuts.
5. Badge/icon countdown.
6. Dark mode.
7. Streak.
8. Website blocking.
9. Project/category tracking.
10. Chrome Sync hoặc cloud backup.

## 12. Acceptance criteria

### Timer

- [ ] Có focus, short break và long break.
- [ ] Start hoạt động.
- [ ] Pause giữ đúng thời gian còn lại.
- [ ] Resume tiếp tục đúng thời gian.
- [ ] Skip không tăng completed count.
- [ ] Reset dừng timer và giữ history.
- [ ] Phase tự chuyển đúng theo longBreakInterval.

### Daily goal

- [ ] Đặt được daily focus goal.
- [ ] UI hiển thị completed / goal.
- [ ] Đạt goal không tự dừng timer.
- [ ] Có thể tiếp tục sau khi đạt goal.

### Daily reset

- [ ] Sau nửa đêm, counter ngày mới bắt đầu từ 0.
- [ ] History ngày cũ vẫn còn.
- [ ] Reset hoạt động khi popup chưa được mở.
- [ ] Reset dùng local timezone.

### Persistence

- [ ] Đóng popup không làm timer dừng.
- [ ] Chuyển tab không làm timer dừng.
- [ ] Đóng/mở browser vẫn khôi phục timer.
- [ ] Service worker restart không làm mất state.
- [ ] Máy sleep rồi wake up vẫn tính theo endAt.

### Statistics

- [ ] Chỉ phase hoàn thành mới tăng completed count.
- [ ] Có thống kê focus, short break và long break.
- [ ] Có tổng thời gian focus.
- [ ] Có số phase bị skip.

### Cross-browser

- [ ] Load được trên Chrome dưới dạng unpacked extension.
- [ ] Load được trên Firefox dưới dạng temporary add-on.
- [ ] Core logic không dùng Chrome-only API.
- [ ] Có package build cho Chrome và Firefox.

## 13. Test cases tối thiểu

1. Start focus 1 phút, chờ hết, xác nhận chuyển sang short break.
2. Hoàn thành 4 focus, xác nhận phase tiếp theo là long break.
3. Đặt daily goal bằng 12, xác nhận UI hiển thị x/12.
4. Skip focus, xác nhận completed không tăng và skipped tăng.
5. Pause, đóng popup 30 giây, mở lại, xác nhận remaining không reset.
6. Chuyển tab trong lúc timer chạy.
7. Reload extension/service worker, xác nhận alarm được khôi phục.
8. Sang ngày mới bằng fake clock, xác nhận counter reset.
9. Đổi duration trong lúc timer chạy, xác nhận phase hiện tại không đổi duration.
10. Với 12 focus và interval 4, xác nhận 9 short break và 3 long break.
11. Test trên Chrome và Firefox.

## 14. Roadmap

### Phase 1 — MVP

- Timer engine.
- Storage persistence.
- Alarms.
- Popup timer.
- Settings.
- Daily statistics.
- Notifications.
- Chrome build.
- Unit tests cho timer state machine và daily reset.

### Phase 2 — Cross-browser và usability

- Firefox build.
- Keyboard shortcuts.
- Badge/icon countdown.
- History ngày/tuần/tháng.
- Export CSV/JSON.
- Dark mode.

### Phase 3 — Productivity

- Task list.
- Templates.
- Project/category.
- Streak.
- Background sound.
- Website blocking.

### Phase 4 — Integrations

- Chrome Sync.
- Cloud backup.
- Todoist.
- Webhook/API.

## 15. Prompt đưa cho Coding Agent

~~~text
Implement the Pomodoro browser extension based on
docs/POMODORO_EXTENSION_SPEC.md.

Start with Phase 1 MVP only.
Before coding, inspect the existing repository and preserve the current
architecture where possible.

Requirements:
- Use Manifest V3.
- Keep timer state in the background service worker.
- Use storage.local for persistence.
- Use alarms API for phase completion.
- Treat endAt as the source of truth for countdown.
- Make core logic browser-agnostic for Chrome and Firefox.
- Add unit tests for the timer state machine and daily reset logic.
- Add manual verification instructions for Chrome and Firefox.
- Do not implement website blocking, cloud sync or integrations in Phase 1.
~~~


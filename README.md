# FocusFlow Pomodoro Extension

Đây là bản MVP implement design từ Google Stitch và logic trong `docs/POMODORO_EXTENSION_SPEC.md`.

## Chạy trên Chrome

1. Mở `chrome://extensions`.
2. Bật **Developer mode**.
3. Chọn **Load unpacked**.
4. Chọn thư mục project này.
5. Pin extension FocusFlow trên toolbar.

## Chạy trên Firefox

1. Mở `about:debugging#/runtime/this-firefox`.
2. Chọn **Load Temporary Add-on**.
3. Chọn file `manifest.json` trong project.

## Files chính

- `manifest.json`: Manifest V3.
- `background.js`: timer engine, storage, alarms, daily statistics và notifications.
- `popup.html`: popup shell.
- `popup.css`: design system và layout 400×600 từ Stitch.
- `popup.js`: UI state, timer display, statistics và settings.
- `stitch_focusflow/`: export gốc từ Google Stitch.

## Kiểm tra nhanh

- Đặt duration focus xuống 1 phút trong Settings.
- Start timer rồi đóng popup.
- Mở popup lại hoặc chuyển tab để kiểm tra countdown.
- Pause/resume, skip và reset.
- Kiểm tra Statistics sau khi phase hoàn thành.

## Keyboard shortcuts

- `Ctrl+Shift+F`: Start, pause hoặc resume timer.
- `Ctrl+Shift+K`: Skip phase hiện tại và tự động bắt đầu phase tiếp theo.

Có thể thay đổi shortcut trong trang quản lý extension shortcuts của Chrome hoặc
Firefox.

## Backup và giao diện

Trong Settings:

- **Export data** tải settings và toàn bộ daily history thành file JSON.
- **Import data** khôi phục settings và history từ file backup FocusFlow.
- Import không ghi đè timer đang chạy.
- **Theme** hỗ trợ Light, Dark và Sage; lựa chọn được lưu tự động.

## Focus mode, goals và notes

- **Focus mode** chặn overlay trên các domain đã nhập khi Focus đang chạy.
- Website được nhập mỗi domain một dòng, ví dụ `youtube.com`.
- Statistics hỗ trợ mục tiêu ngày, tuần và tháng.
- Có thể nhập session note trong Focus; note được lưu khi session hoàn thành và hiển thị trong Statistics.
- Settings hiển thị shortcut hiện tại của timer và skip phase; shortcut được thay đổi tại phần quản lý shortcut của browser.

## Chạy automated tests

```bash
npm test
```

Test suite hiện kiểm tra timer state machine, daily key, daily statistics,
history aggregation, streak calculation và smoke test package assets cho Chrome/Firefox.

## Audio cross-browser

- Chrome dùng Offscreen Document để phát sound khi popup đã đóng.
- Firefox dùng background page fallback và phát file MP3 trực tiếp từ extension context.

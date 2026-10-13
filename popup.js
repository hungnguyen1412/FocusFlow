const api = globalThis.browser ?? globalThis.chrome;
const app = document.getElementById("app");

let model = {
  state: { phase: "focus", status: "idle", completedFocusToday: 0, cyclePosition: 0 },
  settings: { dailyFocusGoal: 12, weeklyFocusGoal: 60, monthlyFocusGoal: 240, longBreakInterval: 4, focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, autoStartBreak: true, autoStartFocus: false, soundEnabled: true, soundFile: "ring-1", language: "en", theme: "light", focusModeEnabled: false, blockedWebsites: [] },
  stats: { focusCompleted: 0, shortBreakCompleted: 0, longBreakCompleted: 0, focusDurationMs: 0 },
  history: {},
  commands: [],
};
let activeScreen = "timer";
let statsRange = "today";
let ticker;

const translations = {
  en: {
    focus: "Focus", shortBreak: "Short break", longBreak: "Long break",
    deepWork: "Deep work session", recharge: "Recharge for the next session", completedCycle: "You completed a focus cycle",
    start: "Start", pause: "Pause", resume: "Resume", skip: "Skip", reset: "Reset",
    today: "Today's statistics", focusSessions: "focus sessions", nextLong: "Long break next", nextShort: "Short break next",
    todayProgress: "Today", goal: "Goal", focused: "focused", streak: "5 day streak", focusTime: "Total focused time",
    statistics: "Statistics", settings: "Settings", timer: "Focus", pomodoro: "POMODORO", live: "• LIVE",
    totalFocus: "Total focused time", target: "target", completion: "Completion progress", focusMetric: "Focus", shortMetric: "Short break", longMetric: "Long break",
    sessions: "sessions", times: "times", activity: "Today's activity", weekly: "Weekly performance", completed: "completed", streakTitle: "day streak", streakCopy: "Complete all your daily goals", todayRange: "Today", weekRange: "Week", monthRange: "Month", history: "History", noActivity: "No completed focus sessions", days: "days", weeklyGoal: "Weekly goal", monthlyGoal: "Monthly goal", sessionNotes: "Session notes", noNotes: "No notes yet", notePlaceholder: "What did you accomplish?",
    settingsSubtitle: "Tune your focus rhythm", timerDurations: "Timer durations", dailyGoal: "Daily goal", automation: "Automation", appearance: "Appearance", theme: "Theme", themeHelp: "Choose your visual mood", lightTheme: "Light", darkTheme: "Dark", sageTheme: "Sage", data: "Your data", exportData: "Export data", exportHelp: "Download settings and statistics as JSON", importData: "Import data", importHelp: "Restore a FocusFlow JSON backup", exportSuccess: "Backup exported", importSuccess: "Backup imported", invalidImport: "This backup file is invalid or unsupported.", notifications: "Notifications", sound: "Completion sound", soundHelp: "Play a sound when a phase ends", soundChoice: "Sound", soundChoiceHelp: "Choose the sound for every phase", autoHide: "Auto-hide notification", autoHideHelp: "Automatically dismiss the notification", hideDuration: "Hide after", hideDurationHelp: "How long the notification stays visible",
    durationFocus: "Focus", durationFocusHelp: "Work session length", durationShort: "Short break", durationShortHelp: "Quick recovery length", durationLong: "Long break", durationLongHelp: "Deep recovery length",
    dailyGoalName: "Focus sessions per day", dailyGoalHelp: "Your daily focus target", intervalName: "Long break every", intervalHelp: "Sessions before a long break",
    autoBreak: "Auto-start breaks", autoBreakHelp: "Start the next break when focus ends", autoFocus: "Auto-start focus sessions", autoFocusHelp: "Start focus when a break ends", focusMode: "Focus mode", focusModeHelp: "Block selected websites while Focus is running", blockedSites: "Blocked websites", blockedSitesHelp: "One domain per line, for example youtube.com", blockedSitesPlaceholder: "youtube.com\nnews.example.com", shortcuts: "Keyboard shortcuts", shortcutHelp: "Change shortcuts in your browser settings", toggleTimer: "Start / pause timer", skipPhase: "Skip current phase", notSet: "Not set", desktop: "Desktop notifications", desktopHelp: "Notify when a phase ends",
    language: "Language", languageHelp: "Choose the interface language", english: "English", vietnamese: "Vietnamese",
    note: (goal, interval, shortCount, longCount) => `With ${goal} focus sessions and a long break every ${interval} sessions, you will have ${shortCount} short breaks and ${longCount} long breaks if all sessions are completed.`,
    ready: "Ready for your next focused session?", next: "next", session: "Session",
  },
  vi: {
    focus: "Tập trung", shortBreak: "Nghỉ ngắn", longBreak: "Nghỉ dài",
    deepWork: "Phiên làm việc sâu", recharge: "Nạp lại năng lượng", completedCycle: "Bạn đã hoàn thành một chu kỳ",
    start: "Bắt đầu", pause: "Tạm dừng", resume: "Tiếp tục", skip: "Bỏ qua", reset: "Đặt lại",
    today: "Thống kê hôm nay", focusSessions: "phiên tập trung", nextLong: "Nghỉ dài kế tiếp", nextShort: "Nghỉ ngắn kế tiếp",
    todayProgress: "Hôm nay", goal: "Mục tiêu", focused: "tập trung", streak: "Chuỗi 5 ngày", focusTime: "Tổng thời gian tập trung",
    statistics: "Thống kê", settings: "Cài đặt", timer: "Tập trung", pomodoro: "POMODORO", live: "• TRỰC TIẾP",
    totalFocus: "Tổng thời gian tập trung", target: "mục tiêu", completion: "Tiến độ hoàn thành", focusMetric: "Tập trung", shortMetric: "Nghỉ ngắn", longMetric: "Nghỉ dài",
    sessions: "phiên", times: "lần", activity: "Dòng hoạt động hôm nay", weekly: "Hiệu suất tuần", completed: "hoàn thành", streakTitle: "ngày liên tiếp", streakCopy: "Hoàn thành mọi mục tiêu đặt ra", todayRange: "Hôm nay", weekRange: "Tuần", monthRange: "Tháng", history: "Lịch sử", noActivity: "Chưa có phiên focus hoàn thành", days: "ngày", weeklyGoal: "Mục tiêu tuần", monthlyGoal: "Mục tiêu tháng", sessionNotes: "Ghi chú phiên", noNotes: "Chưa có ghi chú", notePlaceholder: "Bạn đã hoàn thành gì?",
    settingsSubtitle: "Điều chỉnh nhịp tập trung", timerDurations: "Thời lượng timer", dailyGoal: "Mục tiêu hằng ngày", automation: "Tự động hoá", appearance: "Giao diện", theme: "Chủ đề", themeHelp: "Chọn phong cách hiển thị", lightTheme: "Sáng", darkTheme: "Tối", sageTheme: "Sage", data: "Dữ liệu của bạn", exportData: "Xuất dữ liệu", exportHelp: "Tải cài đặt và thống kê dưới dạng JSON", importData: "Nhập dữ liệu", importHelp: "Khôi phục file backup FocusFlow", exportSuccess: "Đã xuất dữ liệu", importSuccess: "Đã nhập dữ liệu", invalidImport: "File backup không hợp lệ hoặc không được hỗ trợ.", notifications: "Thông báo", sound: "Âm thanh hoàn thành", soundHelp: "Phát âm thanh khi phase kết thúc", soundChoice: "Âm thanh", soundChoiceHelp: "Chọn âm thanh cho mọi phase", autoHide: "Tự động ẩn notification", autoHideHelp: "Tự động đóng notification", hideDuration: "Ẩn sau", hideDurationHelp: "Thời gian notification hiển thị",
    durationFocus: "Tập trung", durationFocusHelp: "Thời lượng phiên làm việc", durationShort: "Nghỉ ngắn", durationShortHelp: "Thời lượng hồi phục nhanh", durationLong: "Nghỉ dài", durationLongHelp: "Thời lượng hồi phục sâu",
    dailyGoalName: "Phiên tập trung mỗi ngày", dailyGoalHelp: "Mục tiêu focus mỗi ngày", intervalName: "Nghỉ dài sau mỗi", intervalHelp: "Số phiên trước khi nghỉ dài",
    autoBreak: "Tự động bắt đầu giờ nghỉ", autoBreakHelp: "Bắt đầu nghỉ khi focus kết thúc", autoFocus: "Tự động bắt đầu phiên focus", autoFocusHelp: "Bắt đầu focus khi nghỉ xong", focusMode: "Chế độ tập trung", focusModeHelp: "Chặn website đã chọn khi Focus đang chạy", blockedSites: "Website bị chặn", blockedSitesHelp: "Mỗi domain một dòng, ví dụ youtube.com", blockedSitesPlaceholder: "youtube.com\nnews.example.com", shortcuts: "Phím tắt", shortcutHelp: "Thay đổi phím tắt trong cài đặt trình duyệt", toggleTimer: "Bắt đầu / tạm dừng", skipPhase: "Bỏ qua phase hiện tại", notSet: "Chưa đặt", desktop: "Thông báo desktop", desktopHelp: "Nhắc khi phase kết thúc",
    language: "Ngôn ngữ", languageHelp: "Chọn ngôn ngữ giao diện", english: "English", vietnamese: "Tiếng Việt",
    note: (goal, interval, shortCount, longCount) => `Với ${goal} phiên focus và long break sau mỗi ${interval} phiên, bạn sẽ có ${shortCount} short break và ${longCount} long break nếu hoàn thành toàn bộ.`,
    ready: "Sẵn sàng cho phiên tập trung tiếp theo?", next: "kế tiếp", session: "Phiên",
  },
};

function t(key, ...args) {
  const language = model.settings.language === "vi" ? "vi" : "en";
  const value = translations[language][key] ?? translations.en[key] ?? key;
  return typeof value === "function" ? value(...args) : value;
}

function send(type, payload) {
  return api.runtime.sendMessage({ type, payload });
}

function applyTheme(theme = "light") {
  const allowedThemes = ["light", "dark", "sage"];
  document.documentElement.dataset.theme = allowedThemes.includes(theme) ? theme : "light";
}

function downloadBackup(backup) {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `focusflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function exportBackup() {
  const response = await send("EXPORT_DATA");
  if (response?.error || !response?.backup) throw new Error(response?.error ?? "Export failed");
  downloadBackup(response.backup);
}

function phaseMeta(phase) {
  return phase === "focus"
    ? { label: t("focus"), caption: t("deepWork"), color: "#e85d4a", soft: "#faece8" }
    : phase === "shortBreak"
      ? { label: t("shortBreak"), caption: t("recharge"), color: "#6faf8f", soft: "#e6f1eb" }
      : { label: t("longBreak"), caption: t("completedCycle"), color: "#d59a45", soft: "#fff0d8" };
}

function durationMs(phase) {
  const minutes = phase === "focus" ? model.settings.focusMinutes : phase === "shortBreak" ? model.settings.shortBreakMinutes : model.settings.longBreakMinutes;
  return minutes * 60 * 1000;
}

function remainingMs() {
  const { state } = model;
  if (state.status === "paused") return state.pausedRemainingMs ?? durationMs(state.phase);
  if (state.status === "running" && state.endAt) return Math.max(0, state.endAt - Date.now());
  return durationMs(state.phase);
}

function formatTime(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function formatHours(ms) {
  const minutes = Math.round(ms / 60000);
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

function icon(name) { return `<span class="nav-icon">${name}</span>`; }

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromOffset(offset) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - offset);
  return date;
}

function statsFor(dateOrKey) {
  const key = typeof dateOrKey === "string" ? dateOrKey : localDateKey(dateOrKey);
  return model.history?.[key] ?? {
    date: key,
    focusCompleted: 0,
    shortBreakCompleted: 0,
    longBreakCompleted: 0,
    focusDurationMs: 0,
  };
}

function dateLabel(date, options = { month: "short", day: "numeric" }) {
  const locale = model.settings.language === "vi" ? "vi-VN" : "en-US";
  return new Intl.DateTimeFormat(locale, options).format(date);
}

function aggregateStats(days) {
  return days.reduce((total, date) => {
    const stats = statsFor(date);
    total.focusCompleted += stats.focusCompleted ?? 0;
    total.shortBreakCompleted += stats.shortBreakCompleted ?? 0;
    total.longBreakCompleted += stats.longBreakCompleted ?? 0;
    total.focusDurationMs += stats.focusDurationMs ?? 0;
    return total;
  }, { focusCompleted: 0, shortBreakCompleted: 0, longBreakCompleted: 0, focusDurationMs: 0 });
}

function completedGoalStreak() {
  const goal = model.settings.dailyFocusGoal;
  let cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  if ((statsFor(cursor).focusCompleted ?? 0) < goal) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while ((statsFor(cursor).focusCompleted ?? 0) >= goal) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function rangeDays(range) {
  const count = range === "month" ? 30 : 7;
  return Array.from({ length: count }, (_, index) => dateFromOffset(count - 1 - index));
}

function renderShell() {
  applyTheme(model.settings.theme);
  app.innerHTML = `
    <header class="topbar">
      <div class="brand"><span class="brand-mark">◷</span><span>FocusFlow</span><span class="status-dot"></span></div>
      <div class="topbar-meta"><span class="eyebrow">${t("pomodoro")}</span><button class="icon-button" aria-label="Profile">●</button></div>
    </header>
    <main class="main">
      <section class="screen ${activeScreen === "timer" ? "active" : ""}" id="timer-screen"></section>
      <section class="screen ${activeScreen === "stats" ? "active" : ""}" id="stats-screen"></section>
      <section class="screen ${activeScreen === "settings" ? "active" : ""}" id="settings-screen"></section>
    </main>
    <nav class="bottom-nav">
      <button class="nav-button ${activeScreen === "timer" ? "active" : ""}" data-nav="timer">${icon("◷")}<span>${t("timer")}</span></button>
      <button class="nav-button ${activeScreen === "stats" ? "active" : ""}" data-nav="stats">${icon("▥")}<span>${t("statistics")}</span></button>
      <button class="nav-button ${activeScreen === "settings" ? "active" : ""}" data-nav="settings">${icon("☷")}<span>${t("settings")}</span></button>
    </nav>`;
  renderCurrentScreen();
  document.querySelectorAll("[data-nav]").forEach((button) => button.addEventListener("click", () => {
    activeScreen = button.dataset.nav;
    renderShell();
  }));
}

function renderTimer() {
  const { state, settings, stats } = model;
  const meta = phaseMeta(state.phase);
  const remaining = remainingMs();
  const total = durationMs(state.phase);
  const progress = Math.min(1, Math.max(0, 1 - remaining / total));
  const circumference = 2 * Math.PI * 112;
  const completed = stats.focusCompleted ?? state.completedFocusToday ?? 0;
  const goal = settings.dailyFocusGoal;
  const percent = Math.min(100, Math.round((completed / goal) * 100));
  const cyclePosition = completed % settings.longBreakInterval;
  // On the initial focus screen, show the first session. On a break screen,
  // show the number of focus sessions actually completed in this cycle. A
  // completed cycle remains 4/4 during its long break, while a manually
  // selected break before any focus is completed remains 0/4.
  const currentSlot = state.phase === "focus"
    ? cyclePosition + 1
    : (cyclePosition === 0 && completed > 0 ? settings.longBreakInterval : cyclePosition);
  const nextBreak = currentSlot === settings.longBreakInterval ? t("nextLong") : t("nextShort");
  const cyclePill = state.phase === "focus"
    ? `<div class="cycle-pill"><span class="cycle-dots">${Array.from({ length: settings.longBreakInterval }, (_, i) => `<i style="opacity:${i < currentSlot ? 1 : .25}"></i>`).join("")}</span><span>${t("session")} ${currentSlot}/${settings.longBreakInterval} · ${nextBreak}</span></div>`
    : "";
  const buttonLabel = state.status === "running" ? t("pause") : state.status === "paused" ? t("resume") : t("start");
  const buttonIcon = state.status === "running" ? "Ⅱ" : "▶";
  const isRunning = state.status === "running";

  document.getElementById("timer-screen").innerHTML = `
    <div class="segment" style="--phase-color:${meta.color}">
      <button class="${state.phase === "focus" ? "active" : ""}" data-phase="focus">${t("focus")}</button>
      <button class="${state.phase === "shortBreak" ? "active" : ""}" data-phase="shortBreak">${t("shortBreak")}</button>
      <button class="${state.phase === "longBreak" ? "active" : ""}" data-phase="longBreak">${t("longBreak")}</button>
    </div>
    <div class="timer-stage" style="--phase-color:${meta.color};--phase-soft:${meta.soft}">
      <div class="timer-dial">
        <svg class="timer-svg" viewBox="0 0 256 256" aria-hidden="true">
          <circle class="timer-track" cx="128" cy="128" r="112"></circle>
          <circle class="timer-progress" cx="128" cy="128" r="112" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference * (1 - progress)}"></circle>
        </svg>
        <div class="timer-content">
          <div class="phase-chip">${meta.label}</div>
          <div class="timer-display">${formatTime(remaining)}</div>
          <div class="timer-caption">${meta.caption}</div>
        </div>
      </div>
      ${cyclePill}
    </div>
    <div class="actions" style="--phase-color:${meta.color}">
      <button class="primary-button" id="toggle-timer">${buttonIcon} &nbsp; ${buttonLabel}</button>
      <button class="secondary-button" id="skip-timer">▷| &nbsp; ${t("skip")}</button>
    </div>
    <button class="reset-button" id="reset-timer">↻ &nbsp; ${t("reset")}</button>
    <div class="card progress-card">
      <div class="card-heading"><div class="card-title"><span class="card-title-icon">◌</span>${t("todayProgress")}</div><div><span class="badge">${completed} / ${goal} ${t("focusSessions")}</span> <span class="muted" style="font-size:10px">(${percent}%)</span></div></div>
      <div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div>
      <div class="small-row"><span>${t("goal")}: ${formatHours(goal * settings.focusMinutes * 60000)} ${t("focused")}</span><span class="accent">• ${completed} → ${nextBreak.toLowerCase()}</span></div>
    </div>
    ${state.phase === "focus" ? `<div class="card session-note-card"><div class="card-title"><span class="card-title-icon">✎</span>${t("sessionNotes")}</div><textarea id="session-note" maxlength="500" placeholder="${t("notePlaceholder")}">${escapeHtml(state.sessionNote)}</textarea></div>` : ""}
    <div class="card footer-stat"><div class="flame">♨</div><div class="footer-stat-copy"><span>${t("focusTime")}: ${formatHours(stats.focusDurationMs ?? 0)}</span><strong>${t("streak")} 🔥</strong></div><div class="footer-value">${formatHours(stats.focusDurationMs ?? 0)}</div></div>`;

  document.querySelectorAll("[data-phase]").forEach((button) => button.addEventListener("click", async () => {
    if (button.dataset.phase !== state.phase) {
      await send("SET_PHASE", { phase: button.dataset.phase });
      await refresh();
    }
  }));
  document.getElementById("toggle-timer").addEventListener("click", async () => {
    await send(state.status === "running" ? "PAUSE" : state.status === "paused" ? "RESUME" : "START");
    await refresh();
  });
  document.getElementById("skip-timer").addEventListener("click", async () => { await send("SKIP"); await refresh(); });
  document.getElementById("reset-timer").addEventListener("click", async () => { await send("RESET"); await refresh(); });
  const noteInput = document.getElementById("session-note");
  if (noteInput) {
    let noteTimer;
    noteInput.addEventListener("input", () => {
      model.state.sessionNote = noteInput.value;
      clearTimeout(noteTimer);
      noteTimer = setTimeout(() => send("UPDATE_SESSION_NOTE", { text: noteInput.value }), 350);
    });
    noteInput.addEventListener("blur", () => send("UPDATE_SESSION_NOTE", { text: noteInput.value }));
  }
}

function renderStats() {
  const { settings } = model;
  const today = new Date();
  const todayStats = statsFor(today);
  const days = rangeDays(statsRange);
  const stats = statsRange === "today" ? todayStats : aggregateStats(days);
  const total = stats.focusDurationMs ?? 0;
  const focusGoal = statsRange === "today" ? settings.dailyFocusGoal : statsRange === "week" ? settings.weeklyFocusGoal : settings.monthlyFocusGoal;
  const progress = Math.min(100, Math.round(((stats.focusCompleted ?? 0) / focusGoal) * 100));
  const streak = completedGoalStreak();
  const rangeTabs = `<div class="range-tabs"><button class="${statsRange === "today" ? "active" : ""}" data-range="today">${t("todayRange")}</button><button class="${statsRange === "week" ? "active" : ""}" data-range="week">${t("weekRange")}</button><button class="${statsRange === "month" ? "active" : ""}" data-range="month">${t("monthRange")}</button></div>`;
  const chartDays = rangeDays("week");
  const maxFocus = Math.max(1, ...chartDays.map((date) => statsFor(date).focusCompleted ?? 0));
  const weeklyChart = chartDays.map((date) => {
    const value = statsFor(date).focusCompleted ?? 0;
    const label = new Intl.DateTimeFormat(model.settings.language === "vi" ? "vi-VN" : "en-US", { weekday: "short" }).format(date).slice(0, 2);
    return `<div class="bar-wrap"><div class="bar ${value > 0 ? "active" : ""}" style="height:${Math.max(6, (value / maxFocus) * 58)}px" title="${value} ${t("focusSessions")}"></div><span>${label}</span></div>`;
  }).join("");
  const historyRows = days.slice().reverse().map((date) => {
    const item = statsFor(date);
    const dateText = dateLabel(date, { month: "short", day: "numeric" });
    return `<div class="history-row"><div><strong>${dateText}</strong><span>${item.focusCompleted ?? 0} ${t("focusSessions")}</span></div><div class="history-metrics"><span>${formatHours(item.focusDurationMs ?? 0)}</span><span>${item.shortBreakCompleted ?? 0} / ${item.longBreakCompleted ?? 0}</span></div></div>`;
  }).join("");
  const historyBlock = statsRange === "today"
    ? `<div class="card chart-card"><div class="metric-row"><div class="card-title">◷ &nbsp;${t("activity")}</div><span class="muted" style="font-size:10px">${dateLabel(today, { weekday: "short" })}</span></div><div class="chart-bars">${weeklyChart}</div></div>`
    : `<div class="card history-card"><div class="metric-row"><div class="card-title">▥ &nbsp;${t("history")}</div><span class="muted" style="font-size:10px">${days.length} ${t("days")}</span></div><div class="history-list">${historyRows || `<div class="empty-history">${t("noActivity")}</div>`}</div></div>`;
  const noteDays = statsRange === "today" ? [localDateKey(today)] : days;
  const notes = noteDays.flatMap((date) => (statsFor(date).notes ?? []).map((note) => ({ ...note, date })))
    .sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
  const notesBlock = `<div class="card notes-card"><div class="metric-row"><div class="card-title">✎ &nbsp;${t("sessionNotes")}</div><span class="muted" style="font-size:10px">${notes.length}</span></div>${notes.length ? `<div class="notes-list">${notes.map((note) => `<div class="note-item"><div class="note-date">${dateLabel(note.date, { month: "short", day: "numeric" })}</div><div class="note-text">${escapeHtml(note.text)}</div></div>`).join("")}</div>` : `<div class="empty-history">${t("noNotes")}</div>`}</div>`;
  document.getElementById("stats-screen").innerHTML = `
    <div class="subscreen-header"><button class="back-button" data-nav="timer">←</button><div><div class="screen-title">${statsRange === "today" ? t("today") : t("history")}</div><div class="screen-subtitle">▣ ${dateLabel(today, { weekday: "long", month: "long", day: "numeric" })}</div></div><span class="live-pill">${t("live")}</span></div>
    ${rangeTabs}
    <div class="card stats-hero"><div class="stats-kicker">${t("totalFocus")}</div><div class="stats-total">${formatHours(total)} <small>/ ${t("target")} ${formatHours(focusGoal * settings.focusMinutes * 60000)}</small></div><div class="metric-row"><span class="muted" style="font-size:10px">${statsRange === "week" ? t("weeklyGoal") : statsRange === "month" ? t("monthlyGoal") : t("completion")}</span><strong style="font-size:10px;color:var(--sage)">${progress}%</strong></div><div class="stats-progress"><div style="width:${progress}%"></div></div></div>
    <div class="metric-grid"><div class="card metric-card focus"><div class="metric-label">${t("focusMetric")}</div><div class="metric-number">${stats.focusCompleted}<span> ${t("sessions")}</span></div><div class="metric-detail">${stats.focusCompleted * settings.focusMinutes} min</div></div><div class="card metric-card short"><div class="metric-label">${t("shortMetric")}</div><div class="metric-number">${stats.shortBreakCompleted}<span> ${t("times")}</span></div><div class="metric-detail">${stats.shortBreakCompleted * settings.shortBreakMinutes} min</div></div><div class="card metric-card long"><div class="metric-label">${t("longMetric")}</div><div class="metric-number">${stats.longBreakCompleted}<span> ${t("times")}</span></div><div class="metric-detail">${stats.longBreakCompleted * settings.longBreakMinutes} min</div></div></div>
    ${historyBlock}
    ${notesBlock}
    <div class="card streak-card"><div class="streak-icon"></div><div class="streak-copy"><strong>${streak} ${t("streakTitle")}</strong><span>${t("streakCopy")}</span></div><div class="streak-pill">${streak}d Streak</div></div>`;
  document.querySelectorAll("[data-range]").forEach((button) => button.addEventListener("click", () => { statsRange = button.dataset.range; renderStats(); }));
  document.querySelectorAll("[data-nav]").forEach((button) => button.addEventListener("click", () => { activeScreen = button.dataset.nav; renderShell(); }));
}

function renderSettings() {
  const { settings } = model;
  const row = (name, help, control) => `<div class="setting-row"><div><div class="setting-name">${name}</div><div class="setting-help">${help}</div></div>${control}</div>`;
  const number = (key, value, max = 180) => `<input class="number-input" type="number" min="1" max="${max}" data-setting="${key}" value="${value}" />`;
  const toggle = (key, on) => `<button class="toggle ${on ? "on" : ""}" data-toggle="${key}" aria-label="${key}"></button>`;
  const soundSelect = `<select class="number-input language-select" data-setting="soundFile"><option value="ring-1" ${settings.soundFile === "ring-1" ? "selected" : ""}>Ring 1</option><option value="ring-2" ${settings.soundFile === "ring-2" ? "selected" : ""}>Ring 2</option><option value="ring-3" ${settings.soundFile === "ring-3" ? "selected" : ""}>Ring 3</option></select>`;
  const hideDurationSelect = `<select class="number-input language-select" data-setting="notificationHideSeconds" ${settings.autoHideNotification ? "" : "disabled"}><option value="3" ${settings.notificationHideSeconds === 3 ? "selected" : ""}>3s</option><option value="5" ${settings.notificationHideSeconds === 5 ? "selected" : ""}>5s</option><option value="10" ${settings.notificationHideSeconds === 10 ? "selected" : ""}>10s</option></select>`;
  const shortcut = (name) => (model.commands ?? []).find((item) => item.name === name)?.shortcut || t("notSet");
  document.getElementById("settings-screen").innerHTML = `
    <div class="subscreen-header"><button class="back-button" data-nav="timer">←</button><div><div class="screen-title">${t("settings")}</div><div class="screen-subtitle">${t("settingsSubtitle")}</div></div></div>
    <div class="settings-section"><h3 class="settings-heading">${t("timerDurations")}</h3><div class="card settings-card">${row(t("durationFocus"), t("durationFocusHelp"), number("focusMinutes", settings.focusMinutes))}${row(t("durationShort"), t("durationShortHelp"), number("shortBreakMinutes", settings.shortBreakMinutes))}${row(t("durationLong"), t("durationLongHelp"), number("longBreakMinutes", settings.longBreakMinutes))}</div></div>
    <div class="settings-section"><h3 class="settings-heading">${t("dailyGoal")}</h3><div class="card settings-card">${row(t("dailyGoalName"), t("dailyGoalHelp"), number("dailyFocusGoal", settings.dailyFocusGoal, 1000))}${row(t("weeklyGoal"), t("dailyGoalHelp"), number("weeklyFocusGoal", settings.weeklyFocusGoal, 5000))}${row(t("monthlyGoal"), t("dailyGoalHelp"), number("monthlyFocusGoal", settings.monthlyFocusGoal, 20000))}${row(t("intervalName"), t("intervalHelp"), number("longBreakInterval", settings.longBreakInterval, 100))}</div></div>
    <div class="settings-section"><h3 class="settings-heading">${t("automation")}</h3><div class="card settings-card">${row(t("autoBreak"), t("autoBreakHelp"), toggle("autoStartBreak", settings.autoStartBreak))}${row(t("autoFocus"), t("autoFocusHelp"), toggle("autoStartFocus", settings.autoStartFocus))}${row(t("desktop"), t("desktopHelp"), toggle("notificationEnabled", settings.notificationEnabled))}${row(t("autoHide"), t("autoHideHelp"), toggle("autoHideNotification", settings.autoHideNotification))}${row(t("hideDuration"), t("hideDurationHelp"), hideDurationSelect)}${row(t("sound"), t("soundHelp"), toggle("soundEnabled", settings.soundEnabled))}${row(t("soundChoice"), t("soundChoiceHelp"), soundSelect)}</div></div>
    <div class="settings-section"><h3 class="settings-heading">${t("focusMode")}</h3><div class="card settings-card">${row(t("focusMode"), t("focusModeHelp"), toggle("focusModeEnabled", settings.focusModeEnabled))}<div class="setting-row setting-row-stack"><div><div class="setting-name">${t("blockedSites")}</div><div class="setting-help">${t("blockedSitesHelp")}</div></div><textarea class="site-list-input" data-setting="blockedWebsites" placeholder="${t("blockedSitesPlaceholder")}">${escapeHtml((settings.blockedWebsites ?? []).join("\n"))}</textarea></div></div></div>
    <div class="settings-section"><h3 class="settings-heading">${t("shortcuts")}</h3><div class="card settings-card">${row(t("toggleTimer"), t("shortcutHelp"), `<kbd>${escapeHtml(shortcut("toggle-timer"))}</kbd>`)}${row(t("skipPhase"), t("shortcutHelp"), `<kbd>${escapeHtml(shortcut("skip-phase"))}</kbd>`)}</div></div>
    <div class="settings-section"><h3 class="settings-heading">${t("appearance")}</h3><div class="card settings-card">${row(t("theme"), t("themeHelp"), `<select class="number-input language-select" data-setting="theme"><option value="light" ${settings.theme === "light" ? "selected" : ""}>${t("lightTheme")}</option><option value="dark" ${settings.theme === "dark" ? "selected" : ""}>${t("darkTheme")}</option><option value="sage" ${settings.theme === "sage" ? "selected" : ""}>${t("sageTheme")}</option></select>`)}</div></div>
    <div class="settings-section"><h3 class="settings-heading">${t("language")}</h3><div class="card settings-card">${row(t("language"), t("languageHelp"), `<select class="number-input language-select" data-setting="language"><option value="en" ${settings.language === "en" ? "selected" : ""}>${t("english")}</option><option value="vi" ${settings.language === "vi" ? "selected" : ""}>${t("vietnamese")}</option></select>`)}</div></div>
    <div class="settings-section"><h3 class="settings-heading">${t("data")}</h3><div class="card settings-card"><div class="setting-row"><div><div class="setting-name">${t("exportData")}</div><div class="setting-help">${t("exportHelp")}</div></div><button class="data-button" id="export-data">↓ JSON</button></div><div class="setting-row"><div><div class="setting-name">${t("importData")}</div><div class="setting-help">${t("importHelp")}</div></div><button class="data-button" id="import-data">↑ JSON</button><input id="import-data-file" type="file" accept="application/json,.json" hidden /></div></div></div>
    <div class="settings-note">${t("note", settings.dailyFocusGoal, settings.longBreakInterval, Math.max(0, settings.dailyFocusGoal - Math.ceil(settings.dailyFocusGoal / settings.longBreakInterval)), Math.ceil(settings.dailyFocusGoal / settings.longBreakInterval))}</div>`;
  document.querySelectorAll("[data-setting]").forEach((input) => input.addEventListener("change", async () => {
    const stringSettings = ["language", "soundFile", "theme"];
    const selectSettings = ["language", "soundFile", "theme", "notificationHideSeconds"];
    const value = input.dataset.setting === "blockedWebsites"
      ? input.value.split(/[\n,]/).map((site) => site.trim().toLowerCase()).filter(Boolean).slice(0, 100)
      : stringSettings.includes(input.dataset.setting) ? input.value : selectSettings.includes(input.dataset.setting) ? Number(input.value) : Math.max(1, Number(input.value));
    await send("UPDATE_SETTINGS", { [input.dataset.setting]: value });
    if (input.dataset.setting === "soundFile") await send("TEST_SOUND");
    await refresh();
  }));
  document.querySelectorAll("[data-toggle]").forEach((button) => button.addEventListener("click", async () => { await send("UPDATE_SETTINGS", { [button.dataset.toggle]: !settings[button.dataset.toggle] }); await refresh(); }));
  document.getElementById("export-data")?.addEventListener("click", async () => {
    try {
      await exportBackup();
    } catch (error) {
      console.error("FocusFlow export failed", error);
      window.alert(t("invalidImport"));
    }
  });
  document.getElementById("import-data")?.addEventListener("click", () => document.getElementById("import-data-file")?.click());
  document.getElementById("import-data-file")?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const backup = JSON.parse(await file.text());
      const response = await send("IMPORT_DATA", backup);
      if (response?.error) throw new Error(response.error);
      await refresh();
      window.alert(t("importSuccess"));
    } catch (error) {
      console.error("FocusFlow import failed", error);
      window.alert(t("invalidImport"));
    } finally {
      event.target.value = "";
    }
  });
  document.querySelectorAll("[data-nav]").forEach((button) => button.addEventListener("click", () => { activeScreen = button.dataset.nav; renderShell(); }));
}

function renderCurrentScreen() {
  if (activeScreen === "timer") {
    renderTimer();
    startTicker();
  }
  if (activeScreen === "stats") renderStats();
  if (activeScreen === "settings") renderSettings();
}

function startTicker() {
  clearInterval(ticker);
  ticker = setInterval(async () => {
    if (activeScreen !== "timer") return;
    const focusedNote = document.activeElement?.id === "session-note" ? document.activeElement : null;
    const noteValue = focusedNote?.value;
    const noteSelection = focusedNote ? [focusedNote.selectionStart, focusedNote.selectionEnd] : null;
    const nextModel = await send("GET_STATE");
    model = nextModel;
    renderTimer();
    if (focusedNote && document.getElementById("session-note")) {
      const nextNote = document.getElementById("session-note");
      nextNote.value = noteValue;
      nextNote.focus();
      if (noteSelection) nextNote.setSelectionRange(noteSelection[0], noteSelection[1]);
    }
  }, 1000);
}

async function refresh() {
  const previousMain = document.querySelector(".main");
  const previousScrollTop = previousMain?.scrollTop ?? 0;
  model = await send("GET_STATE");
  renderShell();
  requestAnimationFrame(() => {
    const nextMain = document.querySelector(".main");
    if (nextMain && activeScreen !== "timer") nextMain.scrollTop = previousScrollTop;
  });
}

refresh();

(function exposeTimerEngine(global) {
  function getDayKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function emptyDailyStats(date = getDayKey()) {
    return {
      date,
      focusCompleted: 0,
      shortBreakCompleted: 0,
      longBreakCompleted: 0,
      focusDurationMs: 0,
      skippedFocus: 0,
      skippedShortBreak: 0,
      skippedLongBreak: 0,
    };
  }

  function getNextPhase(currentPhase, completedFocusToday, longBreakInterval) {
    if (currentPhase !== "focus") return "focus";
    return completedFocusToday % longBreakInterval === 0 ? "longBreak" : "shortBreak";
  }

  function aggregateStats(history, dateKeys) {
    return dateKeys.reduce((total, date) => {
      const stats = history[date] ?? emptyDailyStats(date);
      total.focusCompleted += stats.focusCompleted ?? 0;
      total.shortBreakCompleted += stats.shortBreakCompleted ?? 0;
      total.longBreakCompleted += stats.longBreakCompleted ?? 0;
      total.focusDurationMs += stats.focusDurationMs ?? 0;
      return total;
    }, { focusCompleted: 0, shortBreakCompleted: 0, longBreakCompleted: 0, focusDurationMs: 0 });
  }

  function addDays(dateKey, amount) {
    const date = new Date(`${dateKey}T12:00:00`);
    date.setDate(date.getDate() + amount);
    return getDayKey(date);
  }

  function calculateStreak(history, todayKey, dailyGoal) {
    let cursor = todayKey;
    if ((history[cursor]?.focusCompleted ?? 0) < dailyGoal) cursor = addDays(cursor, -1);

    let streak = 0;
    while ((history[cursor]?.focusCompleted ?? 0) >= dailyGoal) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }
    return streak;
  }

  global.FocusFlowTimer = {
    getDayKey,
    emptyDailyStats,
    getNextPhase,
    aggregateStats,
    calculateStreak,
  };
})(globalThis);

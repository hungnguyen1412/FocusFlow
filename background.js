if (typeof importScripts === "function") importScripts("timer-engine.js");

const api = globalThis.browser ?? globalThis.chrome;
const timerEngine = globalThis.FocusFlowTimer;
const TIMER_ALARM = "focusflow-timer-end";
const STATE_KEY = "timerState";
const SETTINGS_KEY = "settings";
const HISTORY_KEY = "dailyStats";
const SOUND_FILES = {
  "ring-1": "sounds/ring-1.mp3",
  "ring-2": "sounds/ring-2.mp3",
  "ring-3": "sounds/ring-3.mp3",
};

const DEFAULT_SETTINGS = {
  dailyFocusGoal: 12,
  longBreakInterval: 4,
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  autoStartBreak: true,
  autoStartFocus: false,
  soundEnabled: true,
  soundFile: "ring-1",
  notificationEnabled: true,
  autoHideNotification: true,
  notificationHideSeconds: 5,
  language: "en",
};

function dayKey(date = new Date()) {
  return timerEngine.getDayKey(date);
}

function emptyStats(date = dayKey()) {
  return timerEngine.emptyDailyStats(date);
}

function defaultState() {
  return {
    phase: "focus",
    status: "idle",
    cyclePosition: 0,
    completedFocusToday: 0,
    completedShortBreakToday: 0,
    completedLongBreakToday: 0,
    dayKey: dayKey(),
  };
}

async function readData() {
  const data = await api.storage.local.get([STATE_KEY, SETTINGS_KEY, HISTORY_KEY]);
  const settings = { ...DEFAULT_SETTINGS, ...(data[SETTINGS_KEY] ?? {}) };
  let state = { ...defaultState(), ...(data[STATE_KEY] ?? {}) };
  const history = data[HISTORY_KEY] ?? {};
  const today = dayKey();

  if (state.dayKey !== today) {
    state = {
      ...defaultState(),
      phase: state.status === "running" ? state.phase : "focus",
    };
    await api.storage.local.set({ [STATE_KEY]: state });
  }

  history[today] = history[today] ?? emptyStats(today);
  await api.storage.local.set({ [HISTORY_KEY]: history });
  return { state, settings, history };
}

async function saveState(state) {
  await api.storage.local.set({ [STATE_KEY]: state });
}

function durationFor(phase, settings) {
  const minutes = phase === "focus"
    ? settings.focusMinutes
    : phase === "shortBreak"
      ? settings.shortBreakMinutes
      : settings.longBreakMinutes;
  return minutes * 60 * 1000;
}

function nextPhase(state, settings) {
  return timerEngine.getNextPhase(state.phase, state.completedFocusToday, settings.longBreakInterval);
}

function shouldAutoStart(phase, settings) {
  return phase === "focus" ? settings.autoStartFocus : settings.autoStartBreak;
}

function notificationMessage(phase, language = "en") {
  if (language === "vi") {
    return phase === "longBreak"
      ? "Đến giờ nghỉ dài. Bạn đã hoàn thành một chu kỳ tập trung."
      : phase === "shortBreak"
        ? "Đến giờ nghỉ ngắn."
        : "Nghỉ đã xong. Sẵn sàng tập trung tiếp?";
  }

  return phase === "longBreak"
    ? "Time for a long break. You completed a focus cycle."
    : phase === "shortBreak"
      ? "Time for a short break."
      : "Break complete. Ready to focus again?";
}

function notificationAction(phase, language = "en") {
  const phaseName = language === "vi"
    ? phase === "longBreak" ? "nghỉ dài" : phase === "shortBreak" ? "nghỉ ngắn" : "tập trung"
    : phase === "longBreak" ? "Long Break" : phase === "shortBreak" ? "Short Break" : "Focus";
  return language === "vi" ? `▶ Bắt đầu ${phaseName}` : `▶ Start ${phaseName}`;
}

async function playPhaseSound(phase, settings) {
  if (!settings.soundEnabled) return;

  const soundUrl = api.runtime.getURL(SOUND_FILES[settings.soundFile] ?? SOUND_FILES["ring-1"]);

  // Firefox uses an extension background page for MV3. It has DOM/media APIs,
  // so play the selected file directly without requiring Chrome's offscreen API.
  if (typeof document !== "undefined" && document.createElement) {
    try {
      let player = globalThis.__focusFlowAudio;
      if (!player) {
        player = document.createElement("audio");
        player.preload = "auto";
        player.setAttribute("aria-hidden", "true");
        document.documentElement.appendChild(player);
        globalThis.__focusFlowAudio = player;
      }
      player.pause();
      player.currentTime = 0;
      player.src = soundUrl;
      player.load();
      await player.play();
      return;
    } catch (error) {
      console.warn("FocusFlow background audio playback failed", error);
    }
  }

  if (!api.offscreen?.createDocument) return;

  try {
    const hasDocument = api.offscreen.hasDocument
      ? await api.offscreen.hasDocument()
      : false;

    if (!hasDocument) {
      try {
        await api.offscreen.createDocument({
          url: "audio.html",
          reasons: ["AUDIO_PLAYBACK"],
          justification: "Play the selected FocusFlow phase completion sound.",
        });
      } catch (error) {
        // Another completion event may have created the document first.
        // Continue if the document now exists; rethrow real creation errors.
        const nowExists = api.offscreen.hasDocument
          ? await api.offscreen.hasDocument()
          : false;
        if (!nowExists) throw error;
      }
    }

    await api.runtime.sendMessage({
      type: "PLAY_PHASE_SOUND",
      soundUrl,
    });
  } catch (error) {
    console.warn("FocusFlow sound playback failed", error);
  }
}

async function clearTimerAlarm() {
  await api.alarms.clear(TIMER_ALARM);
}

async function startPhase(state, settings, phase = state.phase, remainingMs) {
  const now = Date.now();
  const durationMs = remainingMs ?? durationFor(phase, settings);
  const nextState = {
    ...state,
    phase,
    status: "running",
    startedAt: now,
    endAt: now + durationMs,
    pausedRemainingMs: undefined,
    dayKey: dayKey(),
  };
  await saveState(nextState);
  await api.alarms.create(TIMER_ALARM, { when: nextState.endAt });
  return nextState;
}

async function setIdle(state, phase = state.phase) {
  await clearTimerAlarm();
  const nextState = {
    ...state,
    phase,
    status: "idle",
    startedAt: undefined,
    endAt: undefined,
    pausedRemainingMs: undefined,
  };
  await saveState(nextState);
  return nextState;
}

async function completePhase() {
  const { state, settings, history } = await readData();
  if (state.status !== "running" || !state.endAt || Date.now() < state.endAt) return state;

  const today = dayKey();
  const stats = history[today] ?? emptyStats(today);
  const completedPhase = state.phase;
  if (completedPhase === "focus") {
    state.completedFocusToday += 1;
    state.cyclePosition = state.completedFocusToday % settings.longBreakInterval;
    stats.focusCompleted += 1;
    stats.focusDurationMs += durationFor("focus", settings);
  } else if (completedPhase === "shortBreak") {
    state.completedShortBreakToday += 1;
    stats.shortBreakCompleted += 1;
  } else {
    state.completedLongBreakToday += 1;
    stats.longBreakCompleted += 1;
  }

  history[today] = stats;
  await api.storage.local.set({ [HISTORY_KEY]: history });

  const phase = nextPhase(state, settings);
  const shouldStart = shouldAutoStart(phase, settings);
  const nextState = shouldStart
    ? await startPhase({ ...state, phase }, settings, phase)
    : await setIdle({ ...state, phase }, phase);

  console.info("FocusFlow phase completed", {
    completedPhase,
    nextPhase: phase,
    notificationEnabled: settings.notificationEnabled,
    language: settings.language,
  });

  if (settings.notificationEnabled) {
    const message = notificationMessage(phase, settings.language);
    try {
      const permission = api.notifications.getPermissionLevel
        ? await api.notifications.getPermissionLevel()
        : "unknown";
      console.info("FocusFlow notification permission", permission);

      if (permission === "denied") {
        console.warn("FocusFlow notifications are blocked by the browser or operating system");
        return nextState;
      }

      const notificationId = `focusflow-${Date.now()}-${phase}`;
      await api.notifications.create(notificationId, {
        type: "basic",
        // Use the exported PNG asset here. Chrome's notification image loader
        // is stricter than the extension page loader and may reject SVG data
        // or local SVG resources on some platforms.
        iconUrl: api.runtime.getURL("icon-128.png"),
        title: "FocusFlow",
        message,
        buttons: [{ title: notificationAction(phase, settings.language) }],
        priority: 2,
      });
      console.info("FocusFlow notification created");

      if (settings.autoHideNotification) {
        const hideAfterMs = (settings.notificationHideSeconds ?? 5) * 1000;
        setTimeout(() => {
          api.notifications.clear(notificationId).catch((error) => {
            console.warn("FocusFlow notification clear failed", error);
          });
        }, hideAfterMs);
      }
    } catch (error) {
      // A notification failure must not interrupt the timer state machine.
      console.error("FocusFlow notification failed", error);
    }
  } else {
    console.info("FocusFlow notification skipped because notificationEnabled is false");
  }
  await playPhaseSound(phase, settings);
  return nextState;
}

async function command(type, payload = {}) {
  const { state, settings, history } = await readData();
  if (type === "GET_STATE") return { state, settings, stats: history[dayKey()], history };

  if (type === "START") {
    const next = state.status === "paused"
      ? await startPhase(state, settings, state.phase, state.pausedRemainingMs)
      : await startPhase(state, settings);
    return { state: next, settings, stats: history[dayKey()] };
  }

  if (type === "PAUSE" && state.status === "running") {
    const next = {
      ...state,
      status: "paused",
      pausedRemainingMs: Math.max(0, state.endAt - Date.now()),
      startedAt: undefined,
      endAt: undefined,
    };
    await clearTimerAlarm();
    await saveState(next);
    return { state: next, settings, stats: history[dayKey()] };
  }

  if (type === "RESUME" && state.status === "paused") {
    const next = await startPhase(state, settings, state.phase, state.pausedRemainingMs);
    return { state: next, settings, stats: history[dayKey()] };
  }

  if (type === "SKIP") {
    const stats = history[dayKey()] ?? emptyStats();
    stats[`skipped${state.phase[0].toUpperCase()}${state.phase.slice(1)}`] += 1;
    history[dayKey()] = stats;
    await api.storage.local.set({ [HISTORY_KEY]: history });
    const phase = state.phase === "focus" ? "shortBreak" : "focus";
    const next = shouldAutoStart(phase, settings)
      ? await startPhase({ ...state, phase }, settings, phase)
      : await setIdle({ ...state, phase }, phase);
    return { state: next, settings, stats };
  }

  if (type === "RESET") {
    const next = await setIdle({ ...state, phase: "focus" }, "focus");
    return { state: next, settings, stats: history[dayKey()] };
  }

  if (type === "SET_PHASE") {
    const allowed = ["focus", "shortBreak", "longBreak"];
    if (!allowed.includes(payload.phase)) {
      return { state, settings, stats: history[dayKey()], error: "Invalid phase" };
    }
    const next = await setIdle({ ...state, phase: payload.phase }, payload.phase);
    return { state: next, settings, stats: history[dayKey()] };
  }

  if (type === "UPDATE_SETTINGS") {
    const nextSettings = { ...settings, ...payload };
    await api.storage.local.set({ [SETTINGS_KEY]: nextSettings });
    return { state, settings: nextSettings, stats: history[dayKey()] };
  }

  if (type === "TEST_SOUND") {
    // Preview should work even when completion sound is currently disabled.
    await playPhaseSound(state.phase, { ...settings, soundEnabled: true });
    return { state, settings, stats: history[dayKey()] };
  }

  return { state, settings, stats: history[dayKey()] };
}

api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "PLAY_PHASE_SOUND") return false;
  command(message.type, message.payload)
    .then(sendResponse)
    .catch((error) => sendResponse({ error: error instanceof Error ? error.message : String(error) }));
  return true;
});
api.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === TIMER_ALARM) completePhase();
});

api.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  if (buttonIndex !== 0 || !notificationId.startsWith("focusflow-")) return;

  const phase = notificationId.split("-").pop();
  if (!["focus", "shortBreak", "longBreak"].includes(phase)) return;

  const { state, settings } = await readData();
  if (state.status === "running") {
    await api.notifications.clear(notificationId);
    return;
  }

  const nextState = state.status === "paused" && state.phase === phase
    ? await startPhase(state, settings, phase, state.pausedRemainingMs)
    : await startPhase({ ...state, phase }, settings, phase);
  await api.notifications.clear(notificationId);
  console.info("FocusFlow started from notification", nextState.phase);
});

api.runtime.onStartup.addListener(async () => {
  const { state, settings } = await readData();
  if (state.status === "running" && state.endAt > Date.now()) {
    await api.alarms.create(TIMER_ALARM, { when: state.endAt });
  } else if (state.status === "running") {
    await completePhase();
  }
});

api.runtime.onInstalled.addListener(() => readData());
readData();

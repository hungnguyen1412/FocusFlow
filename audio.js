const api = globalThis.browser ?? globalThis.chrome;
const player = document.getElementById("phase-sound");

api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== "PLAY_PHASE_SOUND") return false;

  player.pause();
  player.currentTime = 0;
  player.src = message.soundUrl;
  player.load();
  player.play()
    .then(() => sendResponse({ ok: true }))
    .catch((error) => {
      console.warn("FocusFlow audio playback failed", error);
      sendResponse({ ok: false, error: error.message });
    });
  return true;
});

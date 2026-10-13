(() => {
  const api = globalThis.browser ?? globalThis.chrome;
  const OVERLAY_ID = "focusflow-focus-mode-overlay";
  let blockedWebsites = [];
  let focusModeEnabled = false;

  function normalizedHost(value) {
    const raw = String(value ?? "").trim().toLowerCase();
    if (!raw) return "";
    try {
      return new URL(raw.includes("://") ? raw : `https://${raw}`).hostname.replace(/^www\./, "");
    } catch {
      return raw.replace(/^https?:\/\//, "").split("/")[0].replace(/^www\./, "");
    }
  }

  function isBlocked() {
    const host = window.location.hostname.replace(/^www\./, "").toLowerCase();
    return blockedWebsites.some((site) => {
      const domain = normalizedHost(site);
      return domain && (host === domain || host.endsWith(`.${domain}`));
    });
  }

  function removeOverlay() {
    document.getElementById(OVERLAY_ID)?.remove();
  }

  function renderOverlay() {
    if (!focusModeEnabled || !isBlocked() || document.getElementById(OVERLAY_ID)) return;
    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.innerHTML = `
      <div class="focusflow-overlay-card" role="dialog" aria-modal="true" aria-label="Focus mode">
        <div class="focusflow-overlay-mark">◷</div>
        <div class="focusflow-overlay-kicker">FOCUS MODE</div>
        <h1>Stay with your focus.</h1>
        <p>This website is paused until your Focus session ends.</p>
        <span>Return to your task when the timer is complete.</span>
      </div>`;
    document.documentElement.appendChild(overlay);
  }

  function updateFocusMode(message) {
    focusModeEnabled = Boolean(message?.enabled);
    blockedWebsites = Array.isArray(message?.blockedWebsites) ? message.blockedWebsites : [];
    if (focusModeEnabled && isBlocked()) renderOverlay();
    else removeOverlay();
  }

  api.runtime.onMessage.addListener((message) => {
    if (message?.type === "FOCUS_MODE_UPDATE") updateFocusMode(message);
  });

  api.runtime.sendMessage({ type: "GET_FOCUS_MODE" })
    .then(updateFocusMode)
    .catch(() => {});
})();

// Single guarded registrar for the app-shell service worker.
const SW_URL = "/sw.js";
const UPDATE_INTERVAL_MS = 60 * 1000;

function isBlockedContext(): boolean {
  if (!import.meta.env.PROD) return true;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const host = window.location.hostname;
  if (host.startsWith("id-preview--") || host.startsWith("preview--")) return true;
  if (host === "lovableproject.com" || host.endsWith(".lovableproject.com")) return true;
  if (host === "lovableproject-dev.com" || host.endsWith(".lovableproject-dev.com")) return true;
  if (host === "beta.lovable.dev" || host.endsWith(".beta.lovable.dev")) return true;
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  return false;
}

async function unregisterAppSw() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.allSettled(
    regs
      .filter((r) => (r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "").endsWith(SW_URL))
      .map((r) => r.unregister()),
  );
}

export function registerPWA() {
  if (!("serviceWorker" in navigator)) return;
  if (isBlockedContext()) {
    void unregisterAppSw();
    return;
  }

  // Reload once when a freshly installed worker takes control, so an installed
  // app always ends up on the newest deployment without a manual reinstall.
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });

  const start = () => {
    void navigator.serviceWorker
      .register(SW_URL, { scope: "/", updateViaCache: "none" })
      .then((registration) => {
        if (!registration) return;

        // If a new worker is already waiting (skipWaiting normally handles this,
        // but be defensive), push it through immediately.
        const activateWaiting = () => registration.waiting?.postMessage({ type: "SKIP_WAITING" });
        activateWaiting();
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) activateWaiting();
          });
        });

        const checkForUpdate = () => {
          if (document.visibilityState !== "visible") return;
          void registration.update().catch(() => {});
        };

        // Poll for new deployments and re-check whenever the app regains focus.
        window.setInterval(checkForUpdate, UPDATE_INTERVAL_MS);
        document.addEventListener("visibilitychange", checkForUpdate);
        window.addEventListener("focus", checkForUpdate);
        window.addEventListener("online", checkForUpdate);
        checkForUpdate();
      });
  };

  if (document.readyState === "complete") start();
  else window.addEventListener("load", start);
}

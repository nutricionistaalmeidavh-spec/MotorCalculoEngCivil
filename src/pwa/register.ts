export function registerPwa(): void {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js").catch(() => {
      // O app continua funcional sem Service Worker; apenas perde o modo offline/PWA.
    });
  });
}

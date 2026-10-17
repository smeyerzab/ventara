/** Registers the offline service worker (skipped in dev and in the single-file build). */
export async function registerSW() {
  if (import.meta.env.DEV || import.meta.env.MODE === "single") return;
  const { registerSW } = await import("virtual:pwa-register");
  const update = registerSW({
    onNeedRefresh() {
      if (confirm("A new version of Ventara (including device data) is available. Reload now?")) update(true);
    },
  });
}

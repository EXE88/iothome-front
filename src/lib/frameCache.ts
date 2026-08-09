"use client";

/**
 * Talking to the frame-cache worker.
 *
 * The ordering here is the whole point. The worker reconciles its cache
 * against `/asset-manifest.json` — dropping frames whose bytes changed and
 * frames that no longer exist — but the page starts requesting frames the
 * instant it mounts. Left to race, the page is served the *stale* frame out of
 * the cache, and only afterwards does the worker delete it; the corrected
 * frame does not appear until the visit after next.
 *
 * So the preloader waits for the reconcile to finish before it asks for
 * anything. That turns a deleted entry into a cache miss on this visit, which
 * is what "in sync with the server" has to mean.
 *
 * Every path here degrades to a resolved promise. No service worker (an
 * insecure origin, a browser that refuses, development) means no wait.
 */

/** Long enough for a manifest fetch on a slow link, short enough to not hang. */
const SYNC_TIMEOUT_MS = 3000;

function available() {
  return (
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator &&
    process.env.NODE_ENV === "production"
  );
}

export function registerFrameCache() {
  if (!("serviceWorker" in navigator)) return;

  if (process.env.NODE_ENV !== "production") {
    // A worker left over from a production build on the same origin caches
    // `/seq/` and then hides every change to the frames behind a cache the
    // developer never asked for. That is a genuinely baffling thing to debug.
    navigator.serviceWorker
      .getRegistrations()
      .then((all) => all.forEach((r) => r.unregister()))
      .catch(() => {});
    return;
  }

  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

/**
 * Ask the worker to re-check the manifest, and resolve once it has.
 *
 * Resolves — never rejects — so a caller can always `await` it without
 * guarding. A timeout resolves too: a page that loads its frames from the
 * network is fine, a page that never loads them is not.
 */
export function syncFrameCache(timeoutMs = SYNC_TIMEOUT_MS): Promise<void> {
  if (!available()) return Promise.resolve();

  return new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      navigator.serviceWorker.removeEventListener("message", onMessage);
      window.clearTimeout(timer);
      resolve();
    };

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "assets-synced") finish();
    };

    const timer = window.setTimeout(finish, timeoutMs);
    navigator.serviceWorker.addEventListener("message", onMessage);

    navigator.serviceWorker.ready
      .then((registration) => {
        const worker = registration.active;
        if (!worker) return finish();
        worker.postMessage({ type: "sync-assets" });
      })
      .catch(finish);
  });
}

/** Tell the worker to keep everything the page just downloaded. */
export function warmFrameCache(width: number) {
  if (!available()) return;
  navigator.serviceWorker.ready
    .then((registration) =>
      registration.active?.postMessage({ type: "warm-assets", width }),
    )
    .catch(() => {});
}

/**
 * Is a frame cache actually in play right now?
 *
 * The splash's "already loaded, skip me" marker is only honest if something is
 * really holding those frames. A service worker needs a secure context, so on
 * `http://<public-ip>` — and in development, where the worker is deliberately
 * unregistered — there is no Cache Storage at all. Writing the marker anyway
 * produced the worst of both: no splash *and* no cache, so every reload pulled
 * all 5 MB from the server one frame at a time with nothing on screen to say
 * why.
 *
 * `controller` rather than `ready`: a worker that is registered but not yet
 * controlling this page did not serve these frames and will not serve the next
 * reload's either.
 */
export function frameCacheActive() {
  return (
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator &&
    navigator.serviceWorker.controller !== null
  );
}

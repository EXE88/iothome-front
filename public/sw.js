/**
 * Frame cache for the landing page.
 *
 * The landing page scrubs four eighty-frame sequences. Downloading them once
 * is a reasonable ask; downloading them on every visit is not, and the browser
 * HTTP cache alone will not promise otherwise — it evicts on its own schedule
 * and revalidates when it feels like it.
 *
 * So the frames live in a Cache Storage bucket that is reconciled against a
 * build-time manifest, `/asset-manifest.json`, which lists every frame with a
 * hash of its bytes:
 *
 *   - a frame whose hash still matches is served from cache and never fetched;
 *   - a frame whose hash changed is refetched and replaced;
 *   - a frame no longer in the manifest is deleted;
 *   - a frame that is new is fetched the first time it is asked for.
 *
 * Which is the point: the cache stays fast without ever going stale, and a
 * deploy that changes one sequence costs one sequence, not all four.
 *
 * Scope is deliberately narrow. This worker only answers same-origin GETs for
 * `/seq/`; every other request — the API, the WebSocket, Next's own chunks —
 * falls straight through to the network untouched, so nothing here can ever
 * serve a stale page or a stale device reading.
 */

const CACHE = "smartlife-frames";
const MANIFEST_URL = "/asset-manifest.json";
/** Where the hash of a cached response is kept, since Cache Storage has no
 *  metadata of its own. */
const REV_HEADER = "x-asset-revision";

/** In-memory copy, refreshed on activation and whenever a page asks. */
let manifest = null;

async function loadManifest() {
  // `no-store`: the whole mechanism depends on this file being current, so it
  // is the one request that must never come from a cache.
  const response = await fetch(MANIFEST_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`manifest ${response.status}`);
  manifest = await response.json();
  return manifest;
}

/**
 * Bring the cache in line with the manifest: drop what is gone, drop what
 * changed, keep what still matches.
 *
 * Nothing is prefetched here. The page requests the frames it needs a moment
 * later anyway, and prefetching from the worker would double the traffic on
 * the visit that can least afford it.
 */
async function reconcile() {
  const current = manifest ?? (await loadManifest());
  const cache = await caches.open(CACHE);
  const cached = await cache.keys();

  let dropped = 0;
  for (const request of cached) {
    const url = new URL(request.url);
    const wanted = current.assets[url.pathname];

    if (!wanted) {
      // No longer part of the page at all.
      await cache.delete(request);
      dropped++;
      continue;
    }

    const response = await cache.match(request);
    if (response?.headers.get(REV_HEADER) !== wanted) {
      // Same URL, different bytes.
      await cache.delete(request);
      dropped++;
    }
  }

  return { dropped, tracked: Object.keys(current.assets).length };
}

/** Store a response, tagging it with the revision it was fetched at. */
async function put(cache, request, response) {
  const revision = manifest?.assets?.[new URL(request.url).pathname];
  if (!revision || !response.ok) return;

  // Headers are immutable on a fetched Response, so it is rebuilt to carry the
  // revision. The body can only be read once, hence the clone.
  const body = await response.clone().blob();
  const headers = new Headers(response.headers);
  headers.set(REV_HEADER, revision);
  await cache.put(request, new Response(body, { status: 200, headers }));
}

self.addEventListener("install", (event) => {
  // Take over straight away; there is no old worker whose in-flight work could
  // be disturbed, because this one only ever serves immutable frames.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        // Manifest before claim, in that order: claiming first would let
        // frame requests arrive while `manifest` is still null, and those
        // would be served but not cached.
        await loadManifest();
        await reconcile();
        await self.clients.claim();
      } catch {
        await self.clients.claim();
        // A missing or broken manifest must not break the site. With no
        // manifest the fetch handler falls through to the network, which is
        // exactly how the page behaved before any of this existed.
      }
    })(),
  );
});

/**
 * A page can ask for a re-check. Deploys do not necessarily change this file,
 * so activation is not a reliable moment to notice new frames — the page
 * asking on load is.
 */
self.addEventListener("message", (event) => {
  const kind = event.data?.type;

  if (kind === "sync-assets") {
    event.waitUntil(
      (async () => {
        try {
          const before = manifest?.revision;
          await loadManifest();
          // One string comparison answers "is there anything to do at all".
          if (before !== manifest.revision) await reconcile();
          event.source?.postMessage({
            type: "assets-synced",
            revision: manifest.revision,
          });
        } catch {
          /* offline, or the manifest is not deployed yet */
        }
      })(),
    );
    return;
  }

  /**
   * The page has finished preloading and is telling the worker to fill the
   * cache.
   *
   * This exists because of a timing problem: on a visitor's very first visit
   * the worker is still registering while the page is already requesting
   * frames, so it controls none of them and the cache ends up empty — the
   * speed-up would not arrive until the third visit. Warming here costs
   * almost nothing, because every one of these URLs was fetched seconds ago
   * and is sitting in the HTTP cache.
   */
  if (kind === "warm-assets") {
    const width = event.data?.width;
    event.waitUntil(
      (async () => {
        try {
          if (!manifest) await loadManifest();
          const cache = await caches.open(CACHE);
          const wanted = Object.keys(manifest.assets).filter((url) =>
            width ? url.includes(`/${width}/`) : true,
          );

          for (const url of wanted) {
            if (await cache.match(url)) continue;
            try {
              await put(cache, new Request(url), await fetch(url));
            } catch {
              /* one missing frame is not worth abandoning the rest */
            }
          }
        } catch {
          /* no manifest, no warming — the page is unaffected */
        }
      })(),
    );
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith("/seq/")) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(request);

      // Cache-first, and safe to be: reconcile() has already deleted anything
      // whose bytes changed, so a hit is by construction current.
      if (hit) return hit;

      try {
        const response = await fetch(request);
        if (!manifest) {
          try {
            await loadManifest();
          } catch {
            /* serve it, just do not cache it */
          }
        }
        await put(cache, request, response);
        return response;
      } catch (error) {
        // Offline with nothing cached. Let the image's own error handling deal
        // with it — the preloader counts errors as arrivals so the page still
        // opens.
        throw error;
      }
    })(),
  );
});

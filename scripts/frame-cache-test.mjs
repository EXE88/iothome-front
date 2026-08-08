/**
 * Prove the frame cache does what it claims.
 *
 *   npm run build && npx next start -p 3001
 *   node scripts/frame-cache-test.mjs
 *
 * The four claims, each checked against real traffic rather than intent:
 *
 *   1. a cold visit downloads the frames and shows the splash;
 *   2. a second visit downloads none of them and shows no splash;
 *   3. changing one frame's bytes refetches that frame, on that visit, and
 *      only that frame;
 *   4. a frame dropped from the manifest is evicted from the cache.
 *
 * Counting happens in a proxy in front of the app, because nothing inside the
 * browser can answer the question. `HTTPResponse.fromServiceWorker()` is true
 * for anything the worker answered — including what it fetched over the
 * network itself — and a resource the worker served reports `transferSize: 0`
 * either way. Both describe the page's relationship with the worker, not the
 * worker's with the server. The wire is the only place the truth is visible.
 *
 * The proxy answers on 3000 so the browser sees the origin the build pinned
 * (`NEXT_PUBLIC_SITE_ORIGIN`), and a loopback address, which service workers
 * require. The app itself runs on 3001.
 *
 * It edits `public/seq` for (3) and (4), and restores it in a finally block.
 */

import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync, unlinkSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer, request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const APP_PORT = Number(process.env.APP_PORT ?? 3001);
const PROXY_PORT = Number(process.env.PROXY_PORT ?? 3000);
const ORIGIN = `http://127.0.0.1:${PROXY_PORT}`;
const PROFILE = await mkdtemp(join(tmpdir(), "sl-cache-"));

const problems = [];
const ok = (m) => console.log("ok  ", m);
const fail = (m) => {
  console.log("FAIL", m);
  problems.push(m);
};

const rebuildManifest = () =>
  execFileSync("node", ["scripts/build-asset-manifest.mjs"], {
    encoding: "utf8",
  }).trim();

// --- the counting proxy -----------------------------------------------------

let hits = new Set();

const proxy = createServer((req, res) => {
  const path = req.url.split("?")[0];
  if (path.startsWith("/seq/")) hits.add(path);

  const upstream = httpRequest(
    {
      host: "127.0.0.1",
      port: APP_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers,
    },
    (up) => {
      res.writeHead(up.statusCode, up.headers);
      up.pipe(res);
    },
  );
  upstream.on("error", () => res.destroy());
  req.pipe(upstream);
});

await new Promise((resolve, reject) => {
  proxy.once("error", reject);
  proxy.listen(PROXY_PORT, "127.0.0.1", resolve);
});

/** One visit in a persistent profile. Reports what actually crossed the wire. */
async function visit(label, { settle = 9000 } = {}) {
  hits = new Set();
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    userDataDir: PROFILE,
    args: ["--hide-scrollbars"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Presence is not visibility. The splash ships in the server's HTML, so the
  // element is always in the DOM; on a return visit it is hidden before the
  // first paint and removed a moment later. Only the computed style can tell
  // whether the visitor actually saw it.
  let splashSeen = false;
  const watch = setInterval(async () => {
    splashSeen ||= await page
      .evaluate(() => {
        const gate = document.querySelector(".preload-gate");
        if (!gate) return false;
        const style = getComputedStyle(gate);
        return style.display !== "none" && Number(style.opacity) > 0.02;
      })
      .catch(() => false);
  }, 120);

  await page.goto(`${ORIGIN}/fa`, { waitUntil: "domcontentloaded" }).catch(() => {});
  await new Promise((r) => setTimeout(r, settle));
  clearInterval(watch);

  /** What the cache holds, and the revision it holds each entry at. */
  const cache = await page
    .evaluate(async () => {
      if (!("caches" in window)) return { size: -1, revisions: {} };
      const c = await caches.open("smartlife-frames");
      const keys = await c.keys();
      const revisions = {};
      for (const k of keys) {
        const hit = await c.match(k);
        revisions[new URL(k.url).pathname] =
          hit?.headers.get("x-asset-revision") ?? null;
      }
      return { size: keys.length, revisions };
    })
    .catch(() => ({ size: -1, revisions: {} }));

  await browser.close();
  const fetched = new Set(hits);
  console.log(
    `  ${label}: ${fetched.size} frame(s) over the wire, ${cache.size} in Cache Storage, splash ${splashSeen ? "shown" : "skipped"}`,
  );
  return { fetched, cache, splashSeen };
}

const VICTIM = "public/seq/house/1280/040.webp";
const VICTIM_URL = "/seq/house/1280/040.webp";
const DONOR = "public/seq/house/1280/041.webp";
const BACKUP = join(PROFILE, "victim.webp");
const EVICTEE = "public/seq/house/1280/079.webp";
const EVICTEE_URL = "/seq/house/1280/079.webp";
const EVICTEE_PARKED = join(PROFILE, "079.webp");

const manifestNow = () =>
  JSON.parse(readFileSync("public/asset-manifest.json", "utf8"));

try {
  console.log(rebuildManifest());
  copyFileSync(VICTIM, BACKUP);

  console.log("\n1. cold visit");
  const first = await visit("cold", { settle: 16000 });
  if (first.fetched.size >= 320) ok(`downloaded ${first.fetched.size} frames`);
  else fail(`expected the full 1280 set over the wire, saw ${first.fetched.size}`);
  if (first.splashSeen) ok("splash was shown");
  else fail("splash never appeared on a cold visit");
  if (first.cache.size >= 320) ok(`cache holds ${first.cache.size} frames`);
  else fail(`cache should hold the 1280 set, holds ${first.cache.size}`);

  console.log("\n2. second visit, nothing changed");
  const second = await visit("warm");
  if (second.fetched.size === 0) ok("no frame crossed the wire");
  else fail(`${second.fetched.size} refetched: ${[...second.fetched].slice(0, 3)}`);
  if (!second.splashSeen) ok("splash was skipped — nothing to wait for");
  else fail("splash appeared despite a warm cache");

  console.log("\n3. one frame's bytes change");
  copyFileSync(DONOR, VICTIM);
  console.log("  " + rebuildManifest());
  const expected = manifestNow().assets[VICTIM_URL];
  const third = await visit("after one edit");
  const refetched = [...third.fetched];
  if (refetched.length === 1 && refetched[0] === VICTIM_URL) {
    ok(`exactly one frame crossed the wire, the edited one`);
  } else {
    fail(`expected only ${VICTIM_URL}, saw ${refetched.length}: ${refetched.slice(0, 4)}`);
  }
  if (third.cache.revisions[VICTIM_URL] === expected) {
    ok(`cache holds it at the new revision (${expected}) on the same visit`);
  } else {
    fail(`cache holds ${third.cache.revisions[VICTIM_URL]}, manifest says ${expected}`);
  }

  console.log("\n4. a frame leaves the manifest");
  copyFileSync(BACKUP, VICTIM); // restore before the next manifest
  copyFileSync(EVICTEE, EVICTEE_PARKED);
  unlinkSync(EVICTEE); // rename would be EXDEV across drives on Windows
  console.log("  " + rebuildManifest());
  const fourth = await visit("after a removal");
  if (manifestNow().assets[EVICTEE_URL]) fail("the manifest still lists it");
  if (EVICTEE_URL in fourth.cache.revisions) {
    fail("the removed frame is still in the cache");
  } else {
    ok(`the removed frame was evicted — cache is ${fourth.cache.size}`);
  }
} finally {
  try {
    copyFileSync(BACKUP, VICTIM);
  } catch {}
  try {
    if (!existsSync(EVICTEE)) copyFileSync(EVICTEE_PARKED, EVICTEE);
  } catch {}
  console.log("\nrestored: " + rebuildManifest());
  proxy.close();
  await rm(PROFILE, { recursive: true, force: true }).catch(() => {});
}

if (problems.length) {
  console.log("\nproblems:");
  problems.forEach((p) => console.log("  " + p));
  process.exit(1);
}
console.log("\nall green — the cache tracks the server");

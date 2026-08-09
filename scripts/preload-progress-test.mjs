/**
 * Does the preloader's percentage actually move?
 *
 *   npm run dev
 *   node scripts/preload-progress-test.mjs
 *
 * **Run this against `next dev`, not a production build.** That is the whole
 * point: React StrictMode, which `next dev` turns on, invokes every effect
 * twice — mount, clean up, mount again. A "have I already started?" ref inside
 * such an effect survives the cleanup, so the first run gets cancelled and the
 * second run declines to do anything, and the work never happens at all.
 *
 * That is exactly what shipped once. The percentage sat at 0% forever while
 * the splash's own canvas loaded the hero sequence and made it look like
 * something was happening, so the page seemed alive and the counter seemed
 * broken. A production build hid it completely, because StrictMode is off
 * there and the effect only runs once.
 *
 * So the assertion is deliberately crude — the number has to go up, and every
 * sequence has to be requested — and it has to run where the double-invoke
 * happens.
 */

import puppeteer from "puppeteer-core";
import { FRAME_COUNT, LANDING_SEQUENCES } from "../src/lib/useFrameSequence.ts";

const ORIGIN = process.env.SITE ?? "http://127.0.0.1:3000";
const EXPECTED = LANDING_SEQUENCES.length * FRAME_COUNT;

const problems = [];
const ok = (m) => console.log("ok  ", m);
const fail = (m) => {
  console.log("FAIL", m);
  problems.push(m);
};

// `next dev` compiles the route on its first request, which takes seconds and
// would otherwise be measured as "the preloader did nothing".
process.stdout.write("  warming the dev server... ");
await fetch(`${ORIGIN}/fa`).then(
  (r) => console.log(`${r.status}`),
  (e) => console.log(`failed: ${e.message}`),
);

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.setCacheEnabled(false);

const requested = new Set();
page.on("request", (r) => {
  const url = new URL(r.url());
  if (url.pathname.startsWith("/seq/")) requested.add(url.pathname);
});

await page.goto(`${ORIGIN}/fa`, { waitUntil: "domcontentloaded" }).catch(() => {});

const readings = [];
for (let i = 0; i < 10; i++) {
  await new Promise((r) => setTimeout(r, 1200));
  const value = await page
    .evaluate(() => {
      const bar = document.querySelector('[role="progressbar"]');
      if (!bar) return null; // splash already gone
      return Number(bar.getAttribute("aria-valuenow"));
    })
    .catch(() => null);
  readings.push(value);
  if (value === null) break;
}

await browser.close();

const seen = readings.filter((v) => v !== null);
const highest = seen.length ? Math.max(...seen) : 0;
const finished = readings.at(-1) === null;

console.log(`  readings: ${readings.map((v) => (v === null ? "gone" : `${v}%`)).join(" ")}`);
console.log(`  /seq/ requested: ${requested.size} of ${EXPECTED}`);

if (highest > 0 || finished) ok(`progress moved (peak ${highest}%)`);
else fail("progress never left 0% — the preload effect never ran");

if (requested.size >= EXPECTED) {
  ok(`every sequence was requested (${requested.size})`);
} else {
  fail(
    `only ${requested.size} of ${EXPECTED} frames requested — ` +
      `${requested.size === FRAME_COUNT ? "that is the hero sequence alone, so usePreload did nothing" : "some sequences are missing"}`,
  );
}

if (finished) ok("the splash finished and removed itself");
else fail(`the splash never finished; last reading ${readings.at(-1)}%`);

if (problems.length) {
  console.log("\nproblems:");
  problems.forEach((p) => console.log("  " + p));
  process.exit(1);
}
console.log("\nall green — the preloader actually preloads");

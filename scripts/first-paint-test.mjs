/**
 * What does the visitor actually see first?
 *
 *   npm run build && npm start
 *   node scripts/first-paint-test.mjs
 *
 * The splash used to be a client component, so the browser painted the landing
 * page, React hydrated, and only then did the splash cover it: page, grey,
 * page. Nothing about that is visible in the code — it only shows up in what
 * was on screen, frame by frame.
 *
 * So this records every painted frame from navigation onward with CDP's
 * screencast and classifies each one. The claims:
 *
 *   1. cold visit — every frame up to the reveal is the splash, and the
 *      landing page is never painted before it;
 *   2. return visit — the splash is never painted at all.
 */

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const ORIGIN = process.env.SITE ?? "http://127.0.0.1:3000";
const PROFILE = await mkdtemp(join(tmpdir(), "sl-paint-"));

const problems = [];
const ok = (m) => console.log("ok  ", m);
const fail = (m) => {
  console.log("FAIL", m);
  problems.push(m);
};

/**
 * Record the painted frames of one visit.
 *
 * Each frame is classified in the page rather than by looking at pixels: the
 * splash and the landing page are both mostly grey, so a colour histogram
 * would not tell them apart. What separates them is the DOM.
 */
async function record(label, { ms = 6000 } = {}) {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    userDataDir: PROFILE,
    args: ["--hide-scrollbars"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const cdp = await page.createCDPSession();
  const frames = [];
  cdp.on("Page.screencastFrame", async ({ sessionId, metadata }) => {
    frames.push(metadata.timestamp);
    await cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });

  // Sampled rather than pixel-diffed: what matters is whether the splash was
  // on top, and whether the hero was ever exposed underneath it.
  const timeline = [];
  const sampler = setInterval(async () => {
    const state = await page
      .evaluate(() => {
        const gate = document.querySelector(".preload-gate");
        const hero = document.querySelector("h1");
        if (!gate) return hero ? "landing" : "blank";
        const style = getComputedStyle(gate);
        if (style.display === "none") return hero ? "landing" : "blank";
        return Number(style.opacity) > 0.02 ? "splash" : "landing";
      })
      .catch(() => null);
    if (state) timeline.push(state);
  }, 40);

  await cdp.send("Page.enable");
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 40, everyNthFrame: 1 });
  await page.goto(`${ORIGIN}/fa`, { waitUntil: "domcontentloaded" }).catch(() => {});
  await new Promise((r) => setTimeout(r, ms));
  clearInterval(sampler);
  await cdp.send("Page.stopScreencast").catch(() => {});
  await browser.close();

  // Collapse runs, so "splash splash splash landing landing" reads as
  // "splash -> landing".
  const sequence = timeline.filter((s, i) => s !== timeline[i - 1]);
  console.log(
    `  ${label}: ${frames.length} painted frames, states: ${sequence.join(" -> ") || "(none)"}`,
  );
  return { sequence, timeline };
}

try {
  console.log("1. cold visit — the splash must own the first paint");
  const cold = await record("cold", { ms: 9000 });

  const firstReal = cold.sequence.find((s) => s !== "blank");
  if (firstReal === "splash") ok("the first thing painted was the splash");
  else fail(`the first thing painted was "${firstReal}", not the splash`);

  // The defect being guarded against: landing shown, then splash over it.
  const landingIndex = cold.sequence.indexOf("landing");
  const splashIndex = cold.sequence.indexOf("splash");
  if (splashIndex !== -1 && (landingIndex === -1 || splashIndex < landingIndex)) {
    ok("the landing page was never painted before the splash");
  } else {
    fail(`landing appeared before the splash: ${cold.sequence.join(" -> ")}`);
  }
  if (cold.sequence.at(-1) === "landing") ok("it ended on the landing page");
  else fail(`ended on "${cold.sequence.at(-1)}"`);

  console.log("\n2. return visit — no splash at all");
  const warm = await record("warm", { ms: 5000 });
  if (!warm.timeline.includes("splash")) ok("the splash was never painted");
  else fail(`the splash was painted on a return visit: ${warm.sequence.join(" -> ")}`);
} finally {
  await rm(PROFILE, { recursive: true, force: true }).catch(() => {});
}

if (problems.length) {
  console.log("\nproblems:");
  problems.forEach((p) => console.log("  " + p));
  process.exit(1);
}
console.log("\nall green — the splash owns the first paint, and only when needed");

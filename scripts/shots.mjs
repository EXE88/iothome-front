/**
 * Screenshot the landing page at a set of scroll depths, desktop and mobile,
 * using the Chrome already installed on this machine.
 *
 *   node scripts/shots.mjs [locale] [outDir]
 *
 * Scroll depth matters here: most of this page only exists part-way down a
 * pinned scrub, so a single top-of-page capture would miss the whole middle.
 */

import { mkdir } from "node:fs/promises";
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const locale = process.argv[2] ?? "fa";
const outDir = process.argv[3] ?? `shots/${locale}`;
const BASE = `http://localhost:3000/${locale}`;

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, dsf: 1 },
  { name: "mobile", width: 390, height: 844, dsf: 2 },
];

// Fractions of total scrollable height.
const STOPS = [0, 0.08, 0.16, 0.26, 0.36, 0.46, 0.58, 0.7, 0.82, 0.93, 1];

await mkdir(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--force-device-scale-factor=1", "--hide-scrollbars"],
});

for (const vp of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: vp.dsf,
  });
  await page.goto(BASE, { waitUntil: "networkidle2", timeout: 90000 });

  // Frame sequences decode after load; give the hero its first frames.
  await new Promise((r) => setTimeout(r, 2500));

  const total = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight,
  );

  for (const stop of STOPS) {
    const y = Math.round(total * stop);
    await page.evaluate((target) => {
      // Lenis owns the scroll position; setting it directly and telling it to
      // stop keeps the smoothing from fighting the capture.
      window.scrollTo({ top: target, behavior: "instant" });
    }, y);
    await new Promise((r) => setTimeout(r, 1100));
    const label = String(Math.round(stop * 100)).padStart(3, "0");
    await page.screenshot({ path: `${outDir}/${vp.name}-${label}.png` });
    console.log(`${vp.name} @ ${label}% (y=${y})`);
  }

  await page.close();
}

await browser.close();
console.log(`written to ${outDir}`);

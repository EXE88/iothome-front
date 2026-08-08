/**
 * Screenshot the landing preloader mid-wait.
 *
 *   node scripts/preloader-shots.mjs
 *
 * On a warm local connection the splash is gone in under a second, so the
 * network is throttled here on purpose: without it there is nothing to look at
 * and no way to tell whether the thing being shipped is any good.
 */

import puppeteer from "puppeteer-core";

const ORIGIN = process.env.SITE ?? "http://127.0.0.1:3000";
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--hide-scrollbars"],
});

const desktop = { width: 1280, height: 900 };
const mobile = { width: 390, height: 844, deviceScaleFactor: 2 };

/**
 * Only the frames are slowed, not the whole connection.
 *
 * Throttling everything means the JS has not even hydrated by the time the
 * screenshot is taken, so there is nothing on screen and the shot proves
 * nothing. Delaying just `/seq/` is also the truer shape of the real problem:
 * the app shell is small and cacheable, the 4.8 MB of frames is not.
 */
const FRAME_DELAY_MS = Number(process.env.FRAME_DELAY ?? 90);

async function shoot(locale, vp, name, { at = 1500, reduced = false } = {}) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport(vp);
  if (reduced) {
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);
  }

  await page.setCacheEnabled(false); // cold every run, or there is no wait
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (req.url().includes("/seq/")) {
      setTimeout(() => req.continue().catch(() => {}), FRAME_DELAY_MS);
      return;
    }
    req.continue().catch(() => {});
  });

  page.goto(`${ORIGIN}/${locale}`, { waitUntil: "domcontentloaded" }).catch(() => {});
  await new Promise((r) => setTimeout(r, at));

  const readout = await page
    .evaluate(() => {
      const splash = document.querySelector('[aria-busy]');
      if (!splash) return "(no splash on screen)";
      return splash.innerText.replace(/\n+/g, " | ");
    })
    .catch(() => "(unreadable)");

  await page.screenshot({ path: `shots/${name}.png` });
  console.log(`shot ${name.padEnd(28)} ${readout}`);
  await ctx.close();
}

await shoot("fa", desktop, "preload-fa-early", { at: 700 });
await shoot("fa", desktop, "preload-fa-desktop", { at: 1800 });
await shoot("fa", desktop, "preload-fa-desktop-late", { at: 7000 });
await shoot("en", desktop, "preload-en-desktop", { at: 1800 });
await shoot("fa", mobile, "preload-fa-mobile", { at: 1800 });
await shoot("en", mobile, "preload-en-mobile", { at: 2600 });
await shoot("fa", desktop, "preload-fa-reduced", { at: 1800, reduced: true });

await browser.close();
console.log("done");

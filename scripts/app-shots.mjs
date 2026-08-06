/**
 * Screenshot every signed-out and signed-in screen, both locales, desktop and
 * mobile.
 *
 *   node scripts/app-shots.mjs
 *
 * Needs the dev server, the Django backend and the device simulators running,
 * plus the two test accounts (see README). Each screen gets its own browser
 * context so a session from one shot cannot redirect the next one away.
 */

import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new", args: ["--hide-scrollbars"],
});
for (const [locale, vp, name] of [
  ["fa", { width: 390, height: 844, deviceScaleFactor: 2 }, "mobile"],
  ["en", { width: 1280, height: 900, deviceScaleFactor: 1 }, "desktop"],
]) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport(vp);
  await page.goto(`http://localhost:3000/${locale}/login`, { waitUntil: "networkidle2" });
  await page.screenshot({ path: `shots/auth-login-${locale}-${name}.png` });
  await page.waitForSelector(String.raw`input[name="email"]`, { timeout: 15000 });
  await page.type(String.raw`input[name="email"]`, "panel@gmail.com");
  await page.type('input[name="password"]', "panel-test-pass");
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => /متصل|Live/.test(document.body.innerText), { timeout: 25000 }).catch(()=>{});
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: `shots/panel-${locale}-${name}.png`, fullPage: true });
  await page.goto(`http://localhost:3000/${locale}/signup`, { waitUntil: "networkidle2" });
  await page.screenshot({ path: `shots/auth-signup-${locale}-${name}.png` });
  await page.close();
  await context.close();
  console.log("shot", locale, name);
}

const shot = async (locale, path, name, vp) => {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport(vp);
  await page.goto(`http://localhost:3000/${locale}${path}`, { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 900));
  await page.screenshot({ path: `shots/${name}.png` });
  await ctx.close();
  console.log("shot", name);
};
const desktop = { width: 1280, height: 900 };
const mobile = { width: 390, height: 844, deviceScaleFactor: 2 };
await shot("fa", "/verify?email=panel%40gmail.com", "auth-verify-fa-mobile", mobile);
await shot("en", "/verify?email=panel%40gmail.com", "auth-verify-en-desktop", desktop);
await shot("fa", "/forgot", "auth-forgot-fa-mobile", mobile);
await shot("en", "/reset?email=a%40gmail.com&sent=1", "auth-reset-en-desktop", desktop);

// Empty panel: a real account that owns nothing.
for (const [locale, vp, name] of [["fa", mobile, "panel-empty-fa-mobile"], ["en", desktop, "panel-empty-en-desktop"]]) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport(vp);
  await page.goto(`http://localhost:3000/${locale}/login`, { waitUntil: "networkidle2" });
  await page.waitForSelector(String.raw`input[name="email"]`);
  await page.type(String.raw`input[name="email"]`, "empty@gmail.com");
  await page.type(String.raw`input[name="password"]`, "panel-test-pass");
  await page.click(String.raw`button[type="submit"]`);
  await page.waitForFunction(() => /متصل|Live/.test(document.body.innerText), { timeout: 20000 }).catch(()=>{});
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: `shots/${name}.png` });
  await ctx.close();
  console.log("shot", name);
}
await browser.close();

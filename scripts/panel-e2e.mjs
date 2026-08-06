/**
 * Drives the panel in a real browser against the real backend: log in, wait
 * for the signed socket to go live, read the devices, press a control, and
 * confirm the device answered.
 *
 *   node scripts/panel-e2e.mjs [locale]
 *
 * Needs the Django server, Redis and at least one device simulator running.
 */

import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const locale = process.argv[2] ?? "fa";
const BASE = `http://localhost:3000/${locale}`;
const EMAIL = process.env.PANEL_EMAIL ?? "panel@gmail.com";
const PASSWORD = process.env.PANEL_PASSWORD ?? "panel-test-pass";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

const problems = [];
page.on("console", (m) => {
  if (m.type() === "error") problems.push(`console: ${m.text()}`);
});
page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));

const step = (name, ok, detail = "") =>
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);

// --- log in ---------------------------------------------------------------
await page.goto(`${BASE}/login`, { waitUntil: "networkidle2" });
await page.type('input[name="email"]', EMAIL);
await page.type('input[name="password"]', PASSWORD);
await Promise.all([
  page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {}),
  page.click('button[type="submit"]'),
]);
await new Promise((r) => setTimeout(r, 2500));
step("login lands on the panel", page.url().includes("/panel"), page.url());

// --- the signed socket ----------------------------------------------------
const live = await page
  .waitForFunction(
    () => document.body.innerText.match(/متصل|Live/) !== null,
    { timeout: 20000 },
  )
  .then(() => true)
  .catch(() => false);
step("signed websocket handshake accepted", live);

// --- devices --------------------------------------------------------------
const cards = await page.$$eval("article", (nodes) =>
  nodes.map((n) => n.querySelector("h2")?.textContent?.trim()).filter(Boolean),
);
step("devices listed", cards.length >= 3, cards.join(", "));

const online = await page.evaluate(
  () => (document.body.innerText.match(/آنلاین|Online/g) || []).length,
);
step("devices reported online", online >= 3, `${online} online`);

// --- live telemetry -------------------------------------------------------
const gotReading = await page
  .waitForFunction(
    () => /\d+(\.\d+)?\s*(C|%)/.test(document.body.innerText),
    { timeout: 25000 },
  )
  .then(() => true)
  .catch(() => false);
step("live telemetry arrived", gotReading);

// --- send a command -------------------------------------------------------
// Every switch on the page, so the assertion is about a specific control
// rather than whichever one happens to be first.
const switches = await page.$$('button[role="switch"]');
step("switch controls rendered from capabilities", switches.length >= 3, `${switches.length} switches`);

let flipped = 0;
for (const [index, toggle] of switches.entries()) {
  const label = await page.evaluate((el) => el.getAttribute("aria-label"), toggle);
  const before = await page.evaluate((el) => el.getAttribute("aria-checked"), toggle);
  await toggle.click();

  const changed = await page
    .waitForFunction(
      (i, was) => {
        const all = document.querySelectorAll('button[role="switch"]');
        return all[i] && all[i].getAttribute("aria-checked") !== was;
      },
      { timeout: 15000 },
      index,
      before,
    )
    .then(() => true)
    .catch(() => false);

  if (changed) flipped++;
  step(`  "${label}" ${before} -> ${changed ? "flipped" : "unchanged"}`, changed);
}
step("every switch reflects its device's answer", flipped === switches.length);

// --- refresh --------------------------------------------------------------
const refreshButton = await page.$$eval("button", (nodes) =>
  nodes.findIndex((n) => /به‌روزرسانی|Refresh/.test(n.textContent ?? "")),
);
step("refresh control present", refreshButton >= 0);

// --- reload keeps the session --------------------------------------------
await page.reload({ waitUntil: "networkidle2" });
await new Promise((r) => setTimeout(r, 3000));
step("session survives a reload", page.url().includes("/panel"), page.url());

console.log(
  problems.length ? `\nbrowser problems:\n  ${problems.join("\n  ")}` : "\nno console errors",
);

await page.screenshot({ path: `shots/panel-${locale}.png`, fullPage: true });
await browser.close();

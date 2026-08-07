/**
 * The panel, driven with the secure-context crypto APIs taken away.
 *
 *   node scripts/panel-insecure-e2e.mjs [locale]
 *
 * `crypto.subtle` and `crypto.randomUUID` only exist over https or on
 * localhost. A staging box served from `http://<public-ip>` is neither, and
 * there they are simply absent — which is how a deploy that works perfectly in
 * development fails to send a single command.
 *
 * Development runs on localhost, so the ordinary e2e never touches the
 * fallbacks. This one deletes both APIs before any of the app's own code runs
 * and then presses real controls against the real backend, so the path a bare-IP
 * deployment takes is actually exercised.
 *
 * Needs the Django server, Redis and the device simulator running.
 */

import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const locale = process.argv[2] ?? "fa";
// 127.0.0.1 rather than localhost, because NEXT_PUBLIC_SITE_ORIGIN pins the
// host and a client-side redirect mid-run destroys the execution context.
const ORIGIN = process.env.SITE ?? "http://127.0.0.1:3000";
const BASE = `${ORIGIN}/${locale}`;
const EMAIL = process.env.PANEL_EMAIL ?? "panel@gmail.com";
const PASSWORD = process.env.PANEL_PASSWORD ?? "panel-test-pass";

const problems = [];
const ok = (msg) => console.log("ok  ", msg);
const fail = (msg) => {
  console.log("FAIL", msg);
  problems.push(msg);
};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

page.on("pageerror", (e) => problems.push(`page error: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error" && !m.text().includes("401")) {
    problems.push(`console: ${m.text().slice(0, 160)}`);
  }
});

// Runs before any script on every page, including Next's own bundles, so the
// app never sees the APIs at all.
await page.evaluateOnNewDocument(() => {
  const real = window.crypto;
  const stripped = {
    getRandomValues: (a) => real.getRandomValues(a),
    // subtle and randomUUID deliberately absent.
  };
  Object.defineProperty(window, "crypto", {
    configurable: true,
    get: () => stripped,
  });
});

await page.goto(`${BASE}/login`, { waitUntil: "networkidle2" });
// Let the canonical-host guard settle before touching the context.
await new Promise((r) => setTimeout(r, 1200));

const stripped = await page.evaluate(() => ({
  subtle: typeof crypto.subtle,
  randomUUID: typeof crypto.randomUUID,
  getRandomValues: typeof crypto.getRandomValues,
}));
if (stripped.subtle === "undefined" && stripped.randomUUID === "undefined") {
  ok(`insecure context simulated — subtle: ${stripped.subtle}, randomUUID: ${stripped.randomUUID}`);
} else {
  fail(`the stub did not take: ${JSON.stringify(stripped)}`);
}

await page.waitForSelector('input[name="email"]');
await page.type('input[name="email"]', EMAIL);
await page.type('input[name="password"]', PASSWORD);
await page.click('button[type="submit"]');
await page.waitForFunction(() => /\/panel/.test(location.pathname), {
  timeout: 30000,
});
ok(`login lands on the panel — ${page.url()}`);

// The socket handshake is itself signed, so reaching "live" already proves the
// HMAC fallback works. The commands below prove the UUID one does.
await page.waitForFunction(
  () => /متصل|Live/.test(document.body.innerText),
  { timeout: 30000 },
).then(
  () => ok("signed websocket handshake accepted without crypto.subtle"),
  () => fail("the signed handshake never went live"),
);

await new Promise((r) => setTimeout(r, 4000));

const switches = await page.$$('button[role="switch"]');
if (switches.length === 0) fail("no controls rendered");
else ok(`controls rendered — ${switches.length} switches`);

let flipped = 0;
for (let i = 0; i < switches.length; i++) {
  const control = switches[i];
  const label = await page.evaluate((el) => el.getAttribute("aria-label"), control);
  const before = await page.evaluate((el) => el.getAttribute("aria-checked"), control);
  await control.click();
  // The switch moves only when the device answers, so this is a real
  // round trip: signed command out, command_result back.
  const moved = await page
    .waitForFunction(
      (index, was) => {
        const all = document.querySelectorAll('button[role="switch"]');
        return all[index] && all[index].getAttribute("aria-checked") !== was;
      },
      { timeout: 15000 },
      i,
      before,
    )
    .then(
      () => true,
      () => false,
    );
  if (moved) {
    flipped++;
    ok(`  "${label}" ${before} -> flipped`);
  } else {
    fail(`  "${label}" ${before} -> unchanged`);
  }
}

if (flipped === switches.length && switches.length > 0) {
  ok("every signed command was accepted and answered");
}

await browser.close();

if (problems.length) {
  console.log("\nproblems:");
  for (const p of problems) console.log("  " + p);
  process.exit(1);
}
console.log("\nall green — the panel works without a secure context");

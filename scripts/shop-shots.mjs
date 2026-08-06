/**
 * Screenshot the commerce and account screens, both locales.
 *
 *   node scripts/shop-shots.mjs
 *
 * Needs the dev server and the Django backend running, plus the panel test
 * account. Separate from app-shots.mjs because these screens need a basket
 * seeded into localStorage before they show anything.
 */

import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--hide-scrollbars"],
});

const desktop = { width: 1280, height: 900 };
const mobile = { width: 390, height: 844, deviceScaleFactor: 2 };

/** Signed-out pages: no session, no basket. */
async function plain(locale, path, name, vp) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport(vp);
  await page.goto(`http://localhost:3000/${locale}${path}`, {
    waitUntil: "networkidle2",
  });
  await new Promise((r) => setTimeout(r, 900));
  await page.screenshot({ path: `shots/${name}.png`, fullPage: true });
  await ctx.close();
  console.log("shot", name);
}

/** Signed in, with a basket already built. */
async function withSession(locale, path, name, vp, { basket = true } = {}) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport(vp);

  await page.goto(`http://localhost:3000/${locale}/login`, {
    waitUntil: "networkidle2",
  });
  await page.waitForSelector('input[name="email"]', { timeout: 15000 });
  await page.type('input[name="email"]', "panel@gmail.com");
  await page.type('input[name="password"]', "panel-test-pass");
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => /\/panel/.test(location.pathname), {
    timeout: 25000,
  });

  if (basket) {
    // The catalogue ids come from the API rather than being written in, so
    // this keeps working when the seed data is re-created.
    const ids = await page.evaluate(async () => {
      const response = await fetch("http://127.0.0.1:8000/api/purchases/products/");
      const data = await response.json();
      return (data.results ?? data).map((p) => p.id);
    });
    await page.evaluate((ids) => {
      localStorage.setItem(
        "sl_cart",
        JSON.stringify([
          { productId: ids[0], quantity: 1 },
          { productId: ids[1], quantity: 2 },
        ]),
      );
    }, ids);
  }

  await page.goto(`http://localhost:3000/${locale}${path}`, {
    waitUntil: "networkidle2",
  });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: `shots/${name}.png`, fullPage: true });
  await ctx.close();
  console.log("shot", name);
}

await plain("fa", "/shop", "shop-fa-desktop", desktop);
await plain("en", "/shop", "shop-en-desktop", desktop);
await plain("fa", "/shop", "shop-fa-mobile", mobile);
await plain("fa", "/shop/smartlife-smart-lamp", "product-fa-desktop", desktop);
await plain("en", "/shop/smartlife-security-camera", "product-en-desktop", desktop);
await plain("fa", "/help", "help-fa-desktop", desktop);
await plain("fa", "/cart", "cart-empty-fa-desktop", desktop);
await plain("fa", "/checkout/result?status=success&order=abc&ref_id=12345", "payment-ok-fa-desktop", desktop);

await withSession("fa", "/cart", "cart-fa-desktop", desktop);
await withSession("en", "/cart", "cart-en-desktop", desktop);
await withSession("fa", "/cart", "cart-fa-mobile", mobile);
await withSession("fa", "/checkout", "checkout-fa-desktop", desktop);
await withSession("en", "/checkout", "checkout-en-desktop", desktop);
await withSession("fa", "/account", "account-fa-desktop", desktop, { basket: false });
await withSession("fa", "/orders", "orders-fa-desktop", desktop, { basket: false });

await browser.close();
console.log("done");

<div align="center">

# 🏠 SmartLife — Frontend

**The storefront and control panel for a smart home that has no setup step.**

Buy a device, plug it in, control it. The Wi-Fi is entered once at checkout and
built into the hardware before it ships — so there is no pairing, no app-based
onboarding, and no captive portal.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![GSAP](https://img.shields.io/badge/GSAP-3.15-88CE02?logo=greensock&logoColor=black)](https://gsap.com)

[![i18n](https://img.shields.io/badge/i18n-فارسی%20%2F%20English-0b7285)](#-bilingual-by-construction)
[![RTL](https://img.shields.io/badge/RTL-first%20class-6741d9)](#-bilingual-by-construction)
[![Zero remote deps](https://img.shields.io/badge/remote%20requests-none-2b8a3e)](#-zero-remote-dependencies)
[![Realtime](https://img.shields.io/badge/realtime-WebSocket%20%2B%20HMAC-c2255c)](#-how-a-command-travels)

</div>

---

## 📑 Contents

- [What this is](#-what-this-is)
- [Screens](#-screens)
- [Quick start](#-quick-start)
- [Configuration](#️-configuration)
- [How a command travels](#-how-a-command-travels)
- [Capability-driven UI](#-capability-driven-ui)
- [Sessions](#-sessions)
- [Bilingual by construction](#-bilingual-by-construction)
- [Zero remote dependencies](#-zero-remote-dependencies)
- [Scripts](#-scripts)
- [Project layout](#-project-layout)
- [Deploying](#-deploying)
- [Gotchas](#-gotchas)

---

## 🎯 What this is

The browser half of SmartLife. It talks to the [Django backend](../backend) over
REST for everything ordinary, and over a signed WebSocket for anything live.

It does four jobs:

| | |
|---|---|
| 🎬 **Sell** | A scroll-scrubbed landing page where a house assembles out of its own exploded parts, then splits into the three devices |
| 🛒 **Take the order** | Shop, basket, checkout — including the buyer's home Wi-Fi — and a Zarinpal handoff |
| 🎛 **Control** | A live panel whose controls are *generated from the backend's capability contract*, not hand-written per device |
| 👤 **Account** | Sign-up with emailed code, profile, password, order history |

---

## 🖥 Screens

Every route is under a locale prefix — `/fa` (default) or `/en`.

| Route | What it does | Auth |
|---|---|:---:|
| `/[locale]` | Landing page. Scroll-scrubbed frame sequences, the product rail (real catalogue), guarantees | — |
| `/[locale]/shop` | Catalogue with live prices and stock | — |
| `/[locale]/shop/[slug]` | Product detail; the "what it does" list is generated from the device's capabilities | — |
| `/[locale]/cart` | Basket. Stored locally, priced from the server on every render | — |
| `/[locale]/checkout` | Home Wi-Fi + delivery, then the payment gateway | 🔒 |
| `/[locale]/checkout/result` | Where the gateway sends the browser back | 🔒 |
| `/[locale]/panel` | Live device dashboard — readings, controls, connection state | 🔒 |
| `/[locale]/orders` | Order history with payment references | 🔒 |
| `/[locale]/account` | Profile and password | 🔒 |
| `/[locale]/help` | Answers, including the honest "not possible yet" ones | — |
| `/[locale]/login` `signup` `verify` `forgot` `reset` | Auth flow | — |

---

## 🚀 Quick start

> **Prerequisite:** the [backend](../backend) must be running, with its database
> migrated and `seed_catalog` applied. The shop reads its products from there.

```bash
npm install
```

```bash
cp .env.example .env
```

Edit `.env` — at minimum point `NEXT_PUBLIC_API_BASE` and `API_BASE_SERVER` at
your Django server. Then build the landing page's render sequences once (they
are derived from `assets/`, and gitignored because they are large and binary):

```bash
npm run frames
```

```bash
npm run dev
```

Open <http://127.0.0.1:3000>. A bare `/` redirects to `/fa` or `/en` based on
the browser's own `Accept-Language`.

**Test accounts** (created by the backend's fixtures):

| Email | Password | Shows |
|---|---|---|
| `panel@gmail.com` | `panel-test-pass` | Three devices, all controllable |
| `empty@gmail.com` | `panel-test-pass` | The empty state |

---

## ⚙️ Configuration

Everything tunable lives in `.env`. Nothing about hosts, ports or addresses is
hardcoded anywhere else. `.env.example` is the committed template and documents
each key in full.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE` | What the **browser** calls — REST and the WebSocket. Must be reachable *from the visitor's device*, so not `localhost` when testing from a phone |
| `API_BASE_SERVER` | What the **Next.js server** calls from its route handlers. Keep it on `127.0.0.1`, never `localhost` — see [Gotchas](#-gotchas) |
| `NEXT_PUBLIC_WS_BASE` | Optional. Only if the socket origin differs from the API origin (a proxy terminating TLS, say) |
| `NEXT_PUBLIC_SITE_ORIGIN` | Pins the app to one hostname. Leave empty when the site must answer on several addresses at once |
| `REFRESH_COOKIE_MAX_AGE_DAYS` | Must equal the backend's `REFRESH_TOKEN_LIFETIME_DAYS` |
| `NEXT_PUBLIC_ACCESS_REFRESH_MARGIN_SECONDS` | How early to renew the access token, so a command is never signed with one that expires mid-flight |
| `DEV_ORIGINS` | Comma-separated hosts allowed to pull `/_next/*` in development. Without the host you actually typed, the HTML renders and every chunk is refused |

> ⚠️ Changing `.env` needs a restart of `npm run dev`.

---

## 🔐 How a command travels

Pressing a switch does **not** move the switch. It sends a request, and the
switch moves when the *device* answers. The panel shows hardware state, never a
hopeful guess.

```
  browser                    Django/Channels                 device
     │                             │                            │
     │  auth  { token, ts, nonce, signature }                    │
     ├────────────────────────────►│                            │
     │                             │  verify HMAC + nonce + skew │
     │◄────────────────────────────┤  auth.ok { gadgets }        │
     │                             │                            │
     │  command { request_id, gadget, key, value, ts, nonce, sig }
     ├────────────────────────────►│                            │
     │                             ├───────────────────────────►│
     │                             │◄───────────────────────────┤
     │◄────────────────────────────┤  command.status            │
     │   switch moves now                                        │
```

Every command is signed **individually** with the JWT access token:

```
signature = HMAC_SHA256(accessToken, "request_id|gadget|key|value|timestamp|nonce")
```

This is why the access token has to be readable by JavaScript. It is the
protocol, not a shortcut — and it is also why commands cannot be issued over
REST, which would bypass the per-command signature entirely.

---

## 🧩 Capability-driven UI

The panel contains **no per-device code**. The backend describes each device
type as a list of capabilities — a key, a direction, a value type, a range, a
unit, a set of choices — and the UI renders whatever it is given:

| Value type | Control |
|---|---|
| `bool` | Switch |
| `int` / `float` | Slider, bounded by the declared range, labelled with the unit |
| `enum` | Segmented choice |
| telemetry-only | Read-only live reading |

Define a new device type in the backend and its controls appear here with no
frontend change at all.

---

## 🔑 Sessions

| | |
|---|---|
| **Access token** | Memory only. Never in `localStorage` — an XSS that can read storage would otherwise be able to sign commands offline |
| **Refresh token** | `httpOnly` cookie, set by Next route handlers under `src/app/api/auth/` |
| **Lifetime** | Access 1 day, refresh 7 days, **absolute** — rotation is off, so seven days after signing in you sign in again |
| **Logout** | Blacklists the refresh token server-side, so it ends the session everywhere, not just in the browser that dropped its cookie |

---

## 🌍 Bilingual by construction

Persian and English are equals, and Persian is the default. This is not a
translation layer bolted on afterwards:

- 🔤 **RTL is a first-class layout**, not a mirror. Spacing uses logical
  properties (`ms-`, `pe-`, `start-`, `end-`); directional icons carry
  `rtl:rotate-180`; the horizontal rail inverts its physical scroll sign.
- ✍️ **Zero letter-spacing under `[dir="rtl"]`**, enforced globally. Arabic
  script joins its letters and Latin display tracking breaks the joins.
- 🔢 **Latin digits in Persian** (`fa-IR-u-nu-latn`), so a Jalali date and a
  sensor reading two centimetres apart do not look like two different pages.
- 📦 **The catalogue itself is bilingual** — `name_fa` / `description_fa` are
  database columns with the English as fallback, not client-side translation.

---

## 🚫 Zero remote dependencies

At runtime *and* at build time, this app contacts no host but its own backend.
Fonts are committed to the repository and loaded with `next/font/local`; there
is no CDN, no Google Fonts, no analytics, no remote images.

```bash
npm run check:no-remote
```

fails the build if anything would reach another host. The build is verified to
succeed with the network blocked.

---

## 📜 Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run verify` | `check:no-remote` **+** build. The gate before deploying |
| `npm run lint` | ESLint |
| `npm run frames` | Build the landing page's frame sequences from `assets/` |
| `npm run vendor:fonts` | Re-vendor the font files |
| `npm run e2e` | Drive a real browser against the running stack: log in, wait for the signed socket, press every control, confirm each device answered |
| `npm run e2e:insecure` | The same, with `crypto.subtle` and `crypto.randomUUID` stripped — the path a plain-http deployment takes |
| `npm run manifest` | Rebuild `public/asset-manifest.json`. Runs as part of `build`; only needed on its own after editing `public/seq` by hand |
| `npm run cache:test` | Prove the frame cache: cold download, warm visit with zero network, one edited frame refetched alone, a removed frame evicted. Needs the app on 3001 (`npx next start -p 3001`) — it runs a counting proxy on 3000 |
| `npm run paint:test` | Prove the landing splash owns the first paint on a cold visit, and never appears on a warm one |

---

## 📁 Project layout

```
src/
  app/
    [locale]/          every page, under /fa or /en
    api/auth/          route handlers that own the httpOnly refresh cookie
  components/
    panel/             device dashboard: cards, controls, live readings
    shop/              catalogue, basket, checkout
    site/              shared chrome — header, account menu, basket button
    auth/              login, signup, verify, forgot, reset
    ui/                Button, Field, PasswordField
  lib/
    auth.tsx           session provider, token refresh, authorised fetch
    useUserSocket.ts   the signed WebSocket and its command lifecycle
    hmac.ts            HMAC-SHA256 + UUID, with insecure-context fallbacks
    gadgetTypes.ts     capability contract → control mapping
    cart.tsx           the basket
    i18n.ts            both dictionaries
    products.ts        catalogue fetching and localisation
  proxy.ts             locale routing
public/seq/            generated frame sequences (gitignored)
assets/                sources for the above
```

---

## 🌐 Deploying

```bash
npm run verify && npm start
```

Set `.env` for the deployment first — `NEXT_PUBLIC_API_BASE` must be the
address a **visitor's browser** can reach, not one that only resolves on the
server.

> ### ⚠️ Put it behind TLS
>
> Over plain `http` the browser withholds part of the Web Crypto API, and every
> JWT, Wi-Fi password and command is readable by anyone on the path. The app
> carries fallbacks so a bare-IP staging box still works
> (see `npm run e2e:insecure`) — **that is a convenience for testing, not a
> substitute for https.**
>
> With TLS, also proxy the WebSocket upgrade through to the backend so devices
> and panels speak `wss://`.

---

## 🪲 Gotchas

These each cost real debugging time. They are here so they cost none next time.

<details>
<summary><b>Login answers a bare 404</b></summary>

The Next route handler could not reach Django. Almost always `API_BASE_SERVER`
is set to `localhost`: Node resolves that to `::1` first, and
`manage.py runserver 0.0.0.0:8000` listens on IPv4 only. **Use `127.0.0.1`.**
</details>

<details>
<summary><b>The app seems to swap my account</b></summary>

`localhost:3000` and `127.0.0.1:3000` are one site to you and two sites to the
browser — separate cookie jars, so separate logins. Sign out of one, sign in as
somebody else, type the other, and the first account is still there. Set
`NEXT_PUBLIC_SITE_ORIGIN` to pin one hostname.
</details>

<details>
<summary><b>Commands fail with "crypto.randomUUID is not a function"</b></summary>

An insecure context — plain `http` on anything that is not localhost — withholds
`crypto.subtle` **and** `crypto.randomUUID`. Both have fallbacks in
`src/lib/hmac.ts`. **Never call either API directly**; import `hmacHex` and
`randomUUID` from that module. Verify with `npm run e2e:insecure`.
</details>

<details>
<summary><b>The page renders but every asset 403s in development</b></summary>

Add the host you typed in the address bar to `DEV_ORIGINS` and restart.
</details>

<details>
<summary><b>Route handlers start answering 404 for no reason</b></summary>

`next build` was run while `next dev` was running; they share `.next`. Stop the
dev server, delete `.next`, start again.
</details>

<details>
<summary><b>A control snaps back a second after I set it</b></summary>

That is the backend, not this app. The device type is missing the telemetry twin
for that command key — see the note at the top of the backend's
`seed_catalog.py`.
</details>

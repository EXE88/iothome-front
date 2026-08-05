# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router, TypeScript, Tailwind) — chosen by the user over Vite+React
and static HTML. Bilingual from the start: Persian (RTL) and English (LTR).
The Django backend already whitelists `http://localhost:3000` for CORS, which
matches Next's default dev port.

## Users

Ordinary householders in Iran who want a few connected devices at home and are
not technical. The buying situation is a phone or laptop, browsing a product
they have not seen before, deciding whether this is trustworthy enough to pay
for. The using situation is different and later: glancing at a dashboard to see
whether a room is warm or a lamp is on, and tapping something to change it.

The decisive product fact for this audience: they never configure anything.
They enter their home Wi-Fi name and password *at checkout*, those get burned
into the device during assembly, and when the box arrives the only step is
plugging it in. No app pairing, no hotspot dance, no QR code.

A second, smaller audience exists inside the same system: staff who read the
provisioning endpoint during assembly. They are not a landing-page audience.

## Product Purpose

SmartLife sells its own IoT devices and the service that runs them: buy a
device, plug it in, control it from an online panel. Success for the landing
page is a visitor who understands the "plug it in and it works" mechanism and
creates an account. Success for the product is a device that reconnects on its
own after a power cut without the owner ever knowing it dropped.

## Positioning

Pre-provisioned hardware. Competing smart-home products ship a generic device
and push setup onto the buyer; SmartLife knows which house a device is going to
before it is assembled, so the Wi-Fi credentials and the device's own secret key
are already inside it. That is a claim a neighboring product cannot copy without
also owning the sale, the assembly line, and the backend.

## Operating Context

Confirmed end-to-end flow, already implemented in the backend:

1. Register with a Gmail address, verify by emailed 6-digit code.
2. Choose a product, enter home Wi-Fi SSID and password plus shipping details,
   pay through Zarinpal (Toman).
3. Payment verified server-side; one gadget record per unit, each with its own
   secret key and a copy of the Wi-Fi credentials.
4. Staff read those at assembly and flash them into the ESP32.
5. Owner plugs the device in. It joins Wi-Fi, opens a WebSocket, proves itself
   with an HMAC signature, and appears online.
6. Owner opens the panel, which opens its own signed WebSocket and shows live
   readings and controls.

Device families behave in two ways: some stream readings continuously
(thermometer), others only answer commands and report the result (lamp,
camera). Both send a heartbeat; a device that goes silent is marked offline and
the panel is told.

## Capabilities and Constraints

- Three products: **thermometer** (streams temperature and humidity),
  **lamp** (power, brightness, colour), **camera** (confirmed a real product;
  its capability contract is not yet defined in the backend, where only
  thermometer and lamp are seeded).
- Prices are in Toman; payment is Zarinpal only. The gateway is in sandbox mode
  and no merchant ID is configured yet, so no real purchase can complete today.
- Accounts accept Gmail addresses only, canonicalised so dotted and +tagged
  aliases cannot become separate accounts.
- Telemetry is relayed live and never stored. Command history is kept 90 days.
  Nothing else is retained, so there is no historical-charts feature to promise.
- A device's state is pulled on demand, not cached: the panel asks each online
  device for its state when it connects, and can re-ask on a refresh action.
- Devices that are offline cannot be commanded; the panel is told immediately
  rather than queueing.
- Every user command is individually HMAC-signed, so the web client must
  compute HMAC-SHA256 in the browser.

## Brand Commitments

- Name: **SmartLife**.
- Bilingual Persian/English, both directions first-class.
- Icon set: Bootstrap Icons, drawn in the dark secondary colour. Sticker-style
  or illustrative icons are explicitly ruled out.
- The user has pinned a light, modern, minimalist direction with white as
  primary and black as secondary, glassmorphism on card-like surfaces, and
  smooth motion throughout. Recorded here because the user made it binding;
  the visual world itself is decided in new-work.

## Evidence on Hand

- **No customers, no usage numbers, no testimonials, no press.** The user was
  asked directly and confirmed none exist. Nothing of this kind may be invented
  or implied anywhere on the site.
- Real assets: four 80-frame exploded-assembly image sequences at 1280×720
  (`assets/frames/{house,termometer,lamp,camera}/ezgif-frame-001..080.jpg`) and
  the source videos in `assets/videos/`. Frame 080 is fully disassembled and
  frame 001 is the finished object, so scrubbing 080→001 assembles it.
- Real product truth to draw on instead of social proof: the actual mechanism,
  the real capability list per device, and the real flow above.

## Product Principles

1. **The mechanism is the pitch.** The reason to trust SmartLife is that setup
   does not exist, so show the thing assembling itself rather than claiming
   convenience in adjectives.
2. **Never manufacture proof.** With no customers yet, credibility comes from
   concrete product facts, not from numbers, logos, or quotes.
3. **Two languages, one design.** Persian is not a translation layer bolted on;
   RTL layout and Persian typography are held to the same standard as English.
4. **Promise only what the backend does.** No historical charts, no automation
   rules, no sharing — none of it exists.
5. **Non-technical by default.** Nothing in the marketing surface should
   require the visitor to know what a WebSocket, an SSID, or a secret key is.

## Accessibility & Inclusion

No product-specific standard was established. Baseline still applies: the
landing page leans on a long scroll-driven animation, so it must remain
readable and navigable when `prefers-reduced-motion` is set, and content must
not exist only inside the canvas.

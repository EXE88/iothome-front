---
name: SmartLife Landing
description: A seamless grey studio sweep cut against white paper, where full-bleed canvas renders assemble themselves as you scroll.
colors:
  paper: "#ffffff"
  ink: "#0a0a0a"
  ink-soft: "#4b4b4b"
  ink-faint: "#6f6f6f"
  studio-core: "#c6c6c6"
  studio-mid: "#b4b4b4"
  studio-edge: "#a2a2a2"
  studio-floor: "#d4d4d4"
  line: "color-mix(in srgb, #0a0a0a 12%, transparent)"
  line-strong: "color-mix(in srgb, #0a0a0a 22%, transparent)"
  glass: "color-mix(in srgb, #ffffff 62%, transparent)"
  glass-line: "color-mix(in srgb, #ffffff 70%, transparent)"
  # Not a palette entry: the opaque stop inside the .studio-fade mask
  # gradient, where the value is alpha and never reaches a pixel.
  mask-opaque: "#000"
typography:
  display:
    fontFamily: "Schibsted Grotesk, Vazirmatn, sans-serif"
    fontSize: "clamp(2.6rem, 7vw, 5.25rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Schibsted Grotesk, Vazirmatn, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3.2rem)"
    fontWeight: 600
    lineHeight: 1.03
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Schibsted Grotesk, Vazirmatn, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Schibsted Grotesk, Vazirmatn, sans-serif"
    fontSize: "0.98rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  body-lead:
    fontFamily: "Schibsted Grotesk, Vazirmatn, sans-serif"
    fontSize: "clamp(1.02rem, 1.5vw, 1.2rem)"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  term:
    fontFamily: "Schibsted Grotesk, Vazirmatn, sans-serif"
    fontSize: "1.12rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.02em"
  ui:
    fontFamily: "Schibsted Grotesk, Vazirmatn, sans-serif"
    fontSize: "0.92rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Schibsted Grotesk, Vazirmatn, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.14em"
  cue:
    fontFamily: "Schibsted Grotesk, Vazirmatn, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.22em"
  sequence-title:
    fontFamily: "Schibsted Grotesk, Vazirmatn, sans-serif"
    fontSize: "1.4rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  sequence-title-final:
    fontFamily: "Schibsted Grotesk, Vazirmatn, sans-serif"
    fontSize: "1.9rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  sequence-ordinal:
    fontFamily: "Schibsted Grotesk, Vazirmatn, sans-serif"
    fontSize: "2.1rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "normal"
  sequence-title-final-sm:
    fontFamily: "Schibsted Grotesk, Vazirmatn, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  sequence-ordinal-sm:
    fontFamily: "Schibsted Grotesk, Vazirmatn, sans-serif"
    fontSize: "1.6rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "normal"
rounded:
  hairline: "2px"
  panel: "1rem"
  card: "1.5rem"
  sheet: "1.5rem"
  pill: "9999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1.25rem"
  lg: "2rem"
  xl: "3.5rem"
  section: "7rem"
  section-wide: "9rem"
  gutter: "1.5rem"
  gutter-wide: "2.5rem"
  container: "72rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0.875rem 1.75rem"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0.875rem 1.75rem"
  button-secondary-hover:
    backgroundColor: "color-mix(in srgb, #0a0a0a 6%, transparent)"
    textColor: "{colors.ink}"
  button-inverse:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "1rem 2rem"
  button-inverse-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "1rem 2rem"
  rail-arrow:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "2.75rem"
    width: "2.75rem"
  nav-bar:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.625rem 1.5rem"
  nav-bar-on-dark:
    backgroundColor: "color-mix(in srgb, #ffffff 14%, transparent)"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "0.625rem 1.5rem"
  card-product:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "1.5rem"
    width: "22rem"
  device-panel:
    backgroundColor: "{colors.studio-core}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "0"
---

<!--
THESIS: A smart device you never set up, proved by watching one build itself.
  Refuses the category's feature-grid-under-a-stock-hero page.
OWN-WORLD: The seamless grey studio sweep the product films were shot on, cut
  against white paper. Two surfaces only, near-black ink, one hairline weight,
  full-bleed canvas renders, glass only where something moves behind it,
  Bootstrap Icons at a single stroke.
STORY: The visitor watches a house assemble, sees three devices split out of it
  and assemble too, learns the only step that is theirs is the plug, and
  creates an account.
FIRST VIEWPORT: Full-bleed studio canvas of the exploded house; headline on the
  leading half at clamp(2.6rem,7vw,5.25rem) with the lead beneath; dark pill
  CTA directly below the copy; glass nav floating above; scroll cue centred at
  the bottom.
FORM: Scroll-scrubbed frame sequence, pinned. Brief-pinned direction, honored
  over a direction roll.
-->

# Design System: SmartLife Landing

## Overview

**Creative North Star: "The Seamless Sweep"**

The page is a photographic studio with the walls left in. Every product render was shot on one continuous grey cyclorama, and rather than cutting the products out and dropping them onto a layout, the build keeps the sweep and makes it a surface of the page. There are exactly two grounds: white paper, and that grey. A section is either printed or photographed. Nothing else is invented to sit between them — no tinted panels, no brand accent, no third neutral.

Because the sweep is a real photographed gradient rather than a swatch, the system's hardest rule is about matching it. Canvas frames are painted with `contain` and the leftover box is filled by stretching the frame's own outermost pixel rows and columns outward, so the render dissolves into the section instead of sitting on it as a visible rectangle with a horizon line. The CSS `.studio` sweep behind the canvas exists only to catch what the mask feathers away; it is a backing, never a substitute. The whole page carries one accent decision, which is that there is no accent: near-black ink on white, white ink on near-black, and a single hairline weight for every rule, border and drawn strand.

Motion is the argument, not the decoration. The product claim is "you never set it up", and the page proves it by scrub-assembling an eighty-frame house out of its own exploded parts under the visitor's scroll, then splitting three devices out of that house and assembling them the same way. Everything else moves once: a single authored entrance — rise, unblur, settle — reused in every section so that no component gets its own signature move. Glass appears in precisely two places, and in both of them something is genuinely moving behind it.

**Key Characteristics:**
- Two surfaces only: white paper (`#ffffff`) and the photographed studio sweep; one near-black section (`#0a0a0a`) as the page's closing anchor.
- Near-black ink, three text values (`#0a0a0a` / `#4b4b4b` / `#6f6f6f`), no coloured accent anywhere.
- One hairline weight at 12% ink, one strong hairline at 22% ink. No second border scale.
- Full-bleed scroll-scrubbed canvas renders as the primary imagery; never a static hero photo.
- Pill geometry for anything you press; soft rectangles for anything that holds a render.
- Bilingual by construction — Persian RTL is the default locale, not a translation layer.
- Bootstrap Icons at a single stroke, always at full ink.

## Colors

A two-surface achromatic palette: printed white, photographed grey, near-black ink — plus one inverted section. There is no brand hue in the system at all.

### Primary
- **Near-Black Ink** (`#0a0a0a`): Every headline, every body sentence that sits on a render, every icon, the primary pill button's fill, and the entire closing section's background. It is the system's only "colour" and it does all the emphasis work that a brand accent would normally do.

### Neutral
- **Paper White** (`#ffffff`): The default page ground and the ink of the closing section. Sections are white unless they are carrying a render.
- **Soft Ink** (`#4b4b4b`): Secondary prose — section leads, device descriptions, nav links at rest, footer links. The default body colour on paper.
- **Faint Ink** (`#6f6f6f`): Tertiary detail — the third line of a device caption, definition-list terms, footer legal, the numeral on a non-final step, the scroll cue.
- **Studio Core** (`#c6c6c6`): The centre of the seamless sweep, where the subject sits.
- **Studio Mid** (`#b4b4b4`): The sweep's falloff at 52%.
- **Studio Edge** (`#a2a2a2`): The sweep's outer edge, where the cyclorama darkens.
- **Studio Floor** (`#d4d4d4`): The lit floor, layered as a bottom-anchored wash over the last 26% of a studio section.
- **Hairline** (12% ink): Every divider, list rule and card border on paper.
- **Strong Hairline** (22% ink): Secondary button outlines, the SVG strands, the mobile connector stroke, rail arrow buttons. The only place a border is allowed to be visible from across the room.
- **Glass** (62% white) and **Glass Edge** (70% white): Reserved for the two components that overlap live movement.

### Named Rules

**The Two Surfaces Rule.** A section's ground is white paper or the studio sweep. Nothing else. If a new section wants a third tone to separate itself, it is asking for the wrong thing — give it whitespace or a hairline, not a tint.

**The Sampled Grey Rule.** The studio tokens are sampled out of the frames themselves and are only ever a backing for a render. Never use a studio grey as a decorative panel fill on a section that contains no frame; it will read as a smudge rather than as a wall.

**The No Accent Rule.** There is no accent colour and none may be introduced. Emphasis is made with size, weight, and the inversion to `#0a0a0a` — never with hue. A coloured link, badge or state chip breaks the world instantly.

## Typography

**Display Font:** Schibsted Grotesk (Latin, via `next/font`)
**Body Font:** Schibsted Grotesk (Latin) / Vazirmatn (Persian, via `next/font`)
**Label/Mono Font:** none — tabular numerals come from `font-variant-numeric`, not a second family.

**Character:** One grotesk does everything. Display sizes are pulled tight (down to `-0.045em`) and set at sub-unity leading so a two-line headline reads as a single mass; body text opens back out to a relaxed 1.625 and stays untracked. The pairing is a matched-pair, not a contrast-pair: Vazirmatn carries Persian at the same weights and sizes as Schibsted Grotesk carries Latin, so the two locales are the same page rather than two designs.

### Hierarchy
- **Display** (600, `clamp(2.6rem, 7vw, 5.25rem)`, 0.98, `-0.045em`): The hero headline only. One per page.
- **Headline** (600, `clamp(2rem, 4vw, 3.2rem)`, 1.03, `-0.035em`): Section titles. Two authored variants exist: the closing section runs hotter at `clamp(2.1rem, 5vw, 4rem)` / 1.02 / `-0.04em` because it is the page's anchor, and the pinned device section runs cooler at `clamp(1.9rem, 3.4vw, 2.7rem)` / 1.05 because it shares its viewport with four renders.
- **Title** (600, 1.25rem, `-0.02em`): Card and device-panel names, the wordmark. Both places a product is named use the same value, so a name never changes size between the trio and the rail. The spec-list term sits one notch under at 1.12rem.
- **Body** (400, 0.98rem, 1.625): Section prose, capped at 46–52ch. The hero lead runs larger at `clamp(1.02rem, 1.5vw, 1.2rem)` and, uniquely, is set at full `#0a0a0a` rather than soft ink because it sits on a photographed wall whose value shifts as the render scrubs.
- **UI** (400–600, 0.92rem): The single step for interface text — nav links, both nav buttons and their mobile equivalents, footer link columns, card CTA and spec values, the device-panel detail line. There is deliberately no second small step beside it: four near-identical sizes between 0.88 and 0.94 used to do this one's job and none of the differences were visible.
- **Label** (600, 0.82rem, `0.14em`, uppercase): Footer column headings and spec-list terms. The scroll cue is the one other tracked-uppercase item, smaller and looser at 0.72rem / `0.22em` / soft ink.

**The numbered sequence is the one place off this ramp**, deliberately: its ordinals run 1.6rem/2.1rem and its step titles 1.4rem, rising to 1.5rem/1.9rem on the last one, because the whole point of that section is that only the final step belongs to the buyer. Do not borrow these sizes elsewhere.

### Named Rules

**The Zero-Tracking Persian Rule.** Arabic script joins its letters, and Latin display tracking pulls those joins apart into broken type. Under `[dir="rtl"]`, letter-spacing is forced to `0` on every heading, paragraph, link, span, list item, button and caption, regardless of what a utility class asks for. Never add a tracking utility expecting it to survive in Persian, and never work around this rule.

**The Negative-Tracking Ceiling Rule.** Tracking is negative or zero, never positive, with exactly two exceptions: the footer column label (`0.14em`) and the scroll cue (`0.22em`). Both are uppercase micro-labels. Anything set in sentence case with positive tracking is off-system.

**The One Grotesk Rule.** One family per script, four weights at most (400/500/600). Do not introduce a serif, a mono, or a display face for emphasis; emphasis is size and weight.

## Layout

A single centred content column of `72rem` (`max-w-6xl`) with `1.5rem` gutters that open to `2.5rem` at 640px. Every section — including the ones whose background bleeds edge to edge — puts its type inside that same column, which is what lets the SVG strands in the device section land exactly on the panels they belong to.

Vertical rhythm is deliberately coarse: `7rem` of section padding, opening to `9rem` at 640px, with `3.5rem` between a section's header block and its content. Inside a block the rhythm tightens to a 0.5/0.75/1.25/2rem ladder. Density is low by intent — the page is long because it is a sequence, not because it is full.

Breakpoints are Tailwind's defaults and only three of them are load-bearing: **640px** (`sm`) is where the layout stops being a phone, **768px** (`md`) is where the nav's link set replaces the hamburger and where the 1280px frame set replaces the 640px one, **1024px** (`lg`) is where the how-it-works section splits into a sticky `22rem` header beside its list.

Scroll-driven sections are sized in viewport multiples rather than content: the hero is `340vh` of scroll distance with a `100vh` sticky child, which is what gives eighty frames room to read as motion rather than as a slideshow; the device section is `320vh` sticky above 640px and collapses to normal document flow below it, where each device instead scrubs as it passes through `top 85%` → `bottom 55%`.

**The Leading-Edge Copy Rule.** Hero copy occupies the leading half only (`max-w-[38rem]` inside the column), and the scrim wash runs from the leading edge across to about 56% of the viewport. Under `[dir="rtl"]` the gradient direction flips to `left`. Below 640px the copy stacks above the render and the wash runs top-to-bottom instead.

**The Logical-Properties Rule.** Spacing and positioning that could flip use logical utilities (`start`, `end`, `-me-1`), and directional icons carry `rtl:rotate-180`. Physical `left`/`right` appears only where the geometry is genuinely physical — the horizontal rail's `scrollBy`, which inverts its sign under RTL, and the SVG strands, which are mirrored wholesale.

## Elevation & Depth

The page is flat on paper and atmospheric on grey. There are no resting shadows on any element sitting on white — separation there is done with hairlines and whitespace. Shadows exist only under the two glass components and are tuned as *lift*, not as a drop: a 1px contact shadow at 4–5% plus a wide, heavily negative-spread ambient pool. Depth in the studio sections comes from the render itself — the sweep's own radial falloff, the floor wash, and the mask that feathers a canvas into its section — not from a box-shadow.

### Shadow Vocabulary
- **Nav lift** (`box-shadow: 0 1px 2px rgba(10,10,10,0.04), 0 12px 32px -12px rgba(10,10,10,0.22)`): The floating bar once the page has scrolled past 24px.
- **Nav lift, inverted** (`box-shadow: 0 12px 32px -14px rgba(0,0,0,0.6)`): The same bar while it overlaps a dark surface.
- **Sheet lift** (`box-shadow: 0 1px 2px rgba(10,10,10,0.04), 0 16px 40px -14px rgba(10,10,10,0.28)`): The open mobile menu.
- **Card lift** (`box-shadow: 0 1px 2px rgba(10,10,10,0.05), 0 24px 48px -24px rgba(10,10,10,0.35)`): Product rail cards, which float over a live studio sweep.

### Named Rules

**The Glass-Earns-It Rule.** `backdrop-filter` is permitted only where something is genuinely moving or photographed behind the element: the floating nav, and the product cards over the studio sweep. Glass over flat white is decoration and is not allowed.

**The Flat Paper Rule.** Nothing on the white surface casts a shadow. If an element on paper needs to be distinguished, it gets a hairline, more whitespace, or a weight change.

## Shapes

Two radii carry the whole page, and the split is semantic: **pill** (`9999px`) for anything you press or that floats — every button, the nav bar itself, the language toggle, the rail arrows; **soft rectangle** for anything that holds a render — `1rem` for device panels and the house thumbnail, `1.5rem` for product cards and the mobile menu sheet. Nothing is square-cornered except the numbered-step rules and definition lists, which are not boxes at all.

Borders are a single hairline weight, full stop: 12% ink for dividers and card edges, 22% ink where an outline must actually be seen (secondary buttons, rail arrows, the SVG strands at `1.25px` with `vector-effect: non-scaling-stroke`). Focus is a `2px` solid ink outline at `3px` offset with a `2px` radius, applied globally on `:focus-visible`.

**The One Hairline Rule.** There is one border weight in this system. A thicker rule, a double rule, or a second colour of divider is off-system. If a boundary needs more presence, change the surface, not the stroke.

## Components

### Buttons
- **Shape:** Full pill (`9999px`) at every size and in every context.
- **Primary:** Ink fill, paper text, `0.875rem 1.75rem` on paper sections; the closing section's inverse runs paper fill / ink text at `1rem 2rem`. The nav's compact primary is `0.5rem 1.25rem`.
- **Secondary:** Transparent with a strong-hairline outline, ink text, identical padding to its primary sibling. On the dark section the outline becomes 28% white.
- **Hover / Focus:** Primary buttons lift `-2px` over 300ms on the exponential ease and never change fill. Secondary and ghost buttons wash their background instead (6–8% ink on paper, 10% white on dark) over 200–300ms and never move. Focus is the global ink outline.
- **Trailing icon:** A `bi-arrow-right` at `0.9em` that slides `4px` forward on group-hover, mirrored under RTL by `rtl:rotate-180` plus a negated translate.

### Cards
- **Corner Style:** `1.5rem`.
- **Background:** Glass (62% white) with `backdrop-blur-xl` and `backdrop-saturate-150`, over a live studio sweep.
- **Border:** One hairline at 70% white — a light edge, not a dark one, because the card is a pane of glass and its edge catches the light.
- **Shadow Strategy:** Card lift (see Elevation).
- **Internal Padding:** `1.5rem`, with the render bleeding to the card's edge above it at 4:3.
- **Hover:** The whole card rises `-6px` over 500ms while the image inside scales to 1.04 over 700ms — two speeds on the same ease, so the image lags the card slightly.
- **Body:** A two-row definition list ruled top and bottom with hairlines: faint-ink term on the leading side, medium-weight ink value on the trailing side. No prices — none exist.

### Navigation
- **Style:** A floating pill inset `1rem` from the top, `max-w-6xl`, `pointer-events-none` on the wrapper so the page scrolls through the gap beside it. Transparent at rest; at `scrollY > 24` it becomes glass with the nav lift; all three states cross-fade over 500ms on the exponential ease.
- **Typography:** Wordmark at 1.05rem/600/`-0.02em` beside a filled `bi-house-door-fill`; links at 0.92rem in soft ink, going to full ink on hover.
- **Mobile:** Below 768px the links and account actions collapse behind a `bi-list` / `bi-x-lg` toggle; the open sheet is a `1.5rem`-radius glass panel below the bar, body scroll locked, with a hairline-separated login/signup pair at the bottom.

**The Dark-Overlap Inversion Rule.** The nav measures every `[data-surface="dark"]` section against an 88px bar height on scroll and resize, and while one overlaps it inverts its **whole** token set — links, wordmark, both buttons, and the hover washes — not just the background. White glass over near-black leaves links at roughly 1.7:1, which is why the inversion exists. Any new dark section must carry `data-surface="dark"` or the nav will go unreadable over it.

### Scroll-Scrubbed Frame Sequence (signature)

The page's defining component. Eighty WebP frames per sequence, served at 640px or 1280px chosen in JS at load time by viewport width so the wrong set is never fetched. Frame 080 is fully exploded and 001 is the finished object, so scroll progress `0 → 1` walks the index downward and the object assembles. Frames are decoded once into an array and thereafter only drawn; draws are coalesced onto a single `requestAnimationFrame`. Lenis drives the page scroll and hands each tick to ScrollTrigger, so the canvas lands on the same eased position the copy is drawn at.

**The Contain-And-Continue Rule.** Frames are painted with `contain`, never `cover` — the subject spans nearly the full width of a 16:9 frame and covering a portrait box throws it off both edges. Whatever the box leaves over is filled by stretching the frame's own outermost two pixel rows and columns outward, corners included. **No CSS gradient, overlay, or flat fill may ever stand in for the render.** The `.studio` sweep behind the canvas is a transparent-canvas backing for what the feather mask removes; it is not the fill, and a mismatch there reads as a hard horizon line across the section.

**The Interpolated Zoom Rule.** Zoom is interpolated across scroll progress, not fixed, because the two ends of a sequence want opposite things: the exploded frame is at its widest and must not be cropped, the finished object is small and centred and wants filling the frame. The hero runs 1.06 → 1.34 on desktop and 1.02 → 2.1 on phones, where a 16:9 frame in a portrait viewport starts out tiny; the device panels sit at a flat 1.35 because their subject occupies about half its frame. Vertical anchoring moves with it — 0.5 centred on desktop, 0.74 on phones where copy sits above the render.

**Loading:** Non-hero sequences are gated behind an IntersectionObserver at `80%` root margin. The canvas goes live as soon as the first frame lands rather than waiting for the tail, and repaints on every eighth arrival — which is what stops a reduced-motion visitor, who gets exactly one draw call, from staring at an empty canvas.

### Studio Panel
A 4:3 soft-rectangle (`1rem`) with the `.studio` sweep as its background and a canvas or still inside it under a radial feather mask (`.studio-fade`, opaque to 62% then falling to transparent), because the seam between a canvas and the CSS sweep is never perfect at the pixel level. A single Bootstrap icon sits at the panel's leading top corner at full ink. Caption below the panel: title, soft-ink line, faint-ink detail.

### Specification List
The recurring alternative to a card grid. Hairline-ruled rows, top and bottom, with the term on the leading side and plain explanation on the trailing side, capped at 46ch. Used for the trust guarantees (icon / term / body at `1.5rem 18rem 1fr` above 768px) and for the numbered how-it-works sequence (`2.5rem`/`4rem` ordinal column, tabular numerals, faint ink until the final step which promotes to full ink and semibold).

### Icons
Bootstrap Icons only, always at `--ink`, always `aria-hidden`, never filled with a background or enclosed in a chip. Sizes track their neighbouring text (`text-base` to `text-xl`). The one filled glyph in the system is the wordmark's `bi-house-door-fill`.

## Do's and Don'ts

### Do:
- **Do** give every new section one of the two grounds: `bg-paper` or `.studio`. A dark section must additionally carry `data-surface="dark"` so the nav can invert over it.
- **Do** paint canvas frames with `contain` and continue the frame's own edge pixels outward to fill the box.
- **Do** interpolate zoom across scroll progress when a sequence's subject changes size between its first and last frame.
- **Do** use `Reveal` for section entrances — the single authored rise-unblur-settle at 0.9s on `cubic-bezier(0.16, 1, 0.3, 1)`, staggered at 0.06–0.08s per item for a group.
- **Do** put every transition on `cubic-bezier(0.16, 1, 0.3, 1)` at 200ms (colour), 300ms (small transform), 500–700ms (surface and image).
- **Do** honour `prefers-reduced-motion`: drop pinning and scrubbing, paint the finished frame directly, and show revealed content already in place.
- **Do** use logical properties and `rtl:` variants for anything directional, and mirror physical SVG geometry with `scaleX(-1)` under `[dir="rtl"]`.
- **Do** keep prose to 46–52ch and lead paragraphs in soft ink — except over a render, where body text goes full ink.
- **Do** reach for a hairline-ruled specification list before a card grid; the page already has two grids and a third makes it a stack of identical containers.

### Don't:
- **Don't** introduce a third surface tone, a brand hue, or a coloured state. There is no accent in this system.
- **Don't** substitute a CSS gradient, overlay, or flat grey for a render's backdrop; the seam will read as a horizon line across the section.
- **Don't** use `cover` on a frame sequence canvas, and don't letterbox with a visible fill.
- **Don't** add a tracking utility to text that will be read in Persian — RTL forces letter-spacing to `0` and expecting otherwise means the Latin and Persian layouts diverge.
- **Don't** use positive letter-spacing outside the two uppercase micro-labels (footer column headings at `0.14em`, scroll cue at `0.22em`). In particular, don't set a tracked uppercase kicker or eyebrow above a section headline; the headlines stand alone.
- **Don't** apply glass or `backdrop-filter` where nothing moves behind it.
- **Don't** put a resting shadow on anything sitting on white paper.
- **Don't** introduce a second border weight, a second icon set, or an icon at anything other than full ink.
- **Don't** give a component its own bespoke entrance animation; there is one authored entrance and the scrub.
- **Don't** invert only the nav's background over a dark section — invert the whole token set, or the links fall to 1.7:1.

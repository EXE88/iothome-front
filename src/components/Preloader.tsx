"use client";

import { useEffect, useRef, useState } from "react";
import { usePreload } from "@/lib/usePreload";
import {
  LANDING_SEQUENCES,
  frameWidth,
  useFrameSequence,
} from "@/lib/useFrameSequence";
import { warmFrameCache } from "@/lib/frameCache";
import { numberLocale } from "@/lib/format";
import type { Dictionary, Locale } from "@/lib/i18n";

/** Once shown, stay long enough to be read rather than blinked at. */
const MIN_VISIBLE_MS = 650;
/** How long before offering a way past a wait that is dragging. */
const IMPATIENT_MS = 8000;

/** Ring geometry. The stroke is the system's one hairline, so only r matters. */
const RING_R = 34;
const RING_C = 2 * Math.PI * RING_R;

/**
 * The wait, made part of the page rather than an apology for it.
 *
 * This is not a spinner over a blank screen. It is the exploded house — frame
 * 080, the first frame the sequence requests and the exact frame the hero
 * opens on — painted by the hero's own painter, on the hero's own ground, at
 * the hero's own zoom and anchor. The wordmark sits where the nav will be and
 * the ring sits where the scroll cue will be. When this dissolves, those two
 * pieces of chrome land in the places the splash was already using and the
 * picture underneath does not move at all: the visitor is looking at the same
 * frame before and after, and the only thing that changed is that it became
 * scrubbable.
 *
 * Using the canvas painter rather than an `<img>` is not a detail. `contain`
 * on a 16:9 frame in a tall viewport leaves bands top and bottom, and the CSS
 * sweep behind them never matches the frame's own backdrop — it reads as two
 * horizon lines across the screen, which is the one thing this design system
 * says most loudly not to do. The painter continues the frame's own edge
 * pixels outward instead, so there is no seam to match.
 *
 * **It is server-rendered, and that is the point.** As a client component that
 * appeared on mount it was always one paint too late: the browser drew the
 * landing page, then React hydrated, then the splash covered it — so the first
 * thing a visitor saw was the page the splash exists to hide, followed by a
 * grey screen, followed by the page again. It now ships inside the HTML and
 * owns the very first paint.
 *
 * Which moves the "should this be shown at all?" decision earlier than React
 * can run. `PreloadGate` answers it in an inline script before the first
 * paint, from a marker the browser wrote the last time it finished loading
 * this exact revision. No marker, or a marker from an older build, means the
 * splash stays.
 */
export default function Preloader({
  dict,
  locale,
  revision,
}: {
  dict: Dictionary;
  locale: Locale;
  /** This build's asset revision, for the "already loaded" marker. */
  revision: string;
}) {
  const { progress, done } = usePreload(LANDING_SEQUENCES);

  // Starts shown: this markup is in the server's HTML and is already on
  // screen before any of this code runs. The only question left is when to
  // take it away.
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const [impatient, setImpatient] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const shownAt = useRef<number>(
    typeof performance === "undefined" ? 0 : performance.now(),
  );

  // The same parameters the hero passes, so the frame is painted identically
  // and the handover is invisible.
  const { canvasRef, draw } = useFrameSequence({
    sequence: "house",
    zoom: narrow ? 1.02 : 1.06,
    zoomTo: narrow ? 2.1 : 1.34,
    anchorY: narrow ? 0.74 : 0.5,
  });

  useEffect(() => {
    const wide = window.matchMedia("(max-width: 639px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setNarrow(wide.matches);
    sync();
    setReduced(motion.matches);
    wide.addEventListener("change", sync);
    return () => wide.removeEventListener("change", sync);
  }, []);

  // Reduced motion gets the finished house, because that is the frame the hero
  // paints for them too. Showing the exploded one would promise an assembly
  // they are never going to see.
  useEffect(() => {
    draw(reduced ? 1 : 0);
  }, [draw, reduced, narrow]);

  /**
   * Decide once, on evidence, whether this visit deserves a splash.
   *
   * A return visit answers hundreds of frames out of the cache — no network at
   * all, but several hundred milliseconds of decoding, which is long enough
   * for a naive timer to fire and flash a grey screen at somebody who was
   * promised the opposite. So the guard does not ask "is it done yet"; it asks
   * how far it got. Most of the way in 400ms can only be a cache, and that
   * visitor is shown nothing.
   */
  /**
   * The pre-paint script already decided this visit needs no splash, so take
   * it away without a fade — it was hidden by CSS before anything was drawn
   * and fading it now would only make it briefly visible.
   */
  useEffect(() => {
    if (document.documentElement.dataset.preload === "skip") setGone(true);
  }, []);

  useEffect(() => {
    if (gone) return;
    const id = window.setTimeout(() => setImpatient(true), IMPATIENT_MS);
    return () => window.clearTimeout(id);
  }, [gone]);

  /**
   * Everything is loaded, so tell the cache worker to keep it.
   *
   * Without this the worker misses the entire first visit — it is still
   * registering while the page is already pulling frames, so it controls none
   * of those requests and the cache stays empty until the third visit. Warming
   * now is nearly free: every URL was fetched seconds ago and answers from the
   * HTTP cache.
   */
  useEffect(() => {
    if (!done) return;
    warmFrameCache(frameWidth());
    // Remember that this exact revision finished, so the next visit's inline
    // script can skip the splash before the first paint. Keyed to the
    // revision, so a deploy that changes any frame brings the splash back for
    // exactly as long as the new frames take.
    try {
      window.localStorage.setItem("sl_frames_ready", revision);
    } catch {
      // Private browsing. The splash simply shows again next time.
    }
  }, [done, revision]);

  // Nothing behind the splash should scroll — the hero is 340vh of scroll
  // distance, and a visitor who scrolls while waiting arrives at the far end
  // of an animation they never saw start.
  useEffect(() => {
    if (gone) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [gone]);

  const leave = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(
      () => {
        setGone(true);
        window.scrollTo(0, 0);
      },
      reduced ? 0 : 700,
    );
  };

  useEffect(() => {
    if (!done || gone || leaving) return;
    const shown = performance.now() - shownAt.current;
    const id = window.setTimeout(leave, Math.max(0, MIN_VISIBLE_MS - shown));
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, gone, leaving]);

  if (gone) return null;

  const pct = Math.round(progress * 100);
  const percent = new Intl.NumberFormat(numberLocale[locale], {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(progress);

  return (
    <div
      // Above the nav's z-50. Fixed, so it covers the hero's whole scroll
      // distance rather than only its first screen.
      className={`preload-gate studio fixed inset-0 z-[100] overflow-hidden transition-opacity ease-[cubic-bezier(0.16,1,0.3,1)] ${
        reduced ? "duration-0" : "duration-700"
      } ${leaving ? "opacity-0" : "opacity-100"}`}
      // Deliberately not a live region. The percentage changes many times a
      // second, and a polite live region wrapping it would queue an
      // announcement for every one of them. The ring below is a progressbar
      // instead, which is the role screen readers already know how to report
      // on demand rather than continuously.
      aria-busy={!done}
    >
      {/* The hero's frame, painted by the hero's painter. Full-bleed at every
          size: the paint step continues the frame's own backdrop into whatever
          the 16:9 image does not cover, so there is no seam to hide. */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      />

      {/* The wordmark takes the nav's seat exactly — same inset, same content
          column, same leading-edge alignment, same size and tracking — so the
          crossfade is one wordmark staying put while the bar materialises
          around it. Centring it instead put two wordmarks side by side for the
          length of the fade, which is the sort of thing that only shows up in
          a screenshot taken mid-transition. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 px-4 pt-4 sm:px-6 sm:pt-5">
        <div className="mx-auto flex max-w-6xl items-center px-5 py-2.5 sm:px-6">
          <p className="flex items-center gap-2.5 text-[1.05rem] font-semibold tracking-[-0.02em] text-ink">
            <i
              className="bi bi-house-door-fill text-[1.05rem]"
              aria-hidden="true"
            />
            {dict.brand}
          </p>
        </div>
      </div>

      {/* And the ring takes the scroll cue's seat. */}
      <div
        className={`absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-12 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] sm:pb-14 ${
          leaving ? "opacity-0" : "opacity-100"
        }`}
      >
        <div
          className="relative h-28 w-28"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label={dict.loading.label}
        >
          <svg
            viewBox="0 0 80 80"
            className="h-full w-full -rotate-90"
            aria-hidden="true"
          >
            {/* One hairline weight, twice: the strong hairline for the track,
                full ink for the arc. No second stroke width anywhere. */}
            <circle
              cx="40"
              cy="40"
              r={RING_R}
              fill="none"
              stroke="var(--line-strong)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx="40"
              cy="40"
              r={RING_R}
              fill="none"
              stroke="var(--ink)"
              strokeWidth="1"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              strokeDasharray={RING_C}
              strokeDashoffset={RING_C * (1 - progress)}
              style={
                reduced
                  ? undefined
                  : {
                      transition:
                        "stroke-dashoffset 400ms cubic-bezier(0.16, 1, 0.3, 1)",
                    }
              }
            />
          </svg>

          {/* Title size, not UI size: this number is the one thing the splash
              is actually for, and at 0.92rem inside a 7rem ring it read as a
              caption on an empty circle. */}
          <span
            className="absolute inset-0 flex items-center justify-center text-[1.25rem] font-semibold tabular-nums tracking-[-0.02em] text-ink"
            aria-hidden="true"
          >
            {percent}
          </span>
        </div>

        <p className="mt-4 text-[0.92rem] text-ink-soft">{dict.loading.label}</p>

        {/* Only after the wait has stopped feeling like a wait. A permanent
            skip would invite exactly the half-loaded experience this exists to
            prevent; one that appears at eight seconds is an apology. */}
        <button
          type="button"
          onClick={leave}
          className={`mt-7 rounded-full border border-[var(--line-strong)] px-5 py-2.5 text-[0.92rem] font-medium text-ink transition-[opacity,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[color-mix(in_srgb,var(--ink)_8%,transparent)] ${
            impatient ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          tabIndex={impatient ? 0 : -1}
        >
          {dict.loading.skip}
        </button>
      </div>
    </div>
  );
}

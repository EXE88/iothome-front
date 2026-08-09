"use client";

import { useEffect, useRef, useState } from "react";
import { usePreload } from "@/lib/usePreload";
import { LANDING_SEQUENCES, frameWidth } from "@/lib/useFrameSequence";
import { frameCacheActive, warmFrameCache } from "@/lib/frameCache";
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
 * The landing page scrubs four eighty-frame sequences, and a visitor who
 * starts scrolling before they have decoded watches the page's whole argument
 * stutter. So the page waits, and says how long it will be.
 *
 * The ground is the studio sweep — surface two of the system's two — with a
 * pair of very low-contrast blooms drifting across it. That drift is not
 * decoration: it is what earns the glass panel above it, since this system
 * only permits `backdrop-filter` where something genuinely moves behind.
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

  // Starts shown: this markup is in the server's HTML and is already on screen
  // before any of this code runs. The only question left is when to remove it.
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const [impatient, setImpatient] = useState(false);
  const [reduced, setReduced] = useState(false);
  const shownAt = useRef<number>(
    typeof performance === "undefined" ? 0 : performance.now(),
  );

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  /**
   * The pre-paint script already decided this visit needs no splash, so take
   * it away without a fade — it was hidden by CSS before anything was drawn,
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
    //
    // Only when a worker is actually holding those frames. Without one — plain
    // http, or development — the next load has nothing to skip *to*, and the
    // marker would buy a missing splash at the price of downloading everything
    // again in silence.
    if (!frameCacheActive()) return;
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
      className={`preload-gate studio fixed inset-0 z-[100] flex items-center justify-center overflow-hidden px-6 transition-opacity ease-[cubic-bezier(0.16,1,0.3,1)] ${
        reduced ? "duration-0" : "duration-700"
      } ${leaving ? "opacity-0" : "opacity-100"}`}
      // Deliberately not a live region. The percentage changes many times a
      // second, and a polite live region wrapping it would queue an
      // announcement for every one of them. The ring is a progressbar instead,
      // which is the role screen readers already know how to report on demand
      // rather than continuously.
      aria-busy={!done}
    >
      {/* Two very low-contrast blooms drifting across the studio sweep. They
          are the ground, and they are what earns the glass below. */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="preload-bloom-a" />
        <div className="preload-bloom-b" />
      </div>

      <div className="relative flex flex-col items-center">
        {/* The card treatment, unchanged from the product rail: glass at 62%
            white, a light edge rather than a dark one, and the card lift. */}
        <div className="flex flex-col items-center rounded-3xl border border-[var(--glass-line)] bg-[var(--glass)] px-10 py-9 shadow-[0_1px_2px_rgba(10,10,10,0.05),0_24px_48px_-24px_rgba(10,10,10,0.35)] backdrop-blur-xl backdrop-saturate-150 sm:px-14 sm:py-11">
          <p className="flex items-center gap-2.5 text-[1.05rem] font-semibold tracking-[-0.02em] text-ink">
            <i
              className="bi bi-house-door-fill text-[1.05rem]"
              aria-hidden="true"
            />
            {dict.brand}
          </p>

          <div
            className="relative mt-8 h-28 w-28"
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
                          "stroke-dashoffset 160ms cubic-bezier(0.16, 1, 0.3, 1)",
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

          <p className="mt-6 text-[0.92rem] text-ink-soft">
            {dict.loading.label}
          </p>
        </div>

        {/* Outside the panel and only after the wait has stopped feeling like
            a wait. A permanent skip would invite exactly the half-loaded
            experience this exists to prevent; one that appears at eight
            seconds is an apology. */}
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

"use client";

import { useEffect, useRef, useState } from "react";
import { syncFrameCache } from "./frameCache";
import { FRAME_COUNT, frameSrc, frameWidth } from "./useFrameSequence";

/**
 * Warms every frame the landing page will scrub, and reports how far along it
 * is.
 *
 * The page's whole argument is a render assembling under the scroll, and a
 * visitor who starts scrolling before the frames have decoded sees the
 * argument stutter — which is worse than not making it. So the page waits for
 * all of it, not just the hero: the device trio is three more sequences and a
 * fast scroller reaches them within a second or two.
 *
 * Nothing here fetches anything the canvas would not fetch anyway. These are
 * ordinary `new Image()` requests against the same URLs the sequence hook asks
 * for, so by the time a canvas mounts, its images resolve out of the cache —
 * the service worker's on a return visit, the browser's otherwise. That is
 * also why `frameWidth()` is shared: warm the 1280 set while the canvas asks
 * for 640 and the progress bar is measuring bytes nobody is waiting on.
 */

export type PreloadState = {
  /** 0 → 1 across every frame of every sequence. */
  progress: number;
  /** True once everything has arrived, or once the ceiling gave up waiting. */
  done: boolean;
  /** Frames settled so far, and the total being waited on. */
  arrived: number;
  total: number;
  /**
   * True once the frames have actually been requested.
   *
   * Mounting is not the same moment: the cache worker gets to reconcile
   * first, and on a return visit that is a few hundred milliseconds of doing
   * nothing. Anything timing "how fast is this loading" has to start counting
   * from here, or it measures the wait for the worker and concludes the
   * network is slow.
   */
  started: boolean;
};

/**
 * @param sequences every sequence the page scrubs.
 * @param ceilingMs reveal regardless after this long. A request that never
 *   settles — a proxy that accepts the connection and then holds it open —
 *   would otherwise trap the visitor on the splash forever, and a page that
 *   loads badly is much better than a page that never appears at all.
 */
export function usePreload(
  sequences: readonly string[],
  ceilingMs = 25000,
): PreloadState {
  const total = sequences.length * FRAME_COUNT;
  const [progress, setProgress] = useState(0);
  const [arrived, setArrived] = useState(0);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (sequences.length === 0) return;

    // No "have I already run?" ref here, and that is deliberate.
    //
    // There used to be one, and under StrictMode — which `next dev` turns on —
    // it deadlocked the whole preloader: the first run set the flag and kicked
    // off the work, the cleanup cancelled it, and the second run saw the flag
    // and did nothing at all. The frames were never requested and the
    // percentage sat at zero forever, while the splash's own canvas quietly
    // loaded the hero sequence and made it look like something was happening.
    //
    // Cancellation is what the cleanup is for. Letting the effect re-run
    // normally is correct in both modes; the browser coalesces the duplicate
    // image requests.
    let cancelled = false;
    const width = frameWidth();
    const images: HTMLImageElement[] = [];
    let settled = 0;
    let raf: number | null = null;
    let ceiling: number | undefined;

    const publish = () => {
      raf = null;
      if (cancelled) return;
      setArrived(settled);
      setProgress(Math.min(settled / total, 1));
      if (settled >= total) setDone(true);
    };

    /** Arrivals come in bursts; one repaint per animation frame is plenty. */
    const schedule = () => {
      if (raf !== null || cancelled) return;
      raf = requestAnimationFrame(publish);
    };

    const request = () => {
      for (const sequence of sequences) {
        // Downward, so frame 080 — the one the hero opens on and the one the
        // splash is painting — is requested first and lands first.
        for (let i = FRAME_COUNT; i >= 1; i--) {
          const img = new Image();
          img.decoding = "async";
          // An error still counts. A missing frame is a gap in an animation,
          // not a reason to hold the whole page hostage.
          const settle = () => {
            settled += 1;
            schedule();
          };
          img.onload = settle;
          img.onerror = settle;
          img.src = frameSrc(sequence, width, i);
          images.push(img);
        }
      }
    };

    // Let the cache worker finish reconciling first. Requesting frames while
    // it is still deciding which of them are stale means being handed the
    // stale ones, and the corrected frame not arriving until a later visit.
    // Resolves immediately when there is no worker.
    syncFrameCache().then(() => {
      if (cancelled) return;
      request();
      setStarted(true);
    });

    ceiling = window.setTimeout(() => {
      if (!cancelled) setDone(true);
    }, ceilingMs);

    return () => {
      cancelled = true;
      window.clearTimeout(ceiling);
      if (raf !== null) cancelAnimationFrame(raf);
      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [sequences, total, ceilingMs]);

  return { progress, done, arrived, total, started };
}

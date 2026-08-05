"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const FRAME_COUNT = 80;

/** Frame 080 is fully exploded and 001 is the finished object, so scrubbing
 *  down the numbers assembles it. `progress` 0 → 1 means "assemble". */
export function frameSrc(sequence: string, width: 1280 | 640, index: number) {
  return `/seq/${sequence}/${width}/${String(index).padStart(3, "0")}.webp`;
}

type Options = {
  sequence: string;
  /** Hold off until the section is worth paying for; the hero passes true. */
  enabled?: boolean;
  /**
   * How much of the frame's own background to trade away for a bigger
   * subject. 1 fits the whole 16:9 frame inside the box; above that it crops
   * into the backdrop, which is safe because the same backdrop continues in
   * CSS behind the canvas.
   */
  zoom?: number;
  /**
   * Zoom at the end of the scrub, if the camera should push in as the object
   * assembles. A single fixed zoom has to serve both ends of the sequence,
   * and they need opposite things: the exploded frame is at its widest and
   * must not be cropped, while the finished object is small and centred and
   * wants filling the frame.
   */
  zoomTo?: number;
  /**
   * Where the subject sits vertically, 0 top to 1 bottom. A phone puts the
   * copy above the render and wants the house low; a desktop centres it.
   */
  anchorY?: number;
};

/**
 * Loads one image sequence and paints it into a canvas at a given progress.
 *
 * The frames are decoded once into an array and then only drawn, because
 * decoding inside the scroll handler is what makes these sequences stutter.
 * Drawing is coalesced onto a single animation frame for the same reason.
 */
export function useFrameSequence({
  sequence,
  enabled = true,
  zoom = 1,
  zoomTo,
  anchorY = 0.5,
}: Options) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const pendingRef = useRef<number | null>(null);
  const zoomRef = useRef(zoom);
  const rafRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    // A phone never needs the 1280px set; picking here rather than in CSS
    // keeps the wrong set from being fetched at all.
    const width: 1280 | 640 =
      typeof window !== "undefined" && window.innerWidth < 768 ? 640 : 1280;

    const images: HTMLImageElement[] = [];
    let done = 0;

    const settle = () => {
      if (cancelled) return;
      done += 1;
      // Reporting all 80 arrivals would re-render this component 80 times per
      // sequence for no visible gain; every eighth is enough to keep an
      // already-painted canvas current while the rest streams in.
      if (done === 1 || done === FRAME_COUNT || done % 8 === 0) setLoaded(done);
      // Frame 80 is what the section opens on, so it goes live as soon as
      // that one lands rather than waiting for the tail.
      if (done === 1 || done === FRAME_COUNT) setReady(true);
    };

    for (let i = FRAME_COUNT; i >= 1; i--) {
      const img = new Image();
      img.decoding = "async";
      img.src = frameSrc(sequence, width, i);
      img.onload = settle;
      img.onerror = settle;
      images[i - 1] = img;
    }
    framesRef.current = images;

    return () => {
      cancelled = true;
      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
      framesRef.current = [];
    };
  }, [sequence, enabled]);

  const paint = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img = framesRef.current[index - 1];
    if (!canvas || !img || !img.naturalWidth) return;

    // Transparent, so the letterbox that `contain` leaves is filled by the
    // CSS studio sweep behind the canvas rather than by a flat grey that
    // would draw its own horizon line across the section.
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    if (
      canvas.width !== Math.round(w * dpr) ||
      canvas.height !== Math.round(h * dpr)
    ) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }

    // Contain, not cover. These frames are 16:9 with the subject spanning
    // nearly the full width, so covering a portrait or 16:10 box throws the
    // subject off both edges. The letterbox that contain leaves is invisible
    // because the CSS studio ground behind the canvas is the same sweep.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale =
      Math.min(
        canvas.width / img.naturalWidth,
        canvas.height / img.naturalHeight,
      ) * zoomRef.current;
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = (canvas.width - dw) / 2;
    const dy = (canvas.height - dh) * anchorY;

    // Whatever the box leaves over is filled by stretching the frame's own
    // outermost pixel rows and columns outward. The backdrop in these renders
    // is a smooth studio sweep, so continuing it this way is exact — which no
    // CSS gradient behind the canvas could ever be, and a mismatch there reads
    // as a hard horizon line across the section.
    const sw = img.naturalWidth;
    const sh = img.naturalHeight;
    const edge = 2;

    const bottomGap = canvas.height - (dy + dh);
    const hasTop = dy > 0.5;
    const hasBottom = bottomGap > 0.5;
    const hasSides = dx > 0.5;

    if (hasTop) ctx.drawImage(img, 0, 0, sw, edge, dx, 0, dw, dy + 1);
    if (hasBottom) {
      ctx.drawImage(img, 0, sh - edge, sw, edge, dx, dy + dh - 1, dw, bottomGap + 1);
    }
    if (hasSides) {
      ctx.drawImage(img, 0, 0, edge, sh, 0, dy, dx + 1, dh);
      ctx.drawImage(img, sw - edge, 0, edge, sh, dx + dw - 1, dy, dx + 1, dh);
    }
    // Corners, so the stretched bands meet without leaving a notch.
    if (hasSides && hasTop) {
      ctx.drawImage(img, 0, 0, edge, edge, 0, 0, dx + 1, dy + 1);
      ctx.drawImage(img, sw - edge, 0, edge, edge, dx + dw - 1, 0, dx + 1, dy + 1);
    }
    if (hasSides && hasBottom) {
      const y = dy + dh - 1;
      ctx.drawImage(img, 0, sh - edge, edge, edge, 0, y, dx + 1, bottomGap + 1);
      ctx.drawImage(img, sw - edge, sh - edge, edge, edge, dx + dw - 1, y, dx + 1, bottomGap + 1);
    }

    ctx.drawImage(img, dx, dy, dw, dh);
  }, [anchorY]);

  /** progress 0 → 1 walks frame 80 → 1. */
  const draw = useCallback(
    (progress: number) => {
      const clamped = Math.min(Math.max(progress, 0), 1);
      const index = Math.round(FRAME_COUNT - clamped * (FRAME_COUNT - 1));
      pendingRef.current = index;
      zoomRef.current =
        zoomTo === undefined ? zoom : zoom + (zoomTo - zoom) * clamped;
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (pendingRef.current !== null) paint(pendingRef.current);
      });
    },
    [paint, zoom, zoomTo],
  );

  useEffect(() => {
    const onResize = () => {
      if (pendingRef.current !== null) paint(pendingRef.current);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [paint]);

  // Frames arrive after the first draw call, and `paint` silently gives up on
  // an image that has not decoded yet. Repainting on every batch of arrivals
  // is what stops a reduced-motion visitor — who gets exactly one draw call,
  // before anything has loaded — from staring at an empty canvas.
  useEffect(() => {
    if (!loaded) return;
    if (pendingRef.current === null) {
      draw(0);
      return;
    }
    paint(pendingRef.current);
  }, [loaded, draw, paint]);

  return { canvasRef, draw, ready, loaded };
}

"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useFrameSequence } from "@/lib/useFrameSequence";
import type { Dictionary, Locale } from "@/lib/i18n";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  dict: Dictionary;
  locale: Locale;
};

/**
 * The thesis viewport: a house builds itself out of its own parts as you
 * scroll. The copy does not describe the mechanism, the render performs it,
 * and the headline only names what the visitor is already watching.
 */
export default function Hero({ dict, locale }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const sync = () => setNarrow(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const { canvasRef, draw, ready } = useFrameSequence({
    sequence: "house",
    // The camera pushes in as the house comes together: it opens wide enough
    // to show every floating part, and closes tight on the finished house,
    // which is small and centred. A phone needs the most of this, because a
    // 16:9 frame in a portrait viewport starts out tiny.
    zoom: narrow ? 1.02 : 1.06,
    zoomTo: narrow ? 2.1 : 1.34,
    anchorY: narrow ? 0.74 : 0.5,
  });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw(1); // the finished house, no scrubbing
      return;
    }

    const ctx = gsap.context(() => {
      const state = { progress: 0 };

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          state.progress = self.progress;
          draw(self.progress);
        },
      });

      // The copy holds the opening viewport, then clears out before the house
      // finishes so the last frames are seen unobstructed.
      gsap.to(copyRef.current, {
        opacity: 0,
        y: -40,
        filter: "blur(10px)",
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "35% top",
          scrub: true,
        },
      });

      gsap.to(scrimRef.current, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "30% top",
          scrub: true,
        },
      });

      gsap.to(cueRef.current, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "12% top",
          scrub: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, [draw]);

  useEffect(() => {
    if (ready) ScrollTrigger.refresh();
  }, [ready]);

  return (
    // 340vh of scroll distance is what gives 80 frames room to read as motion
    // rather than as a slideshow.
    <div ref={sectionRef} className="relative h-[340vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden studio">
        {/* Full-bleed at every size: the paint step continues the frame's own
            backdrop into whatever the 16:9 image does not cover, so there is
            no seam to hide and no CSS gradient to match. */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        />

        {/* The frames are decoration; the sentence they illustrate is the
            accessible content. */}
        <span className="sr-only">{dict.hero.lead}</span>

        {/* Legibility, not decoration: at the start of the scrub the house is
            fully exploded and spans the whole frame, directly under the copy.
            The wash lifts the text off it, and leaves when the copy does. */}
        <div
          ref={scrimRef}
          className="hero-scrim pointer-events-none absolute inset-0 z-[5]"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col px-6 pt-28 sm:justify-center sm:px-10 sm:pt-0">
          <div ref={copyRef} className="max-w-[38rem]">
            <h1 className="text-balance text-[clamp(2.6rem,7vw,5.25rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
              {dict.hero.title}
            </h1>
            {/* Near-black, not the usual soft grey: this paragraph sits on a
                photographed wall whose value shifts as the house assembles,
                and grey-on-grey is where the contrast floor breaks. */}
            <p className="mt-7 max-w-[34rem] text-[clamp(1.02rem,1.5vw,1.2rem)] leading-relaxed text-ink">
              {dict.hero.lead}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href={`/${locale}/signup`}
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-[0.95rem] font-medium text-paper transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5"
              >
                {dict.hero.cta}
                <i
                  className="bi bi-arrow-right text-[0.9em] transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                  aria-hidden="true"
                />
              </a>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] px-7 py-3.5 text-[0.95rem] font-medium text-ink transition-colors duration-300 hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]"
              >
                {dict.hero.secondary}
              </a>
            </div>
          </div>
        </div>

        <div
          ref={cueRef}
          className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-2 text-[0.72rem] uppercase tracking-[0.22em] text-ink-soft"
        >
          <span>{dict.hero.scroll}</span>
          <i className="bi bi-chevron-down cue-drift text-sm" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

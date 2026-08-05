"use client";

import Image from "next/image";
import { useRef } from "react";
import Reveal from "./Reveal";
import type { Dictionary, Locale } from "@/lib/i18n";

const CARDS = [
  { key: "thermometer", sequence: "termometer" },
  { key: "lamp", sequence: "lamp" },
  { key: "camera", sequence: "camera" },
] as const;

/**
 * The finished renders, on the studio ground they were shot on, under glass.
 * This is the one place glass earns itself twice over: the cards sit on a live
 * grey sweep, and the product image inside each one shares that exact ground,
 * so the card reads as a pane laid over the scene rather than a box drawn on
 * top of it.
 *
 * No prices: none exist yet, and inventing one would be inventing a claim.
 */
export default function ProductRail({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const railRef = useRef<HTMLDivElement>(null);

  /** `next` means "further along the reading order", which is leftwards in
   *  Persian. scrollBy works in physical pixels, so the sign has to flip. */
  const nudge = (step: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector("article");
    const distance = card ? card.clientWidth + 20 : rail.clientWidth * 0.8;
    const rtl = getComputedStyle(rail).direction === "rtl";
    rail.scrollBy({ left: distance * step * (rtl ? -1 : 1), behavior: "smooth" });
  };

  return (
    <section
      id="products"
      className="relative overflow-hidden studio py-28 sm:py-36"
      aria-labelledby="products-title"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <h2
              id="products-title"
              className="text-balance text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.03] tracking-[-0.035em]"
            >
              {dict.products.title}
            </h2>
            <p className="mt-3 text-[1rem] leading-relaxed text-ink-soft">
              {dict.products.lead}
            </p>
            <p className="mt-4 flex items-start gap-2.5 text-[0.92rem] leading-relaxed text-ink">
              <i
                className="bi bi-check2 mt-0.5 shrink-0 text-base"
                aria-hidden="true"
              />
              {dict.products.common}
            </p>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => nudge(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line-strong)] text-ink transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--ink)_8%,transparent)]"
              aria-label={dict.products.prev}
            >
              <i className="bi bi-arrow-left rtl:rotate-180" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => nudge(1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line-strong)] text-ink transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--ink)_8%,transparent)]"
              aria-label={dict.products.next}
            >
              <i className="bi bi-arrow-right rtl:rotate-180" aria-hidden="true" />
            </button>
          </div>
        </Reveal>
      </div>

      <div
        ref={railRef}
        className="rail mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-6 pb-4 sm:px-10"
      >
        {/* Keeps the first card aligned to the content column on wide screens
            while the rail itself still runs to the edge. */}
        <div className="hidden shrink-0 lg:block lg:w-[max(0px,calc((100vw-72rem)/2))]" />

        {CARDS.map(({ key, sequence }, index) => {
          const copy = dict.devices[key];
          const facts = dict.products.cards[key];
          const labels = dict.products.labels;
          const rows = [
            [labels.panel, facts.panel],
            [labels.behaviour, facts.behaviour],
          ];
          return (
            <Reveal
              key={key}
              as="article"
              delay={index * 0.08}
              className="w-[78vw] shrink-0 snap-start sm:w-[22rem]"
            >
              <a
                href={`/${locale}/signup`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--glass-line)] bg-[var(--glass)] shadow-[0_1px_2px_rgba(10,10,10,0.05),0_24px_48px_-24px_rgba(10,10,10,0.35)] backdrop-blur-xl backdrop-saturate-150 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5"
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  <Image
                    src={`/seq/${sequence}/640/001.webp`}
                    alt={copy.name}
                    fill
                    sizes="(max-width: 640px) 78vw, 22rem"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-[1.25rem] font-semibold tracking-[-0.02em]">
                    {copy.name}
                  </h3>

                  {/* Ownership facts, not a second description: what the buyer
                      does, what it joins, what shows up in their panel. The
                      section above already said what each device is. */}
                  <dl className="mt-4 flex-1 border-t border-[var(--line)]">
                    {rows.map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] py-2.5"
                      >
                        <dt className="text-[0.82rem] text-ink-faint">{label}</dt>
                        <dd className="text-end text-[0.88rem] font-medium text-ink">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <span className="mt-6 inline-flex items-center gap-2 text-[0.92rem] font-medium text-ink">
                    {dict.products.cta}
                    <i
                      className="bi bi-arrow-right text-[0.9em] transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </a>
            </Reveal>
          );
        })}

        <div className="w-2 shrink-0 sm:w-6" />
      </div>

      <p className="mx-auto mt-2 max-w-6xl px-6 text-[0.85rem] text-ink-faint sm:hidden sm:px-10">
        {dict.products.hint}
      </p>
    </section>
  );
}

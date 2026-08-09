"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import Reveal from "./Reveal";
import { formatPrice } from "@/lib/format";
import { copyFor, imageFor, type Product } from "@/lib/products";
import type { Dictionary, Locale } from "@/lib/i18n";

/**
 * The finished renders, on the studio ground they were shot on, under glass.
 * This is the one place glass earns itself twice over: the cards sit on a live
 * grey sweep, and the product image inside each one shares that exact ground,
 * so the card reads as a pane laid over the scene rather than a box drawn on
 * top of it.
 *
 * The cards are the catalogue, fetched on the server by the page above and
 * handed down — not a hardcoded list of three. Adding a product in the admin
 * puts it here, with its real price and its real stock, and a product that is
 * withdrawn leaves. The card links into the shop, because the landing page is
 * a showcase and buying happens somewhere built for it.
 */
export default function ProductRail({
  products,
  dict,
  locale,
}: {
  products: Product[];
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
              {dict.shop.title}
            </h2>
            <p className="mt-3 text-[1rem] leading-relaxed text-ink-soft">
              {dict.shop.lead}
            </p>
            <p className="mt-4 flex items-start gap-2.5 text-[0.92rem] leading-relaxed text-ink">
              <i
                className="bi bi-check2 mt-0.5 shrink-0 text-base"
                aria-hidden="true"
              />
              {dict.products.common}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/shop`}
              className="hidden rounded-full border border-[var(--line-strong)] px-5 py-2.5 text-[0.92rem] font-medium text-ink transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--ink)_8%,transparent)] sm:inline-block"
            >
              {dict.nav.shop}
            </Link>
            <button
              type="button"
              hidden={products.length === 0}
              onClick={() => nudge(-1)}
              className="hidden h-11 w-11 items-center justify-center rounded-full border border-[var(--line-strong)] text-ink transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--ink)_8%,transparent)] sm:flex"
              aria-label={dict.products.prev}
            >
              <i className="bi bi-arrow-left rtl:rotate-180" aria-hidden="true" />
            </button>
            <button
              type="button"
              hidden={products.length === 0}
              onClick={() => nudge(1)}
              className="hidden h-11 w-11 items-center justify-center rounded-full border border-[var(--line-strong)] text-ink transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--ink)_8%,transparent)] sm:flex"
              aria-label={dict.products.next}
            >
              <i className="bi bi-arrow-right rtl:rotate-180" aria-hidden="true" />
            </button>
          </div>
        </Reveal>
      </div>

      {/* An empty catalogue used to return null here, which deleted the whole
          section and left a gap in the page with nothing to explain it — the
          backend being unreachable looked identical to a layout bug. The
          section now keeps its place and its route; only the cards are
          missing, which is the honest description of what happened. */}
      {products.length === 0 ? (
        <div className="mx-auto mt-12 max-w-6xl px-6 sm:px-10">
          <Link
            href={`/${locale}/shop`}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] px-6 py-3 text-[0.92rem] font-medium text-ink transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--ink)_8%,transparent)]"
          >
            {dict.nav.shop}
            <i className="bi bi-arrow-right rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>
      ) : (
      <div
        ref={railRef}
        className="rail mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-6 pb-4 sm:px-10"
      >
        {/* Keeps the first card aligned to the content column on wide screens
            while the rail itself still runs to the edge. */}
        <div className="hidden shrink-0 lg:block lg:w-[max(0px,calc((100vw-72rem)/2))]" />

        {products.map((product, index) => {
          const image = imageFor(product);
          const copy = copyFor(product, locale);
          return (
            <Reveal
              key={product.id}
              as="article"
              delay={index * 0.08}
              className="w-[78vw] shrink-0 snap-start sm:w-[22rem]"
            >
              <Link
                href={`/${locale}/shop/${product.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--glass-line)] bg-[var(--glass)] shadow-[0_1px_2px_rgba(10,10,10,0.05),0_24px_48px_-24px_rgba(10,10,10,0.35)] backdrop-blur-xl backdrop-saturate-150 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5"
              >
                {image && (
                  <div className="relative aspect-4/3 overflow-hidden">
                    <Image
                      src={image}
                      alt={copy.name}
                      fill
                      sizes="(max-width: 640px) 78vw, 22rem"
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                    />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-6">
                  <h3
                    className="text-[1.25rem] font-semibold tracking-[-0.02em]"
                    dir="auto"
                  >
                    {copy.name}
                  </h3>
                  <p
                    className="mt-2 line-clamp-2 text-[0.92rem] leading-relaxed text-ink-soft"
                    dir="auto"
                  >
                    {copy.description}
                  </p>

                  <div className="mt-auto flex items-baseline justify-between gap-4 border-t border-[var(--line)] pt-4">
                    <p className="text-[1.05rem] font-semibold tabular-nums tracking-[-0.02em]">
                      {formatPrice(product.price, locale)}
                      <span className="ms-1.5 text-[0.8rem] font-normal text-ink-faint">
                        {dict.shop.currency}
                      </span>
                    </p>
                    <span className="inline-flex items-center gap-2 text-[0.92rem] font-medium text-ink">
                      {dict.shop.details}
                      <i
                        className="bi bi-arrow-right text-[0.9em] transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          );
        })}

        <div className="w-2 shrink-0 sm:w-6" />
      </div>
      )}

      {products.length > 0 && (
        <p className="mx-auto mt-2 max-w-6xl px-6 text-[0.85rem] text-ink-faint sm:hidden sm:px-10">
          {dict.products.hint}
        </p>
      )}
    </section>
  );
}

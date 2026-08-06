import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { formatPrice } from "@/lib/format";
import { copyFor, imageFor, type Product } from "@/lib/products";
import type { Dictionary, Locale } from "@/lib/i18n";

/**
 * One listing.
 *
 * Same treatment as the landing page's rail card — glass over the studio
 * sweep, render bleeding to the top edge at 4:3 — because it is the same
 * object and a second card style would make the shop a different product.
 *
 * The one addition is the price, which the rail does not carry. It comes from
 * the catalogue, so it is whatever the backend says today and never a figure
 * written into the page.
 */
export default function ProductCard({
  product,
  dict,
  locale,
  delay = 0,
}: {
  product: Product;
  dict: Dictionary;
  locale: Locale;
  delay?: number;
}) {
  const image = imageFor(product);
  const copy = copyFor(product, locale);

  return (
    <Reveal as="article" delay={delay} className="h-full">
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
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22rem"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            />
          </div>
        )}

        <div className="flex flex-1 flex-col p-6">
          <h3 className="text-[1.25rem] font-semibold tracking-[-0.02em]" dir="auto">
            {copy.name}
          </h3>
          <p
            className="mt-2 line-clamp-2 text-[0.92rem] leading-relaxed text-ink-soft"
            dir="auto"
          >
            {copy.description}
          </p>

          {/* `mt-auto` so the price rules line up across the row even when one
              description wraps to a second line. */}
          <div className="mt-auto flex items-end justify-between gap-4 border-t border-[var(--line)] pt-4 [margin-block-start:auto]">
            <p className="text-[1.1rem] font-semibold tabular-nums tracking-[-0.02em]">
              {formatPrice(product.price, locale)}
              <span className="ms-1.5 text-[0.82rem] font-normal text-ink-faint">
                {dict.shop.currency}
              </span>
            </p>
            {/* Availability is said in ink, not in colour: there is no accent
                in this system and a green pill would be the first hue on the
                page. */}
            <p className="text-[0.82rem] text-ink-faint">
              {product.is_available ? dict.shop.inStock : dict.shop.outOfStock}
            </p>
          </div>

          <span className="mt-4 inline-flex items-center gap-2 text-[0.92rem] font-medium text-ink">
            {dict.shop.details}
            <i
              className="bi bi-arrow-right text-[0.9em] transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
              aria-hidden="true"
            />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

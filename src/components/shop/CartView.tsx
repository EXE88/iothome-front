"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resolveLines, MAX_PER_LINE, useCart } from "@/lib/cart";
import { fill, formatPrice, numberLocale } from "@/lib/format";
import { copyFor, imageFor, type Product } from "@/lib/products";
import { useAuth } from "@/lib/auth";
import Button from "@/components/ui/Button";
import type { Dictionary, Locale } from "@/lib/i18n";

/**
 * The basket.
 *
 * The catalogue is handed in from the server, and the stored lines are joined
 * to it on every render — so a basket built last week shows this week's price,
 * and a product that has since been withdrawn simply is not there. The stored
 * line keeps only an id and a quantity for exactly this reason.
 */
export default function CartView({
  products,
  dict,
  locale,
}: {
  products: Product[];
  dict: Dictionary;
  locale: Locale;
}) {
  const router = useRouter();
  const { lines, ready, setQuantity, remove } = useCart();
  const { status } = useAuth();

  const resolved = resolveLines(lines, products);
  const total = resolved.reduce(
    (sum, line) => sum + Number(line.product.price) * line.quantity,
    0,
  );
  const digits = new Intl.NumberFormat(numberLocale[locale]);
  // A line whose quantity was capped by stock since it was added.
  const trimmed = resolved.some((line) => line.quantity < line.requested);

  if (!ready) {
    // localStorage has not been read yet. An empty state here would be a lie
    // for anyone who actually has a basket.
    return (
      <div className="space-y-4" aria-busy="true">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--ink)_3%,transparent)]"
          />
        ))}
      </div>
    );
  }

  if (resolved.length === 0) {
    return (
      <div className="rounded-3xl border border-[var(--line)] px-8 py-16 text-center">
        <i className="bi bi-bag text-[2rem] text-ink-faint" aria-hidden="true" />
        <h2 className="mt-4 text-[1.25rem] font-semibold tracking-[-0.02em]">
          {dict.cart.empty.title}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-[0.95rem] leading-relaxed text-ink-soft">
          {dict.cart.empty.body}
        </p>
        <Link
          href={`/${locale}/shop`}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[0.92rem] font-medium text-paper transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5"
        >
          {dict.cart.empty.cta}
          <i className="bi bi-arrow-right rtl:rotate-180" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-14">
      <div>
        {trimmed && (
          <p role="status" className="mb-5 text-[0.9rem] text-ink-soft">
            {dict.cart.adjusted}
          </p>
        )}

        <ul className="border-t border-[var(--line)]">
          {resolved.map(({ product, quantity }) => {
            const image = imageFor(product);
            const copy = copyFor(product, locale);
            const ceiling = Math.max(1, Math.min(product.stock, MAX_PER_LINE));
            return (
              <li
                key={product.id}
                className="flex gap-5 border-b border-[var(--line)] py-5"
              >
                {image && (
                  <Link
                    href={`/${locale}/shop/${product.slug}`}
                    className="studio relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl"
                  >
                    <Image
                      src={image}
                      alt={copy.name}
                      fill
                      sizes="6rem"
                      className="object-contain"
                    />
                  </Link>
                )}

                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1">
                    <Link
                      href={`/${locale}/shop/${product.slug}`}
                      className="text-[1.05rem] font-semibold tracking-[-0.02em] transition-colors duration-200 hover:text-ink-soft"
                      dir="auto"
                    >
                      {copy.name}
                    </Link>
                    <p className="text-[1rem] font-semibold tabular-nums">
                      {formatPrice(Number(product.price) * quantity, locale)}
                      <span className="ms-1.5 text-[0.8rem] font-normal text-ink-faint">
                        {dict.shop.currency}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                    <div
                      className="flex items-center rounded-full border border-[var(--line-strong)]"
                      role="group"
                      aria-label={`${dict.shop.quantity} — ${copy.name}`}
                    >
                      <button
                        type="button"
                        onClick={() => setQuantity(product.id, quantity - 1)}
                        aria-label="-"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]"
                      >
                        <i className="bi bi-dash-lg text-[0.8rem]" aria-hidden="true" />
                      </button>
                      <span className="min-w-[2rem] text-center text-[0.95rem] font-medium tabular-nums">
                        {digits.format(quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(product.id, quantity + 1)}
                        disabled={quantity >= ceiling}
                        aria-label="+"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] disabled:opacity-40 disabled:hover:bg-transparent"
                      >
                        <i className="bi bi-plus-lg text-[0.8rem]" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="flex items-center gap-5">
                      <span className="text-[0.85rem] text-ink-faint tabular-nums">
                        {formatPrice(product.price, locale)} · {dict.cart.each}
                      </span>
                      <button
                        type="button"
                        onClick={() => remove(product.id)}
                        className="text-[0.85rem] text-ink-soft underline underline-offset-2 transition-colors duration-200 hover:text-ink"
                      >
                        {dict.cart.remove}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <Link
          href={`/${locale}/shop`}
          className="mt-6 inline-flex items-center gap-2 text-[0.92rem] text-ink-soft transition-colors duration-200 hover:text-ink"
        >
          <i className="bi bi-arrow-left rtl:rotate-180" aria-hidden="true" />
          {dict.cart.keepShopping}
        </Link>
      </div>

      <aside className="h-fit rounded-3xl border border-[var(--line)] p-6 lg:sticky lg:top-24">
        <h2 className="text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
          {dict.checkout.summary}
        </h2>
        <p className="mt-4 text-[0.9rem] text-ink-soft">
          {fill(dict.cart.count, { count: digits.format(resolved.length) })}
        </p>
        <div className="mt-4 flex items-baseline justify-between border-t border-[var(--line)] pt-4">
          <span className="text-[0.95rem] text-ink-soft">{dict.cart.total}</span>
          <span className="text-[1.3rem] font-semibold tabular-nums tracking-[-0.02em]">
            {formatPrice(total, locale)}
            <span className="ms-1.5 text-[0.8rem] font-normal text-ink-faint">
              {dict.shop.currency}
            </span>
          </span>
        </div>

        <Button
          className="mt-6 w-full"
          onClick={() =>
            router.push(
              status === "authenticated"
                ? `/${locale}/checkout`
                : `/${locale}/login?next=/${locale}/checkout`,
            )
          }
        >
          {status === "authenticated"
            ? dict.cart.continue
            : dict.cart.loginFirst}
          <i className="bi bi-arrow-right rtl:rotate-180" aria-hidden="true" />
        </Button>
      </aside>
    </div>
  );
}

"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { MAX_PER_LINE, useCart } from "@/lib/cart";
import { numberLocale } from "@/lib/format";
import type { Product } from "@/lib/products";
import type { Dictionary, Locale } from "@/lib/i18n";

/**
 * Quantity stepper plus the button that puts a line in the basket.
 *
 * The ceiling is the smaller of what is on the shelf and the backend's own
 * per-line limit, so the basket can never hold a quantity that checkout would
 * refuse — the buyer finds out here, not after filling in a shipping form.
 */
export default function AddToCart({
  product,
  dict,
  locale,
}: {
  product: Product;
  dict: Dictionary;
  locale: Locale;
}) {
  const { add, quantityOf } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const ceiling = Math.max(1, Math.min(product.stock, MAX_PER_LINE));
  const inBasket = quantityOf(product.id);
  const digits = new Intl.NumberFormat(numberLocale[locale]);

  if (!product.is_available) {
    return (
      <p className="rounded-2xl border border-[var(--line)] px-5 py-4 text-[0.95rem] text-ink-faint">
        {dict.shop.outOfStock}
      </p>
    );
  }

  const step = (by: number) =>
    setQuantity((value) => Math.min(Math.max(value + by, 1), ceiling));

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div
        className="flex items-center rounded-full border border-[var(--line-strong)]"
        role="group"
        aria-label={dict.shop.quantity}
      >
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={quantity <= 1}
          aria-label="-"
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <i className="bi bi-dash-lg text-[0.9rem]" aria-hidden="true" />
        </button>
        <span
          className="min-w-[2.5rem] text-center text-[1rem] font-medium tabular-nums"
          aria-live="polite"
        >
          {digits.format(quantity)}
        </span>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={quantity >= ceiling}
          aria-label="+"
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <i className="bi bi-plus-lg text-[0.9rem]" aria-hidden="true" />
        </button>
      </div>

      <Button
        onClick={() => {
          add(product.id, quantity);
          setAdded(true);
        }}
        className="px-7"
      >
        <i className="bi bi-bag" aria-hidden="true" />
        {dict.shop.add}
      </Button>

      {/* Confirmation in place, rather than a toast that leaves: the reason to
          say anything at all is so the buyer knows they can carry on. */}
      {(added || inBasket > 0) && (
        <p className="text-[0.9rem] text-ink-soft" role="status">
          {dict.shop.added}
          {inBasket > 0 && ` · ${digits.format(inBasket)}`}
        </p>
      )}
    </div>
  );
}

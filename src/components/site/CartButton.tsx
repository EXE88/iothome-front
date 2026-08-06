"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { numberLocale } from "@/lib/format";
import type { Dictionary, Locale } from "@/lib/i18n";

/**
 * The basket, with its count.
 *
 * The count is drawn only once localStorage has been read (`ready`): a
 * server-rendered zero that becomes three a moment later is worse than a beat
 * of nothing, because it is briefly wrong rather than briefly absent.
 *
 * The badge is ink on paper, not a coloured pip — there is no accent in this
 * system and a red dot would be the first hue on the page.
 */
export default function CartButton({
  dict,
  locale,
  onDark = false,
}: {
  dict: Dictionary;
  locale: Locale;
  onDark?: boolean;
}) {
  const { count, ready } = useCart();

  return (
    <Link
      href={`/${locale}/cart`}
      aria-label={dict.nav.cart}
      className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 ${
        onDark
          ? "text-paper hover:bg-[color-mix(in_srgb,#ffffff_14%,transparent)]"
          : "text-ink-soft hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] hover:text-ink"
      }`}
    >
      <i className="bi bi-bag text-[1.05rem]" aria-hidden="true" />
      {ready && count > 0 && (
        <span
          className={`absolute -top-1 -end-1 flex min-w-[1.15rem] items-center justify-center rounded-full px-1 py-0.5 text-[0.68rem] font-semibold tabular-nums ${
            onDark ? "bg-paper text-ink" : "bg-ink text-paper"
          }`}
        >
          {new Intl.NumberFormat(numberLocale[locale]).format(count)}
        </span>
      )}
    </Link>
  );
}

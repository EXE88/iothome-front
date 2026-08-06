"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { fill, formatDate, formatPrice, numberLocale } from "@/lib/format";
import { copyFor, type Product } from "@/lib/products";
import type { Dictionary, Locale } from "@/lib/i18n";

type OrderItem = {
  product: Product;
  quantity: number;
  unit_price: string;
  line_total: string;
};

type Payment = {
  id: number;
  amount: string;
  ref_id: string;
  status: string;
  created_at: string;
};

type Order = {
  uid: string;
  items: OrderItem[];
  unit_count: number;
  total_amount: string;
  receiver_name: string;
  shipping_address: string;
  status: string;
  tracking_code: string;
  created_at: string;
  payments: Payment[];
};

/**
 * Order history.
 *
 * Read straight from `/api/purchases/orders/`, which is scoped to the caller
 * by the queryset rather than by a filter the frontend passes — so there is no
 * request this page could make that would show someone else's orders.
 */
export default function OrdersView({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const router = useRouter();
  const { status, apiFetch } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (status === "anonymous") {
      router.replace(`/${locale}/login?next=/${locale}/orders`);
    }
  }, [status, router, locale]);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;

    (async () => {
      try {
        const response = await apiFetch("/api/purchases/orders/");
        if (cancelled) return;
        if (!response.ok) {
          setFailed(true);
          return;
        }
        const data = await response.json();
        setOrders(data.results ?? data);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, apiFetch]);

  const digits = new Intl.NumberFormat(numberLocale[locale]);

  if (status !== "authenticated") {
    return <p className="text-[0.98rem] text-ink-soft">{dict.panel.loading}</p>;
  }

  if (failed) {
    return (
      <p
        role="alert"
        className="rounded-2xl border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_7%,transparent)] px-5 py-4 text-[0.95rem] text-[var(--danger)]"
      >
        {dict.orders.loadFailed}
      </p>
    );
  }

  if (orders === null) {
    return (
      <div className="space-y-5" aria-busy="true">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-3xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--ink)_3%,transparent)]"
          />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-[var(--line)] px-8 py-16 text-center">
        <i className="bi bi-bag text-[2rem] text-ink-faint" aria-hidden="true" />
        <h2 className="mt-4 text-[1.25rem] font-semibold tracking-[-0.02em]">
          {dict.orders.empty.title}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-[0.95rem] leading-relaxed text-ink-soft">
          {dict.orders.empty.body}
        </p>
        <Link
          href={`/${locale}/shop`}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[0.92rem] font-medium text-paper transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5"
        >
          {dict.orders.empty.cta}
          <i className="bi bi-arrow-right rtl:rotate-180" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {orders.map((order) => {
        const succeeded = order.payments.find((p) => p.status === "success");
        return (
          <article
            key={order.uid}
            className="rounded-3xl border border-[var(--line)] p-6 sm:p-7"
          >
            <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 border-b border-[var(--line)] pb-4">
              <div>
                <p className="text-[0.85rem] text-ink-faint">
                  {fill(dict.orders.placed, {
                    when: formatDate(order.created_at, locale),
                  })}
                </p>
                <p className="mt-1 font-mono text-[0.8rem] text-ink-faint" dir="ltr">
                  {order.uid}
                </p>
              </div>
              {/* Status is a word, not a coloured chip: this system has no
                  accent and a status palette would be the first one. */}
              <p className="text-[0.92rem] font-medium text-ink">
                {dict.orders.status[order.status] ?? order.status}
              </p>
            </header>

            <ul className="mt-4">
              {order.items.map((item) => (
                <li
                  key={item.product.id}
                  className="flex items-baseline justify-between gap-4 py-1.5"
                >
                  <span className="text-[0.95rem] text-ink" dir="auto">
                    {copyFor(item.product, locale).name}
                    <span className="text-ink-faint">
                      {" "}
                      × {digits.format(item.quantity)}
                    </span>
                  </span>
                  <span className="shrink-0 text-[0.92rem] tabular-nums text-ink-soft">
                    {formatPrice(item.line_total, locale)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 border-t border-[var(--line)] pt-4 text-[0.9rem]">
              <div className="flex items-baseline justify-between gap-6 py-1">
                <dt className="text-ink-faint">{dict.orders.total}</dt>
                <dd className="font-semibold tabular-nums">
                  {formatPrice(order.total_amount, locale)}
                  <span className="ms-1.5 text-[0.8rem] font-normal text-ink-faint">
                    {dict.shop.currency}
                  </span>
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-6 py-1">
                <dt className="text-ink-faint">{dict.panel.title}</dt>
                <dd className="tabular-nums text-ink-soft">
                  {fill(dict.orders.units, {
                    count: digits.format(order.unit_count),
                  })}
                </dd>
              </div>
              {succeeded?.ref_id && (
                <div className="flex items-baseline justify-between gap-6 py-1">
                  <dt className="text-ink-faint">{dict.orders.refId}</dt>
                  <dd className="tabular-nums text-ink-soft" dir="ltr">
                    {succeeded.ref_id}
                  </dd>
                </div>
              )}
              {order.tracking_code && (
                <div className="flex items-baseline justify-between gap-6 py-1">
                  <dt className="text-ink-faint">{dict.orders.tracking}</dt>
                  <dd className="tabular-nums text-ink-soft" dir="ltr">
                    {order.tracking_code}
                  </dd>
                </div>
              )}
            </dl>
          </article>
        );
      })}
    </div>
  );
}

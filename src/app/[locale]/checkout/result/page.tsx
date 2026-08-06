import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/site/PageShell";
import { getDictionary, isLocale } from "@/lib/i18n";

/**
 * Where Zarinpal's callback lands.
 *
 * The gateway sends the browser to Django, which verifies the transaction and
 * only then redirects here with the outcome in the query string. Nothing on
 * this page decides anything — by the time it renders, the order is already
 * paid or already released, and this is the receipt.
 *
 * FRONTEND_PAYMENT_RESULT_URL in the backend's .env has no locale in it; the
 * bare path is redirected to the reader's own locale by src/proxy.ts on the
 * way in.
 */
export default async function PaymentResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  const query = await searchParams;
  const one = (key: string) => {
    const value = query[key];
    return Array.isArray(value) ? value[0] : (value ?? "");
  };

  const status = one("status");
  const outcome =
    status === "success" ? "success" : status === "canceled" ? "canceled" : "failed";
  const copy = dict.payment[outcome];

  const refId = one("ref_id");
  const orderId = one("order");

  const rows: [string, string][] = [
    ...(orderId ? ([[dict.payment.orderId, orderId]] as [string, string][]) : []),
    ...(refId ? ([[dict.payment.refId, refId]] as [string, string][]) : []),
  ];

  return (
    <PageShell dict={dict} locale={locale}>
      <div className="mx-auto max-w-lg py-8 text-center">
        <i
          className={`bi ${
            outcome === "success" ? "bi-check-circle" : "bi-exclamation-circle"
          } text-[2.5rem] ${
            outcome === "success" ? "text-ink" : "text-[var(--danger)]"
          }`}
          aria-hidden="true"
        />
        <h1 className="mt-5 text-balance text-[clamp(1.6rem,3vw,2.1rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
          {copy.title}
        </h1>
        <p className="mx-auto mt-3 max-w-[46ch] text-[0.98rem] leading-relaxed text-ink-soft">
          {copy.body}
        </p>

        {rows.length > 0 && (
          <dl className="mt-8 border-t border-[var(--line)] text-start">
            {rows.map(([term, value]) => (
              <div
                key={term}
                className="flex items-baseline justify-between gap-6 border-b border-[var(--line)] py-3"
              >
                <dt className="text-[0.85rem] text-ink-faint">{term}</dt>
                <dd className="text-[0.92rem] tabular-nums text-ink" dir="ltr">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          {outcome === "success" ? (
            <>
              <Link
                href={`/${locale}/panel`}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[0.92rem] font-medium text-paper transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5"
              >
                {dict.payment.toPanel}
                <i className="bi bi-arrow-right rtl:rotate-180" aria-hidden="true" />
              </Link>
              <Link
                href={`/${locale}/orders`}
                className="rounded-full border border-[var(--line-strong)] px-6 py-3 text-[0.92rem] font-medium text-ink transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]"
              >
                {dict.payment.toOrders}
              </Link>
            </>
          ) : (
            <>
              <Link
                href={`/${locale}/shop`}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[0.92rem] font-medium text-paper transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5"
              >
                {dict.payment.retry}
                <i className="bi bi-arrow-right rtl:rotate-180" aria-hidden="true" />
              </Link>
              <Link
                href={`/${locale}/orders`}
                className="rounded-full border border-[var(--line-strong)] px-6 py-3 text-[0.92rem] font-medium text-ink transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]"
              >
                {dict.payment.toOrders}
              </Link>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}

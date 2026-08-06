"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import PasswordField from "@/components/ui/PasswordField";
import { ApiError, useAuth } from "@/lib/auth";
import { resolveLines, useCart } from "@/lib/cart";
import { fill, formatPrice, numberLocale } from "@/lib/format";
import { copyFor, type Product } from "@/lib/products";
import type { Dictionary, Locale } from "@/lib/i18n";

/**
 * The order form: the network the devices join, and where they are sent.
 *
 * Both halves are on one page rather than in a wizard. There are seven fields
 * and a buyer who has already chosen what to buy should be able to see the
 * whole remaining commitment at once.
 *
 * On success this hands the browser to Zarinpal. The basket is cleared first:
 * the stock is already reserved against the order at that point, so leaving
 * the lines behind would invite a second order for the same devices when the
 * buyer comes back.
 */
export default function CheckoutForm({
  products,
  dict,
  locale,
}: {
  products: Product[];
  dict: Dictionary;
  locale: Locale;
}) {
  const router = useRouter();
  const { status, user, apiFetch } = useAuth();
  const { lines, ready, clear } = useCart();

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === "anonymous") {
      router.replace(`/${locale}/login?next=/${locale}/checkout`);
    }
  }, [status, router, locale]);

  const resolved = resolveLines(lines, products);
  const total = resolved.reduce(
    (sum, line) => sum + Number(line.product.price) * line.quantity,
    0,
  );
  const digits = new Intl.NumberFormat(numberLocale[locale]);

  if (status !== "authenticated" || !ready) {
    return <p className="text-[0.98rem] text-ink-soft">{dict.panel.loading}</p>;
  }

  if (resolved.length === 0) {
    return (
      <p className="text-[0.98rem] text-ink-soft">
        {dict.checkout.emptyBasket}{" "}
        <Link
          href={`/${locale}/shop`}
          className="underline underline-offset-2 transition-colors hover:text-ink"
        >
          {dict.cart.empty.cta}
        </Link>
      </p>
    );
  }

  // The backend refuses an unverified account at the permission layer; saying
  // so here saves the buyer filling in an address for a 403.
  if (user && !user.is_email_verified) {
    return (
      <div className="rounded-2xl border border-[var(--line)] px-6 py-8">
        <p className="text-[0.98rem] text-ink">{dict.checkout.needsVerified}</p>
        <Link
          href={`/${locale}/verify?email=${encodeURIComponent(user.email)}`}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[0.92rem] font-medium text-paper"
        >
          {dict.auth.login.goVerify}
          <i className="bi bi-arrow-right rtl:rotate-180" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    const form = new FormData(event.currentTarget);
    const payload = {
      items: resolved.map((line) => ({
        product: line.product.id,
        quantity: line.quantity,
      })),
      wifi_ssid: String(form.get("wifi_ssid") ?? ""),
      wifi_password: String(form.get("wifi_password") ?? ""),
      receiver_name: String(form.get("receiver_name") ?? ""),
      receiver_phone: String(form.get("receiver_phone") ?? ""),
      shipping_address: String(form.get("shipping_address") ?? ""),
      postal_code: String(form.get("postal_code") ?? ""),
    };

    try {
      const response = await apiFetch("/api/purchases/checkout/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) throw new ApiError(response.status, data);

      if (!data.payment_url) {
        setFormError(dict.checkout.failed);
        setSubmitting(false);
        return;
      }

      clear();
      // A full navigation, not router.push: the gateway is another origin.
      window.location.href = data.payment_url;
    } catch (error) {
      if (error instanceof ApiError) {
        const named: Record<string, string> = {};
        for (const key of [
          "wifi_ssid",
          "wifi_password",
          "receiver_name",
          "receiver_phone",
          "shipping_address",
          "postal_code",
        ]) {
          const message = error.field(key);
          if (message) named[key] = message;
        }
        setFieldErrors(named);
        setFormError(
          Object.keys(named).length > 0
            ? null
            : (error.formError ?? dict.checkout.failed),
        );
      } else {
        setFormError(dict.auth.offline);
      }
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-14">
      <div>
        <section>
          <h2 className="text-[1.25rem] font-semibold tracking-[-0.02em]">
            {dict.checkout.wifi.title}
          </h2>
          <p className="mt-2 max-w-[52ch] text-[0.92rem] leading-relaxed text-ink-soft">
            {dict.checkout.wifi.note}
          </p>

          <div className="mt-6">
            <Field
              name="wifi_ssid"
              label={dict.checkout.wifi.ssid}
              required
              maxLength={32}
              autoComplete="off"
              spellCheck={false}
              dir="ltr"
              hint={dict.checkout.wifi.ssidHint}
              error={fieldErrors.wifi_ssid}
            />
            <PasswordField
              name="wifi_password"
              label={dict.checkout.wifi.password}
              autoComplete="off"
              dir="ltr"
              showLabel={dict.auth.show}
              hideLabel={dict.auth.hide}
              hint={dict.checkout.wifi.passwordHint}
              error={fieldErrors.wifi_password}
            />
          </div>

          <p className="flex items-start gap-2.5 text-[0.85rem] leading-relaxed text-ink-faint">
            <i className="bi bi-info-circle mt-0.5 shrink-0" aria-hidden="true" />
            {dict.checkout.wifi.band}
          </p>
        </section>

        <section className="mt-12 border-t border-[var(--line)] pt-10">
          <h2 className="text-[1.25rem] font-semibold tracking-[-0.02em]">
            {dict.checkout.shipping.title}
          </h2>

          <div className="mt-6">
            <Field
              name="receiver_name"
              label={dict.checkout.shipping.name}
              required
              maxLength={150}
              autoComplete="name"
              error={fieldErrors.receiver_name}
            />
            <Field
              name="receiver_phone"
              label={dict.checkout.shipping.phone}
              required
              inputMode="tel"
              autoComplete="tel"
              dir="ltr"
              placeholder="09121234567"
              hint={dict.checkout.shipping.phoneHint}
              error={fieldErrors.receiver_phone}
            />

            <div className="mb-5">
              <label
                htmlFor="shipping_address"
                className="block text-[0.92rem] font-medium text-ink"
              >
                {dict.checkout.shipping.address}
              </label>
              <textarea
                id="shipping_address"
                name="shipping_address"
                required
                rows={3}
                maxLength={1000}
                autoComplete="street-address"
                aria-invalid={fieldErrors.shipping_address ? true : undefined}
                className={`mt-2 w-full resize-y rounded-xl border bg-[color-mix(in_srgb,#ffffff_70%,transparent)] px-4 py-3 text-[0.98rem] text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink-faint focus:border-[var(--ink)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--ink)_12%,transparent)] ${
                  fieldErrors.shipping_address
                    ? "border-[var(--danger)]"
                    : "border-[var(--line-strong)]"
                }`}
              />
              <div className="min-h-[1.25rem] pt-1.5">
                {fieldErrors.shipping_address && (
                  <p className="text-[0.85rem] text-[var(--danger)]">
                    {fieldErrors.shipping_address}
                  </p>
                )}
              </div>
            </div>

            <Field
              name="postal_code"
              label={dict.checkout.shipping.postal}
              inputMode="numeric"
              autoComplete="postal-code"
              dir="ltr"
              maxLength={10}
              hint={dict.checkout.shipping.postalHint}
              error={fieldErrors.postal_code}
            />
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-3xl border border-[var(--line)] p-6 lg:sticky lg:top-24">
        <h2 className="text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
          {dict.checkout.summary}
        </h2>

        <ul className="mt-4 border-t border-[var(--line)]">
          {resolved.map(({ product, quantity }) => (
            <li
              key={product.id}
              className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] py-2.5"
            >
              <span className="text-[0.9rem] text-ink" dir="auto">
                {copyFor(product, locale).name}
                <span className="text-ink-faint"> × {digits.format(quantity)}</span>
              </span>
              <span className="shrink-0 text-[0.9rem] tabular-nums text-ink-soft">
                {formatPrice(Number(product.price) * quantity, locale)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-[0.95rem] text-ink-soft">{dict.cart.total}</span>
          <span className="text-[1.3rem] font-semibold tabular-nums tracking-[-0.02em]">
            {formatPrice(total, locale)}
            <span className="ms-1.5 text-[0.8rem] font-normal text-ink-faint">
              {dict.shop.currency}
            </span>
          </span>
        </div>

        <p className="mt-1.5 text-[0.82rem] text-ink-faint">
          {fill(dict.orders.units, {
            count: digits.format(
              resolved.reduce((sum, line) => sum + line.quantity, 0),
            ),
          })}
        </p>

        {formError && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_7%,transparent)] px-4 py-3 text-[0.88rem] text-[var(--danger)]"
          >
            {formError}
          </p>
        )}

        <Button type="submit" loading={submitting} className="mt-6 w-full">
          {submitting ? dict.checkout.submitting : dict.checkout.submit}
        </Button>
      </aside>
    </form>
  );
}

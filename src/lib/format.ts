import type { Locale } from "./i18n";

/**
 * Digits.
 *
 * Persian uses `fa-IR-u-nu-latn` rather than plain `fa-IR`: the panel's sensor
 * readings arrive as Latin numerals and a price in Persian numerals two
 * centimetres away would make one page look like two. The grouping separator
 * still comes out Persian, which is the part that matters for reading a long
 * number aloud.
 */
export const numberLocale: Record<Locale, string> = {
  fa: "fa-IR-u-nu-latn",
  en: "en-US",
};

/** A Toman amount. The backend sends decimals as strings; both are accepted. */
export function formatPrice(value: string | number, locale: Locale) {
  const amount = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat(numberLocale[locale], {
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string, locale: Locale) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(numberLocale[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/** `"{count} left"` with the count filled in. */
export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match,
  );
}

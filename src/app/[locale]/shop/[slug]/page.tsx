import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/components/site/PageShell";
import AddToCart from "@/components/shop/AddToCart";
import { formatPrice, fill } from "@/lib/format";
import {
  commandsOf,
  labelFor,
  readOnlyTelemetryOf,
  iconFor,
} from "@/lib/gadgetTypes";
import { copyFor, fetchGadgetType, fetchProduct, imageFor } from "@/lib/products";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const product = await fetchProduct(slug);
  if (!product) return {};
  const meta = copyFor(product, locale);
  return { title: meta.name, description: meta.description };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  const product = await fetchProduct(slug);
  if (!product) notFound();

  // The capability contract is the honest version of a feature list: it is
  // what the device actually accepts and reports, read from the same rows the
  // panel builds its controls from. Nothing here is written by hand.
  const type = await fetchGadgetType(product.gadget_type);
  const controls = commandsOf(type ?? undefined);
  const readings = readOnlyTelemetryOf(type ?? undefined);
  const overrides = dict.panel.capabilities;
  const image = imageFor(product, 1280);
  const copy = copyFor(product, locale);

  return (
    <PageShell dict={dict} locale={locale} bleed>
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <Link
          href={`/${locale}/shop`}
          className="inline-flex items-center gap-2 text-[0.92rem] text-ink-soft transition-colors duration-200 hover:text-ink"
        >
          <i className="bi bi-arrow-left rtl:rotate-180" aria-hidden="true" />
          {dict.shop.backToShop}
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* The render on its own studio ground, feathered into it, exactly
              as the panels on the landing page are built. */}
          {image && (
            <div className="studio relative aspect-4/3 overflow-hidden rounded-2xl">
              <Image
                src={image}
                alt={copy.name}
                fill
                priority
                sizes="(max-width: 1024px) 92vw, 40rem"
                className="studio-fade object-contain"
              />
            </div>
          )}

          <div>
            <h1
              className="text-balance text-[clamp(1.9rem,3.4vw,2.7rem)] font-semibold leading-[1.05] tracking-[-0.035em]"
              dir="auto"
            >
              {copy.name}
            </h1>
            <p
              className="mt-4 max-w-[46ch] text-[0.98rem] leading-relaxed text-ink-soft"
              dir="auto"
            >
              {copy.description}
            </p>

            <p className="mt-7 text-[1.6rem] font-semibold tabular-nums tracking-[-0.03em]">
              {formatPrice(product.price, locale)}
              <span className="ms-2 text-[0.92rem] font-normal text-ink-faint">
                {dict.shop.currency}
              </span>
            </p>
            <p className="mt-1.5 text-[0.85rem] text-ink-faint">
              {product.is_available
                ? fill(dict.shop.stockLeft, { count: product.stock })
                : dict.shop.outOfStock}
            </p>

            <div className="mt-8">
              <AddToCart product={product} dict={dict} locale={locale} />
            </div>

            <p className="mt-8 flex items-start gap-2.5 border-t border-[var(--line)] pt-6 text-[0.92rem] leading-relaxed text-ink-soft">
              <i
                className="bi bi-check2 mt-0.5 shrink-0 text-base text-ink"
                aria-hidden="true"
              />
              {dict.products.common}
            </p>
          </div>
        </div>

        {/* A hairline-ruled specification list rather than a third card grid:
            the page already has the shop's grid and the landing rail's. */}
        {(controls.length > 0 || readings.length > 0) && (
          <section className="mt-16 border-t border-[var(--line)] pt-12">
            <h2 className="text-[1.25rem] font-semibold tracking-[-0.02em]">
              {dict.shop.inPanel}
            </h2>
            <div className="mt-6 grid gap-x-16 gap-y-10 sm:grid-cols-[repeat(auto-fit,minmax(18rem,1fr))]">
              <SpecList
                title={dict.shop.controls}
                icon={iconFor(product.gadget_type)}
                rows={controls.map((capability) => [
                  labelFor(capability, overrides),
                  capability.unit || describe(capability.value_type, locale),
                ])}
              />
              <SpecList
                title={dict.shop.readings}
                icon="bi-activity"
                rows={readings.map((capability) => [
                  labelFor(capability, overrides),
                  capability.unit || describe(capability.value_type, locale),
                ])}
              />
            </div>
          </section>
        )}
      </div>
    </PageShell>
  );
}

/** Value types in words, for the one column that would otherwise say "bool". */
function describe(valueType: string, locale: Locale) {
  const words: Record<Locale, Record<string, string>> = {
    fa: {
      bool: "روشن / خاموش",
      int: "عدد",
      float: "عدد",
      enum: "چند حالته",
      string: "متن",
    },
    en: {
      bool: "On / off",
      int: "Number",
      float: "Number",
      enum: "Choice",
      string: "Text",
    },
  };
  return words[locale][valueType] ?? valueType;
}

function SpecList({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: string;
  rows: [string, string][];
}) {
  if (rows.length === 0) return null;
  return (
    <div>
      <h3 className="flex items-center gap-2.5 text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
        <i className={`bi ${icon} text-base text-ink`} aria-hidden="true" />
        {title}
      </h3>
      <dl className="mt-4 border-t border-[var(--line)]">
        {rows.map(([term, value]) => (
          <div
            key={term}
            className="flex items-baseline justify-between gap-6 border-b border-[var(--line)] py-3"
          >
            <dt className="text-[0.98rem] text-ink">{term}</dt>
            <dd className="text-end text-[0.92rem] text-ink-faint">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

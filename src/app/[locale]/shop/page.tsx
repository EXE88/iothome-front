import { notFound } from "next/navigation";
import PageShell from "@/components/site/PageShell";
import ProductCard from "@/components/shop/ProductCard";
import Reveal from "@/components/Reveal";
import { fetchProducts } from "@/lib/products";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  // Server-side, uncached: these rows carry stock counts.
  const products = await fetchProducts();

  return (
    <PageShell dict={dict} locale={locale} bleed>
      {/* The studio sweep, because the cards are glass and glass is only
          allowed where something photographed sits behind it. */}
      <section className="studio px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="max-w-xl">
            <h1 className="text-balance text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.03] tracking-[-0.035em]">
              {dict.shop.title}
            </h1>
            <p className="mt-3 text-[1rem] leading-relaxed text-ink">
              {dict.shop.lead}
            </p>
          </Reveal>

          {products === null ? (
            <p
              role="alert"
              className="mt-14 rounded-2xl border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_7%,transparent)] px-5 py-4 text-[0.95rem] text-[var(--danger)]"
            >
              {dict.shop.loadFailed}
            </p>
          ) : products.length === 0 ? (
            <p className="mt-14 text-[0.98rem] text-ink-soft">{dict.shop.empty}</p>
          ) : (
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  dict={dict}
                  locale={locale}
                  delay={index * 0.06}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}

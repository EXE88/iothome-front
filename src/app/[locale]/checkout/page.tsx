import { notFound } from "next/navigation";
import PageShell from "@/components/site/PageShell";
import CheckoutForm from "@/components/shop/CheckoutForm";
import { fetchProducts } from "@/lib/products";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  const products = (await fetchProducts()) ?? [];

  return (
    <PageShell dict={dict} locale={locale}>
      <h1 className="text-[clamp(1.75rem,3.4vw,2.4rem)] font-semibold tracking-[-0.035em]">
        {dict.checkout.title}
      </h1>
      <p className="mb-10 mt-3 max-w-[52ch] text-[0.98rem] leading-relaxed text-ink-soft">
        {dict.checkout.lead}
      </p>
      <CheckoutForm products={products} dict={dict} locale={locale} />
    </PageShell>
  );
}

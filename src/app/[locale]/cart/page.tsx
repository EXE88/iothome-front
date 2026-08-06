import { notFound } from "next/navigation";
import PageShell from "@/components/site/PageShell";
import CartView from "@/components/shop/CartView";
import { fetchProducts } from "@/lib/products";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  // The basket stores ids; the prices and stock come from here, fresh.
  const products = (await fetchProducts()) ?? [];

  return (
    <PageShell dict={dict} locale={locale}>
      <h1 className="mb-10 text-[clamp(1.75rem,3.4vw,2.4rem)] font-semibold tracking-[-0.035em]">
        {dict.cart.title}
      </h1>
      <CartView products={products} dict={dict} locale={locale} />
    </PageShell>
  );
}

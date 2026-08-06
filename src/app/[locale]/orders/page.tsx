import { notFound } from "next/navigation";
import PageShell from "@/components/site/PageShell";
import OrdersView from "@/components/account/OrdersView";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <PageShell dict={dict} locale={locale}>
      <h1 className="mb-10 text-[clamp(1.75rem,3.4vw,2.4rem)] font-semibold tracking-[-0.035em]">
        {dict.orders.title}
      </h1>
      <OrdersView dict={dict} locale={locale} />
    </PageShell>
  );
}

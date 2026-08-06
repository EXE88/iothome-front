import { notFound } from "next/navigation";
import Dashboard from "@/components/panel/Dashboard";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function PanelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return <Dashboard dict={dict} locale={locale} />;
}

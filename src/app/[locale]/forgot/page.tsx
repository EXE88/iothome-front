import { notFound } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import ForgotForm from "@/components/auth/ForgotForm";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function ForgotPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <AuthShell
      dict={dict}
      locale={locale}
      path="/forgot"
      title={dict.auth.forgot.title}
      lead={dict.auth.forgot.lead}
    >
      <ForgotForm dict={dict} locale={locale} />
    </AuthShell>
  );
}

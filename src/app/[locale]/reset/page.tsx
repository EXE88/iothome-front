import { Suspense } from "react";
import { notFound } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import ResetForm from "@/components/auth/ResetForm";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function ResetPage({
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
      path="/reset"
      title={dict.auth.reset.title}
      lead={dict.auth.reset.lead}
    >
      <Suspense>
        <ResetForm dict={dict} locale={locale} />
      </Suspense>
    </AuthShell>
  );
}

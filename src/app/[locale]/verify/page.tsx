import { Suspense } from "react";
import { notFound } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import VerifyForm from "@/components/auth/VerifyForm";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function VerifyPage({
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
      path="/verify"
      title={dict.auth.verify.title}
      lead={dict.auth.verify.lead}
    >
      <Suspense>
        <VerifyForm dict={dict} locale={locale} />
      </Suspense>
    </AuthShell>
  );
}

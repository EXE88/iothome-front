import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function LoginPage({
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
      path="/login"
      title={dict.auth.login.title}
      lead={dict.auth.login.lead}
      footer={
        <Link href={`/${locale}`} className="transition-colors hover:text-ink">
          {dict.auth.backHome}
        </Link>
      }
    >
      <Suspense>
        <LoginForm dict={dict} locale={locale} />
      </Suspense>
    </AuthShell>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import SignupForm from "@/components/auth/SignupForm";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function SignupPage({
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
      path="/signup"
      title={dict.auth.signup.title}
      lead={dict.auth.signup.lead}
      footer={
        <Link href={`/${locale}`} className="transition-colors hover:text-ink">
          {dict.auth.backHome}
        </Link>
      }
    >
      <SignupForm dict={dict} locale={locale} />
    </AuthShell>
  );
}

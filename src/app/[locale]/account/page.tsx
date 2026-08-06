import { notFound } from "next/navigation";
import PageShell from "@/components/site/PageShell";
import ProfileView from "@/components/account/ProfileView";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <PageShell dict={dict} locale={locale}>
      <h1 className="text-[clamp(1.75rem,3.4vw,2.4rem)] font-semibold tracking-[-0.035em]">
        {dict.profile.title}
      </h1>
      <p className="mb-10 mt-3 text-[0.98rem] text-ink-soft">{dict.profile.lead}</p>
      <ProfileView dict={dict} locale={locale} />
    </PageShell>
  );
}

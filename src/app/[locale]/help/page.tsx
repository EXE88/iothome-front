import { notFound } from "next/navigation";
import PageShell from "@/components/site/PageShell";
import Reveal from "@/components/Reveal";
import { getDictionary, isLocale } from "@/lib/i18n";

/**
 * Every answer here is true of the system that exists — including the two that
 * say a thing is not possible yet (changing the Wi-Fi from the panel, and
 * self-service for a failed payment). Promising either would be inventing a
 * feature, and a help page is the worst place to do that.
 */
export default async function HelpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <PageShell dict={dict} locale={locale}>
      <div className="max-w-3xl">
        <h1 className="text-[clamp(1.75rem,3.4vw,2.4rem)] font-semibold tracking-[-0.035em]">
          {dict.help.title}
        </h1>
        <p className="mt-3 text-[0.98rem] text-ink-soft">{dict.help.lead}</p>

        {/* A hairline-ruled list, not an accordion: seven answers that fit on
            one screen do not need to be hidden behind seven clicks. */}
        <dl className="mt-12 border-t border-[var(--line)]">
          {dict.help.items.map((item, index) => (
            <Reveal
              key={item.q}
              delay={index * 0.05}
              className="border-b border-[var(--line)] py-7 sm:grid sm:grid-cols-[18rem_1fr] sm:gap-10"
            >
              <dt className="text-[1.05rem] font-medium leading-snug tracking-[-0.02em] text-ink">
                {item.q}
              </dt>
              <dd className="mt-2 max-w-[52ch] text-[0.95rem] leading-relaxed text-ink-soft sm:mt-0">
                {item.a}
              </dd>
            </Reveal>
          ))}
        </dl>

        <p className="mt-10 text-[0.92rem] text-ink-faint">{dict.help.contact}</p>
      </div>
    </PageShell>
  );
}

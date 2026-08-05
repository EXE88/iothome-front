import Reveal from "./Reveal";
import type { Dictionary, Locale } from "@/lib/i18n";

/** The page's anchor: one decision, stated once, at full size. */
export default function Closing({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    // The nav watches for this so it can invert while it overlaps.
    <section data-surface="dark" className="bg-ink py-32 text-paper sm:py-44">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <Reveal className="max-w-3xl">
          <h2 className="text-balance text-[clamp(2.1rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
            {dict.closing.title}
          </h2>
          <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-[color-mix(in_srgb,#ffffff_66%,transparent)]">
            {dict.closing.lead}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href={`/${locale}/signup`}
              className="group inline-flex items-center gap-2 rounded-full bg-paper px-8 py-4 text-[0.98rem] font-medium text-ink transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5"
            >
              {dict.closing.cta}
              <i
                className="bi bi-arrow-right text-[0.9em] transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                aria-hidden="true"
              />
            </a>
            <a
              href={`/${locale}/login`}
              className="inline-flex items-center rounded-full border border-[color-mix(in_srgb,#ffffff_28%,transparent)] px-8 py-4 text-[0.98rem] font-medium text-paper transition-colors duration-300 hover:bg-[color-mix(in_srgb,#ffffff_10%,transparent)]"
            >
              {dict.closing.login}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

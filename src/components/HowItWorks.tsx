import Reveal from "./Reveal";
import type { Dictionary } from "@/lib/i18n";

/**
 * The real flow, in the order it happens.
 *
 * Set as an editorial sequence rather than a three-up card row: the section
 * before it and the one after are both grids of equal cells, and a third would
 * make the page a stack of identical containers. Here the ordinal does the
 * work an icon would have done, and the last step is the one that matters, so
 * it is the one that gets the emphasis.
 */
export default function HowItWorks({ dict }: { dict: Dictionary }) {
  return (
    <section
      id="how"
      className="relative bg-paper py-28 sm:py-36"
      aria-labelledby="how-title"
    >
      <div className="mx-auto grid max-w-6xl gap-14 px-6 sm:px-10 lg:grid-cols-[22rem_1fr] lg:gap-20">
        <Reveal as="header" className="lg:sticky lg:top-32 lg:self-start">
          <h2
            id="how-title"
            className="text-balance text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.03] tracking-[-0.035em]"
          >
            {dict.how.title}
          </h2>
          <p className="mt-6 flex max-w-sm items-start gap-3 text-[0.95rem] leading-relaxed text-ink-soft">
            <i
              className="bi bi-arrow-repeat mt-0.5 shrink-0 text-lg text-ink"
              aria-hidden="true"
            />
            <span>{dict.how.note}</span>
          </p>
        </Reveal>

        <ol className="flex flex-col">
          {dict.how.steps.map((step, index) => {
            const last = index === dict.how.steps.length - 1;
            return (
              <Reveal
                key={step.title}
                as="li"
                delay={index * 0.08}
                className="grid grid-cols-[2.5rem_1fr] gap-x-5 border-t border-[var(--line)] py-9 last:border-b sm:grid-cols-[4rem_1fr] sm:gap-x-8 sm:py-11"
              >
                <span
                  className={`text-[1.6rem] leading-none tabular-nums sm:text-[2.1rem] ${
                    last ? "font-semibold text-ink" : "font-normal text-ink-faint"
                  }`}
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <div>
                  <h3
                    className={`tracking-[-0.025em] ${
                      last
                        ? "text-[1.5rem] font-semibold sm:text-[1.9rem]"
                        : "text-[1.2rem] font-semibold sm:text-[1.4rem]"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-2.5 max-w-[52ch] text-[0.98rem] leading-relaxed text-ink-soft">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

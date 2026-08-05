import Reveal from "./Reveal";
import type { Dictionary } from "@/lib/i18n";

const ICONS = ["bi-key", "bi-shield-lock", "bi-broadcast", "bi-activity"];

/**
 * Deliberately not a card grid. These are the system's real guarantees, so
 * they are set as a specification list — hairline rows, term on one side,
 * plain explanation on the other — which is how a spec is actually read.
 */
export default function Trust({ dict }: { dict: Dictionary }) {
  return (
    <section className="bg-paper py-28 sm:py-36" aria-labelledby="trust-title">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <Reveal>
          <h2
            id="trust-title"
            className="max-w-2xl text-balance text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.03] tracking-[-0.035em]"
          >
            {dict.trust.title}
          </h2>
        </Reveal>

        <dl className="mt-14 border-t border-[var(--line)]">
          {dict.trust.items.map((item, index) => (
            <Reveal
              key={item.title}
              delay={index * 0.06}
              className="grid gap-3 border-b border-[var(--line)] py-8 md:grid-cols-[1.5rem_18rem_1fr] md:items-baseline md:gap-8 md:py-9"
            >
              <i
                className={`bi ${ICONS[index]} text-xl text-ink`}
                aria-hidden="true"
              />
              <dt className="text-[1.12rem] font-semibold tracking-[-0.02em]">
                {item.title}
              </dt>
              <dd className="max-w-[46ch] text-[0.98rem] leading-relaxed text-ink-soft">
                {item.body}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

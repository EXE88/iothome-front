import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";

/**
 * The frame every auth screen sits in.
 *
 * The ground is the finished house, the same render the landing page assembles
 * — not a CSS gradient imitating the studio sweep it was shot on. The system's
 * one material is photographic, and a gradient standing in for it is the exact
 * substitution the design record forbids. It also settles the glass: the card
 * blurs something real, which is the only condition under which glass is used
 * anywhere on this product.
 */
export default function AuthShell({
  dict,
  locale,
  path,
  title,
  lead,
  children,
  footer,
}: {
  dict: Dictionary;
  locale: Locale;
  /** This screen's path after the locale, so the switch stays on it. */
  path: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const other: Locale = locale === "fa" ? "en" : "fa";

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden studio">
      {/* The finished house, standing on the floor of the viewport. Its alpha
          feather is baked into the file (scripts/build-auth-art.mjs) rather
          than applied as a CSS mask: a mask works on the element box, and with
          object-contain that box is wider than the picture, so the frame's own
          grey background would show as a hard rectangle down both sides. */}
      <img
        src="/art/auth-house.webp"
        alt=""
        aria-hidden="true"
        width={640}
        height={520}
        // Lifted clear of the footer: the render's own shadow is the darkest
        // thing on the page, and the footer link was sitting in it.
        className="pointer-events-none absolute bottom-14 start-1/2 h-auto w-[min(30rem,120%)] -translate-x-1/2 select-none rtl:translate-x-1/2"
      />

      <header className="relative z-10 flex items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2.5 text-[1.05rem] font-semibold tracking-[-0.02em] text-ink"
        >
          <i className="bi bi-house-door-fill" aria-hidden="true" />
          {dict.brand}
        </Link>

        <Link
          href={`/${other}${path}`}
          lang={other}
          hrefLang={other}
          className="rounded-full px-3 py-1.5 text-[0.92rem] font-medium text-ink-soft transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] hover:text-ink"
        >
          {other === "fa" ? "فارسی" : "English"}
        </Link>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[27rem] rounded-3xl border border-[var(--glass-line)] bg-[var(--glass)] p-7 shadow-[0_1px_2px_rgba(10,10,10,0.05),0_24px_48px_-24px_rgba(10,10,10,0.35)] backdrop-blur-xl backdrop-saturate-150 sm:p-9">
          <h1 className="text-balance text-[clamp(1.6rem,4vw,2rem)] font-semibold leading-[1.15] tracking-[-0.03em]">
            {title}
          </h1>
          {lead && (
            <p className="mt-2.5 text-[0.95rem] leading-relaxed text-ink-soft">
              {lead}
            </p>
          )}
          <div className="mt-7">{children}</div>
        </div>
      </div>

      {footer && (
        <footer className="relative z-10 px-6 pb-8 text-center text-[0.92rem] text-ink-soft sm:px-10">
          {footer}
        </footer>
      )}
    </main>
  );
}

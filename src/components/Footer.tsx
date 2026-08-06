import type { Dictionary, Locale } from "@/lib/i18n";

export default function Footer({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const other: Locale = locale === "fa" ? "en" : "fa";
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--line)] bg-paper py-14">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <a
              href={`/${locale}`}
              className="flex items-center gap-2.5 text-[1.05rem] font-semibold tracking-[-0.02em]"
            >
              <i className="bi bi-house-door-fill" aria-hidden="true" />
              {dict.brand}
            </a>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-ink-soft">
              {dict.footer.tagline}
            </p>
          </div>

          <div className="flex gap-14 sm:gap-20">
            <nav aria-label={dict.footer.product}>
              <h2 className="text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                {dict.footer.product}
              </h2>
              {/* Real routes, not page anchors: this footer is on the shop,
                  the basket and the help page too, where `#how` points at
                  nothing. */}
              <ul className="mt-4 flex flex-col gap-2.5 text-[0.92rem]">
                <li>
                  <a
                    href={`/${locale}/shop`}
                    className="text-ink-soft transition-colors hover:text-ink"
                  >
                    {dict.nav.shop}
                  </a>
                </li>
                <li>
                  <a
                    href={`/${locale}#how`}
                    className="text-ink-soft transition-colors hover:text-ink"
                  >
                    {dict.nav.how}
                  </a>
                </li>
                <li>
                  <a
                    href={`/${locale}/help`}
                    className="text-ink-soft transition-colors hover:text-ink"
                  >
                    {dict.nav.help}
                  </a>
                </li>
              </ul>
            </nav>

            <nav aria-label={dict.footer.account}>
              <h2 className="text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                {dict.footer.account}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5 text-[0.92rem]">
                <li>
                  <a
                    href={`/${locale}/login`}
                    className="text-ink-soft transition-colors hover:text-ink"
                  >
                    {dict.nav.login}
                  </a>
                </li>
                <li>
                  <a
                    href={`/${locale}/panel`}
                    className="text-ink-soft transition-colors hover:text-ink"
                  >
                    {dict.nav.panel}
                  </a>
                </li>
                <li>
                  <a
                    href={`/${locale}/orders`}
                    className="text-ink-soft transition-colors hover:text-ink"
                  >
                    {dict.nav.orders}
                  </a>
                </li>
              </ul>
            </nav>

            <div>
              <h2 className="text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                {dict.footer.language}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5 text-[0.92rem]">
                <li>
                  <span className="text-ink">{locale === "fa" ? "فارسی" : "English"}</span>
                </li>
                <li>
                  <a
                    href={`/${other}`}
                    lang={other}
                    className="text-ink-soft transition-colors hover:text-ink"
                  >
                    {other === "fa" ? "فارسی" : "English"}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-12 border-t border-[var(--line)] pt-6 text-[0.85rem] text-ink-faint">
          © {year} {dict.brand}. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}

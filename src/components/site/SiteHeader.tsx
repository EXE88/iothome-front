"use client";

import Link from "next/link";
import { useState } from "react";
import AccountMenu from "./AccountMenu";
import CartButton from "./CartButton";
import { useAuth } from "@/lib/auth";
import type { Dictionary, Locale } from "@/lib/i18n";

/**
 * The bar every page that is not the landing page or the panel wears: shop,
 * product, basket, checkout, orders, help.
 *
 * It is solid rather than the landing page's floating glass pill. Glass is
 * only allowed where something moves behind it, and behind these pages there
 * is white paper.
 */
export default function SiteHeader({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const { status } = useAuth();
  const [open, setOpen] = useState(false);
  const other: Locale = locale === "fa" ? "en" : "fa";

  const links = [
    { href: `/${locale}/shop`, label: dict.nav.shop },
    { href: `/${locale}/help`, label: dict.nav.help },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_srgb,#ffffff_82%,transparent)] backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <div className="flex items-center gap-7">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2.5 text-[1.05rem] font-semibold tracking-[-0.02em]"
          >
            <i className="bi bi-house-door-fill" aria-hidden="true" />
            {dict.brand}
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[0.92rem] text-ink-soft transition-colors duration-200 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href={`/${other}`}
            lang={other}
            hrefLang={other}
            aria-label={dict.footer.language}
            className="rounded-full px-2.5 py-1.5 text-[0.82rem] font-medium text-ink-soft transition-colors duration-200 hover:text-ink"
          >
            {other === "fa" ? "فارسی" : "EN"}
          </Link>

          <CartButton dict={dict} locale={locale} />

          {/* `loading` renders neither pair: the session is restored from a
              cookie a moment after mount, and showing "log in" in that gap is
              how the landing page used to tell signed-in people they were
              signed out. */}
          {status === "authenticated" ? (
            <AccountMenu dict={dict} locale={locale} />
          ) : status === "anonymous" ? (
            <>
              <Link
                href={`/${locale}/login`}
                className="hidden rounded-full px-4 py-2 text-[0.92rem] font-medium text-ink transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--ink)_7%,transparent)] sm:inline-block"
              >
                {dict.nav.login}
              </Link>
              <Link
                href={`/${locale}/signup`}
                className="rounded-full bg-ink px-5 py-2 text-[0.92rem] font-medium text-paper transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5"
              >
                {dict.nav.signup}
              </Link>
            </>
          ) : (
            <span className="h-9 w-9" aria-hidden="true" />
          )}

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? dict.nav.close : dict.nav.menu}
            className="-me-1 flex h-9 w-9 items-center justify-center rounded-full text-ink md:hidden"
          >
            <i
              className={`bi ${open ? "bi-x-lg" : "bi-list"} text-xl`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[var(--line)] px-5 py-3 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-[1rem] text-ink transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]"
              >
                {link.label}
              </Link>
            ))}
            {status === "anonymous" && (
              <Link
                href={`/${locale}/login`}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-[1rem] text-ink transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]"
              >
                {dict.nav.login}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

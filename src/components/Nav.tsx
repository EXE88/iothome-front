"use client";

import { useEffect, useState } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";

/**
 * Glass is used here for the one reason it exists: the bar sits over a moving
 * render, and the visitor should keep seeing the house assemble underneath it.
 * It only turns to glass once there is something scrolling behind it.
 */
export default function Nav({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const [lifted, setLifted] = useState(false);
  const [onDark, setOnDark] = useState(false);
  const [open, setOpen] = useState(false);
  const other: Locale = locale === "fa" ? "en" : "fa";

  useEffect(() => {
    const onScroll = () => {
      setLifted(window.scrollY > 24);
      // White glass over the near-black closing section leaves the links at
      // roughly 1.7:1, so the bar inverts while it overlaps a dark surface
      // instead of staying one fixed treatment for the whole page.
      const bar = 88;
      const dark = document.querySelectorAll<HTMLElement>("[data-surface='dark']");
      let overlapping = false;
      dark.forEach((section) => {
        const box = section.getBoundingClientRect();
        if (box.top < bar && box.bottom > 0) overlapping = true;
      });
      setOnDark(overlapping);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    { href: "#devices", label: dict.nav.products },
    { href: "#how", label: dict.nav.how },
  ];

  const surface = onDark
    ? "bg-[color-mix(in_srgb,#ffffff_14%,transparent)] text-paper shadow-[0_12px_32px_-14px_rgba(0,0,0,0.6)] backdrop-blur-xl backdrop-saturate-150"
    : lifted
      ? "bg-[var(--glass)] shadow-[0_1px_2px_rgba(10,10,10,0.04),0_12px_32px_-12px_rgba(10,10,10,0.22)] backdrop-blur-xl backdrop-saturate-150"
      : "bg-transparent";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-5">
      <nav
        data-on-dark={onDark ? "" : undefined}
        className={`pointer-events-auto mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-2.5 transition-[background-color,box-shadow,backdrop-filter,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-6 ${surface}`}
      >
        <a
          href={`/${locale}`}
          className="flex items-center gap-2.5 text-[1.05rem] font-semibold tracking-[-0.02em]"
        >
          <i className="bi bi-house-door-fill text-[1.05rem]" aria-hidden="true" />
          {dict.brand}
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[0.92rem] text-ink-soft transition-colors duration-200 hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href={`/${other}`}
            className="rounded-full px-3 py-1.5 text-[0.82rem] font-medium text-ink-soft transition-colors duration-200 hover:text-ink"
            lang={other}
            aria-label={dict.footer.language}
          >
            {other === "fa" ? "فارسی" : "EN"}
          </a>
          <a
            href={`/${locale}/login`}
            className="rounded-full px-4 py-2 text-[0.9rem] font-medium text-ink transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--ink)_7%,transparent)]"
          >
            {dict.nav.login}
          </a>
          <a
            href={`/${locale}/signup`}
            data-cta
            className="rounded-full bg-ink px-5 py-2 text-[0.9rem] font-medium text-paper transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5"
          >
            {dict.nav.signup}
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="-me-1 flex h-9 w-9 items-center justify-center rounded-full text-ink md:hidden"
          aria-expanded={open}
          aria-label={open ? dict.nav.close : dict.nav.menu}
        >
          <i className={`bi ${open ? "bi-x-lg" : "bi-list"} text-xl`} aria-hidden="true" />
        </button>
      </nav>

      {open && (
        <div className="pointer-events-auto mx-auto mt-2 max-w-6xl rounded-3xl bg-[var(--glass)] p-5 shadow-[0_1px_2px_rgba(10,10,10,0.04),0_16px_40px_-14px_rgba(10,10,10,0.28)] backdrop-blur-xl backdrop-saturate-150 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-[1rem] text-ink transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]"
              >
                {link.label}
              </a>
            ))}
            <a
              href={`/${other}`}
              lang={other}
              className="rounded-xl px-3 py-3 text-[1rem] text-ink-soft transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]"
            >
              {other === "fa" ? "فارسی" : "English"}
            </a>
          </div>
          <div className="mt-3 flex gap-2 border-t border-[var(--line)] pt-4">
            <a
              href={`/${locale}/login`}
              className="flex-1 rounded-full border border-[var(--line-strong)] py-3 text-center text-[0.92rem] font-medium"
            >
              {dict.nav.login}
            </a>
            <a
              href={`/${locale}/signup`}
              className="flex-1 rounded-full bg-ink py-3 text-center text-[0.92rem] font-medium text-paper"
            >
              {dict.nav.signup}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

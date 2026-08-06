"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import type { Dictionary, Locale } from "@/lib/i18n";

const ITEMS = [
  { href: "/panel", icon: "bi-grid", key: "panel" },
  { href: "/orders", icon: "bi-bag", key: "orders" },
  { href: "/account", icon: "bi-person", key: "profile" },
  { href: "/help", icon: "bi-question-circle", key: "help" },
] as const;

/**
 * One account menu for every signed-in surface — the landing bar, the shop
 * header and the panel.
 *
 * Before this existed, the only way out of the panel was the logout button,
 * and the landing page had no idea anyone was signed in at all: it kept
 * offering "log in" to people who already were, and its buy links sent them
 * back to a page telling them to sign in.
 *
 * It is a menu rather than a row of links because the signed-in destinations
 * are secondary to whatever page you are on. `onDark` inverts the trigger for
 * the nav's dark-overlap rule; the panel itself never uses it.
 */
export default function AccountMenu({
  dict,
  locale,
  onDark = false,
}: {
  dict: Dictionary;
  locale: Locale;
  onDark?: boolean;
}) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // The label is the local part of the address: the full one overflows the
  // bar on a phone, and the domain is always gmail.com anyway.
  const handle = user?.email?.split("@")[0] ?? "";

  return (
    <div ref={wrapper} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={dict.nav.account}
        className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.92rem] font-medium transition-colors duration-200 ${
          onDark
            ? "text-paper hover:bg-[color-mix(in_srgb,#ffffff_14%,transparent)]"
            : "text-ink-soft hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] hover:text-ink"
        }`}
      >
        <i className="bi bi-person-circle text-[1.05rem]" aria-hidden="true" />
        <span className="hidden max-w-[9rem] truncate sm:inline" dir="ltr">
          {handle}
        </span>
        <i
          className={`bi bi-chevron-down text-[0.7rem] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {open && (
        // Anchored to the trailing edge in both directions: `end-0` is right
        // in English and left in Persian, so the menu never leaves the bar.
        <div
          role="menu"
          className="absolute end-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-[var(--line)] bg-paper py-1.5 shadow-[0_1px_2px_rgba(10,10,10,0.04),0_16px_40px_-14px_rgba(10,10,10,0.28)]"
        >
          <p
            className="truncate border-b border-[var(--line)] px-4 pb-2.5 pt-1 text-[0.82rem] text-ink-faint"
            dir="ltr"
          >
            {user?.email}
          </p>

          {ITEMS.map((item) => (
            <Link
              key={item.key}
              role="menuitem"
              href={`/${locale}${item.href}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[0.92rem] text-ink transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]"
            >
              <i className={`bi ${item.icon} text-ink-faint`} aria-hidden="true" />
              {dict.nav[item.key]}
            </Link>
          ))}

          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await logout();
              router.replace(`/${locale}`);
            }}
            className="flex w-full items-center gap-3 border-t border-[var(--line)] px-4 py-2.5 text-[0.92rem] text-ink transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]"
          >
            <i
              className="bi bi-box-arrow-right text-ink-faint rtl:rotate-180"
              aria-hidden="true"
            />
            {dict.nav.logout}
          </button>
        </div>
      )}
    </div>
  );
}

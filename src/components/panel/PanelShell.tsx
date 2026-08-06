"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import type { Connection } from "@/lib/useUserSocket";
import type { Dictionary, Locale } from "@/lib/i18n";

const CONNECTION_STYLE: Record<Connection, string> = {
  idle: "text-ink-faint",
  connecting: "text-ink-soft",
  live: "text-[var(--live)]",
  reconnecting: "text-ink-soft",
  failed: "text-[var(--danger)]",
};

/**
 * Chrome for every signed-in screen.
 *
 * The connection state is permanent furniture rather than a toast, because on
 * this product "is what I am looking at still true?" is a question the user
 * has continuously, not once. A dot and a word answer it without taking space
 * from the devices.
 */
export default function PanelShell({
  dict,
  locale,
  connection,
  onRetry,
  children,
}: {
  dict: Dictionary;
  locale: Locale;
  connection: Connection;
  onRetry?: () => void;
  children: ReactNode;
}) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const other: Locale = locale === "fa" ? "en" : "fa";

  const label =
    connection === "live"
      ? dict.panel.connection.live
      : connection === "failed"
        ? dict.panel.connection.failed
        : connection === "reconnecting"
          ? dict.panel.connection.reconnecting
          : dict.panel.connection.connecting;

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_srgb,#ffffff_82%,transparent)] backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <Link
            href={`/${locale}/panel`}
            className="flex items-center gap-2.5 text-[1.02rem] font-semibold tracking-[-0.02em]"
          >
            <i className="bi bi-house-door-fill" aria-hidden="true" />
            {dict.brand}
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            <p
              className={`flex items-center gap-2 text-[0.82rem] ${CONNECTION_STYLE[connection]}`}
              // Connection changes matter but must not interrupt; polite lets
              // a screen reader finish the sentence it is on.
              aria-live="polite"
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  connection === "live"
                    ? "bg-[var(--live)]"
                    : connection === "failed"
                      ? "bg-[var(--danger)]"
                      : "animate-pulse bg-ink-faint"
                }`}
                aria-hidden="true"
              />
              {label}
            </p>

            {connection === "failed" && onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="text-[0.85rem] font-medium text-ink underline underline-offset-2"
              >
                {dict.panel.connection.retry}
              </button>
            )}

            <span className="hidden text-[0.85rem] text-ink-soft sm:inline" dir="ltr">
              {user?.email}
            </span>

            {/* Without a switch here, a Persian speaker who lands on /en has
                no way back for the whole signed-in session. */}
            <Link
              href={`/${other}/panel`}
              lang={other}
              hrefLang={other}
              className="rounded-full px-2.5 py-1.5 text-[0.85rem] font-medium text-ink-soft transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] hover:text-ink"
            >
              {other === "fa" ? "فارسی" : "EN"}
            </Link>

            <button
              type="button"
              onClick={async () => {
                await logout();
                router.replace(`/${locale}/login`);
              }}
              // The label collapses below 640px, so the button needs a name of
              // its own or it is an unlabelled icon to a screen reader.
              aria-label={dict.panel.nav.logout}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.85rem] font-medium text-ink-soft transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] hover:text-ink"
            >
              <i className="bi bi-box-arrow-right rtl:rotate-180" aria-hidden="true" />
              <span className="hidden sm:inline">{dict.panel.nav.logout}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-8 sm:py-12">
        {children}
      </main>
    </div>
  );
}

import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import SiteHeader from "./SiteHeader";
import type { Dictionary, Locale } from "@/lib/i18n";

/**
 * Header, content column, footer — the frame for every ordinary page.
 *
 * `bleed` turns the content column off for pages that lay out their own
 * full-width sections (the shop's studio band, for one). The header and
 * footer stay either way, which is the point: before this existed, the only
 * shared chrome was the landing page's, and every new page would have grown
 * its own.
 */
export default function PageShell({
  dict,
  locale,
  bleed = false,
  children,
}: {
  dict: Dictionary;
  locale: Locale;
  bleed?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <SiteHeader dict={dict} locale={locale} />
      <main className={bleed ? "flex-1" : "mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8 sm:py-16"}>
        {children}
      </main>
      <Footer dict={dict} locale={locale} />
    </div>
  );
}

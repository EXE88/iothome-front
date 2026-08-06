import type { Metadata } from "next";
import { notFound } from "next/navigation";
import localFont from "next/font/local";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { direction, getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";

// Loaded from files committed in this repository, not fetched from Google at
// build time: a clean checkout builds with no network, and nothing outside
// this codebase is ever contacted. See scripts/vendor-fonts.mjs.
const latin = localFont({
  src: [
    {
      path: "../fonts/SchibstedGrotesk-Variable.woff2",
      weight: "400 900",
      style: "normal",
    },
  ],
  variable: "--font-latin",
  display: "swap",
});

const persian = localFont({
  src: [
    {
      path: "../fonts/Vazirmatn-Variable.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../fonts/Vazirmatn-Latin-Variable.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-persian",
  display: "swap",
});

const DIRECTION_CONTRACT = `<!--
THESIS: A smart device you never set up, proved by watching one build itself.
  Refuses the category's feature-grid-under-a-stock-hero page.
OWN-WORLD: The seamless grey studio sweep the product films were shot on, cut
  against white paper. Two surfaces only, near-black ink, one hairline weight,
  full-bleed canvas renders, glass only where something moves behind it,
  Bootstrap Icons at a single stroke.
STORY: The visitor watches a house assemble, sees three devices split out of it
  and assemble too, learns the only step that is theirs is the plug, and
  creates an account.
FIRST VIEWPORT: Full-bleed studio canvas of the exploded house; headline on the
  leading half at clamp(2.6rem,7vw,5.25rem) with the lead beneath; dark pill
  CTA directly below the copy; glass nav floating above; scroll cue centred at
  the bottom.
FORM: Scroll-scrubbed frame sequence, pinned. Brief-pinned direction, honored
  over a direction roll.
FINISH: unreviewed and undocumented is unfinished; this build ends with the
  finish review, the verdict, and DESIGN.md.
-->`;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      locale,
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed = locale as Locale;

  return (
    <html
      lang={typed}
      dir={direction[typed]}
      className={`${latin.variable} ${persian.variable} antialiased`}
    >
      <body>
        {/* A JSX comment never reaches the emitted HTML, and a contract the
            build erases is a contract nobody can audit. */}
        <div hidden dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        <SmoothScroll />
        {/* The basket sits outside the session on purpose: a visitor builds
            one before signing up, and it has to survive the sign-up. */}
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

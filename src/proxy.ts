import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/lib/i18n";

/**
 * Everything lives under /fa or /en. A bare path picks the locale from the
 * browser's own preference and falls back to Persian, which is who the product
 * is sold to.
 *
 * Keeping the site on a single hostname is *not* done here, though it belongs
 * here. Next rewrites a redirect whose target host it considers its own, and a
 * dev server considers both `localhost:3000` and `127.0.0.1:3000` its own — the
 * exact pair that needs separating — so the Location header collapses to a bare
 * path and the browser loops back to where it started. It is done in
 * `components/site/CanonicalHost.tsx` instead, and in production it should be
 * done properly by whatever terminates TLS in front of this.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const accepted = request.headers.get("accept-language") ?? "";
  const preferred =
    locales.find((locale) => accepted.toLowerCase().startsWith(locale)) ??
    defaultLocale;

  const url = request.nextUrl.clone();
  url.pathname = `/${preferred}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|seq|favicon.ico|.*\\.).*)"],
};

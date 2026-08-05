import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/lib/i18n";

/**
 * Everything lives under /fa or /en. A bare path picks the locale from the
 * browser's own preference and falls back to Persian, which is who the product
 * is sold to.
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

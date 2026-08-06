import type { NextResponse } from "next/server";
import { REFRESH_COOKIE_MAX_AGE_DAYS } from "@/lib/config";

/**
 * The refresh token never reaches JavaScript.
 *
 * The access token has to live in JS — every device command is signed with it,
 * so there is no way around that — but it is short-lived and held only in
 * memory. The refresh token is the long-lived one, so it stays in an httpOnly
 * cookie where a cross-site script cannot read it, and only these route
 * handlers ever see it.
 *
 * The cookie's life is set from `.env` and has to match the backend's
 * REFRESH_TOKEN_LIFETIME_DAYS: a cookie that outlives its token leaves the
 * user looking at a session that is not one.
 */
export const REFRESH_COOKIE = "sl_refresh";

const MAX_AGE_SECONDS = 60 * 60 * 24 * REFRESH_COOKIE_MAX_AGE_DAYS;

export function setRefreshCookie(response: NextResponse, token: string) {
  response.cookies.set(REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export function clearRefreshCookie(response: NextResponse) {
  response.cookies.set(REFRESH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

import type { NextResponse } from "next/server";

/**
 * The refresh token never reaches JavaScript.
 *
 * The access token has to live in JS — every device command is signed with it,
 * so there is no way around that — but it expires in 30 minutes and is held
 * only in memory. The refresh token is the long-lived one, so it stays in an
 * httpOnly cookie where a cross-site script cannot read it, and only these
 * route handlers ever see it.
 */
export const REFRESH_COOKIE = "sl_refresh";

const FOURTEEN_DAYS = 60 * 60 * 24 * 14;

export function setRefreshCookie(response: NextResponse, token: string) {
  response.cookies.set(REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: FOURTEEN_DAYS,
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

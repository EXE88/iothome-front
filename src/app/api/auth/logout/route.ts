import { NextResponse } from "next/server";
import { clearRefreshCookie } from "@/lib/server/refreshCookie";

/**
 * Drops the cookie. The backend does not blacklist refresh tokens yet, so this
 * ends the session on this device only — noted in the README as work left.
 */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearRefreshCookie(response);
  return response;
}

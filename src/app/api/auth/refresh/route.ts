import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE_SERVER } from "@/lib/config";
import {
  REFRESH_COOKIE,
  clearRefreshCookie,
  setRefreshCookie,
} from "@/lib/server/refreshCookie";

/**
 * Mints a fresh access token from the cookie. This is what makes a page reload
 * keep the session even though the access token itself only lived in memory.
 *
 * The backend rotates refresh tokens, so the reply carries a new one and the
 * cookie is rewritten every time.
 */
export async function POST() {
  const store = await cookies();
  const refresh = store.get(REFRESH_COOKIE)?.value;

  if (!refresh) {
    return NextResponse.json({ detail: "No session." }, { status: 401 });
  }

  const upstream = await fetch(`${API_BASE_SERVER}/api/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    // Expired or revoked: drop the cookie so the app stops retrying.
    const failed = NextResponse.json(data, { status: upstream.status });
    clearRefreshCookie(failed);
    return failed;
  }

  const me = await fetch(`${API_BASE_SERVER}/api/auth/me/`, {
    headers: { Authorization: `Bearer ${data.access}` },
    cache: "no-store",
  });

  const response = NextResponse.json({
    access: data.access,
    user: me.ok ? await me.json() : null,
  });
  if (data.refresh) setRefreshCookie(response, data.refresh);
  return response;
}

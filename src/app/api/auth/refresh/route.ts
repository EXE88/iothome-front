import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE_SERVER } from "@/lib/config";
import { callUpstream, unreachableResponse } from "@/lib/server/upstream";
import {
  REFRESH_COOKIE,
  clearRefreshCookie,
  setRefreshCookie,
} from "@/lib/server/refreshCookie";

/**
 * Mints a fresh access token from the cookie. This is what makes a page reload
 * keep the session even though the access token itself only lived in memory.
 *
 * Rotation is off, so the reply usually carries no new refresh token and the
 * cookie is left alone; it is only rewritten when one does come back.
 *
 * A backend that is simply down must not look like an expired session. It
 * answers 503 and the cookie is kept, so the session survives the outage
 * instead of the visitor being silently signed out by a restart.
 */
export async function POST() {
  const store = await cookies();
  const refresh = store.get(REFRESH_COOKIE)?.value;

  if (!refresh) {
    return NextResponse.json({ detail: "No session." }, { status: 401 });
  }

  const upstream = await callUpstream(
    `${API_BASE_SERVER}/api/auth/token/refresh/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    },
  );

  // Down, not rejected. Keep the cookie — the token is probably still valid,
  // and clearing it here would log people out every time Django restarts.
  if (!upstream.ok) return unreachableResponse();

  const data = upstream.data as { access?: string; refresh?: string };

  if (upstream.status >= 400) {
    // Expired or revoked: drop the cookie so the app stops retrying.
    const failed = NextResponse.json(data, { status: upstream.status });
    clearRefreshCookie(failed);
    return failed;
  }

  const me = await callUpstream(`${API_BASE_SERVER}/api/auth/me/`, {
    headers: { Authorization: `Bearer ${data.access}` },
  });

  const response = NextResponse.json({
    access: data.access,
    user: me.ok && me.status < 400 ? me.data : null,
  });
  if (data.refresh) setRefreshCookie(response, data.refresh);
  return response;
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE_SERVER } from "@/lib/config";
import { REFRESH_COOKIE, clearRefreshCookie } from "@/lib/server/refreshCookie";

/**
 * Ends the session, then drops the cookie.
 *
 * The order matters and so does the upstream call. Clearing the cookie only
 * makes *this* browser forget the token; the token stays valid until it
 * expires, so any other copy of it still works. That is how someone could log
 * out, sign in as a different account, and then find the first account waiting
 * for them — the same site reached under a second hostname keeps its own
 * cookie jar, and nothing had told the server that session was over.
 *
 * Blacklisting it upstream is what makes "log out" true everywhere.
 *
 * If the backend is unreachable the cookie is still cleared: refusing to log
 * someone out because the server is down is the wrong way round.
 */
export async function POST() {
  const store = await cookies();
  const refresh = store.get(REFRESH_COOKIE)?.value;

  if (refresh) {
    try {
      await fetch(`${API_BASE_SERVER}/api/auth/logout/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
        cache: "no-store",
      });
    } catch {
      // Best effort — see above.
    }
  }

  const response = NextResponse.json({ ok: true });
  clearRefreshCookie(response);
  return response;
}

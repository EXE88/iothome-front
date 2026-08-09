import { NextResponse } from "next/server";
import { API_BASE_SERVER } from "@/lib/config";
import { setRefreshCookie } from "@/lib/server/refreshCookie";
import { callUpstream, unreachableResponse } from "@/lib/server/upstream";

/**
 * Exchanges credentials for a session. The refresh token is peeled off into an
 * httpOnly cookie and never reaches the browser's JavaScript; only the short
 * access token is handed back.
 */
export async function POST(request: Request) {
  const body = await request.json();

  const upstream = await callUpstream(`${API_BASE_SERVER}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: body.email, password: body.password }),
  });

  // Says "the server is unavailable" rather than throwing. An unhandled throw
  // here is what made a down backend look like a bare 404 on the login form.
  if (!upstream.ok) return unreachableResponse();

  const data = upstream.data as { access?: string; refresh?: string; user?: unknown };

  if (upstream.status >= 400) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const response = NextResponse.json({ access: data.access, user: data.user });
  if (data.refresh) setRefreshCookie(response, data.refresh);
  return response;
}

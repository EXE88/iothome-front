import { NextResponse } from "next/server";
import { API_BASE_SERVER } from "@/lib/config";
import { setRefreshCookie } from "@/lib/server/refreshCookie";

/**
 * Exchanges credentials for a session. The refresh token is peeled off into an
 * httpOnly cookie and never reaches the browser's JavaScript; only the short
 * access token is handed back.
 */
export async function POST(request: Request) {
  const body = await request.json();

  const upstream = await fetch(`${API_BASE_SERVER}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: body.email, password: body.password }),
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const response = NextResponse.json({ access: data.access, user: data.user });
  setRefreshCookie(response, data.refresh);
  return response;
}

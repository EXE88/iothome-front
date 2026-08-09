import { NextResponse } from "next/server";

/**
 * Calls the backend, and turns "it is not there" into an answer.
 *
 * An unreachable Django makes `fetch` throw `ECONNREFUSED`, and an unhandled
 * throw in a route handler becomes a 500 with a stack trace in the log and
 * nothing useful in the browser. That has now cost two debugging sessions
 * under two different disguises: a bare 404 on login, and a 500 on refresh
 * that looked like a session bug. It is neither. It is the backend being down,
 * and it should say so.
 *
 * 503 rather than 500, because the frontend is fine and the thing behind it is
 * not — and because it tells the client this is worth retrying.
 */
export type Upstream =
  | { ok: true; status: number; data: unknown; response: Response }
  | { ok: false; unreachable: true };

export async function callUpstream(
  url: string,
  init?: RequestInit,
): Promise<Upstream> {
  try {
    const response = await fetch(url, { cache: "no-store", ...init });
    const data = await response.json().catch(() => ({}));
    return { ok: true, status: response.status, data, response };
  } catch (error) {
    console.warn(
      `upstream: ${url} is unreachable —`,
      error instanceof Error ? error.message : error,
    );
    return { ok: false, unreachable: true };
  }
}

/** The reply to send when the backend could not be reached at all. */
export function unreachableResponse() {
  return NextResponse.json(
    { detail: "The server is unavailable.", code: "upstream_unreachable" },
    { status: 503 },
  );
}

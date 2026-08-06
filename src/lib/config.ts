/**
 * Everything configurable about this app, read from the environment in one
 * place. Change values in `.env` — see `.env.example` for what each one does.
 *
 * Next.js substitutes `process.env.NEXT_PUBLIC_*` at build time, so those
 * lookups have to be written out literally; they cannot be indexed.
 */

/** What the browser calls: REST and the WebSocket. */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

/**
 * What the Next.js server calls from the route handlers under
 * `src/app/api/auth/`. Separate from API_BASE because the server may reach
 * Django by a name the browser cannot — a Docker service name, or plain
 * loopback while the browser uses a Tailscale address.
 */
export const API_BASE_SERVER = process.env.API_BASE_SERVER || API_BASE;

/** Optional override for the socket origin; otherwise derived from API_BASE. */
const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE || API_BASE;

export function userSocketUrl() {
  const url = new URL("/ws/user/", WS_BASE);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
}

function number(raw: string | undefined, fallback: number) {
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Refresh the access token this many seconds before it expires. Public
 *  because the timer that uses it runs in the browser. */
export const ACCESS_REFRESH_MARGIN_SECONDS = number(
  process.env.NEXT_PUBLIC_ACCESS_REFRESH_MARGIN_SECONDS,
  120,
);

/** Lifetime of the refresh cookie. Server-side only — see refreshCookie.ts. */
export const REFRESH_COOKIE_MAX_AGE_DAYS = number(
  process.env.REFRESH_COOKIE_MAX_AGE_DAYS,
  7,
);

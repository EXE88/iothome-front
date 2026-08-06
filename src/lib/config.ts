/** Where the Django backend lives, and how the browser reaches its socket. */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

/** Server-side calls go direct; this can differ from API_BASE in Docker. */
export const API_BASE_SERVER = process.env.API_BASE_SERVER ?? API_BASE;

export function userSocketUrl() {
  const url = new URL("/ws/user/", API_BASE);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
}

/** Access tokens last 30 minutes; refresh a few minutes early so a command is
 *  never signed with a token that expires mid-flight. */
export const ACCESS_REFRESH_MARGIN_SECONDS = 120;

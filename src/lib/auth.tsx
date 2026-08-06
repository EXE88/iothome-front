"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ACCESS_REFRESH_MARGIN_SECONDS, API_BASE } from "./config";

export type User = {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  is_email_verified: boolean;
  date_joined: string;
};

type Session = { access: string; user: User | null };

type AuthValue = {
  user: User | null;
  /** Present only while signed in; kept in memory, never persisted. */
  accessToken: string | null;
  status: "loading" | "authenticated" | "anonymous";
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Authenticated fetch against the Django API, refreshing once on a 401. */
  apiFetch: (path: string, init?: RequestInit) => Promise<Response>;
  refresh: () => Promise<string | null>;
};

const AuthContext = createContext<AuthValue | null>(null);

function expiryOf(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" ? payload.exp : 0;
  } catch {
    return 0;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthValue["status"]>("loading");
  const timer = useRef<number | null>(null);
  // A page can fire several authenticated requests at once; without this they
  // would each start their own refresh and rotate the cookie out from under
  // one another.
  const inFlight = useRef<Promise<string | null> | null>(null);

  const scheduleRefresh = useCallback((access: string, run: () => void) => {
    if (timer.current) window.clearTimeout(timer.current);
    const seconds = expiryOf(access) - Date.now() / 1000 - ACCESS_REFRESH_MARGIN_SECONDS;
    timer.current = window.setTimeout(run, Math.max(seconds, 5) * 1000);
  }, []);

  const refresh = useCallback(async (): Promise<string | null> => {
    if (inFlight.current) return inFlight.current;

    inFlight.current = (async () => {
      try {
        const response = await fetch("/api/auth/refresh", { method: "POST" });
        if (!response.ok) {
          setSession(null);
          setStatus("anonymous");
          return null;
        }
        const data = (await response.json()) as Session;
        setSession(data);
        setStatus("authenticated");
        scheduleRefresh(data.access, () => void refresh());
        return data.access;
      } finally {
        inFlight.current = null;
      }
    })();

    return inFlight.current;
  }, [scheduleRefresh]);

  // A reload loses the in-memory access token; the cookie is what brings the
  // session back.
  useEffect(() => {
    void refresh();
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new ApiError(response.status, data);

      setSession(data);
      setStatus("authenticated");
      scheduleRefresh(data.access, () => void refresh());
    },
    [refresh, scheduleRefresh],
  );

  const logout = useCallback(async () => {
    if (timer.current) window.clearTimeout(timer.current);
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    setStatus("anonymous");
  }, []);

  const apiFetch = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const call = (token: string | null) =>
        fetch(`${API_BASE}${path}`, {
          ...init,
          headers: {
            ...(init.body ? { "Content-Type": "application/json" } : {}),
            ...(init.headers ?? {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

      let response = await call(session?.access ?? null);
      if (response.status === 401) {
        const fresh = await refresh();
        if (fresh) response = await call(fresh);
      }
      return response;
    },
    [session, refresh],
  );

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.access ?? null,
      status,
      login,
      logout,
      apiFetch,
      refresh,
    }),
    [session, status, login, logout, apiFetch, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}

/** Carries the backend's field errors so a form can show them in place. */
export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;

  constructor(status: number, data: Record<string, unknown>) {
    super(typeof data?.detail === "string" ? data.detail : "Request failed");
    this.status = status;
    this.data = data ?? {};
  }

  /** First message for a field, or the form-level one. */
  field(name: string): string | null {
    const value = this.data[name];
    if (Array.isArray(value)) return String(value[0]);
    if (typeof value === "string") return value;
    return null;
  }

  get formError(): string | null {
    const detail = this.field("detail") ?? this.field("non_field_errors");
    if (detail) return detail;
    const first = Object.values(this.data)[0];
    if (Array.isArray(first)) return String(first[0]);
    if (typeof first === "string") return first;
    return null;
  }
}

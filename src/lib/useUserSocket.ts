"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { userSocketUrl } from "./config";
import { buildMessage, canonical, hmacHex, nonce } from "./hmac";

export type Gadget = {
  uid: string;
  name: string;
  type: string;
  mode: string;
  status: string;
  last_seen_at: string | null;
  online: boolean;
};

export type Readings = Record<string, unknown>;

export type CommandState = {
  requestId: string;
  gadget: string;
  key: string;
  value: unknown;
  status: "sent" | "acked" | "failed" | "timeout";
  error?: string;
  at: number;
};

export type Connection =
  | "idle"
  | "connecting"
  | "live"
  | "reconnecting"
  | "failed";

type Options = {
  accessToken: string | null;
  /** Bumped by the caller to force a fresh socket after a token rotation. */
  onError?: (message: string) => void;
};

const MAX_ATTEMPTS = 6;

/**
 * The browser half of the device protocol.
 *
 * Two things make this more than a thin WebSocket wrapper. Every frame the
 * user sends is HMAC-signed with the access token, timestamped and nonced, so
 * a captured command cannot be replayed. And the socket is disposable: the
 * access token expires every 30 minutes, and rather than letting the server
 * cut the connection mid-command, the hook rebuilds the socket whenever a new
 * token arrives.
 */
export function useUserSocket({ accessToken, onError }: Options) {
  const [connection, setConnection] = useState<Connection>("idle");
  const [gadgets, setGadgets] = useState<Gadget[]>([]);
  const [readings, setReadings] = useState<Record<string, Readings>>({});
  const [stateUnknown, setStateUnknown] = useState<Set<string>>(new Set());
  const [commands, setCommands] = useState<CommandState[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const attempt = useRef(0);
  const retryTimer = useRef<number | null>(null);
  const tokenRef = useRef<string | null>(accessToken);
  tokenRef.current = accessToken;

  const send = useCallback((payload: Record<string, unknown>) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify(payload));
    return true;
  }, []);

  useEffect(() => {
    if (!accessToken) {
      socketRef.current?.close();
      socketRef.current = null;
      setConnection("idle");
      return;
    }

    let disposed = false;

    const open = async () => {
      if (disposed) return;
      setConnection(attempt.current === 0 ? "connecting" : "reconnecting");

      const socket = new WebSocket(userSocketUrl());
      socketRef.current = socket;

      socket.onopen = async () => {
        const token = tokenRef.current;
        if (!token) return;
        const timestamp = Math.floor(Date.now() / 1000);
        const n = nonce();
        socket.send(
          JSON.stringify({
            type: "auth",
            token,
            timestamp,
            nonce: n,
            signature: await hmacHex(token, buildMessage(timestamp, n)),
          }),
        );
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "auth.ok":
            attempt.current = 0;
            setConnection("live");
            setGadgets(message.gadgets ?? []);
            break;

          case "telemetry":
            setReadings((current) => ({
              ...current,
              [message.gadget]: { ...current[message.gadget], ...message.readings },
            }));
            setStateUnknown((current) => {
              if (!current.has(message.gadget)) return current;
              const next = new Set(current);
              next.delete(message.gadget);
              return next;
            });
            break;

          case "device.status":
            setGadgets((current) =>
              current.map((g) =>
                g.uid === message.gadget ? { ...g, online: message.online } : g,
              ),
            );
            if (!message.online) {
              setStateUnknown((current) => {
                const next = new Set(current);
                next.delete(message.gadget);
                return next;
              });
            }
            break;

          case "state.unknown":
            setStateUnknown((current) => new Set(current).add(message.gadget));
            break;

          case "command.status":
            setCommands((current) => {
              const existing = current.find(
                (c) => c.requestId === message.request_id,
              );

              // An ack is the device reporting back, so it counts as state.
              // Without this, a command with no matching telemetry key — the
              // camera's motion alerts, for one — could be pressed and would
              // never visibly change anything, because the panel only shows
              // what the hardware reports.
              if (message.status === "acked" && existing) {
                const applied =
                  message.response && "value" in message.response
                    ? message.response.value
                    : existing.value;
                setReadings((readingsNow) => ({
                  ...readingsNow,
                  [message.gadget]: {
                    ...readingsNow[message.gadget],
                    [existing.key]: applied,
                  },
                }));
              }

              const updated: CommandState = {
                requestId: message.request_id,
                gadget: message.gadget,
                key: existing?.key ?? "",
                value: existing?.value,
                status: message.status === "sent" ? "sent" : message.status,
                error: message.error || undefined,
                at: Date.now(),
              };
              return [
                updated,
                ...current.filter((c) => c.requestId !== message.request_id),
              ].slice(0, 40);
            });
            break;

          case "refresh.ack":
            setRefreshing(false);
            break;

          case "error":
            if (message.code === "token_expired") {
              // The provider is already refreshing on a timer; closing here
              // makes the next token rebuild the socket immediately.
              socket.close();
            } else {
              onError?.(message.detail ?? message.code);
              setRefreshing(false);
            }
            break;
        }
      };

      socket.onclose = () => {
        if (disposed) return;
        socketRef.current = null;
        attempt.current += 1;
        if (attempt.current > MAX_ATTEMPTS) {
          setConnection("failed");
          return;
        }
        // Exponential backoff, capped: a server restart should not turn into a
        // request every 100ms from every open tab.
        const delay = Math.min(1000 * 2 ** (attempt.current - 1), 15000);
        retryTimer.current = window.setTimeout(open, delay);
        setConnection("reconnecting");
      };
    };

    void open();

    return () => {
      disposed = true;
      if (retryTimer.current) window.clearTimeout(retryTimer.current);
      const socket = socketRef.current;
      socketRef.current = null;
      socket?.close();
    };
  }, [accessToken, onError]);

  const sendCommand = useCallback(
    async (gadgetUid: string, key: string, value: unknown) => {
      const token = tokenRef.current;
      if (!token) return null;

      const requestId = crypto.randomUUID();
      const timestamp = Math.floor(Date.now() / 1000);
      const n = nonce();
      const signature = await hmacHex(
        token,
        buildMessage(requestId, gadgetUid, key, canonical(value), timestamp, n),
      );

      const ok = send({
        type: "command",
        request_id: requestId,
        gadget: gadgetUid,
        key,
        value,
        timestamp,
        nonce: n,
        signature,
      });
      if (!ok) return null;

      setCommands((current) =>
        [
          {
            requestId,
            gadget: gadgetUid,
            key,
            value,
            status: "sent" as const,
            at: Date.now(),
          },
          ...current,
        ].slice(0, 40),
      );
      return requestId;
    },
    [send],
  );

  const refreshState = useCallback(
    (uids?: string[]) => {
      setRefreshing(true);
      const ok = send(
        uids ? { type: "refresh_state", gadgets: uids } : { type: "refresh_state" },
      );
      if (!ok) setRefreshing(false);
    },
    [send],
  );

  const retry = useCallback(() => {
    attempt.current = 0;
    socketRef.current?.close();
    setConnection("connecting");
  }, []);

  return {
    connection,
    gadgets,
    readings,
    stateUnknown,
    commands,
    refreshing,
    sendCommand,
    refreshState,
    retry,
  };
}

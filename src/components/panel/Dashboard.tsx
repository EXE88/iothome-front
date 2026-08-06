"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import DeviceCard from "./DeviceCard";
import PanelShell from "./PanelShell";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";
import type { GadgetType } from "@/lib/gadgetTypes";
import { useUserSocket } from "@/lib/useUserSocket";
import type { Dictionary, Locale } from "@/lib/i18n";

export default function Dashboard({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const router = useRouter();
  const { status, accessToken, apiFetch } = useAuth();
  const [types, setTypes] = useState<Record<string, GadgetType>>({});
  const [typesLoaded, setTypesLoaded] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);

  const onError = useCallback((message: string) => setSocketError(message), []);
  const {
    connection,
    gadgets,
    readings,
    stateUnknown,
    commands,
    refreshing,
    sendCommand,
    refreshState,
    retry,
  } = useUserSocket({ accessToken, onError });

  useEffect(() => {
    if (status === "anonymous") {
      router.replace(`/${locale}/login?next=/${locale}/panel`);
    }
  }, [status, router, locale]);

  // The capability contract is what every control is drawn from, so it is
  // fetched once over REST and then never changes for the session.
  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;

    (async () => {
      const response = await apiFetch("/api/gadgets/types/");
      if (!response.ok || cancelled) {
        if (!cancelled) setTypesLoaded(true);
        return;
      }
      const data = await response.json();
      const list: GadgetType[] = data.results ?? data;
      setTypes(Object.fromEntries(list.map((t) => [t.slug, t])));
      setTypesLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [status, apiFetch]);

  if (status !== "authenticated") {
    return (
      <PanelShell dict={dict} locale={locale} connection="connecting">
        <p className="text-[0.98rem] text-ink-soft">{dict.panel.loading}</p>
      </PanelShell>
    );
  }

  const waiting = connection === "connecting" || !typesLoaded;

  return (
    <PanelShell dict={dict} locale={locale} connection={connection} onRetry={retry}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[clamp(1.75rem,3.4vw,2.4rem)] font-semibold tracking-[-0.035em]">
          {dict.panel.title}
        </h1>

        {gadgets.length > 0 && (
          <Button
            variant="secondary"
            loading={refreshing}
            disabled={connection !== "live"}
            onClick={() => refreshState()}
            className="px-5 py-2.5 text-[0.9rem]"
          >
            {!refreshing && (
              <i className="bi bi-arrow-clockwise" aria-hidden="true" />
            )}
            {refreshing ? dict.panel.refreshing : dict.panel.refresh}
          </Button>
        )}
      </div>

      {socketError && (
        <p
          role="alert"
          className="mb-6 rounded-2xl border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_7%,transparent)] px-5 py-3.5 text-[0.9rem] text-[var(--danger)]"
        >
          {socketError}
        </p>
      )}

      {waiting ? (
        <div className="space-y-5" aria-busy="true">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-3xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--ink)_3%,transparent)]"
            />
          ))}
          <p className="sr-only">{dict.panel.loading}</p>
        </div>
      ) : gadgets.length === 0 ? (
        <div className="rounded-3xl border border-[var(--line)] px-8 py-16 text-center">
          <i className="bi bi-cpu text-[2rem] text-ink-faint" aria-hidden="true" />
          <h2 className="mt-4 text-[1.25rem] font-semibold tracking-[-0.02em]">
            {dict.panel.empty.title}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-[0.95rem] leading-relaxed text-ink-soft">
            {dict.panel.empty.body}
          </p>
          {/* The shop, not the landing page's rail anchor. Sending a
              signed-in owner to a marketing section that then told them to
              sign in to buy was the whole bug. */}
          <Link
            href={`/${locale}/shop`}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[0.92rem] font-medium text-paper transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5"
          >
            {dict.panel.empty.cta}
            <i
              className="bi bi-arrow-right rtl:rotate-180"
              aria-hidden="true"
            />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {gadgets.map((gadget) => (
            <DeviceCard
              key={gadget.uid}
              gadget={gadget}
              type={types[gadget.type]}
              readings={readings[gadget.uid] ?? {}}
              unknownState={stateUnknown.has(gadget.uid)}
              commands={commands.filter((c) => c.gadget === gadget.uid)}
              dict={dict}
              locale={locale}
              onSend={(key, value) => void sendCommand(gadget.uid, key, value)}
            />
          ))}
        </div>
      )}
    </PanelShell>
  );
}

"use client";

import Control from "./Control";
import {
  commandsOf,
  formatValue,
  iconFor,
  labelFor,
  readOnlyTelemetryOf,
  type GadgetType,
} from "@/lib/gadgetTypes";
import type { CommandState, Gadget, Readings } from "@/lib/useUserSocket";
import type { Dictionary, Locale } from "@/lib/i18n";

type Props = {
  gadget: Gadget;
  type: GadgetType | undefined;
  readings: Readings;
  unknownState: boolean;
  commands: CommandState[];
  dict: Dictionary;
  locale: Locale;
  onSend: (key: string, value: unknown) => void;
};

export default function DeviceCard({
  gadget,
  type,
  readings,
  unknownState,
  commands,
  dict,
  locale,
  onSend,
}: Props) {
  const telemetry = readOnlyTelemetryOf(type);
  const controls = commandsOf(type);
  const labels = { on: dict.panel.device.on, off: dict.panel.device.off };

  // A control is held while its own command is in flight, so pressing twice in
  // a row cannot queue two contradictory states on the hardware.
  const pendingKeys = new Set(
    commands.filter((c) => c.status === "sent").map((c) => c.key),
  );
  const latestFailure = commands.find(
    (c) => c.status === "failed" || c.status === "timeout",
  );

  return (
    <article className="overflow-hidden rounded-3xl border border-[var(--line)] bg-paper">
      <header className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-6 py-5">
        <div className="flex items-start gap-3.5">
          <i
            className={`bi ${iconFor(gadget.type)} mt-0.5 text-[1.25rem] text-ink`}
            aria-hidden="true"
          />
          <div>
            <h2 className="text-[1.12rem] font-semibold tracking-[-0.02em]">
              {gadget.name}
            </h2>
            <p className="mt-1 text-[0.85rem] text-ink-faint">
              {gadget.last_seen_at
                ? dict.panel.lastSeen.replace(
                    "{when}",
                    // Persian calendar, but Latin digits: sensor readings and
                    // ranges are Latin throughout, and two numeral systems on
                    // one card reads as a bug rather than as localisation.
                    new Date(gadget.last_seen_at).toLocaleString(
                      locale === "fa" ? "fa-IR-u-nu-latn" : "en-GB",
                      { dateStyle: "medium", timeStyle: "short" },
                    ),
                  )
                : dict.panel.never}
            </p>
          </div>
        </div>

        <StatusPill gadget={gadget} unknownState={unknownState} dict={dict} />
      </header>

      {/* A telemetry-only device has no controls, and an empty "Controls"
          panel holding a dash is worse than no panel: it reads as something
          that failed to load. The readings then take the full width. */}
      <div
        className={`grid gap-px bg-[var(--line)] ${
          controls.length > 0 ? "sm:grid-cols-2" : ""
        }`}
      >
        <section className="bg-paper px-6 py-5">
          <h3 className="text-[0.92rem] font-medium text-ink-faint">
            {dict.panel.device.readings}
          </h3>

          {telemetry.length === 0 ? (
            <p className="mt-3 text-[0.92rem] text-ink-faint">
              {dict.panel.device.noReadings}
            </p>
          ) : (
            <dl className="mt-3 space-y-2.5">
              {telemetry.map((capability) => {
                const value = readings[capability.key];
                return (
                  <div
                    key={capability.key}
                    className="flex items-baseline justify-between gap-4"
                  >
                    <dt className="text-[0.92rem] text-ink-soft">
                      {labelFor(capability, dict.panel.capabilities)}
                    </dt>
                    <dd
                      className="text-[1.12rem] font-semibold tabular-nums text-ink"
                      dir="ltr"
                    >
                      {formatValue(value, capability, labels)}
                    </dd>
                  </div>
                );
              })}
            </dl>
          )}

          {/* Distinguishes "nothing yet" from "we asked and got no answer" —
              the second is a device problem the owner should see. */}
          {unknownState && gadget.online && (
            <p className="mt-3 text-[0.85rem] text-ink-faint">
              {dict.panel.device.waiting}
            </p>
          )}
          {!gadget.online && (
            <p className="mt-3 text-[0.85rem] text-ink-faint">
              {dict.panel.device.noReadingsOffline}
            </p>
          )}
        </section>

        {controls.length > 0 && (
          <section className="bg-paper px-6 py-5">
            <h3 className="text-[0.92rem] font-medium text-ink-faint">
              {dict.panel.device.controls}
            </h3>

            <div className="mt-1 divide-y divide-[var(--line)]">
              {controls.map((capability) => (
                <Control
                  key={capability.key}
                  capability={capability}
                  value={readings[capability.key]}
                  disabled={!gadget.online}
                  pending={pendingKeys.has(capability.key)}
                  dict={dict}
                  onSend={(value) => onSend(capability.key, value)}
                />
              ))}
            </div>

            {!gadget.online && (
              <p className="mt-3 text-[0.85rem] text-ink-faint">
                {dict.panel.device.offlineNotice}
              </p>
            )}

            {latestFailure && (
              <p role="alert" className="mt-3 text-[0.85rem] text-[var(--danger)]">
                {latestFailure.status === "timeout"
                  ? dict.panel.device.timeout
                  : latestFailure.error || dict.panel.device.failed}
              </p>
            )}
          </section>
        )}
      </div>
    </article>
  );
}

function StatusPill({
  gadget,
  unknownState,
  dict,
}: {
  gadget: Gadget;
  unknownState: boolean;
  dict: Dictionary;
}) {
  const [text, tone] = !gadget.online
    ? [dict.panel.offline, "text-ink-faint"]
    : unknownState
      ? [dict.panel.unknown, "text-ink-soft"]
      : [dict.panel.online, "text-[var(--live)]"];

  return (
    <p
      className={`flex shrink-0 items-center gap-2 text-[0.85rem] font-medium ${tone}`}
    >
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          !gadget.online
            ? "bg-[color-mix(in_srgb,var(--ink)_25%,transparent)]"
            : unknownState
              ? "animate-pulse bg-ink-faint"
              : "bg-[var(--live)]"
        }`}
        aria-hidden="true"
      />
      {text}
    </p>
  );
}

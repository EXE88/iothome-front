"use client";

import { useEffect, useState } from "react";
import { choiceLabel, labelFor, type Capability } from "@/lib/gadgetTypes";
import type { Dictionary } from "@/lib/i18n";

type Props = {
  capability: Capability;
  value: unknown;
  disabled: boolean;
  pending: boolean;
  dict: Dictionary;
  onSend: (value: unknown) => void;
};

/**
 * One control, drawn from the capability contract rather than hardcoded.
 *
 * The backend already describes every command's type, range and choices, so
 * the panel renders a switch, a slider or a set of options without knowing
 * what a lamp is — and a device type added later gets working controls with
 * no frontend change.
 *
 * Each control shows the device's reported value, not the value the user just
 * pressed. Optimism would be lying: the command can fail, and on this product
 * the whole point is that the panel reflects hardware.
 */
export default function Control({
  capability,
  value,
  disabled,
  pending,
  dict,
  onSend,
}: Props) {
  const label = labelFor(capability, dict.panel.capabilities);

  if (capability.value_type === "bool") {
    const on = value === true;
    return (
      <div className="flex items-center justify-between gap-4 py-3">
        <span className="text-[0.98rem] text-ink">{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={label}
          disabled={disabled || pending}
          onClick={() => onSend(!on)}
          className={`relative h-8 w-14 shrink-0 rounded-full transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
            on ? "bg-ink" : "bg-[color-mix(in_srgb,var(--ink)_18%,transparent)]"
          }`}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-paper shadow-sm transition-[inset-inline-start] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              on ? "start-7" : "start-1"
            }`}
          />
        </button>
      </div>
    );
  }

  if (capability.value_type === "int" || capability.value_type === "float") {
    return (
      <RangeControl
        capability={capability}
        value={value}
        disabled={disabled || pending}
        label={label}
        onSend={onSend}
      />
    );
  }

  if (capability.value_type === "enum") {
    return (
      <div className="py-3">
        <span className="text-[0.98rem] text-ink">{label}</span>
        <div className="mt-2.5 flex flex-wrap gap-2" role="group" aria-label={label}>
          {capability.choices.map((choice) => {
            const active = value === choice;
            return (
              <button
                key={String(choice)}
                type="button"
                aria-pressed={active}
                disabled={disabled || pending}
                onClick={() => onSend(choice)}
                className={`rounded-full border px-4 py-2 text-[0.9rem] font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                  active
                    ? "border-ink bg-ink text-paper"
                    : "border-[var(--line-strong)] text-ink hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]"
                }`}
              >
                {choiceLabel(choice, dict.panel.choices)}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // The remaining type is `string`. It needs a real input: a command the user
  // cannot actually issue has no business sitting in the controls panel, and
  // the previous fall-through rendered exactly that — a label and a dash.
  return (
    <StringControl
      capability={capability}
      value={value}
      disabled={disabled || pending}
      label={label}
      onSend={onSend}
    />
  );
}

function StringControl({
  capability,
  value,
  disabled,
  label,
  onSend,
}: {
  capability: Capability;
  value: unknown;
  disabled: boolean;
  label: string;
  onSend: (value: unknown) => void;
}) {
  const reported = typeof value === "string" ? value : "";
  const [draft, setDraft] = useState(reported);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) setDraft(reported);
  }, [reported, editing]);

  return (
    <form
      className="py-3"
      onSubmit={(event) => {
        event.preventDefault();
        setEditing(false);
        if (draft !== reported) onSend(draft);
      }}
    >
      <label className="block text-[0.98rem] text-ink">{label}</label>
      <div className="mt-2 flex gap-2">
        <input
          value={draft}
          disabled={disabled}
          maxLength={capability.max_length ?? 64}
          onChange={(event) => {
            setEditing(true);
            setDraft(event.target.value);
          }}
          onBlur={() => setEditing(false)}
          className="min-w-0 flex-1 rounded-xl border border-[var(--line-strong)] bg-paper px-3 py-2 text-[0.92rem] text-ink outline-none focus:border-[var(--ink)] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || draft === reported}
          className="rounded-xl border border-[var(--line-strong)] px-3 text-[0.92rem] font-medium text-ink transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] disabled:opacity-40"
        >
          <i className="bi bi-check-lg" aria-hidden="true" />
          <span className="sr-only">{label}</span>
        </button>
      </div>
    </form>
  );
}

/**
 * A slider only commits on release. Sending on every input event would fire a
 * signed command per pixel of drag, each one a round trip to real hardware.
 */
function RangeControl({
  capability,
  value,
  disabled,
  label,
  onSend,
}: {
  capability: Capability;
  value: unknown;
  disabled: boolean;
  label: string;
  onSend: (value: unknown) => void;
}) {
  const min = capability.min_value ?? 0;
  const max = capability.max_value ?? 100;
  const reported = typeof value === "number" ? value : min;
  const [draft, setDraft] = useState(reported);
  const [dragging, setDragging] = useState(false);

  // While the user is not touching it, the device's own value wins.
  useEffect(() => {
    if (!dragging) setDraft(reported);
  }, [reported, dragging]);

  const commit = () => {
    setDragging(false);
    if (draft !== reported) onSend(draft);
  };

  return (
    <div className="py-3">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[0.98rem] text-ink">{label}</span>
        <span className="text-[0.92rem] tabular-nums text-ink-soft" dir="ltr">
          {draft}
          {capability.unit ? ` ${capability.unit}` : ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={capability.value_type === "int" ? 1 : 0.1}
        value={draft}
        disabled={disabled}
        aria-label={label}
        onChange={(e) => {
          setDragging(true);
          setDraft(Number(e.target.value));
        }}
        // Every way a drag can end, not just the happy one. A touch that turns
        // into a page scroll, a pointer released off the track, or a tab away
        // all end the interaction — and if any of them left `dragging` set,
        // the slider would stop following the hardware for the rest of the
        // session while still looking live.
        onPointerUp={commit}
        onPointerCancel={commit}
        onLostPointerCapture={commit}
        onKeyUp={commit}
        onBlur={commit}
        className="mt-3 w-full accent-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}

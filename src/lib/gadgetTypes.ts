/** The capability contract, exactly as `/api/gadgets/types/` returns it. */

export type Capability = {
  key: string;
  label: string;
  direction: "telemetry" | "command";
  value_type: "bool" | "int" | "float" | "string" | "enum";
  unit: string;
  min_value: number | null;
  max_value: number | null;
  max_length?: number;
  choices: (string | number)[];
};

export type GadgetType = {
  slug: string;
  name: string;
  description: string;
  mode: "telemetry" | "action" | "hybrid";
  heartbeat_interval_seconds: number;
  capabilities: Capability[];
};

export const ICON_BY_TYPE: Record<string, string> = {
  thermometer: "bi-thermometer-half",
  "smart-lamp": "bi-lightbulb",
  camera: "bi-camera-video",
};

export function iconFor(slug: string) {
  return ICON_BY_TYPE[slug] ?? "bi-cpu";
}

export function commandsOf(type: GadgetType | undefined) {
  return type?.capabilities.filter((c) => c.direction === "command") ?? [];
}

export function telemetryOf(type: GadgetType | undefined) {
  return type?.capabilities.filter((c) => c.direction === "telemetry") ?? [];
}

/**
 * Telemetry the user cannot set themselves.
 *
 * A lamp reports `power` and also accepts `power`, so listing both puts the
 * same fact in two columns — once as a switch that already shows its state,
 * and once as a read-only row far away from it. The control is the better
 * home, so the reading is dropped.
 */
export function readOnlyTelemetryOf(type: GadgetType | undefined) {
  const commandKeys = new Set(commandsOf(type).map((c) => c.key));
  return telemetryOf(type).filter((c) => !commandKeys.has(c.key));
}

/**
 * A capability's name in the reader's language, falling back to the label the
 * backend supplied. Keyed by direction too, because `power` as a switch and
 * `power` as a reading are not the same phrase.
 */
export function labelFor(
  capability: Capability,
  overrides: Record<string, string>,
) {
  return (
    overrides[`${capability.direction}.${capability.key}`] ??
    capability.label ??
    capability.key
  );
}

export function choiceLabel(
  choice: string | number,
  overrides: Record<string, string>,
) {
  return overrides[String(choice)] ?? String(choice);
}

/** Devices report raw values; this is the only place they become text. */
export function formatValue(
  value: unknown,
  capability: Capability | undefined,
  labels: { on: string; off: string },
) {
  if (value === undefined || value === null) return "—";
  if (typeof value === "boolean") return value ? labels.on : labels.off;
  if (typeof value === "number") {
    const rounded = Number.isInteger(value) ? value : Number(value.toFixed(1));
    const unit = capability?.unit;
    if (!unit) return String(rounded);
    // Degrees take the ring and percent closes up; a space-joined "37.5 C" is
    // not how either is written.
    if (unit === "C" || unit === "F") return `${rounded}°${unit}`;
    if (unit === "%") return `${rounded}%`;
    return `${rounded} ${unit}`;
  }
  return String(value);
}

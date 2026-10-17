export type FieldKind = "number" | "ordinal" | "verbal";

/** How a numeric pressure/flow value is expressed on a device. */
export type Pref = "absolute" | "above_epap" | "ae_ps" | "ms" | "lmin" | "pct";

export interface Field {
  id: string;
  label: string;
  unit: string;
  t: FieldKind;
  pref?: Pref;
  key?: string; // ordinal scale key
  opts?: string[]; // verbal options
  note?: string;
}

export interface ModeConfig {
  mode: string; // device's own name for the mode
  fields: Field[];
}

/** Ventara common-language mode categories. */
export type ModeKey =
  | "Pressure Support"
  | "PAC"
  | "VAPS-PS"
  | "VAPS-PC"
  | "VAPS-AE PS"
  | "VAPS-AE PC";

export type DeviceModes = Record<string, Partial<Record<string, ModeConfig>>>;

export interface Bridge {
  src: string;
  tgt: string[];
  note?: string;
}

export interface CompatEntry {
  vk: string;
  match: "exact" | "bridge";
  bridges?: Bridge[];
  note?: string;
}

export type Compat = Record<string, Record<string, CompatEntry>>;

export interface ScaleStep {
  s: number | string;
  v: number;
}
export type Scales = Record<string, ScaleStep[]>;

/** Canonical (device-neutral) value. */
export interface Canon {
  value: number;
  unit: string;
  pref: Pref | "num";
  derived?: boolean;
  formula?: string;
  isDefault?: boolean;
  bridgeNote?: string | null;
  /** Needs clinical review (set by cross-family bridging when a value had to be assumed). */
  review?: boolean;
}

export type Badge =
  | "direct"
  | "exact"
  | "closest"
  | "calculated"
  | "bridged"
  | "default"
  | "review"
  | "missing"
  | "nomatch";

export interface ResultRow {
  field: Field;
  display: string | null;
  unit: string;
  badge: Badge;
  sub?: string;
  formula?: string;
  /** Present when the value was snapped to a device scale: the scale key and the source value in the common unit. */
  scale?: { key: string; value: number; unit: string };
  /** Set when the output is outside the metric's settable range. */
  warn?: string;
}

export interface TranslationResult {
  ok: true;
  targetDevice: string;
  targetModeKey: string;
  targetModeName: string;
  isBridge: boolean;
  compatNote?: string;
  rows: ResultRow[];
  derivations: string[];
  bridgeNotes: string[];
  cycleDefaulted: boolean;
  /** Device switches to check on the target ("must be turned on", "does not exist"). */
  flags: string[];
}

export interface TranslationError {
  ok: false;
  reason: string;
}

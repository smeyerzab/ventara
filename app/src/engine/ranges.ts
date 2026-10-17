/* Settable ranges per metric, from the Metrics Dictionary sheet of the Ventara middleware workbook. */
export type RangeKind = "pip" | "ipap" | "epap" | "rr" | "ti" | "rise" | "trigger" | "cycle" | "vt";

export const RANGES: Record<RangeKind, { min: number; max: number; unit: string }> = {
  pip: { min: 0, max: 50, unit: "cmH₂O" },
  ipap: { min: 0, max: 40, unit: "cmH₂O" },
  epap: { min: 0, max: 30, unit: "cmH₂O" },
  rr: { min: 0, max: 40, unit: "bpm" },
  ti: { min: 0, max: 5, unit: "s" },
  rise: { min: 50, max: 900, unit: "ms" },
  trigger: { min: 0.5, max: 15, unit: "L/min" },
  cycle: { min: 0, max: 100, unit: "%" },
  vt: { min: 0, max: 3000, unit: "mL" },
};

/** Range kind for a translator field id (see engine/data.ts field ids). */
export function kindForField(id: string, unit: string): RangeKind | null {
  if (id === "pip") return "pip";
  if (id === "ipap_min" || id === "ipap_max") return "ipap";
  if (id === "epap" || id === "epap_min" || id === "epap_max") return "epap";
  if (id === "rr") return "rr";
  if (id === "ti" || id === "ti_backup" || id === "ti_min" || id === "ti_max") return "ti";
  if (id === "vt") return "vt";
  if (id === "rise") return unit === "ms" ? "rise" : null;
  if (id === "trigger") return unit === "L/min" ? "trigger" : null;
  if (id === "cycle") return unit === "%" ? "cycle" : null;
  return null;
}

/** Range kind for a device-labelled row (cross-mode and initial-settings outputs). */
export function kindForLabel(label: string, unit: string): RangeKind | null {
  const l = label.toLowerCase();
  if (unit === "ms") return "rise";
  if (unit === "L/min" && !/va/.test(l)) return "trigger";
  if (unit === "%") return "cycle";
  if (unit === "mL") return "vt";
  if (/epap|peep/.test(l)) return "epap";
  if (/^ipap$/.test(l)) return "pip";
  if (/ipap|ps\b|pressure support|pressure control|pc |min pressure|max pressure/.test(l)) return "ipap";
  if (/rate/.test(l)) return "rr";
  if (/\bti\b|inspiratory time|time cycle/.test(l)) return "ti";
  return null;
}

/** Message when a value is outside the settable range, else null. */
export function checkRange(kind: RangeKind, value: number): string | null {
  const r = RANGES[kind];
  if (!Number.isFinite(value)) return null;
  if (value < r.min || value > r.max) return `Outside settable range ${r.min}–${r.max} ${r.unit}`;
  return null;
}

/*
 * Initial settings from sex, height, weight and diagnosis.
 * Values per diagnosis × BMI band come from source/settings.jsx (Ventara workbook). Rules from 3.txt:
 *  - Reference Vt = 8 mL/kg IBW (Devine)
 *  - iVAPS (AirCurve, Astral): Target Va = (Vt − 150) × (RR + 2) / 1000, rounded to 0.5 L/min; Target Rate = RR + 2
 *  - Vt rounding: Breas 50 mL, all others 10 mL
 *  - Astral and AirCurve have no backup Ti; VPro has no Ti min
 * The AVAPS-AE-equivalent devices share the AE column values, expressed in each device's own names and scales.
 */
import { SCALES } from "./data";

export type Sex = "male" | "female";
export type Dx = "NMD" | "COPD" | "OHS";

export const DX_LABEL: Record<Dx, string> = {
  NMD: "Neuromuscular disease",
  COPD: "COPD",
  OHS: "Obesity hypoventilation (OHS)",
};

interface Band {
  key: string;
  label: string;
  test: (b: number) => boolean;
}
export const BANDS: Record<Dx, Band[]> = {
  NMD: [
    { key: "lt30", label: "BMI < 30", test: (b) => b < 30 },
    { key: "ge30", label: "BMI ≥ 30", test: (b) => b >= 30 },
  ],
  COPD: [
    { key: "lt30", label: "BMI < 30", test: (b) => b < 30 },
    { key: "ge30", label: "BMI ≥ 30", test: (b) => b >= 30 },
  ],
  OHS: [
    { key: "30to40", label: "BMI 30–40", test: (b) => b >= 30 && b <= 40 },
    { key: "gt40", label: "BMI > 40", test: (b) => b > 40 },
  ],
};

// Column order: NMD<30, NMD≥30, COPD<30, COPD≥30, OHS30–40, OHS>40
const COLS = ["NMD:lt30", "NMD:ge30", "COPD:lt30", "COPD:ge30", "OHS:30to40", "OHS:gt40"];
type Col<T> = [T, T, T, T, T, T];
const at = <T>(c: Col<T>, col: string) => c[COLS.indexOf(col)];

/* ── Workbook values ─────────────────────────────────────────────────────── */

const ST = {
  ipap: [8, 12, 16, 18, 18, 20] as Col<number>,
  epap: [4, 6, 4, 6, 6, 8] as Col<number>,
  rr: [14, 14, 16, 16, 14, 14] as Col<number>,
  tiMin: [1.2, 1.2, 0.9, 1.1, 1.2, 1.2] as Col<number>,
  tiMax: [2, 2, 1.5, 1.5, 2, 2] as Col<number>,
  rise: [300, 300, 200, 200, 300, 300] as Col<number>,
  trigger: ["High", "High", "Medium", "Medium", "Medium", "Medium"] as Col<string>,
  cycle: ["Low", "Low", "High", "Medium", "Low", "Low"] as Col<string>,
};

const IVAPS = {
  epap: [4, 6, 4, 6, 6, 8] as Col<number>,
  psMin: [4, 6, 10, 10, 10, 10] as Col<number>,
  psMax: [16, 18, 18, 18, 20, 22] as Col<number>,
  rr: [14, 14, 16, 16, 14, 14] as Col<number>,
  tiMin: [1.2, 1.2, 0.9, 1.1, 1.2, 1.2] as Col<number>,
  tiMax: [2, 2, 1.5, 1.6, 2, 2] as Col<number>,
  rise: [300, 300, 200, 200, 300, 300] as Col<number>,
  trigger: ST.trigger,
  cycle: ST.cycle,
};

// AVAPS-AE equivalent (Breas Vivo 45 LS VAPS-PS-AE column)
const AE = {
  epapMin: [4, 6, 4, 6, 6, 8] as Col<number>,
  epapMax: [8, 10, 8, 10, 12, 14] as Col<number>,
  psMin: [4, 4, 10, 10, 10, 10] as Col<number>,
  psMax: [10, 10, 18, 18, 18, 20] as Col<number>,
  rr: [14, 14, 16, 16, 14, 14] as Col<number>,
  backupTi: [1.4, 1.4, 1.2, 1.2, 1.4, 1.4] as Col<number>,
  tiMin: [1.2, 1.2, 0.9, 1.1, 1.2, 1.2] as Col<number>,
  tiMax: [2, 2, 1.5, 1.5, 2, 2] as Col<number>,
  breasRise: [4, 4, 2, 2, 3, 3] as Col<number>,
  breasTrigger: [2, 2, 4, 4, 4, 4] as Col<number>,
  breasExpTrigger: [7, 7, 6, 6, 7, 7] as Col<number>,
};

/* ── Scale helpers ───────────────────────────────────────────────────────── */

const stepValue = (key: string, s: number) => SCALES[key].find((e) => e.s === s)!.v;
function nearestStep(key: string, v: number) {
  let best = SCALES[key][0];
  for (const e of SCALES[key]) if (Math.abs(e.v - v) < Math.abs(best.v - v)) best = e;
  return best;
}

/* ── Devices ─────────────────────────────────────────────────────────────── */

export interface SettingRow {
  label: string;
  value: string;
  unit: string;
  volume?: boolean;
  why?: string;
}

interface Ctx {
  col: string;
  vtRef: number; // unrounded 8 mL/kg IBW
}

type Builder = (c: Ctx) => SettingRow[];

const H2O = "cmH₂O";
const roundTo = (v: number, step: number) => Math.round(v / step) * step;
const n = (v: number) => String(v);

function targetVa(c: Ctx, rr: number): SettingRow[] {
  const rate = rr + 2;
  const va = roundTo(((c.vtRef - 150) * rate) / 1000, 0.5);
  return [
    {
      label: "Target Va", value: va.toFixed(1), unit: "L/min", volume: true,
      why: `(${Math.round(c.vtRef)} − 150) × ${rate} ÷ 1000, rounded to 0.5`,
    },
  ];
}
const tidal = (label: string, c: Ctx, step: number): SettingRow => ({
  label, value: n(roundTo(c.vtRef, step)), unit: "mL", volume: true,
  why: `${Math.round(c.vtRef)} mL rounded to ${step} mL`,
});

/** Common AE values converted to a device's own scales. */
function ae(c: Ctx) {
  const col = c.col;
  const riseMs = stepValue("Breas_rise", at(AE.breasRise, col));
  const trigLmin = stepValue("Breas_trigger", at(AE.breasTrigger, col));
  const cyclePct = stepValue("Breas_exp_trigger", at(AE.breasExpTrigger, col));
  return {
    epapMin: at(AE.epapMin, col), epapMax: at(AE.epapMax, col),
    psMin: at(AE.psMin, col), psMax: at(AE.psMax, col),
    rr: at(AE.rr, col), backupTi: at(AE.backupTi, col),
    tiMin: at(AE.tiMin, col), tiMax: at(AE.tiMax, col),
    riseMs, trigLmin, cyclePct,
  };
}

export const SETTINGS_DEVICES: Record<string, { mode: string; build: Builder }> = {
  "ResMed AirCurve 10 ST-A": {
    mode: "S/T",
    build: ({ col }) => [
      { label: "IPAP", value: n(at(ST.ipap, col)), unit: H2O },
      { label: "EPAP", value: n(at(ST.epap, col)), unit: H2O },
      { label: "Respiratory Rate", value: n(at(ST.rr, col)), unit: "bpm" },
      { label: "Ti min", value: n(at(ST.tiMin, col)), unit: "s" },
      { label: "Ti max", value: n(at(ST.tiMax, col)), unit: "s" },
      { label: "Rise", value: n(at(ST.rise, col)), unit: "ms" },
      { label: "Trigger", value: at(ST.trigger, col), unit: "" },
      { label: "Cycle", value: at(ST.cycle, col), unit: "" },
    ],
  },
  "ResMed AirCurve 10 ST-A iVAPS": {
    mode: "iVAPS",
    build: (c) => {
      const col = c.col;
      const rr = at(IVAPS.rr, col);
      return [
        ...targetVa(c, rr),
        { label: "EPAP", value: n(at(IVAPS.epap, col)), unit: H2O },
        { label: "PS min", value: n(at(IVAPS.psMin, col)), unit: H2O },
        { label: "PS max", value: n(at(IVAPS.psMax, col)), unit: H2O },
        { label: "Target Rate", value: n(rr + 2), unit: "bpm", why: `RR ${rr} + 2` },
        { label: "Ti min", value: n(at(IVAPS.tiMin, col)), unit: "s" },
        { label: "Ti max", value: n(at(IVAPS.tiMax, col)), unit: "s" },
        { label: "Rise", value: n(at(IVAPS.rise, col)), unit: "ms" },
        { label: "Trigger", value: at(IVAPS.trigger, col), unit: "" },
        { label: "Cycle", value: at(IVAPS.cycle, col), unit: "" },
      ];
    },
  },
  "ResMed Astral": {
    mode: "iVAPS-AE",
    build: (c) => {
      const v = ae(c);
      return [
        ...targetVa(c, v.rr),
        { label: "Pressure Support min (add to EPAP)", value: n(v.psMin), unit: H2O },
        { label: "Pressure Support max (add to EPAP)", value: n(v.psMax), unit: H2O },
        { label: "EPAP min", value: n(v.epapMin), unit: H2O },
        { label: "EPAP max", value: n(v.epapMax), unit: H2O },
        { label: "Target Rate", value: n(v.rr + 2), unit: "bpm", why: `RR ${v.rr} + 2` },
        { label: "Ti min", value: n(v.tiMin), unit: "s" },
        { label: "Ti max", value: n(v.tiMax), unit: "s" },
        { label: "Rise", value: n(v.riseMs), unit: "ms" },
        { label: "Trigger", value: n(v.trigLmin), unit: "L/min" },
        { label: "Cycle", value: n(v.cyclePct), unit: "%" },
      ];
    },
  },
  "Philips Trilogy EVO / EV300": {
    mode: "AVAPS-AE",
    build: (c) => {
      const v = ae(c);
      const rise = nearestStep("TEVO_rise", v.riseMs);
      return [
        tidal("Tidal Volume", c, 10),
        { label: "PS min", value: n(v.psMin), unit: H2O },
        { label: "PS max", value: n(v.psMax), unit: H2O },
        { label: "EPAP min", value: n(v.epapMin), unit: H2O },
        { label: "EPAP max", value: n(v.epapMax), unit: H2O },
        { label: "Respiratory Rate", value: n(v.rr), unit: "bpm" },
        { label: "Inspiratory Time", value: n(v.backupTi), unit: "s" },
        { label: "Ti min", value: n(v.tiMin), unit: "s" },
        { label: "Ti max", value: n(v.tiMax), unit: "s" },
        { label: "Rise (0–6)", value: n(rise.s as number), unit: `≈${rise.v} ms` },
        { label: "Flow trigger sensitivity", value: n(v.trigLmin), unit: "L/min" },
        { label: "Flow cycle sensitivity", value: n(v.cyclePct), unit: "%" },
      ];
    },
  },
  "Breas Vivo 45 LS": {
    mode: "PSV (TgV) - AE",
    build: (c) => {
      const v = ae(c);
      const col = c.col;
      return [
        tidal("Tidal Volume", c, 50),
        { label: "EPAP min", value: n(v.epapMin), unit: H2O },
        { label: "EPAP max", value: n(v.epapMax), unit: H2O },
        { label: "PS min", value: n(v.psMin), unit: H2O },
        { label: "PS max", value: n(v.psMax), unit: H2O },
        { label: "Respiratory Rate", value: n(v.rr), unit: "bpm" },
        { label: "Back up Inspiratory time", value: n(v.backupTi), unit: "s" },
        { label: "Ti min", value: n(v.tiMin), unit: "s" },
        { label: "Ti max", value: n(v.tiMax), unit: "s" },
        { label: "Rise (1–9)", value: n(at(AE.breasRise, col)), unit: `≈${v.riseMs} ms` },
        { label: "Inspiratory Trigger (1–9)", value: n(at(AE.breasTrigger, col)), unit: `≈${v.trigLmin} L/min` },
        { label: "Expiratory Trigger (1–9)", value: n(at(AE.breasExpTrigger, col)), unit: `≈${v.cyclePct}%` },
      ];
    },
  },
  "Löwenstein Luisa": {
    mode: "TTV-VAPS-AE",
    build: (c) => {
      const v = ae(c);
      const rise = nearestStep("Low_rise", v.riseMs);
      const trig = nearestStep("Low_trigger", v.trigLmin);
      return [
        tidal("Target volume", c, 10),
        { label: "PS", value: n(v.psMin), unit: H2O },
        { label: "PS max", value: n(v.psMax), unit: H2O },
        { label: "EPAP min", value: n(v.epapMin), unit: H2O },
        { label: "EPAP max", value: n(v.epapMax), unit: H2O },
        { label: "Rate", value: n(v.rr), unit: "bpm" },
        { label: "Ti Timed", value: n(v.backupTi), unit: "s" },
        { label: "Ti Min", value: n(v.tiMin), unit: "s" },
        { label: "Ti Max", value: n(v.tiMax), unit: "s" },
        { label: "Pressure Increase (1–4)", value: n(rise.s as number), unit: `≈${rise.v} ms` },
        { label: "Inspiratory Sensitivity (1–10)", value: n(trig.s as number), unit: `≈${trig.v} L/min` },
        { label: "Expiratory Sensitivity", value: n(v.cyclePct), unit: "%" },
      ];
    },
  },
  "React Health VPro": {
    mode: "PS with target volume - IntelliPAP ON",
    build: (c) => {
      const v = ae(c);
      const rise = nearestStep("VPro_rise", v.riseMs);
      return [
        tidal("Tidal Volume", c, 10),
        { label: "PS min", value: n(v.psMin), unit: H2O },
        { label: "PS max", value: n(v.psMax), unit: H2O },
        { label: "PEEP min", value: n(v.epapMin), unit: H2O },
        { label: "PEEP Max", value: n(v.epapMax), unit: H2O },
        { label: "Breath Rate", value: n(v.rr), unit: "bpm" },
        { label: "Inspiratory Time", value: n(v.backupTi), unit: "s" },
        { label: "Time Cycle", value: n(v.tiMax), unit: "s", why: "Time Cycle = Ti max" },
        { label: "Rise Time (1–6)", value: n(rise.s as number), unit: `≈${rise.v} ms` },
        { label: "Flow Trigger", value: n(v.trigLmin), unit: "L/min" },
        { label: "Flow Cycle", value: n(v.cyclePct), unit: "%" },
      ];
    },
  },
};

/* ── Patient math ────────────────────────────────────────────────────────── */

export const ibwKg = (sex: Sex, heightIn: number) => (sex === "female" ? 45.5 : 50) + 2.3 * (heightIn - 60);
export const bmiOf = (kg: number, heightIn: number) => kg / (heightIn * 0.0254) ** 2;

export interface SettingsInput {
  sex: Sex;
  heightIn: number;
  weightKg: number;
  dx: Dx;
  device: string;
}

export interface SettingsResult {
  ibw: number;
  vtRef: number;
  bmi: number;
  band: Band | null;
  device: string;
  mode: string;
  rows: SettingRow[];
}

export function initialSettings(i: SettingsInput): SettingsResult {
  const ibw = ibwKg(i.sex, i.heightIn);
  const vtRef = ibw * 8;
  const bmi = bmiOf(i.weightKg, i.heightIn);
  const band = BANDS[i.dx].find((b) => b.test(bmi)) ?? null;
  const dev = SETTINGS_DEVICES[i.device];
  const rows = band && dev ? dev.build({ col: `${i.dx}:${band.key}`, vtRef }) : [];
  return { ibw, vtRef, bmi, band, device: i.device, mode: dev?.mode ?? "", rows };
}

/* ── Hand-off to the Device Translator ───────────────────────────────────── */

/** Translator device + Ventara mode key for each initial-settings device mode. */
export const TRANSLATOR_TARGET: Record<string, { device: string; mode: string }> = {
  "ResMed AirCurve 10 ST-A": { device: "Resmed Aircurve 10 ST (A)", mode: "Pressure Support" },
  "ResMed AirCurve 10 ST-A iVAPS": { device: "Resmed Aircurve 10 ST (A)", mode: "VAPS-PS" },
  "ResMed Astral": { device: "Resmed Astral", mode: "VAPS-AE PS" },
  "Philips Trilogy EVO / EV300": { device: "Trilogy EVO/EV300", mode: "VAPS-AE PS" },
  "Breas Vivo 45 LS": { device: "Breas Vivo 45LS", mode: "VAPS-AE PS" },
  "Löwenstein Luisa": { device: "Lowenstein Luisa", mode: "VAPS-AE PS" },
  "React Health VPro": { device: "React Health VPro", mode: "VAPS-AE PS" },
};

/** Translator field id for a settings row label (device nomenclature → canonical id). */
export function canonicalId(label: string): string | null {
  const l = label.toLowerCase();
  if (/target va/.test(l)) return "target_va";
  if (/volume/.test(l)) return "vt";
  if (/^ipap$/.test(l)) return "pip";
  if (/(epap|peep) ?min/.test(l)) return "epap_min";
  if (/(epap|peep) ?max/.test(l)) return "epap_max";
  if (/^epap$/.test(l)) return "epap";
  if (/(ps|pressure support) ?min|^ps$/.test(l)) return "ipap_min";
  if (/(ps|pressure support) ?max/.test(l)) return "ipap_max";
  if (/rate/.test(l)) return "rr";
  if (/ti ?min/.test(l)) return "ti_min";
  if (/ti ?max|time cycle/.test(l)) return "ti_max";
  if (/inspiratory time|back ?up|ti timed/.test(l)) return "ti_backup";
  if (/rise|pressure increase/.test(l)) return "rise";
  if (/expiratory|cycle/.test(l)) return "cycle";
  if (/trigger|inspiratory sensitivity/.test(l)) return "trigger";
  return null;
}

/** Source-field values for the translator, from an initial-settings result. */
export function toTranslatorInput(res: SettingsResult): { srcDev: string; srcMode: string; tgtDev: string; values: Record<string, string> } | null {
  const t = TRANSLATOR_TARGET[res.device];
  if (!t) return null;
  const values: Record<string, string> = {};
  for (const r of res.rows) {
    const id = canonicalId(r.label);
    if (id) values[id] = /^[A-Za-z]/.test(r.value) ? r.value.toLowerCase() : r.value;
  }
  return { srcDev: t.device, srcMode: t.mode, tgtDev: "", values };
}

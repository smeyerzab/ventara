/*
 * Same-mode cross-device translation engine.
 * Faithful port of Ventara v13 (source/v13-translator.html), separated from the UI
 * so it can be unit-tested. Behaviour changes here are clinical changes.
 */
import {
  ALL_DEVICES,
  COMPAT,
  CYCLE_DEFAULT_PCT,
  DEV_MODES,
  NO_CYCLE_MODES,
  SCALES,
  TR_MODES,
  VA_MODES,
} from "./data";
import { alertsFor } from "./alerts";
import { checkRange, kindForField } from "./ranges";
import type {
  Badge,
  Canon,
  CompatEntry,
  Field,
  ModeConfig,
  ResultRow,
  TranslationError,
  TranslationResult,
} from "./types";

const SINGLE_TI_IDS = new Set(["ti", "ti_backup"]);
const H2O = "cmH₂O";

export const calcTiFromRR = (rr: number) => Math.round((60 / rr / 3) * 10) / 10;

const usesVa = (d: string, vk: string) => !!VA_MODES[d]?.includes(vk);
const usesTR = (d: string, vk: string) => !!TR_MODES[d]?.includes(vk);

function closest(val: number, key: string) {
  let best: { s: number | string; v: number } | null = null;
  let bd = Infinity;
  for (const e of SCALES[key] ?? []) {
    const d = Math.abs(e.v - val);
    if (d < bd) {
      bd = d;
      best = e;
    }
  }
  return best ? { s: best.s, v: best.v, approx: bd > 0 } : null;
}

const exactV = (raw: string, key: string) =>
  (SCALES[key] ?? []).find((x) => String(x.s) === String(raw))?.v ?? null;

const verbalToV = (s: string, key: string) =>
  (SCALES[key] ?? []).find((x) => x.s === s)?.v ?? null;

const cycleVerbalKey = (f: Field) =>
  (f.opts ?? []).includes("very low") ? "ResMed_cycle_verbal" : "V60_cycle_verbal";

/* ── Device catalogue helpers for the UI ─────────────────────────────────── */

export const devices = (): readonly string[] => ALL_DEVICES;

export const modesFor = (device: string): [string, ModeConfig][] =>
  Object.entries(DEV_MODES[device] ?? {}).filter((e): e is [string, ModeConfig] => !!e[1]);

export const modeConfig = (device: string, vk: string): ModeConfig | undefined =>
  DEV_MODES[device]?.[vk];

export function targetsFor(srcDev: string, vk: string) {
  const cmap = COMPAT[vk] ?? {};
  return ALL_DEVICES.filter((d) => d !== srcDev && cmap[d]).map((d) => ({
    device: d,
    compat: cmap[d] as CompatEntry,
    modeName: DEV_MODES[d]?.[cmap[d].vk]?.mode ?? "",
  }));
}

/** Options for an ordinal/verbal source field, as [value, label] pairs. */
export function fieldOptions(f: Field): [string, string][] {
  if (f.t === "verbal") return (f.opts ?? []).map((o) => [o, o]);
  const sc = SCALES[f.key ?? ""] ?? [];
  if (f.id === "trigger") return sc.map((e) => [String(e.s), `${e.s} · ${e.v} L/min`]);
  if (f.id === "cycle") return sc.map((e) => [String(e.s), `${e.s} · ${e.v}%`]);
  if (f.id === "rise") return sc.map((e) => [String(e.s), `${e.s} · ${e.v} ms`]);
  return sc.map((e) => [String(e.s), String(e.s)]);
}

/* ── Source → canonical → target ─────────────────────────────────────────── */

function srcToCanon(f: Field, raw: string, srcEpap: number | null): Canon | null {
  if (f.t === "number") {
    const v = parseFloat(raw);
    if (f.pref === "ae_ps") return { value: v, unit: H2O, pref: "ae_ps" };
    if (f.pref === "above_epap" && srcEpap != null)
      return {
        value: v + srcEpap,
        unit: H2O,
        pref: "absolute",
        formula: `${v} + EPAP ${srcEpap} = ${v + srcEpap} ${H2O}`,
      };
    if (f.pref === "absolute") return { value: v, unit: H2O, pref: "absolute" };
    if (f.pref === "ms") return { value: v, unit: "ms", pref: "ms" };
    if (f.pref === "lmin") return { value: v, unit: "L/min", pref: "lmin" };
    if (f.pref === "pct") return { value: v, unit: "%", pref: "pct" };
    return { value: v, unit: f.unit, pref: "num" };
  }
  if (f.t === "ordinal") {
    const v = exactV(raw, f.key ?? "");
    if (v == null) return null;
    if (f.id === "rise") return { value: v, unit: "ms", pref: "ms" };
    if (f.id === "trigger") return { value: v, unit: "L/min", pref: "lmin" };
    if (f.id === "cycle") return { value: v, unit: "%", pref: "pct" };
  }
  if (f.t === "verbal") {
    if (f.id === "trigger") {
      const v = verbalToV(raw, "ResMed_trigger_verbal");
      return v != null ? { value: v, unit: "L/min", pref: "lmin" } : null;
    }
    if (f.id === "cycle") {
      const v = verbalToV(raw, cycleVerbalKey(f));
      return v != null ? { value: v, unit: "%", pref: "pct" } : null;
    }
  }
  return null;
}

interface TgtValue {
  display: string;
  unit: string;
  badge: "direct" | "exact" | "closest" | "calculated" | "review";
  sub?: string;
  formula?: string;
  scaleKey?: string;
}

function canonToTgt(c: Canon, tf: Field, tgtEpap: number | null): TgtValue | null {
  if (c.value == null || Number.isNaN(c.value)) return null;
  if (tf.t === "number") {
    let val = c.value;
    let formula: string | undefined;
    if (tf.pref === "ae_ps" && c.pref === "ae_ps")
      return { display: String(val), unit: tf.unit, badge: "direct" };
    if ((tf.pref === "ae_ps" || tf.pref === "above_epap") && c.pref === "absolute" && tgtEpap != null) {
      val = parseFloat((c.value - tgtEpap).toFixed(1));
      formula = `${c.value} − EPAP ${tgtEpap} = ${val} ${H2O}`;
    }
    if (tf.pref === "absolute" && c.pref === "ae_ps")
      return {
        display: String(c.value),
        unit: tf.unit,
        badge: "review",
        formula: "AE PS/PC → non-AE: verify EPAP offset.",
      };
    if (tf.pref === "ms" && c.pref === "ms") return { display: String(c.value), unit: "ms", badge: "direct" };
    if (tf.pref === "lmin" && c.pref === "lmin") return { display: String(c.value), unit: tf.unit, badge: "direct" };
    if (tf.pref === "pct" && c.pref === "pct") return { display: String(c.value), unit: tf.unit, badge: "direct" };
    const display = Number.isInteger(val) ? String(val) : parseFloat(val.toFixed(1)).toString();
    return { display, unit: tf.unit, badge: formula ? "calculated" : "direct", formula };
  }
  if (tf.t === "ordinal") {
    const key = tf.key ?? "";
    if (tf.id === "rise" && c.pref === "ms") {
      const r = closest(c.value, key);
      if (!r) return null;
      return {
        display: String(r.s),
        unit: tf.unit,
        badge: r.approx ? "closest" : "exact",
        sub: r.approx ? `approx. ${c.value} ms → nearest step ${r.s}` : undefined,
        scaleKey: key,
      };
    }
    if (tf.id === "trigger" && c.pref === "lmin") {
      const r = closest(c.value, key);
      if (!r) return null;
      return {
        display: String(r.s),
        unit: tf.unit,
        badge: r.approx ? "closest" : "exact",
        sub: r.approx ? `${c.value} L/min → nearest ${r.v} L/min (step ${r.s})` : undefined,
        scaleKey: key,
      };
    }
    if (tf.id === "cycle" && c.pref === "pct") {
      const r = closest(c.value, key);
      if (!r) return null;
      return {
        display: String(r.s),
        unit: tf.unit,
        badge: r.approx ? "closest" : "exact",
        sub: r.approx ? `wanted ${c.value}% → nearest ${r.v}%` : undefined,
        scaleKey: key,
      };
    }
  }
  if (tf.t === "verbal") {
    if (tf.id === "trigger" && c.pref === "lmin") {
      const r = closest(c.value, "ResMed_trigger_verbal");
      if (!r) return null;
      return {
        display: String(r.s),
        unit: "",
        badge: r.approx ? "closest" : "exact",
        sub: r.approx ? `${c.value} L/min → ${r.s}` : undefined,
        scaleKey: "ResMed_trigger_verbal",
      };
    }
    if (tf.id === "cycle" && c.pref === "pct") {
      const r = closest(c.value, cycleVerbalKey(tf));
      if (!r) return null;
      return { display: String(r.s), unit: "", badge: r.approx ? "closest" : "exact", scaleKey: cycleVerbalKey(tf) };
    }
  }
  return null;
}

export interface TranslateInput {
  srcDev: string;
  srcMode: string; // Ventara mode key
  tgtDev: string;
  values: Record<string, string>; // raw source inputs keyed by field id
}

export interface AdjustContext {
  canon: Record<string, Canon>;
  srcEpap: number | null;
  notes: string[];
  srcFields: Field[];
  tgtFields: Field[];
}

export interface TranslateOptions {
  /** Translate into this Ventara mode family on the target instead of the same-family pathway. */
  targetModeKey?: string;
  /** Hook to add or rewrite canonical values before target rendering (cross-family bridging). */
  adjust?: (ctx: AdjustContext) => void;
}

export function translate(input: TranslateInput, opts: TranslateOptions = {}): TranslationResult | TranslationError {
  const { srcDev, srcMode: vk, tgtDev, values } = input;
  if (!srcDev || !vk || !tgtDev) return { ok: false, reason: "Select source device, mode, and target device." };
  const compat: CompatEntry | undefined = opts.targetModeKey
    ? DEV_MODES[tgtDev]?.[opts.targetModeKey]
      ? { vk: opts.targetModeKey, match: "bridge" }
      : undefined
    : COMPAT[vk]?.[tgtDev];
  const srcConfig = DEV_MODES[srcDev]?.[vk];
  if (!compat || !srcConfig) return { ok: false, reason: "No compatible mode for this combination." };

  const tgtVk = compat.vk;
  const tgtConfig = DEV_MODES[tgtDev]?.[tgtVk];
  if (!tgtConfig) return { ok: false, reason: "No compatible mode for this combination." };

  const get = (id: string) => (values[id] ?? "").trim();
  const srcFields = srcConfig.fields;
  const tgtFields = tgtConfig.fields;
  const isBridge = compat.match === "bridge";

  const srcEpapRaw = get("epap") || get("epap_min");
  const srcEpap = srcEpapRaw ? parseFloat(srcEpapRaw) : null;

  const canon: Record<string, Canon> = {};
  for (const f of srcFields) {
    const raw = get(f.id);
    if (!raw) continue;
    const c = srcToCanon(f, raw, srcEpap);
    if (c) canon[f.id] = c;
  }
  const adjustNotes: string[] = [];
  opts.adjust?.({ canon, srcEpap, notes: adjustNotes, srcFields, tgtFields });
  // EPAP the target expresses "above EPAP" pressures against (bridging may have replaced it).
  const tgtEpap = canon.epap?.value ?? canon.epap_min?.value ?? srcEpap;

  const srcHasCycle = srcFields.some((f) => f.id === "cycle");
  const srcIsTimeCycled = NO_CYCLE_MODES.includes(vk) || !srcHasCycle;
  const srcHasTiMin = srcFields.some((f) => f.id === "ti_min");
  const srcHasTiMax = srcFields.some((f) => f.id === "ti_max");
  const srcHasSingleTi = srcFields.some((f) => SINGLE_TI_IDS.has(f.id));
  const tgtNeedsSingleTi = tgtFields.some((f) => SINGLE_TI_IDS.has(f.id));
  const tgtNeedsTiMin = tgtFields.some((f) => f.id === "ti_min");
  const tgtNeedsTiMax = tgtFields.some((f) => f.id === "ti_max");

  // ResMed iVAPS "Target Rate" = patient RR + 2
  const srcIsTR = usesTR(srcDev, vk);
  const rawRR = canon.rr ? canon.rr.value : null;
  const patientRR = rawRR ? (srcIsTR ? rawRR - 2 : rawRR) : null;

  const tiCalcNotes: string[] = [];
  if (srcHasTiMin && srcHasTiMax && !srcHasSingleTi && tgtNeedsSingleTi && patientRR) {
    const ct = calcTiFromRR(patientRR);
    const fm = `Ti = 60 ÷ ${patientRR} ÷ 3 = ${ct} s (1:2 I:E from backup rate)`;
    for (const tf of tgtFields.filter((f) => SINGLE_TI_IDS.has(f.id)))
      if (!canon[tf.id]) canon[tf.id] = { value: ct, unit: "s", pref: "num", derived: true, formula: fm };
    tiCalcNotes.push(fm);
  }

  let stiVal: number | null = null;
  if (srcHasSingleTi) {
    const sf = srcFields.find((f) => SINGLE_TI_IDS.has(f.id));
    if (sf && canon[sf.id]) stiVal = canon[sf.id].value;
  }
  if (!stiVal && patientRR) stiVal = calcTiFromRR(patientRR);
  if (stiVal) {
    if (tgtNeedsTiMin && !canon.ti_min) {
      const v = Math.max(0.1, Math.round((stiVal - 0.2) * 10) / 10);
      const fm = `Ti min = ${stiVal} − 0.2 = ${v} s`;
      canon.ti_min = { value: v, unit: "s", pref: "num", derived: true, formula: fm };
      tiCalcNotes.push(fm);
    }
    if (tgtNeedsTiMax && !canon.ti_max) {
      const v = Math.round((stiVal + 0.6) * 10) / 10;
      const fm = `Ti max = ${stiVal} + 0.6 = ${v} s`;
      canon.ti_max = { value: v, unit: "s", pref: "num", derived: true, formula: fm };
      tiCalcNotes.push(fm);
    }
  }

  // Alveolar ventilation <-> tidal volume (150 mL anatomic dead space)
  const srcIsVa = usesVa(srcDev, vk);
  const tgtIsVa = usesVa(tgtDev, tgtVk);
  if (srcIsVa && !tgtIsVa && canon.target_va && patientRR != null && rawRR != null) {
    const tr = srcIsTR ? rawRR : patientRR + 2;
    const vt = Math.round((canon.target_va.value / tr) * 1000 + 150);
    canon.vt = {
      value: vt,
      unit: "mL",
      pref: "num",
      derived: true,
      formula: `VT = (${canon.target_va.value} ÷ ${tr} × 1000) + 150 = ${vt} mL`,
    };
    if (canon.rr)
      canon.rr = {
        value: patientRR,
        unit: "bpm",
        pref: "num",
        derived: true,
        formula: `RR = Target Rate ${rawRR} − 2 = ${patientRR} bpm`,
      };
  }
  if (!srcIsVa && tgtIsVa && canon.vt && patientRR != null) {
    const tr = patientRR + 2;
    const va = parseFloat((((canon.vt.value - 150) * tr) / 1000).toFixed(2));
    canon.target_va = {
      value: va,
      unit: "L/min",
      pref: "num",
      derived: true,
      formula: `Va = (${canon.vt.value} − 150) × ${tr} ÷ 1000 = ${va} L/min`,
    };
    if (canon.rr)
      canon.rr = {
        value: tr,
        unit: "bpm",
        pref: "num",
        derived: true,
        formula: `Target Rate = RR ${patientRR} + 2 = ${tr} bpm`,
      };
  }

  const bridgeMap: Record<string, Canon> = {};
  if (isBridge && compat.bridges)
    for (const b of compat.bridges) {
      const c = canon[b.src];
      if (!c) continue;
      for (const tid of b.tgt) bridgeMap[tid] = { ...c, bridgeNote: b.note ?? null };
    }

  const derivations: string[] = [];
  for (const c of Object.values(canon))
    if (c.formula && !tiCalcNotes.includes(c.formula)) derivations.push(c.formula);
  for (const n of tiCalcNotes) if (!derivations.includes(n)) derivations.push(n);

  const bridgeNotes: string[] = [];
  let cycleDefaulted = false;

  const rows: ResultRow[] = tgtFields.map((tf) => {
    const isBridgedField = isBridge && bridgeMap[tf.id] !== undefined;
    let c: Canon | undefined = isBridgedField ? bridgeMap[tf.id] : canon[tf.id];
    if (tf.id === "cycle" && !c && srcIsTimeCycled) {
      c = { value: CYCLE_DEFAULT_PCT, unit: "%", pref: "pct", isDefault: true };
      cycleDefaulted = true;
    }
    const bn = isBridgedField ? bridgeMap[tf.id].bridgeNote : null;
    if (bn && !bridgeNotes.includes(bn)) bridgeNotes.push(bn);

    if (!c || c.value == null) return { field: tf, display: null, unit: tf.unit, badge: "missing" };
    const r = canonToTgt(c, tf, tgtEpap);
    if (!r) return { field: tf, display: null, unit: tf.unit, badge: "nomatch" };

    const derived = c.derived || r.badge === "calculated";
    let badge: Badge;
    if (c.isDefault) badge = "default";
    else if (c.review || r.badge === "review") badge = "review";
    else if (derived) badge = "calculated";
    else if (isBridgedField) badge = "bridged";
    else badge = r.badge;

    if (r.formula && !derivations.includes(r.formula)) derivations.push(r.formula);
    const kind = kindForField(tf.id, r.unit || tf.unit);
    const numeric = tf.t === "number" ? parseFloat(r.display) : NaN;
    return {
      field: tf,
      display: r.display,
      unit: r.unit,
      badge,
      sub: r.sub,
      formula: c.formula ?? r.formula,
      scale: r.scaleKey ? { key: r.scaleKey, value: c.value, unit: c.unit } : undefined,
      warn: kind && Number.isFinite(numeric) ? (checkRange(kind, numeric) ?? undefined) : undefined,
    };
  });

  return {
    ok: true,
    targetDevice: tgtDev,
    targetModeKey: tgtVk,
    targetModeName: tgtConfig.mode,
    isBridge,
    compatNote: compat.note,
    rows,
    derivations: [...new Set(derivations)],
    bridgeNotes: [...bridgeNotes, ...adjustNotes],
    cycleDefaulted,
    flags: alertsFor(tgtDev, tgtVk),
  };
}

/* ── Round trip and compare-all ──────────────────────────────────────────── */

export interface RoundTripDiff {
  field: Field;
  original: string;
  after: string | null;
}
export type RoundTrip =
  | { status: "ok"; diffs: RoundTripDiff[]; back: TranslationResult }
  | { status: "unavailable"; reason: string };

/** Feed the translated settings back into the source device and report what changed. */
export function roundTrip(input: TranslateInput, result: TranslationResult): RoundTrip {
  const backCompat = COMPAT[result.targetModeKey]?.[input.srcDev];
  if (!backCompat) return { status: "unavailable", reason: "no return pathway" };
  if (backCompat.vk !== input.srcMode) return { status: "unavailable", reason: `returns as ${backCompat.vk}` };
  const values: Record<string, string> = {};
  for (const row of result.rows) if (row.display != null) values[row.field.id] = row.display;
  const back = translate({ srcDev: result.targetDevice, srcMode: result.targetModeKey, tgtDev: input.srcDev, values });
  if (!back.ok) return { status: "unavailable", reason: back.reason };
  const diffs: RoundTripDiff[] = [];
  for (const f of DEV_MODES[input.srcDev]?.[input.srcMode]?.fields ?? []) {
    const original = (input.values[f.id] ?? "").trim();
    if (!original) continue;
    const after = back.rows.find((r) => r.field.id === f.id)?.display ?? null;
    const same =
      after != null && (f.t === "number" ? Math.abs(parseFloat(after) - parseFloat(original)) < 1e-9 : String(after) === original);
    if (!same) diffs.push({ field: f, original, after });
  }
  return { status: "ok", diffs, back };
}

/** Translate one source to every compatible target. */
export function compareAll(srcDev: string, srcMode: string, values: Record<string, string>) {
  return targetsFor(srcDev, srcMode).flatMap((target) => {
    const result = translate({ srcDev, srcMode, tgtDev: target.device, values });
    return result.ok ? [{ target, result }] : [];
  });
}

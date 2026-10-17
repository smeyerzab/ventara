/*
 * Cross-family translation: any source device/mode → any Ventara mode family on any device.
 * Runs the same-mode translator with a target-family override and a bridging hook that fills the
 * canonical values the new family needs. Bridging rules are Phil's from the cross-mode chats:
 *   fixed pressure → volume-targeted: PS band = support −2 / +4 around the working support
 *   fixed EPAP → auto-EPAP: EPAP min = EPAP, EPAP max = EPAP + 4 (default)
 *   single Ti → Ti window: Ti −0.2 / +0.4
 * Values the source cannot provide (delivered Vt, observed IPAP / EPAP) are entered by the clinician.
 */
import { ALL_DEVICES, DEV_MODES } from "./data";
import { translate, type AdjustContext, type TranslateInput } from "./translate";
import type { Canon, TranslationError, TranslationResult } from "./types";

export type Family = "Pressure Support" | "PAC" | "VAPS-PS" | "VAPS-PC" | "VAPS-AE PS" | "VAPS-AE PC";

export interface FamilyInfo {
  key: Family;
  label: string;
  volume: boolean;
  cycling: "flow" | "time";
  autoEpap: boolean;
}

export const FAMILIES: FamilyInfo[] = [
  { key: "Pressure Support", label: "Pressure Support", volume: false, cycling: "flow", autoEpap: false },
  { key: "PAC", label: "PAC", volume: false, cycling: "time", autoEpap: false },
  { key: "VAPS-PS", label: "VAPS-PS", volume: true, cycling: "flow", autoEpap: false },
  { key: "VAPS-PC", label: "VAPS-PC", volume: true, cycling: "time", autoEpap: false },
  { key: "VAPS-AE PS", label: "VAPS-AE PS", volume: true, cycling: "flow", autoEpap: true },
  { key: "VAPS-AE PC", label: "VAPS-AE PC", volume: true, cycling: "time", autoEpap: true },
];
export const familyInfo = (key: string) => FAMILIES.find((f) => f.key === key);
export const familyTraits = (f: FamilyInfo) =>
  [f.volume ? "volume-targeted" : "fixed pressure", f.cycling === "flow" ? "flow-cycled" : "time-cycled", f.autoEpap ? "auto-EPAP" : "fixed EPAP"];

/** Devices offering a family as a cross-mode target. Trilogy 100 is excluded (discontinued, per Phil). */
export const devicesForFamily = (family: string): string[] => ALL_DEVICES.filter((d) => d !== "Trilogy 100" && DEV_MODES[d]?.[family]);

export type ExtraKey = "vt" | "observedIpap" | "observedEpap";
export type Extras = Partial<Record<ExtraKey, string>>;

export const EXTRA_FIELDS: Record<ExtraKey, { label: string; unit: string; hint: string }> = {
  vt: { label: "Delivered Vt", unit: "mL", hint: "average exhaled Vt on the current device" },
  observedIpap: { label: "Observed IPAP", unit: "cmH₂O", hint: "pressure the device is actually delivering" },
  observedEpap: { label: "Observed EPAP", unit: "cmH₂O", hint: "average auto-EPAP on the current device" },
};

/** Which extra inputs the bridge from one family to another needs. */
export function extrasNeeded(src: string, tgt: string): ExtraKey[] {
  const s = familyInfo(src);
  const t = familyInfo(tgt);
  if (!s || !t) return [];
  const out: ExtraKey[] = [];
  if (!s.volume && t.volume) out.push("vt");
  if (s.volume && !t.volume) out.push("observedIpap");
  if (s.autoEpap && !t.autoEpap) out.push("observedEpap");
  return out;
}

const H2O = "cmH₂O";
const num = (s?: string) => {
  const n = parseFloat(s ?? "");
  return Number.isFinite(n) ? n : null;
};
const r1 = (n: number) => Math.round(n * 10) / 10;

function bridge(ctx: AdjustContext, s: FamilyInfo, t: FamilyInfo, extras: Extras) {
  const { canon, notes } = ctx;
  const epap = canon.epap?.value ?? canon.epap_min?.value ?? ctx.srcEpap;
  const absolute = (c: Canon | undefined) => (c == null ? null : c.pref === "absolute" ? c.value : (epap ?? 0) + c.value);
  const has = (id: string) => ctx.tgtFields.some((f) => f.id === id);

  // Volume: fixed pressure → volume-targeted
  if (!s.volume && t.volume) {
    const vt = num(extras.vt);
    if (vt != null) canon.vt = { value: vt, unit: "mL", pref: "num" };
    const pip = absolute(canon.pip);
    if (pip != null && epap != null) {
      const support = pip - epap;
      const lo = Math.max(epap, pip - 2);
      canon.ipap_min = {
        value: lo, unit: H2O, pref: "absolute", derived: true,
        formula: `IPAP min = IPAP ${pip} − 2 = ${lo} ${H2O} (PS band ${support} − 2)`,
        review: pip - 2 < epap,
      };
      canon.ipap_max = {
        value: pip + 4, unit: H2O, pref: "absolute", derived: true,
        formula: `IPAP max = IPAP ${pip} + 4 = ${pip + 4} ${H2O} (PS band ${support} + 4)`,
      };
      notes.push(`Pressure band set −2 / +4 around the working support (IPAP − EPAP = ${support} ${H2O}) so the volume target starts where the patient was.`);
    }
    if (vt == null) notes.push("Enter the delivered Vt from the current device to set the volume target.");
  }

  // Volume: volume-targeted → fixed pressure
  if (s.volume && !t.volume) {
    const obs = num(extras.observedIpap);
    const max = absolute(canon.ipap_max);
    if (obs != null) canon.pip = { value: obs, unit: H2O, pref: "absolute", derived: true, formula: `IPAP = observed delivered IPAP ${obs} ${H2O}` };
    else if (max != null)
      canon.pip = { value: max, unit: H2O, pref: "absolute", derived: true, review: true, formula: `IPAP = IPAP max ${max} ${H2O} (no observed IPAP entered)` };
    notes.push("The volume target is dropped; the fixed IPAP should be the pressure the device was actually delivering.");
  }

  // EPAP: fixed → auto
  if (!s.autoEpap && t.autoEpap && epap != null) {
    canon.epap_min = { value: epap, unit: H2O, pref: "num" };
    canon.epap_max = { value: epap + 4, unit: H2O, pref: "num", isDefault: true, formula: `EPAP max = EPAP ${epap} + 4 = ${epap + 4} ${H2O} (default)` };
    notes.push("Fixed EPAP becomes an auto-EPAP range: EPAP min = current EPAP, EPAP max defaults to +4.");
  }

  // EPAP: auto → fixed
  if (s.autoEpap && !t.autoEpap) {
    const obs = num(extras.observedEpap);
    const min = canon.epap_min?.value;
    if (obs != null) canon.epap = { value: obs, unit: H2O, pref: "num", derived: true, formula: `EPAP = observed average EPAP ${obs} ${H2O}` };
    else if (min != null) canon.epap = { value: min, unit: H2O, pref: "num", derived: true, review: true, formula: `EPAP = EPAP min ${min} ${H2O} (no observed EPAP entered)` };
    notes.push("The auto-EPAP range collapses to one fixed EPAP; use the average EPAP the device settled at.");
  }

  // Cycling: single Ti ↔ Ti window and backup Ti
  const singleTi = canon.ti?.value ?? canon.ti_backup?.value ?? null;
  if (singleTi != null) {
    if (has("ti_min") && !canon.ti_min)
      canon.ti_min = { value: r1(singleTi - 0.2), unit: "s", pref: "num", derived: true, formula: `Ti min = ${singleTi} − 0.2 = ${r1(singleTi - 0.2)} s` };
    if (has("ti_max") && !canon.ti_max)
      canon.ti_max = { value: r1(singleTi + 0.4), unit: "s", pref: "num", derived: true, formula: `Ti max = ${singleTi} + 0.4 = ${r1(singleTi + 0.4)} s` };
    if (has("ti_backup") && !canon.ti_backup) canon.ti_backup = { value: singleTi, unit: "s", pref: "num" };
    if (has("ti") && !canon.ti) canon.ti = { value: singleTi, unit: "s", pref: "num" };
  }
  if (s.cycling !== t.cycling)
    notes.push(
      t.cycling === "flow"
        ? "Time-cycled → flow-cycled: the fixed Ti becomes a Ti min/max window; cycle sensitivity has no source value and defaults to 25%."
        : "Flow-cycled → time-cycled: the device now ends every breath at the set Ti; the cycle sensitivity no longer applies.",
    );
}

export interface AcrossInput extends TranslateInput {
  targetFamily: Family;
  extras: Extras;
}

/** Translate into another mode family (or the same family on another device). */
export function translateAcross(input: AcrossInput): TranslationResult | TranslationError {
  const s = familyInfo(input.srcMode);
  const t = familyInfo(input.targetFamily);
  if (!s || !t) return { ok: false, reason: "Unknown mode family." };
  if (input.srcDev === input.tgtDev && input.srcMode === input.targetFamily) return { ok: false, reason: "Same device and mode." };
  return translate(input, { targetModeKey: input.targetFamily, adjust: (ctx) => bridge(ctx, s, t, input.extras) });
}

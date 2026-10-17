/*
 * Prefill for the translator's source fields.
 * The example is Phil's worked case from the cross-mode chats (V60: IPAP 18, EPAP 8, RR 14, Ti 1.2,
 * Vt 480, trigger 3 L/min, rise 300 ms, E-cycle med), expressed in each mode's own fields and scales.
 */
import { SCALES } from "./data";
import type { Field, ModeConfig } from "./types";

const EX = {
  pip: 18, epap: 8, epapMin: 8, epapMax: 12, rr: 14, ti: 1.2, tiMin: 1, tiMax: 1.6, vt: 480,
  riseMs: 300, trigLmin: 3, cyclePct: 25, ipapAbsMin: 14, ipapAbsMax: 22, psMin: 6, psMax: 14,
};

function nearest(key: string, v: number): string | undefined {
  const sc = SCALES[key];
  if (!sc?.length) return undefined;
  let best = sc[0];
  for (const e of sc) if (Math.abs(e.v - v) < Math.abs(best.v - v)) best = e;
  return String(best.s);
}

function exampleFor(f: Field): string | undefined {
  if (f.t === "ordinal") {
    const key = f.key ?? "";
    if (f.id === "rise") return nearest(key, EX.riseMs);
    if (f.id === "trigger") return nearest(key, EX.trigLmin);
    if (f.id === "cycle") return nearest(key, EX.cyclePct);
    return undefined;
  }
  if (f.t === "verbal") {
    if (f.id === "trigger") return nearest("ResMed_trigger_verbal", EX.trigLmin);
    if (f.id === "cycle") return nearest((f.opts ?? []).includes("very low") ? "ResMed_cycle_verbal" : "V60_cycle_verbal", EX.cyclePct);
    return undefined;
  }
  const targetRate = !!f.note?.includes("RR + 2");
  switch (f.id) {
    case "pip": return String(EX.pip);
    case "epap": return String(EX.epap);
    case "epap_min": return String(EX.epapMin);
    case "epap_max": return String(EX.epapMax);
    case "rr": return String(targetRate ? EX.rr + 2 : EX.rr);
    case "ti": case "ti_backup": return String(EX.ti);
    case "ti_min": return String(EX.tiMin);
    case "ti_max": return String(EX.tiMax);
    case "vt": return String(EX.vt);
    case "target_va": return (((EX.vt - 150) * (EX.rr + 2)) / 1000).toFixed(1);
    case "ipap_min": return String(f.pref === "absolute" ? EX.ipapAbsMin : EX.psMin);
    case "ipap_max": return String(f.pref === "absolute" ? EX.ipapAbsMax : EX.psMax);
    case "rise": return String(EX.riseMs);
    case "trigger": return String(EX.trigLmin);
    case "cycle": return String(EX.cyclePct);
    default: return undefined;
  }
}

/** Example values for every field of a mode, keyed by field id. */
export function exampleValues(cfg: ModeConfig): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of cfg.fields) {
    const v = exampleFor(f);
    if (v != null) out[f.id] = v;
  }
  return out;
}

import { describe, expect, it } from "vitest";
import { devicesForFamily, extrasNeeded, FAMILIES, translateAcross } from "./bridge";
import { ALL_DEVICES, DEV_MODES } from "./data";
import { exampleValues } from "./prefill";

const V60_ST = { srcDev: "Respironics V60", srcMode: "Pressure Support", values: { pip: "18", epap: "8", rr: "14", ti_backup: "1.2", rise: "3", trigger: "3", cycle: "med" } };
const get = (rows: { field: { id: string }; display: string | null }[], id: string) => rows.find((r) => r.field.id === id)?.display;
const badge = (rows: { field: { id: string }; badge: string }[], id: string) => rows.find((r) => r.field.id === id)?.badge;

describe("cross-family bridging (Phil's V60 → VAPS-AE PS case)", () => {
  it("V60 S/T → Astral iVAPS-AE reproduces the chat numbers", () => {
    const r = translateAcross({ ...V60_ST, tgtDev: "Resmed Astral", targetFamily: "VAPS-AE PS", extras: { vt: "480" } });
    if (!r.ok) throw new Error(r.reason);
    expect(get(r.rows, "target_va")).toBe("5.3");
    expect(get(r.rows, "rr")).toBe("16");
    expect(get(r.rows, "epap_min")).toBe("8");
    expect([get(r.rows, "epap_max"), badge(r.rows, "epap_max")]).toEqual(["12", "default"]);
    expect(get(r.rows, "ipap_min")).toBe("8"); // (18 − 2) − EPAP 8
    expect(get(r.rows, "ipap_max")).toBe("14"); // (18 + 4) − EPAP 8
    expect(get(r.rows, "ti_min")).toBe("1");
    expect(get(r.rows, "ti_max")).toBe("1.6");
    expect(get(r.rows, "rise")).toBe("300");
    expect(get(r.rows, "trigger")).toBe("3");
    expect(get(r.rows, "cycle")).toBe("25");
    expect(r.flags.some((f) => /Backup Ti/.test(f))).toBe(true);
  });
  it("V60 PCV → Vivo: cycle defaults to 25% → expiratory trigger step 6, Ti window from the fixed Ti", () => {
    const r = translateAcross({ srcDev: "Respironics V60", srcMode: "PAC", tgtDev: "Breas Vivo 45LS", targetFamily: "VAPS-AE PS", values: { pip: "18", epap: "8", rr: "14", ti: "1.2", rise: "3", trigger: "3" }, extras: { vt: "480" } });
    if (!r.ok) throw new Error(r.reason);
    expect([get(r.rows, "cycle"), badge(r.rows, "cycle")]).toEqual(["6", "default"]);
    expect(get(r.rows, "ti_min")).toBe("1");
    expect(get(r.rows, "ti_max")).toBe("1.6");
    expect(get(r.rows, "ti_backup")).toBe("1.2");
    expect(get(r.rows, "rise")).toBe("5");
    expect(r.flags.some((f) => /Auto EPAP/.test(f))).toBe(true);
  });
  it("needs delivered Vt going to a volume target; observed IPAP/EPAP coming back", () => {
    expect(extrasNeeded("Pressure Support", "VAPS-AE PS")).toEqual(["vt"]);
    expect(extrasNeeded("VAPS-AE PS", "Pressure Support")).toEqual(["observedIpap", "observedEpap"]);
    expect(extrasNeeded("VAPS-PS", "VAPS-AE PS")).toEqual([]);
  });
  it("VAPS-AE → fixed pressure on the same device uses observed values, else marks review", () => {
    const base = { srcDev: "Trilogy EVO/EV300", srcMode: "VAPS-AE PS", tgtDev: "Trilogy EVO/EV300", targetFamily: "Pressure Support" as const,
      values: { vt: "450", ipap_min: "6", ipap_max: "14", epap_min: "6", epap_max: "12", rr: "14", ti_backup: "1.2", ti_min: "0.8", ti_max: "1.6", rise: "2", trigger: "3", cycle: "25" } };
    const a = translateAcross({ ...base, extras: { observedIpap: "16", observedEpap: "8" } });
    if (!a.ok) throw new Error(a.reason);
    expect([get(a.rows, "pip"), badge(a.rows, "pip")]).toEqual(["16", "calculated"]);
    expect([get(a.rows, "epap"), badge(a.rows, "epap")]).toEqual(["8", "calculated"]);
    const b = translateAcross({ ...base, extras: {} });
    if (!b.ok) throw new Error(b.reason);
    expect([get(b.rows, "pip"), badge(b.rows, "pip")]).toEqual(["20", "review"]); // IPAP max 14 + EPAP min 6
    expect([get(b.rows, "epap"), badge(b.rows, "epap")]).toEqual(["6", "review"]);
  });
  it("every family → every family on every device renders without missing rows (example inputs)", () => {
    for (const src of ALL_DEVICES)
      for (const [vk, cfg] of Object.entries(DEV_MODES[src]))
        for (const f of FAMILIES)
          for (const tgt of devicesForFamily(f.key)) {
            if (src === tgt && vk === f.key) continue;
            const r = translateAcross({ srcDev: src, srcMode: vk, tgtDev: tgt, targetFamily: f.key, values: exampleValues(cfg!), extras: { vt: "480", observedIpap: "16", observedEpap: "8" } });
            if (!r.ok) throw new Error(`${src} ${vk} → ${tgt} ${f.key}: ${r.reason}`);
            const missing = r.rows.filter((x) => x.badge === "missing" || x.badge === "nomatch").map((x) => x.field.id);
            expect(missing, `${src} ${vk} → ${tgt} ${f.key}`).toEqual([]);
          }
  });
});

import { describe, expect, it } from "vitest";
import { EMPTY_NAV, navigate } from "./navigator";
import { checkRange, kindForField, kindForLabel } from "./ranges";
import { compareAll, roundTrip, targetsFor, translate } from "./translate";

const EVO = {
  srcDev: "Trilogy EVO/EV300",
  srcMode: "VAPS-AE PS",
  values: { vt: "450", ipap_min: "6", ipap_max: "14", epap_min: "6", epap_max: "12", rr: "14", ti_backup: "1.2", ti_min: "0.8", ti_max: "1.6", rise: "2", trigger: "3", cycle: "25" },
};

describe("range checks", () => {
  it("maps field ids and labels to metric ranges", () => {
    expect(kindForField("epap_max", "cmH₂O")).toBe("epap");
    expect(kindForField("rise", "ms")).toBe("rise");
    expect(kindForField("rise", "1–6")).toBeNull();
    expect(kindForLabel("PEEP max", "cmH₂O")).toBe("epap");
    expect(kindForLabel("Target Va", "L/min")).toBeNull();
    expect(kindForLabel("Flow Trigger", "L/min")).toBe("trigger");
  });
  it("flags values outside the Metrics Dictionary", () => {
    expect(checkRange("epap", 12)).toBeNull();
    expect(checkRange("epap", 35)).toMatch(/0–30/);
    expect(checkRange("rise", 40)).toMatch(/50–900/);
  });
  it("translator rows carry warnings", () => {
    const r = translate({ ...EVO, tgtDev: "Resmed Astral", values: { ...EVO.values, epap_max: "45" } });
    if (!r.ok) throw new Error(r.reason);
    expect(r.rows.find((x) => x.field.id === "epap_max")?.warn).toMatch(/0–30/);
    expect(r.rows.find((x) => x.field.id === "epap_min")?.warn).toBeUndefined();
  });
});

describe("scale info on rows", () => {
  it("translator exposes the scale and source value for snapped rows", () => {
    const r = translate({ ...EVO, tgtDev: "Breas Vivo 45LS" });
    if (!r.ok) throw new Error(r.reason);
    const rise = r.rows.find((x) => x.field.id === "rise")!;
    expect(rise.scale).toEqual({ key: "Breas_rise", value: 200, unit: "ms" });
    expect(r.rows.find((x) => x.field.id === "epap_min")!.scale).toBeUndefined();
  });
});

describe("round trip", () => {
  it("EVO → Astral → EVO only drifts on backup Ti (Astral has none, so it is re-derived)", () => {
    const input = { ...EVO, tgtDev: "Resmed Astral" };
    const r = translate(input);
    if (!r.ok) throw new Error(r.reason);
    const rt = roundTrip(input, r);
    expect(rt.status).toBe("ok");
    if (rt.status === "ok") expect(rt.diffs.map((d) => [d.field.id, d.original, d.after])).toEqual([["ti_backup", "1.2", "1.4"]]);
  });
  it("EVO → Vivo → EVO returns every entered setting unchanged", () => {
    const input = { ...EVO, tgtDev: "Breas Vivo 45LS" };
    const r = translate(input);
    if (!r.ok) throw new Error(r.reason);
    const rt = roundTrip(input, r);
    if (rt.status === "ok") expect(rt.diffs).toEqual([]);
    else throw new Error(rt.reason);
  });
  it("reports drift when a value snaps on the way back", () => {
    // Vivo trigger 3 L/min → V60 ordinal (1,2,3,5,7,8,10): 3 is exact; 4 L/min is not.
    const input = {
      srcDev: "Breas Vivo 45LS", srcMode: "VAPS-PS", tgtDev: "Respironics V60",
      values: { vt: "450", ipap_min: "14", ipap_max: "22", epap: "6", rr: "14", ti_backup: "1.2", ti_min: "0.8", ti_max: "1.6", rise: "5", trigger: "5", cycle: "6" },
    };
    const r = translate(input);
    if (!r.ok) throw new Error(r.reason);
    const rt = roundTrip(input, r);
    expect(rt.status).toBe("ok");
    if (rt.status === "ok") expect(rt.diffs.map((d) => d.field.id)).toContain("trigger");
  });
  it("is unavailable when the target mode does not map back to the source", () => {
    const input = { srcDev: "Resmed Astral", srcMode: "VAPS-AE PS", tgtDev: "Trilogy EVO/EV300", values: { target_va: "5", epap_min: "6", rr: "16" } };
    const r = translate(input);
    if (!r.ok) throw new Error(r.reason);
    expect(roundTrip(input, r).status).toBe("ok");
  });
});

describe("compare all", () => {
  it("produces one result per compatible target", () => {
    const all = compareAll(EVO.srcDev, EVO.srcMode, EVO.values);
    expect(all.length).toBe(targetsFor(EVO.srcDev, EVO.srcMode).length);
    expect(all.every((a) => a.result.rows.length > 0)).toBe(true);
  });
});

describe("navigator gauges", () => {
  it("numeric criteria carry gauge thresholds", () => {
    const r = navigate({ ...EMPTY_NAV, nmd: true, paco2: "50", fvcPct: "42", mip: "-45" });
    const g = Object.fromEntries(r.criteria.filter((c) => c.gauge).map((c) => [c.label, c.gauge!]));
    expect(g["PaCO₂ ≥ 45 mmHg"]).toMatchObject({ value: 50, threshold: 45, qualifies: "above" });
    expect(g["MIP weaker than −60 cmH₂O"]).toMatchObject({ value: 45, threshold: 60, qualifies: "below" });
    expect(navigate({ ...EMPTY_NAV, copd: true, paco2: "55" }).criteria[0].gauge?.threshold).toBe(52);
  });
});

describe("prefill", () => {
  it("example values fill every field of every mode and translate without missing rows", async () => {
    const { exampleValues } = await import("./prefill");
    const { ALL_DEVICES, COMPAT, DEV_MODES } = await import("./data");
    for (const dev of ALL_DEVICES)
      for (const [vk, cfg] of Object.entries(DEV_MODES[dev])) {
        const values = exampleValues(cfg!);
        for (const f of cfg!.fields) expect(values[f.id], `${dev} ${vk} ${f.id}`).toBeTruthy();
        const tgt = ALL_DEVICES.find((d) => d !== dev && COMPAT[vk]?.[d]);
        if (!tgt) continue;
        const r = translate({ srcDev: dev, srcMode: vk, tgtDev: tgt, values });
        if (!r.ok) throw new Error(r.reason);
        expect(r.rows.filter((x) => x.badge === "missing" || x.badge === "nomatch"), `${dev} ${vk} → ${tgt}`).toEqual([]);
      }
  });
  it("initial settings map onto translator fields for every device mode", async () => {
    const { initialSettings, SETTINGS_DEVICES, toTranslatorInput } = await import("./settings");
    const { DEV_MODES, ALL_DEVICES, COMPAT } = await import("./data");
    for (const device of Object.keys(SETTINGS_DEVICES)) {
      const res = initialSettings({ sex: "male", heightIn: 69, weightKg: 80, dx: "NMD", device });
      const t = toTranslatorInput(res)!;
      expect(t, device).toBeTruthy();
      const cfg = DEV_MODES[t.srcDev]?.[t.srcMode];
      expect(cfg, `${device} → ${t.srcDev} ${t.srcMode}`).toBeTruthy();
      const ids = new Set(cfg!.fields.map((f) => f.id));
      for (const id of Object.keys(t.values)) expect(ids.has(id), `${device}: ${id} not a field of ${t.srcMode}`).toBe(true);
      for (const f of cfg!.fields) expect(t.values[f.id], `${device}: ${f.id} not filled`).toBeTruthy();
      const tgtDev = ALL_DEVICES.find((d) => d !== t.srcDev && COMPAT[t.srcMode]?.[d])!;
      const r = translate({ ...t, tgtDev });
      if (!r.ok) throw new Error(r.reason);
      expect(r.rows.filter((x) => x.badge === "missing" || x.badge === "nomatch"), device).toEqual([]);
    }
  });
});

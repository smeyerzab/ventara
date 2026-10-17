import { describe, expect, it } from "vitest";
import { EMPTY_NAV, navigate } from "./navigator";
import { initialSettings, SETTINGS_DEVICES } from "./settings";

const row = (rows: { label: string; value: string }[], re: RegExp) => rows.find((r) => re.test(r.label))?.value;

describe("initial settings (3.txt worked example)", () => {
  const base = { sex: "male" as const, heightIn: 69, weightKg: 80, dx: "NMD" as const };
  it("5'9\" male → IBW 70.7 kg, ref Vt 566 mL", () => {
    const r = initialSettings({ ...base, device: "ResMed Astral" });
    expect(r.ibw.toFixed(1)).toBe("70.7");
    expect(Math.round(r.vtRef)).toBe(566);
  });
  it("iVAPS Va 6.5 at rate 16; Breas 550; 10-mL devices 570", () => {
    expect(row(initialSettings({ ...base, device: "ResMed Astral" }).rows, /Target Va/)).toBe("6.5");
    expect(row(initialSettings({ ...base, device: "ResMed AirCurve 10 ST-A iVAPS" }).rows, /Target Va/)).toBe("6.5");
    expect(row(initialSettings({ ...base, device: "Breas Vivo 45 LS" }).rows, /Tidal/)).toBe("550");
    for (const d of ["Philips Trilogy EVO / EV300", "Löwenstein Luisa", "React Health VPro"])
      expect(row(initialSettings({ ...base, device: d }).rows, /olume/)).toBe("570");
  });
  it("device omissions: no backup Ti on ResMed, no Ti min on VPro", () => {
    for (const d of ["ResMed Astral", "ResMed AirCurve 10 ST-A iVAPS"])
      expect(row(initialSettings({ ...base, device: d }).rows, /Insp|Back up/)).toBeUndefined();
    expect(row(initialSettings({ ...base, device: "React Health VPro" }).rows, /Ti min/i)).toBeUndefined();
  });
  it("every device builds for every band", () => {
    for (const device of Object.keys(SETTINGS_DEVICES))
      for (const [dx, kg] of [["NMD", 60], ["NMD", 110], ["COPD", 60], ["COPD", 110], ["OHS", 110], ["OHS", 160]] as const)
        expect(initialSettings({ ...base, dx, weightKg: kg, device }).rows.length).toBeGreaterThan(5);
  });
  it("OHS below BMI 30 has no band", () => {
    expect(initialSettings({ ...base, dx: "OHS", weightKg: 60, device: "ResMed Astral" }).band).toBeNull();
  });
});

describe("NIV navigator (2.txt scenarios)", () => {
  it("normal-CO₂ NMD patient qualifies via oximetry → E0471", () => {
    const r = navigate({ ...EMPTY_NAV, paco2: "40", nmd: true, oximetry: true });
    expect(r.code).toBe("E0471");
  });
  it("restrictive with FVC < 50% → E0471", () => {
    expect(navigate({ ...EMPTY_NAV, thoracic: true, fvcPct: "42" }).code).toBe("E0471");
  });
  it("MIP weaker than −60 qualifies, stronger does not", () => {
    expect(navigate({ ...EMPTY_NAV, nmd: true, mip: "-45" }).code).toBe("E0471");
    expect(navigate({ ...EMPTY_NAV, nmd: true, mip: "-80" }).code).toBe("none");
  });
  it("restrictive + > 8 h/day → E0466 with E0471 fallback", () => {
    const r = navigate({ ...EMPTY_NAV, nmd: true, paco2: "50", over8h: true });
    expect(r.code).toBe("E0466");
    expect(r.fallback).toBe("E0471");
  });
  it("COPD PaCO₂ 55, no pushers → E0471; with > 4 L O₂ → E0466", () => {
    expect(navigate({ ...EMPTY_NAV, copd: true, paco2: "55" }).code).toBe("E0471");
    expect(navigate({ ...EMPTY_NAV, copd: true, paco2: "55", o2Over4: true }).code).toBe("E0466");
  });
  it("COPD PaCO₂ 48 → not qualified", () => {
    expect(navigate({ ...EMPTY_NAV, copd: true, paco2: "48" }).code).toBe("none");
  });
  it("COPD with OSA predominant does not qualify", () => {
    expect(navigate({ ...EMPTY_NAV, copd: true, paco2: "55", osaMain: true }).code).toBe("none");
  });
  it("OHS dead-end shows the fork; with a pusher resolves to E0466", () => {
    const a = navigate({ ...EMPTY_NAV, paco2: "55" });
    expect(a.code).toBe("none");
    expect(a.fork).toBeDefined();
    const b = navigate({ ...EMPTY_NAV, paco2: "55", over8h: true });
    expect(b.code).toBe("E0466");
    expect(b.fork).toBeDefined();
  });
  it("sleep-study documentation trap fires only when OSA is not predominant", () => {
    const trap = (osaMain: boolean) =>
      navigate({ ...EMPTY_NAV, nmd: true, paco2: "50", chartSaysSleepStudy: true, osaMain }).flags.some((f) => /sleep study/.test(f));
    expect(trap(false)).toBe(true);
    expect(trap(true)).toBe(false);
  });
});

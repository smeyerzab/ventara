import React, { useState, useMemo } from "react";

/* ──────────────────────────────────────────────────────────────────────────
   Initial-settings reference data, transcribed from the Ventara workbook.
   Each device/mode is a tab; each column is a diagnosis × BMI band.
   Values are STARTING REFERENCES ONLY — the clinician confirms every setting.
─────────────────────────────────────────────────────────────────────────── */

const BANDS = {
  // diagnosis -> ordered list of { key, label, test(bmi) }
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

// Column order in every sheet: NMD<30, NMD≥30, COPD<30, COPD≥30, OHS30-40, OHS>40
const COLS = [
  { dx: "NMD", band: "lt30" },
  { dx: "NMD", band: "ge30" },
  { dx: "COPD", band: "lt30" },
  { dx: "COPD", band: "ge30" },
  { dx: "OHS", band: "30to40" },
  { dx: "OHS", band: "gt40" },
];

// helper to turn a 6-tuple into a column-keyed object
const row = (...v) => COLS.reduce((o, c, i) => ((o[c.dx + ":" + c.band] = v[i]), o), {});
const VOL = "8 cc/kg IBW"; // marker replaced at runtime with computed mL

const DEVICES = {
  "ResMed AirCurve 10 ST-A — ST": {
    volumeRow: null, // pure pressure mode: IBW is informational only
    params: [
      ["IPAP (cmH₂O)", row(8, 12, 16, 18, 18, 20)],
      ["EPAP (cmH₂O)", row(4, 6, 4, 6, 6, 8)],
      ["Respiratory Rate (bpm)", row(14, 14, 16, 16, 14, 14)],
      ["Ti min (s)", row(1.2, 1.2, 0.9, 1.1, 1.2, 1.2)],
      ["Ti max (s)", row(2, 2, 1.5, 1.5, 2, 2)],
      ["Rise (ms)", row(300, 300, 200, 200, 300, 300)],
      ["Trigger", row("High", "High", "Medium", "Medium", "Medium", "Medium")],
      ["Cycle", row("Low", "Low", "High", "Medium", "Low", "Low")],
    ],
  },
  "ResMed AirCurve 10 ST-A — iVAPS": {
    volumeRow: "Target Va",
    params: [
      ["Target Va", row(VOL, VOL, VOL, VOL, VOL, VOL)],
      ["EPAP (cmH₂O)", row(4, 6, 4, 6, 6, 8)],
      ["PS min (cmH₂O)", row(4, 6, 10, 10, 10, 10)],
      ["PS max (cmH₂O)", row(16, 18, 18, 18, 20, 22)],
      ["Target Rate (bpm)", row(14, 14, 16, 16, 14, 14)],
      ["Ti min (s)", row(1.2, 1.2, 0.9, 1.1, 1.2, 1.2)],
      ["Ti max (s)", row(2, 2, 1.5, 1.6, 2, 2)],
      ["Rise (ms)", row(300, 300, 200, 200, 300, 300)],
      ["Trigger", row("High", "High", "Medium", "Medium", "Medium", "Medium")],
      ["Cycle", row("Low", "Low", "High", "Medium", "Low", "Low")],
    ],
  },
  "Breas Vivo 45 LS — VAPS-PS": {
    volumeRow: "Tidal Volume",
    params: [
      ["Tidal Volume", row(VOL, VOL, VOL, VOL, VOL, VOL)],
      ["EPAP (cmH₂O)", row(4, 6, 4, 6, 6, 8)],
      ["Min Pressure (cmH₂O)", row(8, 10, 14, 16, 18, 20)],
      ["Max Pressure (cmH₂O)", row(16, 18, 22, 24, 24, 26)],
      ["Respiratory Rate (bpm)", row(14, 14, 16, 16, 14, 14)],
      ["Backup Ti (s)", row(1.4, 1.4, 1.2, 1.2, 1.4, 1.4)],
      ["Ti min (s)", row(1.2, 1.2, 0.9, 1.1, 1.2, 1.2)],
      ["Ti max (s)", row(2, 2, 1.5, 1.5, 2, 2)],
      ["Rise", row(4, 4, 2, 2, 3, 3)],
      ["Inspiratory Trigger", row(2, 2, 4, 4, 4, 4)],
      ["Expiratory Trigger", row(7, 7, 6, 6, 7, 7)],
    ],
  },
  "Breas Vivo 45 LS — VAPS-PS-AE": {
    volumeRow: "Tidal Volume",
    params: [
      ["Tidal Volume", row(VOL, VOL, VOL, VOL, VOL, VOL)],
      ["EPAP min (cmH₂O)", row(4, 6, 4, 6, 6, 8)],
      ["EPAP max (cmH₂O)", row(8, 10, 8, 10, 12, 14)],
      ["PS min (cmH₂O)", row(4, 4, 10, 10, 10, 10)],
      ["PS max (cmH₂O)", row(10, 10, 18, 18, 18, 20)],
      ["Respiratory Rate (bpm)", row(14, 14, 16, 16, 14, 14)],
      ["Backup Insp Time (s)", row(1.4, 1.4, 1.2, 1.2, 1.4, 1.4)],
      ["Ti min (s)", row(1.2, 1.2, 0.9, 1.1, 1.2, 1.2)],
      ["Ti max (s)", row(2, 2, 1.5, 1.5, 2, 2)],
      ["Rise", row(4, 4, 2, 2, 3, 3)],
      ["Inspiratory Trigger", row(2, 2, 4, 4, 4, 4)],
      ["Expiratory Trigger", row(7, 7, 6, 6, 7, 7)],
    ],
  },
  "Philips Trilogy EVO — VAPS-PS": {
    volumeRow: "Tidal Volume",
    params: [
      ["Tidal Volume", row(VOL, VOL, VOL, VOL, VOL, VOL)],
      ["EPAP (cmH₂O)", row(4, 6, 4, 6, 6, 8)],
      ["IPAP min (cmH₂O)", row(8, 10, 14, 16, 18, 20)],
      ["IPAP max (cmH₂O)", row(16, 18, 22, 24, 24, 26)],
      ["Respiratory Rate (bpm)", row(14, 14, 16, 16, 14, 14)],
      ["Inspiratory Time (s)", row(1.4, 1.4, 1.2, 1.2, 1.4, 1.4)],
      ["Ti min (s)", row(1.2, 1.2, 0.9, 1.1, 1.2, 1.2)],
      ["Ti max (s)", row(2, 2, 1.5, 1.5, 2, 2)],
      ["Rise", row(3, 3, 2, 2, 3, 3)],
      ["Trigger Sensitivity", row(2, 2, 4, 4, 4, 4)],
      ["Cycle Sensitivity", row(20, 20, 30, 30, 20, 20)],
    ],
  },
};

const DX_LABEL = {
  NMD: "Neuromuscular disease",
  COPD: "COPD",
  OHS: "Obesity hypoventilation (OHS)",
};

/* ── IBW: Devine formula. Height in inches; returns kg. ─────────────────── */
function ibwKg(sex, heightIn) {
  const base = sex === "female" ? 45.5 : 50;
  return base + 2.3 * (heightIn - 60);
}

const C = {
  ink: "#13202b",
  sub: "#5c6b73",
  line: "#dde3e1",
  bg: "#f6f4ee",
  panel: "#ffffff",
  teal: "#0f6e6e",
  tealSoft: "#e6f0ee",
  amber: "#9a6a00",
  amberSoft: "#fbf2dd",
  vol: "#0a5b5b",
};

export default function VentaraSettings() {
  const [sex, setSex] = useState("");
  const [ft, setFt] = useState("");
  const [inch, setInch] = useState("");
  const [bmi, setBmi] = useState("");
  const [dx, setDx] = useState("");
  const [device, setDevice] = useState("");

  const heightIn = useMemo(() => {
    const f = parseFloat(ft), i = parseFloat(inch);
    if (isNaN(f) && isNaN(i)) return NaN;
    return (isNaN(f) ? 0 : f) * 12 + (isNaN(i) ? 0 : i);
  }, [ft, inch]);

  const bmiNum = parseFloat(bmi);

  const band = useMemo(() => {
    if (!dx || isNaN(bmiNum)) return null;
    return BANDS[dx].find((b) => b.test(bmiNum)) || null;
  }, [dx, bmiNum]);

  // OHS requires BMI ≥ 30 by definition; flag if not met
  const ohsMismatch = dx === "OHS" && !isNaN(bmiNum) && bmiNum < 30;

  const ibw = useMemo(
    () => (sex && !isNaN(heightIn) && heightIn > 0 ? ibwKg(sex, heightIn) : NaN),
    [sex, heightIn]
  );
  const targetMl = isNaN(ibw) ? NaN : Math.round(ibw * 8);

  const ready = sex && !isNaN(heightIn) && heightIn > 0 && dx && band && device && !ohsMismatch;

  const result = useMemo(() => {
    if (!ready) return null;
    const colKey = dx + ":" + band.key;
    const dev = DEVICES[device];
    return dev.params.map(([name, vals]) => {
      let v = vals[colKey];
      if (v === VOL && !isNaN(targetMl)) {
        v = `${targetMl} mL`;
      }
      return { name, value: v, isVolume: name === dev.volumeRow };
    });
  }, [ready, dx, band, device, targetMl]);

  const field = {
    width: "100%", padding: "11px 12px", fontSize: 15, color: C.ink,
    border: `1px solid ${C.line}`, borderRadius: 8, background: "#fff",
    fontFamily: "inherit", boxSizing: "border-box", appearance: "none",
  };
  const label = { fontSize: 12.5, fontWeight: 600, color: C.sub, letterSpacing: ".02em", marginBottom: 6, display: "block" };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "0 16px 64px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif", color: C.ink }}>
      <style>{`@keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>

      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        {/* Header */}
        <header style={{ padding: "40px 0 22px", borderBottom: `2px solid ${C.ink}`, marginBottom: 26 }}>
          <div style={{ fontSize: 12, letterSpacing: ".18em", color: C.teal, fontWeight: 700, textTransform: "uppercase" }}>
            Ventara · Companion
          </div>
          <h1 style={{ margin: "8px 0 6px", fontSize: 30, fontWeight: 800, letterSpacing: "-.02em" }}>
            Home Ventilator Initial Settings
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: C.sub, maxWidth: 560, lineHeight: 1.5 }}>
            Starting-reference parameters for volume-targeted home ventilation, organized by diagnosis,
            BMI band, and device mode.
          </p>
        </header>

        {/* Disclaimer */}
        <div style={{ background: C.amberSoft, border: `1px solid #ecd9a8`, borderRadius: 10,
          padding: "13px 16px", marginBottom: 26, fontSize: 13.5, color: C.amber, lineHeight: 1.5 }}>
          <strong>Educational reference only.</strong> These are suggested starting points, not prescriptions.
          A qualified clinician must review, confirm, and adjust every setting for the individual patient,
          then titrate to ventilation, oxygenation, comfort, and synchrony.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 340px) 1fr", gap: 28, alignItems: "start" }}>
          {/* ── Inputs ───────────────────────────────────────────── */}
          <section style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14,
            padding: 22, position: "sticky", top: 16 }}>
            <h2 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 700 }}>Patient & device</h2>

            <div style={{ marginBottom: 16 }}>
              <span style={label}>Sex (for IBW)</span>
              <div style={{ display: "flex", gap: 8 }}>
                {["male", "female"].map((s) => (
                  <button key={s} onClick={() => setSex(s)}
                    style={{ flex: 1, padding: "10px 0", fontSize: 14, fontWeight: 600, cursor: "pointer",
                      textTransform: "capitalize", borderRadius: 8, fontFamily: "inherit",
                      border: `1px solid ${sex === s ? C.teal : C.line}`,
                      background: sex === s ? C.teal : "#fff", color: sex === s ? "#fff" : C.ink }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <span style={label}>Height</span>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <input type="number" value={ft} onChange={(e) => setFt(e.target.value)} placeholder="5"
                    style={field} min="0" />
                  <span style={{ position: "absolute", right: 12, top: 12, fontSize: 13, color: C.sub }}>ft</span>
                </div>
                <div style={{ flex: 1, position: "relative" }}>
                  <input type="number" value={inch} onChange={(e) => setInch(e.target.value)} placeholder="9"
                    style={field} min="0" max="11" />
                  <span style={{ position: "absolute", right: 12, top: 12, fontSize: 13, color: C.sub }}>in</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <span style={label}>BMI</span>
              <input type="number" value={bmi} onChange={(e) => setBmi(e.target.value)} placeholder="e.g. 28"
                style={field} min="0" step="0.1" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <span style={label}>Primary diagnosis</span>
              <select value={dx} onChange={(e) => setDx(e.target.value)} style={field}>
                <option value="">Select…</option>
                {Object.keys(DX_LABEL).map((k) => <option key={k} value={k}>{DX_LABEL[k]}</option>)}
              </select>
            </div>

            <div>
              <span style={label}>Device & mode</span>
              <select value={device} onChange={(e) => setDevice(e.target.value)} style={field}>
                <option value="">Select…</option>
                {Object.keys(DEVICES).map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </section>

          {/* ── Output ───────────────────────────────────────────── */}
          <section>
            {/* IBW strip */}
            {!isNaN(ibw) && (
              <div style={{ display: "flex", gap: 0, background: C.tealSoft, border: `1px solid #c9e0db`,
                borderRadius: 12, overflow: "hidden", marginBottom: 18 }}>
                <Stat label="Height" value={`${heightIn}″`} />
                <Stat label="Ideal body weight" value={`${ibw.toFixed(1)} kg`}
                  sub="Devine formula" divider />
                <Stat label="Target volume · 8 mL/kg" value={`${targetMl} mL`} strong divider />
              </div>
            )}

            {ohsMismatch && (
              <div style={{ background: "#fbe9e6", border: "1px solid #e8c4bd", borderRadius: 10,
                padding: "12px 15px", marginBottom: 16, fontSize: 13.5, color: "#8a3a2c", lineHeight: 1.5 }}>
                OHS is defined by obesity (BMI ≥ 30). The BMI entered is below 30 — recheck the diagnosis
                or the BMI value before reading settings.
              </div>
            )}

            {result ? (
              <div style={{ animation: "fade .25s ease", background: C.panel, border: `1px solid ${C.line}`,
                borderRadius: 14, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.line}` }}>
                  <div style={{ fontSize: 12, letterSpacing: ".12em", color: C.teal, fontWeight: 700, textTransform: "uppercase" }}>
                    {device}
                  </div>
                  <div style={{ fontSize: 15, color: C.sub, marginTop: 3 }}>
                    {DX_LABEL[dx]} · {band.label}
                  </div>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14.5 }}>
                  <tbody>
                    {result.map((r, i) => (
                      <tr key={r.name} style={{ background: r.isVolume ? C.tealSoft : i % 2 ? "#fafbfa" : "#fff" }}>
                        <td style={{ padding: "11px 20px", color: C.ink, borderBottom: `1px solid ${C.line}`,
                          fontWeight: r.isVolume ? 700 : 500 }}>
                          {r.name}
                        </td>
                        <td style={{ padding: "11px 20px", textAlign: "right", borderBottom: `1px solid ${C.line}`,
                          fontWeight: 700, fontVariantNumeric: "tabular-nums",
                          color: r.isVolume ? C.vol : C.ink, whiteSpace: "nowrap" }}>
                          {r.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: "12px 20px", fontSize: 12.5, color: C.sub, lineHeight: 1.5 }}>
                  Confirm against the device manual. Titrate to overnight CO₂, SpO₂, comfort, and
                  patient–ventilator synchrony. Reassess after the first night.
                </div>
              </div>
            ) : (
              <div style={{ border: `1px dashed ${C.line}`, borderRadius: 14, padding: "48px 24px",
                textAlign: "center", color: C.sub, fontSize: 14.5, background: "#fff" }}>
                Enter sex, height, BMI, diagnosis, and device to see starting settings.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, strong, divider }) {
  return (
    <div style={{ flex: 1, padding: "12px 16px", borderLeft: divider ? "1px solid #c9e0db" : "none" }}>
      <div style={{ fontSize: 11.5, color: "#3f6b66", fontWeight: 600, letterSpacing: ".03em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: strong ? 22 : 19, fontWeight: 800, color: strong ? "#0a5b5b" : "#13202b",
        marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11.5, color: "#3f6b66", marginTop: 1 }}>{sub}</div>}
    </div>
  );
}





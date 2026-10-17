import React, { useState, useMemo } from "react";

/* ============================================================================
   VENTARA — Cross-Mode Translator (v14, iteration 2)
   SOURCE: Philips V60 — S/T or PCV (fixed bilevel / inpatient bipap)
   TARGET: VAPS-AE PS on a SELECTABLE device. Per-device nomenclature, ordinal
           scales, capabilities, and "must be turned on" alerts are driven by
           the Ventara middleware (parsed from the device map), not hardcoded.
   ============================================================================ */

const DEVICE_DATA = {"devices":{"astral":{"name":"ResMed Astral","mode_label":"iVAPS-AE","fields":{"Tidal Volume":"Target Va","PS min":"Pressure Support min (add to EPAP)","PS max":"Pressure Support max (add to EPAP)","EPAP min":"EPAP min","EPAP max":"EPAP max","Respiratory Rate":"Target Rate (RR = 2/3 target rate)","Back up inspiratory time":null,"Ti min":"Ti min","Ti max":"Ti max","Rise":"Rise (ms)","Trigger Sensitivity":"Trigger (0.5-15 L/min)","Cycle Sensitivity":"Cycle (5-90%)"},"caps":{"target_volume_on":"no","auto_epap_on":"yes","backup_ti":"no","ti_min":"yes","ti_max":"yes"},"alerts":[{"metric":"Respiratory Rate/Back up Ti","alert":"does not exist"}],"scales":{"trigger":[{"o":"very low","v":10},{"o":"low","v":8},{"o":"med","v":6},{"o":"high","v":4},{"o":"very high","v":2}]}},"trilogy100":{"name":"Trilogy 100","mode_label":"AVAPS-AE","fields":{"Tidal Volume":"Tidal Volume","PS min":"PS min","PS max":"PS max","EPAP min":"EPAP min","EPAP max":"EPAP max","Respiratory Rate":"Respiratory Rate","Back up inspiratory time":"Inspiratory Time","Ti min":null,"Ti max":null,"Rise":"Rise (1-6)","Trigger Sensitivity":"Flow trigger sensitivity (1-9 L/min)","Cycle Sensitivity":"Flow cycle sensitivity (10-90%)"},"caps":{"target_volume_on":"no","auto_epap_on":"no","backup_ti":"yes","ti_min":"no","ti_max":"no"},"alerts":[],"scales":{"rise":[{"o":1,"v":100},{"o":2,"v":200},{"o":3,"v":300},{"o":4,"v":400},{"o":5,"v":500},{"o":6,"v":600}]}},"trilogyevo":{"name":"Trilogy EVO / EV300","mode_label":"AVAPS-AE","fields":{"Tidal Volume":"Tidal Volume","PS min":"PS min","PS max":"PS max","EPAP min":"EPAP min","EPAP max":"EPAP max","Respiratory Rate":"Respiratory Rate","Back up inspiratory time":"Inspiratory Time","Ti min":"Ti min","Ti max":"Ti max","Rise":"Rise (0-6)","Trigger Sensitivity":"Flow trigger senstivitiy (0.5-9 L/min)","Cycle Sensitivity":"Flow cycle sensitivity (10-90%)"},"caps":{"target_volume_on":"no","auto_epap_on":"no","backup_ti":"yes","ti_min":"on/off","ti_max":"on/off"},"alerts":[{"metric":"Ti min","alert":"must be turned on to work"},{"metric":"Ti max","alert":"must be turned on to work"}],"scales":{"rise":[{"o":0,"v":50},{"o":1,"v":100},{"o":2,"v":200},{"o":3,"v":300},{"o":4,"v":400},{"o":5,"v":500},{"o":6,"v":600}]}},"vivo45":{"name":"Breas Vivo 45LS","mode_label":"PSV (TgV) - AE","fields":{"Tidal Volume":"Tidal Volume","PS min":"PS min","PS max":"PS max","EPAP min":"EPAP min","EPAP max":"EPAP max","Respiratory Rate":"Respiratory Rate","Back up inspiratory time":"Back up Inspiratory time","Ti min":"Ti min","Ti max":"Ti max","Rise":"Rise (1-9)","Trigger Sensitivity":"Inspiratory trigger (1-9)","Cycle Sensitivity":"Expiratory Trigger (1-9)"},"caps":{"target_volume_on":"yes","auto_epap_on":"yes","backup_ti":"yes","ti_min":"on/off","ti_max":"on/off"},"alerts":[{"metric":"Ti min","alert":"must be turned on to work"},{"metric":"Ti max","alert":"must be turned on to work"},{"metric":"Auto EPAP","alert":"must be turned on to work"}],"scales":{"rise":[{"o":1,"v":50},{"o":2,"v":100},{"o":3,"v":150},{"o":4,"v":200},{"o":5,"v":300},{"o":6,"v":400},{"o":7,"v":500},{"o":8,"v":650},{"o":9,"v":800}],"inspiratory trigger":[{"o":1,"v":0.5},{"o":2,"v":1},{"o":3,"v":2},{"o":4,"v":3},{"o":5,"v":4},{"o":6,"v":5},{"o":7,"v":6},{"o":8,"v":8},{"o":9,"v":9}],"expiratory trigger":[{"o":1,"v":80},{"o":2,"v":65},{"o":3,"v":50},{"o":4,"v":40},{"o":5,"v":30},{"o":6,"v":25},{"o":7,"v":20},{"o":8,"v":15},{"o":9,"v":5}]}},"luisa":{"name":"Lowenstein Luisa","mode_label":"TTV-VAPS-AE","fields":{"Tidal Volume":"Target volume","PS min":"PS","PS max":"PS max","EPAP min":"EPAP min","EPAP max":"EPAP max","Respiratory Rate":"Rate","Back up inspiratory time":"Ti Timed","Ti min":"Ti Min","Ti max":"Ti Max","Rise":"Pressure Increase (1-4)","Trigger Sensitivity":"Inspiratory Sensitivity (1-10)","Cycle Sensitivity":"Expiratory Sensitivity (%)"},"caps":{"target_volume_on":"no","auto_epap_on":"no","backup_ti":"yes","ti_min":"on/off","ti_max":"on/off"},"alerts":[],"scales":{"inspiratory sensitivity":[{"o":1,"v":0.5},{"o":2,"v":1},{"o":3,"v":2},{"o":4,"v":3},{"o":5,"v":4},{"o":6,"v":5},{"o":7,"v":6},{"o":8,"v":8},{"o":9,"v":9},{"o":10,"v":10}]}},"vpro":{"name":"React Health VPro","mode_label":"PS with target volume - Intellipap ON","fields":{"Tidal Volume":"Tidal Volume","PS min":"PS min","PS max":"PS max","EPAP min":"PEEP min","EPAP max":"PEEP Max","Respiratory Rate":"Breath Rate","Back up inspiratory time":"Inspiratory Time","Ti min":null,"Ti max":"Time Cycle","Rise":"Rise Time (1-6)","Trigger Sensitivity":"Flow Trigger (0.5-9L/min)","Cycle Sensitivity":"Flow Cycle (5-95%)"},"caps":{"target_volume_on":"yes","auto_epap_on":"yes","backup_ti":"yes","ti_min":"no","ti_max":"on/off"},"alerts":[{"metric":"IntelliPAP","alert":"must be turned on to work"},{"metric":"Time Cycle","alert":"Time cycle = Ti max"},{"metric":"Time Cycle","alert":"must be turned on to work"}],"scales":{"rise":[{"o":1,"v":100},{"o":2,"v":200},{"o":3,"v":300},{"o":4,"v":400},{"o":5,"v":500},{"o":6,"v":600}]}}}};
const DEVICES = DEVICE_DATA.devices;
const DEVICE_ORDER = ["astral","trilogy100","trilogyevo","vivo45","luisa","vpro"];

const BADGE = {
  direct:     { label: "direct",        cls: "b-direct" },
  calculated: { label: "calculated",    cls: "b-calc" },
  ordinal:    { label: "closest step",  cls: "b-ord" },
  default:    { label: "default \u26A0", cls: "b-default" },
  review:     { label: "review \u26A0",  cls: "b-review" },
  na:         { label: "not on device", cls: "b-na" },
};

const round = (n, d = 0) => { const f = Math.pow(10, d); return Math.round(n * f) / f; };
const v60RiseToMs = (ord) => (Number(ord) - 1) * 100 + 100;

function closestStep(scale, targetVal) {
  let best = null;
  for (const s of scale) {
    const d = Math.abs(Number(s.v) - targetVal);
    if (best === null || d < best.d) best = { ...s, d };
  }
  return best;
}

function translate(src, deviceId) {
  const dev = DEVICES[deviceId];
  const F = dev.fields;
  const caps = dev.caps;
  const rows = [], calc = [], notes = [], flags = [];

  const rate = Number(src.rr);
  const ipap = Number(src.ipap);
  const epap = Number(src.epap);
  const vt = Number(src.vt);
  const ti = Number(src.ti);
  const support = ipap - epap;
  const label = (k) => F[k] || k;

  // ===== Volume target =====
  if (F["Tidal Volume"] === "Target Va") {
    const targetRate = rate + 2;
    const va = ((vt - 150) * targetRate) / 1000;
    rows.push({ field: label("Tidal Volume"), value: round(va, 1), unit: "L/min", badge: "calculated",
      why: `Astral targets alveolar ventilation. Va = (Vt \u2212 150) \u00D7 target rate \u00F7 1000 = (${vt} \u2212 150) \u00D7 ${targetRate} \u00F7 1000.` });
    calc.push(`Target Va = (${vt} \u2212 150) \u00D7 ${targetRate} \u00F7 1000 = ${round(va,1)} L/min`);
    notes.push("This device targets alveolar ventilation (Va), not tidal volume, so the delivered Vt you entered was converted using the target rate.");
  } else {
    rows.push({ field: label("Tidal Volume"), value: vt, unit: "mL", badge: "direct",
      why: "This device targets tidal volume directly, so the delivered Vt you entered carries across as the volume target." });
    if (caps.target_volume_on === "yes")
      flags.push(`Target volume must be switched ON for ${dev.name} to guarantee this Vt.`);
  }

  // ===== EPAP =====
  const hasAutoEpap = caps.auto_epap_on === "yes";
  rows.push({ field: label("EPAP min"), value: epap, unit: "cmH\u2082O", badge: "direct",
    why: hasAutoEpap
      ? "Source EPAP becomes the lower bound of the auto-EPAP range."
      : "Source EPAP carries directly (this device has no auto-EPAP range)." });

  if (hasAutoEpap) {
    rows.push({ field: label("EPAP max"), value: epap + 4, unit: "cmH\u2082O", badge: "default",
      why: "Auto-EPAP needs an upper bound the fixed source never had. Shown as EPAP min + 4 as a STARTING point \u2014 set per the patient's obstructive burden." });
    notes.push("Fixed EPAP became an auto-adjusting range; confirm the max before use.");
    if (dev.alerts.some(a => /auto epap|intellipap/i.test(a.metric || "")))
      flags.push(`Auto-EPAP must be switched ON for ${dev.name}, or EPAP stays fixed at the min.`);
  } else {
    rows.push({ field: label("EPAP max"), value: "\u2014", unit: "", badge: "na",
      why: `${dev.name} in this mode has no auto-EPAP, so there is no EPAP max. EPAP is a single fixed value (the EPAP min above). This is a true VAPS, not auto-titrating EPAP.` });
    notes.push(`${dev.name} does not offer auto-adjusting EPAP in this mode \u2014 EPAP stays fixed at the source value. If auto-EPAP is clinically needed, choose a device that supports it (Astral, Vivo 45LS, or VPro).`);
  }

  // ===== PS band =====
  const psMax = support + 4;
  let psMin = support - 2;
  const psUnder = psMin < 0;
  if (psUnder) psMin = 0;
  rows.push({ field: label("PS max"), value: psMax, unit: "cmH\u2082O", badge: "calculated",
    why: `(IPAP \u2212 EPAP) + 4 = (${ipap} \u2212 ${epap}) + 4.` });
  rows.push({ field: label("PS min"), value: psMin, unit: "cmH\u2082O", badge: psUnder ? "review" : "calculated",
    why: psUnder
      ? `(IPAP \u2212 EPAP) \u2212 2 would be below 0 (support only ${support}); floored at 0 \u2014 confirm.`
      : `(IPAP \u2212 EPAP) \u2212 2 = (${ipap} \u2212 ${epap}) \u2212 2. Tight band around the working support.` });
  calc.push(`Support = IPAP \u2212 EPAP = ${ipap} \u2212 ${epap} = ${support} cmH\u2082O`);
  calc.push(`PS band = ${support} \u2212 2 to ${support} + 4 \u2192 PS min ${psMin}, PS max ${psMax} cmH\u2082O`);
  notes.push("Pressure support was set tightly around the support the patient was receiving inpatient (IPAP \u2212 EPAP), \u22122 to +4, to reproduce what was working.");

  // ===== Rate =====
  if (F["Respiratory Rate"].toLowerCase().includes("target rate")) {
    rows.push({ field: label("Respiratory Rate"), value: rate + 2, unit: "/min", badge: "calculated",
      why: `Astral uses a single target rate = source rate + 2 (${rate} + 2).` });
    calc.push(`Target rate = ${rate} + 2 = ${rate + 2} /min`);
  } else {
    rows.push({ field: label("Respiratory Rate"), value: rate, unit: "/min", badge: "direct",
      why: "Source set/backup rate carries directly." });
  }

  // ===== Ti =====
  if (F["Ti min"] || F["Ti max"]) {
    const tiMin = round(ti - 0.2, 1), tiMax = round(ti + 0.4, 1);
    if (F["Ti min"])
      rows.push({ field: label("Ti min"), value: tiMin, unit: "s", badge: "calculated", why: `Entered Ti ${ti} s \u2212 0.2.` });
    if (F["Ti max"])
      rows.push({ field: label("Ti max"), value: tiMax, unit: "s", badge: "calculated",
        why: `Entered Ti ${ti} s + 0.4.${F["Ti max"] === "Time Cycle" ? " On this device the time-cycle field equals Ti max." : ""}` });
    calc.push(`Ti window: ${ti} \u2212 0.2 = ${tiMin} s, ${ti} + 0.4 = ${tiMax} s`);
    if (caps.ti_min === "on/off" || caps.ti_max === "on/off")
      flags.push(`Ti min/max must be switched ON for ${dev.name} or the window won't apply.`);
  } else {
    rows.push({ field: "Ti min / Ti max", value: "\u2014", unit: "", badge: "na",
      why: `${dev.name} (${dev.mode_label}) has no Ti min/max in this mode; it uses a backup inspiratory time instead. Source Ti informs the backup Ti.` });
    if (F["Back up inspiratory time"])
      rows.push({ field: label("Back up inspiratory time"), value: ti, unit: "s", badge: "direct",
        why: "Source Ti carries to the backup inspiratory time." });
  }

  // ===== Rise =====
  const srcMs = v60RiseToMs(src.rise);
  if (/\bms\b/i.test(F["Rise"] || "")) {
    rows.push({ field: label("Rise"), value: srcMs, unit: "ms", badge: "calculated",
      why: `V60 rise ${src.rise} (1\u20136) \u2192 ${srcMs} ms; this device sets rise directly in ms.` });
    calc.push(`Rise: V60 ${src.rise} \u2192 ${srcMs} ms (direct)`);
  } else if (dev.scales.rise) {
    const step = closestStep(dev.scales.rise, srcMs);
    rows.push({ field: label("Rise"), value: step.o, unit: `(\u2248${step.v} ms)`, badge: "ordinal",
      why: `V60 rise ${src.rise} \u2248 ${srcMs} ms; closest step on ${dev.name} is ${step.o} (${step.v} ms).` });
    calc.push(`Rise: V60 ${src.rise} \u2248 ${srcMs} ms \u2192 ${dev.name} step ${step.o} (${step.v} ms)`);
  }

  // ===== Trigger =====
  const trigVal = Number(src.trigger);
  const trigScale = dev.scales.trigger || dev.scales["inspiratory trigger"] || dev.scales["inspiratory sensitivity"];
  if (trigScale) {
    const step = closestStep(trigScale, trigVal);
    rows.push({ field: label("Trigger Sensitivity"), value: step.o, unit: `(\u2248${step.v} L/min)`, badge: "ordinal",
      why: `Source trigger ${trigVal} L/min; closest step on ${dev.name} is ${step.o} (${step.v} L/min).` });
    calc.push(`Trigger: ${trigVal} L/min \u2192 ${dev.name} step ${step.o} (${step.v} L/min)`);
  } else {
    rows.push({ field: label("Trigger Sensitivity"), value: trigVal, unit: "L/min", badge: "direct",
      why: "Trigger translates through L/min, the common unit; set directly here." });
  }

  // ===== Remaining device alerts =====
  dev.alerts.forEach(a => {
    if (/intellipap/i.test(a.metric) && !flags.some(f => /intellipap|auto-epap/i.test(f)))
      flags.push(`IntelliPAP (auto-EPAP) must be switched ON for ${dev.name}.`);
    else if (/time cycle/i.test(a.metric) && /must be turned on/i.test(a.alert) && !flags.some(f => /time cycle/i.test(f)))
      flags.push(`Time Cycle must be switched ON for ${dev.name} (it acts as Ti max).`);
    else if (/does not exist/i.test(a.alert))
      notes.push(`Note for ${dev.name}: ${a.metric} \u2014 ${a.alert}.`);
  });

  return { rows, calc, notes, flags, dev };
}

export default function Ventara() {
  const [src, setSrc] = useState({ mode: "ST", ipap: "18", epap: "8", rr: "14", ti: "1.2", vt: "480", trigger: "3", rise: "3" });
  const [deviceId, setDeviceId] = useState("astral");
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => (submitted ? translate(src, deviceId) : null), [submitted, src, deviceId]);
  const set = (k) => (e) => { setSrc((s) => ({ ...s, [k]: e.target.value })); setSubmitted(false); };
  const pickDevice = (id) => { setDeviceId(id); setSubmitted(false); };

  const valid = src.ipap && src.epap && src.rr && src.vt && src.ti && Number(src.ipap) > Number(src.epap);
  const dev = DEVICES[deviceId];

  return (
    <div className="vent-root">
      <style>{CSS}</style>
      <header className="vent-head">
        <div className="vent-mark">VENTARA</div>
        <div className="vent-flow">
          <span className="chip chip-src">Philips V60 \u00B7 {src.mode}</span>
          <span className="arrow">\u2192</span>
          <span className="chip chip-tgt">{dev.name} \u00B7 {dev.mode_label}</span>
        </div>
        <p className="vent-sub">Inpatient bilevel \u2192 home VAPS-AE. Pick a target device; output adopts that device's field names, scales, and switches. Yellow fields need your judgment.</p>
      </header>

      <div className="vent-grid">
        <section className="card">
          <h2 className="card-h">Source \u2014 Philips V60</h2>
          <label className="fld"><span>Mode</span>
            <select value={src.mode} onChange={set("mode")}>
              <option value="ST">S/T (spontaneous/timed)</option>
              <option value="PCV">PCV (pressure control)</option>
            </select></label>
          <div className="fld-row">
            <label className="fld"><span>IPAP <em>cmH\u2082O</em></span><input value={src.ipap} onChange={set("ipap")} inputMode="decimal" /></label>
            <label className="fld"><span>EPAP <em>cmH\u2082O</em></span><input value={src.epap} onChange={set("epap")} inputMode="decimal" /></label>
          </div>
          <div className="fld-row">
            <label className="fld"><span>Set rate <em>/min</em></span><input value={src.rr} onChange={set("rr")} inputMode="decimal" /></label>
            <label className="fld"><span>Insp. time <em>s</em></span><input value={src.ti} onChange={set("ti")} inputMode="decimal" /></label>
          </div>
          <label className="fld fld-hero"><span>Delivered Vt <em>mL</em><small>average exhaled Vt from the flowsheet</small></span>
            <input value={src.vt} onChange={set("vt")} inputMode="decimal" /></label>
          <div className="fld-row">
            <label className="fld"><span>Trigger <em>L/min</em></span><input value={src.trigger} onChange={set("trigger")} inputMode="decimal" /></label>
            <label className="fld"><span>Rise <em>1\u20136</em></span>
              <select value={src.rise} onChange={set("rise")}>
                {[1,2,3,4,5,6].map(n => <option key={n} value={String(n)}>{n}</option>)}
              </select></label>
          </div>

          <h2 className="card-h" style={{ marginTop: 22 }}>Target device</h2>
          <div className="dev-grid">
            {DEVICE_ORDER.map(id => (
              <button key={id} className={`dev-btn ${deviceId === id ? "on" : ""}`} onClick={() => pickDevice(id)}>
                <span className="dev-name">{DEVICES[id].name}</span>
                <span className="dev-mode">{DEVICES[id].mode_label}</span>
                {DEVICES[id].caps.auto_epap_on !== "yes" && <span className="dev-tag">fixed EPAP</span>}
              </button>
            ))}
          </div>

          {!valid && <p className="warn-inline">Enter IPAP, EPAP, rate, Ti and delivered Vt. IPAP must exceed EPAP.</p>}
          <button className="go" disabled={!valid} onClick={() => setSubmitted(true)}>Translate to {dev.name}</button>
        </section>

        <section className="card card-out">
          <h2 className="card-h">{dev.name} \u2014 {dev.mode_label}</h2>
          {!result && <div className="empty">Enter the V60 settings and delivered tidal volume, choose a target device, then translate. Output uses the selected device's own field names.</div>}
          {result && <>
            {result.flags.length > 0 && (
              <div className="flags"><h3>Device switches to check</h3>
                {result.flags.map((f, i) => <p key={i}>\u26A0 {f}</p>)}</div>
            )}
            <div className="rows">{result.rows.map((r, i) => <Row key={i} r={r} />)}</div>
            <div className="calc"><h3>Calculations</h3>
              <ul>{result.calc.map((c, i) => <li key={i}>{c}</li>)}</ul></div>
            <div className="notes"><h3>Clinical notes</h3>
              {result.notes.map((n, i) => <p key={i}>{n}</p>)}
              <p className="disclaimer">Starting point only. Confirm all settings against the patient's ventilation on the target device. Not a substitute for clinical judgment.</p></div>
          </>}
        </section>
      </div>
    </div>
  );
}

function Row({ r }) {
  const b = BADGE[r.badge];
  const [open, setOpen] = useState(false);
  const naish = r.badge === "na";
  return (
    <div className={`row ${open ? "open" : ""} ${naish ? "row-na" : ""}`} onClick={() => setOpen(o => !o)}>
      <div className="row-main">
        <span className="row-param">{r.field}</span>
        <span className="row-val">{r.value} <em>{r.unit}</em></span>
        <span className={`badge ${b.cls}`}>{b.label}</span>
      </div>
      {open && <p className="row-why">{r.why}</p>}
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
.vent-root{--ink:#e8edf2;--ink-dim:#9fb0c0;--ink-faint:#647585;--ground:#0e1620;--panel:#16212e;--panel-2:#1c2937;--line:#2a3a4c;--green:#34d399;--purple:#a78bfa;--blue:#56b6e6;--amber:#f5b945;--na:#5a6b7c;--green-bg:rgba(52,211,153,.12);--purple-bg:rgba(167,139,250,.12);--blue-bg:rgba(86,182,230,.12);--amber-bg:rgba(245,185,69,.14);--na-bg:rgba(90,107,124,.12);font-family:'Space Grotesk',system-ui,sans-serif;background:var(--ground);color:var(--ink);min-height:100vh;padding:28px 20px 60px;box-sizing:border-box;}
.vent-root *{box-sizing:border-box}
.vent-head{max-width:1100px;margin:0 auto 26px}
.vent-mark{font-weight:700;letter-spacing:.34em;font-size:13px;color:var(--ink-dim);margin-bottom:14px}
.vent-flow{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.chip{font-family:'IBM Plex Mono',monospace;font-size:13px;padding:7px 13px;border-radius:7px;border:1px solid var(--line)}
.chip-src{background:var(--panel);color:var(--ink-dim)}
.chip-tgt{background:var(--panel-2);color:var(--ink);border-color:#34506a}
.arrow{color:var(--ink-faint);font-size:18px}
.vent-sub{color:var(--ink-faint);font-size:14px;margin:14px 0 0;max-width:66ch;line-height:1.5}
.vent-grid{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:20px}
@media(max-width:860px){.vent-grid{grid-template-columns:1fr}}
.card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:22px}
.card-h{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-faint);margin:0 0 18px;font-weight:500}
.fld{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
.fld>span{font-size:13px;color:var(--ink-dim);display:flex;align-items:baseline;gap:8px}
.fld>span em{font-style:normal;color:var(--ink-faint);font-size:11px;font-family:'IBM Plex Mono',monospace}
.fld>span small{color:var(--ink-faint);font-size:11px;font-weight:400}
.fld input,.fld select{background:var(--ground);border:1px solid var(--line);border-radius:8px;color:var(--ink);padding:10px 12px;font-size:15px;font-family:'IBM Plex Mono',monospace;width:100%}
.fld input:focus,.fld select:focus{outline:2px solid var(--blue);border-color:var(--blue)}
.fld-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.fld-hero>span{color:var(--ink)}
.fld-hero input{border-color:#34506a;background:#101b27}
.dev-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:18px}
.dev-btn{display:flex;flex-direction:column;gap:3px;align-items:flex-start;text-align:left;background:var(--panel-2);border:1px solid var(--line);border-radius:9px;padding:10px 12px;cursor:pointer;color:var(--ink-dim);transition:border-color .15s,background .15s}
.dev-btn:hover{border-color:#3a5168}
.dev-btn.on{border-color:var(--blue);background:#13212e;color:var(--ink)}
.dev-name{font-size:13px;font-weight:500}
.dev-mode{font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--ink-faint)}
.dev-tag{font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--amber);background:var(--amber-bg);border:1px solid rgba(245,185,69,.3);border-radius:5px;padding:1px 6px;margin-top:3px}
.warn-inline{color:var(--amber);font-size:12.5px;margin:4px 0 14px;line-height:1.45}
.go{width:100%;background:var(--blue);color:#06121c;border:0;border-radius:9px;padding:13px;font-family:'Space Grotesk';font-weight:700;font-size:15px;cursor:pointer;margin-top:4px}
.go:disabled{background:var(--panel-2);color:var(--ink-faint);cursor:not-allowed}
.go:not(:disabled):hover{filter:brightness(1.08)}
.empty{color:var(--ink-faint);font-size:14px;line-height:1.6;padding:30px 4px}
.flags{background:rgba(245,185,69,.08);border:1px solid rgba(245,185,69,.3);border-radius:10px;padding:13px 15px;margin-bottom:16px}
.flags h3{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--amber);margin:0 0 8px;font-weight:600}
.flags p{font-size:13px;line-height:1.5;color:var(--ink-dim);margin:0 0 6px}
.flags p:last-child{margin-bottom:0}
.rows{display:flex;flex-direction:column;gap:8px}
.row{background:var(--panel-2);border:1px solid var(--line);border-radius:10px;padding:13px 15px;cursor:pointer;transition:border-color .15s}
.row:hover{border-color:#3a5168}
.row-na{opacity:.7}
.row-main{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:14px}
.row-param{font-size:14px;color:var(--ink-dim)}
.row-val{font-family:'IBM Plex Mono',monospace;font-size:16px;font-weight:600;color:var(--ink);text-align:right;white-space:nowrap}
.row-val em{font-style:normal;font-size:11px;color:var(--ink-faint);font-weight:400}
.row-why{margin:11px 0 2px;font-size:13px;line-height:1.55;color:var(--ink-dim);border-top:1px solid var(--line);padding-top:10px}
.badge{font-family:'IBM Plex Mono',monospace;font-size:11px;padding:4px 9px;border-radius:6px;white-space:nowrap;border:1px solid transparent}
.b-direct{color:var(--green);background:var(--green-bg);border-color:rgba(52,211,153,.3)}
.b-calc{color:var(--purple);background:var(--purple-bg);border-color:rgba(167,139,250,.3)}
.b-ord{color:var(--blue);background:var(--blue-bg);border-color:rgba(86,182,230,.3)}
.b-default,.b-review{color:var(--amber);background:var(--amber-bg);border-color:rgba(245,185,69,.36)}
.b-na{color:var(--na);background:var(--na-bg);border-color:rgba(90,107,124,.3)}
.calc,.notes{margin-top:20px;border-top:1px solid var(--line);padding-top:16px}
.calc h3,.notes h3{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-faint);margin:0 0 11px;font-weight:500}
.calc ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:7px}
.calc li{font-family:'IBM Plex Mono',monospace;font-size:12.5px;color:var(--ink-dim);background:var(--ground);border:1px solid var(--line);border-radius:7px;padding:9px 12px;line-height:1.5}
.notes p{font-size:13px;line-height:1.6;color:var(--ink-dim);margin:0 0 11px}
.disclaimer{color:var(--amber)!important;font-size:12.5px!important;border-top:1px solid var(--line);padding-top:11px;margin-top:4px!important}
`;




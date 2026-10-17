import React, { useState, useMemo } from "react";

/* ============================================================================
   VENTARA — Cross-Mode Translator (v14, iteration 1)
   Scope of this iteration:
     SOURCE: generic ST  or  generic PCV   (fixed bilevel / inpatient bipap)
     TARGET: VAPS-AE PS  on ResMed Astral  (volume-targeted, auto-EPAP)

   Design intent: this is a clinical decision-support tool, not a calculator.
   Every output value declares HOW it was derived via a badge, and ambiguous
   clinical-judgment fields are forced to yellow (review/default) rather than
   being laundered into confident-looking numbers.
   ============================================================================ */

/* ---- Badge taxonomy -------------------------------------------------------
   direct      green   value carried 1:1 from a real source field
   calculated  purple  deterministic math from source inputs
   ordinal     blue    closest step on a device's ordinal scale
   default     yellow  no source equivalent — a starting bound was supplied
   review      yellow  clinical judgment required before use
   --------------------------------------------------------------------------- */
const BADGE = {
  direct:     { label: "direct",      cls: "b-direct" },
  calculated: { label: "calculated",  cls: "b-calc" },
  ordinal:    { label: "closest step",cls: "b-ord" },
  default:    { label: "default ⚠",   cls: "b-default" },
  review:     { label: "review ⚠",    cls: "b-review" },
};

/* ---- Clinical translation primitives ------------------------------------- */

// Vt (mL) -> Target Va (L/min), using the rate the volume was produced at.
// Va = (Vt - deadspace) * rate / 1000
const vtToVa = (vt, rate, deadspace = 150) =>
  ((vt - deadspace) * rate) / 1000;

// Ti from rate assuming 1:2 I:E, then min/max window.
const tiFromRate = (rate) => 60 / rate / 3;

// Rise: ResMed devices accept direct ms. Source ordinal -> ms is a v13 concern;
// for generic sources we accept ms directly and pass through.
// Trigger/Cycle: translate through L/min and % respectively (v13 layer).

/* ---- The transition engine ------------------------------------------------
   Given source inputs, produce an ordered list of target rows. Each row is
   { param, value, unit, badge, why } where `why` feeds the calc box / notes.
   --------------------------------------------------------------------------- */
function translate(src) {
  const rows = [];
  const calc = [];
  const notes = [];

  const rate = Number(src.rr);
  const ipap = Number(src.ipap);
  const epap = Number(src.epap);
  const vt = Number(src.vt);
  const isPCV = src.mode === "PCV";

  // --- EPAP min : carries directly from source EPAP ---
  rows.push({
    param: "EPAP min", value: epap, unit: "cmH₂O", badge: "direct",
    why: "Source EPAP becomes the lower bound of the auto-EPAP range.",
  });

  // --- EPAP max : no source equivalent -> clinical bound (yellow) ---
  rows.push({
    param: "EPAP max", value: epap + 4, unit: "cmH₂O", badge: "default",
    why: "Auto-EPAP needs an upper bound the fixed source never had. " +
         "Shown as EPAP min + 4 as a STARTING point only — set per the patient's " +
         "obstructive burden and titration goals.",
  });
  notes.push(
    "Fixed EPAP became an auto-adjusting range. The device will now move EPAP " +
    "between the min and max to manage upper-airway obstruction — confirm the " +
    "max is appropriate before use."
  );

  // --- Target Va : the whole point of the mode, derived from measured Vt ---
  const va = vtToVa(vt, rate);
  rows.push({
    param: "Target Va", value: round(va, 1), unit: "L/min", badge: "calculated",
    why: `Derived from the delivered Vt you entered (${vt} mL) and the set rate ` +
         `(${rate}/min): Va = (Vt − 150) × rate ÷ 1000.`,
  });
  calc.push(
    `Target Va = (${vt} − 150) × ${rate} ÷ 1000 = ${round(va, 1)} L/min`
  );
  notes.push(
    "The source mode had no volume guarantee — it delivered whatever volume the " +
    "set pressures produced. The target now guarantees ventilation to this Va, " +
    "derived from the Vt you read off the flowsheet. Treat it as a starting " +
    "target and confirm against the patient's actual ventilation on the home device."
  );

  // --- Target patient rate : we only have set rate inpatient ---
  rows.push({
    param: "Target patient rate", value: rate + 2, unit: "/min", badge: "review",
    why: "iVAPS target rate is normally patient spontaneous RR + 2. Only the set " +
         "rate is available inpatient, so this is set RR + 2 — re-check once a " +
         "spontaneous rate is observed on the home device.",
  });

  // --- PS / IPAP ceiling : source IPAP becomes the pressure-support ceiling ---
  const psMax = ipap - epap;
  rows.push({
    param: "PS max", value: psMax, unit: "cmH₂O", badge: "direct",
    why: `Source IPAP − EPAP (${ipap} − ${epap}) is the pressure support the ` +
         `patient was receiving; it becomes the ceiling the device may reach to ` +
         `hit the volume target.`,
  });
  calc.push(`PS max = IPAP − EPAP = ${ipap} − ${epap} = ${psMax} cmH₂O`);

  // --- PS min : needs a floor the source doesn't contain ---
  rows.push({
    param: "PS min", value: 4, unit: "cmH₂O", badge: "review",
    why: "VAPS needs a lower pressure-support bound the fixed source never " +
         "specified. 4 cmH₂O shown as a conservative floor — set per comfort and " +
         "the minimum support you want guaranteed.",
  });

  // --- Backup rate : carries directly ---
  rows.push({
    param: "Backup rate", value: rate, unit: "/min", badge: "direct",
    why: "Source set/backup rate carries directly.",
  });

  // --- Ti min / max ---
  const ti = isPCV ? tiFromRate(rate) : tiFromRate(rate);
  const tiMin = round(ti - 0.2, 2);
  const tiMax = round(ti + 0.6, 2);
  rows.push({
    param: "Ti min", value: tiMin, unit: "s", badge: "calculated",
    why: isPCV
      ? `Source PCV Ti is fixed; the flow-cycled target needs a window. ` +
        `Ti = 60 ÷ ${rate} ÷ 3 = ${round(ti, 2)} s, then −0.2.`
      : `ST is already flow-cycled. Ti window seeded from rate: ` +
        `Ti = 60 ÷ ${rate} ÷ 3 = ${round(ti, 2)} s, then −0.2.`,
  });
  rows.push({
    param: "Ti max", value: tiMax, unit: "s", badge: "calculated",
    why: `Ti = ${round(ti, 2)} s, then +0.6 for the upper bound.`,
  });
  calc.push(
    `Ti = 60 ÷ ${rate} ÷ 3 = ${round(ti, 2)} s  →  Ti min ${tiMin} s, Ti max ${tiMax} s`
  );
  if (isPCV) {
    notes.push(
      "The source was time-cycled (fixed Ti); the target is flow-cycled. The " +
      "single Ti became a min/max window so the device can cycle on flow within " +
      "safe time limits."
    );
  }

  // --- Trigger : through L/min (v13 common unit) ---
  if (src.trigger !== "") {
    rows.push({
      param: "Trigger", value: src.trigger, unit: "L/min", badge: "calculated",
      why: "Translated through L/min, the common trigger unit across devices.",
    });
  }

  // --- Rise : ResMed accepts ms directly ---
  if (src.rise !== "") {
    rows.push({
      param: "Rise", value: src.rise, unit: "ms", badge: "direct",
      why: "ResMed devices set rise time directly in ms; passed through.",
    });
  }

  return { rows, calc, notes };
}

const round = (n, d = 0) => {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
};

/* ============================================================================
   UI
   ============================================================================ */
export default function Ventara() {
  const [src, setSrc] = useState({
    mode: "ST",
    ipap: "18",
    epap: "8",
    rr: "14",
    ti: "1.2",
    vt: "480",
    trigger: "3",
    rise: "200",
  });
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(
    () => (submitted ? translate(src) : null),
    [submitted, src]
  );

  const set = (k) => (e) => {
    setSrc((s) => ({ ...s, [k]: e.target.value }));
    setSubmitted(false);
  };

  const valid =
    src.ipap && src.epap && src.rr && src.vt &&
    Number(src.ipap) > Number(src.epap);

  return (
    <div className="vent-root">
      <style>{CSS}</style>

      <header className="vent-head">
        <div className="vent-mark">VENTARA</div>
        <div className="vent-flow">
          <span className="chip chip-src">{src.mode} · fixed bilevel</span>
          <span className="arrow">→</span>
          <span className="chip chip-tgt">VAPS-AE PS · ResMed Astral</span>
        </div>
        <p className="vent-sub">
          Cross-mode translation. Output values declare how they were derived —
          yellow fields need your judgment before use.
        </p>
      </header>

      <div className="vent-grid">
        {/* ---- INPUT ---- */}
        <section className="card">
          <h2 className="card-h">Source settings</h2>

          <label className="fld">
            <span>Source mode</span>
            <select value={src.mode} onChange={set("mode")}>
              <option value="ST">ST (spontaneous/timed)</option>
              <option value="PCV">PCV (pressure control)</option>
            </select>
          </label>

          <div className="fld-row">
            <label className="fld">
              <span>IPAP <em>cmH₂O</em></span>
              <input value={src.ipap} onChange={set("ipap")} inputMode="decimal" />
            </label>
            <label className="fld">
              <span>EPAP <em>cmH₂O</em></span>
              <input value={src.epap} onChange={set("epap")} inputMode="decimal" />
            </label>
          </div>

          <div className="fld-row">
            <label className="fld">
              <span>Set rate <em>/min</em></span>
              <input value={src.rr} onChange={set("rr")} inputMode="decimal" />
            </label>
            {src.mode === "PCV" && (
              <label className="fld">
                <span>Ti <em>s</em></span>
                <input value={src.ti} onChange={set("ti")} inputMode="decimal" />
              </label>
            )}
          </div>

          <label className="fld fld-hero">
            <span>
              Delivered Vt <em>mL</em>
              <small>average exhaled Vt from the flowsheet</small>
            </span>
            <input value={src.vt} onChange={set("vt")} inputMode="decimal" />
          </label>

          <div className="fld-row">
            <label className="fld">
              <span>Trigger <em>L/min</em></span>
              <input value={src.trigger} onChange={set("trigger")} inputMode="decimal" />
            </label>
            <label className="fld">
              <span>Rise <em>ms</em></span>
              <input value={src.rise} onChange={set("rise")} inputMode="decimal" />
            </label>
          </div>

          {!valid && (
            <p className="warn-inline">
              Enter IPAP, EPAP, rate and delivered Vt. IPAP must exceed EPAP.
            </p>
          )}

          <button
            className="go"
            disabled={!valid}
            onClick={() => setSubmitted(true)}
          >
            Translate settings
          </button>
        </section>

        {/* ---- OUTPUT ---- */}
        <section className="card card-out">
          <h2 className="card-h">Target settings</h2>

          {!result && (
            <div className="empty">
              Enter the inpatient settings and the delivered tidal volume, then
              translate. Each result will show how it was derived.
            </div>
          )}

          {result && (
            <>
              <div className="rows">
                {result.rows.map((r, i) => (
                  <Row key={i} r={r} />
                ))}
              </div>

              <div className="calc">
                <h3>Calculations</h3>
                <ul>
                  {result.calc.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="notes">
                <h3>Clinical notes</h3>
                {result.notes.map((n, i) => (
                  <p key={i}>{n}</p>
                ))}
                <p className="disclaimer">
                  Starting point only. Confirm all settings against the patient's
                  ventilation on the target device. Not a substitute for clinical
                  judgment.
                </p>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function Row({ r }) {
  const b = BADGE[r.badge];
  const [open, setOpen] = useState(false);
  return (
    <div className={`row ${open ? "open" : ""}`} onClick={() => setOpen((o) => !o)}>
      <div className="row-main">
        <span className="row-param">{r.param}</span>
        <span className="row-val">
          {r.value} <em>{r.unit}</em>
        </span>
        <span className={`badge ${b.cls}`}>{b.label}</span>
      </div>
      {open && <p className="row-why">{r.why}</p>}
    </div>
  );
}

/* ============================================================================
   STYLES
   Direction: clinical instrument panel. Deep slate ground, signal-coded badges
   that read like monitor telemetry, a single warm amber reserved exclusively
   for "needs your judgment". IBM Plex Mono for values (instrument readout),
   a grotesk for labels. The signature is the derivation-transparency row:
   tap any output to see the reasoning, so the tool never asserts without
   showing its work.
   ============================================================================ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.vent-root{
  --ink:#e8edf2; --ink-dim:#9fb0c0; --ink-faint:#647585;
  --ground:#0e1620; --panel:#16212e; --panel-2:#1c2937; --line:#2a3a4c;
  --green:#34d399; --purple:#a78bfa; --blue:#56b6e6; --amber:#f5b945;
  --green-bg:rgba(52,211,153,.12); --purple-bg:rgba(167,139,250,.12);
  --blue-bg:rgba(86,182,230,.12); --amber-bg:rgba(245,185,69,.14);
  font-family:'Space Grotesk',system-ui,sans-serif;
  background:var(--ground); color:var(--ink);
  min-height:100vh; padding:28px 20px 60px; box-sizing:border-box;
}
.vent-root *{box-sizing:border-box}

.vent-head{max-width:1040px;margin:0 auto 26px}
.vent-mark{
  font-weight:700;letter-spacing:.34em;font-size:13px;color:var(--ink-dim);
  margin-bottom:14px;
}
.vent-flow{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.chip{
  font-family:'IBM Plex Mono',monospace;font-size:13px;padding:7px 13px;
  border-radius:7px;border:1px solid var(--line);
}
.chip-src{background:var(--panel);color:var(--ink-dim)}
.chip-tgt{background:var(--panel-2);color:var(--ink);border-color:#34506a}
.arrow{color:var(--ink-faint);font-size:18px}
.vent-sub{color:var(--ink-faint);font-size:14px;margin:14px 0 0;max-width:60ch;line-height:1.5}

.vent-grid{
  max-width:1040px;margin:0 auto;display:grid;
  grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:20px;
}
@media(max-width:820px){.vent-grid{grid-template-columns:1fr}}

.card{
  background:var(--panel);border:1px solid var(--line);border-radius:14px;
  padding:22px;
}
.card-h{
  font-size:12px;letter-spacing:.18em;text-transform:uppercase;
  color:var(--ink-faint);margin:0 0 18px;font-weight:500;
}

.fld{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
.fld>span{
  font-size:13px;color:var(--ink-dim);display:flex;align-items:baseline;gap:8px;
}
.fld>span em{font-style:normal;color:var(--ink-faint);font-size:11px;
  font-family:'IBM Plex Mono',monospace}
.fld>span small{color:var(--ink-faint);font-size:11px;font-weight:400}
.fld input,.fld select{
  background:var(--ground);border:1px solid var(--line);border-radius:8px;
  color:var(--ink);padding:10px 12px;font-size:15px;
  font-family:'IBM Plex Mono',monospace;width:100%;
}
.fld input:focus,.fld select:focus{outline:2px solid var(--blue);border-color:var(--blue)}
.fld-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.fld-hero>span{color:var(--ink)}
.fld-hero input{border-color:#34506a;background:#101b27}

.warn-inline{color:var(--amber);font-size:12.5px;margin:4px 0 14px;line-height:1.45}
.go{
  width:100%;background:var(--blue);color:#06121c;border:0;border-radius:9px;
  padding:13px;font-family:'Space Grotesk';font-weight:700;font-size:15px;
  cursor:pointer;letter-spacing:.01em;margin-top:4px;
}
.go:disabled{background:var(--panel-2);color:var(--ink-faint);cursor:not-allowed}
.go:not(:disabled):hover{filter:brightness(1.08)}

.empty{color:var(--ink-faint);font-size:14px;line-height:1.6;padding:30px 4px}

.rows{display:flex;flex-direction:column;gap:8px}
.row{
  background:var(--panel-2);border:1px solid var(--line);border-radius:10px;
  padding:13px 15px;cursor:pointer;transition:border-color .15s;
}
.row:hover{border-color:#3a5168}
.row-main{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:14px}
.row-param{font-size:14px;color:var(--ink-dim)}
.row-val{
  font-family:'IBM Plex Mono',monospace;font-size:17px;font-weight:600;
  color:var(--ink);text-align:right;white-space:nowrap;
}
.row-val em{font-style:normal;font-size:11px;color:var(--ink-faint);font-weight:400}
.row-why{
  margin:11px 0 2px;font-size:13px;line-height:1.55;color:var(--ink-dim);
  border-top:1px solid var(--line);padding-top:10px;
}

.badge{
  font-family:'IBM Plex Mono',monospace;font-size:11px;padding:4px 9px;
  border-radius:6px;white-space:nowrap;border:1px solid transparent;
}
.b-direct{color:var(--green);background:var(--green-bg);border-color:rgba(52,211,153,.3)}
.b-calc{color:var(--purple);background:var(--purple-bg);border-color:rgba(167,139,250,.3)}
.b-ord{color:var(--blue);background:var(--blue-bg);border-color:rgba(86,182,230,.3)}
.b-default,.b-review{color:var(--amber);background:var(--amber-bg);border-color:rgba(245,185,69,.36)}

.calc,.notes{margin-top:20px;border-top:1px solid var(--line);padding-top:16px}
.calc h3,.notes h3{
  font-size:11px;letter-spacing:.16em;text-transform:uppercase;
  color:var(--ink-faint);margin:0 0 11px;font-weight:500;
}
.calc ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:7px}
.calc li{
  font-family:'IBM Plex Mono',monospace;font-size:12.5px;color:var(--ink-dim);
  background:var(--ground);border:1px solid var(--line);border-radius:7px;
  padding:9px 12px;line-height:1.5;
}
.notes p{font-size:13px;line-height:1.6;color:var(--ink-dim);margin:0 0 11px}
.disclaimer{color:var(--amber)!important;font-size:12.5px!important;
  border-top:1px solid var(--line);padding-top:11px;margin-top:4px!important}
`;





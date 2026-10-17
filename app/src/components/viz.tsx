/*
 * Inline SVG figures. One hue (blue) for data marks, yellow only for the "source value"
 * marker, navy ink for reference marks, text in text tokens.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";

const C = {
  ink2: "var(--ink-2)",
  ink3: "var(--ink-3)",
  line: "var(--line)",
  line2: "var(--line-2)",
  blue: "var(--blue)",
  navy: "var(--navy)",
  yellow: "var(--yellow)",
  bg: "var(--bg)",
  bad: "var(--bad)",
  ok: "var(--ok)",
};

function useWidth(fallback = 320) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setW(el.clientWidth || fallback);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width || fallback));
    ro.observe(el);
    return () => ro.disconnect();
  }, [fallback]);
  return [ref, w] as const;
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export function Figure({ title, note, span, children }: { title: string; note?: string; span?: boolean; children: ReactNode }) {
  return (
    <div className={`viz ${span ? "span" : ""}`}>
      <div className="cap">
        <span>{title}</span>
        {note && <small>{note}</small>}
      </div>
      {children}
    </div>
  );
}

/* ── Scale strip: where a source value lands on a device's ordinal scale ─── */

export interface Step {
  s: string | number;
  v: number;
}

export function ScaleStrip({ steps, value, unit, chosen }: { steps: Step[]; value: number; unit: string; chosen: string | number }) {
  const [ref, W] = useWidth();
  const pad = 16;
  const H = 46;
  const y = 21;
  const vs = steps.map((s) => s.v);
  const lo = Math.min(...vs);
  const hi = Math.max(...vs);
  const x = (v: number) => pad + ((v - lo) / (hi - lo || 1)) * (W - 2 * pad);
  const vx = x(Math.min(hi, Math.max(lo, value)));
  const dense = (W - 2 * pad) / steps.length < 36;
  const chosenStep = steps.find((s) => String(s.s) === String(chosen));
  return (
    <div ref={ref} className="strip">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label={`${value} ${unit} on the device scale, step ${chosen}`}>
        <line x1={pad} x2={W - pad} y1={y} y2={y} stroke={C.line2} />
        {steps.map((s, i) => {
          const cx = x(s.v);
          const isC = String(s.s) === String(chosen);
          const showV = !dense || i === 0 || i === steps.length - 1 || isC;
          return (
            <g key={i}>
              <title>{`step ${s.s} = ${s.v} ${unit}`}</title>
              <line x1={cx} x2={cx} y1={y - 5} y2={y + 5} stroke={isC ? C.blue : C.line2} strokeWidth={isC ? 2 : 1} />
              <text x={cx} y={y - 9} textAnchor="middle" fontSize="10" fontWeight={isC ? 700 : 500} fill={isC ? C.navy : C.ink3}>
                {s.s}
              </text>
              {showV && (
                <text x={cx} y={y + 17} textAnchor="middle" fontSize="9.5" fill={C.ink3}>
                  {s.v}
                </text>
              )}
            </g>
          );
        })}
        {chosenStep && Math.abs(x(chosenStep.v) - vx) > 1 && (
          <line x1={vx} x2={x(chosenStep.v)} y1={y} y2={y} stroke={C.yellow} strokeWidth={3} strokeLinecap="round" />
        )}
        <circle cx={vx} cy={y} r={5} fill={C.yellow} stroke={C.bg} strokeWidth={2}>
          <title>{`source ${value} ${unit}`}</title>
        </circle>
      </svg>
    </div>
  );
}

/* ── Breath timing: pressure–time waveform for two breaths ───────────────── */

export interface Breath {
  rr: number;
  ti?: number;
  tiMin?: number;
  tiMax?: number;
  riseMs?: number;
  epapLo: number;
  epapHi?: number;
  ipapLo: number;
  ipapHi?: number;
}

export function BreathWave(b: Breath) {
  const [ref, W] = useWidth();
  const [hover, setHover] = useState<{ t: number; p: number; mx: number } | null>(null);
  const H = 138;
  const padL = 30;
  const padR = 10;
  const padT = 16;
  const padB = 32;
  const cycles = 2;
  const T = 60 / b.rr;
  const ti = b.ti ?? (b.tiMin != null && b.tiMax != null ? (b.tiMin + b.tiMax) / 2 : T / 3);
  const rise = (b.riseMs ?? 0) / 1000;
  const epapHi = b.epapHi ?? b.epapLo;
  const ipapHi = b.ipapHi ?? b.ipapLo;
  const banded = epapHi > b.epapLo || ipapHi > b.ipapLo;
  const pMax = Math.max(ipapHi, 10) + 3;
  const x = (t: number) => padL + (t / (cycles * T)) * (W - padL - padR);
  const y = (p: number) => padT + (1 - p / pMax) * (H - padT - padB);
  const tiEff = Math.min(ti, T - 0.05);
  const riseEff = Math.min(rise, tiEff);

  const pts = (e: number, i: number) => {
    const out: [number, number][] = [];
    for (let k = 0; k < cycles; k++) {
      const t0 = k * T;
      out.push([t0, e], [t0 + riseEff, i], [t0 + tiEff, i], [t0 + tiEff, e], [t0 + T, e]);
    }
    return out;
  };
  const d = (p: [number, number][]) => p.map(([t, pr], i) => `${i ? "L" : "M"}${x(t).toFixed(1)},${y(pr).toFixed(1)}`).join(" ");
  const low = pts(b.epapLo, b.ipapLo);
  const high = pts(epapHi, ipapHi);
  const band = d(low) + " " + [...high].reverse().map(([t, pr]) => `L${x(t).toFixed(1)},${y(pr).toFixed(1)}`).join(" ") + " Z";

  const pressureAt = (t: number) => {
    const tt = ((t % T) + T) % T;
    if (tt < riseEff) return b.epapLo + ((b.ipapLo - b.epapLo) * tt) / riseEff;
    if (tt < tiEff) return b.ipapLo;
    return b.epapLo;
  };
  const tooLong = ti >= T || (b.tiMax != null && b.tiMax >= T);
  const ie = ((T - ti) / ti).toFixed(1);

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const mx = e.clientX - r.left;
        const t = ((mx - padL) / (W - padL - padR)) * cycles * T;
        if (t < 0 || t > cycles * T) return setHover(null);
        setHover({ t, p: pressureAt(t), mx });
      }}
      onMouseLeave={() => setHover(null)}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Pressure over time for two breaths">
        {[b.epapLo, ipapHi].map((p) => (
          <g key={p}>
            <line x1={padL} x2={W - padR} y1={y(p)} y2={y(p)} stroke={C.line} />
            <text x={padL - 5} y={y(p) + 3.5} textAnchor="end" fontSize="10" fill={C.ink3}>
              {fmt(p)}
            </text>
          </g>
        ))}
        {b.tiMin != null && b.tiMax != null &&
          Array.from({ length: cycles }, (_, k) => (
            <rect
              key={k}
              x={x(k * T + b.tiMin!)}
              width={Math.max(1, x(k * T + Math.min(b.tiMax!, cycles * T)) - x(k * T + b.tiMin!))}
              y={padT}
              height={H - padT - padB}
              fill={C.yellow}
              fillOpacity={0.18}
            >
              <title>{`Ti window ${b.tiMin}–${b.tiMax} s`}</title>
            </rect>
          ))}
        {banded && <path d={band} fill={C.blue} fillOpacity={0.12} />}
        {banded && <path d={d(high)} fill="none" stroke={C.blue} strokeWidth={1.5} strokeOpacity={0.5} strokeLinejoin="round" />}
        <path d={d(low)} fill="none" stroke={C.blue} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {Array.from({ length: cycles + 1 }, (_, k) => (
          <text key={k} x={x(k * T)} y={H - padB + 12} textAnchor={k === 0 ? "start" : k === cycles ? "end" : "middle"} fontSize="10" fill={C.ink3}>
            {k === 0 ? "0" : `${(k * T).toFixed(1)} s`}
          </text>
        ))}
        <text x={W - padR} y={11} textAnchor="end" fontSize="10" fill={tooLong ? C.bad : C.ink2}>
          {tooLong ? `Ti exceeds the breath cycle (60 ÷ ${b.rr} = ${T.toFixed(1)} s)` : `${b.rr} bpm · cycle ${T.toFixed(1)} s · Ti ${fmt(ti)} s · I:E 1:${ie}`}
        </text>
        <g fontSize="9.5" fill={C.ink3}>
          <line x1={padL} x2={padL + 14} y1={H - 4} y2={H - 4} stroke={C.blue} strokeWidth={2} />
          <text x={padL + 18} y={H - 1}>{banded ? "min breath" : "breath"}</text>
          {banded && (
            <>
              <line x1={padL + 78} x2={padL + 92} y1={H - 4} y2={H - 4} stroke={C.blue} strokeWidth={1.5} strokeOpacity={0.5} />
              <text x={padL + 96} y={H - 1}>max breath</text>
            </>
          )}
          {b.tiMin != null && b.tiMax != null && (
            <>
              <rect x={padL + (banded ? 160 : 70)} y={H - 10} width={12} height={9} fill={C.yellow} fillOpacity={0.4} />
              <text x={padL + (banded ? 176 : 86)} y={H - 1}>Ti window</text>
            </>
          )}
        </g>
        {hover && (
          <g>
            <line x1={x(hover.t)} x2={x(hover.t)} y1={padT} y2={H - padB} stroke={C.ink3} />
            <circle cx={x(hover.t)} cy={y(hover.p)} r={4} fill={C.blue} stroke={C.bg} strokeWidth={2} />
            <text x={x(hover.t) + (hover.mx > W / 2 ? -6 : 6)} y={y(hover.p) - 7} textAnchor={hover.mx > W / 2 ? "end" : "start"} fontSize="10.5" fill={C.ink2}>
              {`${hover.t.toFixed(2)} s · ${fmt(hover.p)} cmH₂O`}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

/* ── Pressure envelope: horizontal range bars with reference markers ─────── */

export interface PBar {
  label: string;
  lo: number;
  hi: number;
}

export function PressureBars({ bars, markers = [] }: { bars: PBar[]; markers?: { label: string; value: number }[] }) {
  const [ref, W] = useWidth();
  const rowH = 22;
  const padL = 64;
  const padR = 44;
  const padT = markers.length ? 14 : 6;
  const padB = 16;
  const H = padT + bars.length * rowH + padB;
  const top = Math.max(...bars.map((b) => b.hi), ...markers.map((m) => m.value), 10);
  const max = Math.ceil(top / 5) * 5 + 2;
  const step = max > 45 ? 10 : 5;
  const x = (v: number) => padL + (v / max) * (W - padL - padR);
  const ticks: number[] = [];
  for (let v = 0; v <= max; v += step) ticks.push(v);
  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Pressure ranges">
        {ticks.map((v) => (
          <g key={v}>
            <line x1={x(v)} x2={x(v)} y1={padT} y2={H - padB} stroke={C.line} />
            <text x={x(v)} y={H - 4} textAnchor="middle" fontSize="9.5" fill={C.ink3}>
              {v}
            </text>
          </g>
        ))}
        {bars.map((b, i) => {
          const yy = padT + i * rowH + 5;
          const single = b.hi <= b.lo;
          return (
            <g key={b.label}>
              <title>{`${b.label}: ${single ? fmt(b.lo) : `${fmt(b.lo)}–${fmt(b.hi)}`} cmH₂O`}</title>
              <text x={padL - 8} y={yy + 10} textAnchor="end" fontSize="10.5" fill={C.ink2}>
                {b.label}
              </text>
              {single ? (
                <rect x={x(b.lo) - 2} y={yy} width={4} height={12} rx={2} fill={C.blue} />
              ) : (
                <rect x={x(b.lo)} y={yy} width={Math.max(3, x(b.hi) - x(b.lo))} height={12} rx={3} fill={C.blue} />
              )}
              <text x={x(b.hi) + 6} y={yy + 10} fontSize="10.5" fill={C.ink2} className="num" stroke={C.bg} strokeWidth={3} paintOrder="stroke">
                {single ? fmt(b.lo) : `${fmt(b.lo)}–${fmt(b.hi)}`}
              </text>
            </g>
          );
        })}
        {markers.map((m, i) => (
          <g key={m.label}>
            <title>{`${m.label}: ${fmt(m.value)} cmH₂O`}</title>
            <line x1={x(m.value)} x2={x(m.value)} y1={padT - 2} y2={H - padB} stroke={C.navy} strokeWidth={1.5} />
            <text x={x(m.value)} y={padT - 5} textAnchor={i % 2 ? "start" : "end"} fontSize="9.5" fill={C.ink2}>
              {m.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ── Va ↔ Vt relation at the target rate (±2 bpm) ────────────────────────── */

export function VaLine({ vt, rate, va }: { vt: number; rate: number; va: number }) {
  const [ref, W] = useWidth();
  const [hv, setHv] = useState<number | null>(null);
  const H = 150;
  const padL = 32;
  const padR = 46;
  const padT = 10;
  const padB = 20;
  const vtMin = 150;
  const vtMax = Math.max(800, Math.ceil((vt * 1.4) / 100) * 100);
  const f = (v: number, r: number) => ((v - 150) * r) / 1000;
  const rates = [rate - 2, rate, rate + 2].filter((r) => r > 0);
  const vaMax = Math.max(f(vtMax, rates[rates.length - 1]), va) * 1.05;
  const x = (v: number) => padL + ((v - vtMin) / (vtMax - vtMin)) * (W - padL - padR);
  const y = (a: number) => padT + (1 - a / vaMax) * (H - padT - padB);
  const xt: number[] = [];
  for (let v = 200; v <= vtMax; v += 200) xt.push(v);
  const yStep = vaMax > 12 ? 4 : 2;
  const yt: number[] = [];
  for (let a = 0; a <= vaMax; a += yStep) yt.push(a);
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const v = vtMin + ((e.clientX - r.left - padL) / (W - padL - padR)) * (vtMax - vtMin);
        setHv(v < vtMin || v > vtMax ? null : Math.round(v / 10) * 10);
      }}
      onMouseLeave={() => setHv(null)}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label={`Target Va versus tidal volume at ${rate} breaths per minute`}>
        {yt.map((a) => (
          <g key={a}>
            <line x1={padL} x2={W - padR} y1={y(a)} y2={y(a)} stroke={C.line} />
            <text x={padL - 5} y={y(a) + 3.5} textAnchor="end" fontSize="10" fill={C.ink3}>
              {a}
            </text>
          </g>
        ))}
        {xt.map((v, i) => (
          <text key={v} x={x(v)} y={H - 5} textAnchor="middle" fontSize="10" fill={C.ink3}>
            {i === xt.length - 1 ? `${v} mL` : v}
          </text>
        ))}
        {rates.map((r) => {
          const main = r === rate;
          return (
            <g key={r}>
              <line x1={x(vtMin)} y1={y(0)} x2={x(vtMax)} y2={y(f(vtMax, r))} stroke={C.blue} strokeWidth={main ? 2 : 1.25} strokeOpacity={main ? 1 : 0.45} strokeLinecap="round" />
              <text x={x(vtMax) + 5} y={y(f(vtMax, r)) + 3.5} fontSize="9.5" fontWeight={main ? 700 : 400} fill={main ? C.ink2 : C.ink3}>
                {r} bpm
              </text>
            </g>
          );
        })}
        <line x1={x(vt)} x2={x(vt)} y1={y(va)} y2={y(0)} stroke={C.line2} />
        <line x1={padL} x2={x(vt)} y1={y(va)} y2={y(va)} stroke={C.line2} />
        <circle cx={x(vt)} cy={y(va)} r={4.5} fill={C.yellow} stroke={C.bg} strokeWidth={2}>
          <title>{`${vt} mL at ${rate} bpm → ${va} L/min`}</title>
        </circle>
        <text x={x(vt) + 8} y={y(va) + 14} fontSize="10.5" fontWeight={600} fill={C.ink2}>
          {`${vt} mL → ${va} L/min`}
        </text>
        {hv != null && (
          <g>
            <line x1={x(hv)} x2={x(hv)} y1={padT} y2={H - padB} stroke={C.ink3} />
            <text x={x(hv) + (hv > (vtMin + vtMax) / 2 ? -6 : 6)} y={padT + 10} textAnchor={hv > (vtMin + vtMax) / 2 ? "end" : "start"} fontSize="10.5" fill={C.ink2}>
              {`${hv} mL → ${f(hv, rate).toFixed(1)} L/min`}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

/* ── Threshold gauge for a numeric criterion ─────────────────────────────── */

export function Gauge({ value, min, max, threshold, qualifies, met }: { value: number | null; min: number; max: number; threshold: number; qualifies: "above" | "below"; met: boolean | null }) {
  const W = 120;
  const H = 14;
  const x = (v: number) => 5 + ((Math.min(max, Math.max(min, v)) - min) / (max - min)) * (W - 10);
  const zone = qualifies === "above" ? [x(threshold), x(max)] : [x(min), x(threshold)];
  return (
    <svg className="gauge" width={W} height={H} role="img" aria-label={`threshold ${threshold}${value != null ? `, value ${value}` : ""}`}>
      <rect x={5} y={5} width={W - 10} height={4} rx={2} fill={C.line} />
      <rect x={zone[0]} y={5} width={zone[1] - zone[0]} height={4} rx={2} fill={C.ok} fillOpacity={0.35} />
      <line x1={x(threshold)} x2={x(threshold)} y1={1} y2={13} stroke={C.ink3} strokeWidth={1.5} />
      {value != null && Number.isFinite(value) && <circle cx={x(value)} cy={7} r={4.5} fill={met ? C.ok : C.bad} stroke={C.bg} strokeWidth={2} />}
    </svg>
  );
}

/* ── Label-based extraction for rows that use device nomenclature ─────────── */

export interface Vitals {
  epapLo?: number;
  epapHi?: number;
  psLo?: number;
  psHi?: number;
  ipapLo?: number;
  ipapHi?: number;
  rr?: number;
  ti?: number;
  tiMin?: number;
  tiMax?: number;
  riseMs?: number;
  vt?: number;
  va?: number;
}

export function vitalsFromLabels(rows: { label: string; value: string; unit: string }[]): Vitals {
  const v: Vitals = {};
  for (const r of rows) {
    const n = parseFloat(r.value);
    if (!Number.isFinite(n)) continue;
    const l = r.label.toLowerCase();
    const u = r.unit;
    if (/^(epap|peep) ?min/.test(l)) v.epapLo = n;
    else if (/^(epap|peep) ?max/.test(l)) v.epapHi = n;
    else if (/^(epap|peep)$/.test(l)) v.epapLo = v.epapHi = n;
    else if (/^ipap$/.test(l)) v.ipapLo = v.ipapHi = n;
    else if (/^ipap min|^min pressure/.test(l)) v.ipapLo = n;
    else if (/^ipap max|^max pressure/.test(l)) v.ipapHi = n;
    else if (/^(ps|pc|pressure support|pressure control)( |$)/.test(l) && /max/.test(l)) v.psHi = n;
    else if (/^(ps|pc|pressure support|pressure control)( |$)/.test(l)) v.psLo = n;
    else if (/target rate/.test(l)) v.rr = n - 2;
    else if (/rate/.test(l)) v.rr = n;
    else if (/ti ?min/.test(l)) v.tiMin = n;
    else if (/ti ?max|time cycle/.test(l)) v.tiMax = n;
    else if (/inspiratory time|back ?up insp|ti timed|^ti$/.test(l)) v.ti = n;
    else if (/rise|pressure increase/.test(l)) {
      const ms = u === "ms" ? n : parseFloat((/(\d+) ?ms/.exec(u) ?? [])[1] ?? "");
      if (Number.isFinite(ms)) v.riseMs = ms;
    } else if (/target va/.test(l)) v.va = n;
    else if (/volume/.test(l) && u === "mL") v.vt = n;
  }
  if (v.epapLo != null && v.epapHi == null) v.epapHi = v.epapLo;
  if (v.psLo != null && v.psHi == null) v.psHi = v.psLo;
  if (v.ipapLo == null && v.psLo != null && v.epapLo != null) {
    v.ipapLo = v.epapLo + v.psLo;
    v.ipapHi = (v.epapHi ?? v.epapLo) + (v.psHi ?? v.psLo);
  }
  if (v.ipapLo != null && v.ipapHi == null) v.ipapHi = v.ipapLo;
  return v;
}

/** Bars for the pressure envelope figure from extracted vitals. */
export function pressureBars(v: Vitals): PBar[] {
  const bars: PBar[] = [];
  if (v.epapLo != null) bars.push({ label: "EPAP", lo: v.epapLo, hi: v.epapHi ?? v.epapLo });
  if (v.psLo != null) bars.push({ label: "PS", lo: v.psLo, hi: v.psHi ?? v.psLo });
  if (v.ipapLo != null) bars.push({ label: v.psLo != null ? "Peak" : "IPAP", lo: v.ipapLo, hi: v.ipapHi ?? v.ipapLo });
  return bars;
}

export const canWave = (v: Vitals) => v.rr != null && v.rr > 0 && v.epapLo != null && v.ipapLo != null;

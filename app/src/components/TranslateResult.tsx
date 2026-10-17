import { useMemo } from "react";
import { CYCLE_DEFAULT_MSG, DATA_VERSION, SCALES } from "../engine/data";
import { roundTrip, type TranslateInput } from "../engine/translate";
import type { Badge, TranslationResult } from "../engine/types";
import type { Route } from "../lib";
import * as I from "./Icons";
import { OutOfRange } from "./OutOfRange";
import { CopyPrint, Rows } from "./ui";
import { BreathWave, Figure, PressureBars, ScaleStrip, VaLine, canWave, pressureBars, type Vitals } from "./viz";

export const BADGE_LABEL: Record<Badge, string> = {
  direct: "Direct",
  exact: "Exact",
  closest: "Closest step",
  calculated: "Calculated",
  bridged: "Bridged",
  default: "Default",
  review: "Review",
  missing: "Not entered",
  nomatch: "No match",
};

const unitText = (u: string) => (u ? ` (${u})` : "");

/** Numbers for the figures, read by field id from the translated rows. */
function vitalsFromResult(r: TranslationResult, values: Record<string, string>): Vitals & { vaRate?: number } {
  const row = (id: string) => r.rows.find((x) => x.field.id === id);
  const num = (id: string) => {
    const d = row(id)?.display;
    const n = d == null ? NaN : parseFloat(d);
    return Number.isFinite(n) ? n : undefined;
  };
  const v: Vitals & { vaRate?: number } = {};
  v.epapLo = num("epap") ?? num("epap_min");
  v.epapHi = num("epap_max") ?? v.epapLo;
  const pip = num("pip");
  const iMin = num("ipap_min");
  if (pip != null) v.ipapLo = v.ipapHi = pip;
  else if (iMin != null) {
    const absolute = row("ipap_min")?.field.pref === "absolute";
    const iMax = num("ipap_max") ?? iMin;
    if (absolute) {
      v.ipapLo = iMin;
      v.ipapHi = iMax;
    } else {
      v.psLo = iMin;
      v.psHi = iMax;
      if (v.epapLo != null) {
        v.ipapLo = v.epapLo + iMin;
        v.ipapHi = (v.epapHi ?? v.epapLo) + iMax;
      }
    }
  }
  const rr = num("rr");
  const isTargetRate = !!row("rr")?.field.note?.includes("RR + 2");
  if (rr != null) {
    v.rr = isTargetRate ? rr - 2 : rr;
    v.vaRate = isTargetRate ? rr : rr + 2;
  }
  v.ti = num("ti") ?? num("ti_backup");
  v.tiMin = num("ti_min");
  v.tiMax = num("ti_max");
  const rise = row("rise");
  v.riseMs = rise?.scale ? rise.scale.value : rise?.unit === "ms" ? num("rise") : undefined;
  v.va = num("target_va");
  const srcVt = parseFloat(values.vt ?? "");
  v.vt = Number.isFinite(srcVt) ? srcVt : num("vt");
  return v;
}

export function TranslateResult({
  result: r, input, srcModeName, backCheck = true, share, extraText = [],
}: {
  result: TranslationResult;
  input: TranslateInput;
  srcModeName: string;
  backCheck?: boolean;
  share: { route: Route; state: unknown };
  extraText?: string[];
}) {
  const { srcDev, values } = input;
  const vit = useMemo(() => vitalsFromResult(r, values), [r, values]);
  const bars = pressureBars(vit);
  const rt = useMemo(() => (backCheck ? roundTrip(input, r) : null), [backCheck, input, r]);
  const warnings = r.rows.filter((x) => x.warn);
  const entered = Object.values(values).filter((v) => v.trim()).length;

  const asText = () => {
    const lines = [
      `Ventara translation (data ${DATA_VERSION})`,
      `${srcDev} · ${srcModeName}  →  ${r.targetDevice} · ${r.targetModeName}`,
      ...extraText,
      "",
      ...r.rows.map(
        (row) =>
          `${row.field.label}${unitText(row.field.unit)}: ${row.display ?? "—"}  [${BADGE_LABEL[row.badge]}]${row.sub ? `  (${row.sub})` : ""}${row.warn ? `  ⚠ ${row.warn}` : ""}`,
      ),
    ];
    if (r.flags.length) lines.push("", "Device switches:", ...r.flags.map((f) => "• " + f));
    if (r.derivations.length) lines.push("", "Calculations:", ...r.derivations.map((d) => "• " + d));
    if (r.bridgeNotes.length || r.compatNote) lines.push("", "Bridging:", ...r.bridgeNotes.map((d) => "• " + d), ...(r.compatNote ? [r.compatNote] : []));
    if (r.cycleDefaulted) lines.push("", "⚠ " + CYCLE_DEFAULT_MSG);
    return lines.join("\n");
  };

  const needsReview = r.rows.filter((x) => ["default", "review", "missing", "nomatch"].includes(x.badge)).length;

  return (
    <div className="result">
      <div className="result-head">
        <div className="route">
          {srcDev} · {srcModeName} <I.Arrow /> {r.targetDevice}
        </div>
        <div className="result-title">{r.targetDevice}</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <span className={`mode-pill ${r.isBridge ? "bridge" : ""}`}>
            {r.isBridge ? <I.Link width={12} height={12} /> : <I.Check width={12} height={12} />}
            {r.targetModeName}
          </span>
          {needsReview > 0 && <span className="badge b-review">{needsReview} to review</span>}
          {warnings.length > 0 && <span className="badge b-bad">{warnings.length} out of range</span>}
        </div>
      </div>

      <OutOfRange items={warnings.map((x) => ({ label: x.field.label, value: x.display ?? "—", unit: x.unit || x.field.unit, warn: x.warn! }))} />

      {r.flags.length > 0 && (
        <div style={{ padding: "8px 12px 0" }}>
          <div className="notice warn">
            <I.Alert />
            <div>
              <strong>Device switches</strong>
              <ul>{r.flags.map((f) => <li key={f}>{f}</li>)}</ul>
            </div>
          </div>
        </div>
      )}

      <Rows
        rows={r.rows.map((row) => ({
          label: row.field.label,
          value: row.display ?? "—",
          unit: row.field.unit,
          badge: row.badge,
          badgeLabel: BADGE_LABEL[row.badge],
          why: row.sub ?? (row.badge === "calculated" || row.badge === "review" || row.badge === "default" ? row.formula : undefined),
          warn: row.warn,
          extra: row.scale && row.display != null && SCALES[row.scale.key] ? (
            <ScaleStrip steps={SCALES[row.scale.key]} value={row.scale.value} unit={row.scale.unit} chosen={row.display} />
          ) : undefined,
        }))}
      />

      {(canWave(vit) || bars.length > 0 || (vit.va != null && vit.vt != null && vit.vaRate != null)) && (
        <div className="viz-grid">
          {canWave(vit) && (
            <Figure title="Breath timing" note="pressure over two breaths" span={bars.length === 0}>
              <BreathWave rr={vit.rr!} ti={vit.ti} tiMin={vit.tiMin} tiMax={vit.tiMax} riseMs={vit.riseMs} epapLo={vit.epapLo!} epapHi={vit.epapHi} ipapLo={vit.ipapLo!} ipapHi={vit.ipapHi} />
            </Figure>
          )}
          {bars.length > 0 && (
            <Figure title="Pressure envelope" note="cmH₂O">
              <PressureBars bars={bars} />
            </Figure>
          )}
          {vit.va != null && vit.vt != null && vit.vaRate != null && (
            <Figure title="Target Va from tidal volume" note="(Vt − 150) × rate ÷ 1000" span>
              <VaLine vt={vit.vt} rate={vit.vaRate} va={vit.va} />
            </Figure>
          )}
        </div>
      )}

      <div className="result-foot">
        {r.derivations.length > 0 && (
          <details className="notice calc fold">
            <summary>
              <I.Calc />
              <strong>Calculations</strong>
              <span className="count">{r.derivations.length}</span>
            </summary>
            <ul>
              {r.derivations.map((d) => (
                <li key={d}><code>{d}</code></li>
              ))}
            </ul>
          </details>
        )}
        {(r.bridgeNotes.length > 0 || r.compatNote) && (
          <div className="notice calc">
            <I.Link />
            <div>
              <strong>Mode bridging</strong>
              <ul>
                {r.bridgeNotes.map((n) => <li key={n}>{n}</li>)}
                {r.compatNote && <li>{r.compatNote}</li>}
              </ul>
            </div>
          </div>
        )}
        {r.cycleDefaulted && (
          <div className="notice warn">
            <I.Alert />
            <div><strong>Cycle defaulted.</strong> {CYCLE_DEFAULT_MSG}</div>
          </div>
        )}
        {rt?.status === "ok" && (
          rt.diffs.length === 0 ? (
            <div className="notice ok">
              <I.Check />
              <span>
                <strong>Back-check OK</strong> · all {entered} settings translate back to the {srcDev} exactly.
              </span>
            </div>
          ) : (
            <div className="notice warn">
              <I.Alert />
              <div>
                <strong>Back-check</strong> · {rt.diffs.length} setting{rt.diffs.length > 1 ? "s" : ""} don't translate back to the {srcDev} exactly:
                <ul>
                  {rt.diffs.map((d) => (
                    <li key={d.field.id}>
                      {d.field.label}: {d.original} → {d.after ?? "—"}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        )}
        <CopyPrint text={asText} share={share} />
      </div>
    </div>
  );
}

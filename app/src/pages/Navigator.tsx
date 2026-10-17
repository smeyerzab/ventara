import { useEffect, useMemo, useState } from "react";
import * as I from "../components/Icons";
import { CopyPrint, Empty, NumField, Section, Toggle } from "../components/ui";
import { Gauge } from "../components/viz";
import { DEVICES_BY_CODE, EMPTY_NAV, navigate, type NavInput } from "../engine/navigator";
import { href, readShared, store } from "../lib";

/** Phil's case: normal CO₂, neuromuscular, qualifies on overnight oximetry alone → E0471. */
const EXAMPLE_NAV: NavInput = { ...EMPTY_NAV, paco2: "40", nmd: true, oximetry: true };

const describe = (n: NavInput) =>
  [n.paco2 && `PaCO₂ ${n.paco2}`, n.copd && "COPD", n.nmd && "NMD", n.thoracic && "thoracic", n.oximetry && "oximetry", n.o2Over4 && "> 4 L O₂", n.over8h && "> 8 h/day"].filter(Boolean).join(" · ");

export default function Navigator() {
  const [shared] = useState(() => readShared<NavInput>());
  const [n, setN] = useState<NavInput>(() => ({ ...EMPTY_NAV, ...(shared ?? {}) }));
  const set = <K extends keyof NavInput>(k: K) => (v: NavInput[K]) => setN((s) => ({ ...s, [k]: v }));
  const restrictive = n.nmd || n.thoracic;
  const key = JSON.stringify(n);
  const touched = key !== JSON.stringify(EMPTY_NAV);
  const r = useMemo(() => navigate(n), [n]);
  const [session, setSession] = useState<NavInput | null>(() => store.get<NavInput | null>("nv.session", null));
  useEffect(() => {
    if (touched) {
      store.set("nv.session", n);
      setSession(n);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touched, key]);
  const isSession = !!session && JSON.stringify(session) === key;

  return (
    <>
      <div className="page-head">
        <h1 className="h1">NIV Navigator</h1>
        <span className="lede">E0471 or E0466, and the cleanest path to approval.</span>
      </div>

      <div className="tx">
        <div className="tx-col tx-input">
          <Section
            step={1}
            done={n.paco2 !== ""}
            title="PaCO₂"
            right={
              <>
                {session && !isSession && (
                  <button className="btn btn-ghost last" onClick={() => setN(session)} title="Bring back the last case">
                    <I.Reset />
                    <span>
                      Last used
                      <small>{describe(session) || "empty case"}</small>
                    </span>
                  </button>
                )}
                <button className="btn btn-ghost" onClick={() => setN(EXAMPLE_NAV)} title="Phil's case: PaCO₂ 40, neuromuscular, overnight oximetry positive">
                  <I.Sliders /> Example
                </button>
                {touched && (
                  <button className="btn btn-ghost" onClick={() => setN(EMPTY_NAV)}>
                    <I.Reset /> Reset
                  </button>
                )}
              </>
            }
          >
            <div className="field-grid">
              <NumField id="nv_paco2" label="ABG PaCO₂" unit="mmHg" value={n.paco2} onChange={set("paco2")} wide />
            </div>
          </Section>

          <Section step={2} done={n.copd || restrictive} title="Comorbidities">
            <div className="toggles">
              <Toggle on={n.copd} onChange={set("copd")} title="COPD" />
              <Toggle on={n.nmd} onChange={set("nmd")} title="Neuromuscular weakness" sub="ALS, muscular dystrophy, critical illness myopathy…" />
              <Toggle on={n.thoracic} onChange={set("thoracic")} title="Thoracic cage abnormality" sub="Kyphoscoliosis, post-thoracoplasty, pleural fibrosis…" />
            </div>
          </Section>

          {restrictive && (
            <Section step={3} done={r.criteria.some((c) => c.met && /FVC|MIP|oximetry|PaCO₂ ≥ 45/.test(c.label))} title="Restrictive qualifiers — any one">
              <div className="field-grid">
                <NumField id="nv_fvc" label="FVC" unit="% pred" value={n.fvcPct} onChange={set("fvcPct")} />
                <NumField id="nv_mip" label="MIP" unit="cmH₂O" value={n.mip} onChange={set("mip")} placeholder="-60" />
                <div className="wide">
                  <Toggle on={n.oximetry} onChange={set("oximetry")} title="Overnight oximetry: SpO₂ ≤ 88% for ≥ 5 min" />
                </div>
              </div>
            </Section>
          )}

          <Section step={restrictive ? 4 : 3} done={n.osaMain || n.chartSaysSleepStudy} title="Sleep apnea">
            <div className="toggles">
              <Toggle on={n.osaMain} onChange={set("osaMain")} title="OSA is the main contributor to the hypercapnia" />
              <Toggle on={n.chartSaysSleepStudy} onChange={set("chartSaysSleepStudy")} title="Chart says the patient needs a sleep study" />
            </div>
          </Section>

          <Section step={restrictive ? 5 : 4} done={n.o2Over4 || n.over8h || n.alarms} title="Ventilator need">
            <div className="toggles">
              <Toggle on={n.o2Over4} onChange={set("o2Over4")} title="> 4 L/min O₂ bleed-in" sub="or FiO₂ ≥ 36%" />
              <Toggle on={n.over8h} onChange={set("over8h")} title="NIV needed > 8 hours a day" />
              <Toggle on={n.alarms} onChange={set("alarms")} title="Needs alarms / internal battery for life safety" />
            </div>
          </Section>
        </div>

        <div className="tx-result">
          {!touched ? (
            <Empty icon={<I.Compass />} title="The determination appears here" body="Enter the PaCO₂ and tick what applies. Comorbidities open the restrictive qualifiers." />
          ) : (
          <div className="result">
            <div className={`code-hero c-${r.code}`}>
              <div className="eyebrow">{r.policy}</div>
              <div className="code">{r.code === "none" ? <span className="nocode">No code</span> : r.code}</div>
              <div className="headline">{r.headline}</div>
              <div className="pathway">{r.pathway}</div>
              {r.fallback && <div className="fallback">Fallback: {r.fallback}</div>}
            </div>

            <div className="result-foot" style={{ borderTop: 0 }}>
              <div>
                <div className="slabel">Strategy</div>
                <ul className="strategy">{r.strategy.map((s) => <li key={s}>{s}</li>)}</ul>
              </div>

              {r.flags.map((f) => (
                <div key={f} className="notice warn">
                  <I.Alert /> <span>{f}</span>
                </div>
              ))}

              {r.fork && (
                <div className="fork">
                  {r.fork.map((f) => (
                    <div key={f.title}>
                      <div className="t">{f.title}</div>
                      <div className="d">{f.body}</div>
                    </div>
                  ))}
                </div>
              )}

              {r.criteria.length > 0 && (
                <div>
                  <div className="slabel">Criteria</div>
                  <ul className="crit">
                    {r.criteria.map((c) => (
                      <li key={c.label} className={`${c.met ? "met" : c.met === false ? "unmet" : "na"} ${c.gauge ? "has-gauge" : ""}`}>
                        <span className="ci">{c.met ? <I.Check /> : c.met === false ? "×" : "–"}</span>
                        <span className="cl">{c.label}</span>
                        {c.gauge && <Gauge {...c.gauge} met={c.met} />}
                        <span className="cd num">{c.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(r.code === "E0466" || r.code === "E0471") && (
                <div>
                  <div className="slabel">{r.code} devices</div>
                  <div className="chips">
                    {DEVICES_BY_CODE[r.code].map((d) => (
                      <a key={d} className="chip" href={href("settings")}>
                        <I.Device /> {d}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <CopyPrint
                share={{ route: "navigator", state: n }}
                text={() =>
                  [
                    `Ventara NIV Navigator — ${r.code === "none" ? r.headline : `${r.code} · ${r.headline}`}`,
                    `${r.pathway} (${r.policy})`,
                    "",
                    ...r.strategy.map((s) => "• " + s),
                    ...(r.flags.length ? ["", ...r.flags.map((f) => "⚠ " + f)] : []),
                    "",
                    "Criteria:",
                    ...r.criteria.map((c) => `${c.met ? "✓" : c.met === false ? "✗" : "–"} ${c.label}: ${c.detail}`),
                  ].join("\n")
                }
              />
            </div>
          </div>
          )}
        </div>
      </div>
    </>
  );
}

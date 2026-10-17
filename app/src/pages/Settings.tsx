import { useEffect, useMemo, useState } from "react";
import * as I from "../components/Icons";
import { OutOfRange } from "../components/OutOfRange";
import { CopyPrint, Empty, NumField, Rows, Section, Seg } from "../components/ui";
import { BreathWave, Figure, PressureBars, VaLine, canWave, pressureBars, vitalsFromLabels } from "../components/viz";
import { checkRange, kindForLabel } from "../engine/ranges";
import { BANDS, DX_LABEL, initialSettings, SETTINGS_DEVICES, toTranslatorInput, type Dx, type Sex } from "../engine/settings";
import { readShared, shareUrl, store } from "../lib";

type HUnit = "ftin" | "cm";
type WUnit = "lb" | "kg";

interface Saved {
  sex: Sex | "";
  hUnit: HUnit;
  ft: string;
  inch: string;
  cm: string;
  wUnit: WUnit;
  weight: string;
  dx: Dx | "";
  device: string;
}

/** Phil's worked case: 5'9" male (IBW 70.7 kg, reference Vt 566 mL), neuromuscular, on the Astral. */
const EXAMPLE_SESSION: Saved = { sex: "male", hUnit: "ftin", ft: "5", inch: "9", cm: "", wUnit: "lb", weight: "176", dx: "NMD", device: "ResMed Astral" };

const describe = (s: Saved) =>
  `${s.sex === "male" ? "M" : "F"} · ${s.hUnit === "cm" ? `${s.cm} cm` : `${s.ft}'${s.inch}"`} · ${s.weight} ${s.wUnit} · ${s.dx} · ${s.device.replace(" iVAPS", "")}`;

export default function Settings() {
  const [shared] = useState(() => readShared<Saved>());
  const [sex, setSex] = useState<Sex | "">(() => shared?.sex ?? "");
  const [hUnit, setHUnit] = useState<HUnit>(() => shared?.hUnit ?? store.get("st.hUnit", "ftin"));
  const [ft, setFt] = useState(() => shared?.ft ?? "");
  const [inch, setInch] = useState(() => shared?.inch ?? "");
  const [cm, setCm] = useState(() => shared?.cm ?? "");
  const [wUnit, setWUnit] = useState<WUnit>(() => shared?.wUnit ?? store.get("st.wUnit", "lb"));
  const [weight, setWeight] = useState(() => shared?.weight ?? "");
  const [dx, setDx] = useState<Dx | "">(() => shared?.dx ?? "");
  const [device, setDevice] = useState(() => shared?.device ?? store.get("st.device", ""));
  const [session, setSession] = useState<Saved | null>(() => store.get<Saved | null>("st.session", null));

  const heightIn = hUnit === "cm" ? Number(cm) / 2.54 : (Number(ft) || 0) * 12 + (Number(inch) || 0);
  const weightKg = wUnit === "lb" ? Number(weight) * 0.453592 : Number(weight);
  const haveBody = heightIn > 0 && weightKg > 0;

  const res = useMemo(
    () => (sex && haveBody && dx && device ? initialSettings({ sex, heightIn, weightKg, dx, device }) : null),
    [sex, haveBody, heightIn, weightKg, dx, device],
  );
  const bmi = haveBody ? weightKg / (heightIn * 0.0254) ** 2 : null;
  const ibw = sex && heightIn > 0 ? (sex === "female" ? 45.5 : 50) + 2.3 * (heightIn - 60) : null;
  const band = bmi != null && dx ? BANDS[dx].find((b) => b.test(bmi)) : undefined;
  const vit = useMemo(() => (res ? vitalsFromLabels(res.rows) : null), [res]);
  const bars = vit ? pressureBars(vit) : [];
  const rows = useMemo(
    () =>
      res?.rows.map((r) => {
        const kind = kindForLabel(r.label, r.unit);
        const n = parseFloat(r.value);
        const warn = kind && Number.isFinite(n) && !r.unit.startsWith("≈") ? (checkRange(kind, n) ?? undefined) : undefined;
        return { ...r, highlight: r.volume, warn };
      }) ?? [],
    [res],
  );
  const warnings = rows.filter((r) => r.warn);

  const pickH = (u: HUnit) => { setHUnit(u); store.set("st.hUnit", u); };
  const pickW = (u: WUnit) => { setWUnit(u); store.set("st.wUnit", u); };
  const pickD = (d: string) => { setDevice(d); store.set("st.device", d); };
  const state: Saved = { sex, hUnit, ft, inch, cm, wUnit, weight, dx, device };
  const stateKey = JSON.stringify(state);
  const complete = !!(res && res.band);
  useEffect(() => {
    if (complete) {
      store.set("st.session", state);
      setSession(state);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete, stateKey]);
  const load = (s: Saved) => {
    setSex(s.sex); setHUnit(s.hUnit); setFt(s.ft); setInch(s.inch); setCm(s.cm);
    setWUnit(s.wUnit); setWeight(s.weight); setDx(s.dx); setDevice(s.device);
  };
  const reset = () => load({ sex: "", hUnit, ft: "", inch: "", cm: "", wUnit, weight: "", dx: "", device: "" });
  const touched = !!(sex || ft || inch || cm || weight || dx || device);
  const isSession = !!session && JSON.stringify(session) === stateKey;

  return (
    <>
      <div className="page-head">
        <h1 className="h1">Initial Settings</h1>
        <span className="lede">IBW sets the volume, BMI and diagnosis pick the column, the device sets the names.</span>
      </div>

      <div className="tx">
        <div className="tx-col tx-input">
          <Section
            step={1}
            done={!!sex && haveBody}
            title="Patient"
            right={
              <>
                {session && !isSession && (
                  <button className="btn btn-ghost last" onClick={() => load(session)} title="Bring back the last complete case">
                    <I.Reset />
                    <span>
                      Last used
                      <small>{describe(session)}</small>
                    </span>
                  </button>
                )}
                <button className="btn btn-ghost" onClick={() => load(EXAMPLE_SESSION)} title={"Phil's worked case: 5'9\" male, 176 lb, neuromuscular " + "→" + " Astral"}>
                  <I.Sliders /> Example
                </button>
                {touched && (
                  <button className="btn btn-ghost" onClick={reset}>
                    <I.Reset /> Reset
                  </button>
                )}
              </>
            }
          >
            <div className="field-grid">
              <Seg label="Sex" value={sex} options={[["male", "Male"], ["female", "Female"]]} onChange={setSex} />
              <div className="wide">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="label">Height</span>
                  <UnitSwitch value={hUnit} options={[["ftin", "ft/in"], ["cm", "cm"]]} onChange={pickH} />
                </div>
                {hUnit === "ftin" ? (
                  <div className="field-grid">
                    <NumField id="st_ft" label="" unit="ft" value={ft} onChange={setFt} placeholder="5" />
                    <NumField id="st_in" label="" unit="in" value={inch} onChange={setInch} placeholder="9" />
                  </div>
                ) : (
                  <NumField id="st_cm" label="" unit="cm" value={cm} onChange={setCm} placeholder="175" />
                )}
              </div>
              <div className="wide">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="label">Weight</span>
                  <UnitSwitch value={wUnit} options={[["lb", "lb"], ["kg", "kg"]]} onChange={pickW} />
                </div>
                <NumField id="st_w" label="" unit={wUnit} value={weight} onChange={setWeight} />
              </div>
            </div>
          </Section>

          <Section step={2} done={!!dx} title="Diagnosis">
            <div className="targets">
              {(Object.keys(DX_LABEL) as Dx[]).map((k) => (
                <button key={k} className="target" aria-pressed={dx === k} onClick={() => setDx(k)}>
                  <span className="t">{DX_LABEL[k]}</span>
                  <span className="s">{BANDS[k].map((b) => b.label).join(" · ")}</span>
                </button>
              ))}
            </div>
          </Section>

          <Section step={3} done={!!device} title="Device & mode">
            <div className="targets">
              {Object.entries(SETTINGS_DEVICES).map(([name, d]) => (
                <button key={name} className="target" aria-pressed={device === name} onClick={() => pickD(name)}>
                  <span className="t">{name.replace(" iVAPS", "")}</span>
                  <span className="s">{d.mode}</span>
                </button>
              ))}
            </div>
          </Section>
        </div>

        <div className="tx-result">
          {(ibw != null || bmi != null) && (
            <div className="stats" style={{ marginBottom: 10 }}>
              <div>
                <div className="n">{ibw != null ? ibw.toFixed(1) : "—"}<span className="sx"> kg</span></div>
                <div className="l">Ideal body weight</div>
              </div>
              <div>
                <div className="n">{ibw != null ? Math.round(ibw * 8) : "—"}<span className="sx"> mL</span></div>
                <div className="l">8 mL/kg reference Vt</div>
              </div>
              <div>
                <div className="n">{bmi != null ? bmi.toFixed(1) : "—"}</div>
                <div className="l">BMI{band ? ` · ${band.label.replace("BMI ", "")}` : ""}</div>
              </div>
            </div>
          )}

          {dx === "OHS" && bmi != null && bmi < 30 && (
            <div className="notice bad" role="alert" style={{ marginBottom: 10 }}>
              <I.Alert />
              <div>
                <strong>No OHS column for BMI {bmi.toFixed(1)}</strong> — the OHS settings are defined for BMI 30–40 and above 40. Check the weight, or pick the diagnosis that fits.
              </div>
            </div>
          )}

          {res && res.band && vit ? (
            <div className="result">
              <div className="result-head">
                <div className="route">
                  {DX_LABEL[dx as Dx]} · {res.band.label}
                </div>
                <div className="result-title">{res.device.replace(" iVAPS", "")}</div>
                <span className="mode-pill">
                  <I.Check width={12} height={12} /> {res.mode}
                </span>
              </div>
              <OutOfRange items={warnings.map((r) => ({ label: r.label, value: r.value, unit: r.unit, warn: r.warn! }))} />
              <Rows rows={rows} />

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
                {vit.va != null && vit.rr != null && (
                  <Figure title="Target Va from reference Vt" note={`(${Math.round(res.vtRef)} − 150) × ${vit.rr + 2} ÷ 1000, rounded to 0.5`} span>
                    <VaLine vt={Math.round(res.vtRef)} rate={vit.rr + 2} va={vit.va} />
                  </Figure>
                )}
              </div>

              <div className="result-foot">
                {toTranslatorInput(res) && (
                  <a className="btn btn-primary" style={{ justifySelf: "start" }} href={shareUrl("translate", toTranslatorInput(res))}>
                    <I.Swap /> Send to Device Translator
                  </a>
                )}
                <CopyPrint
                  share={{ route: "settings", state }}
                  text={() =>
                    [
                      `Ventara initial settings — ${res.device.replace(" iVAPS", "")} ${res.mode}`,
                      `${DX_LABEL[dx as Dx]} · ${res.band!.label} · IBW ${res.ibw.toFixed(1)} kg · BMI ${res.bmi.toFixed(1)}`,
                      "",
                      ...res.rows.map((r) => `${r.label}: ${r.value} ${r.unit}`.trim()),
                    ].join("\n")
                  }
                />
              </div>
            </div>
          ) : (
            !(dx === "OHS" && bmi != null && bmi < 30) && (
              <Empty icon={<I.Sliders />} title="Settings appear here" body="Enter sex, height, weight, diagnosis and device." />
            )
          )}
        </div>
      </div>
    </>
  );
}

function UnitSwitch<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="unit-switch" role="group">
      {options.map(([v, l]) => (
        <button key={v} aria-pressed={v === value} onClick={() => onChange(v)}>
          {l}
        </button>
      ))}
    </div>
  );
}

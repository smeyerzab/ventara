import { useEffect, useMemo, useRef, useState } from "react";
import { CompareTable } from "../components/CompareTable";
import * as I from "../components/Icons";
import { SourceField } from "../components/SourceField";
import { TranslateResult } from "../components/TranslateResult";
import { Empty, NumField, Section } from "../components/ui";
import { devicesForFamily, EXTRA_FIELDS, extrasNeeded, FAMILIES, familyInfo, familyTraits, translateAcross, type Extras, type Family } from "../engine/bridge";
import { exampleValues } from "../engine/prefill";
import { checkRange } from "../engine/ranges";
import { devices, modeConfig, modesFor } from "../engine/translate";
import { readShared, store } from "../lib";

interface Saved {
  srcDev: string;
  srcMode: string;
  values: Record<string, string>;
  family: Family | "";
  tgtDev: string;
  extras: Extras;
}

const EXAMPLE_EXTRAS: Extras = { vt: "480", observedIpap: "16", observedEpap: "8" };
/** Phil's worked case: V60 S/T → VAPS-AE PS on the Astral. */
const EXAMPLE_SESSION: Saved = { srcDev: "Respironics V60", srcMode: "Pressure Support", values: {}, family: "VAPS-AE PS", tgtDev: "Resmed Astral", extras: EXAMPLE_EXTRAS };

export default function CrossMode() {
  const [shared] = useState(() => readShared<Saved>());
  const [srcDev, setSrcDev] = useState(() => shared?.srcDev ?? store.get("cm.srcDev", ""));
  const [srcMode, setSrcMode] = useState(() => shared?.srcMode ?? store.get("cm.srcMode", ""));
  const [values, setValues] = useState<Record<string, string>>(() => shared?.values ?? {});
  const [family, setFamily] = useState<Family | "">(() => shared?.family ?? store.get("cm.family", ""));
  const [tgtDev, setTgtDev] = useState(() => shared?.tgtDev ?? store.get("cm.tgtDev", ""));
  const [extras, setExtras] = useState<Extras>(() => shared?.extras ?? {});
  const [compare, setCompare] = useState(false);

  useEffect(() => store.set("cm.srcDev", srcDev), [srcDev]);
  useEffect(() => store.set("cm.srcMode", srcMode), [srcMode]);
  useEffect(() => store.set("cm.family", family), [family]);
  useEffect(() => store.set("cm.tgtDev", tgtDev), [tgtDev]);
  const lastKey = `cm.last.${srcDev}|${srcMode}`;
  const filledNow = Object.values(values).some((v) => v.trim());
  useEffect(() => {
    if (srcDev && srcMode && filledNow) store.set(lastKey, { values, extras });
  }, [lastKey, srcDev, srcMode, filledNow, values, extras]);
  const lastUsed = useMemo(
    () => (srcDev && srcMode ? store.get<{ values: Record<string, string>; extras: Extras } | null>(lastKey, null) : null),
    [lastKey, srcDev, srcMode],
  );

  const [session, setSession] = useState<Saved | null>(() => store.get<Saved | null>("cm.session", null));

  const modes = useMemo(() => (srcDev ? modesFor(srcDev) : []), [srcDev]);
  const cfg = srcDev && srcMode ? modeConfig(srcDev, srcMode) : undefined;
  const filled = cfg ? cfg.fields.filter((f) => values[f.id]?.trim()).length : 0;
  const needed = family ? extrasNeeded(srcMode, family) : [];
  const familyDevices = useMemo(() => (family ? devicesForFamily(family).filter((d) => !(d === srcDev && family === srcMode)) : []), [family, srcDev, srcMode]);
  const tgtOk = !!tgtDev && familyDevices.includes(tgtDev);

  const input = useMemo(() => ({ srcDev, srcMode, tgtDev, values }), [srcDev, srcMode, tgtDev, values]);
  const result = useMemo(() => {
    if (!cfg || !family || !tgtOk || filled === 0) return null;
    const r = translateAcross({ ...input, targetFamily: family, extras });
    return r.ok ? r : null;
  }, [cfg, family, tgtOk, filled, input, extras]);
  const all = useMemo(
    () =>
      compare && cfg && family && filled > 0
        ? familyDevices.flatMap((d) => {
            const r = translateAcross({ ...input, tgtDev: d, targetFamily: family, extras });
            return r.ok ? [{ device: d, result: r }] : [];
          })
        : [],
    [compare, cfg, family, filled, familyDevices, input, extras],
  );

  const changeDevice = (d: string) => {
    setSrcDev(d);
    setSrcMode("");
    setValues({});
  };
  const changeMode = (m: string) => {
    setSrcMode(m);
    setValues({});
  };
  const reset = () => {
    setSrcDev("");
    setSrcMode("");
    setValues({});
    setFamily("");
    setTgtDev("");
    setExtras({});
    setCompare(false);
  };

  const resultRef = useRef<HTMLDivElement>(null);
  const [resultVisible, setResultVisible] = useState(true);
  useEffect(() => {
    const el = resultRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setResultVisible(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, [result]);

  const srcFam = familyInfo(srcMode);
  const state: Saved = { srcDev, srcMode, values, family, tgtDev, extras };
  const stateKey = JSON.stringify(state);
  useEffect(() => {
    if (result) {
      store.set("cm.session", state);
      setSession(state);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, stateKey]);
  const load = (s: Saved) => {
    setSrcDev(s.srcDev);
    setSrcMode(s.srcMode);
    setValues(s.values);
    setFamily(s.family);
    setTgtDev(s.tgtDev);
    setExtras(s.extras);
  };
  const isSession = !!session && JSON.stringify(session) === stateKey;
  const loadExample = () => {
    const cfgEx = modeConfig(EXAMPLE_SESSION.srcDev, EXAMPLE_SESSION.srcMode)!;
    load({ ...EXAMPLE_SESSION, values: exampleValues(cfgEx) });
  };
  const extraWarn = (k: keyof Extras) => {
    const n = parseFloat(extras[k] ?? "");
    if (!Number.isFinite(n)) return null;
    return checkRange(k === "vt" ? "vt" : k === "observedIpap" ? "pip" : "epap", n);
  };

  return (
    <>
      <div className="page-head">
        <h1 className="h1">Cross-Mode</h1>
        <span className="lede">Change mode family, device, or both.</span>
      </div>

      <div className="tx">
        <div className="tx-col tx-input">
          <Section
            step={1}
            done={!!cfg}
            title="Current device"
            right={
              <>
                {session && !isSession && (
                  <button className="btn btn-ghost last" onClick={() => load(session)} title="Bring back the last complete translation">
                    <I.Reset />
                    <span>
                      Last used
                      <small>{session.srcDev} → {session.tgtDev} · {session.family}</small>
                    </span>
                  </button>
                )}
                <button className="btn btn-ghost" onClick={loadExample} title="V60 S/T → Astral iVAPS-AE, with Phil's example settings">
                  <I.Sliders /> Example
                </button>
                {(srcDev || filled > 0) && (
                  <button className="btn btn-ghost" onClick={reset}>
                    <I.Reset /> Reset
                  </button>
                )}
              </>
            }
          >
            <div className="field-grid">
              <div>
                <label className="label" htmlFor="cm_srcDev">Device</label>
                <select id="cm_srcDev" className="select" value={srcDev} onChange={(e) => changeDevice(e.target.value)}>
                  <option value="">Select device…</option>
                  {devices().map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="cm_srcMode">Mode</label>
                <select id="cm_srcMode" className="select" value={srcMode} disabled={!srcDev} onChange={(e) => changeMode(e.target.value)}>
                  <option value="">{srcDev ? "Select mode…" : "Select a device first"}</option>
                  {modes.map(([vk, m]) => (
                    <option key={vk} value={vk}>
                      {m.mode} — {vk}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {srcFam && (
              <div className="traits">
                {familyTraits(srcFam).map((t) => (
                  <span key={t} className="trait">{t}</span>
                ))}
              </div>
            )}
          </Section>

          {cfg && (
            <Section
              step={2}
              done={filled > 0}
              title="Current settings"
              right={
                <>
                  {filled}/{cfg.fields.length} entered
                  {lastUsed && (
                    <button
                      className="btn btn-ghost"
                      onClick={() => {
                        setValues(lastUsed.values);
                        setExtras(lastUsed.extras);
                      }}
                      title="Values last entered for this device and mode"
                    >
                      <I.Reset /> Last used
                    </button>
                  )}
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      setValues(exampleValues(cfg));
                      setExtras(EXAMPLE_EXTRAS);
                    }}
                    title="Phil's worked example (IPAP 18 / EPAP 8 / RR 14 / Ti 1.2 / Vt 480)"
                  >
                    <I.Sliders /> Example
                  </button>
                </>
              }
            >
              <div className="field-grid cols-3">
                {cfg.fields.map((f) => (
                  <SourceField key={srcDev + srcMode + f.id} f={f} value={values[f.id] ?? ""} onChange={(v) => setValues((s) => ({ ...s, [f.id]: v }))} />
                ))}
              </div>
            </Section>
          )}

          {cfg && (
            <Section step={3} done={!!family} title="Target mode family">
              <div className="targets fam">
                {FAMILIES.map((f) => {
                  const same = f.key === srcMode;
                  return (
                    <button
                      key={f.key}
                      className="target"
                      aria-pressed={family === f.key}
                      onClick={() => {
                        setFamily(f.key);
                        if (!devicesForFamily(f.key).includes(tgtDev) || (tgtDev === srcDev && f.key === srcMode)) setTgtDev("");
                      }}
                    >
                      <span className="t">
                        {f.label}
                        {same && <span className="badge b-direct">current</span>}
                      </span>
                      <span className="s">{familyTraits(f).join(" · ")}</span>
                    </button>
                  );
                })}
              </div>
              {needed.length > 0 && (
                <div className="extras">
                  <div className="slabel">Needed for this change</div>
                  <div className="field-grid cols-3">
                    {needed.map((k) => (
                      <NumField
                        key={k}
                        id={"cm_x_" + k}
                        label={EXTRA_FIELDS[k].label}
                        hint={EXTRA_FIELDS[k].hint}
                        unit={EXTRA_FIELDS[k].unit}
                        value={extras[k] ?? ""}
                        onChange={(v) => setExtras((e) => ({ ...e, [k]: v }))}
                        warn={extraWarn(k)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          {cfg && family && (
            <Section
              step={4}
              done={tgtOk}
              title="Target device"
              right={
                filled > 0 &&
                familyDevices.length > 1 && (
                  <button className="btn btn-ghost" aria-pressed={compare} onClick={() => setCompare((c) => !c)}>
                    <I.Layers /> {compare ? "Hide comparison" : "Compare all"}
                  </button>
                )
              }
            >
              <div className="targets">
                {familyDevices.map((d) => (
                  <button key={d} className="target" aria-pressed={d === tgtDev} onClick={() => setTgtDev(d)}>
                    <span className="t">{d}</span>
                    <span className="s">{modeConfig(d, family)?.mode}</span>
                  </button>
                ))}
              </div>
            </Section>
          )}
        </div>

        <div className="tx-result" ref={resultRef}>
          {result ? (
            <TranslateResult
              result={result}
              input={input}
              srcModeName={cfg!.mode}
              backCheck={false}
              share={{ route: "crossmode", state }}
              extraText={needed.filter((k) => extras[k]).map((k) => `${EXTRA_FIELDS[k].label}: ${extras[k]} ${EXTRA_FIELDS[k].unit}`)}
            />
          ) : (
            <Empty
              icon={<I.Layers />}
              title="Translated settings appear here"
              body={!cfg ? "Choose the current device and mode." : filled === 0 ? "Enter the current settings." : !family ? "Choose the target mode family." : "Choose the target device."}
            />
          )}
        </div>
      </div>

      {all.length > 0 && cfg && family && <CompareTable title={`All ${family} targets · ${srcDev} ${cfg.mode}`} columns={all} />}

      {result && !resultVisible && (
        <button className="btn btn-primary jump" onClick={() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
          View {result.targetDevice} settings <I.ArrowDown />
        </button>
      )}
    </>
  );
}

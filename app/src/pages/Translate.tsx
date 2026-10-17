import { useEffect, useMemo, useRef, useState } from "react";
import { CompareTable } from "../components/CompareTable";
import * as I from "../components/Icons";
import { SourceField } from "../components/SourceField";
import { TranslateResult } from "../components/TranslateResult";
import { Empty, Section } from "../components/ui";
import { exampleValues } from "../engine/prefill";
import { compareAll, devices, modeConfig, modesFor, targetsFor, translate } from "../engine/translate";
import { readShared, store } from "../lib";

interface Saved {
  srcDev: string;
  srcMode: string;
  tgtDev: string;
  values: Record<string, string>;
}

/** Phil's worked case: Trilogy EVO AVAPS-AE → Astral iVAPS-AE. */
const EXAMPLE_SESSION: Saved = { srcDev: "Trilogy EVO/EV300", srcMode: "VAPS-AE PS", tgtDev: "Resmed Astral", values: {} };

export default function Translate() {
  const [shared] = useState(() => readShared<Saved>());
  const [srcDev, setSrcDev] = useState(() => shared?.srcDev ?? store.get("tx.srcDev", ""));
  const [srcMode, setSrcMode] = useState(() => shared?.srcMode ?? store.get("tx.srcMode", ""));
  const [tgtDev, setTgtDev] = useState(() => shared?.tgtDev ?? store.get("tx.tgtDev", ""));
  const [values, setValues] = useState<Record<string, string>>(() => shared?.values ?? {});
  const [compare, setCompare] = useState(false);

  useEffect(() => store.set("tx.srcDev", srcDev), [srcDev]);
  useEffect(() => store.set("tx.srcMode", srcMode), [srcMode]);
  useEffect(() => store.set("tx.tgtDev", tgtDev), [tgtDev]);
  const lastKey = `tx.last.${srcDev}|${srcMode}`;
  const filledNow = Object.values(values).some((v) => v.trim());
  useEffect(() => {
    if (srcDev && srcMode && filledNow) store.set(lastKey, values);
  }, [lastKey, srcDev, srcMode, filledNow, values]);
  const lastUsed = useMemo(() => (srcDev && srcMode ? store.get<Record<string, string> | null>(lastKey, null) : null), [lastKey, srcDev, srcMode]);
  // Whole last translation (device, mode, settings, target) so it can be brought back in one tap.
  const [session, setSession] = useState<Saved | null>(() => store.get<Saved | null>("tx.session", null));

  const modes = useMemo(() => (srcDev ? modesFor(srcDev) : []), [srcDev]);
  const cfg = srcDev && srcMode ? modeConfig(srcDev, srcMode) : undefined;
  const targets = useMemo(() => (cfg ? targetsFor(srcDev, srcMode) : []), [cfg, srcDev, srcMode]);
  const target = targets.find((t) => t.device === tgtDev);

  const filled = cfg ? cfg.fields.filter((f) => values[f.id]?.trim()).length : 0;
  const input = useMemo(() => ({ srcDev, srcMode, tgtDev, values }), [srcDev, srcMode, tgtDev, values]);
  const result = useMemo(() => {
    if (!cfg || !target || filled === 0) return null;
    const r = translate(input);
    return r.ok ? r : null;
  }, [cfg, target, filled, input]);
  useEffect(() => {
    if (result) {
      store.set("tx.session", input);
      setSession(input);
    }
  }, [result, input]);
  const load = (s: Saved) => {
    setSrcDev(s.srcDev);
    setSrcMode(s.srcMode);
    setValues(s.values);
    setTgtDev(s.tgtDev);
  };
  const isSession = !!session && JSON.stringify(session) === JSON.stringify(input);
  const loadExample = () => {
    const cfgEx = modeConfig(EXAMPLE_SESSION.srcDev, EXAMPLE_SESSION.srcMode)!;
    load({ ...EXAMPLE_SESSION, values: exampleValues(cfgEx) });
  };
  const all = useMemo(() => (compare && cfg && filled > 0 ? compareAll(srcDev, srcMode, values) : []), [compare, cfg, filled, srcDev, srcMode, values]);

  const changeDevice = (d: string) => {
    setSrcDev(d);
    setSrcMode("");
    setValues({});
    if (d === tgtDev) setTgtDev("");
  };
  const changeMode = (m: string) => {
    setSrcMode(m);
    setValues({});
  };
  const reset = () => {
    setSrcDev("");
    setSrcMode("");
    setTgtDev("");
    setValues({});
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

  return (
    <>
      <div className="page-head">
        <h1 className="h1">Device Translator</h1>
        <span className="lede">Same mode family, different ventilator.</span>
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
                      <small>{session.srcDev} → {session.tgtDev}</small>
                    </span>
                  </button>
                )}
                <button className="btn btn-ghost" onClick={loadExample} title="Trilogy EVO AVAPS-AE → Astral, with Phil's example settings">
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
                <label className="label" htmlFor="srcDev">Device</label>
                <select id="srcDev" className="select" value={srcDev} onChange={(e) => changeDevice(e.target.value)}>
                  <option value="">Select device…</option>
                  {devices().map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="srcMode">Mode</label>
                <select id="srcMode" className="select" value={srcMode} disabled={!srcDev} onChange={(e) => changeMode(e.target.value)}>
                  <option value="">{srcDev ? "Select mode…" : "Select a device first"}</option>
                  {modes.map(([vk, m]) => (
                    <option key={vk} value={vk}>
                      {m.mode} — {vk}
                    </option>
                  ))}
                </select>
              </div>
            </div>
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
                    <button className="btn btn-ghost" onClick={() => setValues(lastUsed)} title="Values last entered for this device and mode">
                      <I.Reset /> Last used
                    </button>
                  )}
                  <button className="btn btn-ghost" onClick={() => setValues(exampleValues(cfg))} title="Phil's worked example (IPAP 18 / EPAP 8 / RR 14 / Ti 1.2 / Vt 480)">
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
            <Section
              step={3}
              done={!!target}
              title="Target device"
              right={
                filled > 0 &&
                targets.length > 1 && (
                  <button className="btn btn-ghost" aria-pressed={compare} onClick={() => setCompare((c) => !c)}>
                    <I.Layers /> {compare ? "Hide comparison" : "Compare all"}
                  </button>
                )
              }
            >
              {targets.length === 0 ? (
                <p style={{ color: "var(--ink-3)" }}>No compatible target devices for this mode.</p>
              ) : (
                <div className="targets">
                  {targets.map((t) => (
                    <button key={t.device} className="target" aria-pressed={t.device === tgtDev} onClick={() => setTgtDev(t.device)}>
                      <span className="t">
                        {t.device}
                        {t.compat.match === "bridge" && <span className="badge b-bridged">Bridged</span>}
                      </span>
                      <span className="s">{t.modeName}</span>
                    </button>
                  ))}
                </div>
              )}
            </Section>
          )}
        </div>

        <div className="tx-result" ref={resultRef}>
          {result ? (
            <TranslateResult result={result} input={input} srcModeName={cfg!.mode} share={{ route: "translate", state: input }} />
          ) : (
            <Empty
              icon={<I.Swap />}
              title="Translated settings appear here"
              body={!cfg ? "Choose the current device and mode." : filled === 0 ? "Enter the current settings." : "Choose the target device."}
            />
          )}
        </div>
      </div>

      {all.length > 0 && cfg && (
        <CompareTable title={`All targets · ${srcDev} ${cfg.mode}`} columns={all.map((a) => ({ device: a.target.device, result: a.result }))} />
      )}

      {result && !resultVisible && (
        <button className="btn btn-primary jump" onClick={() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
          View {result.targetDevice} settings <I.ArrowDown />
        </button>
      )}
    </>
  );
}

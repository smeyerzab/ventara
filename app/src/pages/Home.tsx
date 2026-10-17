import * as I from "../components/Icons";
import { ALL_DEVICES } from "../engine/data";
import { href } from "../lib";

const TOOLS = [
  { route: "translate" as const, icon: I.Swap, title: "Device Translator", desc: "Same mode, different ventilator. Settings carried over in each device's own names, scales and units.", kv: `${ALL_DEVICES.length} devices · 6 mode families` },
  { route: "crossmode" as const, icon: I.Layers, title: "Cross-Mode", desc: "Change mode family, device, or both — fixed bilevel to volume-targeted, fixed to auto-EPAP, time- to flow-cycled — with every bridge explained.", kv: "6 families · 8 devices" },
  { route: "settings" as const, icon: I.Sliders, title: "Initial Settings", desc: "Sex, height, weight and diagnosis to IBW, target volume and a full starting prescription per device.", kv: "7 device modes · 3 diagnoses" },
  { route: "navigator" as const, icon: I.Compass, title: "NIV Navigator", desc: "E0471 or E0466: PaCO₂, comorbidities, qualifiers and ventilator need, with the strategy and criteria trail.", kv: "NCD 240.9 · LCD L33800" },
];

export default function Home() {
  return (
    <>
      <section className="band">
        <div>
          <div className="eyebrow">Home mechanical ventilation</div>
          <h1>Clinical tools for ventilator care at home.</h1>
          <div className="rule" />
          <p>Settings, translations, starting prescriptions and E0471/E0466 navigation, built on the most common home devices so optimal care can be given.</p>
        </div>
        <div className="stats">
          <div><div className="n">{TOOLS.length}</div><div className="l">tools</div></div>
          <div><div className="n">{ALL_DEVICES.length}</div><div className="l">ventilators</div></div>
          <div><div className="n">6</div><div className="l">mode families</div></div>
        </div>
      </section>

      <h2 className="h2">Tools</h2>
      <div className="tiles">
        {TOOLS.map((t) => (
          <a key={t.route} className="tile" href={href(t.route)}>
            <span className="t">{t.title}</span>
            <t.icon />
            <span className="d">{t.desc}</span>
            <span className="kv">{t.kv}</span>
          </a>
        ))}
      </div>

      <div className="legend-strip">
        <span>How values are marked:</span>
        <span><span className="badge b-direct">Direct</span>carried 1:1</span>
        <span><span className="badge b-calculated">Calculated</span>from a formula</span>
        <span><span className="badge b-closest">Closest step</span>nearest value on the device's scale</span>
        <span><span className="badge b-review">Default / Review</span>no source equivalent</span>
      </div>
    </>
  );
}

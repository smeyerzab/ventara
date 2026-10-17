import { checkRange, kindForField } from "../engine/ranges";
import { fieldOptions } from "../engine/translate";
import type { Field } from "../engine/types";
import * as I from "./Icons";

/** One source-setting input for a translator field: number, ordinal step, or verbal option. */
export function SourceField({ f, value, onChange }: { f: Field; value: string; onChange: (v: string) => void }) {
  const id = "f_" + f.id;
  const label = (
    <label className="label" htmlFor={id} title={f.label}>
      {f.label}
      {f.note && <span className="hint"> · {f.note}</span>}
    </label>
  );
  if (f.t !== "number") {
    return (
      <div>
        {label}
        <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {fieldOptions(f).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>
    );
  }
  const kind = kindForField(f.id, f.unit);
  const n = parseFloat(value);
  const warn = kind && Number.isFinite(n) ? checkRange(kind, n) : null;
  return (
    <div>
      {label}
      <div className="input-wrap">
        <input
          id={id}
          className={`input num ${warn ? "oor" : ""}`}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="—"
          aria-invalid={!!warn}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(",", ".").replace(/[^0-9.]/g, ""))}
        />
        {f.unit && <span className="suffix">{f.unit}</span>}
      </div>
      {warn && (
        <div className="field-warn">
          <I.Alert /> {warn}
        </div>
      )}
    </div>
  );
}

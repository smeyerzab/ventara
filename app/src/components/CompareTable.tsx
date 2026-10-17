import { CANON } from "../engine/canon";
import type { TranslationResult } from "../engine/types";

export interface CompareColumn {
  device: string;
  result: TranslationResult;
}

/** One source → many targets, one column per device, rows in canonical order. */
export function CompareTable({ title, columns }: { title: string; columns: CompareColumn[] }) {
  const ids = CANON.filter(([id]) => columns.some((c) => c.result.rows.some((r) => r.field.id === id)));
  const anyFlags = columns.some((c) => c.result.flags.length);
  return (
    <section className="panel compare">
      <div className="panel-h">{title}</div>
      <div className="table-wrap">
        <table className="cmp">
          <thead>
            <tr>
              <th>Setting</th>
              {columns.map((c) => (
                <th key={c.device}>
                  {c.device}
                  <small>{c.result.targetModeName}</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ids.map(([id, label]) => (
              <tr key={id}>
                <th>{label}</th>
                {columns.map((c) => {
                  const row = c.result.rows.find((r) => r.field.id === id);
                  if (!row) return <td key={c.device} className="c-none"><span className="dash">·</span></td>;
                  return (
                    <td
                      key={c.device}
                      className={`c-${row.badge} ${row.warn ? "c-oor" : ""}`}
                      title={`${row.field.label}${row.sub ? " · " + row.sub : ""}${row.formula ? " · " + row.formula : ""}${row.warn ? " · " + row.warn : ""}`}
                    >
                      {row.display ?? "—"}
                      <small>{row.unit || row.field.unit}</small>
                    </td>
                  );
                })}
              </tr>
            ))}
            {anyFlags && (
              <tr>
                <th>Switches to check</th>
                {columns.map((c) => (
                  <td key={c.device} className="c-none flags">
                    {c.result.flags.length ? c.result.flags.map((f) => f.replace(/ on the .*?\.$/, "").replace(/\.$/, "")).join(" · ") : "—"}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="legend" style={{ padding: "8px 12px", borderTop: "1px solid var(--line)" }}>
        <span className="badge b-direct">Direct</span>
        <span className="badge b-calculated">Calculated / bridged</span>
        <span className="badge b-closest">Closest step</span>
        <span className="badge b-review">Default / review / missing</span>
        <span className="badge b-bad">Out of range</span>
      </div>
    </section>
  );
}

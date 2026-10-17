import * as I from "./Icons";

export function OutOfRange({ items }: { items: { label: string; value: string; unit: string; warn: string }[] }) {
  if (!items.length) return null;
  return (
    <div style={{ padding: "8px 12px 0" }}>
      <div className="notice bad" role="alert">
        <I.Alert />
        <div>
          <strong>
            {items.length} value{items.length > 1 ? "s" : ""} outside the settable range
          </strong>
          <ul>
            {items.map((x) => (
              <li key={x.label}>
                {x.label}: <strong>{x.value}</strong> {x.unit} — {x.warn.replace("Outside settable range ", "allowed ")}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

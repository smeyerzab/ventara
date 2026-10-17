import QRCode from "qrcode";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { shareUrl, type Route } from "../lib";
import * as I from "./Icons";

export function NumField({
  id, label, unit, value, onChange, hint, wide, placeholder = "—", warn,
}: {
  id: string; label: string; unit?: string; value: string; onChange: (v: string) => void;
  hint?: string; wide?: boolean; placeholder?: string; warn?: string | null;
}) {
  return (
    <div className={wide ? "wide" : undefined}>
      {label && (
        <label className="label" htmlFor={id}>
          {label}
          {hint && <span className="unit"> · {hint}</span>}
        </label>
      )}
      <div className="input-wrap">
        <input
          id={id}
          className={`input num ${warn ? "oor" : ""}`}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder={placeholder}
          aria-label={label || unit}
          aria-invalid={!!warn}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(",", ".").replace(/[^0-9.\-]/g, ""))}
        />
        {unit && <span className="suffix">{unit}</span>}
      </div>
      {warn && (
        <div className="field-warn">
          <I.Alert /> {warn}
        </div>
      )}
    </div>
  );
}

export function Seg<T extends string>({
  label, value, options, onChange, wide = true,
}: {
  label?: string; value: T | ""; options: [T, string][]; onChange: (v: T) => void; wide?: boolean;
}) {
  return (
    <div className={wide ? "wide" : undefined}>
      {label && <span className="label">{label}</span>}
      <div className="seg" role="group" aria-label={label}>
        {options.map(([v, l]) => (
          <button key={v} aria-pressed={value === v} onClick={() => onChange(v)}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Toggle({ on, onChange, title, sub }: { on: boolean; onChange: (v: boolean) => void; title: string; sub?: string }) {
  return (
    <button className="toggle" aria-pressed={on} onClick={() => onChange(!on)}>
      <span className="box">{on && <I.Check />}</span>
      <span>
        {title}
        {sub && <small>{sub}</small>}
      </span>
    </button>
  );
}

export function Section({ step, done, title, right, children }: { step: number; done?: boolean; title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <section className="panel">
      <div className="panel-h">
        <span className={`pn ${done ? "done" : ""}`}>{step}</span>
        {title}
        {right && <span className="right">{right}</span>}
      </div>
      <div className="panel-b">{children}</div>
    </section>
  );
}

export function Empty({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="panel">
      <div className="empty-state">
        {icon}
        <div className="t">{title}</div>
        <div>{body}</div>
      </div>
    </div>
  );
}

/* ── Copy / print / share ────────────────────────────────────────────────── */

function QR({ text }: { text: string }) {
  const path = useMemo(() => {
    const m = QRCode.create(text, { errorCorrectionLevel: "M" }).modules;
    let d = "";
    for (let r = 0; r < m.size; r++) for (let c = 0; c < m.size; c++) if (m.get(r, c)) d += `M${c},${r}h1v1h-1z`;
    return { d, size: m.size };
  }, [text]);
  return (
    <svg className="qr" viewBox={`0 0 ${path.size} ${path.size}`} width={300} height={300} shapeRendering="crispEdges" role="img" aria-label="QR code for this result">
      <rect width={path.size} height={path.size} fill="#fff" />
      <path d={path.d} fill="#000" />
    </svg>
  );
}

export function CopyPrint({ text, share }: { text: () => string; share?: { route: Route; state: unknown } }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const url = share ? shareUrl(share.route, share.state) : "";
  useEffect(() => setOpen(false), [url]);

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };
  const doShare = async () => {
    const touch = typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;
    if (navigator.share && touch) {
      try {
        await navigator.share({ title: "Ventara", url });
        return;
      } catch {
        /* cancelled or unsupported — fall through to the QR popover */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
    setOpen((o) => !o);
  };

  return (
    <div className="actions">
      <button className="btn" onClick={copyText}>
        {copied ? <I.Check /> : <I.Copy />} {copied ? "Copied" : "Copy to clipboard"}
      </button>
      <button className="btn" onClick={() => window.print()}>
        <I.Printer /> Print / PDF
      </button>
      {share && (
        <div className="share-wrap">
          <button className="btn" onClick={doShare} aria-expanded={open}>
            <I.Link /> {linkCopied ? "Link copied" : "Share"}
          </button>
          {open && (
            <div className="scrim" onClick={() => setOpen(false)}>
            <div className="share-pop" role="dialog" aria-label="Share this result" onClick={(e) => e.stopPropagation()}>
              <div className="t">Scan to open on a phone</div>
              <QR text={url} />
              <input
                className="input u"
                readOnly
                value={url}
                onFocus={(e) => e.currentTarget.select()}
                onClick={(e) => e.currentTarget.select()}
                aria-label="Share link"
              />
              <div className="actions">
                <button
                  className="btn"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(url);
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 1800);
                    } catch {
                      /* clipboard blocked */
                    }
                  }}
                >
                  {linkCopied ? <I.Check /> : <I.Link />} {linkCopied ? "Copied" : "Copy link"}
                </button>
                <button className="btn btn-ghost" onClick={() => setOpen(false)}>
                  Close
                </button>
              </div>
            </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Result rows ─────────────────────────────────────────────────────────── */

export interface DisplayRow {
  label: string;
  value: string;
  unit: string;
  badge?: string;
  badgeLabel?: string;
  why?: string;
  warn?: string;
  extra?: ReactNode;
  highlight?: boolean;
}

export function Rows({ rows }: { rows: DisplayRow[] }) {
  return (
    <ul className="rows">
      {rows.map((r, i) => (
        <li key={r.label + i} className={`rowi ${r.highlight ? "hl" : ""} ${r.warn ? "oor" : ""}`}>
          <div className="rowc">
            <div className="rk">
              {r.label}
              {r.unit && <span className="u"> · {r.unit}</span>}
            </div>
            <div className="rv">
              {r.warn && <span className="badge b-bad">Out of range</span>}
              {r.badge && <span className={`badge b-${r.badge}`}>{r.badgeLabel ?? r.badge}</span>}
              <span className={`val ${r.value === "—" ? "na" : ""}`}>{r.value}</span>
            </div>
            {r.why && (
              <div className="rwhy">
                <I.Info />
                <span className="num">{r.why}</span>
              </div>
            )}
            {r.warn && (
              <div className="rwhy bad">
                <I.Alert />
                <span>{r.warn}</span>
              </div>
            )}
            {r.extra && <div className="rextra">{r.extra}</div>}
          </div>
        </li>
      ))}
    </ul>
  );
}

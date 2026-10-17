/*
 * NIV Navigator: E0471 (RAD with backup rate) vs E0466 (home ventilator).
 * Branching per 2.txt (Phil's navigation logic):
 *  PaCO₂ trunk → comorbidity triage → OSA-predominance check → restrictive qualifier
 *  (any one of four) → universal vent-pushers (>4 L O₂, NIV >8 h/day) → result.
 *  COPD follows NCD 240.9; everything else follows LCD L33800.
 */

export interface NavInput {
  paco2: string; // mmHg
  copd: boolean;
  nmd: boolean;
  thoracic: boolean;
  osaMain: boolean; // OSA is the main contributor to hypercapnia
  chartSaysSleepStudy: boolean;
  fvcPct: string; // % predicted
  mip: string; // cmH2O (negative)
  oximetry: boolean; // overnight SpO2 ≤ 88% for ≥ 5 min
  o2Over4: boolean; // > 4 L/min bleed-in (or FiO2 ≥ 36%)
  over8h: boolean; // NIV > 8 h/day
  alarms: boolean; // needs alarms / internal battery for life safety
}

export const EMPTY_NAV: NavInput = {
  paco2: "", copd: false, nmd: false, thoracic: false, osaMain: false, chartSaysSleepStudy: false,
  fvcPct: "", mip: "", oximetry: false, o2Over4: false, over8h: false, alarms: false,
};

export type Code = "E0466" | "E0471" | "E0470" | "none";

export interface Gauge {
  value: number | null;
  min: number;
  max: number;
  threshold: number;
  qualifies: "above" | "below";
}

export interface Criterion {
  label: string;
  detail: string;
  met: boolean | null; // null = not entered
  gauge?: Gauge;
}

export interface NavResult {
  code: Code;
  headline: string;
  pathway: string;
  policy: string;
  strategy: string[];
  criteria: Criterion[];
  flags: string[];
  fork?: { title: string; body: string }[];
  fallback?: Code;
}

const num = (s: string) => {
  const n = Number(s.trim());
  return s.trim() === "" || !Number.isFinite(n) ? null : n;
};

export function navigate(i: NavInput): NavResult {
  const paco2 = num(i.paco2);
  const fvc = num(i.fvcPct);
  const mip = num(i.mip);
  const restrictive = i.nmd || i.thoracic;
  const pushers: string[] = [];
  if (i.o2Over4) pushers.push("> 4 L/min O₂ bleed-in");
  if (i.over8h) pushers.push("NIV > 8 h/day");
  if (i.alarms) pushers.push("alarms / internal battery needed for life safety");

  const flags: string[] = [];
  const criteria: Criterion[] = [];

  // Restrictive qualifier: any one of four
  const rq: Criterion[] = [
    {
      label: "PaCO₂ ≥ 45 mmHg", detail: paco2 == null ? "not entered" : `${paco2} mmHg`, met: paco2 == null ? null : paco2 >= 45,
      gauge: { value: paco2, min: 30, max: 80, threshold: 45, qualifies: "above" },
    },
    {
      label: "FVC < 50% predicted", detail: fvc == null ? "not entered" : `${fvc}%`, met: fvc == null ? null : fvc < 50,
      gauge: { value: fvc, min: 0, max: 100, threshold: 50, qualifies: "below" },
    },
    {
      label: "MIP weaker than −60 cmH₂O", detail: mip == null ? "not entered" : `${mip} cmH₂O`, met: mip == null ? null : Math.abs(mip) < 60,
      gauge: { value: mip == null ? null : Math.abs(mip), min: 0, max: 120, threshold: 60, qualifies: "below" },
    },
    { label: "Overnight oximetry SpO₂ ≤ 88% for ≥ 5 min", detail: i.oximetry ? "documented" : "not documented", met: i.oximetry || null },
  ];
  const rqMet = rq.filter((c) => c.met);

  // COPD gate (NCD 240.9)
  const copdCo2 = paco2 != null && paco2 >= 52;
  const copdQual = i.copd && copdCo2 && !i.osaMain;

  // Documentation trap
  if (i.chartSaysSleepStudy && !i.osaMain && (restrictive || i.copd))
    flags.push(
      "Chart says a sleep study is needed, but OSA is not the main driver — this pathway doesn't require one. Remove or clarify that language to avoid a denial or delay.",
    );
  if (i.osaMain)
    flags.push("OSA is the main contributor to the hypercapnia — address OSA first (CPAP / PSG pathway) before RAD or ventilator qualification.");

  if (i.copd) {
    criteria.push({
      label: "COPD: PaCO₂ ≥ 52 mmHg (awake, on prescribed FiO₂)", detail: paco2 == null ? "not entered" : `${paco2} mmHg`, met: paco2 == null ? null : copdCo2,
      gauge: { value: paco2, min: 30, max: 80, threshold: 52, qualifies: "above" },
    });
    criteria.push({ label: "COPD: OSA not the predominant cause", detail: i.osaMain ? "OSA predominant" : "confirmed", met: !i.osaMain });
  }
  if (restrictive) criteria.push(...rq);
  for (const p of [
    { on: i.o2Over4, label: "> 4 L/min O₂ bleed-in (or FiO₂ ≥ 36%)" },
    { on: i.over8h, label: "NIV needed > 8 h/day" },
    { on: i.alarms, label: "Alarms / internal battery needed for life safety" },
  ])
    criteria.push({ label: p.label, detail: p.on ? "yes" : "no", met: p.on });

  const restrictiveQual = restrictive && rqMet.length > 0;

  /* ── Ventilator pushers ─────────────────────────────────────────────── */
  if (pushers.length) {
    if (copdQual)
      return {
        code: "E0466", headline: "Home ventilator (E0466)", pathway: "COPD — home mechanical ventilation",
        policy: "NCD 240.9", criteria, flags,
        strategy: [
          `PaCO₂ ${paco2} mmHg meets the COPD threshold and OSA is not predominant.`,
          `HMV characteristic present: ${pushers.join(", ")}. NCD 240.9 codifies this as E0466 eligibility for COPD.`,
          "Document the HMV characteristic explicitly in the order and notes.",
        ],
        fallback: "E0471",
      };
    if (restrictiveQual)
      return {
        code: "E0466", headline: "Home ventilator (E0466)", pathway: `${restrictiveName(i)} — device-capability argument`,
        policy: "LCD L33800 / ventilator policy (MAC discretion)", criteria, flags,
        strategy: [
          `Lead with the device-capability argument: ${pushers.join(", ")}.`,
          `E0471 is already secured as the floor — qualified via ${rqMet.map((c) => c.label).join(", ")}.`,
          "Non-COPD ventilator coverage is at MAC discretion; if the vent is contested, fall back to E0471.",
        ],
        fallback: "E0471",
      };
    return {
      code: "E0466", headline: "Home ventilator (E0466)", pathway: i.copd ? "COPD — below NCD threshold" : "Hypoventilation / no restrictive qualifier",
      policy: "Ventilator policy (MAC discretion)", criteria, flags,
      strategy: [
        `Ventilator need is driven by ${pushers.join(", ")}.`,
        i.copd && !copdCo2
          ? "PaCO₂ does not meet the COPD threshold of 52 mmHg — the vent rests on the device-capability argument."
          : "No RAD qualifier is available, so the ventilator is the realistic route — coverage is at MAC discretion.",
      ],
      fork: hardCornerFork(),
    };
  }

  /* ── RAD paths ──────────────────────────────────────────────────────── */
  if (restrictiveQual)
    return {
      code: "E0471", headline: "RAD with backup rate (E0471)", pathway: `${restrictiveName(i)} — restrictive pathway`,
      policy: "LCD L33800", criteria, flags,
      strategy: [
        `Qualifies via ${rqMet.map((c) => c.label).join(", ")} — any one criterion is enough.`,
        paco2 != null && paco2 < 45 ? "PaCO₂ is below 45, but that doesn't block the restrictive pathway." : "Document the qualifying test result in the order.",
        "If NIV need grows past 8 h/day or O₂ exceeds 4 L/min, reassess for E0466.",
      ],
    };

  if (copdQual)
    return {
      code: "E0471", headline: "RAD with backup rate (E0471)", pathway: "COPD — RAD",
      policy: "NCD 240.9", criteria, flags,
      strategy: [
        `PaCO₂ ${paco2} mmHg ≥ 52 and OSA is not predominant.`,
        "Target high-intensity NIV: IPAP ≥ 15 cmH₂O and backup rate ≥ 14 by month 6.",
        "E0470 (no backup rate) only if high-intensity NIV is not tolerated.",
      ],
    };

  if (restrictive)
    return {
      code: "none", headline: "Not yet qualified", pathway: `${restrictiveName(i)} — restrictive pathway`,
      policy: "LCD L33800", criteria, flags,
      strategy: [
        "Obtain any one of: ABG (PaCO₂ ≥ 45), PFT (FVC < 50%), MIP (weaker than −60), or overnight oximetry (≤ 88% for ≥ 5 min).",
        "Overnight oximetry is often the fastest criterion to obtain.",
      ],
    };

  if (i.copd)
    return {
      code: "none", headline: "Not yet qualified", pathway: "COPD",
      policy: "NCD 240.9", criteria, flags,
      strategy: [
        paco2 == null ? "Enter PaCO₂ — the COPD pathway requires ≥ 52 mmHg." : `PaCO₂ ${paco2} mmHg is below the COPD threshold of 52 mmHg.`,
        "If O₂ need exceeds 4 L/min or NIV is needed > 8 h/day, the ventilator pathway opens.",
      ],
    };

  return {
    code: "none", headline: "Hard to qualify for a RAD", pathway: "Hypoventilation / no qualifying comorbidity",
    policy: "LCD L33800", criteria, flags,
    strategy: [
      "Without COPD, neuromuscular weakness, or a thoracic cage abnormality, RAD qualification needs the sleep-study route.",
      "Check for anything that counts as thoracic cage or neuromuscular (kyphoscoliosis, pleural fibrosis, critical illness myopathy).",
    ],
    fork: hardCornerFork(),
  };
}

function restrictiveName(i: NavInput) {
  return i.nmd && i.thoracic ? "Neuromuscular + thoracic" : i.nmd ? "Neuromuscular weakness" : "Thoracic cage abnormality";
}

function hardCornerFork() {
  return [
    {
      title: "RAD route (E0470 → E0471)",
      body: "E0470 trial in use, then PSG/HST showing the qualifying pattern unlocks E0471. Slow, and many hypoventilation patients stall here.",
    },
    {
      title: "Ventilator route (E0466)",
      body: "Often reaches therapy faster when there is a device-capability argument (> 4 L O₂, > 8 h/day, alarms/battery). Coverage is at MAC discretion.",
    },
  ];
}

export const DEVICES_BY_CODE: Record<"E0466" | "E0471", string[]> = {
  E0466: ["ResMed Astral", "Philips Trilogy EVO / EV300", "Breas Vivo 45 LS", "Löwenstein Luisa", "React Health VPro"],
  E0471: ["ResMed AirCurve 10 ST-A"],
};

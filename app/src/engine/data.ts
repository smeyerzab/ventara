// AUTO-EXTRACTED from source/v13-translator.html — device/mode data for the same-mode translator.
// Do not hand-edit casually: every value here is clinical reference data.
import type { DeviceModes, Compat, Scales } from "./types";

export const DATA_VERSION = "v13 · 2026.10";
export const ALL_DEVICES = [
  "Resmed Aircurve 10 ST (A)",
  "Resmed Astral",
  "Respironics V60",
  "Trilogy 100",
  "Trilogy EVO/EV300",
  "Breas Vivo 45LS",
  "Lowenstein Luisa",
  "React Health VPro"
] as const;
export const DEV_MODES: DeviceModes = {
  "Resmed Aircurve 10 ST (A)": {
    "Pressure Support": {
      "mode": "S/T",
      "fields": [
        {
          "id": "pip",
          "label": "IPAP",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "epap",
          "label": "EPAP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti_min",
          "label": "Ti min",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_max",
          "label": "Ti max",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "ms",
          "t": "number",
          "pref": "ms"
        },
        {
          "id": "trigger",
          "label": "Trigger",
          "unit": "",
          "t": "verbal",
          "opts": [
            "very low",
            "low",
            "med",
            "high",
            "very high"
          ]
        },
        {
          "id": "cycle",
          "label": "Cycle",
          "unit": "",
          "t": "verbal",
          "opts": [
            "very low",
            "low",
            "med",
            "high",
            "very high"
          ]
        }
      ]
    },
    "PAC": {
      "mode": "PAC",
      "fields": [
        {
          "id": "pip",
          "label": "IPAP",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "epap",
          "label": "EPAP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti",
          "label": "Inspiratory Time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "ms",
          "t": "number",
          "pref": "ms"
        },
        {
          "id": "trigger",
          "label": "Trigger",
          "unit": "",
          "t": "verbal",
          "opts": [
            "very low",
            "low",
            "med",
            "high",
            "very high"
          ]
        }
      ]
    },
    "VAPS-PS": {
      "mode": "iVAPS",
      "fields": [
        {
          "id": "target_va",
          "label": "Target Va",
          "unit": "L/min",
          "t": "number"
        },
        {
          "id": "ipap_min",
          "label": "PS min (above EPAP)",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "above_epap"
        },
        {
          "id": "ipap_max",
          "label": "PS max (above EPAP)",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "above_epap"
        },
        {
          "id": "epap",
          "label": "EPAP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Target Rate",
          "unit": "bpm",
          "t": "number",
          "note": "= patient RR + 2"
        },
        {
          "id": "ti_min",
          "label": "Ti min",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_max",
          "label": "Ti max",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "ms",
          "t": "number",
          "pref": "ms"
        },
        {
          "id": "trigger",
          "label": "Trigger",
          "unit": "",
          "t": "verbal",
          "opts": [
            "very low",
            "low",
            "med",
            "high",
            "very high"
          ]
        },
        {
          "id": "cycle",
          "label": "Cycle",
          "unit": "",
          "t": "verbal",
          "opts": [
            "very low",
            "low",
            "med",
            "high",
            "very high"
          ]
        }
      ]
    }
  },
  "Resmed Astral": {
    "VAPS-PS": {
      "mode": "iVAPS / PS with Safety Volume",
      "fields": [
        {
          "id": "target_va",
          "label": "Target Va",
          "unit": "L/min",
          "t": "number"
        },
        {
          "id": "ipap_min",
          "label": "PS min (above EPAP)",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "above_epap"
        },
        {
          "id": "ipap_max",
          "label": "PS max (above EPAP)",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "above_epap"
        },
        {
          "id": "epap",
          "label": "PEEP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Target Rate",
          "unit": "bpm",
          "t": "number",
          "note": "= patient RR + 2"
        },
        {
          "id": "ti_min",
          "label": "Ti min",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_max",
          "label": "Ti max",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "ms",
          "t": "number",
          "pref": "ms"
        },
        {
          "id": "trigger",
          "label": "Trigger",
          "unit": "L/min",
          "t": "number",
          "pref": "lmin"
        },
        {
          "id": "cycle",
          "label": "Cycle",
          "unit": "%",
          "t": "number",
          "pref": "pct"
        }
      ]
    },
    "VAPS-PC": {
      "mode": "PAC with Safety Volume",
      "fields": [
        {
          "id": "vt",
          "label": "Safety Tidal Volume",
          "unit": "mL",
          "t": "number"
        },
        {
          "id": "ipap_min",
          "label": "PC (above EPAP)",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "above_epap"
        },
        {
          "id": "ipap_max",
          "label": "PC max (above EPAP)",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "above_epap"
        },
        {
          "id": "epap",
          "label": "PEEP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Safety Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti",
          "label": "Inspiratory Time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "ms",
          "t": "number",
          "pref": "ms"
        },
        {
          "id": "trigger",
          "label": "Trigger",
          "unit": "L/min",
          "t": "number",
          "pref": "lmin"
        }
      ]
    },
    "VAPS-AE PS": {
      "mode": "iVAPS-AE",
      "fields": [
        {
          "id": "target_va",
          "label": "Target Va",
          "unit": "L/min",
          "t": "number"
        },
        {
          "id": "ipap_min",
          "label": "PS min",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "ae_ps"
        },
        {
          "id": "ipap_max",
          "label": "PS max",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "ae_ps"
        },
        {
          "id": "epap_min",
          "label": "EPAP min",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "epap_max",
          "label": "EPAP max",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Target Rate",
          "unit": "bpm",
          "t": "number",
          "note": "= patient RR + 2"
        },
        {
          "id": "ti_min",
          "label": "Ti min",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_max",
          "label": "Ti max",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "ms",
          "t": "number",
          "pref": "ms"
        },
        {
          "id": "trigger",
          "label": "Trigger",
          "unit": "L/min",
          "t": "number",
          "pref": "lmin"
        },
        {
          "id": "cycle",
          "label": "Cycle",
          "unit": "%",
          "t": "number",
          "pref": "pct"
        }
      ]
    }
  },
  "Respironics V60": {
    "Pressure Support": {
      "mode": "S/T",
      "fields": [
        {
          "id": "pip",
          "label": "IPAP",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "epap",
          "label": "EPAP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti_backup",
          "label": "Inspiratory Time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "1–5",
          "t": "ordinal",
          "key": "V60_rise"
        },
        {
          "id": "trigger",
          "label": "Trigger",
          "unit": "1–7",
          "t": "ordinal",
          "key": "V60_trigger"
        },
        {
          "id": "cycle",
          "label": "E-Cycle",
          "unit": "",
          "t": "verbal",
          "opts": [
            "low",
            "med",
            "high"
          ]
        }
      ]
    },
    "PAC": {
      "mode": "PCV",
      "fields": [
        {
          "id": "pip",
          "label": "IPAP",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "epap",
          "label": "EPAP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti",
          "label": "Inspiratory Time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "1–5",
          "t": "ordinal",
          "key": "V60_rise"
        },
        {
          "id": "trigger",
          "label": "Trigger",
          "unit": "1–7",
          "t": "ordinal",
          "key": "V60_trigger"
        }
      ]
    },
    "VAPS-PS": {
      "mode": "AVAPS",
      "fields": [
        {
          "id": "vt",
          "label": "Tidal Volume",
          "unit": "mL",
          "t": "number"
        },
        {
          "id": "ipap_min",
          "label": "IPAP min",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "ipap_max",
          "label": "IPAP max",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "epap",
          "label": "EPAP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti_backup",
          "label": "Inspiratory Time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "1–5",
          "t": "ordinal",
          "key": "V60_rise"
        },
        {
          "id": "trigger",
          "label": "Trigger",
          "unit": "1–7",
          "t": "ordinal",
          "key": "V60_trigger"
        },
        {
          "id": "cycle",
          "label": "E-Cycle",
          "unit": "",
          "t": "verbal",
          "opts": [
            "low",
            "med",
            "high"
          ]
        }
      ]
    }
  },
  "Trilogy 100": {
    "Pressure Support": {
      "mode": "S/T",
      "fields": [
        {
          "id": "pip",
          "label": "IPAP",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "epap",
          "label": "EPAP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti_backup",
          "label": "Inspiratory Time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_min",
          "label": "Ti min",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_max",
          "label": "Ti max",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "1–6",
          "t": "ordinal",
          "key": "T100_rise"
        },
        {
          "id": "trigger",
          "label": "Flow trigger sensitivity",
          "unit": "L/min",
          "t": "number",
          "pref": "lmin"
        },
        {
          "id": "cycle",
          "label": "Flow cycle sensitivity",
          "unit": "%",
          "t": "number",
          "pref": "pct"
        }
      ]
    },
    "PAC": {
      "mode": "Pressure Control",
      "fields": [
        {
          "id": "pip",
          "label": "IPAP",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "epap",
          "label": "EPAP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti",
          "label": "Inspiratory Time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "1–6",
          "t": "ordinal",
          "key": "T100_rise"
        },
        {
          "id": "trigger",
          "label": "Flow trigger sensitivity",
          "unit": "L/min",
          "t": "number",
          "pref": "lmin"
        }
      ]
    },
    "VAPS-PS": {
      "mode": "S/T - AVAPS",
      "fields": [
        {
          "id": "vt",
          "label": "Tidal Volume",
          "unit": "mL",
          "t": "number"
        },
        {
          "id": "ipap_min",
          "label": "IPAP min",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "ipap_max",
          "label": "IPAP max",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "epap",
          "label": "EPAP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti_backup",
          "label": "Inspiratory Time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "1–6",
          "t": "ordinal",
          "key": "T100_rise"
        },
        {
          "id": "trigger",
          "label": "Flow trigger sensitivity",
          "unit": "L/min",
          "t": "number",
          "pref": "lmin"
        },
        {
          "id": "cycle",
          "label": "Flow cycle sensitivity",
          "unit": "%",
          "t": "number",
          "pref": "pct"
        }
      ]
    },
    "VAPS-PC": {
      "mode": "PC - AVAPS",
      "fields": [
        {
          "id": "vt",
          "label": "Tidal Volume",
          "unit": "mL",
          "t": "number"
        },
        {
          "id": "ipap_min",
          "label": "IPAP min",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "ipap_max",
          "label": "IPAP max",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "epap",
          "label": "EPAP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti",
          "label": "Inspiratory Time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "1–6",
          "t": "ordinal",
          "key": "T100_rise"
        },
        {
          "id": "trigger",
          "label": "Flow trigger sensitivity",
          "unit": "L/min",
          "t": "number",
          "pref": "lmin"
        }
      ]
    },
    "VAPS-AE PS": {
      "mode": "AVAPS-AE",
      "fields": [
        {
          "id": "vt",
          "label": "Tidal Volume",
          "unit": "mL",
          "t": "number"
        },
        {
          "id": "ipap_min",
          "label": "PS min",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "ae_ps"
        },
        {
          "id": "ipap_max",
          "label": "PS max",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "ae_ps"
        },
        {
          "id": "epap_min",
          "label": "EPAP min",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "epap_max",
          "label": "EPAP max",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti_backup",
          "label": "Inspiratory Time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "1–6",
          "t": "ordinal",
          "key": "T100_rise"
        },
        {
          "id": "trigger",
          "label": "Flow trigger sensitivity",
          "unit": "L/min",
          "t": "number",
          "pref": "lmin"
        },
        {
          "id": "cycle",
          "label": "Flow cycle sensitivity",
          "unit": "%",
          "t": "number",
          "pref": "pct"
        }
      ]
    }
  },
  "Trilogy EVO/EV300": {
    "Pressure Support": {
      "mode": "S/T",
      "fields": [
        {
          "id": "pip",
          "label": "IPAP",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "epap",
          "label": "EPAP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti_backup",
          "label": "Inspiratory Time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_min",
          "label": "Ti min",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_max",
          "label": "Ti max",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "0–6",
          "t": "ordinal",
          "key": "TEVO_rise"
        },
        {
          "id": "trigger",
          "label": "Flow trigger sensitivity",
          "unit": "L/min",
          "t": "number",
          "pref": "lmin"
        },
        {
          "id": "cycle",
          "label": "Flow cycle sensitivity",
          "unit": "%",
          "t": "number",
          "pref": "pct"
        }
      ]
    },
    "PAC": {
      "mode": "PC/AC",
      "fields": [
        {
          "id": "pip",
          "label": "PC (above PEEP)",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "above_epap",
          "note": "Enter above PEEP"
        },
        {
          "id": "epap",
          "label": "PEEP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti",
          "label": "Inspiratory Time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "0–6",
          "t": "ordinal",
          "key": "TEVO_rise"
        },
        {
          "id": "trigger",
          "label": "Flow trigger sensitivity",
          "unit": "L/min",
          "t": "number",
          "pref": "lmin"
        }
      ]
    },
    "VAPS-PS": {
      "mode": "S/T - AVAPS",
      "fields": [
        {
          "id": "vt",
          "label": "Tidal Volume",
          "unit": "mL",
          "t": "number"
        },
        {
          "id": "ipap_min",
          "label": "IPAP min",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "ipap_max",
          "label": "IPAP max",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "epap",
          "label": "EPAP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti_backup",
          "label": "Inspiratory Time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_min",
          "label": "Ti min",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_max",
          "label": "Ti max",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "0–6",
          "t": "ordinal",
          "key": "TEVO_rise"
        },
        {
          "id": "trigger",
          "label": "Flow trigger sensitivity",
          "unit": "L/min",
          "t": "number",
          "pref": "lmin"
        },
        {
          "id": "cycle",
          "label": "Flow cycle sensitivity",
          "unit": "%",
          "t": "number",
          "pref": "pct"
        }
      ]
    },
    "VAPS-PC": {
      "mode": "PC/AC - AVAPS",
      "fields": [
        {
          "id": "vt",
          "label": "Tidal Volume",
          "unit": "mL",
          "t": "number"
        },
        {
          "id": "ipap_min",
          "label": "PC min (above PEEP)",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "above_epap",
          "note": "Enter above PEEP"
        },
        {
          "id": "ipap_max",
          "label": "PC max (above PEEP)",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "above_epap"
        },
        {
          "id": "epap",
          "label": "PEEP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti",
          "label": "Inspiratory Time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "0–6",
          "t": "ordinal",
          "key": "TEVO_rise"
        },
        {
          "id": "trigger",
          "label": "Flow trigger sensitivity",
          "unit": "L/min",
          "t": "number",
          "pref": "lmin"
        }
      ]
    },
    "VAPS-AE PS": {
      "mode": "AVAPS-AE",
      "fields": [
        {
          "id": "vt",
          "label": "Tidal Volume",
          "unit": "mL",
          "t": "number"
        },
        {
          "id": "ipap_min",
          "label": "PS min",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "ae_ps"
        },
        {
          "id": "ipap_max",
          "label": "PS max",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "ae_ps"
        },
        {
          "id": "epap_min",
          "label": "EPAP min",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "epap_max",
          "label": "EPAP max",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti_backup",
          "label": "Inspiratory Time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_min",
          "label": "Ti min",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_max",
          "label": "Ti max",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "0–6",
          "t": "ordinal",
          "key": "TEVO_rise"
        },
        {
          "id": "trigger",
          "label": "Flow trigger sensitivity",
          "unit": "L/min",
          "t": "number",
          "pref": "lmin"
        },
        {
          "id": "cycle",
          "label": "Flow cycle sensitivity",
          "unit": "%",
          "t": "number",
          "pref": "pct"
        }
      ]
    },
    "VAPS-AE PC": {
      "mode": "AVAPS-AE, PC Breath ON",
      "fields": [
        {
          "id": "vt",
          "label": "Tidal Volume",
          "unit": "mL",
          "t": "number"
        },
        {
          "id": "ipap_min",
          "label": "PC min",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "ae_ps"
        },
        {
          "id": "ipap_max",
          "label": "PC max",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "ae_ps"
        },
        {
          "id": "epap_min",
          "label": "PEEP min",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "epap_max",
          "label": "PEEP max",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti",
          "label": "Inspiratory Time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "0–6",
          "t": "ordinal",
          "key": "TEVO_rise"
        },
        {
          "id": "trigger",
          "label": "Flow trigger sensitivity",
          "unit": "L/min",
          "t": "number",
          "pref": "lmin"
        }
      ]
    }
  },
  "Breas Vivo 45LS": {
    "Pressure Support": {
      "mode": "Pressure Support",
      "fields": [
        {
          "id": "pip",
          "label": "IPAP",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "epap",
          "label": "EPAP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti_backup",
          "label": "Back up Inspiratory time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_min",
          "label": "Ti min",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_max",
          "label": "Ti max",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "1–9",
          "t": "ordinal",
          "key": "Breas_rise"
        },
        {
          "id": "trigger",
          "label": "Inspiratory Trigger",
          "unit": "1–9",
          "t": "ordinal",
          "key": "Breas_trigger"
        },
        {
          "id": "cycle",
          "label": "Expiratory Trigger",
          "unit": "1–9",
          "t": "ordinal",
          "key": "Breas_exp_trigger"
        }
      ]
    },
    "PAC": {
      "mode": "Pressure Control",
      "fields": [
        {
          "id": "pip",
          "label": "IPAP",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "epap",
          "label": "EPAP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti",
          "label": "Inspiratory Time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "1–9",
          "t": "ordinal",
          "key": "Breas_rise"
        },
        {
          "id": "trigger",
          "label": "Inspiratory Trigger",
          "unit": "1–9",
          "t": "ordinal",
          "key": "Breas_trigger"
        }
      ]
    },
    "VAPS-PS": {
      "mode": "PSV (TgV)",
      "fields": [
        {
          "id": "vt",
          "label": "Tidal Volume",
          "unit": "mL",
          "t": "number"
        },
        {
          "id": "ipap_min",
          "label": "Min Pressure",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "ipap_max",
          "label": "Max Pressure",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "epap",
          "label": "EPAP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti_backup",
          "label": "Back up Inspiratory time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_min",
          "label": "Ti min",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_max",
          "label": "Ti max",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "1–9",
          "t": "ordinal",
          "key": "Breas_rise"
        },
        {
          "id": "trigger",
          "label": "Inspiratory Trigger",
          "unit": "1–9",
          "t": "ordinal",
          "key": "Breas_trigger"
        },
        {
          "id": "cycle",
          "label": "Expiratory Trigger",
          "unit": "1–9",
          "t": "ordinal",
          "key": "Breas_exp_trigger"
        }
      ]
    },
    "VAPS-PC": {
      "mode": "PCV (TgV)",
      "fields": [
        {
          "id": "vt",
          "label": "Tidal Volume",
          "unit": "mL",
          "t": "number"
        },
        {
          "id": "ipap_min",
          "label": "Min Pressure",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "ipap_max",
          "label": "Max Pressure",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "epap",
          "label": "EPAP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti",
          "label": "Back up Inspiratory time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "1–9",
          "t": "ordinal",
          "key": "Breas_rise"
        },
        {
          "id": "trigger",
          "label": "Inspiratory Trigger",
          "unit": "1–9",
          "t": "ordinal",
          "key": "Breas_trigger"
        }
      ]
    },
    "VAPS-AE PS": {
      "mode": "PSV (TgV) - AE",
      "fields": [
        {
          "id": "vt",
          "label": "Tidal Volume",
          "unit": "mL",
          "t": "number"
        },
        {
          "id": "ipap_min",
          "label": "PS min",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "ae_ps"
        },
        {
          "id": "ipap_max",
          "label": "PS max",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "ae_ps"
        },
        {
          "id": "epap_min",
          "label": "EPAP min",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "epap_max",
          "label": "EPAP max",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti_backup",
          "label": "Back up Inspiratory time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_min",
          "label": "Ti min",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_max",
          "label": "Ti max",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "1–9",
          "t": "ordinal",
          "key": "Breas_rise"
        },
        {
          "id": "trigger",
          "label": "Inspiratory Trigger",
          "unit": "1–9",
          "t": "ordinal",
          "key": "Breas_trigger"
        },
        {
          "id": "cycle",
          "label": "Expiratory Trigger",
          "unit": "1–9",
          "t": "ordinal",
          "key": "Breas_exp_trigger"
        }
      ]
    },
    "VAPS-AE PC": {
      "mode": "PCV (TgV) - AE",
      "fields": [
        {
          "id": "vt",
          "label": "Tidal Volume",
          "unit": "mL",
          "t": "number"
        },
        {
          "id": "ipap_min",
          "label": "PC min",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "ae_ps"
        },
        {
          "id": "ipap_max",
          "label": "PC max",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "ae_ps"
        },
        {
          "id": "epap_min",
          "label": "EPAP min",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "epap_max",
          "label": "EPAP max",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti",
          "label": "Inspiratory Time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise",
          "unit": "1–9",
          "t": "ordinal",
          "key": "Breas_rise"
        },
        {
          "id": "trigger",
          "label": "Inspiratory Trigger",
          "unit": "1–9",
          "t": "ordinal",
          "key": "Breas_trigger"
        }
      ]
    }
  },
  "Lowenstein Luisa": {
    "Pressure Support": {
      "mode": "S/T / Pressure Support",
      "fields": [
        {
          "id": "pip",
          "label": "IPAP",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "epap",
          "label": "EPAP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti_backup",
          "label": "Ti Timed",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_min",
          "label": "Ti Min",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_max",
          "label": "Ti Max",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Pressure Increase",
          "unit": "1–4",
          "t": "ordinal",
          "key": "Low_rise"
        },
        {
          "id": "trigger",
          "label": "Inspiratory Sensitivity",
          "unit": "1–10",
          "t": "ordinal",
          "key": "Low_trigger"
        },
        {
          "id": "cycle",
          "label": "Expiratory Sensitivity",
          "unit": "%",
          "t": "number",
          "pref": "pct"
        }
      ]
    },
    "PAC": {
      "mode": "aPCV",
      "fields": [
        {
          "id": "pip",
          "label": "IPAP",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "epap",
          "label": "EPAP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti",
          "label": "Ti Timed",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Pressure Increase",
          "unit": "1–4",
          "t": "ordinal",
          "key": "Low_rise"
        },
        {
          "id": "trigger",
          "label": "Inspiratory Sensitivity",
          "unit": "1–10",
          "t": "ordinal",
          "key": "Low_trigger"
        }
      ]
    },
    "VAPS-PS": {
      "mode": "S/T with target volume / PS with target volume",
      "fields": [
        {
          "id": "vt",
          "label": "Tidal volume",
          "unit": "mL",
          "t": "number"
        },
        {
          "id": "ipap_min",
          "label": "IPAP min",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "ipap_max",
          "label": "IPAP max",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "epap",
          "label": "EPAP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti_backup",
          "label": "Ti Timed",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_min",
          "label": "Ti Min",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_max",
          "label": "Ti Max",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Pressure Increase",
          "unit": "1–4",
          "t": "ordinal",
          "key": "Low_rise"
        },
        {
          "id": "trigger",
          "label": "Inspiratory Sensitivity",
          "unit": "1–10",
          "t": "ordinal",
          "key": "Low_trigger"
        },
        {
          "id": "cycle",
          "label": "Expiratory Sensitivity",
          "unit": "%",
          "t": "number",
          "pref": "pct"
        }
      ]
    },
    "VAPS-PC": {
      "mode": "aPCV with target volume",
      "fields": [
        {
          "id": "vt",
          "label": "Tidal volume",
          "unit": "mL",
          "t": "number"
        },
        {
          "id": "ipap_min",
          "label": "IPAP min",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "ipap_max",
          "label": "IPAP max",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "epap",
          "label": "EPAP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti",
          "label": "Ti Timed",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Pressure Increase",
          "unit": "1–4",
          "t": "ordinal",
          "key": "Low_rise"
        },
        {
          "id": "trigger",
          "label": "Inspiratory Sensitivity",
          "unit": "1–10",
          "t": "ordinal",
          "key": "Low_trigger"
        }
      ]
    },
    "VAPS-AE PS": {
      "mode": "TTV-VAPS-AE",
      "fields": [
        {
          "id": "vt",
          "label": "Target volume",
          "unit": "mL",
          "t": "number"
        },
        {
          "id": "ipap_min",
          "label": "PS",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "ae_ps"
        },
        {
          "id": "ipap_max",
          "label": "PS max",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "ae_ps"
        },
        {
          "id": "epap_min",
          "label": "EPAP min",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "epap_max",
          "label": "EPAP max",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti_backup",
          "label": "Ti Timed",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_min",
          "label": "Ti Min",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_max",
          "label": "Ti Max",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Pressure Increase",
          "unit": "1–4",
          "t": "ordinal",
          "key": "Low_rise"
        },
        {
          "id": "trigger",
          "label": "Inspiratory Sensitivity",
          "unit": "1–10",
          "t": "ordinal",
          "key": "Low_trigger"
        },
        {
          "id": "cycle",
          "label": "Expiratory Sensitivity",
          "unit": "%",
          "t": "number",
          "pref": "pct"
        }
      ]
    }
  },
  "React Health VPro": {
    "Pressure Support": {
      "mode": "Bilevel",
      "fields": [
        {
          "id": "pip",
          "label": "IPAP",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "absolute"
        },
        {
          "id": "epap",
          "label": "EPAP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti_backup",
          "label": "Inspiratory Time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_max",
          "label": "Time Cycle",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise Time",
          "unit": "1–6",
          "t": "ordinal",
          "key": "VPro_rise"
        },
        {
          "id": "trigger",
          "label": "Flow Trigger",
          "unit": "L/min",
          "t": "number",
          "pref": "lmin"
        },
        {
          "id": "cycle",
          "label": "Flow Cycle",
          "unit": "%",
          "t": "number",
          "pref": "pct"
        }
      ]
    },
    "PAC": {
      "mode": "AC-Pressure",
      "fields": [
        {
          "id": "pip",
          "label": "Pressure Control (above PEEP)",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "above_epap",
          "note": "Enter above PEEP"
        },
        {
          "id": "epap",
          "label": "PEEP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Respiratory Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti",
          "label": "Inspiratory Time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise Time",
          "unit": "1–6",
          "t": "ordinal",
          "key": "VPro_rise"
        },
        {
          "id": "trigger",
          "label": "Flow Trigger",
          "unit": "L/min",
          "t": "number",
          "pref": "lmin"
        }
      ]
    },
    "VAPS-PS": {
      "mode": "PS with target volume",
      "fields": [
        {
          "id": "vt",
          "label": "Tidal Volume",
          "unit": "mL",
          "t": "number"
        },
        {
          "id": "ipap_min",
          "label": "PS min",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "above_epap",
          "note": "Entered above PEEP"
        },
        {
          "id": "ipap_max",
          "label": "PS max",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "above_epap"
        },
        {
          "id": "epap",
          "label": "PEEP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Breath Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti_backup",
          "label": "Inspiratory Time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_max",
          "label": "Time Cycle",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise Time",
          "unit": "1–6",
          "t": "ordinal",
          "key": "VPro_rise"
        },
        {
          "id": "trigger",
          "label": "Flow Trigger",
          "unit": "L/min",
          "t": "number",
          "pref": "lmin"
        },
        {
          "id": "cycle",
          "label": "Flow Cycle",
          "unit": "%",
          "t": "number",
          "pref": "pct"
        }
      ]
    },
    "VAPS-PC": {
      "mode": "PC with target volume",
      "fields": [
        {
          "id": "vt",
          "label": "Tidal Volume",
          "unit": "mL",
          "t": "number"
        },
        {
          "id": "ipap_min",
          "label": "PC min (above PEEP)",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "above_epap",
          "note": "Entered above PEEP"
        },
        {
          "id": "ipap_max",
          "label": "PC max (above PEEP)",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "above_epap"
        },
        {
          "id": "epap",
          "label": "PEEP",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Breath Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti",
          "label": "Inspiratory Time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise Time",
          "unit": "1–6",
          "t": "ordinal",
          "key": "VPro_rise"
        },
        {
          "id": "trigger",
          "label": "Flow Trigger",
          "unit": "L/min",
          "t": "number",
          "pref": "lmin"
        }
      ]
    },
    "VAPS-AE PS": {
      "mode": "PS with target volume - Intellipap ON",
      "fields": [
        {
          "id": "vt",
          "label": "Tidal Volume",
          "unit": "mL",
          "t": "number"
        },
        {
          "id": "ipap_min",
          "label": "PS min",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "ae_ps"
        },
        {
          "id": "ipap_max",
          "label": "PS max",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "ae_ps"
        },
        {
          "id": "epap_min",
          "label": "PEEP min",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "epap_max",
          "label": "PEEP max",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Breath Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti_backup",
          "label": "Inspiratory Time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "ti_max",
          "label": "Time Cycle",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise Time",
          "unit": "1–6",
          "t": "ordinal",
          "key": "VPro_rise"
        },
        {
          "id": "trigger",
          "label": "Flow Trigger",
          "unit": "L/min",
          "t": "number",
          "pref": "lmin"
        },
        {
          "id": "cycle",
          "label": "Flow Cycle",
          "unit": "%",
          "t": "number",
          "pref": "pct"
        }
      ]
    },
    "VAPS-AE PC": {
      "mode": "PC with target volume, Intellipap ON",
      "fields": [
        {
          "id": "vt",
          "label": "Tidal Volume",
          "unit": "mL",
          "t": "number"
        },
        {
          "id": "ipap_min",
          "label": "PC min",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "ae_ps"
        },
        {
          "id": "ipap_max",
          "label": "PC max",
          "unit": "cmH₂O",
          "t": "number",
          "pref": "ae_ps"
        },
        {
          "id": "epap_min",
          "label": "PEEP min",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "epap_max",
          "label": "PEEP max",
          "unit": "cmH₂O",
          "t": "number"
        },
        {
          "id": "rr",
          "label": "Breath Rate",
          "unit": "bpm",
          "t": "number"
        },
        {
          "id": "ti",
          "label": "Inspiratory Time",
          "unit": "s",
          "t": "number"
        },
        {
          "id": "rise",
          "label": "Rise Time",
          "unit": "1–6",
          "t": "ordinal",
          "key": "VPro_rise"
        },
        {
          "id": "trigger",
          "label": "Flow Trigger",
          "unit": "L/min",
          "t": "number",
          "pref": "lmin"
        }
      ]
    }
  }
};
export const COMPAT: Compat = {
  "Pressure Support": {
    "Resmed Aircurve 10 ST (A)": {
      "vk": "Pressure Support",
      "match": "exact"
    },
    "Respironics V60": {
      "vk": "Pressure Support",
      "match": "exact"
    },
    "Trilogy 100": {
      "vk": "Pressure Support",
      "match": "exact"
    },
    "Trilogy EVO/EV300": {
      "vk": "Pressure Support",
      "match": "exact"
    },
    "Breas Vivo 45LS": {
      "vk": "Pressure Support",
      "match": "exact"
    },
    "Lowenstein Luisa": {
      "vk": "Pressure Support",
      "match": "exact"
    },
    "React Health VPro": {
      "vk": "Pressure Support",
      "match": "exact"
    }
  },
  "PAC": {
    "Resmed Aircurve 10 ST (A)": {
      "vk": "PAC",
      "match": "exact"
    },
    "Respironics V60": {
      "vk": "PAC",
      "match": "exact"
    },
    "Trilogy 100": {
      "vk": "PAC",
      "match": "exact"
    },
    "Trilogy EVO/EV300": {
      "vk": "PAC",
      "match": "exact"
    },
    "Breas Vivo 45LS": {
      "vk": "PAC",
      "match": "exact"
    },
    "Lowenstein Luisa": {
      "vk": "PAC",
      "match": "exact"
    },
    "React Health VPro": {
      "vk": "PAC",
      "match": "exact"
    }
  },
  "VAPS-PS": {
    "Resmed Aircurve 10 ST (A)": {
      "vk": "VAPS-PS",
      "match": "exact"
    },
    "Resmed Astral": {
      "vk": "VAPS-PS",
      "match": "exact"
    },
    "Respironics V60": {
      "vk": "VAPS-PS",
      "match": "exact"
    },
    "Trilogy 100": {
      "vk": "VAPS-PS",
      "match": "exact"
    },
    "Trilogy EVO/EV300": {
      "vk": "VAPS-PS",
      "match": "exact"
    },
    "Breas Vivo 45LS": {
      "vk": "VAPS-PS",
      "match": "exact"
    },
    "Lowenstein Luisa": {
      "vk": "VAPS-PS",
      "match": "exact"
    },
    "React Health VPro": {
      "vk": "VAPS-PS",
      "match": "exact"
    }
  },
  "VAPS-PC": {
    "Resmed Astral": {
      "vk": "VAPS-PC",
      "match": "exact"
    },
    "Trilogy 100": {
      "vk": "VAPS-PC",
      "match": "exact"
    },
    "Trilogy EVO/EV300": {
      "vk": "VAPS-PC",
      "match": "exact"
    },
    "Breas Vivo 45LS": {
      "vk": "VAPS-PC",
      "match": "exact"
    },
    "Lowenstein Luisa": {
      "vk": "VAPS-PC",
      "match": "exact"
    },
    "React Health VPro": {
      "vk": "VAPS-PC",
      "match": "exact"
    }
  },
  "VAPS-AE PS": {
    "Resmed Astral": {
      "vk": "VAPS-AE PS",
      "match": "exact"
    },
    "Trilogy 100": {
      "vk": "VAPS-AE PS",
      "match": "exact"
    },
    "Trilogy EVO/EV300": {
      "vk": "VAPS-AE PS",
      "match": "exact"
    },
    "Breas Vivo 45LS": {
      "vk": "VAPS-AE PS",
      "match": "exact"
    },
    "Lowenstein Luisa": {
      "vk": "VAPS-AE PS",
      "match": "exact"
    },
    "React Health VPro": {
      "vk": "VAPS-AE PS",
      "match": "exact"
    }
  },
  "VAPS-AE PC": {
    "Trilogy EVO/EV300": {
      "vk": "VAPS-AE PC",
      "match": "exact"
    },
    "React Health VPro": {
      "vk": "VAPS-AE PC",
      "match": "exact"
    },
    "Breas Vivo 45LS": {
      "vk": "VAPS-AE PC",
      "match": "exact"
    },
    "Resmed Astral": {
      "vk": "VAPS-AE PS",
      "match": "bridge",
      "bridges": [
        {
          "src": "ti",
          "tgt": [
            "ti_min",
            "ti_max"
          ],
          "note": "Fixed Ti → Ti min = Ti max"
        },
        {
          "src": "vt",
          "tgt": [
            "vt"
          ]
        },
        {
          "src": "ipap_min",
          "tgt": [
            "ipap_min"
          ]
        },
        {
          "src": "ipap_max",
          "tgt": [
            "ipap_max"
          ]
        },
        {
          "src": "epap_min",
          "tgt": [
            "epap_min"
          ]
        },
        {
          "src": "epap_max",
          "tgt": [
            "epap_max"
          ]
        },
        {
          "src": "rr",
          "tgt": [
            "rr"
          ]
        },
        {
          "src": "rise",
          "tgt": [
            "rise"
          ]
        },
        {
          "src": "trigger",
          "tgt": [
            "trigger"
          ]
        }
      ],
      "note": "iVAPS-AE used as best equivalent. Fixed Ti → Ti min = Ti max. Cycle defaulted to 25%."
    },
    "Lowenstein Luisa": {
      "vk": "VAPS-AE PS",
      "match": "bridge",
      "bridges": [
        {
          "src": "ti",
          "tgt": [
            "ti_min",
            "ti_max"
          ],
          "note": "Fixed Ti → Ti min = Ti max"
        },
        {
          "src": "vt",
          "tgt": [
            "vt"
          ]
        },
        {
          "src": "ipap_min",
          "tgt": [
            "ipap_min"
          ]
        },
        {
          "src": "ipap_max",
          "tgt": [
            "ipap_max"
          ]
        },
        {
          "src": "epap_min",
          "tgt": [
            "epap_min"
          ]
        },
        {
          "src": "epap_max",
          "tgt": [
            "epap_max"
          ]
        },
        {
          "src": "rr",
          "tgt": [
            "rr"
          ]
        },
        {
          "src": "rise",
          "tgt": [
            "rise"
          ]
        },
        {
          "src": "trigger",
          "tgt": [
            "trigger"
          ]
        }
      ],
      "note": "TTV-VAPS-AE used as best equivalent. Fixed Ti → Ti min = Ti max. Cycle defaulted to 25%."
    }
  }
};
export const SCALES: Scales = {
  "V60_rise": [
    {
      "s": 1,
      "v": 100
    },
    {
      "s": 2,
      "v": 200
    },
    {
      "s": 3,
      "v": 300
    },
    {
      "s": 4,
      "v": 400
    },
    {
      "s": 5,
      "v": 500
    }
  ],
  "T100_rise": [
    {
      "s": 1,
      "v": 100
    },
    {
      "s": 2,
      "v": 200
    },
    {
      "s": 3,
      "v": 300
    },
    {
      "s": 4,
      "v": 400
    },
    {
      "s": 5,
      "v": 500
    },
    {
      "s": 6,
      "v": 600
    }
  ],
  "TEVO_rise": [
    {
      "s": 0,
      "v": 50
    },
    {
      "s": 1,
      "v": 100
    },
    {
      "s": 2,
      "v": 200
    },
    {
      "s": 3,
      "v": 300
    },
    {
      "s": 4,
      "v": 400
    },
    {
      "s": 5,
      "v": 500
    },
    {
      "s": 6,
      "v": 600
    }
  ],
  "Breas_rise": [
    {
      "s": 1,
      "v": 50
    },
    {
      "s": 2,
      "v": 100
    },
    {
      "s": 3,
      "v": 150
    },
    {
      "s": 4,
      "v": 200
    },
    {
      "s": 5,
      "v": 300
    },
    {
      "s": 6,
      "v": 400
    },
    {
      "s": 7,
      "v": 500
    },
    {
      "s": 8,
      "v": 650
    },
    {
      "s": 9,
      "v": 800
    }
  ],
  "Low_rise": [
    {
      "s": 1,
      "v": 100
    },
    {
      "s": 2,
      "v": 150
    },
    {
      "s": 3,
      "v": 200
    },
    {
      "s": 4,
      "v": 500
    }
  ],
  "VPro_rise": [
    {
      "s": 1,
      "v": 100
    },
    {
      "s": 2,
      "v": 200
    },
    {
      "s": 3,
      "v": 300
    },
    {
      "s": 4,
      "v": 400
    },
    {
      "s": 5,
      "v": 500
    },
    {
      "s": 6,
      "v": 600
    }
  ],
  "V60_trigger": [
    {
      "s": 1,
      "v": 1
    },
    {
      "s": 2,
      "v": 2
    },
    {
      "s": 3,
      "v": 3
    },
    {
      "s": 4,
      "v": 5
    },
    {
      "s": 5,
      "v": 7
    },
    {
      "s": 6,
      "v": 8
    },
    {
      "s": 7,
      "v": 10
    }
  ],
  "Breas_trigger": [
    {
      "s": 1,
      "v": 0.5
    },
    {
      "s": 2,
      "v": 1
    },
    {
      "s": 3,
      "v": 2
    },
    {
      "s": 4,
      "v": 3
    },
    {
      "s": 5,
      "v": 4
    },
    {
      "s": 6,
      "v": 5
    },
    {
      "s": 7,
      "v": 6
    },
    {
      "s": 8,
      "v": 8
    },
    {
      "s": 9,
      "v": 9
    }
  ],
  "Low_trigger": [
    {
      "s": 1,
      "v": 0.5
    },
    {
      "s": 2,
      "v": 1
    },
    {
      "s": 3,
      "v": 2
    },
    {
      "s": 4,
      "v": 3
    },
    {
      "s": 5,
      "v": 4
    },
    {
      "s": 6,
      "v": 5
    },
    {
      "s": 7,
      "v": 6
    },
    {
      "s": 8,
      "v": 8
    },
    {
      "s": 9,
      "v": 9
    },
    {
      "s": 10,
      "v": 10
    }
  ],
  "ResMed_trigger_verbal": [
    {
      "s": "very low",
      "v": 10
    },
    {
      "s": "low",
      "v": 8
    },
    {
      "s": "med",
      "v": 6
    },
    {
      "s": "high",
      "v": 4
    },
    {
      "s": "very high",
      "v": 2
    }
  ],
  "V60_cycle_verbal": [
    {
      "s": "low",
      "v": 10
    },
    {
      "s": "med",
      "v": 25
    },
    {
      "s": "high",
      "v": 40
    }
  ],
  "ResMed_cycle_verbal": [
    {
      "s": "very low",
      "v": 10
    },
    {
      "s": "low",
      "v": 18
    },
    {
      "s": "med",
      "v": 25
    },
    {
      "s": "high",
      "v": 35
    },
    {
      "s": "very high",
      "v": 50
    }
  ],
  "Breas_exp_trigger": [
    {
      "s": 1,
      "v": 80
    },
    {
      "s": 2,
      "v": 65
    },
    {
      "s": 3,
      "v": 50
    },
    {
      "s": 4,
      "v": 40
    },
    {
      "s": 5,
      "v": 30
    },
    {
      "s": 6,
      "v": 25
    },
    {
      "s": 7,
      "v": 20
    },
    {
      "s": 8,
      "v": 15
    },
    {
      "s": 9,
      "v": 5
    }
  ]
};
export const VA_MODES: Record<string, string[]> = {"Resmed Aircurve 10 ST (A)":["VAPS-PS"],"Resmed Astral":["VAPS-PS","VAPS-AE PS"]};
export const TR_MODES: Record<string, string[]> = {"Resmed Aircurve 10 ST (A)":["VAPS-PS"],"Resmed Astral":["VAPS-PS","VAPS-AE PS"]};
export const CYCLE_DEFAULT_PCT = 25;
export const CYCLE_DEFAULT_MSG = "No cycle sensitivity on source mode — defaulted to 25% (medium). Adjust based on patient flow profile.";
export const NO_CYCLE_MODES = ["PAC","VAPS-PC","VAPS-AE PC"];

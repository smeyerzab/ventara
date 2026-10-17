# Ventara

Clinical ventilator settings tools, built as an offline-capable PWA (Vite + React + TypeScript).

## Commands

```sh
npm install
npm run dev           # local dev server
npm test              # engine tests (incl. parity against the original v13)
npm run build         # hosted PWA → dist/  (deploy this folder to any static host / Lightsail nginx)
npm run build:single  # one self-contained HTML file → dist-single/index.html (demos, email)
```

## Layout

- `src/engine/` — pure translation logic, no UI. Clinical behaviour lives here.
  - `data.ts` — device/mode/scale data, auto-extracted from `../source/v13-translator.html`. Bump `DATA_VERSION` on any change.
  - `translate.parity.test.ts` — runs the original v13 page against the engine on ~5,000 random inputs; must stay green.
- `src/engine/bridge.ts` — cross-family translation (any source mode → any target family), built on `translate()` with a bridging hook; `alerts.ts` holds the device-switch notes from the Alerts sheet.
- `src/engine/settings.ts`, `navigator.ts` — Initial Settings and NIV Navigator; `modules.test.ts` and `bridge.test.ts` cover them.
- `src/pages/` — Home, Translate, CrossMode, Settings, Navigator.

## Features

- Device Translator: same-mode translation with per-row scale strips, breath-timing waveform, pressure envelope,
  Va↔Vt line, settable-range warnings, round-trip check, compare-all-targets table.
- Cross-Mode, Initial Settings, NIV Navigator: same figures where they apply; Navigator shows threshold gauges.
- Prefill: translator source fields can be filled from last-used values (per device+mode), Phil's worked example, or sent over from Initial Settings ("Send to Device Translator").
- Share: every result has a Share button that copies a link (state encoded in the URL) and shows a QR code; Print / PDF uses the browser's print dialog.

## Updating data

Edit `src/engine/data.ts`, bump `DATA_VERSION`, run `npm test`, `npm run build`, redeploy `dist/`.
Installed copies pick up the new version next time they are online and prompt the user to reload.

/* Device switches per device and Ventara mode, from the Alerts sheet of the Ventara middleware workbook. */
type Alert = [device: string, mode: string, metric: string, alert: string];

const ON = "must be turned on to work";
const NONE = "does not exist";
const ALERTS: Alert[] = [
  ["Breas Vivo 45LS", "Pressure Support", "Ti min", ON],
  ["Breas Vivo 45LS", "Pressure Support", "Ti max", ON],
  ["Breas Vivo 45LS", "VAPS-PS", "Ti min", ON],
  ["Breas Vivo 45LS", "VAPS-PS", "Ti max", ON],
  ["Breas Vivo 45LS", "VAPS-AE PS", "Ti min", ON],
  ["Breas Vivo 45LS", "VAPS-AE PS", "Ti max", ON],
  ["Breas Vivo 45LS", "VAPS-AE PS", "Auto EPAP", ON],
  ["Breas Vivo 45LS", "VAPS-AE PC", "Auto EPAP", ON],
  ["Trilogy EVO/EV300", "Pressure Support", "Ti min", ON],
  ["Trilogy EVO/EV300", "Pressure Support", "Ti max", ON],
  ["Trilogy EVO/EV300", "VAPS-PS", "Ti min", ON],
  ["Trilogy EVO/EV300", "VAPS-PS", "Ti max", ON],
  ["Trilogy EVO/EV300", "VAPS-AE PS", "Ti min", ON],
  ["Trilogy EVO/EV300", "VAPS-AE PS", "Ti max", ON],
  ["Trilogy EVO/EV300", "VAPS-AE PC", "PC Breath", ON],
  ["Resmed Aircurve 10 ST (A)", "Pressure Support", "Respiratory Rate / Backup Ti", NONE],
  ["Resmed Aircurve 10 ST (A)", "VAPS-PS", "Respiratory Rate / Backup Ti", NONE],
  ["Resmed Astral", "Pressure Support", "Respiratory Rate / Backup Ti", NONE],
  ["Resmed Astral", "VAPS-PS", "Respiratory Rate / Backup Ti", NONE],
  ["Resmed Astral", "VAPS-AE PS", "Respiratory Rate / Backup Ti", NONE],
  ["React Health VPro", "VAPS-AE PS", "IntelliPAP (auto-EPAP)", ON],
  ["React Health VPro", "VAPS-AE PC", "IntelliPAP (auto-EPAP)", ON],
  ["React Health VPro", "Pressure Support", "Time Cycle (acts as Ti max)", ON],
  ["React Health VPro", "VAPS-PS", "Time Cycle (acts as Ti max)", ON],
  ["React Health VPro", "VAPS-AE PS", "Time Cycle (acts as Ti max)", ON],
];

/** Switch notes for a device in a Ventara mode; Ti min/max pairs are merged into one line. */
export function alertsFor(device: string, mode: string): string[] {
  const rows = ALERTS.filter((a) => a[0] === device && a[1] === mode);
  const out: string[] = [];
  const tiOn = rows.filter((a) => /^Ti (min|max)$/.test(a[2]) && a[3] === ON).map((a) => a[2]);
  if (tiOn.length) out.push(`${tiOn.join(" and ")} must be switched ON on the ${device}.`);
  for (const [, , metric, alert] of rows) {
    if (/^Ti (min|max)$/.test(metric)) continue;
    out.push(alert === ON ? `${metric} must be switched ON on the ${device}.` : `${device}: ${metric} — ${alert}.`);
  }
  return out;
}

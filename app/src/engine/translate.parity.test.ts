/*
 * Parity test: runs the ORIGINAL v13 page logic (source/v13-translator.html) against
 * the ported engine on thousands of random inputs and requires identical output.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ALL_DEVICES, COMPAT, DEV_MODES } from "./data";
import { fieldOptions, translate } from "./translate";
import type { Badge } from "./types";

const V13 = resolve(__dirname, "../../../source/v13-translator.html");

function loadV13() {
  const html = readFileSync(V13, "utf8");
  const js = html.split("<script>")[1].split("</script>")[0];
  const els: Record<string, { value: string; innerHTML: string; textContent: string; style: object; appendChild: () => void }> = {};
  const el = (id: string) => (els[id] ??= { value: "", innerHTML: "", textContent: "", style: {}, appendChild() {} });
  const document = { getElementById: el, createElement: () => ({}) };
  const run = new Function("document", js + ";return doTranslate;")(document) as () => void;
  return (srcDev: string, vk: string, tgtDev: string, values: Record<string, string>) => {
    for (const k of Object.keys(els)) if (k.startsWith("f_")) delete els[k];
    el("srcDev").value = srcDev;
    el("srcMode").value = vk;
    el("tgtDev").value = tgtDev;
    for (const [k, v] of Object.entries(values)) el("f_" + k).value = v;
    run();
    return el("output").innerHTML;
  };
}

const LABEL: Record<Badge, string> = {
  direct: "direct", exact: "exact", closest: "closest", calculated: "calculated", bridged: "bridged",
  default: "default ⚠", review: "review ⚠", missing: "not entered", nomatch: "no match",
};

function parseRows(html: string) {
  return [...html.matchAll(/<div class="rval">(.*?)<\/div><\/div>/g)].map((m) => {
    const cell = m[1];
    const val = /<strong>(.*?)<\/strong>/.exec(cell)?.[1] ?? null;
    const badge = /<span class="badge [a-z]+">(.*?)<\/span>/.exec(cell)?.[1] ?? "";
    const sub = /<div class="rval-sub">(.*)$/.exec(cell)?.[1];
    return { val, badge, sub };
  });
}

// deterministic RNG
let seed = 42;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];

const RANGES: Record<string, [number, number, number]> = {
  pip: [8, 30, 1], epap: [4, 12, 1], epap_min: [4, 10, 1], epap_max: [8, 20, 1],
  ipap_min: [4, 20, 1], ipap_max: [10, 30, 1], rr: [8, 24, 1], ti: [0.6, 1.8, 0.1],
  ti_backup: [0.6, 1.8, 0.1], ti_min: [0.3, 1.2, 0.1], ti_max: [1, 3, 0.1],
  rise: [50, 800, 50], trigger: [0.5, 10, 0.5], cycle: [5, 80, 5], vt: [250, 800, 10],
  target_va: [3, 12, 0.5],
};
const num = (id: string) => {
  const [lo, hi, st] = RANGES[id] ?? [1, 20, 1];
  return String(+(lo + Math.round((rnd() * (hi - lo)) / st) * st).toFixed(2));
};

describe("v13 parity", () => {
  const v13 = loadV13();
  const cases: [string, string, string][] = [];
  for (const src of ALL_DEVICES)
    for (const vk of Object.keys(DEV_MODES[src]))
      for (const tgt of ALL_DEVICES) if (tgt !== src && COMPAT[vk]?.[tgt]) cases.push([src, vk, tgt]);

  it("covers every compatible pair", () => expect(cases.length).toBeGreaterThan(150));

  it.each(cases)("%s / %s → %s", (src, vk, tgt) => {
    for (let i = 0; i < 25; i++) {
      const values: Record<string, string> = {};
      for (const f of DEV_MODES[src][vk]!.fields) {
        if (rnd() < 0.08) continue; // sometimes leave blank
        values[f.id] = f.t === "number" ? num(f.id) : pick(fieldOptions(f))[0];
      }
      const expected = parseRows(v13(src, vk, tgt, values));
      const res = translate({ srcDev: src, srcMode: vk, tgtDev: tgt, values });
      if (!res.ok) throw new Error(res.reason);
      const actual = res.rows.map((r) => ({
        val: r.display,
        badge: LABEL[r.badge],
        sub: r.sub?.replace(" ms →", "ms →"),
      }));
      expect(actual, JSON.stringify(values)).toEqual(expected);
    }
  });
});

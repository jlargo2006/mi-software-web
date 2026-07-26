// app/app/six-sigma/studies/multivari/compute.ts
import type { Cell } from "../../lib/types";
import type { ColumnSnapshot } from "../types";
import type {
  MultiVariParams,
  MultiVariResult,
  MVPoint,
  MVMean,
  MVFactorSummary,
} from "./types";

/* ---------- utilidades ---------- */

const isEmpty = (v: Cell): boolean =>
  v === null || v === undefined || (typeof v === "string" && v.trim() === "");

/** Acepta numero, "5.19" y "5,19". Devuelve null si no es numerico. */
function toNum(v: Cell): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const s = v.trim().replace(",", ".");
    if (s === "") return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Etiqueta estable para un nivel de factor. */
function toLabel(v: Cell): string {
  if (isEmpty(v)) return "";
  return typeof v === "number" ? String(v) : String(v).trim();
}

/** Orden natural: numerico si todos los niveles lo son, alfabetico si no. */
function sortLevels(levels: string[]): string[] {
  const allNum = levels.every((l) => l !== "" && Number.isFinite(Number(l.replace(",", "."))));
  const out = [...levels];
  if (allNum) {
    out.sort((a, b) => Number(a.replace(",", ".")) - Number(b.replace(",", ".")));
  } else {
    out.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }
  return out;
}

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function sd(xs: number[]): number | null {
  if (xs.length < 2) return null;
  const m = mean(xs);
  const ss = xs.reduce((a, b) => a + (b - m) * (b - m), 0);
  return Math.sqrt(ss / (xs.length - 1));
}

const KEY_SEP = "\u0001";
const key = (...parts: string[]) => parts.join(KEY_SEP);

/* ---------- calculo ---------- */

export function computeMultiVariStudy(
  data: ColumnSnapshot,
  params: MultiVariParams
): MultiVariResult {
  const empty = (error: string): MultiVariResult => ({
    ok: false,
    error,
    labels: { x: "", series: null, panel: null, row: null, response: "" },
    xLevels: [],
    seriesLevels: [],
    panelLevels: [],
    rowLevels: [],
    points: [],
    means: [],
    grandMean: 0,
    yRange: [0, 1],
    n: 0,
    missing: 0,
    unbalanced: false,
    summaries: [],
    notes: [],
  });

  const { factor1, factor2, factor3, factor4, responseCol } = params;

  if (!responseCol) return empty("Select the response column.");
  if (!factor1) return empty("Select at least one factor.");

  const resp = data[responseCol];
  const c1 = data[factor1];
  if (!resp || !c1) return empty("Selected columns are not available in the snapshot.");

  const c2 = factor2 ? data[factor2] : null;
  const c3 = factor3 ? data[factor3] : null;
  const c4 = factor4 ? data[factor4] : null;

  const len = Math.max(
    resp.values.length,
    c1.values.length,
    c2?.values.length ?? 0,
    c3?.values.length ?? 0,
    c4?.values.length ?? 0
  );

  const points: MVPoint[] = [];
  let missing = 0;

  for (let i = 0; i < len; i++) {
    const y = toNum(resp.values[i] ?? null);
    const x = toLabel(c1.values[i] ?? null);
    const s = c2 ? toLabel(c2.values[i] ?? null) : "";
    const p = c3 ? toLabel(c3.values[i] ?? null) : "";
    const r = c4 ? toLabel(c4.values[i] ?? null) : "";

    const factorMissing =
      x === "" || (!!c2 && s === "") || (!!c3 && p === "") || (!!c4 && r === "");

    if (y === null || factorMissing) {
      // Solo cuenta como descartada si la fila tenia algo.
      const anything =
        !isEmpty(resp.values[i] ?? null) ||
        !isEmpty(c1.values[i] ?? null) ||
        (c2 ? !isEmpty(c2.values[i] ?? null) : false) ||
        (c3 ? !isEmpty(c3.values[i] ?? null) : false) ||
        (c4 ? !isEmpty(c4.values[i] ?? null) : false);
      if (anything) missing++;
      continue;
    }

    points.push({ row: r, panel: p, series: s, x, value: y });
  }

  if (points.length === 0) return empty("No valid numeric observations found.");

  const xLevels = sortLevels([...new Set(points.map((p) => p.x))]);
  const seriesLevels = sortLevels([...new Set(points.map((p) => p.series))]);
  const panelLevels = sortLevels([...new Set(points.map((p) => p.panel))]);
  const rowLevels = sortLevels([...new Set(points.map((p) => p.row))]);

  /* medias por celda */
  const buckets = new Map<string, number[]>();
  for (const p of points) {
    const k = key(p.row, p.panel, p.series, p.x);
    const arr = buckets.get(k);
    if (arr) arr.push(p.value);
    else buckets.set(k, [p.value]);
  }

  const means: MVMean[] = [];
  for (const [k, vals] of buckets) {
    const [r, pan, ser, x] = k.split(KEY_SEP);
    means.push({ row: r, panel: pan, series: ser, x, mean: mean(vals), n: vals.length });
  }

  const counts = [...buckets.values()].map((v) => v.length);
  const unbalanced = counts.length > 1 && new Set(counts).size > 1;

  /* resumenes por factor */
  const summarise = (
    factorName: string,
    pick: (p: MVPoint) => string,
    levels: string[]
  ): MVFactorSummary => ({
    factor: factorName,
    levels: levels.map((lv) => {
      const vals = points.filter((p) => pick(p) === lv).map((p) => p.value);
      return { label: lv, n: vals.length, mean: mean(vals), sd: sd(vals) };
    }),
  });

  const summaries: MVFactorSummary[] = [summarise(factor1, (p) => p.x, xLevels)];
  if (factor2) summaries.push(summarise(factor2, (p) => p.series, seriesLevels));
  if (factor3) summaries.push(summarise(factor3, (p) => p.panel, panelLevels));
  if (factor4) summaries.push(summarise(factor4, (p) => p.row, rowLevels));

  const all = points.map((p) => p.value);
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const pad = hi - lo === 0 ? Math.abs(hi) * 0.05 || 0.5 : (hi - lo) * 0.12;

  const notes: string[] = [];
  if (missing > 0)
    notes.push(`${missing} row(s) discarded: non-numeric response or missing factor level.`);
  if (unbalanced)
    notes.push(
      "Unbalanced design: the number of observations per cell is not constant. The chart remains valid, but means are based on different sample sizes."
    );
  if (counts.some((c) => c === 1) && !unbalanced)
    notes.push("Single observation per cell: within-cell variation cannot be displayed.");

  return {
    ok: true,
    labels: {
      x: factor1,
      series: factor2,
      panel: factor3,
      row: factor4,
      response: responseCol,
    },
    xLevels,
    seriesLevels,
    panelLevels,
    rowLevels,
    points,
    means,
    grandMean: mean(all),
    yRange: [lo - pad, hi + pad],
    n: points.length,
    missing,
    unbalanced,
    summaries,
    notes,
  };
}

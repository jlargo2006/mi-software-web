// app/app/six-sigma/studies/multivari/compute.ts
import type { Cell } from "../../lib/types";
import type { ColumnSnapshot } from "../types";
import type {
  MultiVariParams,
  MultiVariResult,
  MVPoint,
  MVGroupMean,
  MVAxisLabel,
  MVFactorSummary,
} from "./types";

/* ---------- utilidades ---------- */

const isEmpty = (v: Cell): boolean =>
  v === null || v === undefined || (typeof v === "string" && v.trim() === "");

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

function toLabel(v: Cell): string {
  if (isEmpty(v)) return "";
  return typeof v === "number" ? String(v) : String(v).trim();
}

const mean = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / xs.length;

function sd(xs: number[]): number | null {
  if (xs.length < 2) return null;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) * (b - m), 0) / (xs.length - 1));
}

const SEP = "\u0001";
const keyOf = (path: string[]): string => path.join(SEP);

/** Separacion horizontal extra al cambiar de grupo, segun profundidad. */
const GAPS = [2.2, 0.9, 0.35];
const gapAt = (depth: number): number => GAPS[depth] ?? 0.2;

/* ---------- calculo ---------- */

export function computeMultiVariStudy(
  data: ColumnSnapshot,
  params: MultiVariParams
): MultiVariResult {
  const empty = (error: string): MultiVariResult => ({
    ok: false,
    error,
    factorNames: [],
    responseName: "",
    points: [],
    groupMeans: [],
    tickVals: [],
    tickText: [],
    axisLabels: [],
    separators: [],
    xRange: [0, 1],
    yRange: [0, 1],
    yRangeMeans: [0, 1],
    grandMean: 0,
    n: 0,
    missing: 0,
    unbalanced: false,
    summaries: [],
    notes: [],
  });

  const { responseCol, factor1, factor2, factor3, factor4 } = params;

  if (!responseCol) return empty("Select the response column.");
  if (!factor1) return empty("Select at least Factor 1.");

  // De mas externo a mas interno.
  const factorNames = [factor4, factor3, factor2, factor1].filter(
    (x): x is string => !!x
  );

  const resp = data[responseCol];
  if (!resp) return empty("Response column is not available in the snapshot.");

  const cols = factorNames.map((n) => data[n]);
  if (cols.some((c) => !c))
    return empty("One or more factor columns are not available in the snapshot.");

  const len = Math.max(resp.values.length, ...cols.map((c) => c!.values.length));

  /* --- lectura de filas --- */
  const raw: { path: string[]; value: number }[] = [];
  let missing = 0;

  for (let i = 0; i < len; i++) {
    const y = toNum(resp.values[i] ?? null);
    const path = cols.map((c) => toLabel(c!.values[i] ?? null));
    const bad = y === null || path.some((p) => p === "");

    if (bad) {
      const anything =
        !isEmpty(resp.values[i] ?? null) ||
        cols.some((c) => !isEmpty(c!.values[i] ?? null));
      if (anything) missing++;
      continue;
    }
    raw.push({ path, value: y as number });
  }

  if (raw.length === 0) return empty("No valid numeric observations found.");

  const L = factorNames.length;

  /* --- niveles por factor, en orden de aparicion o alfabetico --- */
  const levelsByDepth: string[][] = [];
  for (let d = 0; d < L; d++) {
    const seen: string[] = [];
    for (const r of raw) if (!seen.includes(r.path[d])) seen.push(r.path[d]);
    if (params.sortLevels) {
      const allNum = seen.every((s) => Number.isFinite(Number(s.replace(",", "."))));
      seen.sort((a, b) =>
        allNum
          ? Number(a.replace(",", ".")) - Number(b.replace(",", "."))
          : a.localeCompare(b, undefined, { numeric: true })
      );
    }
    levelsByDepth.push(seen);
  }

  /* --- enumeracion de celdas hoja en orden anidado --- */
  const leafPaths: string[][] = [];
  const build = (prefix: string[], d: number) => {
    if (d === L) {
      leafPaths.push(prefix);
      return;
    }
    for (const lv of levelsByDepth[d]) build([...prefix, lv], d + 1);
  };
  build([], 0);

  // Solo las combinaciones presentes en los datos.
  const present = new Set(raw.map((r) => keyOf(r.path)));
  const leaves = leafPaths.filter((p) => present.has(keyOf(p)));

  if (leaves.length === 0) return empty("No populated factor combinations found.");

  /* --- posiciones X con separacion por nivel --- */
  const xOf = new Map<string, number>();
  let cursor = 0;
  let prev: string[] | null = null;

  for (const p of leaves) {
    if (prev) {
      let changed = -1;
      for (let d = 0; d < L - 1; d++) {
        if (prev[d] !== p[d]) {
          changed = d;
          break;
        }
      }
      cursor += 1 + (changed >= 0 ? gapAt(changed) : 0);
    }
    xOf.set(keyOf(p), cursor);
    prev = p;
  }

  /* --- puntos individuales --- */
  const points: MVPoint[] = raw.map((r) => ({
    path: r.path,
    x: xOf.get(keyOf(r.path)) as number,
    value: r.value,
  }));

  /* --- medias de todos los niveles --- */
  const groupMeans: MVGroupMean[] = [];

  for (let d = 0; d < L; d++) {
    const buckets = new Map<string, { path: string[]; vals: number[]; xs: number[] }>();
    for (const pt of points) {
      const path = pt.path.slice(0, d + 1);
      const k = keyOf(path);
      const b = buckets.get(k);
      if (b) {
        b.vals.push(pt.value);
        b.xs.push(pt.x);
      } else {
        buckets.set(k, { path, vals: [pt.value], xs: [pt.x] });
      }
    }
    for (const b of buckets.values()) {
      groupMeans.push({
        depth: d,
        path: b.path,
        parent: keyOf(b.path.slice(0, d)),
        x: (Math.min(...b.xs) + Math.max(...b.xs)) / 2,
        mean: mean(b.vals),
        n: b.vals.length,
      });
    }
  }

  /* --- ticks y etiquetas de niveles superiores --- */
  const tickVals = leaves.map((p) => xOf.get(keyOf(p)) as number);
  const tickText = leaves.map((p) => p[L - 1]);

  const axisLabels: MVAxisLabel[] = groupMeans
    .filter((g) => g.depth < L - 1)
    .map((g) => ({ depth: g.depth, text: g.path[g.depth], x: g.x }));

  /* --- separadores verticales entre grupos del nivel externo --- */
  const separators: number[] = [];
  if (L >= 2) {
    for (let i = 1; i < leaves.length; i++) {
      if (leaves[i][0] !== leaves[i - 1][0]) {
        const a = xOf.get(keyOf(leaves[i - 1])) as number;
        const b = xOf.get(keyOf(leaves[i])) as number;
        separators.push((a + b) / 2);
      }
    }
  }

  /* --- resumenes por factor --- */
  const summaries: MVFactorSummary[] = factorNames.map((name, d) => ({
    factor: name,
    levels: levelsByDepth[d].map((lv) => {
      const vals = points.filter((p) => p.path[d] === lv).map((p) => p.value);
      return {
        label: lv,
        n: vals.length,
        mean: vals.length ? mean(vals) : NaN,
        sd: sd(vals),
      };
    }),
  }));

  /* --- rangos --- */
  const padOf = (lo: number, hi: number): number =>
    hi - lo === 0 ? Math.abs(hi) * 0.05 || 0.5 : (hi - lo) * 0.15;

  const all = points.map((p) => p.value);
  const loP = Math.min(...all);
  const hiP = Math.max(...all);
  const padP = padOf(loP, hiP);

  const allMeans = groupMeans.map((g) => g.mean);
  const loM = Math.min(...allMeans);
  const hiM = Math.max(...allMeans);
  const padM = padOf(loM, hiM);

  const xs = tickVals;
  const padX = 1;

  /* --- avisos --- */
  const leafCounts = groupMeans.filter((g) => g.depth === L - 1).map((g) => g.n);
  const unbalanced = new Set(leafCounts).size > 1;

  const notes: string[] = [];
  if (missing > 0)
    notes.push(
      `${missing} row(s) discarded: non-numeric response or missing factor level.`
    );
  if (unbalanced)
    notes.push(
      "Unbalanced design: the number of observations per cell is not constant. Means are based on different sample sizes."
    );
  if (leafCounts.every((c) => c === 1))
    notes.push(
      "One observation per cell: the innermost line joins individual values, not averages."
    );
  if (leaves.length < leafPaths.length)
    notes.push(
      `${leafPaths.length - leaves.length} factor combination(s) have no data and are omitted from the axis.`
    );

  return {
    ok: true,
    factorNames,
    responseName: responseCol,
    points,
    groupMeans,
    tickVals,
    tickText,
    axisLabels,
    separators,
    xRange: [Math.min(...xs) - padX, Math.max(...xs) + padX],
    yRange: [loP - padP, hiP + padP],
    yRangeMeans: [loM - padM, hiM + padM],
    grandMean: mean(all),
    n: points.length,
    missing,
    unbalanced,
    summaries,
    notes,
  };
}

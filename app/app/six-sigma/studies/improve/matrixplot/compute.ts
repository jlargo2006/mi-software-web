// app/app/six-sigma/studies/improve/matrixplot/compute.ts
import type { ColumnSnapshot } from "../../types";
import { lowess } from "../../../lib/lowess";
import {
  MAX_PANELS,
  type ImpMatrixParams,
  type ImpMatrixResult,
  type Panel,
  type PanelSeries,
} from "./types";

const cellNum = (c: number | string | null | undefined): number => {
  if (typeof c === "number") return c;
  if (typeof c !== "string") return NaN;
  const t = c.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

const cellText = (c: number | string | null | undefined): string =>
  c === null || c === undefined ? "" : String(c).trim();

const num = (s: string): number => {
  const t = s.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

const fail = (error: string): ImpMatrixResult => ({ ok: false, error });

/** Correlacion de Pearson. NaN si alguna variable es constante. */
function pearson(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 3) return NaN;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  if (!(sxx > 0) || !(syy > 0)) return NaN;
  return sxy / Math.sqrt(sxx * syy);
}

export function computeImpMatrix(
  data: ColumnSnapshot,
  params: ImpMatrixParams
): ImpMatrixResult {
  // --- 1. Variables de filas y columnas ------------------------------------
  let rowVars: string[];
  let colVars: string[];

  if (params.kind === "matrix") {
    const v = params.variables.filter((s) => s.trim() !== "");
    if (v.length < 2) return fail("Select at least two graph variables.");
    rowVars = v;
    colVars = v;
  } else {
    const ys = params.yVariables.filter((s) => s.trim() !== "");
    const xs = params.xVariables.filter((s) => s.trim() !== "");
    if (ys.length === 0 || xs.length === 0) {
      return fail("Select at least one Y variable and one X variable.");
    }
    rowVars = ys;
    colVars = xs;
  }

  if (rowVars.length * colVars.length > MAX_PANELS) {
    return fail(
      `Too many panels (${rowVars.length * colVars.length}). The limit is ${MAX_PANELS}.`
    );
  }

  // --- 2. Lectura de columnas ----------------------------------------------
  const allNames = Array.from(new Set([...rowVars, ...colVars]));
  const vals: Record<string, number[]> = {};
  let len = 0;
  for (const name of allNames) {
    const col = data[name];
    if (!col) return fail(`Column "${name}" does not exist.`);
    const v = col.values.map(cellNum);
    vals[name] = v;
    len = Math.max(len, v.length);
  }

  // --- 3. Grupos -----------------------------------------------------------
  const gName = params.groupColumn.trim();
  let groupLabels: string[] = [];
  let groupOf: string[] | null = null;
  if (gName !== "") {
    const gc = data[gName];
    if (!gc) return fail(`Column "${gName}" does not exist.`);
    groupOf = Array.from({ length: len }, (_, i) => cellText(gc.values[i]));
    groupLabels = Array.from(
      new Set(groupOf.filter((t) => t !== ""))
    ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    if (groupLabels.length === 0) {
      return fail(`Column "${gName}" has no group labels.`);
    }
    if (groupLabels.length > 12) {
      return fail(
        `Column "${gName}" has ${groupLabels.length} groups. The limit is 12.`
      );
    }
  }

  // --- 4. Suavizado --------------------------------------------------------
  const f = num(params.smootherF);
  const steps = num(params.smootherSteps);
  if (params.smoother === "lowess") {
    if (!(f > 0 && f <= 1)) {
      return fail("The degree of smoothing must be between 0 and 1.");
    }
    if (!Number.isInteger(steps) || steps < 0 || steps > 10) {
      return fail("The number of steps must be a whole number from 0 to 10.");
    }
  }

  // --- 5. Paneles ----------------------------------------------------------
  // Cada panel usa sus PROPIOS pares completos: una fila con un hueco en una
  // variable no invalida los paneles que no la usan.
  const panels: Panel[] = [];
  let nUsedMax = 0;
  let nMissing = 0;

  for (let i = 0; i < rowVars.length; i++) {
    for (let j = 0; j < colVars.length; j++) {
      const yName = rowVars[i];
      const xName = colVars[j];
      const diagonal = params.kind === "matrix" && i === j;

      if (diagonal) {
        panels.push({
          row: i,
          col: j,
          xName,
          yName,
          diagonal: true,
          series: [],
          smooth: null,
          r: NaN,
          n: 0,
        });
        continue;
      }

      const px: number[] = [];
      const py: number[] = [];
      const pg: string[] = [];
      for (let k = 0; k < len; k++) {
        const xv = vals[xName][k];
        const yv = vals[yName][k];
        if (!Number.isFinite(xv) || !Number.isFinite(yv)) continue;
        px.push(xv);
        py.push(yv);
        if (groupOf) pg.push(groupOf[k]);
      }

      const series: PanelSeries[] = [];
      if (groupOf) {
        for (const g of groupLabels) {
          const sx: number[] = [];
          const sy: number[] = [];
          for (let k = 0; k < px.length; k++) {
            if (pg[k] === g) {
              sx.push(px[k]);
              sy.push(py[k]);
            }
          }
          if (sx.length) series.push({ label: g, x: sx, y: sy });
        }
      } else {
        series.push({ label: "", x: px, y: py });
      }

      panels.push({
        row: i,
        col: j,
        xName,
        yName,
        diagonal: false,
        series,
        smooth:
          params.smoother === "lowess" ? lowess(px, py, f, steps) : null,
        r: pearson(px, py),
        n: px.length,
      });
      nUsedMax = Math.max(nUsedMax, px.length);
    }
  }

  if (nUsedMax < 3) {
    return fail("Not enough complete pairs to draw the plots.");
  }

  // --- 6. Rangos comunes ---------------------------------------------------
  // Cada variable manda en su fila y en su columna, asi que necesita un unico
  // rango: si no, los paneles no quedarian alineados.
  const ranges: Record<string, [number, number]> = {};
  for (const name of allNames) {
    const finite = vals[name].filter((v) => Number.isFinite(v));
    nMissing += vals[name].length - finite.length;
    const lo = Math.min(...finite);
    const hi = Math.max(...finite);
    const span = hi - lo;
    const pad = span > 0 ? span * 0.06 : Math.abs(hi) * 0.06 || 1;
    ranges[name] = [lo - pad, hi + pad];
  }

  return {
    ok: true,
    kind: params.kind,
    rowVars,
    colVars,
    panels,
    ranges,
    groupColumn: groupOf ? gName : null,
    groupLabels,
    smoother: params.smoother,
    nRows: rowVars.length,
    nCols: colVars.length,
    nUsed: nUsedMax,
    nMissing,
  };
}

// app/app/six-sigma/studies/timeseries/compute.ts
import type { ColumnSnapshot } from "../types";
import { lowess } from "../../lib/smoothing";
import type { TimeSeriesParams, TimeSeriesResult, TSLine } from "./types";

/** ¿es fila válida? (Y numérica finita) */
function isNum(raw: unknown): boolean {
  if (raw === null || raw === undefined || String(raw).trim() === "") return false;
  return Number.isFinite(Number(raw));
}

/** Etiqueta del eje X para cada fila: valor de timeCol o índice 1..n */
function buildX(
  n: number,
  timeValues: unknown[] | null
): (number | string)[] {
  if (!timeValues) return Array.from({ length: n }, (_, i) => i + 1);
  return timeValues.slice(0, n).map((v) =>
    v === null || v === undefined ? "" : String(v)
  );
}

export function computeTimeSeries(
  data: ColumnSnapshot,
  params: TimeSeriesParams
): TimeSeriesResult {
  const cols =
    params.yMode === "one" ? params.cols.slice(0, 1) : params.cols;

  const timeCol =
    params.timeCol && data[params.timeCol] ? data[params.timeCol] : null;
  const timeValues = timeCol ? timeCol.values : null;

  const groupCol =
    params.groups && params.groupBy ? data[params.groupBy] : null;

  const empty: TimeSeriesResult = {
    lines: [],
    hasSmoother: false,
    title: "Time Series Plot",
    xTitle: "Index",
    yTitle: "",
    xIsCategoryTime: false,
  };
  if (cols.length === 0) return empty;

  const lines: TSLine[] = [];

  /** Construye una TSLine a partir de filas (mantiene orden de fila). */
  const makeLine = (
    name: string,
    rows: number[] // índices de fila a incluir
  ): TSLine => {
    const xAll = buildX(
      Math.max(...rows, -1) + 1,
      timeValues
    );
    const x: (number | string)[] = [];
    const y: number[] = [];
    // numérico paralelo para el smoother (X numérico = índice de posición)
    const xn: number[] = [];
    let pos = 0;
    for (const ri of rows) {
      const col = data[name];
      const raw = col.values[ri];
      if (!isNum(raw)) continue;
      x.push(xAll[ri] ?? ri + 1);
      y.push(Number(raw));
      xn.push(pos++); // posición secuencial para Lowess
    }
    const line: TSLine = { name, x, y };
    if (params.smoother && y.length >= 3) {
      const sm = lowess(xn, y, params.smoothDegree, params.smoothSteps);
      // mapear las X numéricas suavizadas de vuelta a las etiquetas X
      line.smoothX = sm.x.map((p) => Number(p));
      line.smoothY = sm.y;
    }
    return line;
  };

  const allRows = (name: string): number[] =>
    data[name] ? data[name].values.map((_, i) => i) : [];

  if (!params.groups || !groupCol) {
    // Simple / Multiple: una línea por columna
    for (const name of cols) {
      if (!data[name]) continue;
      lines.push(makeLine(name, allRows(name)));
    }
  } else {
    // With Groups / Multiple+Groups: línea por (columna × nivel)
    const gv = groupCol.values;
    const distinct: string[] = [];
    for (const g of gv) {
      const s = String(g ?? "").trim() || "(blank)";
      if (!distinct.includes(s)) distinct.push(s);
    }
    for (const name of cols) {
      if (!data[name]) continue;
      for (const g of distinct) {
        const rows = data[name].values
          .map((_, i) => i)
          .filter(
            (i) => (String(gv[i] ?? "").trim() || "(blank)") === g
          );
        const label = cols.length > 1 ? `${name} / ${g}` : g;
        lines.push(makeLine(label, rows));
      }
    }
  }

  const title =
    cols.length === 1
      ? `Time Series Plot of ${cols[0]}`
      : `Time Series Plot of ${cols.join(", ")}`;
  const yTitle = cols.length === 1 ? cols[0] : "Value";
  const xTitle = params.timeCol ? params.timeCol : "Index";

  return {
    lines,
    hasSmoother: params.smoother,
    title,
    xTitle,
    yTitle,
    xIsCategoryTime: !!timeCol,
  };
}

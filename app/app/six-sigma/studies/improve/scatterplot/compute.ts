// app/app/six-sigma/studies/improve/scatterplot/compute.ts
import type { ColumnSnapshot } from "../../types";
import { leastSquares } from "../../../lib/scatterplot";
import {
  KIND_HAS_CONNECT,
  KIND_HAS_GROUPS,
  KIND_HAS_REGRESSION,
  type ImpScatterParams,
  type ImpScatterResult,
  type ScatterSeries,
} from "./types";

const cellNum = (c: number | string | null | undefined): number => {
  if (typeof c === "number") return c;
  if (typeof c !== "string") return NaN;
  const t = c.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

const cellText = (c: number | string | null | undefined): string =>
  c === null || c === undefined ? "" : String(c).trim();

const fail = (error: string): ImpScatterResult => ({ ok: false, error });

export function computeImpScatter(
  data: ColumnSnapshot,
  params: ImpScatterParams
): ImpScatterResult {
  const yCol = params.yColumn ? data[params.yColumn] : undefined;
  const xCol = params.xColumn ? data[params.xColumn] : undefined;
  if (!yCol || !xCol) {
    return fail("Select the Y and X variables.");
  }

  const needsGroups = KIND_HAS_GROUPS[params.kind];
  const gCol = needsGroups && params.groupColumn ? data[params.groupColumn] : undefined;
  if (needsGroups && !gCol) {
    return fail("This scatterplot type requires a grouping variable.");
  }

  // --- 1. Emparejar y descartar incompletos -------------------------------
  // Borrado por parejas: un punto necesita x, y, y grupo cuando aplique.
  const len = Math.max(yCol.values.length, xCol.values.length);
  const pts: { x: number; y: number; g: string }[] = [];
  let nMissing = 0;
  for (let i = 0; i < len; i++) {
    const xv = cellNum(xCol.values[i]);
    const yv = cellNum(yCol.values[i]);
    const gv = gCol ? cellText(gCol.values[i]) : "";
    const emptyRow =
      cellText(xCol.values[i]) === "" && cellText(yCol.values[i]) === "";
    if (!Number.isFinite(xv) || !Number.isFinite(yv) || (gCol && gv === "")) {
      // Las filas de relleno del grid no cuentan como datos perdidos.
      if (!emptyRow) nMissing++;
      continue;
    }
    pts.push({ x: xv, y: yv, g: gv });
  }

  if (pts.length < 2) {
    return fail("At least two complete observations are required.");
  }

  // --- 2. Dividir en series ----------------------------------------------
  const labels = gCol
    ? [...new Set(pts.map((p) => p.g))].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      )
    : [""];

  const wantFit = KIND_HAS_REGRESSION[params.kind];
  const wantConnect = KIND_HAS_CONNECT[params.kind];

  const series: ScatterSeries[] = labels.map((label) => {
    const sub = pts.filter((p) => (gCol ? p.g === label : true));
    // La linea de union recorre los puntos de izquierda a derecha. El orden
    // es estable, asi que los empates en x mantienen el orden de la hoja.
    const ord = wantConnect
      ? sub
          .map((p, i) => ({ p, i }))
          .sort((a, b) => a.p.x - b.p.x || a.i - b.i)
          .map((e) => e.p)
      : sub;
    const x = ord.map((p) => p.x);
    const y = ord.map((p) => p.y);
    return { label, x, y, fit: wantFit ? leastSquares(x, y) : null };
  });

  const allX = pts.map((p) => p.x);
  const allY = pts.map((p) => p.y);

  const xTitle = params.xColumn;
  const yTitle = params.yColumn;
  const title =
    params.title.trim() || `Scatterplot of ${yTitle} vs ${xTitle}`;

  return {
    ok: true,
    title,
    xTitle,
    yTitle,
    kind: params.kind,
    series,
    // Se calcula siempre: alimenta el pie con la ecuacion global aunque la
    // variante no dibuje ninguna recta.
    overallFit: leastSquares(allX, allY),
    n: pts.length,
    nMissing,
  };
}

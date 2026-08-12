// app/app/six-sigma/studies/ht/chisqassociation/compute.ts
import type { ColumnSnapshot } from "../../types";
import { chiSquareAssociation } from "../../../lib/chiSquareAssociation";
import type { HTChiSqAssocParams, HTChiSqAssocResult } from "./types";

const cellNum = (c: number | string | null | undefined): number => {
  if (typeof c === "number") return c;
  if (typeof c !== "string") return NaN;
  const t = c.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

const cellText = (c: number | string | null | undefined): string => {
  if (c === null || c === undefined) return "";
  return String(c).trim();
};

const fail = (error: string): HTChiSqAssocResult => ({ ok: false, error });

export function computeHTChiSqAssoc(
  data: ColumnSnapshot,
  params: HTChiSqAssocParams
): HTChiSqAssocResult {
  if (params.mode === "raw") {
    return computeRaw(data, params);
  }
  return computeSummarized(data, params);
}

/** Cada columna seleccionada es una columna de la tabla de contingencia. */
function computeSummarized(
  data: ColumnSnapshot,
  params: HTChiSqAssocParams
): HTChiSqAssocResult {
  const names = params.tableColumns.filter((n) => Boolean(data[n]));
  if (names.length < 2) {
    return fail("Select at least two columns to build the table.");
  }

  const cols = names.map((n) => data[n].values);
  const labelCol = params.rowLabelColumn ? data[params.rowLabelColumn] : undefined;

  // La tabla llega hasta la ultima fila con algun dato en las columnas
  // seleccionadas: las filas de relleno del grid se ignoran.
  let nRows = 0;
  const len = Math.max(...cols.map((c) => c.length));
  for (let i = 0; i < len; i++) {
    if (cols.some((c) => cellText(c[i]) !== "")) nRows = i + 1;
  }
  if (nRows < 2) {
    return fail("The table needs at least two rows of counts.");
  }

  const observed: number[][] = [];
  const rowLabels: string[] = [];
  for (let i = 0; i < nRows; i++) {
    const row: number[] = [];
    for (const c of cols) {
      const raw = cellText(c[i]);
      // Una celda vacia se lee como cero: es lo natural en una tabla de
      // recuentos parcialmente rellenada.
      const v = raw === "" ? 0 : cellNum(c[i]);
      if (!Number.isFinite(v) || v < 0 || !Number.isInteger(v)) {
        return fail(
          `Counts must be non-negative whole numbers. Check row ${i + 1}.`
        );
      }
      row.push(v);
    }
    observed.push(row);
    const lbl = labelCol ? cellText(labelCol.values[i]) : "";
    rowLabels.push(lbl || String(i + 1));
  }

  return chiSquareAssociation({
    rowTitle: params.rowTitle.trim() || "Worksheet rows",
    colTitle: params.colTitle.trim() || "Worksheet columns",
    rowLabels,
    colLabels: names,
    observed,
  });
}

/** Dos columnas categoricas, una fila por observacion. */
function computeRaw(
  data: ColumnSnapshot,
  params: HTChiSqAssocParams
): HTChiSqAssocResult {
  const rc = params.rowFactorColumn;
  const cc = params.colFactorColumn;
  const rowCol = rc ? data[rc] : undefined;
  const colCol = cc ? data[cc] : undefined;
  if (!rowCol || !colCol) {
    return fail("Select the row and column categorical variables.");
  }

  const len = Math.max(rowCol.values.length, colCol.values.length);
  const pairs: [string, string][] = [];
  let nMissing = 0;
  for (let i = 0; i < len; i++) {
    const a = cellText(rowCol.values[i]);
    const b = cellText(colCol.values[i]);
    if (a !== "" && b !== "") pairs.push([a, b]);
    else nMissing++;
  }
  if (pairs.length === 0) {
    return fail("No complete observations available.");
  }

  const rowLabels = [...new Set(pairs.map((p) => p[0]))].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  );
  const colLabels = [...new Set(pairs.map((p) => p[1]))].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  );
  const ri = new Map(rowLabels.map((l, i) => [l, i]));
  const ci = new Map(colLabels.map((l, i) => [l, i]));

  const observed = rowLabels.map(() => colLabels.map(() => 0));
  for (const [a, b] of pairs) {
    observed[ri.get(a) as number][ci.get(b) as number]++;
  }

  const res = chiSquareAssociation({
    rowTitle: params.rowTitle.trim() || rc,
    colTitle: params.colTitle.trim() || cc,
    rowLabels,
    colLabels,
    observed,
  });
  return res.ok ? { ...res, nMissing } : res;
}

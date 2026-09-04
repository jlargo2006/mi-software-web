// app/app/six-sigma/studies/ht/moodsmedian/compute.ts
import type { ColumnSnapshot } from "../../types";
import { moodsMedian } from "../../../lib/moodsMedian";
import type { HTMoodsMedianParams, HTMoodsMedianResult } from "./types";
import type { Cell } from "../../../lib/types";

const num = (s: string): number => {
  const t = s.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

const EMPTY = (msg: string): HTMoodsMedianResult =>
  moodsMedian({
    responseColumn: "",
    factorColumn: "",
    rawResponse: [],
    rawFactor: [],
    confLevel: NaN,
  });

export function computeHTMoodsMedian(
  data: ColumnSnapshot,
  params: HTMoodsMedianParams
): HTMoodsMedianResult {
  const confLevel = num(params.confidenceLevel);

  // ---------------- Formato unstacked: una columna por muestra -------------
  // Se sintetizan los arrays apilados que espera el motor y se reutiliza
  // moodsMedian sin cambios: mismo calculo, mismos CI, mismos graficos.
  if (params.format === "unstacked") {
    const cols = params.sampleColumns.filter((c) => c && data[c]);
    if (cols.length < 2) return EMPTY("");

    const rawResponse: Cell[] = [];
    const rawFactor: Cell[] = [];
    for (const c of cols) {
      const name = data[c].name;
      for (const v of data[c].values) {
        // En unstacked las columnas suelen tener longitudes distintas: las
        // celdas vacias son relleno, NO datos perdidos. Se descartan aqui
        // para que nMissing no cuente el desnivel entre columnas.
        if (String(v ?? "").trim() === "") continue;
        rawResponse.push(v);
        rawFactor.push(name);
      }
    }

    return moodsMedian({
      // Sin columna de respuesta unica: etiquetas genericas, como Minitab.
      responseColumn: "Data",
      factorColumn: "Sample",
      rawResponse,
      rawFactor,
      confLevel,
    });
  }

  // ---------------- Formato stacked: comportamiento de siempre -------------
  const cr = params.responseColumn;
  const cf = params.factorColumn;
  const resp = cr ? data[cr] : undefined;
  const fact = cf ? data[cf] : undefined;

  if (!cr || !cf || !resp || !fact) {
    return moodsMedian({
      responseColumn: cr ?? "",
      factorColumn: cf ?? "",
      rawResponse: [],
      rawFactor: [],
      confLevel: NaN,
    });
  }

  return moodsMedian({
    responseColumn: cr,
    factorColumn: cf,
    rawResponse: resp.values,
    rawFactor: fact.values,
    confLevel,
  });
}

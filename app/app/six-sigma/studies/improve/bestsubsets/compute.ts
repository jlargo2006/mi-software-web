// app/app/six-sigma/studies/improve/bestsubsets/compute.ts
import type { ColumnSnapshot } from "../../types";
import { olsFit } from "../../../lib/ols";
import {
  MAX_PREDICTORS,
  type ImpSubsetsParams,
  type ImpSubsetsResult,
  type SubsetRow,
} from "./types";

const cellNum = (c: number | string | null | undefined): number => {
  if (typeof c === "number") return c;
  if (typeof c !== "string") return NaN;
  const t = c.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

const cellText = (c: number | string | null | undefined): string =>
  c === null || c === undefined ? "" : String(c).trim();

const fail = (error: string): ImpSubsetsResult => ({ ok: false, error });

export function computeImpSubsets(
  data: ColumnSnapshot,
  params: ImpSubsetsParams
): ImpSubsetsResult {
  const resp = params.response.trim();
  if (resp === "") return fail("Select the response.");

  const preds = params.freePredictors.filter(
    (s) => s.trim() !== "" && s !== resp
  );
  if (preds.length < 1) return fail("Select at least one free predictor.");
  if (preds.length > MAX_PREDICTORS) {
    return fail(
      `Too many predictors (${preds.length}). The limit is ${MAX_PREDICTORS}.`
    );
  }

  const yCol = data[resp];
  if (!yCol) return fail(`Column "${resp}" does not exist.`);
  for (const name of preds) {
    if (!data[name]) return fail(`Column "${name}" does not exist.`);
  }

  const perSize = Number(params.modelsPerSize);
  if (!Number.isInteger(perSize) || perSize < 1 || perSize > 5) {
    return fail("Models of each size must be a whole number from 1 to 5.");
  }

  // --- 1. Filas completas ---------------------------------------------------
  // Se descarta la fila entera si falta cualquier valor: todos los modelos han
  // de compararse sobre los mismos datos, o los criterios no serian
  // equiparables entre subconjuntos.
  const len = Math.max(
    yCol.values.length,
    ...preds.map((nm) => data[nm].values.length)
  );
  const y: number[] = [];
  const X: number[][] = preds.map(() => []);
  let nMissing = 0;

  for (let i = 0; i < len; i++) {
    const yv = cellNum(yCol.values[i]);
    const xs = preds.map((nm) => cellNum(data[nm].values[i]));
    if (!Number.isFinite(yv) || xs.some((v) => !Number.isFinite(v))) {
      const blank =
        cellText(yCol.values[i]) === "" &&
        preds.every((nm) => cellText(data[nm].values[i]) === "");
      if (!blank) nMissing++;
      continue;
    }
    y.push(yv);
    xs.forEach((v, j) => X[j].push(v));
  }

  const n = y.length;
  const k = preds.length;
  if (n < k + 3) {
    return fail(
      `At least ${k + 3} complete rows are required for ${k} predictor(s).`
    );
  }

  const my = y.reduce((a, b) => a + b, 0) / n;
  const sst = y.reduce((a, v) => a + (v - my) * (v - my), 0);
  if (!(sst > 0)) return fail("The response is constant: nothing to model.");

  // --- 2. Modelo completo, referencia del Cp -------------------------------
  // El Cp compara cada subconjunto con el error del modelo que lleva TODOS los
  // predictores libres. Sin ese modelo no hay escala de comparacion.
  const full = olsFit(X, y);
  if (!full) {
    return fail(
      "The full model is not estimable: some predictors are collinear."
    );
  }
  const mseFull = full.mse;

  // --- 3. Todos los subconjuntos -------------------------------------------
  const all: SubsetRow[] = [];
  let nSkipped = 0;
  const total = 1 << k;

  for (let mask = 1; mask < total; mask++) {
    const members: number[] = [];
    for (let j = 0; j < k; j++) if (mask & (1 << j)) members.push(j);

    const fit = olsFit(
      members.map((j) => X[j]),
      y
    );
    if (!fit) {
      nSkipped++;
      continue;
    }

    const r2 = 1 - fit.sse / sst;
    all.push({
      vars: members.length,
      members,
      r2: 100 * r2,
      r2adj: 100 * (1 - fit.sse / fit.dfError / (sst / (n - 1))),
      r2pred: 100 * (1 - fit.press / sst),
      cp: fit.sse / mseFull - (n - 2 * fit.p),
      s: Math.sqrt(fit.mse),
      p: fit.p,
    });
  }

  if (all.length === 0) {
    return fail("No subset could be fitted with these data.");
  }

  // --- 4. Los mejores de cada tamano ---------------------------------------
  // El criterio de seleccion dentro de un tamano es el R-Sq. Con el mismo
  // numero de terminos, R-Sq y R-Sq(adj) ordenan igual, asi que la eleccion
  // no es discutible aqui; entre tamanos distintos si lo seria.
  const rows: SubsetRow[] = [];
  const bestBySize: SubsetRow[] = [];
  for (let size = 1; size <= k; size++) {
    const sub = all
      .filter((r) => r.vars === size)
      .sort((a, b) => b.r2 - a.r2);
    if (sub.length === 0) continue;
    bestBySize.push(sub[0]);
    rows.push(...sub.slice(0, perSize));
  }

  // --- 5. Recomendacion -----------------------------------------------------
  // Un modelo sin sesgo aprecialbe tiene Cp proximo a p. Se elige, entre los
  // que cumplen Cp <= p, el de menos terminos; si ninguno cumple, el de menor
  // distancia a p.
  const unbiased = all.filter((r) => r.cp <= r.p);
  let recommended: SubsetRow | null = null;
  if (unbiased.length > 0) {
    recommended = unbiased.reduce((best, r) =>
      r.p < best.p || (r.p === best.p && r.cp < best.cp) ? r : best
    );
  } else {
    recommended = all.reduce((best, r) =>
      Math.abs(r.cp - r.p) < Math.abs(best.cp - best.p) ? r : best
    );
  }

  return {
    ok: true,
    response: resp,
    predictors: preds,
    rows,
    bestBySize,
    n,
    nMissing,
    nEvaluated: all.length,
    nSkipped,
    recommended,
  };
}

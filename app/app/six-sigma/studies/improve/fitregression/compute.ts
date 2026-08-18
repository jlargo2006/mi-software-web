// app/app/six-sigma/studies/improve/fitregression/compute.ts
import type { ColumnSnapshot } from "../../types";
import { multiRegressionFit } from "../../../lib/multiregression";
import {
  MAX_PREDICTORS,
  VIF_SEVERE,
  VIF_WARN,
  type FitRegAdvice,
  type FitRegUnusual,
  type ImpFitRegParams,
  type ImpFitRegResult,
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

const fail = (error: string): ImpFitRegResult => ({ ok: false, error });

const dec3 = (v: number): string => v.toFixed(3).replace(".", ",");
const dec2 = (v: number): string => v.toFixed(2).replace(".", ",");

/**
 * Decimales de un coeficiente: los que dan TRES cifras significativas a su
 * error tipico. Es la regla que reproduce las salidas de referencia, donde la
 * constante sale como 770 con SE 230, pero como 1101,0 con SE 90,0.
 */
export const coefDecimals = (se: number): number => {
  if (!Number.isFinite(se) || !(Math.abs(se) > 0)) return 4;
  return Math.max(0, Math.min(8, 2 - Math.floor(Math.log10(Math.abs(se)))));
};

/** Posiciones de Blom, las del grafico de probabilidad normal. */
export const blomPositions = (n: number): number[] =>
  Array.from({ length: n }, (_, i) => (i + 1 - 0.375) / (n + 0.25));

export function computeImpFitReg(
  data: ColumnSnapshot,
  params: ImpFitRegParams
): ImpFitRegResult {
  const resp = params.response.trim();
  if (resp === "") return fail("Select the response.");

  const preds = params.predictors.filter((s) => s.trim() !== "" && s !== resp);
  if (preds.length < 1) return fail("Select at least one continuous predictor.");
  if (preds.length > MAX_PREDICTORS) {
    return fail(`Too many predictors. The limit is ${MAX_PREDICTORS}.`);
  }

  const yCol = data[resp];
  if (!yCol) return fail(`Column "${resp}" does not exist.`);
  for (const nm of preds) {
    if (!data[nm]) return fail(`Column "${nm}" does not exist.`);
  }

  const confLevel = num(params.confidenceLevel);
  if (!(confLevel > 0 && confLevel < 100)) {
    return fail("The confidence level must be between 0 and 100.");
  }
  const alpha = num(params.alpha);
  if (!(alpha > 0 && alpha < 1)) return fail("Alpha must be between 0 and 1.");

  // --- Filas completas ------------------------------------------------------
  // Si falta cualquier valor la fila se descarta entera: los terminos han de
  // compararse sobre los mismos datos.
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
  if (n < preds.length + 3) {
    return fail(
      `At least ${preds.length + 3} complete rows are required for ${preds.length} predictor(s).`
    );
  }

  const my = y.reduce((a, b) => a + b, 0) / n;
  if (!(y.reduce((a, v) => a + (v - my) * (v - my), 0) > 0)) {
    return fail("The response is constant: there is nothing to model.");
  }

  const fit = multiRegressionFit(X, y, preds);
  if (!fit) {
    return fail(
      "The model is not estimable: two or more predictors are exactly collinear."
    );
  }

  // --- Ecuacion -------------------------------------------------------------
  // Cada coeficiente lleva los decimales que fija su error tipico, para que la
  // ecuacion y la tabla digan exactamente lo mismo.
  let equation = `${resp} = ${fit.constant.coef
    .toFixed(coefDecimals(fit.constant.se))
    .replace(".", ",")}`;
  for (const t of fit.terms) {
    const d = coefDecimals(t.se);
    equation += ` ${t.coef < 0 ? "-" : "+"} ${Math.abs(t.coef)
      .toFixed(d)
      .replace(".", ",")} ${t.name}`;
  }

  // --- Observaciones inusuales ---------------------------------------------
  const leverageLimit = Math.min(0.99, (3 * fit.p) / n);
  const unusual: FitRegUnusual[] = [];
  for (let i = 0; i < n; i++) {
    const large = Math.abs(fit.stdResid[i]) > 2;
    const highX = fit.leverage[i] > leverageLimit;
    if (!large && !highX) continue;
    unusual.push({
      obs: i + 1,
      y: y[i],
      fit: fit.fitted[i],
      resid: fit.resid[i],
      stdResid: fit.stdResid[i],
      largeResid: large,
      unusualX: highX,
    });
  }

  return {
    ok: true,
    response: resp,
    predictors: preds,
    fit,
    equation,
    unusual,
    leverageLimit,
    advice: buildAdvice(fit.terms, preds, alpha),
    alpha,
    confLevel,
    n,
    nMissing,
  };
}

/**
 * Motor de consejos. El orden importa: PRIMERO la colinealidad y despues la
 * significacion, porque un VIF alto infla el error tipico, hunde el
 * estadistico T y sube el p-valor. Podar por p-valor sin mirar el VIF lleva a
 * retirar el termino equivocado.
 */
function buildAdvice(
  terms: { name: string; vif: number; p: number }[],
  preds: string[],
  alpha: number
): FitRegAdvice {
  const without = (nm: string) => preds.filter((s) => s !== nm);
  const worstVif = terms.reduce((a, b) => (b.vif > a.vif ? b : a));
  const worstP = terms.reduce((a, b) => (b.p > a.p ? b : a));
  const al = alpha.toString().replace(".", ",");

  if (worstVif.vif >= VIF_SEVERE) {
    return {
      kind: "vifSevere",
      term: worstVif.name,
      headline: `Remove ${worstVif.name}: VIF is ${
        Number.isFinite(worstVif.vif) ? dec2(worstVif.vif) : "\u221e"
      }`,
      detail:
        `A VIF above ${VIF_SEVERE} means this predictor is almost a linear combination of ` +
        `the others. Its coefficient is unreliable and its sign can flip with a single new ` +
        `observation. Remove it and refit before reading any p-value.`,
      nextPredictors: without(worstVif.name),
    };
  }

  if (worstVif.vif >= VIF_WARN) {
    return {
      kind: "vifWarn",
      term: worstVif.name,
      headline: `Remove ${worstVif.name}: VIF is ${dec2(worstVif.vif)}`,
      detail:
        `A VIF between ${VIF_WARN} and ${VIF_SEVERE} means the regression coefficient is ` +
        `poorly estimated and unacceptable. Deal with collinearity first: while a variance ` +
        `is inflated the p-values cannot be trusted.`,
      nextPredictors: without(worstVif.name),
    };
  }

  if (terms.length === 1 && worstP.p > alpha) {
    return {
      kind: "singleTerm",
      term: null,
      headline: `${worstP.name} is not significant`,
      detail:
        `The only predictor has p = ${dec3(worstP.p)}, above ${al}. There is no evidence of ` +
        `a linear relationship. Removing it would leave no model: look for other predictors, ` +
        `or for a non-linear relationship in the matrix plot.`,
      nextPredictors: [],
    };
  }

  if (worstP.p > alpha) {
    return {
      kind: "notSignificant",
      term: worstP.name,
      headline: `Remove ${worstP.name}: p-value is ${dec3(worstP.p)}`,
      detail:
        `Every VIF is below ${VIF_WARN}, so collinearity is under control and the p-values ` +
        `can be read. This is the least significant term and it does not reach ${al}. ` +
        `Remove one term at a time: the others change when it goes.`,
      nextPredictors: without(worstP.name),
    };
  }

  return {
    kind: "final",
    term: null,
    headline: "Every term is significant and no VIF is a concern",
    detail:
      `All p-values are below ${al} and every VIF is under ${VIF_WARN}. There is nothing ` +
      `left to drop on statistical grounds. Check the residual plots now, and confirm that ` +
      `the surviving terms make engineering sense.`,
    nextPredictors: preds,
  };
}

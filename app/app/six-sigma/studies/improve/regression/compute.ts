// app/app/six-sigma/studies/improve/regression/compute.ts
import type { ColumnSnapshot } from "../../types";
import {
  coefText,
  fSf,
  normalInv,
  polyFit,
  predictAt,
  tQuantile,
  type PolyFit,
} from "../../../lib/regression";
import {
  DEGREE_ORDER,
  type AnovaRow,
  type CurvePoint,
  type ImpRegParams,
  type ImpRegResult,
  type SeqRow,
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

const fail = (error: string): ImpRegResult => ({ ok: false, error });

/** Texto de la ecuacion ajustada, al estilo del informe de Minitab. */
function buildEquation(coefs: number[], yName: string, xName: string): string {
  let out = `${yName} = ${coefs[0] < 0 ? "- " : ""}${coefText(
    Math.abs(coefs[0])
  )}`;
  for (let k = 1; k < coefs.length; k++) {
    const c = coefs[k];
    const term = k === 1 ? xName : `${xName}^${k}`;
    out += ` ${c < 0 ? "-" : "+"} ${coefText(Math.abs(c))} ${term}`;
  }
  return out;
}

export function computeImpReg(
  data: ColumnSnapshot,
  params: ImpRegParams
): ImpRegResult {
  const yCol = params.yColumn ? data[params.yColumn] : undefined;
  const xCol = params.xColumn ? data[params.xColumn] : undefined;
  if (!yCol || !xCol) {
    return fail("Select the response (Y) and predictor (X).");
  }
  if (params.yColumn === params.xColumn) {
    return fail("The response and the predictor must be different columns.");
  }

  const confLevel = num(params.confidenceLevel);
  if (!(confLevel > 0 && confLevel < 100)) {
    return fail("The confidence level must be between 0 and 100.");
  }

  // --- 1. Emparejar -------------------------------------------------------
  const len = Math.max(yCol.values.length, xCol.values.length);
  const pts: { x: number; y: number; k: number }[] = [];
  let nMissing = 0;
  for (let i = 0; i < len; i++) {
    const xv = cellNum(xCol.values[i]);
    const yv = cellNum(yCol.values[i]);
    if (!Number.isFinite(xv) || !Number.isFinite(yv)) {
      // Las filas de relleno del grid no cuentan como datos perdidos.
      const emptyRow =
        cellText(xCol.values[i]) === "" && cellText(yCol.values[i]) === "";
      if (!emptyRow) nMissing++;
      continue;
    }
    pts.push({ x: xv, y: yv, k: pts.length + 1 });
  }

  const order = DEGREE_ORDER[params.degree];
  if (pts.length < order + 2) {
    return fail(
      `At least ${order + 2} complete observations are required for this model.`
    );
  }

  // Se ordena por x: la curva ajustada y las bandas se dibujan en ese orden.
  pts.sort((a, b) => a.x - b.x || a.k - b.k);
  const x = pts.map((p) => p.x);
  const y = pts.map((p) => p.y);

  // --- 2. Ajuste ----------------------------------------------------------
  const fit = polyFit(x, y, order);
  if (!fit) {
    return fail(
      "The model cannot be fitted: too few distinct X values for this degree."
    );
  }
  if (!(fit.sst > 0)) {
    return fail("The response is constant: no variability to model.");
  }

  const n = fit.n;
  const alpha = 1 - confLevel / 100;
  const tc = tQuantile(1 - alpha / 2, fit.dfError);

  // --- 3. ANOVA -----------------------------------------------------------
  const anova: AnovaRow[] = [
    {
      source: "Regression",
      df: fit.dfModel,
      ss: fit.ssr,
      ms: fit.ssr / fit.dfModel,
      fValue: fit.fValue,
      pValue: fit.pValue,
    },
    {
      source: "Error",
      df: fit.dfError,
      ss: fit.sse,
      ms: fit.mse,
      fValue: NaN,
      pValue: NaN,
    },
    {
      source: "Total",
      df: fit.dfTotal,
      ss: fit.sst,
      ms: NaN,
      fValue: NaN,
      pValue: NaN,
    },
  ];

  // --- 4. ANOVA secuencial ------------------------------------------------
  // Cada fila mide lo que aporta su termino sobre el modelo anterior, y se
  // contrasta con el MSE de su propio modelo, no con el del modelo completo.
  const sequential: SeqRow[] = [];
  if (order >= 2) {
    const names = ["Linear", "Quadratic", "Cubic"];
    let prevSsr = 0;
    for (let d = 1; d <= order; d++) {
      const f: PolyFit | null = d === order ? fit : polyFit(x, y, d);
      if (!f) break;
      const extra = f.ssr - prevSsr;
      const fv = f.mse > 0 ? extra / f.mse : NaN;
      sequential.push({
        source: names[d - 1],
        df: 1,
        ss: extra,
        fValue: fv,
        pValue: Number.isFinite(fv) ? fSf(fv, 1, f.dfError) : NaN,
      });
      prevSsr = f.ssr;
    }
  }

  // --- 5. Curva y bandas --------------------------------------------------
  const xMin = x[0];
  const xMax = x[n - 1];
  const steps = 120;
  const curve: CurvePoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const xv = xMin + ((xMax - xMin) * i) / steps;
    const { fit: yh, seFit } = predictAt(fit, xv);
    const sePred = Math.sqrt(fit.mse + seFit * seFit);
    curve.push({
      x: xv,
      fit: yh,
      ciLow: yh - tc * seFit,
      ciHigh: yh + tc * seFit,
      piLow: yh - tc * sePred,
      piHigh: yh + tc * sePred,
    });
  }

  // --- 6. Prediccion puntual ----------------------------------------------
  let prediction = null;
  const px = params.predictX.trim();
  if (px !== "") {
    const xv = num(px);
    if (!Number.isFinite(xv)) {
      return fail("The prediction value must be a number.");
    }
    const { fit: yh, seFit } = predictAt(fit, xv);
    const sePred = Math.sqrt(fit.mse + seFit * seFit);
    prediction = {
      x: xv,
      fit: yh,
      seFit,
      ciLow: yh - tc * seFit,
      ciHigh: yh + tc * seFit,
      piLow: yh - tc * sePred,
      piHigh: yh + tc * sePred,
      extrapolated: xv < xMin || xv > xMax,
    };
  }

  // --- 7. Residuos estandarizados -----------------------------------------
  // Se dividen por s * raiz(1 - h), con h la palanca de cada punto, de modo
  // que todos comparten varianza teorica 1.
  const stdResiduals = x.map((xv, i) => {
    const { seFit } = predictAt(fit, xv);
    const h = fit.mse > 0 ? (seFit * seFit) / fit.mse : 0;
    const den = fit.s * Math.sqrt(Math.max(1e-12, 1 - h));
    return fit.residuals[i] / den;
  });

  return {
    ok: true,
    yTitle: params.yColumn,
    xTitle: params.xColumn,
    degree: params.degree,
    order,
    coefs: fit.coefs,
    equation: buildEquation(fit.coefs, params.yColumn, params.xColumn),
    n,
    nMissing,
    confLevel,
    s: fit.s,
    r2: fit.r2,
    r2adj: fit.r2adj,
    anova,
    sequential,
    x,
    y,
    fitted: fit.fitted,
    residuals: fit.residuals,
    stdResiduals,
    order_: pts.map((p) => p.k),
    curve,
    prediction,
  };
}

/** Puntuaciones normales de Blom, para el grafico de probabilidad. */
export function blomScores(n: number): number[] {
  return Array.from({ length: n }, (_, i) =>
    normalInv((i + 1 - 0.375) / (n + 0.25))
  );
}

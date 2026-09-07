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
  type RefLineInfo,
  type RefPoint,
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

/** Series dibujables de la curva, y su rotulo en el hover. */
type SeriesKey = "fit" | "ciLow" | "ciHigh" | "piLow" | "piHigh";

const SERIES_LABEL: Record<SeriesKey, string> = {
  fit: "Fitted",
  ciLow: "CI Lower",
  ciHigh: "CI Upper",
  piLow: "PI Lower",
  piHigh: "PI Upper",
};

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

  // --- 6b. Linea de referencia --------------------------------------------
  let refLine: RefLineInfo | null = null;
  const rvText = params.refValue.trim();
  if (params.refLine !== "none" && rvText !== "") {
    const v = num(rvText);
    if (!Number.isFinite(v)) {
      return fail("The reference line value must be a number.");
    }

    // Solo se cortan las curvas visibles: sin banda dibujada no hay
    // interseccion que mostrar.
    const keys: SeriesKey[] = ["fit"];
    if (params.showCI) keys.push("ciLow", "ciHigh");
    if (params.showPI) keys.push("piLow", "piHigh");

    const points: RefPoint[] = [];

    if (params.refLine === "vertical") {
      // Una interseccion por serie como mucho, y se calcula con el modelo,
      // no interpolando la poligonal: es exacta, igual que Predict at X.
      // Fuera del rango observado no se dibuja nada, asi que tampoco se
      // marcan cortes que no se verian.
      if (v >= xMin && v <= xMax) {
        const { fit: yh, seFit } = predictAt(fit, v);
        const sePred = Math.sqrt(fit.mse + seFit * seFit);
        const at: Record<SeriesKey, number> = {
          fit: yh,
          ciLow: yh - tc * seFit,
          ciHigh: yh + tc * seFit,
          piLow: yh - tc * sePred,
          piHigh: yh + tc * sePred,
        };
        for (const k of keys) {
          points.push({ series: SERIES_LABEL[k], x: v, y: at[k] });
        }
      }
    } else {
      // Horizontal: puede cortar cada serie mas de una vez con grado 2 o 3,
      // o ninguna. Se busca cambio de signo sobre los puntos de la curva y
      // se interpola dentro del segmento.
      for (const k of keys) {
        for (let i = 1; i < curve.length; i++) {
          const a = curve[i - 1];
          const b = curve[i];
          const da = a[k] - v;
          const db = b[k] - v;
          if (da === 0) {
            points.push({ series: SERIES_LABEL[k], x: a.x, y: v });
            continue;
          }
          if (da * db < 0) {
            const t = da / (da - db);
            points.push({
              series: SERIES_LABEL[k],
              x: a.x + t * (b.x - a.x),
              y: v,
            });
          }
        }
        // El ultimo punto no lo cubre el bucle: se comprueba aparte para no
        // perder un corte que caiga justo en el extremo derecho.
        const last = curve[curve.length - 1];
        if (last[k] === v) {
          points.push({ series: SERIES_LABEL[k], x: last.x, y: v });
        }
      }
    }

    refLine = { mode: params.refLine, value: v, points };
  }
  
  // --- 7. Residuos tipificados --------------------------------------------
  // La palanca h mide cuanto pesa cada punto en su propio ajuste. Sale de
  // la varianza del valor ajustado, ya calculada por predictAt.
  const leverage = x.map((xv) => {
    const { seFit } = predictAt(fit, xv);
    return fit.mse > 0 ? (seFit * seFit) / fit.mse : 0;
  });

  // Estandarizado: residuo entre su propio error tipico. Todos comparten
  // varianza teorica 1, asi que son comparables entre si.
  const stdResiduals = fit.residuals.map((e, i) => {
    const den = fit.s * Math.sqrt(Math.max(1e-12, 1 - leverage[i]));
    return e / den;
  });

  // Eliminado: el mismo cociente pero con la varianza del error estimada
  // SIN esa observacion. Se obtiene de la identidad
  //   s(i)^2 = ((n-p)*MSE - e^2/(1-h)) / (n-p-1)
  // que evita reajustar el modelo n veces. Detecta puntos influyentes que
  // el estandarizado disimula, porque un atipico infla el MSE que lo divide.
  const dfDel = fit.dfError - 1;
  const delResiduals = fit.residuals.map((e, i) => {
    const h = leverage[i];
    const om = Math.max(1e-12, 1 - h);
    if (dfDel <= 0) return NaN;
    const s2i = (fit.dfError * fit.mse - (e * e) / om) / dfDel;
    if (!(s2i > 0)) return NaN;
    return e / Math.sqrt(s2i * om);
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
    delResiduals,
    leverage,
    order_: pts.map((p) => p.k),
    curve,
    prediction,
    refLine,
  };
}

/** Puntuaciones normales de Blom, para el grafico de probabilidad. */
export function blomScores(n: number): number[] {
  return Array.from({ length: n }, (_, i) =>
    normalInv((i + 1 - 0.375) / (n + 0.25))
  );
}

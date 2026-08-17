// app/app/six-sigma/studies/doe/factorial/optimizer/compute.ts
import type { ColumnSnapshot } from "../../../types";
import { multiRegressionFit } from "../../../../lib/multiregression";
import { tQuantile } from "../../../../lib/regression";
import {
  buildTerms,
  parentKeys,
  termColumn,
  type Term,
} from "../../../../lib/factorialmodel";
import {
  compositeDesirability,
  desirability,
  desirabilityCurve,
  type GoalSpec,
} from "../../../../lib/desirability";
import {
  MAX_FACTORS,
  MAX_RESPONSES,
  type DoeOptModel,
  type DoeOptParams,
  type DoeOptResult,
  type FactorSetting,
  type ResponseModel,
  type ResponsePrediction,
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

const fail = (error: string): DoeOptResult => ({ ok: false, error });

/** Etiqueta de un nivel codificado en unidades reales. */
const decodeLabel = (f: FactorSetting, coded: number): string => {
  if (f.text) {
    if (coded <= -0.999) return f.levels[0];
    if (coded >= 0.999) return f.levels[1];
    return `${f.levels[0]}/${f.levels[1]}`;
  }
  const v = f.center + coded * f.half;
  return String(Number(v.toFixed(6))).replace(".", ",");
};

export function computeDoeOpt(
  data: ColumnSnapshot,
  params: DoeOptParams
): DoeOptResult {
  // --- Respuestas -----------------------------------------------------------
  const respNames = params.responses.filter((s) => s.trim() !== "");
  if (respNames.length === 0) return fail("Select at least one response.");
  if (respNames.length > MAX_RESPONSES) {
    return fail(`Too many responses. The limit is ${MAX_RESPONSES}.`);
  }

  const facNames = params.factors.filter(
    (s) => s.trim() !== "" && !respNames.includes(s)
  );
  if (facNames.length < 1) return fail("Select at least one factor.");
  if (facNames.length > MAX_FACTORS) {
    return fail(`Too many factors. The limit is ${MAX_FACTORS}.`);
  }

  for (const nm of [...respNames, ...facNames]) {
    if (!data[nm]) return fail(`Column "${nm}" does not exist.`);
  }

  const confLevel = num(params.confidenceLevel);
  if (!(confLevel > 0 && confLevel < 100)) {
    return fail("The confidence level must be between 0 and 100.");
  }
  const alphaCI = 1 - confLevel / 100;

  const maxOrder = num(params.maxOrder);
  if (!Number.isInteger(maxOrder) || maxOrder < 1 || maxOrder > 6) {
    return fail("The model order must be a whole number from 1 to 6.");
  }

  // --- Especificaciones de cada respuesta -----------------------------------
  const specs: GoalSpec[] = [];
  for (const nm of respNames) {
    const s = params.setups.find((x) => x.column === nm);
    if (!s) return fail(`Response "${nm}" has no goal configured.`);

    const lower = num(s.lower);
    const target = num(s.target);
    const upper = num(s.upper);
    const weight = num(s.weight);
    const importance = num(s.importance);

    if (!(weight > 0)) return fail(`Weight for "${nm}" must be greater than zero.`);
    if (!(importance > 0)) {
      return fail(`Importance for "${nm}" must be greater than zero.`);
    }

    if (s.goal === "maximize") {
      if (!Number.isFinite(lower) || !Number.isFinite(target)) {
        return fail(`To maximize "${nm}", give both a lower bound and a target.`);
      }
      if (!(target > lower)) {
        return fail(`For "${nm}" the target must be above the lower bound.`);
      }
    } else if (s.goal === "minimize") {
      if (!Number.isFinite(target) || !Number.isFinite(upper)) {
        return fail(`To minimize "${nm}", give both a target and an upper bound.`);
      }
      if (!(upper > target)) {
        return fail(`For "${nm}" the upper bound must be above the target.`);
      }
    } else if (s.goal === "target") {
      if (
        !Number.isFinite(lower) ||
        !Number.isFinite(target) ||
        !Number.isFinite(upper)
      ) {
        return fail(`To hit a target on "${nm}", give lower, target and upper.`);
      }
      if (!(lower < target && target < upper)) {
        return fail(`For "${nm}" the bounds must satisfy lower < target < upper.`);
      }
    }

    specs.push({ goal: s.goal, lower, target, upper, weight, importance });
  }

  if (specs.every((s) => s.goal === "none")) {
    return fail("Every response is set to 'Do not optimize': there is nothing to solve.");
  }

  // --- Filas completas ------------------------------------------------------
  // Se exige que TODAS las respuestas y factores tengan valor: los modelos han
  // de compararse sobre las mismas corridas.
  const len = Math.max(
    ...respNames.map((nm) => data[nm].values.length),
    ...facNames.map((nm) => data[nm].values.length)
  );
  const ys: number[][] = respNames.map(() => []);
  const rawLevels: string[][] = facNames.map(() => []);
  let nMissing = 0;

  for (let i = 0; i < len; i++) {
    const yvs = respNames.map((nm) => cellNum(data[nm].values[i]));
    const texts = facNames.map((nm) => cellText(data[nm].values[i]));
    const allBlank =
      respNames.every((nm) => cellText(data[nm].values[i]) === "") &&
      texts.every((t) => t === "");
    if (allBlank) continue;
    if (yvs.some((v) => !Number.isFinite(v)) || texts.some((t) => t === "")) {
      nMissing++;
      continue;
    }
    yvs.forEach((v, j) => ys[j].push(v));
    texts.forEach((t, j) => rawLevels[j].push(t));
  }

  const n = ys[0].length;
  if (n < 4) return fail("Not enough complete runs to fit a model.");

  // --- Codificacion ---------------------------------------------------------
  const settings: FactorSetting[] = [];
  const coded: number[][] = [];

  for (let j = 0; j < facNames.length; j++) {
    const uniq = [...new Set(rawLevels[j])];
    if (uniq.length < 2) return fail(`Factor "${facNames[j]}" has a single level.`);
    if (uniq.length > 2) {
      return fail(
        `Factor "${facNames[j]}" has ${uniq.length} levels. This optimizer works on ` +
          `two-level factorial models.`
      );
    }
    const allNum = uniq.every((s) => Number.isFinite(cellNum(s)));
    uniq.sort((a, b) =>
      allNum ? cellNum(a) - cellNum(b) : a.localeCompare(b, undefined, { numeric: true })
    );
    const center = allNum ? (cellNum(uniq[0]) + cellNum(uniq[1])) / 2 : 0;
    const half = allNum ? (cellNum(uniq[1]) - cellNum(uniq[0])) / 2 : 1;
    if (allNum && !(half > 0)) {
      return fail(`Factor "${facNames[j]}" has two identical levels.`);
    }
    settings.push({
      name: facNames[j],
      coded: 0,
      label: "",
      text: !allNum,
      levels: uniq,
      center,
      half,
      held: false,
    });
    coded.push(rawLevels[j].map((s) => (s === uniq[0] ? -1 : 1)));
  }

  // --- Restricciones: factores fijados --------------------------------------
  const holdCoded = new Map<number, number>();
  for (const h of params.holds) {
    const idx = facNames.indexOf(h.factor);
    if (idx < 0) continue;
    const txt = h.value.trim();
    if (txt === "") continue;
    const f = settings[idx];
    let c: number;
    if (f.text) {
      if (txt === f.levels[0]) c = -1;
      else if (txt === f.levels[1]) c = 1;
      else {
        return fail(
          `"${txt}" is not a level of "${h.factor}". Use ${f.levels.join(" or ")}.`
        );
      }
    } else {
      const v = num(txt);
      if (!Number.isFinite(v)) {
        return fail(`The hold value for "${h.factor}" is not a number.`);
      }
      c = (v - f.center) / f.half;
      if (c < -1.0001 || c > 1.0001) {
        return fail(
          `The hold value ${txt} for "${h.factor}" is outside the tested range ` +
            `${f.levels[0]} to ${f.levels[1]}. The model cannot be extrapolated.`
        );
      }
      c = Math.max(-1, Math.min(1, c));
    }
    holdCoded.set(idx, c);
    settings[idx].held = true;
  }

  if (holdCoded.size === facNames.length) {
    return fail("Every factor is held: there is nothing left to optimize.");
  }

  // --- Terminos y modelos ---------------------------------------------------
  const allTerms = buildTerms(facNames, maxOrder);
  const excluded = new Set(params.excluded);
  const active = allTerms.filter((t) => !excluded.has(t.key));
  if (active.length === 0) return fail("Every term has been removed from the model.");

  const activeKeys = new Set(active.map((t) => t.key));
  for (const t of active) {
    const missing = parentKeys(t, facNames).filter((p) => !activeKeys.has(p));
    if (missing.length > 0) {
      return fail(
        `The model is not hierarchical: "${t.key}" is in, but ${missing
          .map((m) => `"${m}"`)
          .join(", ")} ${missing.length === 1 ? "is" : "are"} out.`
      );
    }
  }

  const X = active.map((t) => termColumn(coded, t));
  const models: ResponseModel[] = [];

  for (let j = 0; j < respNames.length; j++) {
    const fit = multiRegressionFit(X, ys[j], active.map((t) => t.key));
    if (!fit) {
      return fail(
        `The model for "${respNames[j]}" is not estimable: some terms are aliased. ` +
          `Lower the model order.`
      );
    }
    if (fit.errDF < 1) {
      return fail(
        "The model is saturated: no degrees of freedom left for error, so no " +
          "confidence or prediction interval can be computed. Remove terms, or add replicates."
      );
    }
    models.push({
      column: respNames[j],
      spec: specs[j],
      fit,
      terms: active,
      coefs: [fit.constant.coef, ...fit.terms.map((t) => t.coef)],
      s: fit.s,
      errDF: fit.errDF,
      r2: fit.r2,
      weakTerms: fit.terms.filter((t) => t.p > 0.05).map((t) => t.name),
    });
  }

  // --- Prediccion en un punto codificado ------------------------------------
  const designRow = (pt: number[]): number[] => [
    1,
    ...active.map((t) => {
      let v = 1;
      for (const m of t.members) v *= pt[m];
      return v;
    }),
  ];

  const predictAt = (m: ResponseModel, pt: number[]): number => {
    const row = designRow(pt);
    let v = 0;
    for (let i = 0; i < row.length; i++) v += row[i] * m.coefs[i];
    return v;
  };

  const compositeAt = (pt: number[]): number => {
    const ds = models.map((m) => desirability(predictAt(m, pt), m.spec));
    return compositeDesirability(
      ds,
      models.map((m) => m.spec.importance)
    );
  };

  // --- Optimizacion ---------------------------------------------------------
  // Con variables codificadas el modelo es MULTILINEAL: fijadas todas menos
  // una, la respuesta es lineal en esa. Por eso, con una sola respuesta, el
  // optimo cae siempre en un vertice del cubo y basta enumerarlos. Con varias
  // respuestas la deseabilidad compuesta ya no es monotona y el optimo puede
  // quedar en el interior de una arista, asi que se refina despues.
  const k = facNames.length;
  const free = Array.from({ length: k }, (_, i) => i).filter(
    (i) => !holdCoded.has(i)
  );

  let best: number[] | null = null;
  let bestD = -1;
  let ties = 0;
  const TOL = 1e-9;

  const total = 1 << free.length;
  for (let mask = 0; mask < total; mask++) {
    const pt = new Array<number>(k).fill(0);
    holdCoded.forEach((v, i) => (pt[i] = v));
    free.forEach((fi, b) => (pt[fi] = mask & (1 << b) ? 1 : -1));
    const d = compositeAt(pt);
    if (!Number.isFinite(d)) continue;
    if (d > bestD + TOL) {
      bestD = d;
      best = pt;
      ties = 1;
    } else if (Math.abs(d - bestD) <= TOL) {
      ties++;
    }
  }

  if (best === null) {
    return fail(
      "No setting reaches a positive desirability. The bounds may be outside " +
        "everything the model can produce: check the lower, target and upper values."
    );
  }

  // Refinamiento por coordenadas, solo sobre los factores numericos libres.
  // Un factor de texto no admite valores intermedios.
  const numericFree = free.filter((i) => !settings[i].text);
  let atVertex = true;
  if (models.length > 1 && numericFree.length > 0) {
    const pt = [...best];
    for (let pass = 0; pass < 60; pass++) {
      let moved = false;
      for (const fi of numericFree) {
        const STEPS = 41;
        let localBest = pt[fi];
        let localD = compositeAt(pt);
        for (let s = 0; s < STEPS; s++) {
          const v = -1 + (2 * s) / (STEPS - 1);
          const old = pt[fi];
          pt[fi] = v;
          const d = compositeAt(pt);
          if (d > localD + 1e-12) {
            localD = d;
            localBest = v;
          }
          pt[fi] = old;
        }
        if (Math.abs(localBest - pt[fi]) > 1e-9) {
          pt[fi] = localBest;
          moved = true;
        }
      }
      if (!moved) break;
    }
    const dRef = compositeAt(pt);
    if (dRef > bestD + 1e-9) {
      bestD = dRef;
      best = pt;
      ties = 1;
    }
    atVertex = best.every(
      (v, i) => holdCoded.has(i) || Math.abs(Math.abs(v) - 1) < 1e-6
    );
  }

  settings.forEach((f, i) => {
    f.coded = best![i];
    f.label = decodeLabel(f, best![i]);
  });

  // --- Intervalos en el optimo ---------------------------------------------
  const tc = tQuantile(1 - alphaCI / 2, models[0].errDF);
  const row = designRow(best);
  const predictions: ResponsePrediction[] = models.map((m) => {
    const fitv = predictAt(m, best!);
    // SE del valor medio ajustado: s * sqrt(x0' (X'X)^-1 x0).
    let q = 0;
    const inv = invXtX(X, n);
    for (let a = 0; a < row.length; a++) {
      for (let b = 0; b < row.length; b++) q += row[a] * inv[a][b] * row[b];
    }
    const seFit = m.s * Math.sqrt(Math.max(0, q));
    // El intervalo de PREDICCION incluye la variabilidad de una observacion
    // futura, de ahi el 1 adicional bajo la raiz.
    const sePred = m.s * Math.sqrt(Math.max(0, 1 + q));
    const tcm = tQuantile(1 - alphaCI / 2, m.errDF);
    return {
      column: m.column,
      fit: fitv,
      seFit,
      ciLow: fitv - tcm * seFit,
      ciHigh: fitv + tcm * seFit,
      piLow: fitv - tcm * sePred,
      piHigh: fitv + tcm * sePred,
      d: desirability(fitv, m.spec),
    };
  });

  // --- Paneles del grafico de optimizacion ---------------------------------
  // Cada panel recorre un factor manteniendo los demas en el optimo: es la
  // lectura de "que pasa si muevo esto".
  const panels = settings.map((f, i) => {
    const steps = f.text ? 2 : 41;
    const points = Array.from({ length: steps }, (_, s) => {
      const c = f.text ? (s === 0 ? -1 : 1) : -1 + (2 * s) / (steps - 1);
      const pt = [...best!];
      pt[i] = c;
      return {
        coded: c,
        label: decodeLabel(f, c),
        fits: models.map((m) => predictAt(m, pt)),
        composite: compositeAt(pt),
      };
    });
    return { factor: f.name, text: f.text, points, optCoded: best![i] };
  });

  // --- Curvas de deseabilidad ----------------------------------------------
  const curves = models.map((m, j) => {
    const obs = ys[j];
    const lo = Math.min(...obs, m.spec.lower, m.spec.target);
    const hi = Math.max(...obs, m.spec.target, m.spec.upper);
    const pad = (hi - lo) * 0.08 || 1;
    return {
      column: m.column,
      lo: lo - pad,
      hi: hi + pad,
      points: desirabilityCurve(m.spec, lo - pad, hi + pad),
    };
  });

  return {
    ok: true,
    models,
    settings,
    predictions,
    composite: bestD,
    panels,
    curves,
    confLevel,
    n,
    nMissing,
    atVertex,
    ties,
    showOptPlot: params.showOptPlot,
    showDesirCurves: params.showDesirCurves,
  };
}

/**
 * Inversa de X'X con la columna de unos delante. Se recalcula aqui porque las
 * respuestas comparten matriz de diseno: una sola inversion sirve para todas.
 */
function invXtX(X: number[][], n: number): number[][] {
  const p = X.length + 1;
  const A: number[][] = Array.from({ length: n }, (_, i) => [
    1,
    ...X.map((c) => c[i]),
  ]);
  const m: number[][] = Array.from({ length: p }, () => new Array(p).fill(0));
  for (let i = 0; i < n; i++) {
    for (let a = 0; a < p; a++) {
      for (let b = a; b < p; b++) m[a][b] += A[i][a] * A[i][b];
    }
  }
  for (let a = 0; a < p; a++) for (let b = 0; b < a; b++) m[a][b] = m[b][a];

  const aug: number[][] = m.map((r, i) => [
    ...r,
    ...Array.from({ length: p }, (_, j) => (i === j ? 1 : 0)),
  ]);
  for (let c = 0; c < p; c++) {
    let piv = c;
    for (let r = c + 1; r < p; r++) {
      if (Math.abs(aug[r][c]) > Math.abs(aug[piv][c])) piv = r;
    }
    if (piv !== c) [aug[c], aug[piv]] = [aug[piv], aug[c]];
    const d = aug[c][c];
    for (let j = 0; j < 2 * p; j++) aug[c][j] /= d;
    for (let r = 0; r < p; r++) {
      if (r === c) continue;
      const f = aug[r][c];
      if (f === 0) continue;
      for (let j = 0; j < 2 * p; j++) aug[r][j] -= f * aug[c][j];
    }
  }
  return aug.map((r) => r.slice(p));
}

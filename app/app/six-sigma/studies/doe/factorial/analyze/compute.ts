// app/app/six-sigma/studies/doe/factorial/analyze/compute.ts
import type { ColumnSnapshot } from "../../../types";
import { multiRegressionFit } from "../../../../lib/multiregression";
import { fSf, tQuantile } from "../../../../lib/regression";
import {
  LETTER,
  buildTerms,
  detectAliases,
  lenth,
  lenthP,
  parentKeys,
  termColumn,
  uncodedCoefficients,
  type FactorCoding,
  type Term,
} from "../../../../lib/factorialmodel";
import {
  MAX_FACTORS,
  type Advice,
  type AnovaGroup,
  type DoeAnalyzeModel,
  type DoeAnalyzeParams,
  type DoeAnalyzeResult,
  type TermRow,
  type UncodedTerm,
  type UnusualRow,
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

const fail = (error: string): DoeAnalyzeResult => ({ ok: false, error });

const GROUP_LABEL: Record<number, string> = {
  1: "Linear",
  2: "2-Way Interactions",
  3: "3-Way Interactions",
  4: "4-Way Interactions",
  5: "5-Way Interactions",
  6: "6-Way Interactions",
};

/** Cuatro cifras significativas, hasta seis decimales. */
export const sig4 = (v: number): string => {
  if (!Number.isFinite(v)) return "*";
  if (v === 0) return "0";
  const mag = Math.floor(Math.log10(Math.abs(v)));
  const dec = Math.max(0, Math.min(6, 3 - mag));
  return v.toFixed(dec).replace(".", ",");
};

export function computeDoeAnalyze(
  data: ColumnSnapshot,
  params: DoeAnalyzeParams
): DoeAnalyzeResult {
  const resp = params.response.trim();
  if (resp === "") return fail("Select the response.");

  const facNames = params.factors.filter((s) => s.trim() !== "" && s !== resp);
  if (facNames.length < 1) return fail("Select at least one factor.");
  if (facNames.length > MAX_FACTORS) {
    return fail(`Too many factors (${facNames.length}). The limit is ${MAX_FACTORS}.`);
  }

  const yCol = data[resp];
  if (!yCol) return fail(`Column "${resp}" does not exist.`);
  for (const nm of facNames) {
    if (!data[nm]) return fail(`Column "${nm}" does not exist.`);
  }

  const alpha = num(params.alpha);
  if (!(alpha > 0 && alpha < 1)) return fail("Alpha must be between 0 and 1.");

  const maxOrder = num(params.maxOrder);
  if (!Number.isInteger(maxOrder) || maxOrder < 1 || maxOrder > 6) {
    return fail("The model order must be a whole number from 1 to 6.");
  }

  // --- Filas completas ------------------------------------------------------
  const len = Math.max(
    yCol.values.length,
    ...facNames.map((nm) => data[nm].values.length)
  );
  const y: number[] = [];
  const rawLevels: string[][] = facNames.map(() => []);
  let nMissing = 0;

  for (let i = 0; i < len; i++) {
    const yv = cellNum(yCol.values[i]);
    const texts = facNames.map((nm) => cellText(data[nm].values[i]));
    const allBlank =
      cellText(yCol.values[i]) === "" && texts.every((t) => t === "");
    if (allBlank) continue;
    if (!Number.isFinite(yv) || texts.some((t) => t === "")) {
      nMissing++;
      continue;
    }
    y.push(yv);
    texts.forEach((t, j) => rawLevels[j].push(t));
  }

  const n = y.length;
  if (n < 4) return fail("Not enough complete runs to fit a factorial model.");

  // --- Codificacion de los factores -----------------------------------------
  // Este estudio es para disenos de DOS niveles: un factor con tres o mas
  // niveles distintos no se puede codificar en -1 / +1.
  const coding: FactorCoding[] = [];
  const coded: number[][] = [];

  for (let j = 0; j < facNames.length; j++) {
    const uniq = [...new Set(rawLevels[j])];
    if (uniq.length < 2) {
      return fail(`Factor "${facNames[j]}" has a single level.`);
    }
    if (uniq.length > 2) {
      return fail(
        `Factor "${facNames[j]}" has ${uniq.length} levels. This analysis is for ` +
          `two-level designs. If those are center points, exclude them, or use a ` +
          `general factorial analysis.`
      );
    }
    const allNum = uniq.every((s) => Number.isFinite(cellNum(s)));
    uniq.sort((a, b) =>
      allNum ? cellNum(a) - cellNum(b) : a.localeCompare(b, undefined, { numeric: true })
    );

    // El factor de texto se queda codificado en la ecuacion no codificada: no
    // hay una escala real que decodificar.
    const center = allNum ? (cellNum(uniq[0]) + cellNum(uniq[1])) / 2 : 0;
    const half = allNum ? (cellNum(uniq[1]) - cellNum(uniq[0])) / 2 : 1;
    if (allNum && !(half > 0)) {
      return fail(`Factor "${facNames[j]}" has two identical levels.`);
    }

    coding.push({ name: facNames[j], text: !allNum, levels: uniq, center, half });
    coded.push(rawLevels[j].map((s) => (s === uniq[0] ? -1 : 1)));
  }

  // --- Terminos -------------------------------------------------------------
  const allTerms = buildTerms(facNames, maxOrder);
  const excluded = new Set(params.excluded);
  const active = allTerms.filter((t) => !excluded.has(t.key));
  if (active.length === 0) return fail("Every term has been removed from the model.");

  // La jerarquia se comprueba antes de ajustar: un modelo con AB pero sin A no
  // es interpretable, porque los coeficientes dependen del origen de la escala.
  const activeKeys = new Set(active.map((t) => t.key));
  for (const t of active) {
    const missing = parentKeys(t, facNames).filter((p) => !activeKeys.has(p));
    if (missing.length > 0) {
      return fail(
        `The model is not hierarchical: "${t.key}" is in, but ${missing
          .map((m) => `"${m}"`)
          .join(", ")} ${missing.length === 1 ? "is" : "are"} out. ` +
          `Put the lower-order term(s) back, or remove the interaction as well.`
      );
    }
  }

  const { groups: aliases, clean: aliasClean } = detectAliases(coded, allTerms);

  const X = active.map((t) => termColumn(coded, t));
  const fit = multiRegressionFit(X, y, active.map((t) => t.key));
  if (!fit) {
    return fail(
      "The model is not estimable: some terms are aliased with each other. " +
        "Lower the model order, or remove the terms flagged in the alias structure."
    );
  }

  const grandMean = y.reduce((a, b) => a + b, 0) / n;
  const dfe = fit.errDF;

  // --- Lenth cuando no queda error ------------------------------------------
  // Con una sola replica y el modelo completo cada corrida se gasta en estimar
  // un termino: no hay error residual y ningun contraste es posible por la via
  // habitual. Lenth supone que la mayoria de los efectos son nulos y usa su
  // mediana como medida del ruido.
  const rawEffects = fit.terms.map((t, i) => 2 * t.coef);
  let usedLenth = false;
  let pse = NaN;
  let lenthDF = NaN;
  let lenthMargin = NaN;

  if (dfe < 1) {
    const L = lenth(rawEffects, alpha);
    if (!L) {
      return fail(
        "The design is saturated and Lenth's method cannot be applied either: " +
          "at least three terms are needed. Add replicates, or remove terms from the model."
      );
    }
    usedLenth = true;
    pse = L.pse;
    lenthDF = L.df;
    lenthMargin = L.margin;
  }

  // --- Filas de terminos ----------------------------------------------------
  const rows: TermRow[] = active.map((term, i) => {
    const ft = fit.terms[i];
    const effect = 2 * ft.coef;
    if (usedLenth) {
      const t = effect / pse;
      const p = lenthP(effect, pse, lenthDF);
      return {
        term,
        effect,
        coef: ft.coef,
        se: pse / 2,
        t,
        p,
        vif: ft.vif,
        adjSS: NaN,
        adjMS: NaN,
        fValue: NaN,
        fP: NaN,
        significant: p < alpha,
      };
    }
    return {
      term,
      effect,
      coef: ft.coef,
      se: ft.se,
      t: ft.t,
      p: ft.p,
      vif: ft.vif,
      adjSS: ft.adjSS,
      adjMS: ft.adjMS,
      fValue: ft.fValue,
      fP: ft.fP,
      significant: ft.p < alpha,
    };
  });

  // --- ANOVA jerarquica -----------------------------------------------------
  // La suma de cuadrados de un grupo se calcula retirando TODOS sus terminos
  // de golpe. En un diseno ortogonal coincide con la suma de las individuales,
  // pero no en cuanto el diseno se desequilibra.
  const groups: AnovaGroup[] = [];
  if (!usedLenth) {
    const orders = [...new Set(active.map((t) => t.order))].sort((a, b) => a - b);
    for (const o of orders) {
      const members = rows.filter((r) => r.term.order === o);
      const keep = active.filter((t) => t.order !== o);
      let ss: number;
      if (keep.length === 0) {
        ss = fit.totSS - fit.errSS;
      } else {
        const sub = multiRegressionFit(
          keep.map((t) => termColumn(coded, t)),
          y,
          keep.map((t) => t.key)
        );
        ss = sub ? sub.errSS - fit.errSS : NaN;
      }
      const df = members.length;
      const ms = ss / df;
      const f = ms / fit.errMS;
      groups.push({
        label: GROUP_LABEL[o] ?? `${o}-Way Interactions`,
        df,
        ss,
        ms,
        f,
        p: fSf(f, df, dfe),
        members,
      });
    }
  }

  // --- Ecuacion en unidades no codificadas ----------------------------------
  const unc = uncodedCoefficients(
    fit.constant.coef,
    active.map((t, i) => ({ term: t, coef: fit.terms[i].coef })),
    coding
  );
  const uncoded: UncodedTerm[] = unc.map((e) => ({
    label:
      e.members.length === 0
        ? ""
        : e.members.map((i) => facNames[i]).join("*"),
    value: e.value,
  }));

  // --- Observaciones inusuales ---------------------------------------------
  const leverageLimit = Math.min(0.99, (3 * fit.p) / n);
  const unusual: UnusualRow[] = [];
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

  // --- Graficos de efectos --------------------------------------------------
  const paretoLimit = usedLenth
    ? lenthMargin / pse
    : tQuantile(1 - alpha / 2, dfe);

  const effectsPlot = rows
    .map((r) => ({
      label: r.term.letters,
      std: Math.abs(r.t),
      signed: r.t,
      significant: r.significant,
    }))
    .sort((a, b) => b.std - a.std);

  // --- Medias ajustadas -----------------------------------------------------
  // Se predice sobre la rejilla completa de niveles codificados y se promedia
  // sobre los factores que no intervienen en el panel. Con el modelo completo
  // coincide con las medias de los datos; con un modelo reducido, no.
  const k = facNames.length;
  const predict = (pt: number[]): number => {
    let v = fit.constant.coef;
    active.forEach((t, i) => {
      let prod = 1;
      for (const m of t.members) prod *= pt[m];
      v += fit.terms[i].coef * prod;
    });
    return v;
  };

  const gridMean = (fixed: Map<number, number>): number => {
    const free = Array.from({ length: k }, (_, i) => i).filter(
      (i) => !fixed.has(i)
    );
    const total = 1 << free.length;
    let acc = 0;
    for (let mask = 0; mask < total; mask++) {
      const pt = new Array<number>(k).fill(0);
      fixed.forEach((v, i) => (pt[i] = v));
      free.forEach((fi, b) => (pt[fi] = mask & (1 << b) ? 1 : -1));
      acc += predict(pt);
    }
    return acc / total;
  };

  const mainEffects = facNames.map((nm, j) => ({
    factor: nm,
    points: [-1, 1].map((lv, li) => ({
      label: coding[j].levels[li],
      mean: gridMean(new Map([[j, lv]])),
    })),
  }));

  const interactions: DoeAnalyzeModel["interactions"] = [];
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      if (i === j) continue;
      interactions.push({
        rowFactor: facNames[i],
        colFactor: facNames[j],
        xLabels: coding[j].levels,
        series: [-1, 1].map((lvI, li) => ({
          label: coding[i].levels[li],
          means: [-1, 1].map((lvJ) =>
            gridMean(new Map([[i, lvI], [j, lvJ]]))
          ),
        })),
      });
    }
  }

  return {
    ok: true,
    response: resp,
    factors: facNames,
    letters: facNames.map((_, i) => LETTER(i)),
    fit,
    rows,
    groups,
    modelDF: fit.regDF,
    modelSS: fit.regSS,
    modelMS: fit.regMS,
    modelF: fit.regF,
    modelP: fit.regP,
    uncoded,
    unusual,
    leverageLimit,
    aliases,
    aliasClean,
    usedLenth,
    pse,
    lenthDF,
    lenthMargin,
    paretoLimit,
    effectsPlot,
    mainEffects,
    interactions,
    advice: buildAdvice(rows, facNames, alpha, usedLenth),
    alpha,
    grandMean,
    n,
    nMissing,
    residualKind: params.residualKind,
  } as DoeAnalyzeResult;
}

/**
 * Que termino retirar primero.
 *
 * La regla es JERARQUICA: solo se puede retirar un termino que no sea padre de
 * ningun otro que siga en el modelo. Por eso un efecto principal con p = 1,000
 * se queda si participa en una interaccion significativa: su coeficiente ya no
 * se interpreta solo, sino a traves de la interaccion.
 */
function buildAdvice(
  rows: TermRow[],
  facNames: string[],
  alpha: number,
  usedLenth: boolean
): Advice {
  const keys = new Set(rows.map((r) => r.term.key));
  const isParent = (key: string): boolean =>
    rows.some(
      (o) => o.term.key !== key && parentKeys(o.term, facNames).includes(key)
    );

  const removable = rows.filter((r) => !isParent(r.term.key));
  const worst = removable.reduce<TermRow | null>(
    (best, r) => (best === null || r.p > best.p ? r : best),
    null
  );

  const al = alpha.toString().replace(".", ",");

  if (worst && worst.p > alpha) {
    const next = rows.filter((r) => r.term.key !== worst.term.key).map((r) => r.term.key);
    return {
      kind: "remove",
      term: worst.term.key,
      headline: `Remove ${worst.term.key}: p-value is ${worst.p
        .toFixed(3)
        .replace(".", ",")}`,
      detail:
        `It is the least significant term that can be dropped without breaking the ` +
        `hierarchy, and it does not reach ${al}. Removing it returns a degree of ` +
        `freedom to the error, which makes every remaining test sharper. Take out one ` +
        `term at a time: the others change when it goes.`,
      nextTerms: next,
    };
  }

  const stuck = rows.filter(
    (r) => r.p > alpha && isParent(r.term.key)
  );
  if (stuck.length > 0) {
    const names = stuck.map((r) => r.term.key).join(", ");
    return {
      kind: "hierarchy",
      term: null,
      headline: "Every removable term is significant",
      detail:
        `${names} ${stuck.length === 1 ? "has" : "have"} a p-value above ${al}, but ` +
        `${stuck.length === 1 ? "it is" : "they are"} contained in an interaction that ` +
        `stays in the model. A main effect cannot leave while its interaction remains: ` +
        `the coefficients would depend on where the zero of the scale sits. Keep ` +
        `${stuck.length === 1 ? "it" : "them"} and read ${
          stuck.length === 1 ? "its effect" : "their effects"
        } through the interaction.`,
      nextTerms: [...keys],
    };
  }

  if (usedLenth) {
    return {
      kind: "lenth",
      term: null,
      headline: "Every term is significant by Lenth's method",
      detail:
        "There are no degrees of freedom for error, so these p-values come from " +
        "Lenth's pseudo standard error rather than from replication. Treat them as " +
        "indicative: confirm the model with replicated runs before acting on it.",
      nextTerms: [...keys],
    };
  }

  return {
    kind: "final",
    term: null,
    headline: "Every term in the model is significant",
    detail:
      `All p-values are below ${al} and the hierarchy is intact. There is nothing left ` +
      `to drop. Check the residual plots, then read the main effects and interaction ` +
      `plots to turn the model into settings.`,
    nextTerms: [...keys],
  };
}

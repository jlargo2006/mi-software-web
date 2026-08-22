// app/app/six-sigma/studies/doe/factorial/analyze/compute.ts
import type { ColumnSnapshot } from "../../../types";
import { multiRegressionFit } from "../../../../lib/multiregression";
import { fSf, tQuantile } from "../../../../lib/regression";
import {
  CT_PT_KEY,
  CT_PT_TERM,
  LETTER,
  blockColumns,
  blockTerm,
  buildTerms,
  detectAliases,
  isBlockTerm,
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

// Los bloques van DELANTE de los efectos lineales y la curvatura AL FINAL, que
// es el orden en que Minitab presenta la tabla.
const GROUP_LABEL: Record<number, string> = {
  [-1]: "Blocks",
  0: "Curvature",
  1: "Linear",
  2: "2-Way Interactions",
  3: "3-Way Interactions",
  4: "4-Way Interactions",
  5: "5-Way Interactions",
  6: "6-Way Interactions",
};

/** Clave de ordenacion de los grupos: -1 primero, 0 al final. */
const orderRank = (o: number): number => (o === 0 ? 99 : o);

/** Cuatro cifras significativas, hasta seis decimales. */
export const sig4 = (v: number): string => {
  if (!Number.isFinite(v)) return "*";
  if (v === 0) return "0";
  const mag = Math.floor(Math.log10(Math.abs(v)));
  const dec = Math.max(0, Math.min(6, 3 - mag));
  return v.toFixed(dec).replace(".", ",");
};

/**
 * Marca que columnas son linealmente independientes de las anteriores.
 *
 * Se usa Gram-Schmidt modificado y NO la inversa de X'X: cuando el diseno esta
 * saturado esa matriz es singular y no dice cual de las columnas sobra, solo
 * que sobra alguna. Ortogonalizando en orden, la primera columna de cada
 * conjunto de alias es la que se queda y las demas caen con residuo nulo.
 *
 * De ahi que el orden de entrada sea una decision y no un detalle: los bloques
 * se pasan primero para que un bloque confundido con un termino elimine el
 * termino, nunca el bloque.
 */
function independentMask(cols: number[][], nRows: number): boolean[] {
  const basis: number[][] = [];
  // La constante forma parte del modelo aunque no este en la lista: sin ella,
  // una columna constante pareceria informativa.
  const ones = new Array<number>(nRows).fill(1 / Math.sqrt(nRows));
  basis.push(ones);

  const keep: boolean[] = [];
  for (const col of cols) {
    const v = [...col];
    const norm0 = Math.sqrt(v.reduce((a, x) => a + x * x, 0));
    for (const b of basis) {
      let d = 0;
      for (let i = 0; i < v.length; i++) d += v[i] * b[i];
      for (let i = 0; i < v.length; i++) v[i] -= d * b[i];
    }
    const norm = Math.sqrt(v.reduce((a, x) => a + x * x, 0));
    // Umbral RELATIVO a la norma original: una columna de ceros y una columna
    // enorme casi dependiente no se juzgan con la misma vara.
    if (norm > 1e-8 * Math.max(1, norm0)) {
      const inv = 1 / norm;
      basis.push(v.map((x) => x * inv));
      keep.push(true);
    } else {
      keep.push(false);
    }
  }
  return keep;
}

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

  // --- Columna de bloques ---------------------------------------------------
  const blkName = (params.blockColumn ?? "").trim();
  if (blkName !== "") {
    if (!data[blkName]) {
      return fail(
        `Column "${blkName}" is not available. If it does exist in the worksheet, ` +
          `it is not being passed to the analysis.`
      );
    }
    if (blkName === resp || facNames.includes(blkName)) {
      return fail(
        `"${blkName}" is already used as the response or as a factor: it cannot ` +
          `also be the block column.`
      );
    }
  }

  // --- Filas completas ------------------------------------------------------
  const len = Math.max(
    yCol.values.length,
    ...facNames.map((nm) => data[nm].values.length),
    blkName === "" ? 0 : data[blkName].values.length
  );
  const y: number[] = [];
  const rawLevels: string[][] = facNames.map(() => []);
  const blkTexts: string[] = [];
  let nMissing = 0;

  for (let i = 0; i < len; i++) {
    const yv = cellNum(yCol.values[i]);
    const texts = facNames.map((nm) => cellText(data[nm].values[i]));
    const bTxt = blkName === "" ? "" : cellText(data[blkName].values[i]);
    const allBlank =
      cellText(yCol.values[i]) === "" &&
      texts.every((t) => t === "") &&
      bTxt === "";
    if (allBlank) continue;
    if (!Number.isFinite(yv) || texts.some((t) => t === "")) {
      nMissing++;
      continue;
    }
    // Una corrida sin bloque no se puede asignar: se descarta, igual que si le
    // faltara un nivel de factor.
    if (blkName !== "" && bTxt === "") {
      nMissing++;
      continue;
    }
    y.push(yv);
    texts.forEach((t, j) => rawLevels[j].push(t));
    blkTexts.push(bTxt);
  }

  const n = y.length;
  if (n < 4) return fail("Not enough complete runs to fit a factorial model.");

  // --- Niveles de bloque ----------------------------------------------------
  // Se indexan por orden ordenado, no de aparicion, para que la numeracion no
  // dependa de como esten dispuestas las filas de la hoja. Se admite tanto
  // 1/2/3 como etiquetas de texto: "Day 1", "Lot B"...
  let blockOf: number[] = blkTexts.map(() => 0);
  let blockLevels: number[] = [];
  if (blkName !== "") {
    const seen = [...new Set(blkTexts)];
    const allNum = seen.every((s) => Number.isFinite(cellNum(s)));
    seen.sort((a, b) =>
      allNum ? cellNum(a) - cellNum(b) : a.localeCompare(b, undefined, { numeric: true })
    );
    if (seen.length < 2) {
      return fail(
        `Column "${blkName}" holds a single block. Leave the block column empty ` +
          `if the experiment was not blocked.`
      );
    }
    if (seen.length > 20) {
      return fail(
        `Column "${blkName}" holds ${seen.length} blocks, which is too many for ` +
          `this analysis. Check that you picked the right column.`
      );
    }
    const idx = new Map(seen.map((s, i) => [s, i]));
    blockOf = blkTexts.map((t) => idx.get(t) ?? 0);
    blockLevels = seen.map((_, i) => i);
  }

  // --- Codificacion de los factores -----------------------------------------
  // Un factor puede traer TRES niveles distintos y seguir siendo de dos
  // niveles: si el intermedio es exactamente el punto medio, se trata de un
  // punto central, no de un tercer nivel. Se codifica como 0.
  const coding: FactorCoding[] = [];
  const coded: number[][] = [];
  const centerFactors: string[] = [];

  for (let j = 0; j < facNames.length; j++) {
    const uniq = [...new Set(rawLevels[j])];
    if (uniq.length < 2) {
      return fail(`Factor "${facNames[j]}" has a single level.`);
    }
    const allNum = uniq.every((s) => Number.isFinite(cellNum(s)));
    uniq.sort((a, b) =>
      allNum ? cellNum(a) - cellNum(b) : a.localeCompare(b, undefined, { numeric: true })
    );

    const lowTxt = uniq[0];
    const highTxt = uniq[uniq.length - 1];
    let midTxt: string | null = null;

    if (uniq.length === 3 && allNum) {
      const lo = cellNum(uniq[0]);
      const mid = cellNum(uniq[1]);
      const hi = cellNum(uniq[2]);
      const expected = (lo + hi) / 2;
      // Tolerancia relativa: los datos vienen redondeados de la hoja.
      const tol = Math.max(1e-9, Math.abs(hi - lo) * 1e-6);
      if (Math.abs(mid - expected) > tol) {
        return fail(
          `Factor "${facNames[j]}" has three levels (${uniq.join(", ")}) and the ` +
            `middle one is not the midpoint of the other two. This analysis is for ` +
            `two-level designs, with or without center points.`
        );
      }
      midTxt = uniq[1];
      centerFactors.push(facNames[j]);
    } else if (uniq.length > 2) {
      return fail(
        `Factor "${facNames[j]}" has ${uniq.length} levels. This analysis is for ` +
          `two-level designs, with or without center points. For a factor with ` +
          `three or more genuine levels, use a general factorial analysis.`
      );
    }

    // El factor de texto se queda codificado en la ecuacion no codificada: no
    // hay una escala real que decodificar.
    const center = allNum ? (cellNum(lowTxt) + cellNum(highTxt)) / 2 : 0;
    const half = allNum ? (cellNum(highTxt) - cellNum(lowTxt)) / 2 : 1;
    if (allNum && !(half > 0)) {
      return fail(`Factor "${facNames[j]}" has two identical levels.`);
    }

    coding.push({
      name: facNames[j],
      text: !allNum,
      levels: [lowTxt, highTxt],
      center,
      half,
    });
    coded.push(
      rawLevels[j].map((s) => {
        if (s === lowTxt) return -1;
        if (s === highTxt) return 1;
        if (midTxt !== null && s === midTxt) return 0;
        return NaN;
      })
    );
  }

  if (coded.some((col) => col.some((v) => Number.isNaN(v)))) {
    return fail("Some factor level could not be coded. Check for stray values.");
  }

  // Una corrida es punto central cuando TODOS los factores estan a medio
  // camino. Basta con que una columna no sea 0 para que sea una esquina.
  const isCenter = Array.from({ length: n }, (_, i) =>
    coded.every((col) => col[i] === 0)
  );
  const nCenterPoints = isCenter.filter(Boolean).length;
  const hasCenterPoints = nCenterPoints > 0;

  if (centerFactors.length > 0 && !hasCenterPoints) {
    return fail(
      `${centerFactors.join(", ")} ${
        centerFactors.length === 1 ? "has" : "have"
      } a midpoint level, but no run sits at the centre of every factor at once. ` +
        `A center point needs all factors at their midpoint simultaneously.`
    );
  }

  const wantCtPt = hasCenterPoints && params.includeCenterPoints !== false;
  const ctPtCol = isCenter.map((c) => (c ? 1 : 0));

  // --- Terminos -------------------------------------------------------------
  const allTerms = buildTerms(facNames, maxOrder);
  const excluded = new Set(params.excluded);
  const requested = allTerms.filter((t) => !excluded.has(t.key));
  if (requested.length === 0) {
    return fail("Every term has been removed from the model.");
  }

  // La jerarquia se comprueba antes de ajustar: un modelo con AB pero sin A no
  // es interpretable, porque los coeficientes dependen del origen de la escala.
  const requestedKeys = new Set(requested.map((t) => t.key));
  for (const t of requested) {
    const missing = parentKeys(t, facNames).filter((p) => !requestedKeys.has(p));
    if (missing.length > 0) {
      return fail(
        `The model is not hierarchical: "${t.key}" is in, but ${missing
          .map((m) => `"${m}"`)
          .join(", ")} ${missing.length === 1 ? "is" : "are"} out. ` +
          `Put the lower-order term(s) back, or remove the interaction as well.`
      );
    }
  }

  // Los alias se detectan SOLO sobre las esquinas: un punto central tiene todas
  // las columnas a 0 y falsearia la comparacion de signos.
  const cornerIdx = Array.from({ length: n }, (_, i) => i).filter(
    (i) => !isCenter[i]
  );
  if (cornerIdx.length < 2) {
    return fail("Every run sits at the centre: there are no corner points to analyse.");
  }
  const codedCorners = coded.map((col) => cornerIdx.map((i) => col[i]));
  const { groups: aliasFac, clean: aliasClean } = detectAliases(
    codedCorners,
    allTerms
  );

  // --- Columnas de bloque ---------------------------------------------------
  // Con b bloques hacen falta b-1 columnas, en codificacion de EFECTOS: la
  // columna j vale 1 en el bloque j, -1 en el ultimo y 0 en el resto. Asi los
  // coeficientes suman cero y la constante es la media global.
  const useBlocks = blockLevels.length >= 2 && params.includeBlocks !== false;
  const blkCols = useBlocks ? blockColumns(blockOf, blockLevels) : [];
  const blkTerms = useBlocks
    ? blockLevels.slice(0, -1).map((_, i) => blockTerm(i))
    : [];
  const nBlk = blkTerms.length;

  // --- Descarte de terminos no estimables -----------------------------------
  // Un diseno fraccionado no puede estimar mas terminos que corridas tiene, y
  // pedir orden 3 con 8 factores en 16 corridas produce 92 terminos que son
  // alias exactos entre si. Rechazar el modelo seria correcto pero inutil: el
  // usuario tendria que desmarcar setenta y siete terminos a mano leyendo la
  // estructura de alias. Se descartan aqui y se dice cuales.
  const probeCols: number[][] = [
    ...blkTerms.map((_, i) => blkCols[i]),
    ...requested.map((t) => termColumn(coded, t)),
    ...(wantCtPt ? [ctPtCol] : []),
  ];
  const keepMask = independentMask(probeCols, n);

  const droppedByAlias = new Set<string>();
  requested.forEach((t, i) => {
    if (!keepMask[nBlk + i]) droppedByAlias.add(t.key);
  });

  // Si cae un termino, caen sus hijos: dejar AB sin A rompe la jerarquia, y el
  // modelo deja de ser interpretable aunque siga siendo ajustable.
  let grew = true;
  while (grew) {
    grew = false;
    for (const t of requested) {
      if (droppedByAlias.has(t.key)) continue;
      if (parentKeys(t, facNames).some((p) => droppedByAlias.has(p))) {
        droppedByAlias.add(t.key);
        grew = true;
      }
    }
  }

  const active = requested.filter((t) => !droppedByAlias.has(t.key));
  const removedAliased = requested
    .filter((t) => droppedByAlias.has(t.key))
    .map((t) => t.key);

  if (active.length === 0) {
    return fail(
      "No term is estimable with these runs: every one is an exact alias of " +
        "another. Lower the model order, or add runs."
    );
  }

  // La curvatura tambien puede ser inestimable: con puntos centrales en un solo
  // bloque y ese bloque ajustado, el indicador coincide con la columna de bloque.
  const ctPtEstimable = wantCtPt && keepMask[keepMask.length - 1];
  const useCtPt = wantCtPt && ctPtEstimable;
  const droppedCtPt = wantCtPt && !ctPtEstimable;

  // --- Matriz del modelo ----------------------------------------------------
  // Los bloques van delante y la curvatura al final: asi los terminos
  // factoriales ocupan las posiciones nBlk .. nBlk + active.length - 1, que es
  // lo que usan la ecuacion no codificada y las medias ajustadas.
  const modelTerms: Term[] = [
    ...blkTerms,
    ...active,
    ...(useCtPt ? [CT_PT_TERM] : []),
  ];
  const X = modelTerms.map((t, i) => {
    if (isBlockTerm(t)) return blkCols[i];
    if (t.key === CT_PT_KEY) return ctPtCol;
    return termColumn(coded, t);
  });

  const fit = multiRegressionFit(X, y, modelTerms.map((t) => t.key));
  if (!fit) {
    return fail(
      "The model could not be fitted even after removing the aliased terms. " +
        "This should not happen: please report the design and the response used."
    );
  }

  const grandMean = y.reduce((a, b) => a + b, 0) / n;
  const dfe = fit.errDF;

  // --- Lenth cuando no queda error ------------------------------------------
  // Con una sola replica y el modelo completo cada corrida se gasta en estimar
  // un termino: no hay error residual y ningun contraste es posible por la via
  // habitual. Lenth supone que la mayoria de los efectos son nulos y usa su
  // mediana como medida del ruido.
  //
  // Ni los bloques ni la curvatura son efectos factoriales, y quedan fuera:
  // contaminarian la mediana con la que se estima el ruido.
  const rawEffects = modelTerms
    .map((t, i) => (t.order <= 0 ? NaN : 2 * fit.terms[i].coef))
    .filter((v) => Number.isFinite(v));

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
  const rows: TermRow[] = modelTerms.map((term, i) => {
    const ft = fit.terms[i];
    // Ni los bloques ni la curvatura tienen "efecto": no hay nivel alto ni bajo
    // entre los que medirlo.
    const effect = term.order <= 0 ? NaN : 2 * ft.coef;
    if (usedLenth && term.order > 0) {
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
  // pero no en cuanto el diseno se desequilibra, y las columnas de bloque NO
  // son ortogonales entre si.
  const groups: AnovaGroup[] = [];
  if (!usedLenth) {
    const orders = [...new Set(modelTerms.map((t) => t.order))].sort(
      (a, b) => orderRank(a) - orderRank(b)
    );
    for (const o of orders) {
      const members = rows.filter((r) => r.term.order === o);
      const keepIdx = modelTerms
        .map((t, i) => (t.order === o ? -1 : i))
        .filter((i) => i >= 0);
      let ss: number;
      if (keepIdx.length === 0) {
        ss = fit.totSS - fit.errSS;
      } else {
        const sub = multiRegressionFit(
          keepIdx.map((i) => X[i]),
          y,
          keepIdx.map((i) => modelTerms[i].key)
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
  // Solo los terminos factoriales se decodifican, y su indice en el ajuste
  // arranca en nBlk porque los bloques van delante.
  const unc = uncodedCoefficients(
    fit.constant.coef,
    active.map((t, i) => ({ term: t, coef: fit.terms[nBlk + i].coef })),
    coding
  );
  const uncoded: UncodedTerm[] = unc.map((e) => ({
    label:
      e.members.length === 0
        ? ""
        : e.members.map((i) => facNames[i]).join("*"),
    value: e.value,
  }));
  // El indicador de curvatura se queda tal cual: no hay escala que decodificar.
  if (useCtPt) {
    uncoded.push({
      label: CT_PT_KEY,
      value: fit.terms[nBlk + active.length].coef,
    });
  }

  // --- Observaciones inusuales ---------------------------------------------
  // Con el modelo saturado la palanca vale 1 en toda corrida y el residuo es
  // cero: marcar las dieciseis como inusuales seria ruido, no informacion.
  const leverageLimit = Math.min(0.99, (3 * fit.p) / n);
  const unusual: UnusualRow[] = [];
  if (!usedLenth) {
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
  }

  // --- Graficos de efectos --------------------------------------------------
  const paretoLimit = usedLenth
    ? lenthMargin / pse
    : tQuantile(1 - alpha / 2, dfe);

  // Ni bloques ni curvatura son efectos factoriales: fuera de estos graficos.
  const effectsPlot = rows
    .filter((r) => r.term.order > 0)
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
    // Se promedia sobre los bloques: sus columnas van a 0, que con codificacion
    // de efectos es exactamente la media de los bloques. Y las esquinas dejan
    // el indicador de curvatura tambien a 0.
    active.forEach((t, i) => {
      let prod = 1;
      for (const m of t.members) prod *= pt[m];
      v += fit.terms[nBlk + i].coef * prod;
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

  // Con que interaccion esta confundido cada bloque. Al partir una replica, la
  // columna de bloque COINCIDE con una columna de interaccion: esa interaccion
  // deja de ser estimable y hay que decirlo, o el usuario creera que la tiene.
  // Se busca sobre todos los ordenes, no solo hasta maxOrder: en un 2^4 en dos
  // bloques la palabra es ABCD, que con orden 2 no esta en la lista de terminos.
  const everyTerm = buildTerms(facNames, facNames.length);
  const everyCol = everyTerm.map((t) => {
    const col = termColumn(coded, t);
    return cornerIdx.map((i) => col[i]);
  });

  const blockConfounded = blkTerms.map((_, bi) => {
    const bc = cornerIdx.map((i) => blkCols[bi][i]);
    for (let j = 0; j < everyTerm.length; j++) {
      const col = everyCol[j];
      let same = true;
      let opp = true;
      for (let i = 0; i < bc.length; i++) {
        if (bc[i] !== col[i]) same = false;
        if (bc[i] !== -col[i]) opp = false;
        if (!same && !opp) break;
      }
      // El signo importa para el rotulo: Minitab escribe "Block 1 - ABCD"
      // cuando la columna de bloque es la interaccion cambiada de signo.
      if (same) return { term: everyTerm[j].letters, sign: "+" };
      if (opp) return { term: everyTerm[j].letters, sign: "-" };
    }
    // Bloqueo por replica: cada bloque tiene todas las esquinas y no confunde.
    return null;
  });

  const aliases = useBlocks
    ? [
        ...aliasFac.slice(0, 1),
        ...blkTerms.map((t, i) => {
          const c = blockConfounded[i];
          return {
            term: c === null ? t.letters : `${t.letters} ${c.sign} ${c.term}`,
            aliases: [] as string[],
          };
        }),
        ...aliasFac.slice(1),
      ]
    : aliasFac;

  // Un bloque confundido con una interaccion es aliasing, y el cierre del
  // informe no puede seguir diciendo que nada lo esta.
  const cleanAliases =
    aliasClean && blockConfounded.every((c) => c === null);

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
    removedAliased,
    droppedCtPt,
    requestedTerms: requested.length,
    hasCenterPoints,
    nCenterPoints,
    centerFactors,
    blockLevels,
    usedBlocks: useBlocks,
    usedLenth,
    pse,
    lenthDF,
    lenthMargin,
    paretoLimit,
    effectsPlot,
    mainEffects,
    interactions,
    advice: buildAdvice(rows, facNames, alpha, usedLenth, useCtPt, useBlocks),
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
 *
 * Ni la curvatura ni los bloques se proponen NUNCA para retirar. La curvatura es
 * la unica prueba de que el plano describe los datos; los bloques representan
 * como se corrio el experimento, no una hipotesis sobre el proceso. Quitar
 * cualquiera de los dos manda su variabilidad al error y sesga los contrastes.
 */
function buildAdvice(
  rows: TermRow[],
  facNames: string[],
  alpha: number,
  usedLenth: boolean,
  useCtPt: boolean,
  useBlocks: boolean
): Advice {
  const keys = new Set(rows.map((r) => r.term.key));
  const isParent = (key: string): boolean =>
    rows.some(
      (o) => o.term.key !== key && parentKeys(o.term, facNames).includes(key)
    );

  // Solo los terminos factoriales entran en la poda: order > 0.
  const factorRows = rows.filter((r) => r.term.order > 0);
  const removable = factorRows.filter((r) => !isParent(r.term.key));
  const worst = removable.reduce<TermRow | null>(
    (best, r) => (best === null || r.p > best.p ? r : best),
    null
  );

  const al = alpha.toString().replace(".", ",");
  const ctPtNote = useCtPt
    ? ` The ${CT_PT_KEY} term is never proposed for removal: it is the only test that ` +
      `the response is a plane between the levels.`
    : "";
  const blkNote = useBlocks
    ? ` Neither are the block terms: they record how the experiment was actually ` +
      `run, not a hypothesis about the process.`
    : "";

  if (worst && worst.p > alpha) {
    const next = factorRows
      .filter((r) => r.term.key !== worst.term.key)
      .map((r) => r.term.key);
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
        `term at a time: the others change when it goes.` +
        ctPtNote +
        blkNote,
      nextTerms: next,
    };
  }

  const stuck = factorRows.filter((r) => r.p > alpha && isParent(r.term.key));
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

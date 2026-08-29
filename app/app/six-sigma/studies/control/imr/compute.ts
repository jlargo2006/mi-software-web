// app/app/six-sigma/studies/control/imr/compute.ts
import type { ColumnSnapshot } from "../../types";
import { toNumericCells } from "../../../lib/stats";
import { runTests } from "./tests";
import type {
  ImrParams,
  ImrResult,
  Stage,
  Violation,
} from "./types";

const fail = (error: string): ImrResult => ({ ok: false, error });

const parseNum = (s: string): number | null => {
  const t = s.trim().replace(",", ".");
  if (t === "") return null;
  const v = Number(t);
  return Number.isFinite(v) ? v : null;
};

/**
 * Constantes de los rangos moviles.
 *
 *   d2  media del rango relativa a sigma
 *   d3  desviacion del rango relativa a sigma, para los limites del MR
 *   d4  mediana del rango relativa a sigma
 */
const D2: Record<number, number> = { 2: 1.128, 3: 1.693, 4: 2.059, 5: 2.326, 6: 2.534 };
const D3: Record<number, number> = { 2: 0.8525, 3: 0.8884, 4: 0.8798, 5: 0.8641, 6: 0.8480 };
const D4: Record<number, number> = { 2: 0.954, 3: 1.588, 4: 1.978, 5: 2.257, 6: 2.472 };

/** Parsea "3 12:15 20" en indices 1-based. */
function parseOmit(s: string, n: number): number[] {
  const out = new Set<number>();
  for (const tok of s.split(/[\s,;]+/)) {
    if (tok === "") continue;
    const m = tok.match(/^(\d+):(\d+)$/);
    if (m) {
      const a = Number(m[1]);
      const b = Number(m[2]);
      for (let i = Math.min(a, b); i <= Math.max(a, b); i++)
        if (i >= 1 && i <= n) out.add(i);
    } else {
      const v = Number(tok);
      if (Number.isInteger(v) && v >= 1 && v <= n) out.add(v);
    }
  }
  return [...out].sort((a, b) => a - b);
}

const median = (v: number[]): number => {
  if (v.length === 0) return NaN;
  const s = [...v].sort((a, b) => a - b);
  const h = s.length >> 1;
  return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2;
};

/** Lambda de Box-Cox por maxima verosimilitud, busqueda por seccion dorada. */
function optimalLambda(x: number[]): number {
  const n = x.length;
  const sumLog = x.reduce((s, v) => s + Math.log(v), 0);
  const negLL = (lam: number) => {
    const y =
      Math.abs(lam) < 1e-10
        ? x.map(Math.log)
        : x.map((v) => (Math.pow(v, lam) - 1) / lam);
    const m = y.reduce((s, v) => s + v, 0) / n;
    const s2 = y.reduce((s, v) => s + (v - m) ** 2, 0) / n;
    if (!(s2 > 0)) return 1e300;
    return (n / 2) * Math.log(s2) - (lam - 1) * sumLog;
  };
  const phi = (Math.sqrt(5) - 1) / 2;
  let a = -5;
  let b = 5;
  let c = b - phi * (b - a);
  let d = a + phi * (b - a);
  let fc = negLL(c);
  let fd = negLL(d);
  for (let i = 0; i < 200; i++) {
    if (fc < fd) {
      b = d;
      d = c;
      fd = fc;
      c = b - phi * (b - a);
      fc = negLL(c);
    } else {
      a = c;
      c = d;
      fc = fd;
      d = a + phi * (b - a);
      fd = negLL(d);
    }
    if (Math.abs(b - a) < 1e-10) break;
  }
  return (a + b) / 2;
}

const applyBoxCox = (v: number, lam: number): number =>
  Math.abs(lam) < 1e-10 ? Math.log(v) : (Math.pow(v, lam) - 1) / lam;

export function computeImr(
  data: ColumnSnapshot,
  params: ImrParams
): ImrResult {
  const name = params.col?.trim() ?? "";
  if (name === "") return fail("Select the measurement column.");
  const col = data[name];
  if (!col) return fail(`Column "${name}" does not exist.`);

  const rawCells = col.values ?? [];
  const raw = toNumericCells(rawCells);
  const nMissing =
    rawCells.filter((c) => String(c ?? "").trim() !== "").length - raw.length;

  if (raw.length < 10) {
    return fail(
      "At least ten observations are needed: control limits from fewer are too unstable to act on."
    );
  }

  // --- Box-Cox ----------------------------------------------------------
  let lambda: number | null = null;
  if (params.boxcox !== "none") {
    if (raw.some((v) => v <= 0)) {
      return fail(
        "A Box-Cox transformation needs strictly positive data; this column contains zero or negative values."
      );
    }
    if (params.boxcox === "ln") lambda = 0;
    else if (params.boxcox === "sqrt") lambda = 0.5;
    else if (params.boxcox === "optimal") lambda = optimalLambda(raw);
    else {
      const v = parseNum(params.boxcoxLambda);
      if (v === null || v < -5 || v > 5)
        return fail("Enter a Box-Cox \u03BB between \u22125 and 5.");
      lambda = v;
    }
  }

  const values = lambda === null ? raw : raw.map((v) => applyBoxCox(v, lambda!));
  const n = values.length;

  // --- Etapas -----------------------------------------------------------
  const stageOf: number[] = new Array(n).fill(0);
  const stageLabels: string[] = [];
  const sName = params.stageCol?.trim() ?? "";
  if (sName !== "") {
    const sCol = data[sName];
    if (!sCol) return fail(`Stage column "${sName}" does not exist.`);
    const cells = (sCol.values ?? []).map((c) => String(c ?? "").trim());
    if (cells.length < n)
      return fail("The stage column has fewer rows than the measurement column.");
    // Una etapa nueva empieza cada vez que cambia el valor, no cada vez que
    // aparece un valor distinto: una etapa que reaparece mas tarde es otra.
    let cur = -1;
    let prev: string | null = null;
    for (let i = 0; i < n; i++) {
      const v = cells[i] === "" ? "\u2014" : cells[i];
      if (v !== prev) {
        cur += 1;
        stageLabels.push(v);
        prev = v;
      }
      stageOf[i] = cur;
    }
  } else {
    stageLabels.push("");
  }
  const nStages = stageLabels.length;

  // --- Rangos moviles ---------------------------------------------------
  const len = Math.max(2, Math.min(6, Math.round(parseNum(params.mrLength) ?? 2)));
  const mr: (number | null)[] = new Array(n).fill(null);
  for (let i = len - 1; i < n; i++) {
    // Un rango que cruza una frontera de etapa no es variacion del proceso:
    // es el salto que define la etapa. Se descarta.
    let ok = true;
    for (let j = i - len + 1; j <= i; j++) if (stageOf[j] !== stageOf[i]) ok = false;
    if (!ok) continue;
    let lo = Infinity;
    let hi = -Infinity;
    for (let j = i - len + 1; j <= i; j++) {
      lo = Math.min(lo, values[j]);
      hi = Math.max(hi, values[j]);
    }
    mr[i] = hi - lo;
  }

  // --- Estimacion por etapa --------------------------------------------
  const omitted = parseOmit(params.omit, n);
  const omitSet = new Set(omitted);

  const histMean = parseNum(params.histMean);
  const histSigma = parseNum(params.histSigma);
  const usedHistorical = histMean !== null || histSigma !== null;

  const d2 = D2[len] ?? D2[2];
  const d3 = D3[len] ?? D3[2];
  const d4 = D4[len] ?? D4[2];

  const iLoB = parseNum(params.iLowerBound);
  const iUpB = parseNum(params.iUpperBound);
  const mrUpB = parseNum(params.mrUpperBound);

  const stages: Stage[] = [];
  for (let s = 0; s < nStages; s++) {
    const idx: number[] = [];
    for (let i = 0; i < n; i++) if (stageOf[i] === s) idx.push(i);
    const keep = idx.filter((i) => !omitSet.has(i + 1));
    if (keep.length < 2) {
      return fail(
        `Stage "${stageLabels[s] || "1"}" has fewer than two usable observations after omissions.`
      );
    }

    const center =
      histMean !== null
        ? histMean
        : keep.reduce((t, i) => t + values[i], 0) / keep.length;

    const mrs = keep
      .map((i) => mr[i])
      .filter((v): v is number => v !== null);
    const mrStat =
      params.sigmaMethod === "median" ? median(mrs) : mrs.reduce((t, v) => t + v, 0) / mrs.length;

    const sigma =
      histSigma !== null
        ? histSigma
        : params.sigmaMethod === "median"
        ? mrStat / d4
        : mrStat / d2;

    // La linea central del MR se deriva de sigma, no al reves: asi los dos
    // graficos quedan coherentes cuando sigma viene dada como historica.
    const mrCenter = sigma * d2;

    let iUCL = center + 3 * sigma;
    let iLCL = center - 3 * sigma;
    if (iLoB !== null) iLCL = Math.max(iLCL, iLoB);
    if (iUpB !== null) iUCL = Math.min(iUCL, iUpB);

    let mrUCL = mrCenter + 3 * d3 * sigma;
    const mrLCL = Math.max(0, mrCenter - 3 * d3 * sigma);
    if (mrUpB !== null) mrUCL = Math.min(mrUCL, mrUpB);

    stages.push({
      label: stageLabels[s],
      from: idx[0],
      to: idx[idx.length - 1],
      center,
      sigma,
      iUCL,
      iLCL,
      mrCenter,
      mrUCL,
      mrLCL,
      nUsed: keep.length,
    });
  }

  // --- Tests ------------------------------------------------------------
  const on =
    params.testMode === "all"
      ? new Array(8).fill(true)
      : params.testMode === "one"
      ? [true, false, false, false, false, false, false, false]
      : params.testsOn.slice(0, 8);

  const kArr = params.testK.map((s, i) => {
    const v = parseNum(s);
    const dflt = [3, 9, 6, 14, 2, 4, 15, 8][i];
    return v === null || !(v > 0) ? dflt : v;
  });

  const centerArr = values.map((_, i) => stages[stageOf[i]].center);
  const sigmaArr = values.map((_, i) => stages[stageOf[i]].sigma);
  const mrCenterArr = values.map((_, i) => stages[stageOf[i]].mrCenter);
  const mrSigmaArr = values.map((_, i) => stages[stageOf[i]].sigma * d3);

  const iViolations: Violation[] = runTests({
    values,
    center: centerArr,
    sigma: sigmaArr,
    stageOf,
    on,
    k: kArr,
    allowed: [1, 2, 3, 4, 5, 6, 7, 8],
  });

  // Solo los tests 1 a 4 en el grafico de rangos moviles: ver tests.ts.
  const mrViolations: Violation[] = runTests({
    values: mr,
    center: mrCenterArr,
    sigma: mrSigmaArr,
    stageOf,
    on,
    k: kArr,
    allowed: [1, 2, 3, 4],
  });

  const flat = (vs: Violation[]) =>
    [...new Set(vs.flatMap((v) => v.points))].sort((a, b) => a - b);

  // --- Aviso sobre la forma ---------------------------------------------
  let shapeWarning: string | null = null;
  if (lambda === null) {
    const m = raw.reduce((t, v) => t + v, 0) / n;
    const sd = Math.sqrt(raw.reduce((t, v) => t + (v - m) ** 2, 0) / (n - 1));
    const skew =
      (n / ((n - 1) * (n - 2))) *
      raw.reduce((t, v) => t + ((v - m) / sd) ** 3, 0);
    if (Math.abs(skew) > 1) {
      shapeWarning = `The data are markedly skewed (skewness ${skew
        .toFixed(2)
        .replace(".", ",")}).`;
    }
  }

  return {
    ok: true,
    colName: col.name ?? name,
    n,
    nMissing,
    values,
    mr,
    stages,
    stageOf,
    iViolations,
    mrViolations,
    iFlagged: flat(iViolations),
    mrFlagged: flat(mrViolations),
    lambda,
    shapeWarning,
    usedHistorical,
    omitted,
  };
}

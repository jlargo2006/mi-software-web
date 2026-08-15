// app/app/six-sigma/lib/chiSquareAssociation.ts
import type {
  CSCell,
  HTChiSqAssocResult,
} from "../studies/ht/chisqassociation/types";

export interface CSInput {
  rowTitle: string;
  colTitle: string;
  rowLabels: string[];
  colLabels: string[];
  /** Matriz de recuentos observados, filas x columnas. */
  observed: number[][];
}

/** Log-gamma (Lanczos). */
function lgamma(x: number): number {
  const g = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
  const z = x - 1;
  let a = 0.99999999999980993;
  const t = z + 7.5;
  for (let i = 0; i < g.length; i++) a += g[i] / (z + i + 1);
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(a);
}

/** Gamma incompleta regularizada P(a,x) por serie. */
function gammaP(a: number, x: number): number {
  if (x <= 0) return 0;
  let sum = 1 / a;
  let term = sum;
  for (let n = 1; n < 1000; n++) {
    term *= x / (a + n);
    sum += term;
    if (Math.abs(term) < Math.abs(sum) * 1e-15) break;
  }
  return sum * Math.exp(-x + a * Math.log(x) - lgamma(a));
}

/** Gamma incompleta regularizada Q(a,x) por fraccion continua. */
function gammaQ(a: number, x: number): number {
  if (x <= 0) return 1;
  if (x < a + 1) return 1 - gammaP(a, x);
  const tiny = 1e-300;
  let b = x + 1 - a;
  let c = 1 / tiny;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 1000; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < tiny) d = tiny;
    c = b + an / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-15) break;
  }
  return Math.exp(-x + a * Math.log(x) - lgamma(a)) * h;
}

/** Cola superior de la chi-cuadrado con df grados de libertad. */
function chiSquareSf(x: number, df: number): number {
  if (!(x > 0) || !(df > 0)) return 1;
  return Math.min(1, Math.max(0, gammaQ(df / 2, x / 2)));
}

export function chiSquareAssociation(input: CSInput): HTChiSqAssocResult {
  const { rowTitle, colTitle, observed } = input;

  if (observed.length === 0 || observed[0].length === 0) {
    return { ok: false, error: "No data available to build the table." };
  }

  // --- 1. Descartar filas y columnas enteramente a cero ------------------
  // Una fila o columna vacia no aporta informacion y desvirtuaria los grados
  // de libertad, ademas de generar esperadas nulas.
  const rawR = observed.length;
  const rawC = observed[0].length;
  const rowSum = observed.map((r) => r.reduce((a, b) => a + b, 0));
  const colSum = Array.from({ length: rawC }, (_, j) =>
    observed.reduce((a, r) => a + r[j], 0)
  );
  const keepR: number[] = [];
  const keepC: number[] = [];
  for (let i = 0; i < rawR; i++) if (rowSum[i] > 0) keepR.push(i);
  for (let j = 0; j < rawC; j++) if (colSum[j] > 0) keepC.push(j);
  const droppedRows = rawR - keepR.length;
  const droppedCols = rawC - keepC.length;

  if (keepR.length < 2 || keepC.length < 2) {
    return {
      ok: false,
      error:
        "The table needs at least two non-empty rows and two non-empty columns.",
    };
  }

  const rowLabels = keepR.map((i) => input.rowLabels[i]);
  const colLabels = keepC.map((j) => input.colLabels[j]);
  const O = keepR.map((i) => keepC.map((j) => observed[i][j]));
  const R = O.length;
  const C = O[0].length;

  // --- 2. Marginales y esperadas -----------------------------------------
  const rowTotals = O.map((r) => r.reduce((a, b) => a + b, 0));
  const colTotals = Array.from({ length: C }, (_, j) =>
    O.reduce((a, r) => a + r[j], 0)
  );
  const total = rowTotals.reduce((a, b) => a + b, 0);

  if (total <= 0) {
    return { ok: false, error: "All counts are zero." };
  }

  // --- 3. Estadisticos ---------------------------------------------------
  let chiSqPearson = 0;
  let lrSum = 0;
  let nLowExpected = 0;
  let minExpected = Infinity;
  let hasZeroCell = false;

  const cells: CSCell[][] = O.map((row, i) =>
    row.map((o, j) => {
      const e = (rowTotals[i] * colTotals[j]) / total;
      if (e < 5) nLowExpected++;
      if (e < minExpected) minExpected = e;
      const residual = o - e;
      const contribution = e > 0 ? (residual * residual) / e : 0;
      chiSqPearson += contribution;
      // El cociente de verosimilitudes toma el limite 0 cuando O = 0, que es
      // el valor de O*ln(O/E) por continuidad.
      if (o === 0) hasZeroCell = true;
      else lrSum += o * Math.log(o / e);
      return {
        observed: o,
        expected: e,
        residual,
        stdResidual: e > 0 ? residual / Math.sqrt(e) : 0,
        contribution,
      };
    })
  );

  const chiSqLR = 2 * lrSum;
  const df = (R - 1) * (C - 1);

  return {
    ok: true,
    rowTitle,
    colTitle,
    rowLabels,
    colLabels,
    cells,
    rowTotals,
    colTotals,
    total,
    df,
    chiSqPearson,
    pPearson: chiSquareSf(chiSqPearson, df),
    chiSqLR,
    pLR: chiSquareSf(chiSqLR, df),
    nLowExpected,
    minExpected,
    hasZeroCell,
    droppedRows,
    droppedCols,
    nMissing: 0,
  };
}

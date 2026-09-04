// studies/graphicalSummary/compute.ts
import type { ColumnSnapshot } from "../types";
import type { Cell } from "../../lib/types";
import type {
  GraphicalSummaryParams,
  GraphicalSummaryPanel,
  GraphicalSummaryResult,
} from "./types";
import {
  buildContext,
  stDev,
  variance,
  seMean,
  skewness,
  kurtosis,
  median,
  percentile,
} from "../../lib/statistics";
import { tInv, chi2Inv, binomCdf } from "../../lib/distributions";
import { andersonDarlingNormal } from "../../lib/anderson-darling";
// Mismo agrupador que usan One-way ANOVA y Test for Equal Variances: empareja
// fila a fila, descarta la fila si falta valor o nivel, y ordena los niveles
// con orden natural. NO reimplementar aqui.
import { groupsFromStacked } from "../../lib/anova1way";

function trimTrailingEmpty(col: Cell[]): Cell[] {
  let last = col.length - 1;
  while (last >= 0 && String(col[last] ?? "").trim() === "") last--;
  return col.slice(0, last + 1);
}

const EMPTY_PANEL: GraphicalSummaryPanel = {
  colName: "",
  level: null,
  values: [],
  n: 0,
  nMissing: 0,
  aSquared: NaN,
  aStar: NaN,  
  pValue: NaN,
  mean: NaN,
  stDev: NaN,
  variance: NaN,
  skewness: NaN,
  kurtosis: NaN,
  min: NaN,
  q1: NaN,
  median: NaN,
  q3: NaN,
  max: NaN,
  confidence: 95,
  ciMean: [NaN, NaN],
  ciMedian: [NaN, NaN],
  ciStDev: [NaN, NaN],
};

const EMPTY: GraphicalSummaryResult = { byName: null, panels: [] };

export function computeGraphicalSummary(
  data: ColumnSnapshot,
  params: GraphicalSummaryParams
): GraphicalSummaryResult {
  const name = params.col;
  if (!name || !data[name]) return EMPTY;
  const colName = data[name].name;

  // --- Sin By variable: un solo panel, comportamiento de siempre ---
  if (!params.byCol || !data[params.byCol] || params.byCol === name) {
    const raw = trimTrailingEmpty(data[name].values);
    return {
      byName: null,
      panels: [computePanel(toNumbers(raw), colName, null, params.confidence)],
    };
  }

  // --- Con By variable: un panel por nivel, en orden natural ---
  const groups = groupsFromStacked(
    data[name].values,
    data[params.byCol].values
  );
  return {
    byName: data[params.byCol].name,
    panels: groups.map((g) =>
      computePanel(g.values, colName, g.name, params.confidence)
    ),
  };
}

function toNumbers(cells: Cell[]): number[] {
  return cells
    .map((v) => Number(String(v ?? "").trim().replace(",", ".")))
    .filter((v) => Number.isFinite(v));
}

/**
 * Un panel. Es el cuerpo original de computeGraphicalSummary, sin cambios de
 * calculo: solo recibe ya los numeros filtrados en vez de leer la hoja.
 *
 * El guard n < 4 es POR PANEL: un nivel con pocos datos degrada solo su
 * propio panel, no tumba el estudio entero.
 */
function computePanel(
  values: number[],
  colName: string,
  level: string | null,
  confidence: number
): GraphicalSummaryPanel {
  const ctx = buildContext(values);
  const n = ctx.n;
  if (n < 4) {
    return { ...EMPTY_PANEL, colName, level, values, n, nMissing: ctx.nMissing };
  }

  const conf = (confidence ?? 95) / 100;

  const alpha = 1 - conf;

  const mean = ctx.mean;
  const sd = stDev(ctx);
  const s = ctx.sorted;

  // ---------- Anderson-Darling ----------
  // Se reporta A² crudo. A* (corrección de muestra pequeña) solo alimenta el
  // p-valor: mostrarlo bajo la etiqueta "A-Squared" era incorrecto.
  const ad = andersonDarlingNormal(s, { mean, sd });
  const pValue = ad.pValue;

  // ---------- CI media (t) ----------
  const tcrit = tInv(1 - alpha / 2, n - 1);
  const me = tcrit * seMean(ctx);
  const ciMean: [number, number] = [mean - me, mean + me];

  // ---------- CI stdev (chi²) ----------
  const chiHi = chi2Inv(1 - alpha / 2, n - 1);
  const chiLo = chi2Inv(alpha / 2, n - 1);
  const ciStDev: [number, number] = [
    sd * Math.sqrt((n - 1) / chiHi),
    sd * Math.sqrt((n - 1) / chiLo),
  ];

  // ---------- CI mediana (Hettmansperger-Sheather) ----------
  const ciMedian = medianCI_HS(s, alpha);

  return {
    colName,
    level,
    values,
    n,
    nMissing: ctx.nMissing,
    aSquared: ad.aSquared,
    aStar: ad.aStar,
    pValue,
    mean,
    stDev: sd,
    variance: variance(ctx),
    skewness: skewness(ctx),
    kurtosis: kurtosis(ctx),
    min: s[0],
    q1: percentile(ctx, 0.25),
    median: median(ctx),
    q3: percentile(ctx, 0.75),
    max: s[n - 1],
    confidence: conf * 100,
    ciMean,
    ciMedian,
    ciStDev,
  };
}

/**
 * Intervalo de confianza de la mediana por interpolación
 * Hettmansperger-Sheather (1986). `s` debe venir ordenado asc.
 */
function medianCI_HS(s: number[], alpha: number): [number, number] {
  const n = s.length;
  const target = 1 - alpha;

  // cobertura del intervalo [x_(k), x_(n+1-k)] = 1 - 2*P(X <= k-1), X~Bin(n,0.5)
  const coverage = (k: number) => 1 - 2 * binomCdf(k - 1, n, 0.5);

  // buscar k tal que coverage(k) >= target >= coverage(k+1)
  let k = 1;
  while (k < Math.floor(n / 2) && coverage(k + 1) >= target) k++;

  const gK = coverage(k);
  const gK1 = coverage(k + 1);

  // si no hay interpolación posible, devolver el conservador
  if (!(gK > gK1) || gK < target) {
    return [s[k - 1], s[n - k]]; // índices 0-based de x_(k) y x_(n+1-k)
  }

  const I = (gK - target) / (gK - gK1);
  const lambda = (I * (n - k)) / ((1 - I) * k + I * (n - k));

  const lower = (1 - lambda) * s[k - 1] + lambda * s[k]; // x_(k), x_(k+1)
  const upper = (1 - lambda) * s[n - k] + lambda * s[n - k - 1]; // x_(n+1-k), x_(n-k)
  return [lower, upper];
}


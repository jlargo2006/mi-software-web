// studies/graphicalSummary/compute.ts
import type { ColumnSnapshot } from "../types";
import type { Cell } from "../../lib/types";
import type { GraphicalSummaryParams, GraphicalSummaryResult } from "./types";
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

function trimTrailingEmpty(col: Cell[]): Cell[] {
  let last = col.length - 1;
  while (last >= 0 && String(col[last] ?? "").trim() === "") last--;
  return col.slice(0, last + 1);
}

const EMPTY: GraphicalSummaryResult = {
  colName: "",
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

export function computeGraphicalSummary(
  data: ColumnSnapshot,
  params: GraphicalSummaryParams
): GraphicalSummaryResult {
  const name = params.col;
  if (!name || !data[name]) return EMPTY;

  const raw = trimTrailingEmpty(data[name].values);
  const ctx = buildContext(raw);
  const n = ctx.n;
  if (n < 4) return { ...EMPTY, colName: data[name].name, n, nMissing: ctx.nMissing };

  const conf = (params.confidence ?? 95) / 100;
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
    colName: data[name].name,
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


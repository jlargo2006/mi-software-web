// app/app/six-sigma/lib/kruskalWallis.ts
import type {
  KWBox,
  KWGroup,
  HTKruskalWallisResult,
} from "../studies/ht/kruskalwallis/types";

export interface KWInput {
  responseColumn: string;
  factorColumn: string;
  rawResponse: readonly (number | string | null | undefined)[];
  rawFactor: readonly (number | string | null | undefined)[];
}

function cellNum(c: number | string | null | undefined): number {
  if (typeof c === "number") return c;
  if (typeof c !== "string") return NaN;
  const t = c.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
}

function cellText(c: number | string | null | undefined): string {
  if (c === null || c === undefined) return "";
  return String(c).trim();
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

function medianSorted(s: readonly number[]): number {
  const n = s.length;
  if (n === 0) return NaN;
  const h = n >> 1;
  return n % 2 ? s[h] : (s[h - 1] + s[h]) / 2;
}

/** Cuantil al estilo Minitab: posicion (n+1)p con interpolacion lineal. */
function quantileMinitab(s: readonly number[], p: number): number {
  const n = s.length;
  if (n === 0) return NaN;
  const pos = (n + 1) * p;
  if (pos <= 1) return s[0];
  if (pos >= n) return s[n - 1];
  const lo = Math.floor(pos);
  return s[lo - 1] + (pos - lo) * (s[lo] - s[lo - 1]);
}

function makeBox(sorted: readonly number[]): KWBox {
  const q1 = quantileMinitab(sorted, 0.25);
  const q3 = quantileMinitab(sorted, 0.75);
  const iqr = q3 - q1;
  const loLimit = q1 - 1.5 * iqr;
  const hiLimit = q3 + 1.5 * iqr;
  const inside = sorted.filter((v) => v >= loLimit && v <= hiLimit);
  const outliers = sorted.filter((v) => v < loLimit || v > hiLimit);
  return {
    q1,
    median: medianSorted(sorted),
    q3,
    lowerFence: inside.length ? inside[0] : sorted[0],
    upperFence: inside.length
      ? inside[inside.length - 1]
      : sorted[sorted.length - 1],
    outliers,
  };
}

export function kruskalWallis(input: KWInput): HTKruskalWallisResult {
  const { responseColumn, factorColumn, rawResponse, rawFactor } = input;

  // --- 1. Limpieza por pares (respuesta, factor) -------------------------
  const rows: { v: number; g: string }[] = [];
  let nMissing = 0;
  const len = Math.max(rawResponse.length, rawFactor.length);
  for (let i = 0; i < len; i++) {
    const v = cellNum(rawResponse[i]);
    const g = cellText(rawFactor[i]);
    if (Number.isFinite(v) && g !== "") rows.push({ v, g });
    else nMissing++;
  }
  const N = rows.length;

  if (N < 2) {
    return {
      ok: false,
      error: "Select a numeric response column and a grouping column.",
    };
  }

  // --- 2. Rangos sobre la muestra combinada ------------------------------
  const idx = Array.from({ length: N }, (_, i) => i).sort(
    (a, b) => rows[a].v - rows[b].v
  );
  const ranks = new Array<number>(N);
  let tieTerm = 0;
  let i = 0;
  while (i < N) {
    let j = i;
    while (j + 1 < N && rows[idx[j + 1]].v === rows[idx[i]].v) j++;
    const avg = (i + j) / 2 + 1; // rangos 1-based
    const t = j - i + 1;
    if (t > 1) tieTerm += t * t * t - t;
    for (let k = i; k <= j; k++) ranks[idx[k]] = avg;
    i = j + 1;
  }
  const tiesCorrected = tieTerm > 0;

  // --- 3. Agregacion por nivel, en orden alfabetico ----------------------
  const byLevel = new Map<string, { values: number[]; rankSum: number }>();
  for (let r = 0; r < N; r++) {
    const key = rows[r].g;
    const e = byLevel.get(key);
    if (e) {
      e.values.push(rows[r].v);
      e.rankSum += ranks[r];
    } else {
      byLevel.set(key, { values: [rows[r].v], rankSum: ranks[r] });
    }
  }
  const levels = [...byLevel.keys()].sort((a, b) => a.localeCompare(b));

  if (levels.length < 2) {
    return {
      ok: false,
      error: "The grouping column must contain at least two different levels.",
    };
  }

  const overallMeanRank = (N + 1) / 2;
  // Var del rango medio de un grupo: N(N+1)/12 * (1/n_i - 1/N). El termino
  // -1/N es imprescindible: sin el, los Z-Value salen desviados.
  const base = (N * (N + 1)) / 12;

  let smallGroups = false;
  const groups: KWGroup[] = levels.map((level) => {
    const e = byLevel.get(level) as { values: number[]; rankSum: number };
    const values = e.values.sort((a, b) => a - b);
    const n = values.length;
    if (n < 5) smallGroups = true;
    const meanRank = e.rankSum / n;
    const varMean = base * (1 / n - 1 / N);
    const zValue = varMean > 0 ? (meanRank - overallMeanRank) / Math.sqrt(varMean) : NaN;
    return {
      level,
      n,
      median: medianSorted(values),
      meanRank,
      zValue,
      values,
      box: makeBox(values),
    };
  });

  // --- 4. Estadistico H --------------------------------------------------
  // H = 12/(N(N+1)) * sum n_i * (Rbar_i - (N+1)/2)^2
  let acc = 0;
  for (const g of groups) {
    const d = g.meanRank - overallMeanRank;
    acc += g.n * d * d;
  }
  const hNotAdj = (12 / (N * (N + 1))) * acc;

  // Correccion por empates: se divide por 1 - sum(t^3 - t)/(N^3 - N).
  const denom = 1 - tieTerm / (N * N * N - N);
  const hAdj = denom > 0 ? hNotAdj / denom : hNotAdj;

  const df = groups.length - 1;

  return {
    ok: true,
    responseColumn,
    factorColumn,
    nMissing,
    nTotal: N,
    overallMeanRank,
    groups,
    df,
    hNotAdj,
    pNotAdj: chiSquareSf(hNotAdj, df),
    hAdj,
    pAdj: chiSquareSf(hAdj, df),
    tieTerm,
    tiesCorrected,
    smallGroups,
  };
}

// lib/statistics.ts
// Cálculos base reutilizables. Se computan una sola vez por columna y se
// reparten entre todos los estadísticos (evita recomputar al crecer la app).
import type { Cell } from "./types";

export interface StatContext {
  raw: Cell[];
  values: number[];              // solo valores numéricos válidos (sin ordenar)
  sorted: number[];              // valores numéricos ordenados asc
  n: number;                     // N (no missing)
  nMissing: number;              // N* (celdas no numéricas / vacías)
  nTotal: number;                // n + nMissing
  sum: number;
  mean: number;
  // memo interno
  _m2?: number; // Σ(x-mean)^2
  _m3?: number; // Σ(x-mean)^3
  _m4?: number; // Σ(x-mean)^4
}

export function buildContext(raw: Cell[]): StatContext {
  const values: number[] = [];
  let nMissing = 0;

  for (const cell of raw) {
    if (cell === "" || cell === null || cell === undefined) {
      nMissing++;
      continue;
    }
    const num = typeof cell === "number" ? cell : Number(String(cell).trim());
    if (Number.isFinite(num)) values.push(num);
    else nMissing++;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const n = values.length;
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = n > 0 ? sum / n : NaN;

  return {
    raw,
    values,
    sorted,
    n,
    nMissing,
    nTotal: n + nMissing,
    sum,
    mean,
  };
}

// ---- Momentos centrales (memoizados) ----
export function m2(ctx: StatContext): number {
  if (ctx._m2 === undefined)
    ctx._m2 = ctx.values.reduce((a, x) => a + (x - ctx.mean) ** 2, 0);
  return ctx._m2;
}
export function m3(ctx: StatContext): number {
  if (ctx._m3 === undefined)
    ctx._m3 = ctx.values.reduce((a, x) => a + (x - ctx.mean) ** 3, 0);
  return ctx._m3;
}
export function m4(ctx: StatContext): number {
  if (ctx._m4 === undefined)
    ctx._m4 = ctx.values.reduce((a, x) => a + (x - ctx.mean) ** 4, 0);
  return ctx._m4;
}

// ---- Dispersión ----
export function variance(ctx: StatContext): number {
  return ctx.n > 1 ? m2(ctx) / (ctx.n - 1) : NaN; // muestral (n-1)
}
export function stDev(ctx: StatContext): number {
  return Math.sqrt(variance(ctx));
}

// ---- Cuartiles / percentiles (MÉTODO MINITAB) ----
// Posición = p * (n + 1), interpolación lineal. Fuera de rango => extremo.
export function percentile(ctx: StatContext, p: number): number {
  const s = ctx.sorted;
  const n = s.length;
  if (n === 0) return NaN;
  if (n === 1) return s[0];

  const pos = p * (n + 1); // posición 1-based
  if (pos <= 1) return s[0];
  if (pos >= n) return s[n - 1];

  const lo = Math.floor(pos);
  const frac = pos - lo;
  return s[lo - 1] + frac * (s[lo] - s[lo - 1]);
}

export function median(ctx: StatContext): number {
  const s = ctx.sorted;
  const n = s.length;
  if (n === 0) return NaN;
  const mid = Math.floor(n / 2);
  return n % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

// ---- Media recortada (MINITAB): quita 5% de cada cola, redondeado ----
export function trimmedMean(ctx: StatContext): number {
  const s = ctx.sorted;
  const n = s.length;
  if (n === 0) return NaN;
  const k = Math.round(n * 0.05); // nº a quitar por cada lado
  const trimmed = s.slice(k, n - k);
  if (trimmed.length === 0) return NaN;
  return trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
}

// ---- Forma (FÓRMULAS MINITAB) ----
// Skewness (Minitab / Excel SKEW)
export function skewness(ctx: StatContext): number {
  const n = ctx.n;
  const s = stDev(ctx);
  if (n < 3 || !Number.isFinite(s) || s === 0) return NaN;
  return (n / ((n - 1) * (n - 2))) * (m3(ctx) / s ** 3);
}

// Kurtosis exceso (Minitab / Excel KURT)
export function kurtosis(ctx: StatContext): number {
  const n = ctx.n;
  const s = stDev(ctx);
  if (n < 4 || !Number.isFinite(s) || s === 0) return NaN;
  const a = (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3));
  const b = (3 * (n - 1) ** 2) / ((n - 2) * (n - 3));
  return a * (m4(ctx) / s ** 4) - b;
}


// ---- MSSD (Minitab): Σ(x[i+1]-x[i])^2 / (2(n-1)) sobre orden ORIGINAL ----
// MSD = Σ(xi - x̄)² / n   (divide por n, NO por n-1)
export function msd(ctx: StatContext): number {
  const n = ctx.n;
  if (n < 1) return NaN;
  const mean = ctx.mean; // usa el nombre real del campo en tu StatContext
  const ss = ctx.values.reduce((acc, x) => acc + (x - mean) ** 2, 0);
  return ss / n;
}

// MSSD = Σ(x(i+1) - xi)² / (2(n-1))   (usa el ORDEN original de los datos)
export function mssd(ctx: StatContext): number {
  const v = ctx.values; // deben estar en orden de aparición, NO ordenados
  const n = v.length;
  if (n < 2) return NaN;
  let sum = 0;
  for (let i = 1; i < n; i++) sum += (v[i] - v[i - 1]) ** 2;
  return sum / (2 * (n - 1));
}

// ---- Otros ----
export function seMean(ctx: StatContext): number {
  return ctx.n > 0 ? stDev(ctx) / Math.sqrt(ctx.n) : NaN;
}
export function coefVar(ctx: StatContext): number {
  return ctx.mean !== 0 ? (stDev(ctx) / ctx.mean) * 100 : NaN;
}
export function range(ctx: StatContext): number {
  return ctx.n > 0 ? ctx.sorted[ctx.n - 1] - ctx.sorted[0] : NaN;
}
export function iqr(ctx: StatContext): number {
  return percentile(ctx, 0.75) - percentile(ctx, 0.25);
}
export function sumSquares(ctx: StatContext): number {
  return ctx.values.reduce((a, x) => a + x * x, 0); // Σx² (crudo, como Minitab)
}
// Todas las modas (empatadas). Si todos aparecen una vez => sin moda.
export function modes(ctx: StatContext): { modes: number[]; count: number } {
  if (ctx.n === 0) return { modes: [], count: 0 };
  const freq = new Map<number, number>();
  for (const x of ctx.values) freq.set(x, (freq.get(x) ?? 0) + 1);
  let max = 0;
  for (const c of freq.values()) if (c > max) max = c;
  if (max <= 1) return { modes: [], count: 0 }; // sin moda real
  const ms = [...freq.entries()]
    .filter(([, c]) => c === max)
    .map(([v]) => v)
    .sort((a, b) => a - b);
  return { modes: ms, count: max };
}

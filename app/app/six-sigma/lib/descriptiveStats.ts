// lib/descriptiveStats.ts
import * as S from "./statistics";
 
export type StatKey =
  // Grupo 1
  | "mean" | "seMean" | "stDev" | "variance" | "coefVar"
  // Grupo 2
  | "trMean" | "sum" | "min" | "max" | "range"
  // Grupo 3
  | "n" | "nMissing" | "nTotal" | "cumN" | "percent" | "cumPercent"
  // Grupo 4
  | "q1" | "median" | "q3" | "iqr" | "mode"
  // Grupo 5
  | "sumSq" | "skewness" | "kurtosis" | "msd" | "mssd";

export interface StatDef {
  key: StatKey;
  label: string;       // etiqueta en la tabla de resultados
  menuLabel: string;   // etiqueta en el pop-up
  group: 1 | 2 | 3 | 4 | 5;
  isDefault: boolean;  // marcado con * (Default)
  compute: (ctx: S.StatContext) => string; // devuelve ya formateado
}

// Formateo numérico coherente (ajústalo cuando validemos)
const f = (v: number, sig = 6): string => {
  if (!Number.isFinite(v)) return "*";
  if (v === 0) return "0";
  return Number(v.toPrecision(sig)).toString();
};

const fInt = (v: number): string => (Number.isFinite(v) ? String(v) : "*");

export const STAT_DEFS: StatDef[] = [
  // ---------- Grupo 1 ----------
  { key: "mean", label: "Mean", menuLabel: "Mean", group: 1, isDefault: true,
    compute: (c) => f(c.mean) },
  { key: "seMean", label: "SE Mean", menuLabel: "SE of mean", group: 1, isDefault: true,
    compute: (c) => f(S.seMean(c)) },
  { key: "stDev", label: "StDev", menuLabel: "Standard deviation", group: 1, isDefault: true,
    compute: (c) => f(S.stDev(c)) },
  { key: "variance", label: "Variance", menuLabel: "Variance", group: 1, isDefault: false,
    compute: (c) => f(S.variance(c)) },
  { key: "coefVar", label: "CoefVar", menuLabel: "Coefficient of variation", group: 1, isDefault: false,
    compute: (c) => f(S.coefVar(c), 2) },

  // ---------- Grupo 2 ----------
  { key: "trMean", label: "TrMean", menuLabel: "Trimmed mean", group: 2, isDefault: false,
    compute: (c) => f(S.trimmedMean(c)) },
  { key: "sum", label: "Sum", menuLabel: "Sum", group: 2, isDefault: false,
    compute: (c) => f(c.sum) },
  { key: "min", label: "Minimum", menuLabel: "Minimum", group: 2, isDefault: true,
    compute: (c) => (c.n ? f(c.sorted[0]) : "*") },
  { key: "max", label: "Maximum", menuLabel: "Maximum", group: 2, isDefault: true,
    compute: (c) => (c.n ? f(c.sorted[c.n - 1]) : "*") },
  { key: "range", label: "Range", menuLabel: "Range", group: 2, isDefault: false,
    compute: (c) => f(S.range(c)) },

  // ---------- Grupo 3 ----------
  { key: "n", label: "N", menuLabel: "N nonmissing", group: 3, isDefault: true,
    compute: (c) => fInt(c.n) },
  { key: "nMissing", label: "N*", menuLabel: "N missing", group: 3, isDefault: true,
    compute: (c) => fInt(c.nMissing) },
  { key: "nTotal", label: "N Total", menuLabel: "N total", group: 3, isDefault: false,
    compute: (c) => fInt(c.nTotal) },
  { key: "cumN", label: "CumN", menuLabel: "Cumulative N", group: 3, isDefault: false,
    compute: (c) => fInt(c.n) },
  { key: "percent", label: "Percent", menuLabel: "Percent", group: 3, isDefault: false,
    compute: (c) => (c.nTotal ? f((c.n / c.nTotal) * 100, 2) : "*") },
  { key: "cumPercent", label: "CumPct", menuLabel: "Cumulative percent", group: 3, isDefault: false,
    compute: (c) => (c.nTotal ? f((c.n / c.nTotal) * 100, 2) : "*") },

  // ---------- Grupo 4 ----------
  { key: "q1", label: "Q1", menuLabel: "First quartile", group: 4, isDefault: true,
    compute: (c) => f(S.percentile(c, 0.25)) },
  { key: "median", label: "Median", menuLabel: "Median", group: 4, isDefault: true,
    compute: (c) => f(S.median(c)) },
  { key: "q3", label: "Q3", menuLabel: "Third quartile", group: 4, isDefault: true,
    compute: (c) => f(S.percentile(c, 0.75)) },
  { key: "iqr", label: "IQR", menuLabel: "Interquartile range", group: 4, isDefault: false,
    compute: (c) => f(S.iqr(c)) },
  { key: "mode", label: "Mode", menuLabel: "Mode", group: 4, isDefault: false,
    compute: (c) => {
      const { modes } = S.modes(c);
      return modes.length ? modes.map((m) => f(m)).join(", ") : "*";
    } },

  // ---------- Grupo 5 ----------
  { key: "sumSq", label: "SumSq", menuLabel: "Sum of squares", group: 5, isDefault: false,
    compute: (c) => f(S.sumSquares(c)) },
  { key: "skewness", label: "Skewness", menuLabel: "Skewness", group: 5, isDefault: false,
    compute: (c) => f(S.skewness(c)) },
  { key: "kurtosis", label: "Kurtosis", menuLabel: "Kurtosis", group: 5, isDefault: false,
    compute: (c) => f(S.kurtosis(c)) },
  { key: "msd", label: "MSD", menuLabel: "MSD", group: 5, isDefault: false,
    compute: (c) => f(S.msd(c)) },
  { key: "mssd", label: "MSSD", menuLabel: "MSSD", group: 5, isDefault: false,
    compute: (c) => f(S.mssd(c)) },
];

// Extra para "N for Mode" (se muestra junto a Mode si está activa)
export function modeCount(ctx: S.StatContext): string {
  const { count } = S.modes(ctx);
  return count > 0 ? String(count) : "*";
}

export const DEFAULT_KEYS: StatKey[] = STAT_DEFS.filter((s) => s.isDefault).map((s) => s.key);
export const ALL_KEYS: StatKey[] = STAT_DEFS.map((s) => s.key);

export const GROUP_TITLES: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Central tendency & dispersion",
  2: "Extremes & sums",
  3: "Counts",
  4: "Quartiles & mode",
  5: "Shape & other",
};

// Calcula solo las estadísticas seleccionadas para una columna
export function computeSelected(
  raw: Cell[],
  selected: Set<StatKey>
): Record<string, string> {
  const ctx = S.buildContext(raw);
  const out: Record<string, string> = {};
  for (const def of STAT_DEFS) {
    if (selected.has(def.key)) out[def.key] = def.compute(ctx);
  }
  return out;
}

// lib/descriptiveStats.ts  (al final del archivo)
import type { SheetData, Cell } from "./types";

// Extrae la columna CRUDA (incluyendo celdas vacías) para que buildContext
// pueda contar N y N* correctamente.
// ⚠️ NO uses getColumnValues: ese helper ya descarta los missing con toNumericColumn.
export function getRawColumn(sheet: SheetData, colIndex: number): Cell[] {
  const col = sheet.rows.map((row) => row[colIndex] ?? "");
  // Recorta las celdas vacías del FINAL (no son "missing" reales)
  let last = col.length - 1;
  while (last >= 0 && String(col[last]).trim() === "") last--;
  return col.slice(0, last + 1);
}





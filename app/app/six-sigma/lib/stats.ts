// lib/stats.ts
import type { NormalityResult, CapabilityResult, Cell } from "./types";

export function toNumericCells(values: Cell[]): number[] {
  const out: number[] = [];
  for (const v of values) {
    if (v === null || v === undefined) continue;
    const s = String(v).trim();
    if (s === "") continue;
    const n = Number(s.replace(",", "."));
    if (Number.isFinite(n)) out.push(n);
  }
  return out;
}

// --- Estadística básica ---
export function mean(data: number[]): number {
  if (data.length === 0) return 0;
  return data.reduce((a, b) => a + b, 0) / data.length;
}

// Desviación estándar muestral (n - 1)
export function std(data: number[]): number {
  const n = data.length;
  if (n < 2) return 0;
  const m = mean(data);
  const variance = data.reduce((acc, x) => acc + (x - m) ** 2, 0) / (n - 1);
  return Math.sqrt(variance);
}

// Función de distribución acumulada Normal estándar (aprox. Abramowitz-Stegun)
export function normCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp(-(z * z) / 2);
  let p =
    d *
    t *
    (0.31938153 +
      t *
        (-0.356563782 +
          t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  p = z > 0 ? 1 - p : p;
  return p;
}

// --- Convierte una columna del grid en números válidos ---
export function toNumericColumn(values: (string | number)[]): number[] {
  return values
    .map((v) => (typeof v === "number" ? v : parseFloat(String(v))))
    .filter((v) => !Number.isNaN(v));
}

// --- Test de normalidad de Anderson-Darling ---
export function normalityTest(raw: number[]): NormalityResult {
  const data = [...raw].sort((a, b) => a - b);
  const n = data.length;
  const m = mean(data);
  const s = std(data);

  let adStatistic = 0;
  let pValue = 1;

  if (n >= 3 && s > 0) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const zi = (data[i] - m) / s;
      const cdf = normCDF(zi);
      const cdfComp = normCDF((data[n - 1 - i] - m) / s);
      // protegemos los logaritmos
      const a = Math.max(cdf, 1e-12);
      const b = Math.max(1 - cdfComp, 1e-12);
      sum += (2 * (i + 1) - 1) * (Math.log(a) + Math.log(b));
    }
    const aSquared = -n - sum / n;
    // Corrección para muestra finita
    adStatistic = aSquared * (1 + 0.75 / n + 2.25 / (n * n));
    pValue = adPValue(adStatistic);
  }

  return {
    n,
    mean: m,
    std: s,
    adStatistic,
    pValue,
    isNormal: pValue > 0.05,
    sortedData: data,
  };
}

// Aproximación del p-valor a partir del estadístico AD ajustado
function adPValue(ad: number): number {
  if (ad >= 0.6) {
    return Math.exp(1.2937 - 5.709 * ad + 0.0186 * ad * ad);
  } else if (ad >= 0.34) {
    return Math.exp(0.9177 - 4.279 * ad - 1.38 * ad * ad);
  } else if (ad >= 0.2) {
    return 1 - Math.exp(-8.318 + 42.796 * ad - 59.938 * ad * ad);
  } else {
    return 1 - Math.exp(-13.436 + 101.14 * ad - 223.73 * ad * ad);
  }
}

// --- Estudio de capacidad (Minitab-style) ---
export function capabilityStudy(
  raw: number[],
  lsl: number | null,
  usl: number | null,
  target: number | null,
  subgroupSize: number = 1
): CapabilityResult {
  const n = raw.length;
  const m = mean(raw);
  const sOverall = std(raw); // n-1
  const sWithin =
    subgroupSize <= 1
      ? stdWithinMovingRange(raw)
      : stdWithinPooled(raw, subgroupSize);

  // Helper PPM esperado
  const expBelow = (s: number) =>
    lsl !== null && s > 0 ? normCDF((lsl - m) / s) * 1e6 : null;
  const expAbove = (s: number) =>
    usl !== null && s > 0 ? (1 - normCDF((usl - m) / s)) * 1e6 : null;

  // Observed PPM
  const ppmObsLSL =
    lsl !== null ? (raw.filter((x) => x < lsl).length / n) * 1e6 : null;
  const ppmObsUSL =
    usl !== null ? (raw.filter((x) => x > usl).length / n) * 1e6 : null;
  const ppmObsTotal = (ppmObsLSL ?? 0) + (ppmObsUSL ?? 0);

  // Expected Overall / Within
  const ppmExpOverallLSL = expBelow(sOverall);
  const ppmExpOverallUSL = expAbove(sOverall);
  const ppmExpOverallTotal = (ppmExpOverallLSL ?? 0) + (ppmExpOverallUSL ?? 0);
  const ppmExpWithinLSL = expBelow(sWithin);
  const ppmExpWithinUSL = expAbove(sWithin);
  const ppmExpWithinTotal = (ppmExpWithinLSL ?? 0) + (ppmExpWithinUSL ?? 0);

  // Z benches (Φ⁻¹(1 - p_total))
  const zBench = (totalPPM: number) =>
    totalPPM > 0 && totalPPM < 1e6 ? normInv(1 - totalPPM / 1e6) : null;

  // Overall (Pp/Ppk)
  let pp: number | null = null,
    ppl: number | null = null,
    ppu: number | null = null,
    ppk: number | null = null,
    zLSLOverall: number | null = null,
    zUSLOverall: number | null = null;
  // Within (Cp/Cpk)
  let cp: number | null = null,
    cpl: number | null = null,
    cpu: number | null = null,
    cpk: number | null = null,
    zLSLWithin: number | null = null,
    zUSLWithin: number | null = null;

  if (sOverall > 0) {
    if (lsl !== null && usl !== null) pp = (usl - lsl) / (6 * sOverall);
    if (lsl !== null) {
      ppl = (m - lsl) / (3 * sOverall);
      zLSLOverall = (m - lsl) / sOverall;
    }
    if (usl !== null) {
      ppu = (usl - m) / (3 * sOverall);
      zUSLOverall = (usl - m) / sOverall;
    }
    ppk =
      ppl !== null && ppu !== null
        ? Math.min(ppl, ppu)
        : ppl ?? ppu ?? null;
  }
  if (sWithin > 0) {
    if (lsl !== null && usl !== null) cp = (usl - lsl) / (6 * sWithin);
    if (lsl !== null) {
      cpl = (m - lsl) / (3 * sWithin);
      zLSLWithin = (m - lsl) / sWithin;
    }
    if (usl !== null) {
      cpu = (usl - m) / (3 * sWithin);
      zUSLWithin = (usl - m) / sWithin;
    }
    cpk =
      cpl !== null && cpu !== null
        ? Math.min(cpl, cpu)
        : cpl ?? cpu ?? null;
  }

  return {
    n,
    mean: m,
    std: sOverall,
    lsl,
    usl,
    target,
    cp,
    cpk,
    cpl,
    cpu,
    subgroupSize,
    stdOverall: sOverall,
    stdWithin: sWithin,
    ppmObsLSL,
    ppmObsUSL,
    ppmObsTotal,
    ppmExpOverallLSL,
    ppmExpOverallUSL,
    ppmExpOverallTotal,
    ppmExpWithinLSL,
    ppmExpWithinUSL,
    ppmExpWithinTotal,
    pp,
    ppl,
    ppu,
    ppk,
    zBenchOverall: zBench(ppmExpOverallTotal),
    zLSLOverall,
    zUSLOverall,
    zBenchWithin: zBench(ppmExpWithinTotal),
    zLSLWithin,
    zUSLWithin,
    data: raw,
  };
}

// --- Inversa de la Normal estándar (Acklam) ---
export function normInv(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416];
  const pl = 0.02425;
  let q: number, r: number;
  if (p < pl) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= 1 - pl) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
}

// StDev(Within) para subgrupo = 1 -> rango móvil / d2 (d2 = 1.128)
function stdWithinMovingRange(data: number[]): number {
  if (data.length < 2) return 0;
  let sumMR = 0;
  for (let i = 1; i < data.length; i++) sumMR += Math.abs(data[i] - data[i - 1]);
  const mrBar = sumMR / (data.length - 1);
  return mrBar / 1.128;
}

// StDev(Within) para subgrupo > 1 -> pooled (subgrupos consecutivos)
function stdWithinPooled(data: number[], k: number): number {
  if (k < 2) return stdWithinMovingRange(data);
  let num = 0;
  let den = 0;
  for (let start = 0; start + k <= data.length; start += k) {
    const grp = data.slice(start, start + k);
    const gm = grp.reduce((a, b) => a + b, 0) / k;
    const ss = grp.reduce((acc, x) => acc + (x - gm) ** 2, 0);
    num += ss;
    den += k - 1;
  }
  return den > 0 ? Math.sqrt(num / den) : 0;
}

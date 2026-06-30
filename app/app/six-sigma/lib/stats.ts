import type { NormalityResult, CapabilityResult } from "./types";

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

// --- Estudio de capacidad (Cp / Cpk) ---
export function capabilityStudy(
  raw: number[],
  lsl: number | null,
  usl: number | null,
  target: number | null
): CapabilityResult {
  const m = mean(raw);
  const s = std(raw);

  let cp: number | null = null;
  let cpu: number | null = null;
  let cpl: number | null = null;
  let cpk: number | null = null;

  if (s > 0) {
    if (lsl !== null && usl !== null) {
      cp = (usl - lsl) / (6 * s);
    }
    if (usl !== null) cpu = (usl - m) / (3 * s);
    if (lsl !== null) cpl = (m - lsl) / (3 * s);

    if (cpu !== null && cpl !== null) cpk = Math.min(cpu, cpl);
    else if (cpu !== null) cpk = cpu;
    else if (cpl !== null) cpk = cpl;
  }

  return {
    n: raw.length,
    mean: m,
    std: s,
    lsl,
    usl,
    target,
    cp,
    cpk,
    cpl,
    cpu,
    data: raw,
  };
}

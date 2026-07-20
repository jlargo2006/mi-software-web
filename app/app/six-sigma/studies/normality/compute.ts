// studies/normality/compute.ts
import type { ColumnSnapshot } from "../types";
import type { Cell } from "../../lib/types";
import type { NormalityParams, NormalityResult } from "./types";
// Genéricos: se quedan en lib/stats
import { mean, std, normCDF, normInv } from "../../lib/stats";

// Convierte celdas a números válidos (frontera Cell[] -> number[])
const toNumeric = (values: Cell[]): number[] =>
  values.map(Number).filter((n) => !Number.isNaN(n));

// --- Específico de normalidad: p-valor a partir del AD ajustado ---
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

export function computeNormality(
  data: ColumnSnapshot,
  params: NormalityParams
): NormalityResult {
  const col = params.col ? data[params.col] : undefined;
  const colName = col?.name ?? "Column";
  const raw = toNumeric(col?.values ?? []);

  const sorted = [...raw].sort((a, b) => a - b);
  const n = sorted.length;
  const m = mean(sorted);
  const s = std(sorted);

  // --- Anderson-Darling (movido desde lib/stats.normalityTest) ---
  let adStatistic = 0;
  let pValue = 1;
  if (n >= 3 && s > 0) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const zi = (sorted[i] - m) / s;
      const cdf = normCDF(zi);
      const cdfComp = normCDF((sorted[n - 1 - i] - m) / s);
      const a = Math.max(cdf, 1e-12);
      const b = Math.max(1 - cdfComp, 1e-12);
      sum += (2 * (i + 1) - 1) * (Math.log(a) + Math.log(b));
    }
    const aSquared = -n - sum / n;
    adStatistic = aSquared * (1 + 0.75 / n + 2.25 / (n * n));
    pValue = adPValue(adStatistic);
  }

  // --- Datos del probability plot ---
  const tickPercents = [
    0.1, 1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 99.9,
  ];
  const tickVals = tickPercents.map((p) => normInv(p / 100));
  const tickText = tickPercents.map((p) => String(p));

  const pointsX: number[] = [];
  const pointsY: number[] = [];
  sorted.forEach((x, i) => {
    const p = (i + 1 - 0.3) / (n + 0.4);
    pointsX.push(x);
    pointsY.push(normInv(p));
  });

  const xMin = n > 0 ? sorted[0] : 0;
  const xMax = n > 0 ? sorted[n - 1] : 1;
  const pad = (xMax - xMin) * 0.03 || 1;
  const xRange: [number, number] = [xMin - pad, xMax + pad];

  const lineX: [number, number] = [xRange[0], xRange[1]];
  const lineY: [number, number] = [
    s > 0 ? (lineX[0] - m) / s : 0,
    s > 0 ? (lineX[1] - m) / s : 0,
  ];

  return {
    colName,
    n,
    mean: m,
    std: s,
    adStatistic,
    pValue,
    isNormal: pValue > 0.05,
    pointsX,
    pointsY,
    lineX,
    lineY,
    tickVals,
    tickText,
    xRange,
  };
}


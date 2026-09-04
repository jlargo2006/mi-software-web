// studies/normality/compute.ts
import type { ColumnSnapshot } from "../types";
import type { NormalityParams, NormalityResult } from "./types";
// Genericos: se quedan en lib/stats
import { mean, std, normCDF, normInv, toNumericCells } from "../../lib/stats";

// --- Especifico de normalidad: p-valor a partir del AD ajustado ---
// --- Especifico de normalidad: p-valor a partir del AD AJUSTADO (A*) ---
// Las cuatro ramas estan calibradas contra A* = A2*(1+0.75/n+2.25/n^2),
// no contra A2 crudo. Pasar A2 aqui da p-valores optimistas con n pequeno.
function adPValue(aStar: number): number {
  if (aStar >= 0.6) {
    return Math.exp(1.2937 - 5.709 * aStar + 0.0186 * aStar * aStar);
  } else if (aStar >= 0.34) {
    return Math.exp(0.9177 - 4.279 * aStar - 1.38 * aStar * aStar);
  } else if (aStar >= 0.2) {
    return 1 - Math.exp(-8.318 + 42.796 * aStar - 59.938 * aStar * aStar);
  } else {
    return 1 - Math.exp(-13.436 + 101.14 * aStar - 223.73 * aStar * aStar);
  }
}


export function computeNormality(
  data: ColumnSnapshot,
  params: NormalityParams
): NormalityResult {
  const col = params.col ? data[params.col] : undefined;
  const colName = col?.name ?? "Column";
  const raw = toNumericCells(col?.values ?? []);

  const sorted = [...raw].sort((a, b) => a - b);
  const n = sorted.length;
  const m = mean(sorted);
  const s = std(sorted);

  // --- Anderson-Darling ---
  let adStatistic = 0;
  let adStar = 0;
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
    // A2 crudo: es el estadistico que se reporta (Minitab lo llama AD).
    adStatistic = -n - sum / n;
    // A* solo sirve para entrar en las formulas del p-valor. No se muestra.
    adStar = adStatistic * (1 + 0.75 / n + 2.25 / (n * n));
    pValue = adPValue(adStar);
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
    adStar,
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

// studies/normality/compute.ts
import type { ColumnSnapshot } from "../types";
import type { NormalityParams, NormalityResult } from "./types";
// Genericos: se quedan en lib/stats
import { mean, std, normCDF, normInv, toNumericCells } from "../../lib/stats";
import { andersonDarlingNormal } from "../../lib/anderson-darling";

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
  // Se reporta A² crudo (adStatistic). A* solo alimenta el p-valor.
  const ad = andersonDarlingNormal(sorted, { mean: m, sd: s });
  const adStatistic = Number.isFinite(ad.aSquared) ? ad.aSquared : 0;
  const adStar = Number.isFinite(ad.aStar) ? ad.aStar : 0;
  const pValue = Number.isFinite(ad.pValue) ? ad.pValue : 1;

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

// studies/capability/compute.ts
import type { ColumnSnapshot } from "../types";
import type { CapabilityParams, CapabilityResult } from "./types";
import { mean, std, normCDF, normInv, toNumericCells } from "../../lib/stats";

// --- StDev(Within), subgrupo = 1 -> rango movil / d2 (d2 = 1.128) ---
function stdWithinMovingRange(data: number[]): number {
  if (data.length < 2) return 0;
  let sumMR = 0;
  for (let i = 1; i < data.length; i++) sumMR += Math.abs(data[i] - data[i - 1]);
  const mrBar = sumMR / (data.length - 1);
  return mrBar / 1.128;
}

// --- StDev(Within), subgrupo > 1 -> pooled ---
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

const parseNum = (s: string): number | null => {
  const n = parseFloat(s);
  return s.trim() !== "" && !Number.isNaN(n) ? n : null;
};

export function computeCapability(
  data: ColumnSnapshot,
  params: CapabilityParams
): CapabilityResult {
  const col = params.col ? data[params.col] : undefined;
  const colName = col?.name ?? "Column";
  const raw = toNumericCells(col?.values ?? []);

  const lsl = parseNum(params.lsl);
  const usl = parseNum(params.usl);
  const target = parseNum(params.target);
  const subgroupSize = parseInt(params.subgroupSize, 10) || 1;

  const n = raw.length;
  const m = mean(raw);
  const sOverall = std(raw);
  const sWithin =
    subgroupSize <= 1
      ? stdWithinMovingRange(raw)
      : stdWithinPooled(raw, subgroupSize);

  const expBelow = (s: number) =>
    lsl !== null && s > 0 ? normCDF((lsl - m) / s) * 1e6 : null;
  const expAbove = (s: number) =>
    usl !== null && s > 0 ? (1 - normCDF((usl - m) / s)) * 1e6 : null;

  const ppmObsLSL =
    lsl !== null && n > 0 ? (raw.filter((x) => x < lsl).length / n) * 1e6 : null;
  const ppmObsUSL =
    usl !== null && n > 0 ? (raw.filter((x) => x > usl).length / n) * 1e6 : null;
  const ppmObsTotal = (ppmObsLSL ?? 0) + (ppmObsUSL ?? 0);

  const ppmExpOverallLSL = expBelow(sOverall);
  const ppmExpOverallUSL = expAbove(sOverall);
  const ppmExpOverallTotal = (ppmExpOverallLSL ?? 0) + (ppmExpOverallUSL ?? 0);
  const ppmExpWithinLSL = expBelow(sWithin);
  const ppmExpWithinUSL = expAbove(sWithin);
  const ppmExpWithinTotal = (ppmExpWithinLSL ?? 0) + (ppmExpWithinUSL ?? 0);

  const zBench = (totalPPM: number) =>
    totalPPM > 0 && totalPPM < 1e6 ? normInv(1 - totalPPM / 1e6) : null;

  let pp: number | null = null,
    ppl: number | null = null,
    ppu: number | null = null,
    ppk: number | null = null,
    zLSLOverall: number | null = null,
    zUSLOverall: number | null = null;
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
    ppk = ppl !== null && ppu !== null ? Math.min(ppl, ppu) : ppl ?? ppu ?? null;
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
    cpk = cpl !== null && cpu !== null ? Math.min(cpl, cpu) : cpl ?? cpu ?? null;
  }

  // Rango del eje X (datos + limites), para que Results dibuje
  const xs = [...raw, lsl, usl, target].filter(
    (v): v is number => v !== null && v !== undefined
  );
  const xMin = xs.length ? Math.min(...xs) : 0;
  const xMax = xs.length ? Math.max(...xs) : 1;
  const pad = (xMax - xMin) * 0.1 || 1;
  const xRange: [number, number] = [xMin - pad, xMax + pad];

  return {
    colName,
    n,
    mean: m,
    std: sOverall,
    lsl,
    usl,
    target,
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
    cp,
    cpl,
    cpu,
    cpk,
    zBenchOverall: zBench(ppmExpOverallTotal),
    zLSLOverall,
    zUSLOverall,
    zBenchWithin: zBench(ppmExpWithinTotal),
    zLSLWithin,
    zUSLWithin,
    nums: raw,
    xRange,
  };
}

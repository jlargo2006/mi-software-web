// app/app/six-sigma/studies/capability/sixpack/compute.ts
import type { ColumnSnapshot } from "../../types";
import { mean, std, normCDF, normInv, toNumericCells, c4 } from "../../../lib/stats";
import type {
  CapSixpackParams,
  CapSixpackResult,
  ProbPoint,
  SubgroupRow,
} from "./types";

const fail = (error: string): CapSixpackResult => ({ ok: false, error });

const parseNum = (s: string): number | null => {
  const t = s.trim().replace(",", ".");
  if (t === "") return null;
  const v = Number(t);
  return Number.isFinite(v) ? v : null;
};

// --- Constantes de graficos de control -------------------------------------
// d2, D3, D4 para el grafico R; B3, B4 para el grafico S.
// Tabuladas porque son las que usan Minitab y el manual de AIAG.

const D2: Record<number, number> = {
  2: 1.128, 3: 1.693, 4: 2.059, 5: 2.326, 6: 2.534, 7: 2.704, 8: 2.847,
  9: 2.970, 10: 3.078, 11: 3.173, 12: 3.258, 13: 3.336, 14: 3.407, 15: 3.472,
  16: 3.532, 17: 3.588, 18: 3.640, 19: 3.689, 20: 3.735, 21: 3.778,
  22: 3.819, 23: 3.858, 24: 3.895, 25: 3.931,
};

const D3: Record<number, number> = {
  2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0.076, 8: 0.136, 9: 0.184, 10: 0.223,
  11: 0.256, 12: 0.283, 13: 0.307, 14: 0.328, 15: 0.347, 16: 0.363,
  17: 0.378, 18: 0.391, 19: 0.403, 20: 0.415, 21: 0.425, 22: 0.434,
  23: 0.443, 24: 0.451, 25: 0.459,
};

const D4: Record<number, number> = {
  2: 3.267, 3: 2.574, 4: 2.282, 5: 2.114, 6: 2.004, 7: 1.924, 8: 1.864,
  9: 1.816, 10: 1.777, 11: 1.744, 12: 1.717, 13: 1.693, 14: 1.672,
  15: 1.653, 16: 1.637, 17: 1.622, 18: 1.608, 19: 1.597, 20: 1.585,
  21: 1.575, 22: 1.566, 23: 1.557, 24: 1.548, 25: 1.541,
};

/** d2 para subgrupos mayores que la tabla: aproximacion asintotica. */
const d2Of = (n: number): number =>
  D2[n] ?? 1.128 + 0.8525 * Math.log(n / 2) / Math.log(2);

// --- Estimadores de sigma --------------------------------------------------

/**
 * Sigma de los GRAFICOS. Con Rbar/d2 o Sbar/c4 segun el tipo de grafico.
 *
 * Ojo: no coincide con stdWithinPooled. Minitab traza los limites del Xbar
 * chart con este estimador, el clasico del grafico, y calcula Cp y Cpk con el
 * pooled corregido. Con filler2 salen 2,1079 y 2,1263: la diferencia mueve el
 * UCL del Xbar de 222,474 a 222,496.
 */
function sigmaFromChart(groups: number[][], useS: boolean): number {
  const k = groups.length;
  if (k === 0) return 0;
  const n = groups[0].length;
  if (useS) {
    const sBar = groups.reduce((a, g) => a + std(g), 0) / k;
    return sBar / c4(n);
  }
  const rBar =
    groups.reduce((a, g) => a + (Math.max(...g) - Math.min(...g)), 0) / k;
  return rBar / d2Of(n);
}

/** Sigma within de capacidad: pooled corregido por sesgo. */
function stdWithinPooled(groups: number[][]): number {
  let num = 0;
  let den = 0;
  for (const g of groups) {
    const gm = g.reduce((a, b) => a + b, 0) / g.length;
    num += g.reduce((acc, x) => acc + (x - gm) ** 2, 0);
    den += g.length - 1;
  }
  if (den <= 0) return 0;
  return Math.sqrt(num / den) / c4(den + 1);
}

/** Sigma para subgrupo 1: rango movil medio entre d2(2). */
function sigmaMovingRange(data: number[]): number {
  if (data.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < data.length; i++) sum += Math.abs(data[i] - data[i - 1]);
  return sum / (data.length - 1) / 1.128;
}

// --- Anderson-Darling -----------------------------------------------------

/**
 * Estadistico A^2 para normalidad con media y varianza estimadas, y su
 * p-valor por la aproximacion de D'Agostino y Stephens (1986). El ajuste por
 * n importa: sin el, el p-valor se sesga en muestras pequenas.
 */
function andersonDarling(data: number[]): { stat: number; p: number } {
  const n = data.length;
  if (n < 5) return { stat: NaN, p: NaN };
  const m = mean(data);
  const s = std(data);
  if (!(s > 0)) return { stat: NaN, p: NaN };

  const z = [...data].sort((a, b) => a - b).map((v) => (v - m) / s);
  const F = z.map((v) => Math.min(Math.max(normCDF(v), 1e-15), 1 - 1e-15));

  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += (2 * (i + 1) - 1) * (Math.log(F[i]) + Math.log(1 - F[n - 1 - i]));
  }
  const stat = -n - sum / n;
  const adj = stat * (1 + 0.75 / n + 2.25 / (n * n));

  let p: number;
  if (adj >= 0.6) p = Math.exp(1.2937 - 5.709 * adj + 0.0186 * adj * adj);
  else if (adj >= 0.34) p = Math.exp(0.9177 - 4.279 * adj - 1.38 * adj * adj);
  else if (adj >= 0.2) p = 1 - Math.exp(-8.318 + 42.796 * adj - 59.938 * adj * adj);
  else p = 1 - Math.exp(-13.436 + 101.14 * adj - 223.73 * adj * adj);

  return { stat, p: Math.min(Math.max(p, 0), 1) };
}

// --- Calculo principal ----------------------------------------------------

export function computeCapSixpack(
  data: ColumnSnapshot,
  params: CapSixpackParams
): CapSixpackResult {
  const name = params.col?.trim() ?? "";
  if (name === "") return fail("Select the measurement column.");
  const col = data[name];
  if (!col) return fail(`Column "${name}" does not exist.`);

  const rawCells = col.values ?? [];
  const values = toNumericCells(rawCells);
  const nMissing = rawCells.filter(
    (c) => String(c ?? "").trim() !== ""
  ).length - values.length;

  const k0 = parseInt(params.subgroupSize, 10);
  const sub = Number.isFinite(k0) && k0 > 0 ? k0 : 1;
  if (sub > 25) {
    return fail("Subgroup sizes above 25 are not supported by the chart constants.");
  }

  const lastNRaw = parseInt(params.lastN, 10);
  const lastN = Number.isFinite(lastNRaw) && lastNRaw > 0 ? lastNRaw : 20;

  const lsl = parseNum(params.lsl);
  const usl = parseNum(params.usl);
  const target = parseNum(params.target);
  if (lsl === null && usl === null) {
    return fail("Enter at least one specification limit.");
  }
  if (lsl !== null && usl !== null && lsl >= usl) {
    return fail("The LSL must be smaller than the USL.");
  }

  const individuals = sub === 1;
  const nUsableGroups = Math.floor(values.length / sub);
  if (individuals ? values.length < 10 : nUsableGroups < 2) {
    return fail(
      individuals
        ? "At least ten observations are needed."
        : `At least two complete subgroups of ${sub} are needed.`
    );
  }

  const used = values.slice(0, nUsableGroups * sub);
  const nDropped = values.length - used.length;

  const groups: number[][] = [];
  for (let i = 0; i < nUsableGroups; i++) {
    groups.push(used.slice(i * sub, (i + 1) * sub));
  }

  const m = mean(used);
  const sOverall = std(used);
  if (!(sOverall > 0)) {
    return fail("All the values are identical: there is no variation to assess.");
  }

  // El grafico S sustituye al R desde subgrupo 9: el rango pierde eficiencia
  // con subgrupos grandes porque solo usa dos de las n observaciones.
  const useSChart = !individuals && sub > 8;

  const sigmaChart = individuals
    ? sigmaMovingRange(used)
    : sigmaFromChart(groups, useSChart);
  const stdWithin = individuals ? sigmaChart : stdWithinPooled(groups);

  // --- Grafico de medias (o de individuales) -----------------------------
  const rows: SubgroupRow[] = groups.map((g, i) => ({
    index: i + 1,
    values: g,
    mean: mean(g),
    range: Math.max(...g) - Math.min(...g),
    sd: g.length > 1 ? std(g) : 0,
  }));

  const xbarSpread = individuals ? 3 * sigmaChart : (3 * sigmaChart) / Math.sqrt(sub);
  const xbarUcl = m + xbarSpread;
  const xbarLcl = m - xbarSpread;
  const centres = individuals ? used : rows.map((r) => r.mean);
  const xbarOut = centres
    .map((v, i) => (v > xbarUcl || v < xbarLcl ? i + 1 : 0))
    .filter((v) => v > 0);

  // --- Grafico de dispersion ---------------------------------------------
  let spreadLabel: string;
  let spreadValues: number[];
  let spreadCenter: number;
  let spreadUcl: number;
  let spreadLcl: number;

  if (individuals) {
    spreadLabel = "MR";
    spreadValues = used.slice(1).map((v, i) => Math.abs(v - used[i]));
    spreadCenter = mean(spreadValues);
    spreadUcl = D4[2] * spreadCenter;
    spreadLcl = 0;
  } else if (useSChart) {
    spreadLabel = "S";
    spreadValues = rows.map((r) => r.sd);
    spreadCenter = mean(spreadValues);
    const cn = c4(sub);
    const corr = (3 * Math.sqrt(1 - cn * cn)) / cn;
    spreadUcl = spreadCenter * (1 + corr);
    spreadLcl = Math.max(0, spreadCenter * (1 - corr));
  } else {
    spreadLabel = "R";
    spreadValues = rows.map((r) => r.range);
    spreadCenter = mean(spreadValues);
    spreadUcl = (D4[sub] ?? 2) * spreadCenter;
    spreadLcl = (D3[sub] ?? 0) * spreadCenter;
  }

  const spreadOut = spreadValues
    .map((v, i) => (v > spreadUcl || v < spreadLcl ? i + 1 : 0))
    .filter((v) => v > 0);

  // --- Grafico de probabilidad normal ------------------------------------
  // Probabilidades de trazado de Benard, (i - 0,3) / (n + 0,4).
  const sorted = [...used].sort((a, b) => a - b);
  const probPoints: ProbPoint[] = sorted.map((x, i) => {
    const p = (i + 1 - 0.3) / (sorted.length + 0.4);
    return { x, p, z: normInv(p) };
  });
  const ad = andersonDarling(used);

  // --- Indices de capacidad ----------------------------------------------
  const idx = (s: number) => {
    if (!(s > 0)) return { c: null, ck: null, ppm: null as number | null };
    const c = lsl !== null && usl !== null ? (usl - lsl) / (6 * s) : null;
    const cl = lsl !== null ? (m - lsl) / (3 * s) : null;
    const cu = usl !== null ? (usl - m) / (3 * s) : null;
    const ck =
      cl !== null && cu !== null ? Math.min(cl, cu) : cl ?? cu ?? null;
    const below = lsl !== null ? normCDF((lsl - m) / s) : 0;
    const above = usl !== null ? 1 - normCDF((usl - m) / s) : 0;
    return { c, ck, ppm: (below + above) * 1e6 };
  };

  const wi = idx(stdWithin);
  const ov = idx(sOverall);

  const xs = [...used, lsl, usl, target].filter(
    (v): v is number => v !== null && v !== undefined
  );
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const pad = (xMax - xMin) * 0.08 || 1;

  const lastSubgroups = rows.slice(Math.max(0, rows.length - lastN));

  return {
    ok: true,
    colName: col.name ?? name,
    n: used.length,
    subgroupSize: sub,
    k: rows.length,
    nDropped,
    nMissing,
    mean: m,
    lsl,
    usl,
    target,
    sigmaChart,
    stdWithin,
    stdOverall: sOverall,
    useSChart,
    individuals,
    subgroups: rows,
    xbarCenter: m,
    xbarUcl,
    xbarLcl,
    xbarOut,
    spreadLabel,
    spreadCenter,
    spreadUcl,
    spreadLcl,
    spreadOut,
    probPoints,
    adStat: ad.stat,
    adPValue: ad.p,
    lastSubgroups,
    lastNShown: lastSubgroups.length,
    cp: wi.c,
    cpk: wi.ck,
    pp: ov.c,
    ppk: ov.ck,
    ppmWithin: wi.ppm,
    ppmOverall: ov.ppm,
    xRange: [xMin - pad, xMax + pad],
    allValues: used,
  };
}

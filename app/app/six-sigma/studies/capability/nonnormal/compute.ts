// app/app/six-sigma/studies/capability/nonnormal/compute.ts
import type { ColumnSnapshot } from "../../types";
import { normCDF, normInv, toNumericCells } from "../../../lib/stats";
import {
  distMean,
  distCDF,
  distQuantile,
  fitAll,
  type FitResult,
} from "./distributions";
import type { CapNonnormalParams, CapNonnormalResult } from "./types";

const fail = (error: string): CapNonnormalResult => ({ ok: false, error });

const parseNum = (s: string): number | null => {
  const t = s.trim().replace(",", ".");
  if (t === "") return null;
  const v = Number(t);
  return Number.isFinite(v) ? v : null;
};

export function computeCapNonnormal(
  data: ColumnSnapshot,
  params: CapNonnormalParams
): CapNonnormalResult {
  const name = params.col?.trim() ?? "";
  if (name === "") return fail("Select the measurement column.");
  const col = data[name];
  if (!col) return fail(`Column "${name}" does not exist.`);

  const rawCells = col.values ?? [];
  const values = toNumericCells(rawCells);
  const nMissing =
    rawCells.filter((c) => String(c ?? "").trim() !== "").length - values.length;

  if (values.length < 20) {
    return fail(
      "At least twenty observations are needed: fitting a nonnormal model to fewer is guesswork."
    );
  }

  const lsl = parseNum(params.lsl);
  const usl = parseNum(params.usl);
  const target = parseNum(params.target);
  if (lsl === null && usl === null) {
    return fail("Enter at least one specification limit.");
  }
  if (lsl !== null && usl !== null && lsl >= usl) {
    return fail("The LSL must be smaller than the USL.");
  }

  const kRaw = parseNum(params.k);
  const k = kRaw !== null && kRaw > 0 ? kRaw : 6;

  // Se ajustan todas las candidatas, no solo la elegida: la comparacion de AD
  // es la unica forma de saber si la eleccion del desplegable se sostiene.
  const allFits = fitAll(values);
  const fit: FitResult | undefined = allFits.find((f) => f.id === params.dist);
  if (!fit) return fail("Unknown distribution.");
  if (!fit.ok) return fail(fit.error ?? `The ${fit.label} fit failed.`);

  const { a, b } = fit;
  const n = values.length;

  const sampleMean = values.reduce((s, v) => s + v, 0) / n;
  const modelMean = distMean(fit.id, a, b);

  // --- Rendimiento observado ---------------------------------------------
  const obsBelow =
    lsl !== null ? (values.filter((v) => v < lsl).length / n) * 1e6 : null;
  const obsAbove =
    usl !== null ? (values.filter((v) => v > usl).length / n) * 1e6 : null;
  const obsTotal = (obsBelow ?? 0) + (obsAbove ?? 0);

  // --- Rendimiento esperado por el modelo --------------------------------
  // Un limite marcado como frontera fisica no genera fallo esperado.
  const pBelow =
    lsl !== null && !params.lslBoundary ? distCDF(fit.id, lsl, a, b) : null;
  const pAbove =
    usl !== null && !params.uslBoundary ? 1 - distCDF(fit.id, usl, a, b) : null;

  const clamp = (p: number) => Math.min(Math.max(p, 0), 1);
  const expBelow = pBelow === null ? null : clamp(pBelow) * 1e6;
  const expAbove = pAbove === null ? null : clamp(pAbove) * 1e6;
  const expTotal = (expBelow ?? 0) + (expAbove ?? 0);

  // --- Benchmark Z --------------------------------------------------------
  // La probabilidad de fallo se traduce al Z normal que daria la misma
  // probabilidad. No mide distancia en sigmas reales: mide riesgo.
  const zOf = (p: number | null): number | null => {
    if (p === null) return null;
    const q = clamp(p);
    if (q <= 0) return Infinity;
    if (q >= 1) return -Infinity;
    return normInv(1 - q);
  };
  const zLsl = zOf(pBelow);
  const zUsl = zOf(pAbove);

  const pTot = clamp((pBelow ?? 0) + (pAbove ?? 0));
  const zBench = pTot <= 0 ? Infinity : pTot >= 1 ? -Infinity : normInv(1 - pTot);

  const zCands = [zLsl, zUsl].filter(
    (v): v is number => v !== null && Number.isFinite(v)
  );
  const ppkZ = zCands.length ? Math.min(...zCands) / 3 : null;

  // --- Indices ISO por percentiles ---------------------------------------
  // Pp = (USL - LSL) / (x_alto - x_bajo), con la tolerancia de K sigmas
  // traducida a probabilidades: K = 6 da los percentiles 0,135 y 99,865.
  const pLow = normCDF(-k / 2);
  const pHigh = normCDF(k / 2);
  const xLow = distQuantile(fit.id, pLow, a, b);
  const xMid = distQuantile(fit.id, 0.5, a, b);
  const xHigh = distQuantile(fit.id, pHigh, a, b);

  const spread = xHigh - xLow;
  const pp =
    lsl !== null && usl !== null && spread > 0 ? (usl - lsl) / spread : null;
  const ppl =
    lsl !== null && xMid - xLow > 0 ? (xMid - lsl) / (xMid - xLow) : null;
  const ppu =
    usl !== null && xHigh - xMid > 0 ? (usl - xMid) / (xHigh - xMid) : null;
  const ppkCands = [ppl, ppu].filter((v): v is number => v !== null);
  const ppkPct = ppkCands.length ? Math.min(...ppkCands) : null;

  // --- Rango de dibujo ----------------------------------------------------
  const xs = [
    ...values,
    ...(lsl !== null ? [lsl] : []),
    ...(usl !== null ? [usl] : []),
    ...(target !== null ? [target] : []),
  ];
  const lo = Math.min(...xs);
  const hi = Math.max(...xs);
  const pad = (hi - lo) * 0.06 || 1;

  return {
    ok: true,
    colName: col.name ?? name,
    n,
    nMissing,
    fit,
    allFits,
    sampleMean,
    modelMean,
    lsl,
    usl,
    target,
    lslBoundary: params.lslBoundary,
    uslBoundary: params.uslBoundary,
    k,
    obsBelow,
    obsAbove,
    obsTotal,
    expBelow,
    expAbove,
    expTotal,
    zLsl,
    zUsl,
    zBench,
    ppkZ,
    xLow,
    xMid,
    xHigh,
    pp,
    ppl,
    ppu,
    ppkPct,
    values,
    xRange: [Math.max(0, lo - pad), hi + pad],
  };
}

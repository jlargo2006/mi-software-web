// app/app/six-sigma/studies/capability/nonnormal/types.ts
import type { DistId, FitResult } from "./distributions";

export interface CapNonnormalParams {
  col: string | null;
  /** Distribucion a ajustar. */
  dist: DistId;
  lsl: string;
  usl: string;
  target: string;
  /**
   * Si el limite es una frontera fisica y no un requisito de cliente, no
   * genera PPM esperados: nada puede caer al otro lado.
   */
  lslBoundary: boolean;
  uslBoundary: boolean;
  /** Anchura de tolerancia en sigmas para los indices por percentiles. */
  k: string;
}

export const CAPNONNORMAL_DEFAULT: CapNonnormalParams = {
  col: null,
  dist: "weibull",
  lsl: "",
  usl: "",
  target: "",
  lslBoundary: false,
  uslBoundary: false,
  k: "6",
};

export interface CapNonnormalModel {
  colName: string;
  n: number;
  nMissing: number;

  /** Distribucion ajustada y sus parametros. */
  fit: FitResult;
  /** Todas las candidatas, ordenadas por AD. */
  allFits: FitResult[];

  sampleMean: number;
  modelMean: number;
  lsl: number | null;
  usl: number | null;
  target: number | null;
  lslBoundary: boolean;
  uslBoundary: boolean;
  k: number;

  /** PPM contados en la muestra. */
  obsBelow: number | null;
  obsAbove: number | null;
  obsTotal: number;

  /** PPM segun el modelo ajustado. */
  expBelow: number | null;
  expAbove: number | null;
  expTotal: number;

  /** Benchmark Z: probabilidad de fallo traducida a un Z normal. */
  zLsl: number | null;
  zUsl: number | null;
  zBench: number | null;
  ppkZ: number | null;

  /** Percentiles de la tolerancia y de la mediana. */
  xLow: number;
  xMid: number;
  xHigh: number;

  /** Indices ISO por percentiles. */
  pp: number | null;
  ppl: number | null;
  ppu: number | null;
  ppkPct: number | null;

  values: number[];
  xRange: [number, number];
}

export type CapNonnormalResult =
  | ({ ok: true; error?: undefined } & CapNonnormalModel)
  | { ok: false; error: string };

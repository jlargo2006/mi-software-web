// app/app/six-sigma/studies/ht/pairedt/types.ts
import type { Alternative, TPairedModel } from "../../../lib/tPaired";

export type { Alternative };

export interface HTPairedTParams {
  /** Primera columna de la pareja (muestra 1). */
  columnX: string | null;
  /** Segunda columna de la pareja (muestra 2). */
  columnY: string | null;
  performTest: boolean;
  /** Diferencia hipotetica (texto: admite coma decimal). */
  hypothesizedDifference: string;
  /** Nivel de confianza en % (texto: "95,0"). */
  confidenceLevel: string;
  alternative: Alternative;
  showHistogram: boolean;
  showIndividualValue: boolean;
  showBoxplot: boolean;
}

export type HTPairedTResult = TPairedModel;

export const HTPAIREDT_DEFAULT: HTPairedTParams = {
  columnX: null,
  columnY: null,
  performTest: true,
  hypothesizedDifference: "0",
  confidenceLevel: "95,0",
  alternative: "two-sided",
  showHistogram: true,
  showIndividualValue: true,
  showBoxplot: true,
};

/** Simbolo de H1 para cabeceras y leyendas. */
export const ALT_SYMBOL: Record<Alternative, string> = {
  less: "<",
  "two-sided": "\u2260",
  greater: ">",
};

/** Etiqueta larga para el desplegable. */
export const ALT_LABEL: Record<Alternative, string> = {
  less: "Difference < hypothesized difference",
  "two-sided": "Difference â‰  hypothesized difference",
  greater: "Difference > hypothesized difference",
};

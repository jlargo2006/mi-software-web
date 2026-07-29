// app/app/six-sigma/studies/ht/onesamplet/types.ts
import type { Alternative, TTest1Model } from "../../../lib/tTest1";

export type { Alternative };

export interface HT1SampleTParams {
  column: string | null;
  performTest: boolean;
  /** Media hipotética (texto: admite coma decimal). */
  hypothesizedMean: string;
  /** Nivel de confianza en % (texto: "95,0"). */
  confidenceLevel: string;
  alternative: Alternative;
  showHistogram: boolean;
  showIndividualValue: boolean;
  showBoxplot: boolean;
}

export type HT1SampleTResult = TTest1Model;

export const HT1SAMPLET_DEFAULT: HT1SampleTParams = {
  column: null,
  performTest: true,
  hypothesizedMean: "",
  confidenceLevel: "95,0",
  alternative: "two-sided",
  showHistogram: true,
  showIndividualValue: true,
  showBoxplot: true,
};

/** Símbolo de H₁ para cabeceras y leyendas. */
export const ALT_SYMBOL: Record<Alternative, string> = {
  less: "<",
  "two-sided": "≠",
  greater: ">",
};

/** Etiqueta larga para el desplegable. */
export const ALT_LABEL: Record<Alternative, string> = {
  less: "Mean < hypothesized mean",
  "two-sided": "Mean ≠ hypothesized mean",
  greater: "Mean > hypothesized mean",
};

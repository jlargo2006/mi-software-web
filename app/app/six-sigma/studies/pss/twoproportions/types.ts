// app/app/six-sigma/studies/pss/twoproportions/types.ts
import type { PssBaseParams, PssCore } from "../_shared/types";

export interface PssTwoPropParams extends PssBaseParams {
  /** Proporcion de referencia (grupo 2). El eje se centra aqui. */
  baselineProportion: string;
}

export type PssTwoPropResult = PssCore & {
  ok: boolean;
  error?: string;
  baselineProportion: number;
};

export const DEFAULT_TWOPROP_PARAMS: PssTwoPropParams = {
  baselineProportion: "0.3",
  sampleSizes: "",
  differences: "0.4 0.5",
  powerValues: "0.9",
  alpha: 0.05,
  alternative: "notequal",
  sd: "",
};

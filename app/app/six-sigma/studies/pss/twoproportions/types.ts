// app/app/six-sigma/studies/pss/twoproportions/types.ts
import { PSS_BASE_DEFAULT, type PssBaseParams, type PssBaseResult } from "../_shared/types";

export interface PssTwoPropParams extends PssBaseParams {
  /** Proporcion de referencia (grupo 2). El eje se centra aqui. */
  baselineProportion: string;
}

export interface PssTwoPropResult extends PssBaseResult {
  baselineProportion: number;
}

export const PSSTWOPROP_DEFAULT: PssTwoPropParams = {
  ...PSS_BASE_DEFAULT,
  sd: "1", // no se usa; el motor lo ignora via requiresSd: false
  baselineProportion: "0.3",
};

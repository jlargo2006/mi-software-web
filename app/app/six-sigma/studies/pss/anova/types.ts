// app/app/six-sigma/studies/pss/anova/types.ts
import { PSS_BASE_DEFAULT, type PssBaseParams, type PssBaseResult } from "../_shared/types";

export interface PssAnovaParams extends PssBaseParams {
  /** Numero de niveles del factor. */
  levels: string;
}

export interface PssAnovaResult extends PssBaseResult {
  levels: number;
}

export const PSSANOVA_DEFAULT: PssAnovaParams = {
  ...PSS_BASE_DEFAULT,
  // El test F es siempre de cola superior; forzamos diferencias positivas.
  alternative: "greater",
  levels: "3",
};

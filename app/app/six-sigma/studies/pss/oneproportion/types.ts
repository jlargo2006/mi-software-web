// app/app/six-sigma/studies/pss/oneproportion/types.ts
import { PSS_BASE_DEFAULT, type PssBaseParams, type PssBaseResult } from "../_shared/types";

export type PropMethod = "exact" | "normal";

export interface PssPropParams extends PssBaseParams {
  /** Proporcion bajo la hipotesis nula. */
  nullProportion: string;
  method: PropMethod;
}

export interface PssPropResult extends PssBaseResult {
  nullProportion: number;
  method: PropMethod;
}

export const PSSPROP_DEFAULT: PssPropParams = {
  ...PSS_BASE_DEFAULT,
  sd: "1", // no se usa; el motor lo ignora via requiresSd: false
  nullProportion: "0.5",
  method: "exact",
};

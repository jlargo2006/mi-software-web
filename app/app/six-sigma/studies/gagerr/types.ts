// app/app/six-sigma/studies/gagerr/types.ts
import type { GageRRModel } from "../../lib/gagerr";

export interface GageRRParams {
  partCol: string | null;
  operatorCol: string | null;
  measCol: string | null;
  tolerance: string;        // texto: vacío = sin %Tolerance
  alphaInteraction: number; // def. 0.05
}

export const GAGERR_DEFAULT: GageRRParams = {
  partCol: null,
  operatorCol: null,
  measCol: null,
  tolerance: "",
  alphaInteraction: 0.05,
};

export type GageRRResult = GageRRModel;

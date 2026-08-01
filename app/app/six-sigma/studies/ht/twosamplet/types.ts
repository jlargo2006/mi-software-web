// app/app/six-sigma/studies/ht/twosamplet/types.ts
import type { TwoSampleTModel, TAlternative } from "../../../lib/twosamplet";

/** Como estan organizados los datos en la hoja. */
export type DataFormat = "stacked" | "unstacked";

export interface TwoSampleTParams {
  format: DataFormat;

  // --- format = "stacked" ---
  responseCol: string | null;
  factorCol: string | null;

  // --- format = "unstacked" ---
  sample1Col: string | null;
  sample2Col: string | null;

  /** Nivel de significacion en texto: admite coma decimal ("0,05"). */
  alpha: string;
  /** Diferencia hipotetica bajo H0, en texto ("0"). */
  hypDiff: string;
  alternative: TAlternative;
  /** true = asumir varianzas iguales (pooled). Minitab por defecto: false. */
  assumeEqualVariances: boolean;

  showBoxplot: boolean;
  showIndividualValue: boolean;
  showDiffCI: boolean;
}

export type TwoSampleTResult = TwoSampleTModel;

export const TWOSAMPLET_DEFAULT: TwoSampleTParams = {
  format: "stacked",
  responseCol: null,
  factorCol: null,
  sample1Col: null,
  sample2Col: null,
  alpha: "0,05",
  hypDiff: "0",
  alternative: "two-sided",
  assumeEqualVariances: false,
  showBoxplot: true,
  showIndividualValue: true,
  showDiffCI: true,
};

/** Columnas realmente en uso segun el formato activo. */
export function twoSampleTColumns(p: TwoSampleTParams): string[] {
  if (p.format === "stacked") {
    return [p.responseCol, p.factorCol].filter((x): x is string => !!x);
  }
  return [p.sample1Col, p.sample2Col].filter((x): x is string => !!x);
}

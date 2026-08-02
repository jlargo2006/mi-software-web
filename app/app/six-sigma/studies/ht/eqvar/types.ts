// app/app/six-sigma/studies/ht/eqvar/types.ts
import type { EqVarModel } from "../../../lib/eqvar";

/** Como estan organizados los datos en la hoja. */
export type DataFormat = "stacked" | "unstacked";

export interface EqVarParams {
  format: DataFormat;

  // --- format = "stacked" ---
  responseCol: string | null;
  factorCol: string | null;

  // --- format = "unstacked" ---
  sampleCols: (string | null)[];

  /** Nivel de significacion en texto: admite coma decimal ("0,05"). */
  alpha: string;

  showIntervalPlot: boolean;
  showBoxplot: boolean;
  showKurtosis: boolean;
}

export type EqVarResult = EqVarModel;

export const EQVAR_DEFAULT: EqVarParams = {
  format: "stacked",
  responseCol: null,
  factorCol: null,
  sampleCols: [null, null],
  alpha: "0,05",
  showIntervalPlot: true,
  showBoxplot: true,
  showKurtosis: false,
};

/** Columnas realmente en uso segun el formato activo. */
export function eqVarColumns(p: EqVarParams): string[] {
  if (p.format === "stacked") {
    return [p.responseCol, p.factorCol].filter((x): x is string => !!x);
  }
  return p.sampleCols.filter((x): x is string => !!x);
}

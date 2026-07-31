// app/app/six-sigma/studies/ht/anova1way/types.ts
import type { Anova1WayModel } from "../../../lib/anova1way";

/** CÃ³mo estÃ¡n organizados los datos en la hoja. */
export type DataFormat = "stacked" | "unstacked";

export interface Anova1WayParams {
  format: DataFormat;

  // --- format = "stacked" ---
  /** Columna de respuesta (numÃ©rica). */
  responseCol: string | null;
  /** Columna de factor (numÃ©rica o de texto). */
  factorCol: string | null;

  // --- format = "unstacked" ---
  /** Una columna por nivel del factor. Puede contener null (fila vacÃ­a). */
  levelCols: (string | null)[];

  /** Nivel de significaciÃ³n en texto: admite coma decimal ("0,05"). */
  alpha: string;

  showIntervalPlot: boolean;
  showIndividualValue: boolean;
  showBoxplot: boolean;
}

export type Anova1WayResult = Anova1WayModel;

export const ANOVA1WAY_DEFAULT: Anova1WayParams = {
  format: "stacked",
  responseCol: null,
  factorCol: null,
  levelCols: [null, null],
  alpha: "0,05",
  showIntervalPlot: true,
  showIndividualValue: true,
  showBoxplot: true,
};

/**
 * Columnas realmente en uso segÃºn el formato activo.
 * Importante: no devolver las del formato inactivo, o el snapshot
 * arrastrarÃ­a columnas fantasma al conmutar el radio.
 */
export function anova1WayColumns(p: Anova1WayParams): string[] {
  if (p.format === "stacked") {
    return [p.responseCol, p.factorCol].filter((x): x is string => !!x);
  }
  return p.levelCols.filter((x): x is string => !!x);
}

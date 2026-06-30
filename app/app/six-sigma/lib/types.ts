// Tipos centrales de la herramienta Six Sigma

// Una celda puede ser texto o número
export type Cell = string | number;

// Una hoja es una matriz 2D de celdas
export type SheetData = Cell[][];

// El "libro" completo: varias hojas indexadas por nombre
export type WorkbookData = Record<string, SheetData>;

// Tipos de estudio que iremos soportando
export type StudyType = "capability" | "normality";

// Un estudio guardado (se persiste en localStorage, luego en Supabase)
export interface SavedStudy {
  id: string;
  name: string;
  type: StudyType;
  createdAt: string; // ISO date
  // Parámetros con los que se ejecutó (columna, LSL, USL, etc.)
  params: Record<string, unknown>;
  // Resultados calculados (para re-pintar sin recalcular)
  results: Record<string, unknown>;
}

// Resultado de un test de normalidad
export interface NormalityResult {
  n: number;
  mean: number;
  std: number;
  adStatistic: number;   // estadístico de Anderson-Darling
  pValue: number;
  isNormal: boolean;     // según alpha = 0.05
  sortedData: number[];
}

// Resultado de un estudio de capacidad
export interface CapabilityResult {
  n: number;
  mean: number;
  std: number;
  lsl: number | null;
  usl: number | null;
  target: number | null;
  cp: number | null;
  cpk: number | null;
  cpl: number | null;
  cpu: number | null;
  data: number[];
}

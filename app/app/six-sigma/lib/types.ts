// Tipos centrales de la herramienta Six Sigma

// Una celda puede ser texto o número
export type Cell = string | number;

// Opción A: la hoja separa la fila de títulos (headers) de las filas de datos (rows)
export interface SheetData {
  headers: string[]; // títulos de columna (fila coloreada, estilo Minitab)
  rows: Cell[][];    // SOLO filas de datos → la numeración 1,2,3… son estas
}

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

export interface CapabilityResult {
  n: number;
  mean: number;
  std: number; // = StDev(Overall), compatibilidad
  lsl: number | null;
  usl: number | null;
  target: number | null;

  // Compatibilidad (within-based)
  cp: number | null;
  cpk: number | null;
  cpl: number | null;
  cpu: number | null;

  // --- NUEVO ---
  subgroupSize: number;
  stdOverall: number;
  stdWithin: number;

  // Observed performance (PPM)
  ppmObsLSL: number | null;
  ppmObsUSL: number | null;
  ppmObsTotal: number;

  // Expected Overall (PPM)
  ppmExpOverallLSL: number | null;
  ppmExpOverallUSL: number | null;
  ppmExpOverallTotal: number;

  // Expected Within (PPM)
  ppmExpWithinLSL: number | null;
  ppmExpWithinUSL: number | null;
  ppmExpWithinTotal: number;

  // Overall capability (usa stdOverall)
  pp: number | null;
  ppl: number | null;
  ppu: number | null;
  ppk: number | null;
  zBenchOverall: number | null;
  zLSLOverall: number | null;
  zUSLOverall: number | null;

  // Within capability (usa stdWithin) -> Cp/Cpk
  zBenchWithin: number | null;
  zLSLWithin: number | null;
  zUSLWithin: number | null;

  data: number[];
}



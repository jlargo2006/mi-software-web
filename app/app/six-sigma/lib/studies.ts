import type { AnalysisState } from "../components/AnalysisPanel";

// Una columna capturada en el momento de guardar (para comparar y recalcular)
export interface StudyColumn {
  name: string;      // nombre de cabecera → se re-resuelve por nombre al abrir
  values: Cell[];  // valores congelados al guardar (para el banner "datos difieren")
}

export interface StudySnapshot {
  sheetName: string;
  cols: StudyColumn[]; // 1..N columnas (1 = capability/normality, N = descriptive, etc.)
}

// Estudio guardado GENÉRICO — sirve para los 30+ tipos
export interface SavedStudy {
  id: string;
  type: string;                     // "capability" | "normality" | "descriptive" | ...
  name: string;
  params: Record<string, unknown>;  // config reproducible propia de cada tool
  results: Record<string, unknown>; // resultados guardados
  snapshot: StudySnapshot;
  form?: AnalysisState;             // solo capability/normality lo usan
}

// Lo que un panel pasa a onSaveStudy (el padre añade id + timestamp + sheetName)
export interface SaveStudyInput {
  type: string;
  name: string;
  params: Record<string, unknown>;
  results?: Record<string, unknown>;
  cols: StudyColumn[]; // columnas usadas por el estudio
}

// Compara dos conjuntos de columnas (nombre + valores) → banner "datos difieren"
export function sameCols(a: StudyColumn[], b: StudyColumn[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].name !== b[i].name) return false;
    if (a[i].values.length !== b[i].values.length) return false;
    for (let j = 0; j < a[i].values.length; j++) {
      if (Math.abs(a[i].values[j] - b[i].values[j]) > 1e-9) return false;
    }
  }
  return true;
}

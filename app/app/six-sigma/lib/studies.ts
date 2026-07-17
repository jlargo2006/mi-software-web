// Una columna capturada en el momento de guardar (para comparar y recalcular)
export interface StudyColumn {
  name: string;      // nombre de cabecera → se re-resuelve por nombre al abrir
  values: number[];  // valores congelados al guardar (para el banner "datos difieren")
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
  results?: Record<string, unknown>;   // 👈 AÑADIR esta línea
  snapshot: StudySnapshot;
}

// Lo que un panel pasa a onSaveStudy (el padre añade id + timestamp + sheetName)
export interface SaveStudyInput {
  type: string;
  name: string;
  params: Record<string, unknown>;
  cols: StudyColumn[]; // columnas usadas por el estudio
}

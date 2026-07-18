// studies/fishbone/types.ts
export const FISHBONE_ROWS = 15;

// Cada fila de la tabla de configuracion.
export interface FishboneRow {
  colName: string | null;   // columna "Causes" (su header = label si es principal)
  hangsFrom: number | null; // null = espina principal; 1..N = cuelga de esa fila (branch anterior)
}

export interface FishboneParams {
  effect: string;           // titulo del diagrama (la "cabeza del pez")
  rows: FishboneRow[];      // FISHBONE_ROWS filas
}

// Arbol resultante (N niveles).
export interface FishboneNode {
  branch: number;           // numero de fila 1..N (referencia)
  label: string | null;     // header de la columna si es espina principal; null si subespina
  causes: string[];         // valores no vacios de la columna
  children: FishboneNode[]; // subespinas que cuelgan de este nodo
}

export interface FishboneResult {
  effect: string;
  spines: FishboneNode[];   // espinas principales (hangsFrom === null)
}

export const FISHBONE_DEFAULT: FishboneParams = {
  effect: "Cause-and-Effect",
  rows: Array.from({ length: FISHBONE_ROWS }, () => ({
    colName: null,
    hangsFrom: null,
  })),
};

// studies/fishbone/types.ts
export const FISHBONE_ROWS = 15;

// Cada fila de la tabla de configuracion.
export interface FishboneRow {
  colName: string | null;   // columna "Causes" (su header = label si es principal)
  hangsFrom: number | null; // null = espina principal; 1..N = cuelga de esa fila (branch anterior)
  fromCause: string | null; // NEW: si es subespina, de que celda/causa del padre cuelga
}

export interface FishboneParams {
  title: string;            // NEW: titulo mostrado ARRIBA del diagrama
  effect: string;           // texto de la CABEZA del pez (el defecto)
  rows: FishboneRow[];      // FISHBONE_ROWS filas
}

// Arbol resultante (N niveles).
export interface FishboneNode {
  branch: number;           // numero de fila 1..N (referencia)
  label: string | null;     // header de la columna si es espina principal; null si subespina
  causes: string[];         // valores no vacios de la columna
  attachTo: string | null;  // NEW: causa del padre de la que cuelga (null en principales)
  children: FishboneNode[]; // subespinas que cuelgan de este nodo
}

export interface FishboneResult {
  title: string;            // NEW
  effect: string;
  spines: FishboneNode[];   // espinas principales (hangsFrom === null)
}

export const FISHBONE_DEFAULT: FishboneParams = {
  title: "Cause-and-Effect Diagram",
  effect: "Effect",
  rows: Array.from({ length: FISHBONE_ROWS }, () => ({
    colName: null,
    hangsFrom: null,
    fromCause: null,
  })),
};

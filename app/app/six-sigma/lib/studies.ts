// app/app/six-sigma/lib/studies.ts

import type { Cell } from "./types";

// Una columna capturada en el momento de guardar (para comparar y recalcular)
export interface StudyColumn {
  name: string;      // nombre de cabecera → se re-resuelve por nombre al abrir
  values: Cell[];  // valores congelados al guardar (para el banner "datos difieren")
}

export interface StudySnapshot {
  sheetName: string;
  cols: StudyColumn[]; // 1..N columnas
}

// Estudio guardado GENÉRICO — sirve para los 30+ tipos
export interface SavedStudy {
  id: string;
  type: string;                     // "capability" | "normality" | ...
  name: string;                     // editable por el usuario, SIN fecha
  /**
   * Instante de creacion en ISO 8601.
   *
   * Va separado del nombre a proposito: si la fecha viviera dentro de `name`,
   * renombrar destruiria el criterio de orden. Los ficheros anteriores no lo
   * traen y se deduce al importar (ver sanitizeStudies).
   */
  createdAt: string;
  params: Record<string, unknown>;  // config reproducible propia de cada tool
  results: Record<string, unknown>; // resultados guardados
  snapshot: StudySnapshot;
}

// Lo que un panel pasa a onSaveStudy (el padre añade id + createdAt + sheetName)
export interface SaveStudyInput {
  type: string;
  name: string;
  params: Record<string, unknown>;
  results?: Record<string, unknown>;
  cols: StudyColumn[]; // columnas usadas por el estudio
}

/**
 * Separa el nombre heredado "yyyy/mm/dd hh:mm:ss - Titulo".
 *
 * Hasta ahora la fecha se concatenaba al nombre. Al abrir un proyecto viejo se
 * recupera de ahi para no perder el orden cronologico; si el patron no encaja,
 * el nombre se deja intacto y la fecha queda indefinida.
 */
export function splitLegacyName(name: string): {
  name: string;
  createdAt?: string;
} {
  const m = name.match(
    /^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})\s*-\s*(.*)$/
  );
  if (!m) return { name };
  const [, y, mo, d, h, mi, s, rest] = m;
  // Se construye en hora local, que es la que se uso al guardar.
  const date = new Date(+y, +mo - 1, +d, +h, +mi, +s);
  if (Number.isNaN(date.getTime())) return { name };
  return { name: rest.trim() || name, createdAt: date.toISOString() };
}

/** Fecha corta para la barra lateral: "19/08 02:33". */
export function formatStudyDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(
    d.getMinutes()
  )}`;
}

// Compara dos conjuntos de columnas (nombre + valores) → banner "datos difieren"
export function sameCols(a: StudyColumn[], b: StudyColumn[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].name !== b[i].name) return false;
    if (a[i].values.length !== b[i].values.length) return false;
    for (let j = 0; j < a[i].values.length; j++) {
      if (String(a[i].values[j] ?? "") !== String(b[i].values[j] ?? "")) return false;
    }
  }
  return true;
}

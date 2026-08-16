// studies/types.ts
import type React from "react";
import type { Cell } from "../lib/types";
import type { ColumnInfo } from "../lib/columns";

export type SixSigmaPhase = "define" | "measure" | "analyze" | "improve" | "control";
export type StudyMode = "edit" | "view";
export type ArtifactKind = "analysis" | "diagram";

/* Snapshot congelado: nombre de columna -> valores crudos */
export interface StudyColumn { name: string; values: Cell[] }
export type ColumnSnapshot = Record<string, StudyColumn>;

/* Un volcado a la hoja: una columna por NOMBRE y sus celdas, fila a fila. */
export interface StudyOutput {
  column: string;
  /** Alineado con sheet.rows: "" en las filas que no reciben valor. */
  values: Cell[];
}

/** Una hoja nueva que el estudio genera al pulsar Run. */
export interface SheetOutput {
  /** Nombre sugerido; el libro le anade un numero si ya existe. */
  name: string;
  headers: string[];
  rows: Cell[][];
}

interface BaseArtifact {
  id: string;
  label: string;
  phase: SixSigmaPhase;
  kind: ArtifactKind;
}

/* ---------- Familia 1: estudios de datos ---------- */
export interface AnalysisDefinition<P = unknown, R = unknown> extends BaseArtifact {
  kind: "analysis";
  defaultParams: P;

  // Que columnas (por NOMBRE) referencia esta config. Lo usa el runner
  // generico para congelar el snapshot y detectar cambios de datos.
  referencedColumns: (params: P) => string[];

  // UI de configuracion PROPIA del estudio (se pinta dentro de StudyControls).
  Controls: React.FC<{
    params: P;
    onChange: (p: P) => void;
    columns: ColumnInfo[];
//    onRun: () => void;
  }>;

  // Calculo puro: snapshot congelado + params -> resultado.
  compute: (data: ColumnSnapshot, params: P) => R;

  // UI de resultados (se pinta siempre).
  Results: React.FC<{ data: ColumnSnapshot; params: P; result: R }>;

  // Pantalla teorica OPCIONAL: formulas, metodo y decisiones de calculo.
  // Si existe, el runner muestra el boton "Theory" en la cabecera.
  Theory?: React.FC;

  // Columnas que el estudio ESCRIBE en la hoja al pulsar Run. Opcional: la
  // inmensa mayoria de los estudios no escriben nada. El runner resuelve el
  // nombre a indice y volca los valores con pasteData.
  outputs?: (params: P, result: R) => StudyOutput[];

  // Hojas NUEVAS que el estudio crea al pulsar Run. Solo los generadores de
  // disenos las usan. El runner evita duplicarlas si el contenido no cambia.
  sheetOutputs?: (params: P, result: R) => SheetOutput[];
}

/* ---------- Familia 2: diagramas / formularios libres ---------- */
export interface DiagramDefinition<D = unknown> extends BaseArtifact {
  kind: "diagram";
  defaultDoc: D;
  Editor: React.FC<{
    doc: D;
    onChange: (d: D) => void;
    mode: StudyMode;
  }>;
}

export type ArtifactDefinition =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | AnalysisDefinition<any, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | DiagramDefinition<any>;

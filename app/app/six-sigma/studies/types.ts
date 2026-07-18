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

interface BaseArtifact {
  id: string;
  label: string;
  phase: SixSigmaPhase;
  kind: ArtifactKind;
}

/* ---------- Familia 1: estudios de datos ---------- */
export interface AnalysisDefinition<P = unknown, R = unknown> extends BaseArtifact {
  extends BaseArtifact {
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
    onRun: () => void;
  }>;

  // Calculo puro: snapshot congelado + params -> resultado.
  compute: (data: ColumnSnapshot, params: P) => R;

  // UI de resultados (se pinta siempre).
  Results: React.FC<{ data: ColumnSnapshot; params: P; result: R }>;
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
  | AnalysisDefinition<unknown, unknown>
  | DiagramDefinition<unknown>;

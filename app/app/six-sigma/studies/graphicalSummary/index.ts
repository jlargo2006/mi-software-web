// studies/graphicalSummary/index.ts
import type { AnalysisDefinition } from "../types";
import Controls from "./Controls";
import Results from "./Results";
import { computeGraphicalSummary } from "./compute";
import {
  GRAPHICAL_SUMMARY_DEFAULT,
  type GraphicalSummaryParams,
  type GraphicalSummaryResult,
} from "./types";

const graphicalSummary: AnalysisDefinition<
  GraphicalSummaryParams,
  GraphicalSummaryResult
> = {
  id: "graphicalSummary",
  kind: "analysis",
  phase: "measure",
  label: "Graphical Summary",
  defaultParams: GRAPHICAL_SUMMARY_DEFAULT,
  compute: computeGraphicalSummary,
  Controls,
  Results,
  // Sin la By variable aqui, editar la columna Location no recalcula el estudio.
  referencedColumns: (params) =>
    [params.col, params.byCol].filter((c): c is string => !!c),
};

export default graphicalSummary;

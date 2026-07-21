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
  label: "Graphical Summary",
  defaultParams: GRAPHICAL_SUMMARY_DEFAULT,
  compute: computeGraphicalSummary,
  Controls,
  Results,
  referencedColumns: (params) => (params.col ? [params.col] : []),
};

export default graphicalSummary;

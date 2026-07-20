// studies/pareto/index.ts
import type { AnalysisDefinition } from "../types";
import type { ParetoParams, ParetoResult } from "./types";
import { PARETO_DEFAULT } from "./types";
import { computePareto } from "./compute";
import ParetoControls from "./Controls";
import ParetoResults from "./Results";

export const pareto: AnalysisDefinition<ParetoParams, ParetoResult> = {
  id: "pareto",
  label: "Pareto Chart",
  phase: "define",
  kind: "analysis",
  defaultParams: PARETO_DEFAULT,
  referencedColumns: (p) =>
    [p.categoryCol, p.countCol].filter((n): n is string => !!n),
  Controls: ParetoControls,
  compute: computePareto,
  Results: ParetoResults,
};

// app/app/six-sigma/studies/doe/factorial/optimizer/index.ts
import type { AnalysisDefinition } from "../../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeDoeOpt } from "./compute";
import {
  DOEOPT_DEFAULT,
  type DoeOptParams,
  type DoeOptResult,
} from "./types";

const doeOptimizer: AnalysisDefinition<DoeOptParams, DoeOptResult> = {
  id: "doeOptimizer",
  kind: "analysis",
  phase: "improve",
  label: "Response Optimizer",
  defaultParams: DOEOPT_DEFAULT,
  compute: computeDoeOpt,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) =>
    Array.from(
      new Set([...p.responses, ...p.factors].filter((s) => s.trim() !== ""))
    ),
};

export default doeOptimizer;

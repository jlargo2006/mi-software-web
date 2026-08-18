// app/app/six-sigma/studies/improve/bestsubsets/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeImpSubsets } from "./compute";
import {
  IMPSUBSETS_DEFAULT,
  type ImpSubsetsParams,
  type ImpSubsetsResult,
} from "./types";

const impBestSubsets: AnalysisDefinition<ImpSubsetsParams, ImpSubsetsResult> = {
  id: "impBestSubsets",
  kind: "analysis",
  phase: "improve",
  label: "Best Subsets Regression",
  defaultParams: IMPSUBSETS_DEFAULT,
  compute: computeImpSubsets,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) =>
    Array.from(
      new Set([p.response, ...p.freePredictors].filter((s) => s.trim() !== ""))
    ),
};

export default impBestSubsets;

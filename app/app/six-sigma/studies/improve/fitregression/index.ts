// app/app/six-sigma/studies/improve/fitregression/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeImpFitReg } from "./compute";
import {
  IMPFITREG_DEFAULT,
  type ImpFitRegParams,
  type ImpFitRegResult,
} from "./types";

const impFitRegression: AnalysisDefinition<ImpFitRegParams, ImpFitRegResult> = {
  id: "impFitRegression",
  kind: "analysis",
  phase: "improve",
  label: "Fit Regression Model",
  defaultParams: IMPFITREG_DEFAULT,
  compute: computeImpFitReg,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) =>
    Array.from(
      new Set([p.response, ...p.predictors].filter((s) => s.trim() !== ""))
    ),
};

export default impFitRegression;

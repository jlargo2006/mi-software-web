// app/app/six-sigma/studies/improve/correlation/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeImpCorr } from "./compute";
import {
  IMPCORR_DEFAULT,
  type ImpCorrParams,
  type ImpCorrResult,
} from "./types";

const impCorrelation: AnalysisDefinition<ImpCorrParams, ImpCorrResult> = {
  id: "impCorrelation",
  kind: "analysis",
  phase: "improve",
  label: "Correlation",
  defaultParams: IMPCORR_DEFAULT,
  compute: computeImpCorr,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) => [...p.columns],
};

export default impCorrelation;

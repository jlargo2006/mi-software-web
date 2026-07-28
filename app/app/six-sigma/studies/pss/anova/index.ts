// app/app/six-sigma/studies/pss/anova/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import { computePssAnova } from "./compute";
import { PSSANOVA_DEFAULT, type PssAnovaParams, type PssAnovaResult } from "./types";

const pssAnova: AnalysisDefinition<PssAnovaParams, PssAnovaResult> = {
  id: "pssAnova",
  kind: "analysis",
  phase: "analyze",
  label: "Power and Sample Size: One-Way ANOVA",
  defaultParams: PSSANOVA_DEFAULT,
  compute: computePssAnova,
  Controls,
  Results,
  referencedColumns: () => [],
};

export default pssAnova;

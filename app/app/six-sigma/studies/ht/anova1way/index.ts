// app/app/six-sigma/studies/ht/anova1way/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import { computeAnova1WayStudy } from "./compute";
import {
  ANOVA1WAY_DEFAULT,
  anova1WayColumns,
  type Anova1WayParams,
  type Anova1WayResult,
} from "./types";

const htAnova1Way: AnalysisDefinition<Anova1WayParams, Anova1WayResult> = {
  id: "htAnova1Way",
  kind: "analysis",
  phase: "analyze",
  label: "One-Way ANOVA",
  defaultParams: ANOVA1WAY_DEFAULT,
  compute: computeAnova1WayStudy,
  Controls,
  Results,
  referencedColumns: anova1WayColumns,
};

export default htAnova1Way;

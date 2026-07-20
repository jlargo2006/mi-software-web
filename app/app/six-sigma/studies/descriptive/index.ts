// studies/descriptive/index.ts
import type { AnalysisDefinition } from "../types";
import type { DescriptiveParams, DescriptiveResult } from "./types";
import { DESCRIPTIVE_DEFAULT } from "./types";
import { computeDescriptive } from "./compute";
import DescriptiveControls from "./Controls";
import DescriptiveResults from "./Results";

export const descriptive: AnalysisDefinition<DescriptiveParams, DescriptiveResult> = {
  id: "descriptive",
  label: "Descriptive Statistics",
  phase: "measure", // ⚠️ CONFIRMAR con el ribbon
  kind: "analysis",
  defaultParams: DESCRIPTIVE_DEFAULT,
  referencedColumns: (p) => p.selectedColNames,
  Controls: DescriptiveControls,
  compute: computeDescriptive,
  Results: DescriptiveResults,
};

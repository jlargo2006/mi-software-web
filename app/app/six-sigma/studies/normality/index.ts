// studies/normality/index.ts
import type { AnalysisDefinition } from "../types";
import type { NormalityParams, NormalityResult } from "./types";
import { NORMALITY_DEFAULT } from "./types";
import { computeNormality } from "./compute";
import NormalityControls from "./Controls";
import NormalityResults from "./Results";

export const normality: AnalysisDefinition<NormalityParams, NormalityResult> = {
  id: "normality",
  label: "Normality Test (Anderson-Darling)",
  phase: "measure", // ⚠️ CONFIRMAR: ¿qué fase tenía en el ribbon viejo?
  kind: "analysis",
  defaultParams: NORMALITY_DEFAULT,
  referencedColumns: (p) => [p.col].filter((n): n is string => !!n),
  Controls: NormalityControls,
  compute: computeNormality,
  Results: NormalityResults,
};


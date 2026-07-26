// app/app/six-sigma/studies/multivari/index.ts
import type { AnalysisDefinition } from "../types";
import Controls from "./Controls";
import Results from "./Results";
import { computeMultiVariStudy } from "./compute";
import { MULTIVARI_DEFAULT, type MultiVariParams, type MultiVariResult } from "./types";

const multivari: AnalysisDefinition<MultiVariParams, MultiVariResult> = {
  id: "multiVari",
  kind: "analysis",
  phase: "analyze",
  label: "Multi-Vari Chart",
  defaultParams: MULTIVARI_DEFAULT,
  compute: computeMultiVariStudy,
  Controls,
  Results,
  referencedColumns: (params) =>
    [
      params.responseCol,
      params.factor1,
      params.factor2,
      params.factor3,
      params.factor4,
    ].filter((x): x is string => !!x),
};

export default multivari;

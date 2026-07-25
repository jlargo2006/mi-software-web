// app/app/six-sigma/studies/gagerr/index.ts
import type { AnalysisDefinition } from "../types";
import Controls from "./Controls";
import Results from "./Results";
import { computeGageRRStudy } from "./compute";
import { GAGERR_DEFAULT, type GageRRParams, type GageRRResult } from "./types";

const gagerr: AnalysisDefinition<GageRRParams, GageRRResult> = {
  id: "gagerr",
  kind: "analysis",
  phase: "measure",
  label: "Gage R&R Study (Crossed)",
  defaultParams: GAGERR_DEFAULT,
  compute: computeGageRRStudy,
  Controls,
  Results,
  referencedColumns: (params) =>
    [params.partCol, params.operatorCol, params.measCol].filter(
      (x): x is string => !!x
    ),
};

export default gagerr;

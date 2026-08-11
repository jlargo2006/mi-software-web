// app/app/six-sigma/studies/ht/eqvar/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeEqVarStudy } from "./compute";
import { EQVAR_DEFAULT, eqVarColumns, type EqVarParams, type EqVarResult } from "./types";

const htEqVar: AnalysisDefinition<EqVarParams, EqVarResult> = {
  id: "htEqVar",
  kind: "analysis",
  phase: "analyze",
  label: "Equal Variances",
  defaultParams: EQVAR_DEFAULT,
  compute: computeEqVarStudy,
  Controls,
  Results,
  Theory,
  referencedColumns: eqVarColumns,
};

export default htEqVar;

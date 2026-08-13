// app/app/six-sigma/studies/improve/regression/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeImpReg } from "./compute";
import {
  IMPREG_DEFAULT,
  type ImpRegParams,
  type ImpRegResult,
} from "./types";

const impRegression: AnalysisDefinition<ImpRegParams, ImpRegResult> = {
  id: "impRegression",
  kind: "analysis",
  phase: "improve",
  label: "Fitted Line Plot",
  defaultParams: IMPREG_DEFAULT,
  compute: computeImpReg,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) =>
    [p.yColumn, p.xColumn].filter((c): c is string => Boolean(c)),
};

export default impRegression;

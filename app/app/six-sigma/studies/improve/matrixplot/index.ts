// app/app/six-sigma/studies/improve/matrixplot/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeImpMatrix } from "./compute";
import {
  IMPMATRIX_DEFAULT,
  type ImpMatrixParams,
  type ImpMatrixResult,
} from "./types";

const impMatrixPlot: AnalysisDefinition<ImpMatrixParams, ImpMatrixResult> = {
  id: "impMatrixPlot",
  kind: "analysis",
  phase: "improve",
  label: "Matrix Plot",
  defaultParams: IMPMATRIX_DEFAULT,
  compute: computeImpMatrix,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) => {
    const names =
      p.kind === "matrix"
        ? [...p.variables]
        : [...p.yVariables, ...p.xVariables];
    if (p.groupColumn.trim() !== "") names.push(p.groupColumn);
    return Array.from(new Set(names.filter((s) => s.trim() !== "")));
  },
};

export default impMatrixPlot;

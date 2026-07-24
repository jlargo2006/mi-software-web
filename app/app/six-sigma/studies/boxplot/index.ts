// app/app/six-sigma/studies/boxplot/index.ts
import type { AnalysisDefinition } from "../types";
import Controls from "./Controls";
import Results from "./Results";
import { computeBoxplot } from "./compute";
import { BOXPLOT_DEFAULT, type BoxplotParams, type BoxplotResult } from "./types";

const boxplot: AnalysisDefinition<BoxplotParams, BoxplotResult> = {
  id: "boxplot",
  kind: "analysis",
  phase: "measure",
  label: "Boxplot",
  defaultParams: BOXPLOT_DEFAULT,
  compute: computeBoxplot,
  Controls,
  Results,
  referencedColumns: (params) =>
    params.groups && params.groupBy
      ? [...params.cols, params.groupBy]
      : params.cols,
};

export default boxplot;

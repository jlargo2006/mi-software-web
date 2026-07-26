// app/app/six-sigma/studies/dotplot/index.ts
import type { AnalysisDefinition } from "../types";
import Controls from "./Controls";
import Results from "./Results";
import { computeDotplot } from "./compute";
import { DOTPLOT_DEFAULT, type DotplotParams, type DotplotResult } from "./types";

const dotplot: AnalysisDefinition<DotplotParams, DotplotResult> = {
  id: "dotplot",
  kind: "analysis",
  phase: "measure",
  label: "Dotplot",
  defaultParams: DOTPLOT_DEFAULT,
  compute: computeDotplot,
  Controls,
  Results,
  referencedColumns: (params) =>
    params.groupBy ? [...params.cols, params.groupBy] : params.cols,
};

export default dotplot;

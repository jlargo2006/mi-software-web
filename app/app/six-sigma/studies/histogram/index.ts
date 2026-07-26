// app/app/six-sigma/studies/histogram/index.ts
import type { AnalysisDefinition } from "../types";
import Controls from "./Controls";
import Results from "./Results";
import { computeHistogram } from "./compute";
import { HISTOGRAM_DEFAULT, type HistogramParams, type HistogramResult } from "./types";

const histogram: AnalysisDefinition<HistogramParams, HistogramResult> = {
  id: "histogram",
  kind: "analysis",
  phase: "measure",
  label: "Histogram",
  defaultParams: HISTOGRAM_DEFAULT,
  compute: computeHistogram,
  Controls,
  Results,
  referencedColumns: (params) => params.cols,
};

export default histogram;

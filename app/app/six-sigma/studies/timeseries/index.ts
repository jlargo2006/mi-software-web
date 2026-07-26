// app/app/six-sigma/studies/timeseries/index.ts
import type { AnalysisDefinition } from "../types";
import Controls from "./Controls";
import Results from "./Results";
import { computeTimeSeries } from "./compute";
import {
  TIMESERIES_DEFAULT,
  type TimeSeriesParams,
  type TimeSeriesResult,
} from "./types";

const timeseries: AnalysisDefinition<TimeSeriesParams, TimeSeriesResult> = {
  id: "timeseries",
  kind: "analysis",
  phase: "measure",
  label: "Time Series Plot",
  defaultParams: TIMESERIES_DEFAULT,
  compute: computeTimeSeries,
  Controls,
  Results,
  referencedColumns: (params) => {
    const refs = [...params.cols];
    if (params.groups && params.groupBy) refs.push(params.groupBy);
    if (params.timeCol) refs.push(params.timeCol);
    return refs;
  },
};

export default timeseries;

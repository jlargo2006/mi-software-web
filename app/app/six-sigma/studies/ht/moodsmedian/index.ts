// app/app/six-sigma/studies/ht/moodsmedian/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeHTMoodsMedian } from "./compute";
import {
  HTMOODSMEDIAN_DEFAULT,
  type HTMoodsMedianParams,
  type HTMoodsMedianResult,
} from "./types";

const htMoodsMedian: AnalysisDefinition<
  HTMoodsMedianParams,
  HTMoodsMedianResult
> = {
  id: "htMoodsMedian",
  kind: "analysis",
  phase: "analyze",
  label: "Mood's Median Test",
  defaultParams: HTMOODSMEDIAN_DEFAULT,
  compute: computeHTMoodsMedian,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) =>
    [p.responseColumn, p.factorColumn].filter((c): c is string => Boolean(c)),
};

export default htMoodsMedian;

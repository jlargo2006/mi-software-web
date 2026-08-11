// app/app/six-sigma/studies/ht/mannwhitney/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeHTMannWhitney } from "./compute";
import {
  HTMANNWHITNEY_DEFAULT,
  type HTMannWhitneyParams,
  type HTMannWhitneyResult,
} from "./types";

const htMannWhitney: AnalysisDefinition<
  HTMannWhitneyParams,
  HTMannWhitneyResult
> = {
  id: "htMannWhitney",
  kind: "analysis",
  phase: "analyze",
  label: "Mann-Whitney Test",
  defaultParams: HTMANNWHITNEY_DEFAULT,
  compute: computeHTMannWhitney,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) =>
    [p.columnX, p.columnY].filter((c): c is string => Boolean(c)),
};

export default htMannWhitney;

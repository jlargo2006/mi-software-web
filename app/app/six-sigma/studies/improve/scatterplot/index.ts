// app/app/six-sigma/studies/improve/scatterplot/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeImpScatter } from "./compute";
import {
  IMPSCATTER_DEFAULT,
  KIND_HAS_GROUPS,
  type ImpScatterParams,
  type ImpScatterResult,
} from "./types";

const impScatter: AnalysisDefinition<ImpScatterParams, ImpScatterResult> = {
  id: "impScatter",
  kind: "analysis",
  phase: "improve",
  label: "Scatterplot",
  defaultParams: IMPSCATTER_DEFAULT,
  compute: computeImpScatter,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) =>
    [
      p.yColumn,
      p.xColumn,
      KIND_HAS_GROUPS[p.kind] ? p.groupColumn : "",
    ].filter((c): c is string => Boolean(c)),
};

export default impScatter;

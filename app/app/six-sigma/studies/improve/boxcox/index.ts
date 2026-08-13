// app/app/six-sigma/studies/improve/boxcox/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeImpBoxCox } from "./compute";
import {
  IMPBOXCOX_DEFAULT,
  type ImpBoxCoxParams,
  type ImpBoxCoxResult,
} from "./types";

const impBoxCox: AnalysisDefinition<ImpBoxCoxParams, ImpBoxCoxResult> = {
  id: "impBoxCox",
  kind: "analysis",
  phase: "improve",
  label: "Box-Cox Transformation",
  defaultParams: IMPBOXCOX_DEFAULT,
  compute: computeImpBoxCox,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) =>
    [p.column, p.storeColumn, p.subgroupSize].filter((c): c is string =>
      Boolean(c && c.trim() !== "" && !/^\d+$/.test(c.trim()))
    ),
};

export default impBoxCox;

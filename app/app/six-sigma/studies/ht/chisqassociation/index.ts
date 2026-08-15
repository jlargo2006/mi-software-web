// app/app/six-sigma/studies/ht/chisqassociation/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeHTChiSqAssoc } from "./compute";
import {
  HTCHISQASSOC_DEFAULT,
  type HTChiSqAssocParams,
  type HTChiSqAssocResult,
} from "./types";

const htChiSqAssoc: AnalysisDefinition<
  HTChiSqAssocParams,
  HTChiSqAssocResult
> = {
  id: "htChiSqAssoc",
  kind: "analysis",
  phase: "analyze",
  label: "Chi-Square Test for Association",
  defaultParams: HTCHISQASSOC_DEFAULT,
  compute: computeHTChiSqAssoc,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) =>
    p.mode === "summarized"
      ? [...p.tableColumns, p.rowLabelColumn].filter((c): c is string =>
          Boolean(c)
        )
      : [p.rowFactorColumn, p.colFactorColumn].filter((c): c is string =>
          Boolean(c)
        ),
};

export default htChiSqAssoc;

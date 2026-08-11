// app/app/six-sigma/studies/ht/wilcoxon/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeHTWilcoxon } from "./compute";
import { HTWILCOXON_DEFAULT, type HTWilcoxonParams, type HTWilcoxonResult } from "./types";

const htWilcoxon: AnalysisDefinition<HTWilcoxonParams, HTWilcoxonResult> = {
  id: "htWilcoxon",
  kind: "analysis",
  phase: "analyze",
  label: "Wilcoxon Signed Rank Test",
  defaultParams: HTWILCOXON_DEFAULT,
  compute: computeHTWilcoxon,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) => [p.column].filter((c): c is string => Boolean(c)),
};

export default htWilcoxon;

// app/app/six-sigma/studies/ht/sign/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeHTSign } from "./compute";
import { HTSIGN_DEFAULT, type HTSignParams, type HTSignResult } from "./types";

const htSign: AnalysisDefinition<HTSignParams, HTSignResult> = {
  id: "htSign",
  kind: "analysis",
  phase: "analyze",
  label: "1-Sample Sign Test",
  defaultParams: HTSIGN_DEFAULT,
  compute: computeHTSign,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) => [p.column].filter((c): c is string => Boolean(c)),
};

export default htSign;

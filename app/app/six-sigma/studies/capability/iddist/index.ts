// app/app/six-sigma/studies/capability/iddist/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeIdDist } from "./compute";
import { IDDIST_DEFAULT, type IdDistParams, type IdDistResult } from "./types";

const iddist: AnalysisDefinition<IdDistParams, IdDistResult> = {
  id: "iddist",
  kind: "analysis",
  phase: "measure",
  label: "Identification",
  defaultParams: IDDIST_DEFAULT,
  compute: computeIdDist,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) => (p.col && p.col.trim() !== "" ? [p.col] : []),
};

export default iddist;

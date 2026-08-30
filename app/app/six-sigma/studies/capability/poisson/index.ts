// app/app/six-sigma/studies/capability/poisson/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeCapPoisson } from "./compute";
import {
  CAPPOISSON_DEFAULT,
  type CapPoissonParams,
  type CapPoissonResult,
} from "./types";

const capPoisson: AnalysisDefinition<CapPoissonParams, CapPoissonResult> = {
  id: "capPoisson",
  kind: "analysis",
  phase: "measure",
  label: "Poisson Capability",
  defaultParams: CAPPOISSON_DEFAULT,
  compute: computeCapPoisson,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) =>
    Array.from(
      new Set(
        [p.defects, p.sizeMode === "column" ? p.sizeColumn : null].filter(
          (s): s is string => !!s && s.trim() !== ""
        )
      )
    ),
};

export default capPoisson;

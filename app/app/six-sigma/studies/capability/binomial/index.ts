// app/app/six-sigma/studies/capability/binomial/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeCapBinomial } from "./compute";
import {
  CAPBINOMIAL_DEFAULT,
  type CapBinomialParams,
  type CapBinomialResult,
} from "./types";

const capBinomial: AnalysisDefinition<CapBinomialParams, CapBinomialResult> = {
  id: "capBinomial",
  kind: "analysis",
  phase: "measure",
  label: "Binomial Capability",
  defaultParams: CAPBINOMIAL_DEFAULT,
  compute: computeCapBinomial,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) =>
    Array.from(
      new Set(
        [p.defectives, p.sizeMode === "column" ? p.sizeColumn : null].filter(
          (s): s is string => !!s && s.trim() !== ""
        )
      )
    ),
};

export default capBinomial;

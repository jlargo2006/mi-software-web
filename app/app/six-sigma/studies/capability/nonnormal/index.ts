// app/app/six-sigma/studies/capability/nonnormal/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeCapNonnormal } from "./compute";
import {
  CAPNONNORMAL_DEFAULT,
  type CapNonnormalParams,
  type CapNonnormalResult,
} from "./types";

const capNonnormal: AnalysisDefinition<CapNonnormalParams, CapNonnormalResult> = {
  id: "capNonnormal",
  kind: "analysis",
  phase: "measure",
  label: "Nonnormal",
  defaultParams: CAPNONNORMAL_DEFAULT,
  compute: computeCapNonnormal,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) => (p.col && p.col.trim() !== "" ? [p.col] : []),
};

export default capNonnormal;

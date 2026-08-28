// app/app/six-sigma/studies/capability/sixpack/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeCapSixpack } from "./compute";
import {
  CAPSIXPACK_DEFAULT,
  type CapSixpackParams,
  type CapSixpackResult,
} from "./types";

const capSixpack: AnalysisDefinition<CapSixpackParams, CapSixpackResult> = {
  id: "capSixpack",
  kind: "analysis",
  phase: "measure",
  label: "Normal Sixpack",
  defaultParams: CAPSIXPACK_DEFAULT,
  compute: computeCapSixpack,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) =>
    p.col && p.col.trim() !== "" ? [p.col] : [],
};

export default capSixpack;

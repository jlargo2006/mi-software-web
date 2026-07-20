// studies/capability/index.ts
import type { AnalysisDefinition } from "../types";
import type { CapabilityParams, CapabilityResult } from "./types";
import { CAPABILITY_DEFAULT } from "./types";
import { computeCapability } from "./compute";
import CapabilityControls from "./Controls";
import CapabilityResults from "./Results";

export const capability: AnalysisDefinition<CapabilityParams, CapabilityResult> = {
  id: "capability",
  label: "Capability Study (Cp / Cpk)",
  phase: "analyze", // ⚠️ CONFIRMAR fase real en el ribbon viejo
  kind: "analysis",
  defaultParams: CAPABILITY_DEFAULT,
  referencedColumns: (p) => [p.col].filter((n): n is string => !!n),
  Controls: CapabilityControls,
  compute: computeCapability,
  Results: CapabilityResults,
};

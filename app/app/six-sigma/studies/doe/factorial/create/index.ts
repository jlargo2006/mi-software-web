// app/app/six-sigma/studies/doe/factorial/create/index.ts
import type { AnalysisDefinition } from "../../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeDoeCreate } from "./compute";
import {
  DOECREATE_DEFAULT,
  type DoeCreateParams,
  type DoeCreateResult,
} from "./types";

const doeCreateFactorial: AnalysisDefinition<DoeCreateParams, DoeCreateResult> = {
  id: "doeCreateFactorial",
  kind: "analysis",
  phase: "improve",
  label: "Create Factorial Design",
  defaultParams: DOECREATE_DEFAULT,
  compute: computeDoeCreate,
  Controls,
  Results,
  Theory,
  // Este estudio no lee columnas: genera el diseno desde cero.
  referencedColumns: () => [],
  sheetOutputs: (_p, r) =>
    r.ok
      ? [{ name: r.sheetName, headers: r.sheetHeaders, rows: r.sheetRows }]
      : [],
};

export default doeCreateFactorial;

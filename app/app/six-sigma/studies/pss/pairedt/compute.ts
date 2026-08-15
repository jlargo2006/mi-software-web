// app/app/six-sigma/studies/pss/pairedt/compute.ts
import type { ColumnSnapshot } from "../../types";
import { emptyCore, runPss, type PssSpec } from "../_shared/engine";
// El t emparejado es un t de una muestra sobre las diferencias: mismos grados
// de libertad y mismo parametro de no centralidad. Se reutiliza su potencia.
import { powerOf } from "../onesamplet/compute";
import type { PssPairedTParams, PssPairedTResult } from "./types";

const SPEC: PssSpec = { powerOf, minN: 2 };

export function computePssPairedT(
  _data: ColumnSnapshot,
  params: PssPairedTParams
): PssPairedTResult {
  const run = runPss(SPEC, params);
  if (!run.ok) return { ok: false, error: run.error, ...emptyCore(params) };
  return { ...run };
}

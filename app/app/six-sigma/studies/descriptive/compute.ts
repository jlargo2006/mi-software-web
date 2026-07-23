// studies/descriptive/compute.ts
import type { ColumnSnapshot } from "../types";
import type { Cell } from "../../lib/types";
import type { DescriptiveParams, DescriptiveResult, DescriptiveRow } from "./types";
import {
  STAT_DEFS,
  modeCount,
  type StatKey,
} from "../../lib/descriptiveStats";
import { buildContext } from "../../lib/statistics";

// Recorta SOLO las celdas vacias del final (no son missing reales).
// Idempotente: si el snapshot ya viene recortado, no hace nada.
function trimTrailingEmpty(col: Cell[]): Cell[] {
  let last = col.length - 1;
  while (last >= 0 && String(col[last] ?? "").trim() === "") last--;
  return col.slice(0, last + 1);
}

export function computeDescriptive(
  data: ColumnSnapshot,
  params: DescriptiveParams
): DescriptiveResult {
  const selectedSet = new Set<StatKey>(params.selectedStats);

  // activeKeys en el orden canonico de STAT_DEFS
  const activeKeys = STAT_DEFS.filter((d) => selectedSet.has(d.key)).map(
    (d) => d.key
  );
  const showModeCount = selectedSet.has("mode");

  const rows: DescriptiveRow[] = [];
  for (const name of params.selectedColNames) {
    const col = data[name];
    if (!col) continue;
    const raw = trimTrailingEmpty(col.values);

    // buildContext una sola vez por columna (reuso para valores + modeCount)
    const ctx = buildContext(raw);
    const values: Record<string, string> = {};
    for (const def of STAT_DEFS) {
      if (selectedSet.has(def.key)) values[def.key] = def.compute(ctx);
    }

    rows.push({
      colName: col.name,
      values,
      modeCount: showModeCount ? modeCount(ctx) : undefined,
    });
  }

  return { rows, activeKeys, showModeCount };
}

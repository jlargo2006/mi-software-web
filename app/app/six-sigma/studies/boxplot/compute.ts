// app/app/six-sigma/studies/boxplot/compute.ts
import type { ColumnSnapshot } from "../types";
import { cleanNumeric } from "../../lib/columns";
import type {
  BoxplotParams,
  BoxplotResult,
  BoxPanel,
  BoxSeries,
} from "./types";

/** Pares (valor, grupo) alineados por fila, descartando blancos/no-numéricos. */
function pairsByGroup(
  values: unknown[],
  groupValues: unknown[]
): Map<string, number[]> {
  const map = new Map<string, number[]>();
  for (let i = 0; i < values.length; i++) {
    const raw = values[i];
    if (raw === null || raw === undefined || String(raw).trim() === "") continue;
    const v = Number(raw);
    if (!Number.isFinite(v)) continue;
    const g = String(groupValues[i] ?? "").trim() || "(blank)";
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(v);
  }
  return map;
}

export function computeBoxplot(
  data: ColumnSnapshot,
  params: BoxplotParams
): BoxplotResult {
  const cols =
    params.yMode === "one" ? params.cols.slice(0, 1) : params.cols;

  const groupCol =
    params.groups && params.groupBy ? data[params.groupBy] : null;

  const empty: BoxplotResult = {
    panels: [],
    orientation: params.orientation,
    valueTitle: "Data",
    catTitle: "",
    title: "Boxplot",
  };
  if (cols.length === 0) return empty;

  const title =
    cols.length === 1
      ? `Boxplot of ${cols[0]}`
      : `Boxplot of ${cols.join(", ")}`;

  const panels: BoxPanel[] = [];

  if (params.yMode === "one") {
    const name = cols[0];
    const col = data[name];
    if (!col) return empty;

    if (!params.groups || !groupCol) {
      // One Y Simple → 1 panel, 1 box
      panels.push({
        title: null,
        boxes: [{ label: name, values: cleanNumeric(col.values) }],
      });
      return {
        panels,
        orientation: params.orientation,
        valueTitle: name,
        catTitle: "",
        title,
      };
    }

    // One Y With Groups → 1 panel, 1 box por nivel
    const byG = pairsByGroup(col.values, groupCol.values);
    const boxes: BoxSeries[] = Array.from(byG.entries()).map(([g, vals]) => ({
      label: g,
      values: vals,
    }));
    panels.push({ title: null, boxes });
    return {
      panels,
      orientation: params.orientation,
      valueTitle: name,
      catTitle: params.groupBy!,
      title,
    };
  }

  // Multiple Y's
  if (!params.groups || !groupCol) {
    // Multiple Simple → 1 panel, 1 box por columna
    const boxes: BoxSeries[] = cols
      .filter((n) => data[n])
      .map((n) => ({ label: n, values: cleanNumeric(data[n].values) }));
    panels.push({ title: null, boxes });
    return {
      panels,
      orientation: params.orientation,
      valueTitle: "Data",
      catTitle: "",
      title,
    };
  }

  // Multiple With Groups → 1 panel, 1 box por Y×nivel
  const boxes: BoxSeries[] = [];
  for (const n of cols) {
    const col = data[n];
    if (!col) continue;
    const byG = pairsByGroup(col.values, groupCol.values);
    for (const [g, vals] of byG) {
      boxes.push({ label: `${n} / ${g}`, values: vals });
    }
  }
  panels.push({ title: null, boxes });
  return {
    panels,
    orientation: params.orientation,
    valueTitle: "Data",
    catTitle: params.groupBy!,
    title,
  };
}

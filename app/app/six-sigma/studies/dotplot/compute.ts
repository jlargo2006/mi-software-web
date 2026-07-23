// app/app/six-sigma/studies/dotplot/compute.ts
import type { ColumnSnapshot } from "../types";
import { cleanNumeric } from "../../lib/columns";
import { niceBins, fixedBins } from "../../lib/binning";
import type {
  DotplotParams,
  DotplotResult,
  DotPanel,
  DotPoint,
} from "./types";

interface Pair {
  value: number;
  group: string;
}

/** Pares (valor numérico, grupo) alineados por fila, descartando blancos/no-numéricos. */
function pairsOf(
  values: unknown[],
  groupValues: unknown[] | null
): Pair[] {
  const res: Pair[] = [];
  for (let i = 0; i < values.length; i++) {
    const raw = values[i];
    if (raw === null || raw === undefined || String(raw).trim() === "") continue;
    const v = Number(raw);
    if (!Number.isFinite(v)) continue;
    const g = groupValues ? String(groupValues[i] ?? "").trim() : "";
    res.push({ value: v, group: g || "(blank)" });
  }
  return res;
}

/** Apila los puntos de un panel: y = 1,2,3… dentro de cada bin. */
function stackPanel(
  raw: { value: number; series: string }[],
  start: number,
  size: number
): { points: DotPoint[]; maxStack: number } {
  const byBin = new Map<number, { value: number; series: string }[]>();
  for (const p of raw) {
    const bi = Math.floor((p.value - start) / size);
    if (!byBin.has(bi)) byBin.set(bi, []);
    byBin.get(bi)!.push(p);
  }
  const points: DotPoint[] = [];
  let maxStack = 0;
  for (const [bi, arr] of byBin) {
    const center = start + (bi + 0.5) * size;
    arr.forEach((p, i) => {
      points.push({ x: center, y: i + 1, series: p.series });
      if (i + 1 > maxStack) maxStack = i + 1;
    });
  }
  return { points, maxStack };
}

export function computeDotplot(
  data: ColumnSnapshot,
  params: DotplotParams
): DotplotResult {
  const cols =
    params.yMode === "one"
      ? params.cols.slice(0, 1)
      : params.cols;

  const groupCol = params.groupBy ? data[params.groupBy] : null;
  const groupValues = groupCol ? groupCol.values : null;

  // Rango global (todos los valores de todas las columnas) para eje X común
  const allValues: number[] = [];
  for (const name of cols) {
    const col = data[name];
    if (col) allValues.push(...cleanNumeric(col.values));
  }

  const empty: DotplotResult = {
    panels: [],
    seriesNames: [],
    xStart: 0,
    xEnd: 1,
    title: "Dotplot",
    xTitle: "Data",
    showLegend: false,
  };
  if (allValues.length === 0) return empty;

  const bins =
    params.binMode === "fixed"
      ? fixedBins(allValues, Math.max(1, params.nBins))
      : niceBins(allValues);

  // Grupos distintos (orden de aparición)
  const distinctGroups: string[] = [];
  if (params.groupBy) {
    for (const name of cols) {
      for (const p of pairsOf(data[name]?.values ?? [], groupValues)) {
        if (!distinctGroups.includes(p.group)) distinctGroups.push(p.group);
      }
    }
  }

  const panels: DotPanel[] = [];
  const seriesSet = new Set<string>();

  const pushPanel = (
    label: string,
    raw: { value: number; series: string }[]
  ) => {
    raw.forEach((r) => seriesSet.add(r.series));
    const { points, maxStack } = stackPanel(raw, bins.start, bins.size);
    panels.push({ label, points, maxStack });
  };

  const { yMode, arrangement } = params;

  if (yMode === "one") {
    const name = cols[0];
    const col = data[name];
    if (arrangement === "simple") {
      pushPanel(
        "",
        cleanNumeric(col.values).map((v) => ({ value: v, series: name }))
      );
    } else if (arrangement === "withGroups") {
      for (const g of distinctGroups) {
        const raw = pairsOf(col.values, groupValues)
          .filter((p) => p.group === g)
          .map((p) => ({ value: p.value, series: name }));
        pushPanel(g, raw);
      }
    } else {
      // stackGroups: 1 panel, series = grupo
      const raw = pairsOf(col.values, groupValues).map((p) => ({
        value: p.value,
        series: p.group,
      }));
      pushPanel("", raw);
    }
  } else {
    // multiple
    if (arrangement === "simple") {
      for (const name of cols) {
        pushPanel(
          name,
          cleanNumeric(data[name].values).map((v) => ({ value: v, series: name }))
        );
      }
    } else if (arrangement === "stack") {
      // Stack Y's: 1 panel, series = cada Y
      const raw: { value: number; series: string }[] = [];
      for (const name of cols) {
        raw.push(
          ...cleanNumeric(data[name].values).map((v) => ({ value: v, series: name }))
        );
      }
      pushPanel("", raw);
    } else if (arrangement === "withGroups") {
      // uno por Y×grupo
      for (const name of cols) {
        for (const g of distinctGroups) {
          const raw = pairsOf(data[name].values, groupValues)
            .filter((p) => p.group === g)
            .map((p) => ({ value: p.value, series: name }));
          pushPanel(`${name} / ${g}`, raw);
        }
      }
    } else {
      // stackGroups: uno por Y, series = grupo
      for (const name of cols) {
        const raw = pairsOf(data[name].values, groupValues).map((p) => ({
          value: p.value,
          series: p.group,
        }));
        pushPanel(name, raw);
      }
    }
  }

  const title =
    cols.length === 1
      ? `Dotplot of ${cols[0]}`
      : `Dotplot of ${cols.join(", ")}`;
  const xTitle = cols.length === 1 ? cols[0] : "Data";

  const seriesNames = Array.from(seriesSet);

  return {
    panels,
    seriesNames,
    xStart: bins.start,
    xEnd: bins.end,
    title,
    xTitle,
    showLegend: seriesNames.length > 1,
  };
}

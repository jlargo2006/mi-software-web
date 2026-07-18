// studies/fishbone/compute.ts
import type { ColumnSnapshot } from "../types";
import type { FishboneParams, FishboneResult, FishboneNode } from "./types";

export function computeFishbone(
  data: ColumnSnapshot,
  params: FishboneParams
): FishboneResult {
  // 1) Construye un nodo por cada fila que tenga columna asignada.
  const nodes = new Map<number, FishboneNode>();

  params.rows.forEach((row, idx) => {
    const branch = idx + 1; // 1-based
    if (!row.colName) return;

    const col = data[row.colName];
    const causes = col
      ? col.values
          .map((v) => String(v ?? "").trim())
          .filter((s) => s.length > 0)
      : [];

    const isMain = row.hangsFrom === null;
    nodes.set(branch, {
      branch,
      label: isMain ? row.colName : null, // solo principales tienen label
      causes,
      children: [],
    });
  });

  // 2) Enlaza hijos con padres (N niveles). "Hangs from" solo mira hacia atras.
  const spines: FishboneNode[] = [];
  params.rows.forEach((row, idx) => {
    const branch = idx + 1;
    const node = nodes.get(branch);
    if (!node) return;

    if (row.hangsFrom === null) {
      spines.push(node);
    } else {
      const parent = nodes.get(row.hangsFrom);
      // Si el padre no existe (fila vacia o invalida), se degrada a principal
      if (parent && row.hangsFrom < branch) parent.children.push(node);
      else spines.push(node);
    }
  });

  return { effect: params.effect, spines };
}

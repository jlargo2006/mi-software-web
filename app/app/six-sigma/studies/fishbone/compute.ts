// studies/fishbone/compute.ts
import type { ColumnSnapshot } from "../types";
import type {
  FishboneParams,
  FishboneResult,
  FishboneNode,
} from "./types";

// Valores no vacios de una columna del snapshot, por su nombre.
function causesOfColumn(data: ColumnSnapshot, colName: string | null): string[] {
  if (!colName) return [];
  const col = data[colName];
  if (!col) return [];
  return col.values
    .map((v) => String(v ?? "").trim())
    .filter((s) => s.length > 0);
}

export function computeFishbone(
  data: ColumnSnapshot,
  params: FishboneParams
): FishboneResult {
  const { rows } = params;

  // Construye el nodo de una fila (branch = idx+1).
  const buildNode = (idx: number): FishboneNode => {
    const row = rows[idx];
    const isSub = row.hangsFrom !== null;
    return {
      branch: idx + 1,
      // etiqueta = nombre de la columna solo en espinas principales
      label: !isSub ? (row.colName ?? null) : null,
      causes: causesOfColumn(data, row.colName),
      attachTo: isSub ? row.fromCause : null,
      children: [],
    };
  };

  // Mapa branch(1..N) -> nodo, solo para filas con columna asignada.
  const nodeByBranch = new Map<number, FishboneNode>();
  rows.forEach((row, idx) => {
    if (row.colName) nodeByBranch.set(idx + 1, buildNode(idx));
  });

  const spines: FishboneNode[] = [];

  // Ensambla el arbol: cada nodo cuelga de su padre (hangsFrom) o es principal.
  rows.forEach((row, idx) => {
    const branch = idx + 1;
    const node = nodeByBranch.get(branch);
    if (!node) return;

    if (row.hangsFrom === null) {
      spines.push(node);
    } else {
      const parent = nodeByBranch.get(row.hangsFrom);
      if (parent) parent.children.push(node);
      else spines.push(node); // padre invalido -> tratamos como principal
    }
  });

  return {
    title: params.title,
    effect: params.effect,
    spines,
  };
}

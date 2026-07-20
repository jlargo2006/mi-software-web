// studies/fishbone/Results.tsx
"use client";
import React, { useMemo } from "react";
import type { FishboneResult, FishboneNode } from "./types";

const BRAND = "#00674d";
const SPINE_COLOR = "#111827";
const TEXT_COLOR = "#111827";

// ---------- Layout helpers ----------
// Un segmento dibujable (linea + etiqueta + causas).
interface Seg {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string | null;
  causes: string[];
  depth: number;
  up: boolean;
  color: string;
}

// Longitud aproximada segun cuantas causas cuelgan (para que quepan).
function segLength(node: FishboneNode, depth: number): number {
  const base = depth === 0 ? 150 : 90;
  return base + node.causes.length * 16;
}

/**
 * Recorre el arbol y produce segmentos posicionados.
 * - depth par (0,2,...) -> diagonal 45/135 (up ? 135 : 45)
 * - depth impar (1,3,...) -> horizontal
 */
function layoutNode(
  node: FishboneNode,
  originX: number,
  originY: number,
  up: boolean,
  depth: number,
  segs: Seg[]
): void {
  const len = segLength(node, depth);
  const diagonal = depth % 2 === 0;

  let x2: number;
  let y2: number;
  if (diagonal) {
    // 45 (abajo->arriba hacia la izquierda) o 135; usamos componente hacia la
    // columna vertebral. dx negativo (hacia la cabeza a la derecha), dy segun lado.
    const dx = len * 0.7;
    const dy = len * 0.7 * (up ? -1 : 1);
    x2 = originX - dx;
    y2 = originY + dy;
  } else {
    // horizontal (subespina)
    x2 = originX - len;
    y2 = originY;
  }

  const color = depth === 0 ? SPINE_COLOR : BRAND;
  segs.push({
    x1: originX,
    y1: originY,
    x2,
    y2,
    label: node.label,
    causes: node.causes,
    depth,
    up,
    color,
  });

  // Coloca los hijos a lo largo de este segmento.
  const n = node.children.length;
  node.children.forEach((child, i) => {
    const t = (i + 1) / (n + 1); // fraccion a lo largo del segmento padre
    const cx = node ? node : node; // (placeholder, ver abajo)
    const px = originX + (x2 - originX) * t;
    const py = originY + (y2 - originY) * t;
    // Los hijos alternan lado respecto al padre para repartir espacio.
    const childUp = depth % 2 === 0 ? up : i % 2 === 0;
    layoutNode(child, px, py, childUp, depth + 1, segs);
  });
}

export default function FishboneResults({ result }: { result: FishboneResult }) {
  const { segs, width, height, headX, headY } = useMemo(() => {
    const segs: Seg[] = [];
    const W = 1100;
    const H = 640;
    const headX = W - 140; // cabeza del pez a la derecha
    const headY = H / 2;
    const spineStartX = 60; // cola a la izquierda

    // Espinas principales repartidas a lo largo de la columna vertebral.
    const spines = result.spines;
    const n = spines.length;
    spines.forEach((spine, i) => {
      // punto de anclaje sobre la columna vertebral
      const t = n === 1 ? 0.5 : (i + 1) / (n + 1);
      const ax = spineStartX + (headX - spineStartX) * t;
      const up = i % 2 === 0;
      layoutNode(spine, ax, headY, up, 0, segs);
    });

    return { segs, width: W, height: H, headX, headY, spineStartX };
  }, [result]);

  const spineStartX = 60;

  return (
    <div className="w-full overflow-auto">
      {/* Title arriba del diagrama */}
      <h2
        className="mb-2 text-center text-lg font-semibold"
        style={{ color: TEXT_COLOR }}
      >
        {result.title}
      </h2>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto block"
      >
        {/* Columna vertebral (backbone) */}
        <line
          x1={spineStartX}
          y1={headY}
          x2={headX}
          y2={headY}
          stroke={SPINE_COLOR}
          strokeWidth={3}
        />

        {/* Cabeza del pez (Effect) */}
        <polygon
          points={`${headX},${headY - 40} ${headX + 90},${headY} ${headX},${headY + 40}`}
          fill={BRAND}
          opacity={0.9}
        />
        <text
          x={headX + 45}
          y={headY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={13}
          fontWeight={700}
          fill="#fff"
        >
          {result.effect}
        </text>

        {/* Segmentos (espinas, subespinas, sub-subespinas) */}
        {segs.map((s, i) => (
          <g key={i}>
            <line
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke={s.color}
              strokeWidth={s.depth === 0 ? 2.5 : 1.5}
            />
            {/* Etiqueta de la espina principal (categoria) en la punta */}
            {s.label && (
              <text
                x={s.x2}
                y={s.y2 + (s.up ? -8 : 16)}
                textAnchor="middle"
                fontSize={12}
                fontWeight={700}
                fill={s.color}
              >
                {s.label}
              </text>
            )}
            {/* Causas escritas a lo largo del segmento */}
            {s.causes.map((cause, ci) => {
              const t = (ci + 1) / (s.causes.length + 1);
              const cx = s.x1 + (s.x2 - s.x1) * t;
              const cy = s.y1 + (s.y2 - s.y1) * t;
              return (
                <text
                  key={ci}
                  x={cx + 6}
                  y={cy + (s.up ? -4 : 12)}
                  fontSize={10}
                  fill={TEXT_COLOR}
                >
                  {cause}
                </text>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}

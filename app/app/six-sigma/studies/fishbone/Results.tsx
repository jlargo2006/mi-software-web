// studies/fishbone/Results.tsx
"use client";
import React, { useMemo } from "react";
import type { ColumnSnapshot } from "../types";
import type { FishboneParams, FishboneResult, FishboneNode } from "./types";

const BRAND = "#00674d";
const SPINE_COLOR = "#111827";
const TEXT_COLOR = "#111827";

// Angulos de las espinas diagonales (medidos desde la vertebra).
const DIAG_UP = (110 * Math.PI) / 180;    // arriba-izquierda
const DIAG_DOWN = (-110 * Math.PI) / 180; // abajo-izquierda

// Longitudes
const MAIN_BASE = 170;
const MAIN_PER_CAUSE = 14;
const SUB_BASE = 110;
const SUB_PER_CAUSE = 12;

interface CauseLabel {
  text: string;
  x: number;
  y: number;
}

interface Seg {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string | null;
  labelX: number;
  labelY: number;
  causeLabels: CauseLabel[];
  depth: number;
  up: boolean;
  horizontal: boolean;
  color: string;
}

// Parte el texto largo en varias lineas (~maxChars por linea) por palabras.
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [text];
}

/**
 * Coloca un nodo y su descendencia.
 * - depth par (0,2,...) -> diagonal 110/-110
 * - depth impar (1,3,...) -> horizontal
 * Los hijos se anclan EXACTAMENTE en el punto de su causa "attachTo" en el padre.
 */
function layoutNode(
  node: FishboneNode,
  originX: number,
  originY: number,
  up: boolean,
  depth: number,
  len: number,
  segs: Seg[]
): void {
  const horizontal = depth % 2 === 1;

  let x2: number;
  let y2: number;
  if (horizontal) {
    x2 = originX - len;
    y2 = originY;
  } else {
    const ang = up ? DIAG_UP : DIAG_DOWN;
    x2 = originX + len * Math.cos(ang);
    y2 = originY - len * Math.sin(ang);
  }

  // Puntos de cada causa a lo largo del segmento.
  const causeLabels: CauseLabel[] = node.causes.map((c, ci) => {
    const t = (ci + 1) / (node.causes.length + 1);
    return {
      text: c,
      x: originX + (x2 - originX) * t,
      y: originY + (y2 - originY) * t,
    };
  });

  const color = depth === 0 ? SPINE_COLOR : BRAND;
  segs.push({
    x1: originX,
    y1: originY,
    x2,
    y2,
    label: node.label,
    labelX: x2,
    labelY: y2 + (up ? -10 : 18),
    causeLabels,
    depth,
    up,
    horizontal,
    color,
  });

  // Hijos: se anclan en el punto de la causa elegida (attachTo).
  node.children.forEach((child, i) => {
    const idx = child.attachTo ? node.causes.indexOf(child.attachTo) : -1;
    const anchor =
      idx >= 0
        ? causeLabels[idx]
        : { x: (originX + x2) / 2, y: (originY + y2) / 2 }; // fallback: mitad

    // Si el padre es horizontal, el hijo es diagonal (alterna arriba/abajo).
    // Si el padre es diagonal, el hijo es horizontal (hereda 'up' solo a efectos de texto).
    const childUp = horizontal ? i % 2 === 0 : up;
    const childLen = SUB_BASE + child.causes.length * SUB_PER_CAUSE;
    layoutNode(child, anchor.x, anchor.y, childUp, depth + 1, childLen, segs);
  });
}

export default function FishboneResults({
  result,
}: {
  data: ColumnSnapshot;
  params: FishboneParams;
  result: FishboneResult;
}) {
  const { segs, width, height, headX, headY, spineStartX, effectLines } =
    useMemo(() => {
      const segs: Seg[] = [];
      const W = 1150;
      const H = 660;
      const headX = W - 230; // flecha pequena; texto del effect a su derecha
      const headY = H / 2;
      const spineStartX = 60;

      // Punto 2: todas las espinas principales con la MISMA longitud (la mayor).
      const spines = result.spines;
      const mainLen = spines.reduce(
        (max, s) => Math.max(max, MAIN_BASE + s.causes.length * MAIN_PER_CAUSE),
        MAIN_BASE
      );

      const n = spines.length;
      spines.forEach((spine, i) => {
        const t = n === 1 ? 0.5 : (i + 1) / (n + 1);
        const ax = spineStartX + (headX - spineStartX) * t;
        const up = i % 2 === 0;
        layoutNode(spine, ax, headY, up, 0, mainLen, segs);
      });

      const effectLines = wrapText(result.effect, 22);

      return {
        segs,
        width: W,
        height: H,
        headX,
        headY,
        spineStartX,
        effectLines,
      };
    }, [result]);

  return (
    <div className="w-full overflow-auto">
      {/* Punto: Title arriba del diagrama */}
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
        {/* Vertebra */}
        <line
          x1={spineStartX}
          y1={headY}
          x2={headX}
          y2={headY}
          stroke={SPINE_COLOR}
          strokeWidth={3}
        />

        {/* Punto 3: flecha PEQUENA + texto multilinea a su derecha */}
        <polygon
          points={`${headX},${headY - 22} ${headX + 40},${headY} ${headX},${headY + 22}`}
          fill={BRAND}
          opacity={0.9}
        />
        <text
          x={headX + 50}
          y={headY - (effectLines.length - 1) * 8}
          fontSize={13}
          fontWeight={700}
          fill={TEXT_COLOR}
        >
          {effectLines.map((ln, i) => (
            <tspan key={i} x={headX + 50} dy={i === 0 ? 0 : 16}>
              {ln}
            </tspan>
          ))}
        </text>

        {/* Segmentos */}
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

            {/* Etiqueta de categoria (solo espinas principales) */}
            {s.label && (
              <text
                x={s.labelX}
                y={s.labelY}
                textAnchor="middle"
                fontSize={12}
                fontWeight={700}
                fill={s.color}
              >
                {s.label}
              </text>
            )}

            {/* Causas */}
            {s.causeLabels.map((cl, ci) =>
              s.horizontal ? (
                // Punto 4: en subespinas, texto a -45 ENCIMA de la linea horizontal
                <text
                  key={ci}
                  x={cl.x}
                  y={cl.y - 4}
                  fontSize={10}
                  fill={TEXT_COLOR}
                  textAnchor="start"
                  transform={`rotate(-45 ${cl.x} ${cl.y - 4})`}
                >
                  {cl.text}
                </text>
              ) : (
                // En espinas diagonales, texto junto a la linea
                <text
                  key={ci}
                  x={cl.x + 6}
                  y={cl.y + (s.up ? -4 : 12)}
                  fontSize={10}
                  fill={TEXT_COLOR}
                >
                  {cl.text}
                </text>
              )
            )}
          </g>
        ))}
      </svg>

      {result.spines.length === 0 && (
        <div className="text-sm text-gray-400">
          Assign at least one column to a branch to see the diagram.
        </div>
      )}
    </div>
  );
}

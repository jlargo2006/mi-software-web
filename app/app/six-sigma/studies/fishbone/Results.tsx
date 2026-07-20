// studies/fishbone/Results.tsx
"use client";
import React, { useMemo } from "react";
import type { ColumnSnapshot } from "../types";
import type { FishboneParams, FishboneResult, FishboneNode } from "./types";

const BRAND = "#00674d";
const SPINE_COLOR = "#111827";
const TEXT_COLOR = "#111827";

const DIAG_UP = (110 * Math.PI) / 180;
const DIAG_DOWN = (-110 * Math.PI) / 180;

const MAIN_BASE = 170;
const MAIN_PER_CAUSE = 14;
const SUB_BASE = 110;
const SUB_PER_CAUSE = 12;

const CHAR_W = 5.6;
const LABEL_H = 12;

interface CauseLabel {
  text: string;
  ax: number;
  ay: number;
  x: number;
  y: number;
  rotate: number;
  anchor: "start" | "middle";
  w: number;
  horizontal: boolean; // NEW: pertenece a una subespina horizontal
  lineY: number;       // NEW: Y de la linea de la que cuelga (para el tope)
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

  const causeLabels: CauseLabel[] = node.causes.map((c, ci) => {
    const t = (ci + 1) / (node.causes.length + 1);
    const ax = originX + (x2 - originX) * t;
    const ay = originY + (y2 - originY) * t;
    if (horizontal) {
      // Cambio: texto DEBAJO de la linea (rotate 45, cabeceado hacia abajo)
      // y con tope para no superar la horizontal (ver deOverlap/clamp).
      return {
        text: c,
        ax,
        ay,
        x: ax,
        y: ay + LABEL_H, // por debajo de la linea
        rotate: 45,
        anchor: "start" as const,
        w: c.length * CHAR_W,
        horizontal: true,
        lineY: ay,
      };
    }
    return {
      text: c,
      ax,
      ay,
      x: ax + 6,
      y: ay + (up ? -4 : 12),
      rotate: 0,
      anchor: "start" as const,
      w: c.length * CHAR_W,
      horizontal: false,
      lineY: ay,
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

  node.children.forEach((child, i) => {
    const idx = child.attachTo ? node.causes.indexOf(child.attachTo) : -1;
    const anchor =
      idx >= 0
        ? { x: causeLabels[idx].ax, y: causeLabels[idx].ay }
        : { x: (originX + x2) / 2, y: (originY + y2) / 2 };

    const childUp = horizontal ? i % 2 === 0 : up;
    const childLen = SUB_BASE + child.causes.length * SUB_PER_CAUSE;
    layoutNode(child, anchor.x, anchor.y, childUp, depth + 1, childLen, segs);
  });
}

function boxOf(l: CauseLabel) {
  const half = l.anchor === "middle" ? l.w / 2 : 0;
  return {
    minX: l.x - half,
    maxX: l.x - half + l.w,
    minY: l.y - LABEL_H,
    maxY: l.y,
  };
}

function overlaps(a: CauseLabel, b: CauseLabel): boolean {
  const A = boxOf(a);
  const B = boxOf(b);
  return !(A.maxX < B.minX || A.minX > B.maxX || A.maxY < B.minY || A.minY > B.maxY);
}

// NEW: mantiene las etiquetas de subespinas siempre por DEBAJO de su linea.
function clampHorizontal(labels: CauseLabel[]): void {
  for (const l of labels) {
    if (l.horizontal) {
      // el borde superior de la caja no puede quedar por encima de la linea
      const minAllowedY = l.lineY + LABEL_H;
      if (l.y < minAllowedY) l.y = minAllowedY;
    }
  }
}

function deOverlap(labels: CauseLabel[]): void {
  const PASSES = 6;
  const STEP = LABEL_H + 2;
  for (let p = 0; p < PASSES; p++) {
    let moved = false;
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        if (overlaps(labels[i], labels[j])) {
          if (labels[i].y <= labels[j].y) {
            labels[i].y -= STEP / 2;
            labels[j].y += STEP / 2;
          } else {
            labels[i].y += STEP / 2;
            labels[j].y -= STEP / 2;
          }
          moved = true;
        }
      }
    }
    // NEW: tras cada pasada, reaplica el tope de las subespinas
    clampHorizontal(labels);
    if (!moved) break;
  }
  clampHorizontal(labels); // seguridad final
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
      const headX = W - 230;
      const headY = H / 2;
      const spineStartX = 60;

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

      const allLabels = segs.flatMap((s) => s.causeLabels);
      deOverlap(allLabels);

      const effectLines = wrapText(result.effect, 22);

      return { segs, width: W, height: H, headX, headY, spineStartX, effectLines };
    }, [result]);

  return (
    <div className="w-full overflow-auto">
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
        <line
          x1={spineStartX}
          y1={headY}
          x2={headX}
          y2={headY}
          stroke={SPINE_COLOR}
          strokeWidth={3}
        />

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

            {s.causeLabels.map((cl, ci) => (
              <g key={ci}>
                {(Math.abs(cl.x - cl.ax) > 1 || Math.abs(cl.y - cl.ay) > 6) && (
                  <line
                    x1={cl.ax}
                    y1={cl.ay}
                    x2={cl.x}
                    y2={cl.y - LABEL_H / 2}
                    stroke="#9ca3af"
                    strokeWidth={0.5}
                  />
                )}
                <text
                  x={cl.x}
                  y={cl.y}
                  fontSize={10}
                  fill={TEXT_COLOR}
                  textAnchor={cl.anchor}
                  transform={
                    cl.rotate ? `rotate(${cl.rotate} ${cl.x} ${cl.y})` : undefined
                  }
                >
                  {cl.text}
                </text>
              </g>
            ))}
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

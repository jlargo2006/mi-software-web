// studies/pareto/Results.tsx
"use client";
import React, { useMemo } from "react";
import type { ColumnSnapshot } from "../types";
import type { ParetoParams, ParetoResult } from "./types";

const BRAND = "#00674d";
const BAR_FILL = "#4f8a7a";
const LINE_COLOR = "#b45309";
const AXIS = "#374151";
const TEXT = "#111827";

// Escala "nice": paso redondo y tope = primer multiplo del paso >= max.
function niceScale(max: number, targetTicks = 7) {
  if (max <= 0) return { niceMax: 1, step: 1, ticks: 1 };
  const rawStep = max / targetTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const norm = rawStep / mag;
  let niceStep: number;
  if (norm <= 1) niceStep = 1;
  else if (norm <= 2) niceStep = 2;
  else if (norm <= 2.5) niceStep = 2.5;
  else if (norm <= 5) niceStep = 5;
  else niceStep = 10;
  const step = niceStep * mag;
  const niceMax = Math.ceil(max / step) * step;
  return { niceMax, step, ticks: Math.round(niceMax / step) };
}

export default function ParetoResults({
  result,
}: {
  data: ColumnSnapshot;
  params: ParetoParams;
  result: ParetoResult;
}) {
  const { bars, total, countTitle } = result;

  const layout = useMemo(() => {
    const W = 1000;
    const H = 620;
    const marginTop = 30;
    const marginBottom = 120; // 4 niveles de etiquetas
    const marginLeft = 70;
    const marginRight = 70;

    const plotW = W - marginLeft - marginRight;
    const plotH = H - marginTop - marginBottom;

    const n = Math.max(bars.length, 1);
    const bandW = plotW / n;
    const barW = bandW * 0.7;

    // Eje izquierdo: paso redondo y tope >= total.
    const { niceMax: yMax, ticks: countTicks } = niceScale(total > 0 ? total : 1);

    const xCenter = (i: number) => marginLeft + bandW * i + bandW / 2;
    const yCount = (v: number) => marginTop + plotH - (v / yMax) * plotH;
    const yPct = (p: number) => marginTop + plotH - (p / 100) * plotH;

    return {
      W, H, marginTop, marginBottom, marginLeft, marginRight,
      plotW, plotH, bandW, barW, yMax, countTicks, xCenter, yCount, yPct,
    };
  }, [bars, total]);

  const {
    W, H, marginTop, marginLeft, marginRight,
    plotH, barW, yMax, countTicks, xCenter, yCount, yPct,
  } = layout;

  const cumPoints = bars
    .map((b, i) => `${xCenter(i)},${yCount((b.cumPercent / 100) * total)}`)
    .join(" ");

  return (
    <div className="w-full overflow-auto">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="mx-auto block">
        {/* Eje Y izquierdo (conteos) */}
        <line x1={marginLeft} y1={marginTop} x2={marginLeft} y2={marginTop + plotH} stroke={AXIS} />
        {Array.from({ length: countTicks + 1 }, (_, k) => {
          const v = (yMax / countTicks) * k;
          const y = yCount(v);
          return (
            <g key={`l${k}`}>
              <line x1={marginLeft - 4} y1={y} x2={marginLeft} y2={y} stroke={AXIS} />
              <text x={marginLeft - 8} y={y + 3} textAnchor="end" fontSize={10} fill={TEXT}>
                {Math.round(v)}
              </text>
            </g>
          );
        })}
        <text
          x={16}
          y={marginTop + plotH / 2}
          fontSize={12}
          fontWeight={700}
          fill={TEXT}
          transform={`rotate(-90 16 ${marginTop + plotH / 2})`}
          textAnchor="middle"
        >
          {countTitle}
        </text>

        {/* Eje Y derecho (Percent) */}
        <line x1={W - marginRight} y1={marginTop} x2={W - marginRight} y2={marginTop + plotH} stroke={AXIS} />
        {Array.from({ length: countTicks + 1 }, (_, k) => {
          const p = (100 / countTicks) * k;          // 0,20,40,60,80,100
          const y = yCount((p / 100) * total);        // altura del conteo equivalente
          return (
            <g key={`r${k}`}>
              <line x1={W - marginRight} y1={y} x2={W - marginRight + 4} y2={y} stroke={AXIS} />
              <text x={W - marginRight + 8} y={y + 3} textAnchor="start" fontSize={10} fill={TEXT}>
                {Math.round(p)}
              </text>
            </g>
          );
        })}
        <text
          x={W - 16}
          y={marginTop + plotH / 2}
          fontSize={12}
          fontWeight={700}
          fill={TEXT}
          transform={`rotate(90 ${W - 16} ${marginTop + plotH / 2})`}
          textAnchor="middle"
        >
          Percent
        </text>

        {/* Barras */}
        {bars.map((b, i) => {
          const x = xCenter(i) - barW / 2;
          const y = yCount(b.count);
          const h = marginTop + plotH - y;
          return (
            <rect
              key={`bar${i}`}
              x={x}
              y={y}
              width={barW}
              height={h}
              fill={b.isOther ? "#9ca3af" : BAR_FILL}
              stroke={BRAND}
              strokeWidth={0.5}
            />
          );
        })}

        {/* Linea acumulada + puntos */}
        <polyline points={cumPoints} fill="none" stroke={LINE_COLOR} strokeWidth={2} />
        {bars.map((b, i) => (
          <circle
            key={`pt${i}`}
            cx={xCenter(i)}
            cy={yCount((b.cumPercent / 100) * total)}
            r={3.5}
            fill={LINE_COLOR}
          />
        ))}

        {/* Eje X base */}
        <line
          x1={marginLeft}
          y1={marginTop + plotH}
          x2={W - marginRight}
          y2={marginTop + plotH}
          stroke={AXIS}
        />

        {/* 4 niveles de etiquetas bajo el eje X */}
        {(() => {
          const rows = [
            { title: "Category", get: (i: number) => bars[i].category },
            { title: countTitle, get: (i: number) => String(Math.round(bars[i].count)) },
            { title: "Percent", get: (i: number) => bars[i].percent.toFixed(1) },
            { title: "Cum %", get: (i: number) => bars[i].cumPercent.toFixed(1) },
          ];
          const rowH = 24;
          const y0 = marginTop + plotH + 16;
          return (
            <>
              {rows.map((row, r) => (
                <g key={`row${r}`}>
                  {/* Titulo de la fila (a la izquierda) */}
                  <text
                    x={marginLeft - 8}
                    y={y0 + r * rowH}
                    textAnchor="end"
                    fontSize={10}
                    fontWeight={700}
                    fill={TEXT}
                  >
                    {row.title}
                  </text>
                  {/* Valores por categoria */}
                  {bars.map((_, i) => (
                    <text
                      key={`c${r}-${i}`}
                      x={xCenter(i)}
                      y={y0 + r * rowH}
                      textAnchor="middle"
                      fontSize={9}
                      fill={TEXT}
                    >
                      {row.get(i)}
                    </text>
                  ))}
                </g>
              ))}
            </>
          );
        })()}
      </svg>

      {bars.length === 0 && (
        <div className="text-sm text-gray-400">
          Select a category column and a count column, then Run.
        </div>
      )}
    </div>
  );
}

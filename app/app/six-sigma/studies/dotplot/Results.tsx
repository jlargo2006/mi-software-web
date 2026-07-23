// app/app/six-sigma/studies/dotplot/Results.tsx
"use client";
import React from "react";
import type { Data } from "plotly.js";
import type { ColumnSnapshot } from "../types";
import type { DotplotParams, DotplotResult } from "./types";
import ResultChart from "../../components/ResultChart";
import ReportLayout from "../../components/ReportLayout";

const PALETTE = [
  "#00674d", "#c0392b", "#2980b9", "#8e44ad", "#d35400",
  "#16a085", "#2c3e50", "#f39c12", "#7f8c8d", "#27ae60",
];

export default function DotplotResults({
  result,
}: {
  data: ColumnSnapshot;
  params: DotplotParams;
  result: DotplotResult;
}) {
  const r = result;

  if (!r || r.panels.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Add one or more numeric columns to see the dotplot.
      </div>
    );
  }

  const colorOf = (series: string) =>
    PALETTE[r.seriesNames.indexOf(series) % PALETTE.length] || PALETTE[0];

  const panelTraces = (panel: DotplotResult["panels"][number]): Data[] => {
    // Una traza por serie (para leyenda y color)
    const bySeries = new Map<string, { x: number[]; y: number[] }>();
    for (const p of panel.points) {
      if (!bySeries.has(p.series)) bySeries.set(p.series, { x: [], y: [] });
      const s = bySeries.get(p.series)!;
      s.x.push(p.x);
      s.y.push(p.y);
    }
    return Array.from(bySeries.entries()).map(([series, xy]) => ({
      type: "scatter",
      mode: "markers",
      x: xy.x,
      y: xy.y,
      name: series,
      marker: { color: colorOf(series), size: 8, symbol: "circle" },
      showlegend: r.showLegend,
      legendgroup: series,
    }));
  };

  return (
    <div className="space-y-4">
      <ReportLayout
        template="chart-text"
        center={
          <div className="flex flex-col items-center gap-3">
            {r.panels.map((panel, i) => {
              // Altura dinámica: cada punto ~14px, con mínimo y margen para título/eje.
              const PX_PER_DOT = 14;
              const chrome = (i === 0 ? 40 : 10) + 30; // título + eje X
              const plotH = Math.max(1, panel.maxStack) * PX_PER_DOT;
              const panelH = Math.max(150, plotH + chrome);
              return (
                <div
                  key={`${panel.label}-${i}`}
                  className="border border-gray-200 rounded"
                  style={{ width: "75%", height: panelH }}
                >
                  <ResultChart
                    data={panelTraces(panel)}
                    layout={{
                      autosize: true,
                      title: i === 0 ? { text: r.title } : undefined,
                      margin: { t: i === 0 ? 40 : 10, b: 30, l: 90, r: 20 },
                      xaxis: {
                        title:
                          i === r.panels.length - 1
                            ? { text: r.xTitle }
                            : undefined,
                        range: [r.xStart, r.xEnd],
                        zeroline: false,
                      },
                      yaxis: {
                        title: panel.label ? { text: panel.label } : undefined,
                        showticklabels: false,
                        zeroline: false,
                        range: [0, Math.max(1, panel.maxStack) + 1],
                      },
                      showlegend: r.showLegend && i === 0,
                      legend: { orientation: "v", x: 1.02, y: 1 },
                    }}
                  />
                </div>
              );
            })}
          </div>
        }
      />
    </div>
  );
}

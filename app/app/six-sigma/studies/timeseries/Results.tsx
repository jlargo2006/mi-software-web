// app/app/six-sigma/studies/timeseries/Results.tsx
"use client";
import React from "react";
import type { Data } from "plotly.js";
import type { ColumnSnapshot } from "../types";
import type { TimeSeriesParams, TimeSeriesResult } from "./types";
import ResultChart from "../../components/ResultChart";
import ReportLayout from "../../components/ReportLayout";

const PALETTE = [
  "#00674d", "#c0392b", "#2980b9", "#8e44ad", "#d35400",
  "#16a085", "#2c3e50", "#f39c12", "#7f8c8d", "#27ae60",
];

export default function TimeSeriesResults({
  result,
}: {
  data: ColumnSnapshot;
  params: TimeSeriesParams;
  result: TimeSeriesResult;
}) {
  const r = result;

  if (!r || r.lines.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Add one or more numeric columns to see the time series plot.
      </div>
    );
  }

  const multi = r.lines.length > 1;

  const traces: Data[] = [];
  r.lines.forEach((line, i) => {
    const color = PALETTE[i % PALETTE.length];
    traces.push({
      type: "scatter",
      mode: "lines+markers",
      x: line.x,
      y: line.y,
      name: line.name,
      marker: { color, size: 6 },
      line: { color },
      showlegend: multi,
      legendgroup: line.name,
    });
    if (line.smoothX && line.smoothY) {
      traces.push({
        type: "scatter",
        mode: "lines",
        // el smoother usa la posición secuencial; alineamos con line.x
        x: line.smoothX.map((p) => line.x[p] ?? p),
        y: line.smoothY,
        name: `${line.name} (smooth)`,
        line: { color, width: 2, dash: "solid", shape: "spline" },
        marker: { color },
        showlegend: false,
        legendgroup: line.name,
        opacity: 0.7,
      });
    }
  });

  return (
    <div className="space-y-4">
      <ReportLayout
        template="chart-text"
        center={
          <div
            className="border border-gray-200 rounded mx-auto"
            style={{ width: "90%", height: 460 }}
          >
            <ResultChart
              data={traces}
              layout={{
                autosize: true,
                title: { text: r.title },
                margin: { t: 50, b: 60, l: 70, r: 30 },
                xaxis: {
                  title: { text: r.xTitle },
                  type: r.xIsCategoryTime ? "category" : "linear",
                  zeroline: false,
                },
                yaxis: {
                  title: { text: r.yTitle },
                  zeroline: false,
                },
                showlegend: multi,
                legend: { orientation: "v", x: 1.02, y: 1 },
              }}
            />
          </div>
        }
      />
    </div>
  );
}

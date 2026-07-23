// app/app/six-sigma/studies/histogram/Results.tsx
"use client";
import React from "react";
import type { Data } from "plotly.js";
import type { ColumnSnapshot } from "../types";
import type { HistogramParams, HistogramResult } from "./types";
import ResultChart from "../../components/ResultChart";
import ReportLayout from "../../components/ReportLayout";

const PALETTE = [
  "#00674d", "#c0392b", "#2980b9", "#8e44ad", "#d35400",
  "#16a085", "#c0392b", "#2c3e50", "#f39c12", "#7f8c8d",
];

export default function HistogramResults({
  result,
}: {
  data: ColumnSnapshot;
  params: HistogramParams;
  result: HistogramResult;
}) {
  const r = result;

  if (!r || r.series.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Add one or more numeric columns to see the histogram.
      </div>
    );
  }

  // Construye los traces de una serie
  const seriesTraces = (s: HistogramResult["series"][number], color: string): Data[] => {
    const traces: Data[] = [
      {
        type: "histogram",
        x: s.values,
        marker: { color, line: { color: "white", width: 1 } },
        xbins: { start: s.bins.start, end: s.bins.end, size: s.bins.size },
        opacity: r.groups ? 0.6 : 1,
        name: s.name,
      },
    ];
    if (r.fit && s.curveX.length > 0) {
      traces.push({
        type: "scatter",
        mode: "lines",
        x: s.curveX,
        y: s.curveY,
        line: { color, width: 2 },
        name: `${s.name} fit`,
      });
    }
    return traces;
  };

  // MODO GROUPS: un único panel con todas las columnas superpuestas
  if (r.groups) {
    const data: Data[] = r.series.flatMap((s, i) =>
      seriesTraces(s, PALETTE[i % PALETTE.length])
    );
    const title =
      r.series.length === 1
        ? `Histogram of ${r.series[0].name}`
        : `Histogram of ${r.series.map((s) => s.name).join(", ")}`;

    return (
      <div className="space-y-4">
        <ReportLayout
          template="chart-text"
          center={
            <div className="flex justify-center">
              <div
                className="border border-gray-200 rounded"
                style={{ width: "70%", aspectRatio: "4 / 3" }}
              >
                <ResultChart
                  data={data}
                  layout={{
                    autosize: true,
                    barmode: "overlay",
                    title: { text: title },
                    xaxis: { title: { text: "Data" } },
                    yaxis: { title: { text: "Frequency" } },
                    showlegend: true,
                    legend: { orientation: "v", x: 1.02, y: 1 },
                  }}
                />
              </div>
            </div>
          }
        />
      </div>
    );
  }

  // MODO SIMPLE: un panel por columna (small multiples)
  return (
    <div className="space-y-4">
      <ReportLayout
        template="chart-text"
        center={
          <div className="flex flex-col items-center gap-4">
            {r.series.map((s, i) => (
              <div
                key={s.name}
                className="border border-gray-200 rounded"
                style={{ width: "70%", aspectRatio: "4 / 3" }}
              >
                <ResultChart
                  data={seriesTraces(s, PALETTE[i % PALETTE.length])}
                  layout={{
                    autosize: true,
                    title: { text: `Histogram of ${s.name}` },
                    xaxis: { title: { text: s.name } },
                    yaxis: { title: { text: "Frequency" } },
                    showlegend: false,
                    bargap: 0.02,
                  }}
                />
              </div>
            ))}
          </div>
        }
      />
    </div>
  );
}

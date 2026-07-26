// app/app/six-sigma/studies/boxplot/Results.tsx
"use client";
import React from "react";
import type { Data } from "plotly.js";
import type { ColumnSnapshot } from "../types";
import type { BoxplotParams, BoxplotResult } from "./types";
import ResultChart from "../../components/ResultChart";
import ReportLayout from "../../components/ReportLayout";

const PALETTE = [
  "#00674d", "#c0392b", "#2980b9", "#8e44ad", "#d35400",
  "#16a085", "#2c3e50", "#f39c12", "#7f8c8d", "#27ae60",
];

export default function BoxplotResults({
  result,
}: {
  data: ColumnSnapshot;
  params: BoxplotParams;
  result: BoxplotResult;
}) {
  const r = result;

  if (!r || r.panels.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Add one or more numeric columns to see the boxplot.
      </div>
    );
  }

  const horizontal = r.orientation === "horizontal";

  const panelTraces = (panel: BoxplotResult["panels"][number]): Data[] =>
    panel.boxes.map((b, i) => {
      const color = PALETTE[i % PALETTE.length];
      const catArray = b.values.map(() => b.label);
      return {
        type: "box",
        name: b.label,
        // eje de valores + eje categórico según orientación
        ...(horizontal
          ? { x: b.values, y: catArray, orientation: "h" }
          : { y: b.values, x: catArray, orientation: "v" }),
        boxpoints: "outliers",   // muestra outliers (regla 1.5·IQR)
        boxmean: true,           // símbolo de la media además de la mediana
        marker: { color, outliercolor: color, size: 5 },
        line: { color },
        fillcolor: color + "22",
//        whiskerwidth: 0.6,
        showlegend: false,
      } as Data;
    });

  // whiskers Tukey 1.5·IQR es el comportamiento por defecto de Plotly box.

  const valueAxis = {
    title: { text: r.valueTitle },
    zeroline: false,
  };
  const catAxis = {
    title: r.catTitle ? { text: r.catTitle } : undefined,
    type: "category" as const,
  };

  return (
    <div className="space-y-4">
      <ReportLayout
        template="chart-text"
        center={
          <div className="flex flex-col items-center gap-4">
            {r.panels.map((panel, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded"
                style={{ width: "80%", height: 420 }}
              >
                <ResultChart
                  data={panelTraces(panel)}
                  layout={{
                    autosize: true,
                    title: { text: panel.title ?? r.title },
                    margin: { t: 50, b: 60, l: 70, r: 30 },
                    xaxis: horizontal ? valueAxis : catAxis,
                    yaxis: horizontal ? catAxis : valueAxis,
                    showlegend: false,
//                    boxgap: 0.3,
//                    boxgroupgap: 0.3,
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

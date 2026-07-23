// studies/normality/Results.tsx
"use client";
import React from "react";
import type { Data } from "plotly.js";
import type { ColumnSnapshot } from "../types";
import type { NormalityParams, NormalityResult } from "./types";
// ⚠️ AJUSTAR RUTAS: en el motor viejo estos vivían en components/ (import "./X")
import ResultChart from "../../components/ResultChart";
import ReportLayout from "../../components/ReportLayout";
import StatBlock, { fmt, StatSection } from "../../components/StatBlock";
import { normInv } from "../../lib/stats";

export default function NormalityResults({
  result,
}: {
  data: ColumnSnapshot;
  params: NormalityParams;
  result: NormalityResult;
}) {
  const pointsTrace: Data = {
    x: result.pointsX,
    y: result.pointsY,
    type: "scatter",
    mode: "markers",
    name: "Data",
    marker: { color: "#00674d", size: 6 },
  };

  const lineTrace: Data = {
    x: result.lineX,
    y: result.lineY,
    type: "scatter",
    mode: "lines",
    name: "Normal fit",
    line: { color: "#dc2626", width: 2 },
  };

  const rightSections: StatSection[] = [
    {
      title: "Statistics",
      rows: [
        { label: "Mean", value: fmt(result.mean, 4) },
        { label: "StDev", value: fmt(result.std, 4) },
        { label: "N", value: String(result.n) },
        { label: "AD", value: fmt(result.adStatistic, 4) },
        { label: "P-Value", value: fmt(result.pValue, 4) },
        {
          label: "Normal?",
          value: result.isNormal ? "Yes (p>0.05)" : "No (p\u22640.05)",
        },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <ReportLayout
        template="chart-text"
        right={<StatBlock sections={rightSections} />}
        center={
          <div className="flex justify-center">
            <div
              className="border border-gray-200 rounded"
              style={{ width: "70%", aspectRatio: "4 / 3" }}
            >
              <ResultChart
                data={[pointsTrace, lineTrace]}
                layout={{
                  autosize: true,
                  title: { text: `Probability Plot - ${result.colName}` },
                  xaxis: { title: { text: result.colName }, range: result.xRange },
                  yaxis: {
                    title: { text: "Percent" },
                    tickvals: result.tickVals,
                    ticktext: result.tickText,
                    range: [normInv(0.001), normInv(0.999)],
                  },
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

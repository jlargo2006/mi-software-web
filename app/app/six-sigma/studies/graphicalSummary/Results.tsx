// studies/graphicalSummary/Results.tsx
"use client";
import React from "react";
import type { Data } from "plotly.js";
import type { ColumnSnapshot } from "../types";
import type { GraphicalSummaryParams, GraphicalSummaryResult } from "./types";
import ResultChart from "../../components/ResultChart";
import ReportLayout from "../../components/ReportLayout";
import StatBlock, { fmt, StatSection } from "../../components/StatBlock";
import { normPdf } from "../../lib/distributions";

const BRAND = "#00674d";

export default function GraphicalSummaryResults({
  data,
  params,
  result,
}: {
  data: ColumnSnapshot;
  params: GraphicalSummaryParams;
  result: GraphicalSummaryResult;
}) {
  const r = result;
  if (!r || !Number.isFinite(r.mean)) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Select a numeric column to see the graphical summary.
      </div>
    );
  }

  const name = params.col!;
  const values = data[name].values
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v));

  // ---- histograma: bins tipo Minitab (√n) ----
  const nbins = Math.max(5, Math.round(Math.sqrt(r.n)));
  const binWidth = (r.max - r.min) / nbins;

  // curva normal superpuesta (escalada a cuentas por bin)
  const curveX: number[] = [];
  const curveY: number[] = [];
  const steps = 200;
  for (let i = 0; i <= steps; i++) {
    const xv = r.min + ((r.max - r.min) * i) / steps;
    const z = (xv - r.mean) / r.stDev;
    curveX.push(xv);
    curveY.push((normPdf(z) / r.stDev) * r.n * binWidth);
  }

  const histogram: Data[] = [
    {
      type: "histogram",
      x: values,
      marker: { color: BRAND, line: { color: "white", width: 1 } },
      xbins: { start: r.min, end: r.max, size: binWidth },
      name: "Frequency",
    },
    {
      type: "scatter",
      mode: "lines",
      x: curveX,
      y: curveY,
      line: { color: "#c0392b", width: 2 },
      name: "Normal fit",
    },
  ];

  const boxplot: Data[] = [
    {
      type: "box",
      x: values,
      orientation: "h",
      boxpoints: false,
      marker: { color: BRAND },
      line: { color: BRAND },
      fillcolor: "rgba(0,103,77,0.15)",
      name: "",
    },
  ];

  const ciData: Data[] = [
    {
      type: "scatter",
      mode: "lines+markers",
      x: [r.ciMean[0], r.ciMean[1]],
      y: [1, 1],
      line: { color: BRAND, width: 2 },
      marker: { color: BRAND, size: 1 },
      name: "Mean CI",
    },
    {
      type: "scatter",
      mode: "markers",
      x: [r.mean],
      y: [1],
      marker: { color: BRAND, size: 9, symbol: "circle" },
      name: "Mean",
    },
    {
      type: "scatter",
      mode: "lines+markers",
      x: [r.ciMedian[0], r.ciMedian[1]],
      y: [0, 0],
      line: { color: "#c0392b", width: 2 },
      marker: { color: "#c0392b", size: 1 },
      name: "Median CI",
    },
    {
      type: "scatter",
      mode: "markers",
      x: [r.median],
      y: [0],
      marker: { color: "#c0392b", size: 9, symbol: "circle" },
      name: "Median",
    },
    ...[
      { x: r.ciMean[0], y: 1, c: BRAND },
      { x: r.ciMean[1], y: 1, c: BRAND },
      { x: r.ciMedian[0], y: 0, c: "#c0392b" },
      { x: r.ciMedian[1], y: 0, c: "#c0392b" },
    ].map(
      (t): Data => ({
        type: "scatter",
        mode: "lines",
        x: [t.x, t.x],
        y: [t.y - 0.12, t.y + 0.12],
        line: { color: t.c, width: 2 },
        showlegend: false,
      })
    ),
  ];

  // ---- panel de datos (API real de StatBlock: sections) ----
  const sections: StatSection[] = [
    {
      title: "Anderson-Darling Normality Test",
      rows: [
        { label: "A-Squared", value: fmt(r.aSquared, 2) },
        { label: "P-Value", value: fmt(r.pValue, 3) },
        { label: "Mean", value: fmt(r.mean, 3) },
        { label: "StDev", value: fmt(r.stDev, 3) },
        { label: "Variance", value: fmt(r.variance, 3) },
        { label: "Skewness", value: fmt(r.skewness, 6) },
        { label: "Kurtosis", value: fmt(r.kurtosis, 6) },
        { label: "N", value: String(r.n) },
        { label: "Minimum", value: fmt(r.min, 3) },
        { label: "1st Quartile", value: fmt(r.q1, 3) },
        { label: "Median", value: fmt(r.median, 3) },
        { label: "3rd Quartile", value: fmt(r.q3, 3) },
        { label: "Maximum", value: fmt(r.max, 3) },
      ],
    },
    {
      title: `${fmt(r.confidence, 1)}% Confidence Interval for Mean`,
      rows: [
        { label: "Lower", value: fmt(r.ciMean[0], 3) },
        { label: "Upper", value: fmt(r.ciMean[1], 3) },
      ],
    },
    {
      title: `${fmt(r.confidence, 1)}% Confidence Interval for Median`,
      rows: [
        { label: "Lower", value: fmt(r.ciMedian[0], 3) },
        { label: "Upper", value: fmt(r.ciMedian[1], 3) },
      ],
    },
    {
      title: `${fmt(r.confidence, 1)}% Confidence Interval for StDev`,
      rows: [
        { label: "Lower", value: fmt(r.ciStDev[0], 3) },
        { label: "Upper", value: fmt(r.ciStDev[1], 3) },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <ReportLayout
        template="chart-text"
        right={<StatBlock sections={sections} />}
        center={
          <div className="flex justify-center">
            <div className="flex flex-col gap-4" style={{ width: "50%" }}>
              {/* Histograma + curva normal */}
              <div
                className="border border-gray-200 rounded"
                style={{ width: "100%", aspectRatio: "4 / 3" }}
              >
                <ResultChart
                  data={histogram}
                  layout={{
                    autosize: true,
                    title: { text: `Summary Report for ${r.colName}` },
                    showlegend: false,
                    margin: { l: 40, r: 10, t: 40, b: 30 },
                    bargap: 0.02,
                  }}
                />
              </div>

              {/* Boxplot horizontal */}
              <div
                className="border border-gray-200 rounded"
                style={{ width: "100%", aspectRatio: "6 / 2" }}
              >
                <ResultChart
                  data={boxplot}
                  layout={{
                    autosize: true,
                    showlegend: false,
                    margin: { l: 40, r: 10, t: 10, b: 30 },
                    yaxis: { showticklabels: false },
                  }}
                />
              </div>

              {/* Intervalos de confianza */}
              <div
                className="border border-gray-200 rounded"
                style={{ width: "100%", aspectRatio: "6 / 2" }}
              >
                <ResultChart
                  data={ciData}
                  layout={{
                    autosize: true,
                    title: { text: `${fmt(r.confidence, 1)}% Confidence Intervals` },
                    showlegend: false,
                    margin: { l: 60, r: 10, t: 30, b: 30 },
                    yaxis: {
                      tickmode: "array",
                      tickvals: [0, 1],
                      ticktext: ["Median", "Mean"],
                      range: [-0.5, 1.5],
                    },
                  }}
                />
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}

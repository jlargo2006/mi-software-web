// studies/capability/Results.tsx
"use client";
import React from "react";
import type { Data } from "plotly.js";
import type { ColumnSnapshot } from "../types";
import type { CapabilityParams, CapabilityResult } from "./types";
// ⚠️ AJUSTAR RUTAS igual que en Normality
import ResultChart from "../../components/ResultChart";
import ReportLayout from "../../components/ReportLayout";
import StatBlock, { fmt, fmtPPM, StatSection } from "../../components/StatBlock";

export default function CapabilityResults({
  result,
}: {
  data: ColumnSnapshot;
  params: CapabilityParams;
  result: CapabilityResult;
}) {
  const { lsl, usl, target, colName, nums, xRange } = result;
  const [lo, hi] = xRange;

  const STEPS = 200;
  const gaussian = (s: number): { x: number[]; y: number[] } => {
    const x: number[] = [];
    const y: number[] = [];
    if (s <= 0) return { x, y };
    const coef = 1 / (s * Math.sqrt(2 * Math.PI));
    for (let i = 0; i <= STEPS; i++) {
      const xi = lo + ((hi - lo) * i) / STEPS;
      x.push(xi);
      y.push(coef * Math.exp(-((xi - result.mean) ** 2) / (2 * s * s)));
    }
    return { x, y };
  };

  const overall = gaussian(result.stdOverall);
  const within = gaussian(result.stdWithin);

  const histogram: Data = {
    x: nums,
    type: "histogram",
    histnorm: "probability density",
    marker: { color: "#9fd5c4", line: { color: "#000000", width: 1 } },
    name: colName,
    opacity: 0.85,
  };
  const overallCurve: Data = {
    x: overall.x,
    y: overall.y,
    type: "scatter",
    mode: "lines",
    name: "Overall",
    line: { color: "#00674d", width: 2 },
  };
  const withinCurve: Data = {
    x: within.x,
    y: within.y,
    type: "scatter",
    mode: "lines",
    name: "Within",
    line: { color: "#dc2626", width: 2, dash: "dash" },
  };

  const specLines = [
    lsl !== null && { x: lsl, color: "#111827", label: "LSL" },
    usl !== null && { x: usl, color: "#111827", label: "USL" },
    target !== null && { x: target, color: "#2563eb", label: "Target" },
  ].filter(Boolean) as { x: number; color: string; label: string }[];

  const leftSections: StatSection[] = [
    {
      title: "Process Data",
      rows: [
        { label: "LSL", value: fmt(result.lsl) },
        { label: "Target", value: fmt(result.target) },
        { label: "USL", value: fmt(result.usl) },
        { label: "Sample Mean", value: fmt(result.mean) },
        { label: "Sample N", value: String(result.n) },
        { label: "StDev(Overall)", value: fmt(result.stdOverall) },
        { label: "StDev(Within)", value: fmt(result.stdWithin) },
      ],
    },
    {
      title: "Observed Performance",
      rows: [
        { label: "PPM < LSL", value: fmtPPM(result.ppmObsLSL) },
        { label: "PPM > USL", value: fmtPPM(result.ppmObsUSL) },
        { label: "PPM Total", value: fmtPPM(result.ppmObsTotal) },
      ],
    },
    {
      title: "Exp. Overall Performance",
      rows: [
        { label: "PPM < LSL", value: fmtPPM(result.ppmExpOverallLSL) },
        { label: "PPM > USL", value: fmtPPM(result.ppmExpOverallUSL) },
        { label: "PPM Total", value: fmtPPM(result.ppmExpOverallTotal) },
      ],
    },
    {
      title: "Exp. Within Performance",
      rows: [
        { label: "PPM < LSL", value: fmtPPM(result.ppmExpWithinLSL) },
        { label: "PPM > USL", value: fmtPPM(result.ppmExpWithinUSL) },
        { label: "PPM Total", value: fmtPPM(result.ppmExpWithinTotal) },
      ],
    },
  ];

  const rightSections: StatSection[] = [
    {
      title: "Overall Capability",
      rows: [
        { label: "Z.Bench", value: fmt(result.zBenchOverall) },
        { label: "Z.LSL", value: fmt(result.zLSLOverall) },
        { label: "Z.USL", value: fmt(result.zUSLOverall) },
        { label: "Pp", value: fmt(result.pp, 2) },
        { label: "PPL", value: fmt(result.ppl, 2) },
        { label: "PPU", value: fmt(result.ppu, 2) },
        { label: "Ppk", value: fmt(result.ppk, 2) },
      ],
    },
    {
      title: "Potential (Within) Capability",
      rows: [
        { label: "Z.Bench", value: fmt(result.zBenchWithin) },
        { label: "Z.LSL", value: fmt(result.zLSLWithin) },
        { label: "Z.USL", value: fmt(result.zUSLWithin) },
        { label: "Cp", value: fmt(result.cp, 2) },
        { label: "CPL", value: fmt(result.cpl, 2) },
        { label: "CPU", value: fmt(result.cpu, 2) },
        { label: "Cpk", value: fmt(result.cpk, 2) },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <ReportLayout
        template="text-chart-text"
        left={<StatBlock sections={leftSections} />}
        right={<StatBlock sections={rightSections} />}
        center={
          <div className="flex justify-center">
            <div
              className="border border-gray-200 rounded"
              style={{ width: "70%", aspectRatio: "4 / 3" }}
            >
              <ResultChart
                data={[histogram, overallCurve, withinCurve]}
                layout={{
                  autosize: true,
                  title: { text: `Process Capability Report - ${colName}` },
                  xaxis: { title: { text: colName }, range: [lo, hi] },
                  yaxis: { title: { text: "Density" } },
                  showlegend: true,
                  legend: { orientation: "v", x: 1.02, y: 1 },
                  shapes: specLines.map((s) => ({
                    type: "line",
                    x0: s.x,
                    x1: s.x,
                    yref: "paper",
                    y0: 0,
                    y1: 1,
                    line: { color: s.color, width: 2, dash: "dot" },
                  })),
                  annotations: specLines.map((s) => ({
                    x: s.x,
                    yref: "paper",
                    y: 1.02,
                    text: s.label,
                    showarrow: false,
                    font: { color: s.color, size: 11 },
                  })),
                }}
              />
            </div>
          </div>
        }
      />
    </div>
  );
}

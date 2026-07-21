// studies/graphicalSummary/Results.tsx
"use client";
import React from "react";
import type { ColumnSnapshot } from "../types";
import type { GraphicalSummaryParams, GraphicalSummaryResult } from "./types";
import ReportLayout from "../../components/ReportLayout";
import ResultChart from "../../components/ResultChart";
import StatBlock from "../../components/StatBlock";
import { normPdf } from "../../lib/distributions";

const BRAND = "#00674d";

function fmt(x: number, d = 3): string {
  if (!Number.isFinite(x)) return "—";
  return x.toLocaleString("es-ES", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

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

  // valores crudos para el histograma / boxplot
  const name = params.col!;
  const values = data[name].values
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v));

  // ---- histograma: número de bins tipo Minitab (√n redondeado) ----
  const nbins = Math.max(5, Math.round(Math.sqrt(r.n)));
  const binWidth = (r.max - r.min) / nbins;

  // curva normal superpuesta (escalada al área del histograma)
  const curveX: number[] = [];
  const curveY: number[] = [];
  const steps = 200;
  for (let i = 0; i <= steps; i++) {
    const xv = r.min + ((r.max - r.min) * i) / steps;
    curveX.push(xv);
    // densidad * n * binWidth  => cuentas esperadas por bin
    const z = (xv - r.mean) / r.stDev;
    curveY.push((normPdf(z) / r.stDev) * r.n * binWidth);
  }

  const histogram = (
    <ResultChart
      data={[
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
      ]}
      layout={{
        showlegend: false,
        margin: { l: 40, r: 10, t: 10, b: 30 },
        bargap: 0.02,
      }}
    />
  );

  const boxplot = (
    <ResultChart
      data={[
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
      ]}
      layout={{
        showlegend: false,
        margin: { l: 40, r: 10, t: 10, b: 30 },
        yaxis: { showticklabels: false },
      }}
    />
  );

  // ---- gráfica de intervalos de confianza (mean y median) ----
  const ciChart = (
    <ResultChart
      data={[
        // segmento media
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
        // segmento mediana
        {
          type: "scatter",
          mode: "lines+markers",
          x: [r.ciMedian[0], r.ciMedian[1]],
          y: [0],
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
        // topes verticales (inicio/fin) como líneas cortas
        ...[
          { x: r.ciMean[0], y: 1, c: BRAND },
          { x: r.ciMean[1], y: 1, c: BRAND },
          { x: r.ciMedian[0], y: 0, c: "#c0392b" },
          { x: r.ciMedian[1], y: 0, c: "#c0392b" },
        ].map((t) => ({
          type: "scatter" as const,
          mode: "lines" as const,
          x: [t.x, t.x],
          y: [t.y - 0.12, t.y + 0.12],
          line: { color: t.c, width: 2 },
          showlegend: false,
        })),
      ]}
      layout={{
        showlegend: false,
        margin: { l: 60, r: 10, t: 10, b: 30 },
        yaxis: {
          tickmode: "array",
          tickvals: [0, 1],
          ticktext: ["Median", "Mean"],
          range: [-0.5, 1.5],
        },
      }}
    />
  );

  // ---- panel de datos (4 bloques) ----
  const panel = (
    <div className="space-y-4 text-sm">
      <StatBlock title="Anderson-Darling Normality Test">
        <Row k="A-Squared" v={fmt(r.aSquared, 2)} />
        <Row k="P-Value" v={fmt(r.pValue, 3)} />
        <Row k="Mean" v={fmt(r.mean)} />
        <Row k="StDev" v={fmt(r.stDev)} />
        <Row k="Variance" v={fmt(r.variance)} />
        <Row k="Skewness" v={fmt(r.skewness, 6)} />
        <Row k="Kurtosis" v={fmt(r.kurtosis, 6)} />
        <Row k="N" v={String(r.n)} />
        <Row k="Minimum" v={fmt(r.min)} />
        <Row k="1st Quartile" v={fmt(r.q1)} />
        <Row k="Median" v={fmt(r.median)} />
        <Row k="3rd Quartile" v={fmt(r.q3)} />
        <Row k="Maximum" v={fmt(r.max)} />
      </StatBlock>

      <StatBlock title={`${fmt(r.confidence, 1)}% Confidence Interval for Mean`}>
        <Row k="" v={`${fmt(r.ciMean[0])}   ${fmt(r.ciMean[1])}`} />
      </StatBlock>

      <StatBlock title={`${fmt(r.confidence, 1)}% Confidence Interval for Median`}>
        <Row k="" v={`${fmt(r.ciMedian[0])}   ${fmt(r.ciMedian[1])}`} />
      </StatBlock>

      <StatBlock title={`${fmt(r.confidence, 1)}% Confidence Interval for StDev`}>
        <Row k="" v={`${fmt(r.ciStDev[0])}   ${fmt(r.ciStDev[1])}`} />
      </StatBlock>
    </div>
  );

  return (
    <ReportLayout
      title={`Summary Report for ${r.colName}`}
      charts={[histogram, boxplot, ciChart]}
      panel={panel}
    />
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-600">{k}</span>
      <span className="tabular-nums">{v}</span>
    </div>
  );
}

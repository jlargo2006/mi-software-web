// app/app/six-sigma/studies/improve/scatterplot/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ReportLayout from "../../../components/ReportLayout";
import ResultChart from "../../../components/ResultChart";
import {
  KIND_HAS_CONNECT,
  KIND_HAS_GROUPS,
  KIND_HAS_REGRESSION,
  type ImpScatterParams,
  type ImpScatterResult,
  type ScatterFit,
} from "./types";

/** Paleta de grupos. El primer color es el corporativo. */
const PALETTE = [
  "#00674d",
  "#b91c1c",
  "#1d4ed8",
  "#8c6d3f",
  "#7c3aed",
  "#0e7490",
  "#c2410c",
  "#4d7c0f",
];
const SYMBOLS = ["circle", "square", "diamond", "triangle-up", "x", "star"];

/** Formato con coma decimal, sin ceros de relleno. */
const f = (v: number, dec = 4): string => {
  if (!Number.isFinite(v)) return "\u2014";
  const s = v.toFixed(dec).replace(/0+$/, "").replace(/\.$/, "");
  return s.replace(".", ",");
};

const eqText = (fit: ScatterFit, yTitle: string, xTitle: string): string => {
  const sign = fit.b1 < 0 ? "\u2212" : "+";
  return `${yTitle} = ${f(fit.b0, 2)} ${sign} ${f(Math.abs(fit.b1), 4)} ${xTitle}`;
};

export default function ImpScatterResults({
  result,
  params,
}: {
  result: ImpScatterResult;
  params: ImpScatterParams;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ??
          "Selecciona las variables Y y X para generar el gr\u00e1fico."}
      </div>
    );
  }

  const r = result;
  const grouped = KIND_HAS_GROUPS[r.kind];
  const withReg = KIND_HAS_REGRESSION[r.kind];
  const withConnect = KIND_HAS_CONNECT[r.kind];

  const traces: Data[] = [];

  r.series.forEach((s, i) => {
    const color = PALETTE[i % PALETTE.length];
    traces.push({
      type: "scatter",
      mode: withConnect ? "lines+markers" : "markers",
      x: s.x,
      y: s.y,
      name: grouped ? s.label : r.yTitle,
      marker: {
        color,
        size: 8,
        symbol: SYMBOLS[i % SYMBOLS.length],
        line: { width: 1, color },
      },
      line: withConnect ? { color, width: 1.5 } : undefined,
      showlegend: grouped,
      hovertemplate: `${r.xTitle}: %{x}<br>${r.yTitle}: %{y}<extra>${
        grouped ? s.label : ""
      }</extra>`,
    } as unknown as Data);

    // La recta se dibuja solo sobre el rango observado de la serie: no se
    // extrapola fuera de los datos.
    if (withReg && s.fit) {
      const { b0, b1, xMin, xMax } = s.fit;
      traces.push({
        type: "scatter",
        mode: "lines",
        x: [xMin, xMax],
        y: [b0 + b1 * xMin, b0 + b1 * xMax],
        line: { color, width: 2 },
        name: grouped ? `${s.label} fit` : "Fitted line",
        showlegend: false,
        hoverinfo: "skip",
      } as unknown as Data);
    }

    // El suavizador se superpone a cualquier variante. Se distingue de la
    // recta por el trazo discontinuo y el grosor.
    if (s.smooth) {
      traces.push({
        type: "scatter",
        mode: "lines",
        x: s.smooth.x,
        y: s.smooth.y,
        line: {
          color,
          width: 2.5,
          dash: "dot",
          shape: "spline",
          smoothing: 0.6,
        },
        name: grouped ? `${s.label} smooth` : "Lowess",
        showlegend: false,
        hoverinfo: "skip",
      } as unknown as Data);
    }
  });

  const layout: Partial<Layout> = {
    margin: { l: 70, r: 30, t: 20, b: 55 },
    xaxis: { title: { text: r.xTitle }, zeroline: false },
    yaxis: { title: { text: r.yTitle }, zeroline: false },
    hovermode: "closest",
    legend: grouped
      ? { orientation: "v", x: 1.02, y: 1, font: { size: 11 } }
      : undefined,
    showlegend: grouped,
  };

  // Pie: ecuacion por grupo cuando cada serie tiene su recta, global si no.
  const fitLines: { label: string; fit: ScatterFit }[] = [];
  if (params.showEquation) {
    if (withReg && grouped) {
      r.series.forEach((s) => {
        if (s.fit) fitLines.push({ label: s.label, fit: s.fit });
      });
    } else if (r.overallFit) {
      fitLines.push({ label: "", fit: r.overallFit });
    }
  }

  return (
    <ReportLayout
      template="chart-text"
      center={
        <div className="w-full space-y-4">
          <h3 className="text-center text-sm font-semibold text-gray-800">
            {r.title}
          </h3>

          <div
            className="border border-gray-200 rounded"
            style={{ height: 420 }}
          >
            <ResultChart data={traces} layout={{ autosize: true, ...layout }} />
          </div>

          {fitLines.length > 0 && (
            <section className="space-y-1 text-sm">
              <h4 className="font-semibold text-gray-800">
                {withReg ? "Fitted Line" : "Least-Squares Summary"}
              </h4>
              {fitLines.map(({ label, fit }) => (
                <p key={label || "all"} className="font-mono text-xs">
                  {label && <span className="text-gray-500">{label}: </span>}
                  {eqText(fit, r.yTitle, r.xTitle)}
                  {"\u00a0\u00b7\u00a0"}R{"\u00b2"} = {f(fit.r2 * 100, 1)}%
                  {"\u00a0\u00b7\u00a0"}r = {f(fit.r, 4)}
                  {"\u00a0\u00b7\u00a0"}n = {fit.n}
                </p>
              ))}
              {!withReg && (
                <p className="text-xs italic text-gray-600">
                  Shown for reference: this plot type draws no fitted line.
                </p>
              )}
            </section>
          )}

          <section className="space-y-1 text-xs text-gray-600">
            <p>
              {r.n} point(s) plotted
              {grouped ? ` in ${r.series.length} group(s)` : ""}.
            </p>
            {r.lowess && (
              <p>
                Lowess smoother: degree of smoothing {f(r.lowess.f, 2)} (
                {r.lowess.q} of {r.n} points per neighbourhood),{" "}
                {r.lowess.steps} step(s).
              </p>
            )}
            {r.lowess && r.series.some((s) => !s.smooth) && (
              <p className="text-amber-700">
                Some series have fewer than three points: no smoother drawn.
              </p>
            )}
            {r.nMissing > 0 && (
              <p className="text-amber-700">
                {r.nMissing} row(s) dropped: a value was missing or
                non-numeric.
              </p>
            )}
            {withReg && r.series.some((s) => !s.fit) && (
              <p className="text-amber-700">
                Some groups have too few points, or a constant X, for a fitted
                line.
              </p>
            )}
          </section>
        </div>
      }
    />
  );
}

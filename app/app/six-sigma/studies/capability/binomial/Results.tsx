// app/app/six-sigma/studies/capability/binomial/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ResultChart from "../../../components/ResultChart";
import type { CapBinomialResult } from "./types";

const fx = (v: number, dec = 4): string =>
  Number.isFinite(v) ? v.toFixed(dec).replace(".", ",") : "*";

const fInt = (v: number): string =>
  Number.isFinite(v) ? Math.round(v).toLocaleString("es-ES") : "*";

const BLUE = "#1d4ed8";
const RED = "#dc2626";
const GREEN = "#15803d";

const Panel = ({
  title,
  children,
  height = 300,
}: {
  title: string;
  children: React.ReactNode;
  height?: number;
}) => (
  <div>
    <h4 className="mb-1 text-sm font-semibold text-gray-800">{title}</h4>
    <div className="rounded border border-gray-200" style={{ height }}>
      {children}
    </div>
  </div>
);

export default function CapBinomialResults({
  result,
}: {
  result: CapBinomialResult;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Select the defectives column and the subgroup sizes."}
      </div>
    );
  }

  const r = result;
  const samples = r.points.map((p) => p.sample);
  const inControl = r.points.filter((p) => p.violations.length === 0);
  const flagged = r.points.filter((p) => p.violations.length > 0);

  const base: Partial<Layout> = {
    plot_bgcolor: "#ffffff",
    showlegend: false,
    hovermode: "closest",
    margin: { l: 55, r: 70, t: 10, b: 42 },
  };

  // --- 1 · P Chart ---------------------------------------------------------
  // Los limites van escalonados porque cada subgrupo tiene su propio tamano:
  // "hv" mantiene el valor hasta el punto siguiente, que es como se dibuja
  // una P Chart con n desigual.
  const pChart: Data[] = [
    {
      x: samples,
      y: r.points.map((p) => p.ucl),
      type: "scatter",
      mode: "lines",
      line: { color: RED, width: 1.2, shape: "hv" },
      hoverinfo: "skip",
    },
    {
      x: samples,
      y: r.points.map((p) => p.lcl),
      type: "scatter",
      mode: "lines",
      line: { color: RED, width: 1.2, shape: "hv" },
      hoverinfo: "skip",
    },
    {
      x: samples,
      y: r.points.map((p) => p.p),
      type: "scatter",
      mode: "lines+markers",
      line: { color: BLUE, width: 1.2 },
      marker: { color: BLUE, size: 6 },
      hovertemplate:
        "Sample %{x}<br>Proportion: %{y:.4f}<extra></extra>",
    },
  ] as unknown as Data[];

  if (flagged.length > 0) {
    pChart.push({
      x: flagged.map((p) => p.sample),
      y: flagged.map((p) => p.p),
      type: "scatter",
      mode: "markers+text",
      marker: { color: RED, size: 9, symbol: "square" },
      text: flagged.map((p) => p.violations.join(",")),
      textposition: "top center",
      textfont: { size: 9, color: RED },
      hovertemplate:
        "Sample %{x}<br>Proportion: %{y:.4f}<br>Test %{text}<extra></extra>",
    } as unknown as Data);
  }

  const pLayout: Partial<Layout> = {
    ...base,
    xaxis: { title: { text: "Sample" }, zeroline: false },
    yaxis: { title: { text: "Proportion" }, zeroline: false },
    shapes: [
      {
        type: "line",
        xref: "paper",
        x0: 0,
        x1: 1,
        y0: r.pBar,
        y1: r.pBar,
        line: { color: GREEN, width: 1.2 },
      },
    ],
    annotations: [
      { y: r.labelUcl, text: `UCL = ${fx(r.labelUcl, 4)}`, color: RED },
      { y: r.pBar, text: `${r.historicalP !== null ? "p" : "P\u0304"} = ${fx(r.pBar, 4)}`, color: GREEN },
      { y: r.labelLcl, text: `LCL = ${fx(r.labelLcl, 4)}`, color: RED },
    ].map((a) => ({
      xref: "paper" as const,
      x: 1,
      xanchor: "left" as const,
      y: a.y,
      yanchor: "middle" as const,
      text: a.text,
      showarrow: false,
      font: { size: 9, color: a.color },
    })),
  };

  // --- 2 · Rate of Defectives ---------------------------------------------
  // %Defectivo contra tamano de muestra. Detecta que la proporcion dependa
  // del tamano del subgrupo, que seria un problema de muestreo, no de proceso.
  const sizeGrid: number[] = [];
  const gLo = Math.max(1, r.minN - Math.max(2, (r.maxN - r.minN) * 0.1));
  const gHi = r.maxN + Math.max(2, (r.maxN - r.minN) * 0.1);
  for (let i = 0; i <= 60; i++) sizeGrid.push(gLo + ((gHi - gLo) * i) / 60);
  const bandUcl = sizeGrid.map(
    (n) => Math.min(1, r.pBar + 3 * Math.sqrt((r.pBar * (1 - r.pBar)) / n)) * 100
  );
  const bandLcl = sizeGrid.map(
    (n) => Math.max(0, r.pBar - 3 * Math.sqrt((r.pBar * (1 - r.pBar)) / n)) * 100
  );

  const rateChart: Data[] = [
    {
      x: sizeGrid,
      y: bandUcl,
      type: "scatter",
      mode: "lines",
      line: { color: RED, width: 1.2 },
      hoverinfo: "skip",
    },
    {
      x: sizeGrid,
      y: bandLcl,
      type: "scatter",
      mode: "lines",
      line: { color: RED, width: 1.2 },
      hoverinfo: "skip",
    },
    {
      x: inControl.map((p) => p.n),
      y: inControl.map((p) => p.p * 100),
      type: "scatter",
      mode: "markers",
      marker: { color: BLUE, size: 6 },
      hovertemplate:
        "n = %{x}<br>%Defective: %{y:.2f}<extra></extra>",
    },
  ] as unknown as Data[];

  if (flagged.length > 0) {
    rateChart.push({
      x: flagged.map((p) => p.n),
      y: flagged.map((p) => p.p * 100),
      type: "scatter",
      mode: "markers",
      marker: { color: RED, size: 8, symbol: "square" },
      hovertemplate: "n = %{x}<br>%Defective: %{y:.2f}<extra></extra>",
    } as unknown as Data);
  }

  const rateLayout: Partial<Layout> = {
    ...base,
    margin: { l: 55, r: 20, t: 10, b: 42 },
    xaxis: { title: { text: "Sample Size" }, zeroline: false },
    yaxis: { title: { text: "% Defective" }, zeroline: false },
    shapes: [
      {
        type: "line",
        xref: "paper",
        x0: 0,
        x1: 1,
        y0: r.pBar * 100,
        y1: r.pBar * 100,
        line: { color: GREEN, width: 1.2 },
      },
    ],
  };

  // --- 3 · Cumulative %Defective ------------------------------------------
  const cumChart: Data[] = [
    {
      x: r.cumulative.map((c) => c.sample),
      y: r.cumulative.map((c) => c.pct),
      type: "scatter",
      mode: "lines+markers",
      line: { color: BLUE, width: 1.2 },
      marker: { color: BLUE, size: 5 },
      hovertemplate:
        "Sample %{x}<br>Cumulative: %{y:.2f} %<extra></extra>",
    },
  ] as unknown as Data[];

  const cumLayout: Partial<Layout> = {
    ...base,
    xaxis: { title: { text: "Sample" }, zeroline: false },
    yaxis: { title: { text: "%Defective" }, zeroline: false },
    shapes: [
      {
        type: "line",
        xref: "paper",
        x0: 0,
        x1: 1,
        y0: r.pctDefective,
        y1: r.pctDefective,
        line: { color: GREEN, width: 1.2, dash: "dash" },
      },
      {
        type: "line",
        xref: "paper",
        x0: 0,
        x1: 1,
        y0: r.pctUpper,
        y1: r.pctUpper,
        line: { color: "#9ca3af", width: 1, dash: "dot" },
      },
      {
        type: "line",
        xref: "paper",
        x0: 0,
        x1: 1,
        y0: r.pctLower,
        y1: r.pctLower,
        line: { color: "#9ca3af", width: 1, dash: "dot" },
      },
    ],
  };

  // --- 4 · Histogram -------------------------------------------------------
  const histChart: Data[] = [
    {
      x: r.points.map((p) => p.p * 100),
      type: "histogram",
      marker: { color: "#93c5fd", line: { color: "#1e3a8a", width: 1 } },
      hovertemplate: "%Defective: %{x}<br>Frequency: %{y}<extra></extra>",
    },
  ] as unknown as Data[];

  const histLayout: Partial<Layout> = {
    ...base,
    margin: { l: 55, r: 20, t: 10, b: 42 },
    bargap: 0.02,
    xaxis: { title: { text: "%Defective" }, zeroline: false },
    yaxis: { title: { text: "Frequency" }, zeroline: false },
    shapes:
      r.target !== null
        ? [
            {
              type: "line",
              x0: r.target,
              x1: r.target,
              yref: "paper",
              y0: 0,
              y1: 1,
              line: { color: GREEN, width: 2, dash: "dash" },
            },
          ]
        : [],
    annotations:
      r.target !== null
        ? [
            {
              x: r.target,
              yref: "paper" as const,
              y: 1,
              yanchor: "bottom" as const,
              text: "Target",
              showarrow: false,
              font: { size: 10, color: GREEN },
            },
          ]
        : [],
  };

  // --- Summary stats -------------------------------------------------------
  const row = (l: string, v: string, strong = false) => (
    <tr key={l} className={strong ? "font-semibold" : ""}>
      <td className="py-0.5 pr-4 text-gray-600 whitespace-nowrap">{l}</td>
      <td className="py-0.5 text-right whitespace-nowrap">{v}</td>
    </tr>
  );

  return (
    <div className="w-full space-y-4">
      <h3 className="text-center text-sm font-semibold text-gray-800">
        Binomial Process Capability Report for {r.colName}
      </h3>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="P Chart">
          <ResultChart data={pChart} layout={{ autosize: true, ...pLayout }} />
        </Panel>
        <Panel title="Rate of Defectives">
          <ResultChart data={rateChart} layout={{ autosize: true, ...rateLayout }} />
        </Panel>
      </div>

      {/* Bloque de estadisticos, entre las dos filas de graficos */}
      <div className="flex justify-center">
        <div className="rounded border border-gray-200 px-6 py-3">
          <p className="mb-2 text-center text-xs font-semibold text-gray-700">
            Summary Stats
            <span className="ml-1 font-normal text-gray-500">
              ({fx(r.confidence, 1)}% confidence)
            </span>
          </p>
          <table className="text-sm">
            <tbody>
              {row("%Defective", fx(r.pctDefective, 2), true)}
              {row("Lower CI", fx(r.pctLower, 2))}
              {row("Upper CI", fx(r.pctUpper, 2))}
              {r.target !== null && row("Target", fx(r.target, 2))}
              {row("PPM Def", fInt(r.ppm), true)}
              {row("Lower CI", fInt(r.ppmLower))}
              {row("Upper CI", fInt(r.ppmUpper))}
              {row("Process Z", fx(r.processZ, 4), true)}
              {row("Lower CI", fx(r.zLower, 4))}
              {row("Upper CI", fx(r.zUpper, 4))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Cumulative %Defective">
          <ResultChart data={cumChart} layout={{ autosize: true, ...cumLayout }} />
        </Panel>
        <Panel title="Histogram">
          <ResultChart data={histChart} layout={{ autosize: true, ...histLayout }} />
        </Panel>
      </div>

      {/* --- Interpretacion --- */}
      {r.outOfControl.length > 0 ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">
            The process is not stable: {r.outOfControl.length} subgroup
            {r.outOfControl.length === 1 ? "" : "s"} out of control
          </p>
          <p className="mt-1">
            Sample{r.outOfControl.length === 1 ? " " : "s "}
            <b>{r.outOfControl.join(", ")}</b> fail
            {r.outOfControl.length === 1 ? "s" : ""} a test for special causes.
            This comes before any index: {fx(r.pctDefective, 2)} % is then the
            average of a process that changed while it was being measured, and it
            describes no state the process was ever in. Find the cause of{" "}
            {r.outOfControl.length === 1 ? "that subgroup" : "those subgroups"},
            decide whether to remove {r.outOfControl.length === 1 ? "it" : "them"},
            and only then read the capability.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-semibold">The process appears stable</p>
          <p className="mt-1">
            No subgroup fails the selected tests, so {fx(r.pctDefective, 2)} % can
            be read as the level of the process, and the interval as the precision
            with which {r.totalN.toLocaleString("es-ES")} inspected units pin it
            down.
          </p>
        </div>
      )}

      {r.target !== null && (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            r.pctLower > r.target
              ? "border-red-300 bg-red-50 text-red-800"
              : r.pctUpper < r.target
              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
              : "border-blue-300 bg-blue-50 text-blue-900"
          }`}
        >
          <p className="font-semibold">Against the target of {fx(r.target, 2)} %</p>
          <p className="mt-1">
            {r.pctLower > r.target ? (
              <>
                The whole confidence interval lies above the target: the gap is
                real, not sampling noise. Even the most favourable reading of
                these data, {fx(r.pctLower, 2)} %, misses{" "}
                {fx(r.target, 2)} %.
              </>
            ) : r.pctUpper < r.target ? (
              <>
                The whole interval lies below the target: the process meets it with
                room to spare.
              </>
            ) : (
              <>
                The interval spans the target, so these data cannot tell whether
                the process meets it. More inspected units would be needed to
                decide.
              </>
            )}
          </p>
        </div>
      )}

      {r.unequal && (
        <p className="text-xs text-gray-500">
          Tests are performed with unequal sample sizes: subgroups range from{" "}
          {r.minN} to {r.maxN} units, so each point has its own control limits.
          The labelled UCL and LCL are those of the last subgroup (n = {r.labelN}).
        </p>
      )}

      <p className="text-xs text-gray-500">
        {r.k} subgroups, {r.totalN.toLocaleString("es-ES")} units inspected,{" "}
        {r.totalD.toLocaleString("es-ES")} defectives.
        {r.historicalP !== null && (
          <>
            {" "}
            Control limits are centred on the historical p = {fx(r.historicalP, 4)},
            not on the {fx(r.pObserved, 4)} of these data.
          </>
        )}
        {r.nMissing > 0 && (
          <> {r.nMissing} row(s) skipped for a missing or non-numeric value.</>
        )}{" "}
        The confidence interval is exact (Clopper{"\u2013"}Pearson), not the normal
        approximation.
      </p>
    </div>
  );
}

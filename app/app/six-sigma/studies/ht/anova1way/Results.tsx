// app/app/six-sigma/studies/ht/anova1way/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ResultChart from "../../../components/ResultChart";
import type { Anova1WayParams, Anova1WayResult } from "./types";

const GREEN = "#00674d";
const GRID = "#e5e7eb";

/** Componente de grÃ¡fico a nivel de mÃ³dulo (regla react-hooks/static-components). */
const Chart = ({
  traces,
  layout,
  h,
}: {
  traces: Data[];
  layout: Partial<Layout>;
  h: number;
}) => (
  <div className="border border-gray-200 rounded" style={{ height: h }}>
    <ResultChart data={traces} layout={{ autosize: true, ...layout }} />
  </div>
);

/** Formato numÃ©rico con coma decimal. */
const f = (x: number, d = 2): string =>
  Number.isFinite(x) ? x.toFixed(d).replace(".", ",") : "*";

/** p-valor: 3 decimales, con umbral inferior. */
const fp = (x: number): string =>
  !Number.isFinite(x) ? "*" : x < 0.0005 ? "0,000" : x.toFixed(3).replace(".", ",");

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="border border-gray-300 px-2 py-1 text-left font-semibold bg-gray-50">
    {children}
  </th>
);
const Td = ({
  children,
  num = false,
}: {
  children: React.ReactNode;
  num?: boolean;
}) => (
  <td className={`border border-gray-300 px-2 py-1 ${num ? "text-right" : ""}`}>
    {children}
  </td>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="mb-5">
    <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
    {children}
  </section>
);

export default function Anova1WayResults({
  result: r,
  params,
}: {
  result: Anova1WayResult;
  params: Anova1WayParams;
}) {
  if (!r.ok) {
    return (
      <div className="text-sm text-gray-500 p-4">
        {r.error ?? "Select the response and factor columns."}
      </div>
    );
  }

  const title =
    r.factorName && r.responseName !== "Response"
      ? `One-way ANOVA: ${r.responseName} versus ${r.factorName}`
      : "One-way ANOVA";

  const names = r.levels.map((l) => l.name);

  // Rango X comÃºn para los tres grÃ¡ficos.
  const lo = Math.min(...r.allValues, ...r.levels.map((l) => l.ciLo));
  const hi = Math.max(...r.allValues, ...r.levels.map((l) => l.ciHi));
  const pad = (hi - lo) * 0.08 || 1;
  const yRange: [number, number] = [lo - pad, hi + pad];

  const baseLayout: Partial<Layout> = {
    margin: { l: 60, r: 30, t: 30, b: 45 },
    showlegend: false,
    plot_bgcolor: "white",
    xaxis: {
      title: { text: r.factorName || "Factor" },
      type: "category",
      categoryorder: "array",
      categoryarray: names,
      gridcolor: GRID,
    },
    yaxis: {
      title: { text: r.responseName || "Response" },
      range: yRange,
      gridcolor: GRID,
      zeroline: false,
    },
  };

  // --- Interval plot: media Â± IC (desviaciÃ³n agrupada) ---
  const intervalData: Data[] = [
    {
      type: "scatter",
      mode: "markers",
      x: names,
      y: r.levels.map((l) => l.mean),
      error_y: {
        type: "data",
        symmetric: false,
        array: r.levels.map((l) => l.ciHi - l.mean),
        arrayminus: r.levels.map((l) => l.mean - l.ciLo),
        color: GREEN,
        thickness: 1.5,
        width: 8,
      },
      marker: { color: GREEN, size: 9, symbol: "circle" },
      hovertemplate:
        "%{x}<br>Mean = %{y:.3f}<extra></extra>",
      showlegend: false,
    },
  ];

  // --- Individual value plot ---
  const ivpData: Data[] = [
    {
      type: "scatter",
      mode: "markers",
      x: r.levels.flatMap((l) => l.values.map(() => l.name)),
      y: r.levels.flatMap((l) => l.values),
      marker: { color: GREEN, size: 7, opacity: 0.75 },
      hovertemplate: "%{x}<br>%{y}<extra></extra>",
      showlegend: false,
    },
    {
      type: "scatter",
      mode: "markers",
      x: names,
      y: r.levels.map((l) => l.mean),
      marker: { color: "#d92b2b", size: 11, symbol: "line-ew-open", line: { width: 2 } },
      hovertemplate: "%{x}<br>Mean = %{y:.3f}<extra></extra>",
      showlegend: false,
    },
  ];

  // --- Boxplot ---
  const boxData: Data[] = r.levels.map((l) => ({
    type: "box",
    name: l.name,
    y: l.values,
    boxpoints: "outliers",
    quartilemethod: "inclusive",
    marker: { color: GREEN },
    line: { color: GREEN },
    fillcolor: "rgba(0,103,77,0.15)",
    showlegend: false,
  }));

  return (
    <div className="text-sm text-gray-800">
      <h2 className="text-base font-bold mb-3">{title}</h2>

      {/* ---- Method ---- */}
      <Section title="Method">
        <table className="border-collapse">
          <tbody>
            <tr>
              <Td>Null hypothesis</Td>
              <Td>All means are equal</Td>
            </tr>
            <tr>
              <Td>Alternative hypothesis</Td>
              <Td>Not all means are equal</Td>
            </tr>
            <tr>
              <Td>Significance level</Td>
              <Td>Î± = {f(r.alpha, 2)}</Td>
            </tr>
          </tbody>
        </table>
        <p className="mt-1 text-gray-600">
          Equal variances were assumed for the analysis.
        </p>
      </Section>

      {/* ---- Factor Information ---- */}
      <Section title="Factor Information">
        <table className="border-collapse">
          <thead>
            <tr>
              <Th>Factor</Th>
              <Th>Levels</Th>
              <Th>Values</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td>{r.factorName || "Factor"}</Td>
              <Td num>{r.levels.length}</Td>
              <Td>{names.join("; ")}</Td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* ---- Analysis of Variance ---- */}
      <Section title="Analysis of Variance">
        <table className="border-collapse">
          <thead>
            <tr>
              <Th>Source</Th>
              <Th>DF</Th>
              <Th>Adj SS</Th>
              <Th>Adj MS</Th>
              <Th>F-Value</Th>
              <Th>P-Value</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td>{r.factorName || "Factor"}</Td>
              <Td num>{r.dfFactor}</Td>
              <Td num>{f(r.ssFactor, 1)}</Td>
              <Td num>{f(r.msFactor, 2)}</Td>
              <Td num>{f(r.fValue, 2)}</Td>
              <Td num>{fp(r.pValue)}</Td>
            </tr>
            <tr>
              <Td>Error</Td>
              <Td num>{r.dfError}</Td>
              <Td num>{f(r.ssError, 1)}</Td>
              <Td num>{f(r.msError, 2)}</Td>
              <Td num>{""}</Td>
              <Td num>{""}</Td>
            </tr>
            <tr>
              <Td>Total</Td>
              <Td num>{r.dfTotal}</Td>
              <Td num>{f(r.ssTotal, 1)}</Td>
              <Td num>{""}</Td>
              <Td num>{""}</Td>
              <Td num>{""}</Td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* ---- Model Summary ---- */}
      <Section title="Model Summary">
        <table className="border-collapse">
          <thead>
            <tr>
              <Th>S</Th>
              <Th>R-sq</Th>
              <Th>R-sq(adj)</Th>
              <Th>R-sq(pred)</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td num>{f(r.s, 5)}</Td>
              <Td num>{f(r.rSq, 2)}%</Td>
              <Td num>{f(r.rSqAdj, 2)}%</Td>
              <Td num>{f(r.rSqPred, 2)}%</Td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* ---- Means ---- */}
      <Section title="Means">
        <table className="border-collapse">
          <thead>
            <tr>
              <Th>{r.factorName || "Factor"}</Th>
              <Th>N</Th>
              <Th>Mean</Th>
              <Th>StDev</Th>
              <Th>{f(100 * (1 - r.alpha), 0)}% CI</Th>
            </tr>
          </thead>
          <tbody>
            {r.levels.map((l) => (
              <tr key={l.name}>
                <Td>{l.name}</Td>
                <Td num>{l.n}</Td>
                <Td num>{f(l.mean, 2)}</Td>
                <Td num>{f(l.stdev, 2)}</Td>
                <Td num>
                  ({f(l.ciLo, 2)}; {f(l.ciHi, 2)})
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-1 text-gray-600">
          Pooled StDev = {f(r.pooledStDev, 5)}
        </p>
      </Section>

      {/* ---- GrÃ¡ficos ---- */}
      {params.showIntervalPlot && (
        <section className="mb-5">
          <h3 className="font-semibold text-gray-800 mb-1">
            Interval Plot of {r.responseName} vs {r.factorName}
          </h3>
          <Chart traces={intervalData} layout={baseLayout} h={300} />
          <p className="text-xs text-gray-500 mt-1">
            {f(100 * (1 - r.alpha), 0)}% CI for the mean. The pooled standard
            deviation was used to calculate the intervals.
          </p>
        </section>
      )}

      {params.showIndividualValue && (
        <section className="mb-5">
          <h3 className="font-semibold text-gray-800 mb-1">
            Individual Value Plot of {r.responseName} vs {r.factorName}
          </h3>
          <Chart traces={ivpData} layout={baseLayout} h={300} />
        </section>
      )}

      {params.showBoxplot && (
        <section className="mb-5">
          <h3 className="font-semibold text-gray-800 mb-1">
            Boxplot of {r.responseName} vs {r.factorName}
          </h3>
          <Chart traces={boxData} layout={baseLayout} h={300} />
        </section>
      )}
    </div>
  );
}

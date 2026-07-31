// app/app/six-sigma/studies/ht/anova1way/Results.tsx
// Nota: ASCII puro. Todo caracter no ASCII va como escape \uXXXX.
//   \u03b1 alpha   \u2212 signo menos   \u00b1 mas-menos
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ResultChart from "../../../components/ResultChart";
import type { Anova1WayParams, Anova1WayResult } from "./types";

const GREEN = "#00674d";
const RED = "#d92b2b";
const GRID = "#e5e7eb";

const ALPHA = "\u03b1";

/** Componente de grafico a nivel de modulo (regla react-hooks/static-components). */
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

/** Formato numerico con coma decimal. */
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

  // Rango X comun para los tres graficos de la respuesta.
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

  // --- Interval plot: media +/- IC (desviacion agrupada) ---
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
      hovertemplate: "%{x}<br>Mean = %{y:.3f}<extra></extra>",
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
      marker: {
        color: RED,
        size: 11,
        symbol: "line-ew-open",
        line: { width: 2 },
      },
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

  // ================= RESIDUOS =================
  const std = params.standardizedResiduals;
  const resLabel = std ? "Standardized residual" : "Residual";
  const res = r.residuals;
  const eVal = (i: number) => (std ? res[i].standardized : res[i].residual);
  const eAll = res.map((_, i) => eVal(i));

  const eMin = Math.min(...eAll);
  const eMax = Math.max(...eAll);
  const ePad = (eMax - eMin) * 0.1 || 1;
  const eRange: [number, number] = [eMin - ePad, eMax + ePad];

  const resAxis = {
    title: { text: resLabel },
    range: eRange,
    gridcolor: GRID,
    zeroline: true,
    zerolinecolor: "#9ca3af",
    zerolinewidth: 1,
  };

  const resMargin = { l: 55, r: 20, t: 34, b: 45 };

  // 1) Papel probabilistico normal: residuo (x) frente a percentil (y).
  //    Recta de referencia a partir de la puntuacion normal de Blom.
  const sorted = [...res].sort(
    (a, b) => (std ? a.standardized - b.standardized : a.residual - b.residual)
  );
  const sortedE = sorted.map((d) => (std ? d.standardized : d.residual));
  const sortedZ = sorted.map((d) => d.normalScore);
  const sortedP = sorted.map((d) => d.percent);

  // Ajuste por minimos cuadrados de e sobre z, para trazar la recta guia.
  const nS = sortedE.length;
  const mZ = sortedZ.reduce((a, b) => a + b, 0) / nS;
  const mE = sortedE.reduce((a, b) => a + b, 0) / nS;
  let sZE = 0;
  let sZZ = 0;
  for (let i = 0; i < nS; i++) {
    sZE += (sortedZ[i] - mZ) * (sortedE[i] - mE);
    sZZ += (sortedZ[i] - mZ) ** 2;
  }
  const slope = sZZ > 0 ? sZE / sZZ : 0;
  const lineZ = [Math.min(...sortedZ), Math.max(...sortedZ)];
  const lineE = lineZ.map((z) => mE + slope * (z - mZ));
  const lineP = lineZ.map((z) => {
    // percentil correspondiente a la puntuacion z, solo para situar la recta.
    const idx = sortedZ.reduce(
      (best, cur, i) =>
        Math.abs(cur - z) < Math.abs(sortedZ[best] - z) ? i : best,
      0
    );
    return sortedP[idx];
  });

  const normalPlot: Data[] = [
    {
      type: "scatter",
      mode: "lines",
      x: lineE,
      y: lineP,
      line: { color: RED, width: 1.5 },
      hoverinfo: "skip",
      showlegend: false,
    },
    {
      type: "scatter",
      mode: "markers",
      x: sortedE,
      y: sortedP,
      marker: { color: GREEN, size: 6 },
      hovertemplate: `${resLabel} = %{x:.3f}<br>Percent = %{y:.1f}<extra></extra>`,
      showlegend: false,
    },
  ];

  const normalLayout: Partial<Layout> = {
    title: { text: "Normal Probability Plot", font: { size: 12 } },
    margin: resMargin,
    showlegend: false,
    plot_bgcolor: "white",
    xaxis: { title: { text: resLabel }, gridcolor: GRID, zeroline: false },
    yaxis: {
      title: { text: "Percent" },
      range: [0, 100],
      gridcolor: GRID,
      zeroline: false,
    },
  };

  // 2) Residuos frente a valores ajustados.
  const vsFits: Data[] = [
    {
      type: "scatter",
      mode: "markers",
      x: res.map((d) => d.fit),
      y: eAll,
      marker: { color: GREEN, size: 7, opacity: 0.8 },
      text: res.map((d) => d.level),
      hovertemplate: `Fit = %{x:.3f}<br>${resLabel} = %{y:.3f}<br>Level %{text}<extra></extra>`,
      showlegend: false,
    },
  ];

  const vsFitsLayout: Partial<Layout> = {
    title: { text: "Versus Fits", font: { size: 12 } },
    margin: resMargin,
    showlegend: false,
    plot_bgcolor: "white",
    xaxis: { title: { text: "Fitted value" }, gridcolor: GRID, zeroline: false },
    yaxis: resAxis,
  };

// --- Histogram of residuals ---
const nb = Math.max(5, Math.ceil(Math.sqrt(eAll.length)) + 2);
const eLo = Math.min(...eAll);
const eHi = Math.max(...eAll);
const eSize = (eHi - eLo) / nb || 1;

const histData: Data[] = [
  {
    type: "histogram",
    x: eAll,
    xbins: { start: eLo, end: eHi + eSize, size: eSize },
    marker: { color: "rgba(0,103,77,0.55)", line: { color: GREEN, width: 1 } },
    hovertemplate: `${resLabel}: %{x}<br>Frequency = %{y}<extra></extra>`,
    showlegend: false,
  },
];

  const histLayout: Partial<Layout> = {
    title: { text: "Histogram", font: { size: 12 } },
    margin: resMargin,
    showlegend: false,
    bargap: 0.02,
    plot_bgcolor: "white",
    xaxis: { title: { text: resLabel }, gridcolor: GRID, zeroline: false },
    yaxis: { title: { text: "Frequency" }, gridcolor: GRID, zeroline: false },
  };

  // 4) Residuos frente al orden de observacion.
  const vsOrder: Data[] = [
    {
      type: "scatter",
      mode: "lines+markers",
      x: res.map((d) => d.order),
      y: eAll,
      line: { color: GREEN, width: 1 },
      marker: { color: GREEN, size: 6 },
      hovertemplate: `Order %{x}<br>${resLabel} = %{y:.3f}<extra></extra>`,
      showlegend: false,
    },
  ];

  const vsOrderLayout: Partial<Layout> = {
    title: { text: "Versus Order", font: { size: 12 } },
    margin: resMargin,
    showlegend: false,
    plot_bgcolor: "white",
    xaxis: {
      title: { text: "Observation order" },
      gridcolor: GRID,
      zeroline: false,
      dtick: Math.max(1, Math.round(res.length / 12)),
    },
    yaxis: resAxis,
  };

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
              <Td>{ALPHA + " = " + f(r.alpha, 2)}</Td>
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

      {/* ---- Graficos ---- */}
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

      {/* ---- Residuos: cuatro en uno ---- */}
      {params.showResiduals && res.length > 0 && (
        <section className="mb-5">
          <h3 className="font-semibold text-gray-800 mb-1">
            Residual Plots for {r.responseName}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Chart traces={normalPlot} layout={normalLayout} h={260} />
            <Chart traces={vsFits} layout={vsFitsLayout} h={260} />
            <Chart traces={histogram} layout={histLayout} h={260} />
            <Chart traces={vsOrder} layout={vsOrderLayout} h={260} />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {std
              ? "Standardized residuals. Values beyond \u22122 / +2 are unusual observations."
              : "Ordinary residuals (observed \u2212 fitted). Fitted value = level mean."}
          </p>
        </section>
      )}

      {/* ---- Tabla de residuos ---- */}
      {params.showResidualTable && res.length > 0 && (
        <Section title="Fits and Residuals">
          <div className="overflow-auto" style={{ maxHeight: 340 }}>
            <table className="border-collapse">
              <thead>
                <tr>
                  <Th>Obs</Th>
                  <Th>{r.factorName || "Factor"}</Th>
                  <Th>{r.responseName || "Response"}</Th>
                  <Th>Fit</Th>
                  <Th>Resid</Th>
                  <Th>Std Resid</Th>
                </tr>
              </thead>
              <tbody>
                {res.map((d) => {
                  const unusual = Math.abs(d.standardized) >= 2;
                  return (
                    <tr key={d.order} className={unusual ? "bg-red-50" : ""}>
                      <Td num>{d.order}</Td>
                      <Td>{d.level}</Td>
                      <Td num>{f(d.observed, 2)}</Td>
                      <Td num>{f(d.fit, 3)}</Td>
                      <Td num>{f(d.residual, 3)}</Td>
                      <Td num>
                        {f(d.standardized, 2)}
                        {unusual ? " R" : ""}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            R denotes an observation with a large standardized residual.
          </p>
        </Section>
      )}
    </div>
  );
}

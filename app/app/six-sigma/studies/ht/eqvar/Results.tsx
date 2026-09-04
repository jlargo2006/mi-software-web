// app/app/six-sigma/studies/ht/eqvar/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ResultChart from "../../../components/ResultChart";
import type { EqVarParams, EqVarResult } from "./types";

const GREEN = "#00674d";
const GRID = "#e5e7eb";

const ALPHA = "\u03b1";
const SIGMA = "\u03c3";
const MDASH = "\u2014";
const NE = "\u2260";

/** Grafico a nivel de modulo (regla react-hooks/static-components). */
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

const f = (x: number, d = 2): string =>
  Number.isFinite(x) ? x.toFixed(d).replace(".", ",") : "*";

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

export default function EqVarResults({
  result: r,
  params,
}: {
  result: EqVarResult;
  params: EqVarParams;
}) {
  if (!r.ok) {
    return (
      <div className="text-sm text-gray-500 p-4">
        {r.error ?? "Select the data columns."}
      </div>
    );
  }

  const conf = f(100 * (1 - r.alpha), 0);
  const indiv = f(100 * r.individualLevel, 1);
  const title = r.factorName
    ? `Test for Equal Variances: ${r.responseName} versus ${r.factorName}`
    : "Test for Equal Variances";

  const names = r.groups.map((g) => g.name);

  // --- Rango Y comun para el boxplot ---
  const lo = Math.min(...r.allValues);
  const hi = Math.max(...r.allValues);
  const pad = (hi - lo) * 0.08 || 1;

  const boxLayout: Partial<Layout> = {
    margin: { l: 110, r: 30, t: 30, b: 45 },
    showlegend: false,
    plot_bgcolor: "white",
    xaxis: {
      title: { text: r.responseName || "Value" },
      range: [lo - pad, hi + pad] as [number, number],
      gridcolor: GRID,
      zeroline: false,
    },
    yaxis: {
      title: { text: r.factorName || "Sample" },
      type: "category",
      categoryorder: "array",
      categoryarray: [...names].reverse(),
      gridcolor: GRID,
    },
  };

  const boxData: Data[] = r.groups.map((g) => ({
    type: "box",
    name: g.name,
    x: g.values,
    orientation: "h",
    boxpoints: "outliers",
    quartilemethod: "inclusive",
    marker: { color: GREEN, symbol: "asterisk-open", size: 7 },
    line: { color: GREEN },
    fillcolor: "rgba(0,103,77,0.15)",
    showlegend: false,
  }));


  // --- Grafico de intervalos de comparacion multiple ---
  // Se dibujan los intervalos MC (no los de Bonferroni de la tabla):
  // son magnitudes distintas y solo los MC permiten leer el solapamiento
  // como si fuese el contraste.
  const mcLo = Math.min(...r.groups.map((g) => g.mcLo));
  const mcHi = Math.max(...r.groups.map((g) => g.mcHi));
  const mcPad = (mcHi - mcLo) * 0.15 || 1;

  const ivData: Data[] = [];
  r.groups.forEach((g, i) => {
    const y = r.groups.length - i;
    ivData.push({
      type: "scatter",
      mode: "lines",
      x: [g.mcLo, g.mcHi],
      y: [y, y],
      line: { color: GREEN, width: 2 },
      hoverinfo: "skip",
      showlegend: false,
    });
    ivData.push({
      type: "scatter",
      mode: "markers",
      x: [g.mcLo, g.mcHi],
      y: [y, y],
      marker: {
        color: GREEN,
        size: 12,
        symbol: "line-ns-open",
        line: { width: 2 },
      },
      hoverinfo: "skip",
      showlegend: false,
    });
  });

  const ivLayout: Partial<Layout> = {
    margin: { l: 80, r: 30, t: 30, b: 45 },
    showlegend: false,
    plot_bgcolor: "white",
    xaxis: {
      title: { text: `Standard deviation (${SIGMA})` },
      range: [Math.max(0, mcLo - mcPad), mcHi + mcPad] as [number, number],
      gridcolor: GRID,
      zeroline: false,
    },
    yaxis: {
      title: { text: r.factorName || "Sample" },
      tickmode: "array",
      tickvals: r.groups.map((_, i) => r.groups.length - i),
      ticktext: names,
      range: [0.4, r.groups.length + 0.6] as [number, number],
      gridcolor: GRID,
      zeroline: false,
    },
  };

  const sig = r.mcPValue <= r.alpha || r.levenePValue <= r.alpha;

  return (
    <div className="text-sm text-gray-800">
      <h2 className="text-base font-bold mb-3">{title}</h2>

      {/* ---- Method ---- */}
      <Section title="Method">
        <table className="border-collapse">
          <tbody>
            <tr>
              <Td>Null hypothesis</Td>
              <Td>All variances are equal</Td>
            </tr>
            <tr>
              <Td>Alternative hypothesis</Td>
              <Td>At least one variance is different</Td>
            </tr>
            <tr>
              <Td>Significance level</Td>
              <Td>{`${ALPHA} = ${f(r.alpha, 2)}`}</Td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* ---- Bonferroni CIs ---- */}
      <Section
        title={`${conf}% Bonferroni Confidence Intervals for Standard Deviations`}
      >
        <table className="border-collapse">
          <thead>
            <tr>
              <Th>{r.factorName || "Sample"}</Th>
              <Th>N</Th>
              <Th>StDev</Th>
              <Th>CI</Th>
              {params.showKurtosis && <Th>Kurtosis</Th>}
            </tr>
          </thead>
          <tbody>
            {r.groups.map((g) => (
              <tr key={g.name}>
                <Td>{g.name}</Td>
                <Td num>{g.n}</Td>
                <Td num>{f(g.stdev, 5)}</Td>
                <Td num>{`(${f(g.ciLo, 5)}; ${f(g.ciHi, 5)})`}</Td>
                {params.showKurtosis && <Td num>{f(g.kurtosis, 4)}</Td>}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-500 mt-1">
          {`Individual confidence level = ${indiv}%`}
        </p>
      </Section>

      {/* ---- Tests ---- */}
      <Section title="Tests">
        <table className="border-collapse">
          <thead>
            <tr>
              <Th>Method</Th>
              <Th>Test Statistic</Th>
              <Th>P-Value</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td>Multiple comparisons</Td>
              <Td num>{MDASH}</Td>
              <Td num>{fp(r.mcPValue)}</Td>
            </tr>
            <tr>
              <Td>Levene</Td>
              <Td num>{f(r.leveneStatistic, 2)}</Td>
              <Td num>{fp(r.levenePValue)}</Td>
            </tr>
          </tbody>
        </table>
        <p className="mt-2">
          {sig
            ? `At ${ALPHA} = ${f(
                r.alpha,
                2
              )} there is evidence that the variances are not all equal.`
            : `At ${ALPHA} = ${f(
                r.alpha,
                2
              )} there is not enough evidence to conclude that the variances differ.`}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {`Multiple comparisons uses the Bonett method (robust to non-normality); ` +
            `Levene is the Brown-Forsythe version, based on deviations from the median. ` +
            `Levene degrees of freedom: ${r.leveneDf1}; ${r.leveneDf2}.`}
        </p>
      </Section>

      {/* ---- Graficos ---- */}
      {params.showIntervalPlot && (
        <section className="mb-5">
          <h3 className="font-semibold text-gray-800 mb-1">
            {`${conf}% Multiple Comparison Intervals`}
          </h3>
          <Chart traces={ivData} layout={ivLayout} h={70 + 55 * r.groups.length} />
          <p className="text-xs text-gray-500 mt-1">
            {`If intervals do not overlap, the corresponding standard deviations ` +
              `are significantly different (${SIGMA}\u1d62 ${NE} ${SIGMA}\u2c7c). ` +
              `These intervals are NOT the Bonferroni intervals shown in the table: ` +
              `they are multiple comparison intervals, and overlap approximates ` +
              `the test decision.`}
          </p>
        </section>
      )}

      {params.showBoxplot && (
        <section className="mb-5">
          <h3 className="font-semibold text-gray-800 mb-1">
            {`Boxplot of ${r.responseName}`}
          </h3>
          <Chart traces={boxData} layout={boxLayout} h={300} />
        </section>
      )}
    </div>
  );
}

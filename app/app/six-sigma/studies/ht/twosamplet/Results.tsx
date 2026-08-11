// app/app/six-sigma/studies/ht/twosamplet/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ResultChart from "../../../components/ResultChart";
import type { TwoSampleTParams, TwoSampleTResult } from "./types";

const GREEN = "#00674d";
const GRID = "#e5e7eb";

const ALPHA = "\u03b1";
const MU = "\u03bc";
const SUB1 = "\u2081";
const SUB2 = "\u2082";
const SUB0 = "\u2080";
const NE = "\u2260";
const MINUS = "\u2212";
const INF = "\u221e";

const MU1 = MU + SUB1;
const MU2 = MU + SUB2;
const DIFF = MU1 + " " + MINUS + " " + MU2;

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

export default function TwoSampleTResults({
  result: r,
  params,
}: {
  result: TwoSampleTResult;
  params: TwoSampleTParams;
}) {
  if (!r.ok) {
    return (
      <div className="text-sm text-gray-500 p-4">
        {r.error ?? "Select the sample columns."}
      </div>
    );
  }

  const conf = f(100 * (1 - r.alpha), 0);
  const title = r.factorName
    ? `Two-Sample T-Test and CI: ${r.responseName}; ${r.factorName}`
    : `Two-Sample T-Test and CI: ${r.s1.name}; ${r.s2.name}`;

  // Etiqueta de cada muestra: "BTU.In when Damper = 1" o el nombre de columna.
  const label = (name: string) =>
    r.factorName
      ? `${r.responseName} when ${r.factorName} = ${name}`
      : name;

  // --- Texto del intervalo: una cola => cota, dos colas => intervalo ---
  const ciText =
    r.alternative === "two-sided"
      ? `(${f(r.ciLo, 3)}; ${f(r.ciHi, 3)})`
      : r.alternative === "greater"
      ? `(${f(r.ciLo, 3)}; ${INF})`
      : `(${MINUS}${INF}; ${f(r.ciHi, 3)})`;

  const ciHeader =
    r.alternative === "two-sided"
      ? `${conf}% CI for Difference`
      : r.alternative === "greater"
      ? `${conf}% Lower Bound for Difference`
      : `${conf}% Upper Bound for Difference`;

  const altSymbol =
    r.alternative === "two-sided" ? NE : r.alternative === "greater" ? ">" : "<";

  const groups = [r.s1, r.s2];
  const names = groups.map((g) => g.name);

  // --- Rango Y comun ---
  const lo = Math.min(...r.allValues);
  const hi = Math.max(...r.allValues);
  const pad = (hi - lo) * 0.08 || 1;

  const baseLayout: Partial<Layout> = {
    margin: { l: 60, r: 30, t: 30, b: 45 },
    showlegend: false,
    plot_bgcolor: "white",
    xaxis: {
      title: { text: r.factorName || "Sample" },
      type: "category",
      categoryorder: "array",
      categoryarray: names,
      gridcolor: GRID,
    },
    yaxis: {
      title: { text: r.responseName || "Value" },
      range: [lo - pad, hi + pad] as [number, number],
      gridcolor: GRID,
      zeroline: false,
    },
  };

  // --- Individual value plot ---
  const ivpData: Data[] = [
    {
      type: "scatter",
      mode: "markers",
      x: groups.flatMap((g) => g.values.map(() => g.name)),
      y: groups.flatMap((g) => g.values),
      marker: { color: GREEN, size: 7, opacity: 0.75 },
      hovertemplate: "%{x}<br>%{y}<extra></extra>",
      showlegend: false,
    },
    {
      type: "scatter",
      mode: "markers",
      x: names,
      y: groups.map((g) => g.mean),
      marker: {
        color: "#d92b2b",
        size: 13,
        symbol: "line-ew-open",
        line: { width: 2 },
      },
      hovertemplate: "%{x}<br>Mean = %{y:.3f}<extra></extra>",
      showlegend: false,
    },
  ];

  // --- Boxplot ---
  const boxData: Data[] = groups.map((g) => ({
    type: "box",
    name: g.name,
    y: g.values,
    boxpoints: "outliers",
    quartilemethod: "inclusive",
    marker: { color: GREEN },
    line: { color: GREEN },
    fillcolor: "rgba(0,103,77,0.15)",
    showlegend: false,
  }));

  // --- IC de la diferencia (horizontal) ---
  // En contrastes de una cola el limite infinito se dibuja recortado al
  // borde del grafico, no se omite: asi se ve que la cota es unilateral.
  const finiteLo = Number.isFinite(r.ciLo) ? r.ciLo : r.difference - 4 * r.seDiff;
  const finiteHi = Number.isFinite(r.ciHi) ? r.ciHi : r.difference + 4 * r.seDiff;
  const dPad = (finiteHi - finiteLo) * 0.25 || 1;

  const diffData: Data[] = [
    {
      type: "scatter",
      mode: "lines",
      x: [finiteLo, finiteHi],
      y: [0, 0],
      line: { color: GREEN, width: 3 },
      hoverinfo: "skip",
      showlegend: false,
    },
    {
      type: "scatter",
      mode: "markers",
      x: [finiteLo, finiteHi],
      y: [0, 0],
      marker: { color: GREEN, size: 12, symbol: "line-ns-open", line: { width: 3 } },
      hoverinfo: "skip",
      showlegend: false,
    },
    {
      type: "scatter",
      mode: "markers",
      x: [r.difference],
      y: [0],
      marker: { color: GREEN, size: 11, symbol: "circle" },
      hovertemplate: `Difference = %{x:.4f}<extra></extra>`,
      showlegend: false,
    },
  ];

  const diffLayout: Partial<Layout> = {
    margin: { l: 30, r: 30, t: 30, b: 45 },
    showlegend: false,
    plot_bgcolor: "white",
    xaxis: {
      title: { text: `Difference (${DIFF})` },
      range: [finiteLo - dPad, finiteHi + dPad] as [number, number],
      gridcolor: GRID,
      zeroline: false,
    },
    yaxis: {
      range: [-1, 1] as [number, number],
      showticklabels: false,
      showgrid: false,
      zeroline: false,
    },
    shapes: [
      {
        type: "line",
        x0: r.hypDiff,
        x1: r.hypDiff,
        y0: -0.6,
        y1: 0.6,
        line: { color: "#d92b2b", width: 1.5, dash: "dash" },
      },
    ],
  };

  return (
    <div className="text-sm text-gray-800">
      <h2 className="text-base font-bold mb-3">{title}</h2>

      {/* ---- Method ---- */}
      <Section title="Method">
        <table className="border-collapse">
          <tbody>
            <tr>
              <Td>{MU1}</Td>
              <Td>{`population mean of ${label(r.s1.name)}`}</Td>
            </tr>
            <tr>
              <Td>{MU2}</Td>
              <Td>{`population mean of ${label(r.s2.name)}`}</Td>
            </tr>
            <tr>
              <Td>Difference</Td>
              <Td>{DIFF}</Td>
            </tr>
          </tbody>
        </table>
        <p className="mt-1 text-gray-600">
          {r.pooled
            ? "Equal variances are assumed for this analysis."
            : "Equal variances are not assumed for this analysis."}
        </p>
      </Section>

      {/* ---- Descriptive Statistics ---- */}
      <Section title={`Descriptive Statistics: ${r.responseName}`}>
        <table className="border-collapse">
          <thead>
            <tr>
              <Th>{r.factorName || "Sample"}</Th>
              <Th>N</Th>
              <Th>Mean</Th>
              <Th>StDev</Th>
              <Th>SE Mean</Th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.name}>
                <Td>{g.name}</Td>
                <Td num>{g.n}</Td>
                <Td num>{f(g.mean, 2)}</Td>
                <Td num>{f(g.stdev, 2)}</Td>
                <Td num>{f(g.seMean, 2)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ---- Estimation for Difference ---- */}
      <Section title="Estimation for Difference">
        <table className="border-collapse">
          <thead>
            <tr>
              <Th>Difference</Th>
              {r.pooled && <Th>Pooled StDev</Th>}
              <Th>{ciHeader}</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td num>{f(r.difference, 3)}</Td>
              {r.pooled && <Td num>{f(r.pooledStDev, 5)}</Td>}
              <Td num>{ciText}</Td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* ---- Test ---- */}
      <Section title="Test">
        <table className="border-collapse mb-2">
          <tbody>
            <tr>
              <Td>Null hypothesis</Td>
              <Td>{`H${SUB0}: ${DIFF} = ${f(r.hypDiff, 0)}`}</Td>
            </tr>
            <tr>
              <Td>Alternative hypothesis</Td>
              <Td>{`H${SUB1}: ${DIFF} ${altSymbol} ${f(r.hypDiff, 0)}`}</Td>
            </tr>
            <tr>
              <Td>Significance level</Td>
              <Td>{`${ALPHA} = ${f(r.alpha, 2)}`}</Td>
            </tr>
          </tbody>
        </table>

        <table className="border-collapse">
          <thead>
            <tr>
              <Th>T-Value</Th>
              <Th>DF</Th>
              <Th>P-Value</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td num>{f(r.tValue, 2)}</Td>
              <Td num>{r.df}</Td>
              <Td num>{fp(r.pValue)}</Td>
            </tr>
          </tbody>
        </table>

        {!r.pooled && (
          <p className="text-xs text-gray-500 mt-1">
            {`Welch-Satterthwaite degrees of freedom: ${f(
              r.dfExact,
              4
            )}, truncated to ${r.df} for the test and the interval.`}
          </p>
        )}
        <p className="mt-2">
          {r.pValue <= r.alpha
            ? `Since P ${LE_OR(r.pValue, r.alpha)} ${ALPHA} = ${f(
                r.alpha,
                2
              )}, reject H${SUB0}: the difference is statistically significant.`
            : `Since P > ${ALPHA} = ${f(
                r.alpha,
                2
              )}, do not reject H${SUB0}: there is not enough evidence of a difference.`}
        </p>
      </Section>

      {/* ---- Graficos ---- */}
      {params.showIndividualValue && (
        <section className="mb-5">
          <h3 className="font-semibold text-gray-800 mb-1">
            {`Individual Value Plot of ${r.responseName}`}
          </h3>
          <Chart traces={ivpData} layout={baseLayout} h={300} />
        </section>
      )}

      {params.showBoxplot && (
        <section className="mb-5">
          <h3 className="font-semibold text-gray-800 mb-1">
            {`Boxplot of ${r.responseName}`}
          </h3>
          <Chart traces={boxData} layout={baseLayout} h={300} />
        </section>
      )}

      {params.showDiffCI && (
        <section className="mb-5">
          <h3 className="font-semibold text-gray-800 mb-1">
            {`${conf}% CI for the Difference`}
          </h3>
          <Chart traces={diffData} layout={diffLayout} h={200} />
          <p className="text-xs text-gray-500 mt-1">
            {`The dashed line marks the hypothesized difference (${f(
              r.hypDiff,
              0
            )}). If it falls outside the interval, H${SUB0} is rejected at ` +
              `${ALPHA} = ${f(r.alpha, 2)}.`}
          </p>
        </section>
      )}
    </div>
  );
}

/** "<=" cuando el p-valor coincide con alpha, "<" en el resto. */
function LE_OR(p: number, alpha: number): string {
  return p === alpha ? "\u2264" : "<";
}

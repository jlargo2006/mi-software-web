// app/app/six-sigma/studies/improve/correlation/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ReportLayout from "../../../components/ReportLayout";
import ResultChart from "../../../components/ResultChart";
import {
  CORR_LABEL,
  type ImpCorrParams,
  type ImpCorrResult,
} from "./types";

const GREEN = "#00674d";
const RHO = "\u03C1";

/** Formato con coma decimal y numero fijo de decimales. */
const fx = (v: number, dec: number): string =>
  Number.isFinite(v) ? v.toFixed(dec).replace(".", ",") : "*";

/** Formato con coma decimal, sin ceros de relleno. */
const f = (v: number, dec = 6): string => {
  if (!Number.isFinite(v)) return "\u2014";
  const s = v.toFixed(dec).replace(/0+$/, "").replace(/\.$/, "");
  return s.replace(".", ",");
};

export default function ImpCorrResults({
  result,
  params,
}: {
  result: ImpCorrResult;
  params: ImpCorrParams;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ??
          "Selecciona al menos dos columnas para calcular la correlaci\u00f3n."}
      </div>
    );
  }

  const r = result;
  const typeName = CORR_LABEL[r.corrType];
  const cl = f(r.confLevel, 2);

  const ciHeader =
    r.ciKind === "two"
      ? `${cl}% CI for ${RHO}`
      : r.ciKind === "lower"
        ? `${cl}% Lower Bound for ${RHO}`
        : `${cl}% Upper Bound for ${RHO}`;

  const ciText = (lo: number, hi: number): string =>
    r.ciKind === "two"
      ? `(${fx(lo, 3)}; ${fx(hi, 3)})`
      : r.ciKind === "lower"
        ? `(${fx(lo, 3)}; 1)`
        : `(${"\u2212"}1; ${fx(hi, 3)})`;

  // Matriz triangular inferior: filas son las variables 2..k, columnas 1..k-1.
  const rowVars = r.labels.slice(1);
  const colVars = r.labels.slice(0, -1);
  const cellOf = (i: number, j: number) =>
    r.pairs.find((p) => p.i === i && p.j === j);

  // Grafico: un solo par se dibuja como dispersion con el resultado al pie.
  // Con mas variables, matriz de dispersion.
  const single = r.pairs.length === 1 ? r.pairs[0] : null;
  const chartData: Data[] = single
    ? [
        {
          type: "scatter",
          mode: "markers",
          x: single.x,
          y: single.y,
          marker: { color: GREEN, size: 8 },
          hovertemplate: `${single.labelJ}: %{x}<br>${single.labelI}: %{y}<extra></extra>`,
          showlegend: false,
        } as unknown as Data,
      ]
    : [
        {
          type: "splom",
          dimensions: r.labels.map((lbl, k) => ({
            label: lbl,
            values: Array.from(
              { length: Math.max(...r.pairs.map((p) => p.x.length)) },
              (_, idx) => {
                // Cada dimension recupera sus valores del primer par que la
                // contenga: el splom solo necesita la columna, no el par.
                const p = r.pairs.find((q) => q.i === k || q.j === k);
                if (!p) return null;
                return p.i === k ? p.y[idx] ?? null : p.x[idx] ?? null;
              }
            ),
          })),
          marker: { color: GREEN, size: 5 },
          diagonal: { visible: false },
          showupperhalf: false,
          showlegend: false,
        } as unknown as Data,
      ];

  const chartLayout: Partial<Layout> = single
    ? {
        margin: { l: 70, r: 30, t: 20, b: 55 },
        xaxis: { title: { text: single.labelJ }, zeroline: false },
        yaxis: { title: { text: single.labelI }, zeroline: false },
        hovermode: "closest",
      }
    : {
        margin: { l: 70, r: 30, t: 20, b: 55 },
        dragmode: "select",
      };

  const chartHeight = single ? 380 : 160 * Math.max(2, r.labels.length - 1);

  return (
    <ReportLayout
      template="chart-text"
      center={
        <div className="w-full space-y-6">
          {/* Method */}
          <section className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-800">Method</h3>
            <table className="border-collapse text-sm">
              <tbody>
                <tr>
                  <td className="py-1 pr-6 text-gray-600">Correlation type</td>
                  <td className="py-1">{typeName}</td>
                </tr>
                <tr>
                  <td className="py-1 pr-6 text-gray-600">
                    Number of rows used
                  </td>
                  <td className="py-1">{r.nCompleteRows}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 text-sm text-gray-700">
              {RHO}: pairwise {typeName} correlation
            </p>
          </section>

          {/* Matriz de correlaciones */}
          <section className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-800">
              Correlations
            </h3>
            <div className="overflow-x-auto">
              <table className="border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="py-1 pr-4" />
                    {colVars.map((c) => (
                      <th
                        key={c}
                        className="py-1 px-3 text-right align-bottom font-medium text-gray-600"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rowVars.map((rv, ri) => {
                    const i = ri + 1;
                    return (
                      <tr key={rv} className="border-b border-gray-200">
                        <td className="py-1 pr-4 font-medium">{rv}</td>
                        {colVars.map((cv, j) => {
                          const cell = j < i ? cellOf(i, j) : null;
                          return (
                            <td key={cv} className="py-1 px-3 text-right">
                              {cell ? (
                                <span>
                                  {fx(cell.r, 3)}
                                  {params.showPValues && (
                                    <span className="block text-xs text-gray-500">
                                      {fx(cell.pValue, 3)}
                                    </span>
                                  )}
                                </span>
                              ) : (
                                ""
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {params.showPValues && (
              <p className="mt-2 text-xs text-gray-500">
                Cell contents: correlation, then p-value.
              </p>
            )}
          </section>

          {/* Tabla por parejas */}
          <section className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-800">
              Pairwise {typeName} Correlations
            </h3>
            <div className="overflow-x-auto">
              <table className="border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-300 text-left text-gray-600">
                    <th className="py-1 pr-6">Sample 1</th>
                    <th className="py-1 pr-6">Sample 2</th>
                    <th className="py-1 pr-6">N</th>
                    <th className="py-1 pr-6">Correlation</th>
                    {params.showCI && (
                      <th className="py-1 pr-6">{ciHeader}</th>
                    )}
                    {params.showPValues && <th className="py-1">P-Value</th>}
                  </tr>
                </thead>
                <tbody>
                  {r.pairs.map((p) => (
                    <tr
                      key={`${p.i}-${p.j}`}
                      className="border-b border-gray-200"
                    >
                      <td className="py-1 pr-6">{p.labelI}</td>
                      <td className="py-1 pr-6">{p.labelJ}</td>
                      <td className="py-1 pr-6">{p.n}</td>
                      <td className="py-1 pr-6">{fx(p.r, 3)}</td>
                      {params.showCI && (
                        <td className="py-1 pr-6">
                          {ciText(p.ciLow, p.ciHigh)}
                        </td>
                      )}
                      {params.showPValues && (
                        <td className="py-1">{fx(p.pValue, 3)}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {r.unequalN && (
              <p className="mt-2 text-xs text-amber-700">
                Pairs use different numbers of observations: missing values were
                removed pair by pair.
              </p>
            )}
            {r.pairs.some((p) => !Number.isFinite(p.r)) && (
              <p className="mt-2 text-xs text-amber-700">
                Some correlations are undefined: a variable is constant.
              </p>
            )}
            {r.pairs.some((p) => p.n <= 3) && (
              <p className="mt-2 text-xs text-amber-700">
                With four or fewer observations the confidence interval is not
                estimable.
              </p>
            )}
          </section>

          {params.showMatrixPlot && (
            <section className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-800">
                Matrix Plot of {r.labels.join("; ")}
              </h3>
              <p className="mb-1 text-xs text-gray-600">
                {cl}% CI for {typeName} Correlation
              </p>
              <div
                className="border border-gray-200 rounded"
                style={{ height: chartHeight }}
              >
                <ResultChart
                  data={chartData}
                  layout={{ autosize: true, ...chartLayout }}
                />
              </div>
              {single && (
                <p className="mt-2 text-center font-mono text-xs text-gray-700">
                  r = {fx(single.r, 3)}
                  {"\u00a0\u00a0"}CI = {ciText(single.ciLow, single.ciHigh)}
                </p>
              )}
            </section>
          )}
        </div>
      }
    />
  );
}

// app/app/six-sigma/studies/ht/chisqassociation/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ReportLayout from "../../../components/ReportLayout";
import ResultChart from "../../../components/ResultChart";
import type { HTChiSqAssocParams, HTChiSqAssocResult } from "./types";

const GREEN = "#00674d";

/** Formato con coma decimal y numero fijo de decimales. */
const fx = (v: number, dec: number): string =>
  Number.isFinite(v) ? v.toFixed(dec).replace(".", ",") : "\u2014";

export default function HTChiSqAssocResults({
  result,
  params,
}: {
  result: HTChiSqAssocResult;
  params: HTChiSqAssocParams;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ??
          "Selecciona las columnas de la tabla para ejecutar el an\u00e1lisis."}
      </div>
    );
  }

  const r = result;

  // Filas secundarias de cada celda, en el orden del informe.
  const extras: { key: string; label: string; get: (i: number, j: number) => string }[] =
    [];
  if (params.showExpected)
    extras.push({
      key: "exp",
      label: "Expected count",
      get: (i, j) => fx(r.cells[i][j].expected, 2),
    });
  if (params.showResiduals)
    extras.push({
      key: "res",
      label: "Residual",
      get: (i, j) => fx(r.cells[i][j].residual, 2),
    });
  if (params.showStdResiduals)
    extras.push({
      key: "std",
      label: "Standardized residual",
      get: (i, j) => fx(r.cells[i][j].stdResidual, 2),
    });
  if (params.showContribution)
    extras.push({
      key: "con",
      label: "Contribution to Chi-Square",
      get: (i, j) => fx(r.cells[i][j].contribution, 3),
    });

  const th = "py-1 px-3 text-right font-medium text-gray-600";
  const td = "py-0.5 px-3 text-right";
  const tdSub = "py-0.5 px-3 text-right text-gray-500";

  // Grafico: aportacion de cada celda al estadistico, ordenada.
  const flat = r.cells.flatMap((row, i) =>
    row.map((c, j) => ({
      name: `${r.rowLabels[i]} / ${r.colLabels[j]}`,
      v: c.contribution,
      sign: c.residual >= 0 ? 1 : -1,
    }))
  );
  flat.sort((a, b) => b.v - a.v);
  const chartData: Data[] = [
    {
      type: "bar",
      orientation: "h",
      x: flat.map((d) => d.v).reverse(),
      y: flat.map((d) => d.name).reverse(),
      marker: {
        color: flat.map((d) => (d.sign > 0 ? GREEN : "#8c6d3f")).reverse(),
      },
      hovertemplate: "%{y}: %{x:.3f}<extra></extra>",
      showlegend: false,
    } as unknown as Data,
  ];
  const chartLayout: Partial<Layout> = {
    margin: { l: 150, r: 30, t: 10, b: 40 },
    xaxis: { title: { text: "Contribution to Chi-Square" } },
    yaxis: { automargin: true, fixedrange: true },
    bargap: 0.35,
  };

  return (
    <ReportLayout
      template="chart-text"
      center={
        <div className="w-full space-y-6">
          <section className="mb-6">
            <p className="text-sm text-gray-700">
              Rows: {r.rowTitle}
              {"\u00a0\u00a0\u00a0"}Columns: {r.colTitle}
            </p>
          </section>

          {/* Tabla de contingencia */}
          <section className="mb-6">
            <div className="overflow-x-auto">
              <table className="border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className={th} />
                    {r.colLabels.map((c) => (
                      <th key={c} className={th}>
                        {c}
                      </th>
                    ))}
                    <th className={th}>All</th>
                  </tr>
                </thead>
                <tbody>
                  {r.rowLabels.map((rl, i) => (
                    <React.Fragment key={rl}>
                      <tr className={extras.length ? "" : "border-b border-gray-200"}>
                        <td className={`${td} font-medium`}>{rl}</td>
                        {r.colLabels.map((cl, j) => (
                          <td key={cl} className={td}>
                            {r.cells[i][j].observed}
                          </td>
                        ))}
                        <td className={td}>{r.rowTotals[i]}</td>
                      </tr>
                      {extras.map((ex, k) => (
                        <tr
                          key={ex.key}
                          className={
                            k === extras.length - 1
                              ? "border-b border-gray-200"
                              : ""
                          }
                        >
                          <td className={tdSub} />
                          {r.colLabels.map((cl, j) => (
                            <td key={cl} className={tdSub}>
                              {ex.get(i, j)}
                            </td>
                          ))}
                          <td className={tdSub} />
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                  <tr className="border-t border-gray-300">
                    <td className={`${td} font-medium`}>All</td>
                    {r.colTotals.map((t, j) => (
                      <td key={j} className={td}>
                        {t}
                      </td>
                    ))}
                    <td className={`${td} font-medium`}>{r.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Cell Contents */}
          <section className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-800">
              Cell Contents
            </h3>
            <div className="space-y-0.5 pl-6 text-sm text-gray-700">
              <p>Count</p>
              {extras.map((ex) => (
                <p key={ex.key}>{ex.label}</p>
              ))}
            </div>
          </section>

          {/* Chi-Square Test */}
          <section className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-800">
              Chi-Square Test
            </h3>
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left text-gray-600">
                  <th className="py-1 pr-6" />
                  <th className="py-1 pr-6">Chi-Square</th>
                  <th className="py-1 pr-6">DF</th>
                  <th className="py-1">P-Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-1 pr-6">Pearson</td>
                  <td className="py-1 pr-6">{fx(r.chiSqPearson, 3)}</td>
                  <td className="py-1 pr-6">{r.df}</td>
                  <td className="py-1">{fx(r.pPearson, 3)}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1 pr-6">Likelihood Ratio</td>
                  <td className="py-1 pr-6">{fx(r.chiSqLR, 3)}</td>
                  <td className="py-1 pr-6">{r.df}</td>
                  <td className="py-1">{fx(r.pLR, 3)}</td>
                </tr>
              </tbody>
            </table>

            {r.nLowExpected > 0 && (
              <p className="mt-2 text-xs text-amber-700">
                {r.nLowExpected} cell(s) have expected counts below 5, the
                smallest being {fx(r.minExpected, 2)}: the chi-square
                approximation may be unreliable.
              </p>
            )}
            {r.hasZeroCell && (
              <p className="mt-2 text-xs text-amber-700">
                Some cells have a count of zero; they contribute nothing to the
                likelihood ratio statistic.
              </p>
            )}
            {(r.droppedRows > 0 || r.droppedCols > 0) && (
              <p className="mt-2 text-xs text-amber-700">
                {r.droppedRows} empty row(s) and {r.droppedCols} empty column(s)
                were removed before the analysis.
              </p>
            )}
            {r.nMissing > 0 && (
              <p className="mt-2 text-xs text-amber-700">
                {r.nMissing} row(s) dropped: a category was blank.
              </p>
            )}
          </section>

          <section className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-800">
              Contribution to Chi-Square by Cell
            </h3>
            <div
              className="border border-gray-200 rounded"
              style={{ height: 90 + flat.length * 26 }}
            >
              <ResultChart
                data={chartData}
                layout={{ autosize: true, ...chartLayout }}
              />
            </div>
            <p className="mt-2 text-xs italic text-gray-600">
              Green: observed above expected. Brown: observed below expected.
            </p>
          </section>
        </div>
      }
    />
  );
}

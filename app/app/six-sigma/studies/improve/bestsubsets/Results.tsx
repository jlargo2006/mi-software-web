// app/app/six-sigma/studies/improve/bestsubsets/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ReportLayout from "../../../components/ReportLayout";
import ResultChart from "../../../components/ResultChart";
import type { ImpSubsetsResult, SubsetRow } from "./types";

const GREEN = "#00674d";
const BLUE = "#1d4ed8";
const RED = "#b91c1c";

const fx = (v: number, dec: number): string =>
  Number.isFinite(v) ? v.toFixed(dec).replace(".", ",") : "*";

/** Rotulo vertical, una letra por linea, como en el informe original. */
const VertLabel = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center leading-[1.05] font-mono text-[11px]">
    {text.split("").map((ch, i) => (
      <span key={i}>{ch === " " ? "\u00a0" : ch}</span>
    ))}
  </div>
);

export default function ImpSubsetsResults({
  result,
}: {
  result: ImpSubsetsResult;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Selecciona la respuesta y los predictores."}
      </div>
    );
  }

  const r = result;
  const rec = r.recommended;

  const sameModel = (a: SubsetRow, b: SubsetRow | null) =>
    !!b && a.members.length === b.members.length &&
    a.members.every((v, i) => v === b.members[i]);

  // Grafico: los tres criterios frente al numero de terminos.
  const sizes = r.bestBySize.map((b) => b.vars);
  const traces: Data[] = [
    {
      type: "scatter",
      mode: "lines+markers",
      x: sizes,
      y: r.bestBySize.map((b) => b.r2),
      name: "R-Sq",
      line: { color: BLUE, width: 2 },
      marker: { size: 7 },
      hovertemplate: "Vars %{x}<br>R-Sq %{y:.1f}%<extra></extra>",
    } as unknown as Data,
    {
      type: "scatter",
      mode: "lines+markers",
      x: sizes,
      y: r.bestBySize.map((b) => b.r2adj),
      name: "R-Sq(adj)",
      line: { color: GREEN, width: 2 },
      marker: { size: 7 },
      hovertemplate: "Vars %{x}<br>R-Sq(adj) %{y:.1f}%<extra></extra>",
    } as unknown as Data,
    {
      type: "scatter",
      mode: "lines+markers",
      x: sizes,
      y: r.bestBySize.map((b) => b.r2pred),
      name: "R-Sq(pred)",
      line: { color: RED, width: 2, dash: "dot" },
      marker: { size: 7 },
      hovertemplate: "Vars %{x}<br>R-Sq(pred) %{y:.1f}%<extra></extra>",
    } as unknown as Data,
  ];

  const layout: Partial<Layout> = {
    margin: { l: 60, r: 20, t: 20, b: 50 },
    xaxis: {
      title: { text: "Number of predictors" },
      dtick: 1,
      zeroline: false,
    },
    yaxis: { title: { text: "%" }, zeroline: false },
    hovermode: "x unified",
    legend: { orientation: "h", y: -0.18, x: 0, font: { size: 11 } },
  };

  const th = "px-2 py-1 text-right font-medium text-gray-600 whitespace-nowrap";
  const td = "px-2 py-1 text-right whitespace-nowrap";

  return (
    <ReportLayout
      template="chart-text"
      center={
        <div className="w-full space-y-6">
          <h3 className="text-sm font-semibold text-gray-800">
            Best Subsets Regression: {r.response} versus{" "}
            {r.predictors.join("; ")}
          </h3>

          <p className="text-sm text-gray-700">Response is {r.response}</p>

          {/* Tabla principal */}
          <section className="mb-6 overflow-x-auto">
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-400 align-bottom">
                  <th className={th}>Vars</th>
                  <th className={th}>R-Sq</th>
                  <th className={th}>R-Sq (adj)</th>
                  <th className={th}>R-Sq (pred)</th>
                  <th className={th}>Mallows Cp</th>
                  <th className={`${th} pr-4`}>S</th>
                  {r.predictors.map((nm) => (
                    <th key={nm} className="px-1 py-1 align-bottom">
                      <VertLabel text={nm} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {r.rows.map((row, i) => {
                  const isRec = sameModel(row, rec);
                  const prev = r.rows[i - 1];
                  const newSize = !prev || prev.vars !== row.vars;
                  return (
                    <tr
                      key={`${row.vars}-${row.members.join(",")}`}
                      className={`border-b border-gray-200 ${
                        newSize ? "border-t border-t-gray-300" : ""
                      } ${isRec ? "bg-emerald-50 font-semibold" : ""}`}
                    >
                      <td className={td}>{row.vars}</td>
                      <td className={td}>{fx(row.r2, 1)}</td>
                      <td className={td}>{fx(row.r2adj, 1)}</td>
                      <td className={td}>{fx(row.r2pred, 1)}</td>
                      <td className={td}>{fx(row.cp, 1)}</td>
                      <td className={`${td} pr-4`}>{fx(row.s, 3)}</td>
                      {r.predictors.map((nm, j) => (
                        <td
                          key={nm}
                          className="px-1 py-1 text-center font-mono"
                        >
                          {row.members.includes(j) ? "X" : "\u00a0"}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* Recomendacion */}
          {rec && (
            <section className="mb-6">
              <h4 className="mb-2 text-sm font-semibold text-gray-800">
                Suggested model
              </h4>
              <p className="text-sm text-gray-700">
                <strong>
                  {rec.members.map((j) => r.predictors[j]).join(" + ")}
                </strong>
              </p>
              <table className="mt-2 border-collapse text-sm">
                <tbody>
                  <tr>
                    <td className="py-1 pr-6 text-gray-600">Mallows Cp</td>
                    <td className="py-1 pr-6">{fx(rec.cp, 1)}</td>
                    <td className="py-1 pr-6 text-gray-600">
                      Parameters (p)
                    </td>
                    <td className="py-1">{rec.p}</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-6 text-gray-600">R-Sq(adj)</td>
                    <td className="py-1 pr-6">{fx(rec.r2adj, 1)}%</td>
                    <td className="py-1 pr-6 text-gray-600">R-Sq(pred)</td>
                    <td className="py-1">{fx(rec.r2pred, 1)}%</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-2 text-xs text-gray-600">
                The smallest model whose Cp does not exceed its own number of
                parameters. It is a starting point, not a verdict: fit it, check
                the residuals, and weigh what each term costs to measure.
              </p>
            </section>
          )}

          {/* Grafico */}
          <section className="mb-6">
            <h4 className="mb-2 text-center text-sm font-semibold text-gray-800">
              Criteria for the best model of each size
            </h4>
            <div
              className="border border-gray-200 rounded"
              style={{ height: 380 }}
            >
              <ResultChart
                data={traces}
                layout={{ autosize: true, ...layout }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-600">
              R-Sq can only rise. Where R-Sq(pred) turns down, the extra terms
              are fitting noise rather than signal.
            </p>
          </section>

          <section className="space-y-1 text-xs text-gray-600">
            <p>
              {r.nEvaluated} subset(s) fitted on {r.n} complete row(s).
            </p>
            {r.nSkipped > 0 && (
              <p className="text-amber-700">
                {r.nSkipped} subset(s) skipped: collinear predictors.
              </p>
            )}
            {r.nMissing > 0 && (
              <p className="text-amber-700">
                {r.nMissing} row(s) dropped: a value was missing in the response
                or in one of the predictors. Every model uses the same rows.
              </p>
            )}
          </section>
        </div>
      }
    />
  );
}

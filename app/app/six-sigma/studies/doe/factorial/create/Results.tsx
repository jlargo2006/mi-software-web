// app/app/six-sigma/studies/doe/factorial/create/Results.tsx
"use client";
import React from "react";
import ReportLayout from "../../../../components/ReportLayout";
import type { DoeCreateResult } from "./types";

export default function DoeCreateResults({
  result,
}: {
  result: DoeCreateResult;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Configura el diseno."}
      </div>
    );
  }

  const r = result;
  const th = "px-3 py-1 text-left font-medium text-gray-600 whitespace-nowrap";
  const td = "px-3 py-1 whitespace-nowrap";
  const tdc = "px-3 py-1 text-center whitespace-nowrap font-mono";

  /** Signo del nivel codificado, como en la tabla de diseno de Minitab. */
  const sign = (v: number): string => (v > 0 ? "+" : v < 0 ? "\u2212" : "0");

  const title = r.isFull ? "Full Factorial Design" : "Fractional Factorial Design";

  return (
    <ReportLayout
      template="chart-text"
      center={
        <div className="w-full space-y-6">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>

          {/* Resumen */}
          <section>
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              Design Summary
            </h4>
            <table className="border-collapse text-sm">
              <tbody>
                <tr>
                  <td className="py-1 pr-4 text-gray-600">Factors:</td>
                  <td className="py-1 pr-10 font-medium">{r.numFactors}</td>
                  <td className="py-1 pr-4 text-gray-600">Base Design:</td>
                  <td className="py-1 font-medium">
                    {r.numFactors}; {r.baseRuns}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 text-gray-600">Runs:</td>
                  <td className="py-1 pr-10 font-medium">{r.totalRuns}</td>
                  <td className="py-1 pr-4 text-gray-600">Replicates:</td>
                  <td className="py-1 font-medium">{r.replicates}</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 text-gray-600">Blocks:</td>
                  <td className="py-1 pr-10 font-medium">{r.blocks}</td>
                  <td className="py-1 pr-4 text-gray-600">
                    Center pts (total):
                  </td>
                  <td className="py-1 font-medium">{r.centerTotal}</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 text-gray-600">Design:</td>
                  <td className="py-1 pr-10 font-medium">{r.designLabel}</td>
                  <td className="py-1 pr-4 text-gray-600">Resolution:</td>
                  <td className="py-1 font-medium">
                    {r.resolutionLabel}{" "}
                    <span className="font-mono text-xs text-gray-500">
                      {r.notation}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            <p className="mt-3 text-sm">
              {r.isFull ? (
                <span className="font-medium text-emerald-800">
                  All terms are free from aliasing.
                </span>
              ) : (
                <span className="font-medium text-amber-800">
                  Some terms are aliased: see the alias structure below.
                </span>
              )}
            </p>

            {r.blockConfounded.length > 0 && (
              <p className="mt-1 text-sm text-amber-800">
                Blocks are confounded with:{" "}
                <span className="font-mono">
                  {r.blockConfounded.join(", ")}
                </span>
                . Those interactions can no longer be separated from the block
                effect.
              </p>
            )}
          </section>

          {/* Factores */}
          <section className="overflow-x-auto">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">Factors</h4>
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className={th}>Factor</th>
                  <th className={th}>Name</th>
                  <th className={th}>Type</th>
                  <th className={th}>Low</th>
                  <th className={th}>High</th>
                </tr>
              </thead>
              <tbody>
                {r.factors.map((f) => (
                  <tr key={f.letter} className="border-b border-gray-200">
                    <td className={`${td} font-mono`}>{f.letter}</td>
                    <td className={td}>{f.name}</td>
                    <td className={td}>
                      {f.type === "numeric" ? "Numeric" : "Text"}
                    </td>
                    <td className={td}>{f.low}</td>
                    <td className={td}>{f.high}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Alias */}
          {r.alias.length > 0 && (
            <section>
              <h4 className="mb-2 text-sm font-semibold text-gray-800">
                Alias Structure
              </h4>
              <div className="space-y-0.5 font-mono text-xs text-gray-800">
                {r.alias.map((a) => (
                  <p key={a.term}>
                    {a.term}
                    {a.aliases.length > 0 ? " + " : ""}
                    {a.aliases.join(" + ")}
                  </p>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-600">
                Terms on the same line cannot be told apart by this design. If a
                line matters to you, you need more runs.
              </p>
            </section>
          )}

          {/* Tabla de diseno */}
          <section className="overflow-x-auto">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              Design Table{r.randomized ? " (randomized)" : ""}
            </h4>
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className={th}>Run</th>
                  <th className={th}>Blk</th>
                  {r.factors.map((f) => (
                    <th key={f.letter} className="px-3 py-1 text-center font-medium text-gray-600">
                      {f.letter}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {r.rows.map((row) => (
                  <tr key={row.runOrder} className="border-b border-gray-200">
                    <td className={td}>{row.runOrder}</td>
                    <td className={td}>{row.block}</td>
                    {row.coded.map((c, i) => (
                      <td key={i} className={tdc}>
                        {sign(c)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-gray-600">
              {"\u2212"} is the low level, + the high level, 0 a center point.
              {r.randomized
                ? ` Run order was randomized within each block using base ${r.seedUsed}; the same base always reproduces this order.`
                : " Runs are in standard order, which is not a valid order for actually running the experiment."}
            </p>
          </section>

          <section className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <p className="font-semibold">
              The design has been stored in a new worksheet
            </p>
            <p className="mt-1">
              It holds StdOrder, RunOrder, CenterPt, Blocks and one column per
              factor, with the levels in your own units. Add a response column,
              fill it in following RunOrder, and analyse it from{" "}
              <span className="font-mono">Analyze Factorial Design</span>.
            </p>
          </section>

          <section className="space-y-1 text-xs text-gray-600">
            <p>
              {r.baseRuns} base run(s) {"\u00d7"} {r.replicates} replicate(s)
              {r.centerTotal > 0
                ? ` + ${r.centerTotal} center point(s)`
                : ""}{" "}
              = {r.totalRuns} run(s).
            </p>
            {!r.randomized && (
              <p className="text-amber-700">
                Runs are not randomized. Anything that drifts over time will be
                mistaken for a factor effect.
              </p>
            )}
          </section>
        </div>
      }
    />
  );
}

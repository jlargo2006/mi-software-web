// app/app/six-sigma/studies/capability/iddist/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ResultChart from "../../../components/ResultChart";
import {
  PERCENT_TICKS,
  benard,
  percentToZ,
  type FamilyFit,
} from "./families";
import type { IdDistResult } from "./types";

const fx = (v: number | null | undefined, dec = 3): string =>
  v === null || v === undefined || !Number.isFinite(v)
    ? "*"
    : v.toFixed(dec).replace(".", ",");

/** p-valor con los limites que imprime Minitab: "<0,005", ">0,250". */
const fp = (f: FamilyFit): string => {
  if (!f.ok) return "\u2014";
  if (f.adP === null) return "*";
  if (f.adBound === "lt") return `<${fx(f.adP, 3)}`;
  if (f.adBound === "gt") return `>${fx(f.adP, 3)}`;
  return fx(f.adP, 3);
};

const BLUE = "#1d4ed8";
const RED = "#b91c1c";

function Panel({ fit, values }: { fit: FamilyFit; values: number[] }) {
  if (!fit.ok) {
    return (
      <div>
        <h4 className="mb-1 text-center text-xs font-semibold text-gray-800">
          {fit.label}
        </h4>
        <div className="flex h-[230px] items-center justify-center rounded border border-gray-200 px-4 text-center text-xs text-gray-500">
          {fit.error}
        </div>
      </div>
    );
  }

  const n = values.length;
  // Los puntos se ordenan por su posicion en el eje, que no siempre coincide
  // con el orden de los datos originales: la transformacion de Johnson puede
  // no ser monotona en los extremos.
  const px = values.map(fit.plotX).sort((a, b) => a - b);
  const pts = px.map((v, i) => ({ x: v, p: benard(i + 1, n) }));

  const zOf = (p: number) => percentToZ(fit.kernel, p);

  // Recta o curva ajustada, y banda de confianza si la familia la admite.
  const ps: number[] = [];
  for (let i = 0; i < 200; i++) ps.push(0.0005 + (0.999 * i) / 199);

  const traces: Data[] = [];

  if (fit.band) {
    const lo = ps.map((p) => fit.band!(p)[0]);
    const hi = ps.map((p) => fit.band!(p)[1]);
    traces.push(
      {
        x: lo,
        y: ps.map(zOf),
        type: "scatter",
        mode: "lines",
        line: { color: RED, width: 0.9 },
        hoverinfo: "skip",
      } as unknown as Data,
      {
        x: hi,
        y: ps.map(zOf),
        type: "scatter",
        mode: "lines",
        line: { color: RED, width: 0.9 },
        hoverinfo: "skip",
      } as unknown as Data
    );
  }

  traces.push(
    {
      x: ps.map(fit.fitX),
      y: ps.map(zOf),
      type: "scatter",
      mode: "lines",
      line: { color: RED, width: 1.5 },
      hoverinfo: "skip",
    } as unknown as Data,
    {
      x: pts.map((q) => q.x),
      y: pts.map((q) => zOf(q.p)),
      type: "scatter",
      mode: "markers",
      marker: { color: BLUE, size: 4.5, opacity: 0.85 },
      hovertemplate: "%{x:.4g}<extra></extra>",
    } as unknown as Data
  );

  // El eje horizontal se acota a los datos: las bandas se abren mucho en los
  // extremos y, sin acotar, comprimirian la nube de puntos hasta hacerla
  // ilegible.
  const dLo = px[0];
  const dHi = px[px.length - 1];
  let range: [number, number];
  if (fit.logAxis) {
    const lo = Math.log10(Math.max(dLo, 1e-6));
    const hi = Math.log10(dHi);
    const pad = (hi - lo) * 0.18 || 1;
    range = [lo - pad, hi + pad];
  } else {
    const pad = (dHi - dLo) * 0.12 || 1;
    range = [dLo - pad, dHi + pad];
  }

  const layout: Partial<Layout> = {
    plot_bgcolor: "#ffffff",
    showlegend: false,
    hovermode: "closest",
    modebar: { orientation: "v" },
    margin: { l: 46, r: 34, t: 8, b: fit.subNote ? 44 : 32 },
    xaxis: {
      type: fit.logAxis ? "log" : "linear",
      range,
      zeroline: false,
      tickfont: { size: 9 },
      title: fit.subNote
        ? { text: fit.subNote, font: { size: 9 } }
        : undefined,
    },
    yaxis: {
      title: { text: "Percent", font: { size: 10 } },
      tickvals: PERCENT_TICKS.map((t) => percentToZ(fit.kernel, t)),
      ticktext: PERCENT_TICKS.map((t) =>
        String(t).replace(".", ",")
      ),
      range: [
        percentToZ(fit.kernel, 0.04),
        percentToZ(fit.kernel, 99.96),
      ],
      zeroline: false,
      tickfont: { size: 9 },
    },
  };

  return (
    <div>
      <h4 className="mb-1 text-center text-xs font-semibold text-gray-800">
        {fit.label} {"\u2014"} 95% CI
      </h4>
      <div className="rounded border border-gray-200" style={{ height: 230 }}>
        <ResultChart data={traces} layout={{ autosize: true, ...layout }} />
      </div>
    </div>
  );
}

export default function IdDistResults({ result }: { result: IdDistResult }) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Select a column."}
      </div>
    );
  }

  const r = result;
  const d = r.desc;
  const warnings = r.fits.filter((f) => f.ok && f.warning);

  return (
    <div className="w-full space-y-5">
      <h3 className="text-center text-sm font-semibold text-gray-800">
        Distribution Identification for {r.colName}
      </h3>

      {/* --- Descriptiva --- */}
      <div>
        <p className="mb-1 text-xs font-semibold text-gray-800">
          Descriptive Statistics
        </p>
        <div className="overflow-x-auto rounded border border-gray-200">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                {["N", "N*", "Mean", "StDev", "Median", "Minimum", "Maximum", "Skewness", "Kurtosis"].map(
                  (h) => (
                    <th key={h} className="px-3 py-1 text-right font-medium">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              <tr className="font-mono">
                <td className="px-3 py-1 text-right">{d.n}</td>
                <td className="px-3 py-1 text-right">{d.nMissing}</td>
                <td className="px-3 py-1 text-right">{fx(d.mean, 4)}</td>
                <td className="px-3 py-1 text-right">{fx(d.sd, 4)}</td>
                <td className="px-3 py-1 text-right">{fx(d.median, 4)}</td>
                <td className="px-3 py-1 text-right">{fx(d.min, 6)}</td>
                <td className="px-3 py-1 text-right">{fx(d.max, 3)}</td>
                <td className="px-3 py-1 text-right">{fx(d.skewness, 5)}</td>
                <td className="px-3 py-1 text-right">{fx(d.kurtosis, 5)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {r.boxcoxLambda !== null && (
          <p className="mt-1 font-mono text-xs text-gray-700">
            Box-Cox transformation: {"\u03BB"} = {fx(r.boxcoxLambda, 6)}
          </p>
        )}
        {r.johnsonText && (
          <p className="mt-0.5 font-mono text-xs text-gray-700">
            Johnson transformation function: {r.johnsonText}
          </p>
        )}
      </div>

      {/* --- Paneles de probabilidad --- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {r.fits.map((f) => (
          <Panel key={f.id} fit={f} values={r.values} />
        ))}
      </div>

      {/* --- Bondad de ajuste --- */}
      <div>
        <p className="mb-1 text-xs font-semibold text-gray-800">
          Goodness of Fit Test
        </p>
        <div className="overflow-x-auto rounded border border-gray-200">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-1 text-left font-medium">Distribution</th>
                <th className="px-3 py-1 text-right font-medium">AD</th>
                <th className="px-3 py-1 text-right font-medium">P</th>
                <th className="px-3 py-1 text-right font-medium">LRT P</th>
              </tr>
            </thead>
            <tbody>
              {r.fits.map((f) => (
                <tr
                  key={f.id}
                  className={
                    r.best && f.id === r.best.id
                      ? "bg-emerald-50 font-semibold"
                      : "border-t border-gray-100"
                  }
                >
                  <td className="px-3 py-1">
                    {f.label}
                    {f.scaleAdjusted && "*"}
                  </td>
                  <td className="px-3 py-1 text-right font-mono">
                    {f.ok ? fx(f.ad, 3) : "\u2014"}
                  </td>
                  <td className="px-3 py-1 text-right font-mono">{fp(f)}</td>
                  <td className="px-3 py-1 text-right font-mono">
                    {f.lrtP === null ? "" : fx(f.lrtP, 3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          A lower AD is a closer fit. <code>*</code> in the P column means no
          reliable published table exists for that family, so no p-value is
          quoted. <code>*</code> next to a name marks a scale reported as an
          adjusted ML estimate.
        </p>
      </div>

      {/* --- Estimaciones ML --- */}
      <div>
        <p className="mb-1 text-xs font-semibold text-gray-800">
          ML Estimates of Distribution Parameters
        </p>
        <div className="overflow-x-auto rounded border border-gray-200">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-1 text-left font-medium">Distribution</th>
                <th className="px-3 py-1 text-right font-medium">Location</th>
                <th className="px-3 py-1 text-right font-medium">Shape</th>
                <th className="px-3 py-1 text-right font-medium">Scale</th>
                <th className="px-3 py-1 text-right font-medium">Threshold</th>
              </tr>
            </thead>
            <tbody>
              {r.fits.map((f) => (
                <tr key={f.id} className="border-t border-gray-100">
                  <td className="px-3 py-1">
                    {f.label}
                    {f.scaleAdjusted && "*"}
                  </td>
                  <td className="px-3 py-1 text-right font-mono">
                    {f.location === null ? "" : fx(f.location, 5)}
                  </td>
                  <td className="px-3 py-1 text-right font-mono">
                    {f.shape === null ? "" : fx(f.shape, 5)}
                  </td>
                  <td className="px-3 py-1 text-right font-mono">
                    {f.scale === null ? "" : fx(f.scale, 5)}
                  </td>
                  <td className="px-3 py-1 text-right font-mono">
                    {f.threshold === null ? "" : fx(f.threshold, 5)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Lectura --- */}
      {r.best && (
        <div className="rounded-md border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-semibold">
            Closest fit: {r.best.label}, AD = {fx(r.best.ad, 3)}
          </p>
          <p className="mt-1">
            A smaller AD is not an instruction. Two things override it. First,
            the physics: if the quantity is a time to failure, the Weibull family
            has a mechanism behind it that a marginally better logistic does not.
            Second, parsimony: a three-parameter model almost always beats its
            two-parameter parent, and the LRT P column is there to say whether
            the improvement is worth the extra parameter {"\u2014"} a large value
            means it is not.
          </p>
        </div>
      )}

      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <p className="font-semibold">Sixteen tests on one sample</p>
        <p className="mt-1">
          Every p-value here is computed on the same data. Run sixteen tests and
          the largest p is biased upward: the winner looks better than it is.
          Use this panel to <em>eliminate</em> families that clearly fail, not to
          crown one on a hairline difference. The probability plot is the better
          judge {"\u2014"} look at the tails, which is where capability lives.
        </p>
      </div>

      {warnings.length > 0 && (
        <div className="rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-xs text-gray-700 space-y-1">
          <p className="text-sm font-semibold">Notes on individual fits</p>
          {warnings.map((f) => (
            <p key={f.id}>
              <strong>{f.label}.</strong> {f.warning}
            </p>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">
        {d.n} observations. Plotting positions by Benard median ranks,{" "}
        {"("}i {"\u2212"} 0,3{")"} / {"("}n + 0,4{")"}. Confidence bands are
        pointwise at 95 % and are omitted for the gamma, which is not a
        location-scale family.
        {d.nMissing > 0 && <> {d.nMissing} non-numeric value(s) skipped.</>}
      </p>
    </div>
  );
}

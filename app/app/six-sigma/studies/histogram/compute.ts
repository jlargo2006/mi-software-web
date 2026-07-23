// app/app/six-sigma/studies/histogram/compute.ts
import type { ColumnSnapshot } from "../types";
import type { HistogramParams, HistogramResult, HistogramSeries } from "./types";
import { niceBins, fixedBins } from "../../lib/binning";
import { normPdf } from "../../lib/distributions";

export function computeHistogram(
  data: ColumnSnapshot,
  params: HistogramParams
): HistogramResult {
  const series: HistogramSeries[] = [];

  for (const name of params.cols) {
    const col = data[name];
    if (!col) continue;

    const values = col.values
      .map((v) => Number(v))
      .filter((v) => Number.isFinite(v));

    if (values.length === 0) continue;

    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance =
      n > 1
        ? values.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1)
        : 0;
    const stDev = Math.sqrt(variance);

    const bins =
      params.binMode === "fixed"
        ? fixedBins(values, Math.max(1, params.nBins))
        : niceBins(values);

    // curva normal escalada a cuentas (solo si fit)
    const curveX: number[] = [];
    const curveY: number[] = [];
    if (params.fit && stDev > 0) {
      const steps = 200;
      const lo = bins.start;
      const hi = bins.end;
      for (let i = 0; i <= steps; i++) {
        const xv = lo + ((hi - lo) * i) / steps;
        const z = (xv - mean) / stDev;
        curveX.push(xv);
        curveY.push((normPdf(z) / stDev) * n * bins.size);
      }
    }

    series.push({
      name,
      values,
      n,
      mean,
      stDev,
      bins: { start: bins.start, end: bins.end, size: bins.size },
      curveX,
      curveY,
    });
  }

  return { series, groups: params.groups, fit: params.fit };
}

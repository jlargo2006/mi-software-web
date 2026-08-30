// app/app/six-sigma/studies/control/cchart/compute.ts
import type { ColumnSnapshot } from "../../types";
// Mismo motor de tests que el resto de cartas. En atributos solo existen los
// cuatro primeros: del 5 al 8 leen zonas sigma que presuponen simetria, y la
// Poisson es asimetrica salvo con una media alta.
import { runTests } from "../imr/tests";
import type { CChartParams, CChartResult, Stage, Violation } from "./types";

const fail = (error: string): CChartResult => ({ ok: false, error });

const parseNum = (s: string): number | null => {
  const t = s.trim().replace(",", ".");
  if (t === "") return null;
  const v = Number(t);
  return Number.isFinite(v) ? v : null;
};

function parseOmit(s: string, k: number): number[] {
  const out = new Set<number>();
  for (const tok of s.split(/[\s,;]+/)) {
    if (tok === "") continue;
    const m = tok.match(/^(\d+):(\d+)$/);
    if (m) {
      const a = Number(m[1]);
      const b = Number(m[2]);
      for (let i = Math.min(a, b); i <= Math.max(a, b); i++)
        if (i >= 1 && i <= k) out.add(i);
    } else {
      const v = Number(tok);
      if (Number.isInteger(v) && v >= 1 && v <= k) out.add(v);
    }
  }
  return [...out].sort((a, b) => a - b);
}

export function computeCChart(
  data: ColumnSnapshot,
  params: CChartParams
): CChartResult {
  const notes: string[] = [];

  const nm = params.col?.trim() ?? "";
  if (nm === "") return fail("Select the column of defect counts.");
  const col = data[nm];
  if (!col) return fail(`Column "${nm}" does not exist.`);

  // --- Lectura ----------------------------------------------------------
  const c: number[] = [];
  const rowOf: number[] = [];
  let skipped = 0;

  const cells = (col.values ?? []).map((x) => String(x ?? "").trim());
  for (let i = 0; i < cells.length; i++) {
    const t = cells[i];
    // Una celda vacia es final de hoja, no un subgrupo con cero defectos: un
    // cero real hay que escribirlo.
    if (t === "") continue;
    const v = Number(t.replace(",", "."));
    if (!Number.isFinite(v)) {
      skipped += 1;
      continue;
    }
    if (v < 0) return fail(`Subgroup ${i + 1} has a negative count of defects.`);
    if (!Number.isInteger(v))
      return fail(
        `Subgroup ${i + 1} has a non-integer count. A C chart counts whole defects; if the amount inspected varies, use a U chart.`
      );
    c.push(v);
    rowOf.push(i);
  }

  if (skipped > 0)
    notes.push(`${skipped} non-numeric value(s) skipped.`);

  const k = c.length;
  if (k < 2)
    return fail("At least two subgroups are needed to draw control limits.");

  // --- Etapas -----------------------------------------------------------
  const stageOf: number[] = new Array(k).fill(0);
  const stageLabels: string[] = [];
  const sName = params.stageCol?.trim() ?? "";
  if (sName !== "") {
    const sCol = data[sName];
    if (!sCol) return fail(`Stage column "${sName}" does not exist.`);
    const sCells = (sCol.values ?? []).map((x) => String(x ?? "").trim());
    let cur = -1;
    let prev: string | null = null;
    for (let i = 0; i < k; i++) {
      const raw = sCells[rowOf[i]] ?? "";
      const v = raw === "" ? "\u2014" : raw;
      if (v !== prev) {
        cur += 1;
        stageLabels.push(v);
        prev = v;
      }
      stageOf[i] = cur;
    }
  } else {
    stageLabels.push("");
  }

  const omitted = parseOmit(params.omit, k);
  const omitSet = new Set(omitted);
  const histC = parseNum(params.histC);
  if (histC !== null && !(histC > 0))
    return fail("The historical mean must be greater than zero.");
  const usedHistorical = histC !== null;

  // --- Estimacion por etapa --------------------------------------------
  const stages: Stage[] = [];
  for (let s = 0; s < stageLabels.length; s++) {
    const idx: number[] = [];
    for (let i = 0; i < k; i++) if (stageOf[i] === s) idx.push(i);
    const keep = idx.filter((i) => !omitSet.has(i + 1));
    if (keep.length < 1)
      return fail(
        `Stage "${stageLabels[s] || "1"}" has no usable subgroups after omissions.`
      );

    const totalC = keep.reduce((t, i) => t + c[i], 0);
    const cBar = histC !== null ? histC : totalC / keep.length;

    stages.push({
      label: stageLabels[s],
      from: idx[0],
      to: idx[idx.length - 1],
      cBar,
      // Toda la carta C esta en esta linea: en una Poisson la varianza es
      // igual a la media, asi que la sigma es la raiz de la propia media. No
      // hay nada mas que estimar.
      sigma: Math.sqrt(cBar),
      kUsed: keep.length,
      totalC,
    });
  }

  if (stages.every((s) => s.cBar <= 0))
    return fail(
      "No defects were found in any subgroup, so there is nothing to chart."
    );

  // --- Limites ----------------------------------------------------------
  const loB = parseNum(params.lowerBound);
  const upB = parseNum(params.upperBound);

  const cl: number[] = [];
  const ucl: number[] = [];
  const lcl: number[] = [];
  const clippedLow: boolean[] = [];
  const sigma: number[] = [];

  for (let i = 0; i < k; i++) {
    const st = stages[stageOf[i]];
    sigma.push(st.sigma);
    cl.push(st.cBar);

    let up = st.cBar + 3 * st.sigma;
    let lo = st.cBar - 3 * st.sigma;
    // Un conteo no puede ser negativo. Por arriba no hay recorte: el numero
    // de defectos no esta acotado.
    const cLow = lo < 0;
    if (cLow) lo = 0;
    if (loB !== null) lo = Math.max(lo, loB);
    if (upB !== null) up = Math.min(up, upB);

    ucl.push(up);
    lcl.push(lo);
    clippedLow.push(cLow);
  }

  // --- Tests ------------------------------------------------------------
  const on4 =
    params.testMode === "all"
      ? [true, true, true, true]
      : params.testMode === "one"
      ? [true, false, false, false]
      : params.testsOn.slice(0, 4);
  const on = [...on4, false, false, false, false];

  const kArr4 = params.testK.map((s, i) => {
    const v = parseNum(s);
    const dflt = [3, 9, 6, 14][i];
    return v === null || !(v > 0) ? dflt : v;
  });
  const kArr = [...kArr4, 2, 4, 15, 8];

  const violations: Violation[] = runTests({
    values: c,
    center: cl,
    sigma,
    stageOf,
    on,
    k: kArr,
    allowed: [1, 2, 3, 4],
  });

  const flagged = [...new Set(violations.flatMap((v) => v.points))].sort(
    (a, b) => a - b
  );

  // --- Diagnostico de sobredispersion ------------------------------------
  let dispersion = 1;
  if (k >= 3) {
    const z = c.map((v, i) => (sigma[i] > 0 ? (v - cl[i]) / sigma[i] : 0));
    let tot = 0;
    for (let i = 1; i < k; i++) tot += Math.abs(z[i] - z[i - 1]);
    dispersion = tot / (k - 1) / 1.128;
  }

  return {
    ok: true,
    colName: col.name ?? nm,
    k,
    c,
    cl,
    ucl,
    lcl,
    clippedLow,
    stages,
    stageOf,
    violations,
    flagged,
    dispersion,
    usedHistorical,
    omitted,
    notes,
  };
}

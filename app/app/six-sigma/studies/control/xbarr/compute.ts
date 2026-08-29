// app/app/six-sigma/studies/control/xbarr/compute.ts
import type { ColumnSnapshot } from "../../types";
import { toNumericCells } from "../../../lib/stats";
// Los ocho tests son los mismos que en la carta I-MR: el mismo motor sirve
// aqui, con la sigma de cada punto pasada por separado. No se duplica.
import { runTests } from "../imr/tests";
import { c4, d2, d3 } from "./constants";
import type {
  Stage,
  Subgroup,
  Violation,
  XbarRParams,
  XbarRResult,
} from "./types";

const fail = (error: string): XbarRResult => ({ ok: false, error });

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

function optimalLambda(x: number[]): number {
  const n = x.length;
  const sumLog = x.reduce((s, v) => s + Math.log(v), 0);
  const negLL = (lam: number) => {
    const y =
      Math.abs(lam) < 1e-10
        ? x.map(Math.log)
        : x.map((v) => (Math.pow(v, lam) - 1) / lam);
    const m = y.reduce((s, v) => s + v, 0) / n;
    const s2 = y.reduce((s, v) => s + (v - m) ** 2, 0) / n;
    if (!(s2 > 0)) return 1e300;
    return (n / 2) * Math.log(s2) - (lam - 1) * sumLog;
  };
  const phi = (Math.sqrt(5) - 1) / 2;
  let a = -5;
  let b = 5;
  let c = b - phi * (b - a);
  let d = a + phi * (b - a);
  let fc = negLL(c);
  let fd = negLL(d);
  for (let i = 0; i < 200; i++) {
    if (fc < fd) {
      b = d; d = c; fd = fc; c = b - phi * (b - a); fc = negLL(c);
    } else {
      a = c; c = d; fc = fd; d = a + phi * (b - a); fd = negLL(d);
    }
    if (Math.abs(b - a) < 1e-10) break;
  }
  return (a + b) / 2;
}

/** Forma potencia simple, W = Y^lambda, la que rotula Minitab. */
const applyBoxCox = (v: number, lam: number): number =>
  Math.abs(lam) < 1e-10 ? Math.log(v) : Math.pow(v, lam);

export function computeXbarR(
  data: ColumnSnapshot,
  params: XbarRParams
): XbarRResult {
  const notes: string[] = [];

  // --- Lectura de los subgrupos ----------------------------------------
  let rawGroups: number[][] = [];
  let title = "";
  let nMissing = 0;

  if (params.layout === "rows") {
    const names = params.cols.filter((c) => c && c.trim() !== "");
    if (names.length < 2)
      return fail(
        "Select at least two columns: with subgroups across rows, each column is one position within the subgroup."
      );
    const cols = names.map((nm) => data[nm]);
    const missing = names.filter((nm, i) => !cols[i]);
    if (missing.length > 0)
      return fail(`Column "${missing[0]}" does not exist.`);

    const rows = Math.max(...cols.map((c) => (c!.values ?? []).length));
    for (let r = 0; r < rows; r++) {
      const g: number[] = [];
      for (const c of cols) {
        const cell = (c!.values ?? [])[r];
        const txt = String(cell ?? "").trim();
        if (txt === "") continue;
        const v = Number(txt.replace(",", "."));
        if (Number.isFinite(v)) g.push(v);
        else nMissing += 1;
      }
      // Una fila sin ningun dato es final de hoja, no un subgrupo vacio.
      if (g.length > 0) rawGroups.push(g);
    }
    title =
      names.length <= 3
        ? names.join("; ")
        : `${names[0]}; \u2026; ${names[names.length - 1]}`;
  } else {
    const nm = params.col?.trim() ?? "";
    if (nm === "") return fail("Select the measurement column.");
    const col = data[nm];
    if (!col) return fail(`Column "${nm}" does not exist.`);
    const cells = col.values ?? [];
    const vals = toNumericCells(cells);
    nMissing = cells.filter((c) => String(c ?? "").trim() !== "").length - vals.length;
    title = col.name ?? nm;

    if (params.sizeMode === "number") {
      const sz = Math.round(parseNum(params.size) ?? 0);
      if (!(sz >= 2))
        return fail(
          "Subgroup size must be at least 2. For single measurements use the I-MR chart."
        );
      for (let i = 0; i + sz <= vals.length; i += sz)
        rawGroups.push(vals.slice(i, i + sz));
      const left = vals.length % sz;
      if (left > 0)
        notes.push(
          `${left} trailing observation(s) do not complete a subgroup and were dropped.`
        );
    } else {
      const idName = params.idCol?.trim() ?? "";
      if (idName === "") return fail("Select the subgroup ID column.");
      const idc = data[idName];
      if (!idc) return fail(`Column "${idName}" does not exist.`);
      const ids = (idc.values ?? []).map((c) => String(c ?? "").trim());
      // Un subgrupo nuevo empieza cuando cambia el identificador: si un mismo
      // id reaparece mas tarde es otro subgrupo, no el mismo interrumpido.
      let prev: string | null = null;
      for (let i = 0; i < vals.length && i < ids.length; i++) {
        if (ids[i] !== prev) {
          rawGroups.push([]);
          prev = ids[i];
        }
        rawGroups[rawGroups.length - 1].push(vals[i]);
      }
    }
  }

  rawGroups = rawGroups.filter((g) => g.length > 0);
  if (rawGroups.length < 2)
    return fail("At least two subgroups are needed to draw control limits.");

  const singles = rawGroups.filter((g) => g.length < 2).length;
  if (singles > 0) {
    return fail(
      `${singles} subgroup(s) contain a single observation, which has no range. Remove them or use the I-MR chart.`
    );
  }
  const tooBig = rawGroups.find((g) => g.length > 25);
  if (tooBig)
    return fail(
      "Subgroups larger than 25 are not supported by the range chart. Above that size the range loses efficiency and an Xbar-S chart is the right tool."
    );

  // --- Box-Cox ----------------------------------------------------------
  let lambda: number | null = null;
  if (params.boxcox !== "none") {
    const flat = rawGroups.flat();
    if (flat.some((v) => v <= 0))
      return fail(
        "A Box-Cox transformation needs strictly positive data; the selection contains zero or negative values."
      );
    if (params.boxcox === "ln") lambda = 0;
    else if (params.boxcox === "sqrt") lambda = 0.5;
    else if (params.boxcox === "optimal") lambda = optimalLambda(flat);
    else {
      const v = parseNum(params.boxcoxLambda);
      if (v === null || v < -5 || v > 5)
        return fail("Enter a Box-Cox \u03BB between \u22125 and 5.");
      lambda = v;
    }
  }

  const groups =
    lambda === null
      ? rawGroups
      : rawGroups.map((g) => g.map((v) => applyBoxCox(v, lambda!)));

  const k = groups.length;

  // --- Etapas -----------------------------------------------------------
  const stageOf: number[] = new Array(k).fill(0);
  const stageLabels: string[] = [];
  const sName = params.stageCol?.trim() ?? "";
  if (sName !== "") {
    const sCol = data[sName];
    if (!sCol) return fail(`Stage column "${sName}" does not exist.`);
    const cells = (sCol.values ?? []).map((c) => String(c ?? "").trim());
    if (cells.length < k)
      return fail(
        "The stage column has fewer rows than there are subgroups. With subgroups in rows it needs one value per row."
      );
    let cur = -1;
    let prev: string | null = null;
    for (let i = 0; i < k; i++) {
      const v = cells[i] === "" ? "\u2014" : cells[i];
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

  // --- Estadisticos por subgrupo ---------------------------------------
  const subgroups: Subgroup[] = groups.map((g, i) => {
    const n = g.length;
    const mean = g.reduce((s, v) => s + v, 0) / n;
    const sd = Math.sqrt(g.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1));
    return {
      values: g,
      n,
      mean,
      range: Math.max(...g) - Math.min(...g),
      sd,
      stage: stageOf[i],
    };
  });

  const sizes = new Set(subgroups.map((s) => s.n));
  const commonN = sizes.size === 1 ? subgroups[0].n : null;
  if (commonN === null)
    notes.push(
      "Subgroup sizes vary, so the control limits step with each subgroup."
    );

  const omitted = parseOmit(params.omit, k);
  const omitSet = new Set(omitted);

  const histMean = parseNum(params.histMean);
  const histSigma = parseNum(params.histSigma);
  const usedHistorical = histMean !== null || histSigma !== null;

  // --- Estimacion por etapa --------------------------------------------
  const stages: Stage[] = [];
  for (let s = 0; s < stageLabels.length; s++) {
    const idx: number[] = [];
    for (let i = 0; i < k; i++) if (stageOf[i] === s) idx.push(i);
    const keep = idx.filter((i) => !omitSet.has(i + 1));
    if (keep.length < 2)
      return fail(
        `Stage "${stageLabels[s] || "1"}" has fewer than two usable subgroups after omissions.`
      );

    // Media global ponderada por el tamano de cada subgrupo: con tamanos
    // desiguales, la media de las medias daria el mismo peso a un subgrupo
    // de dos que a uno de diez.
    const totN = keep.reduce((t, i) => t + subgroups[i].n, 0);
    const center =
      histMean !== null
        ? histMean
        : keep.reduce((t, i) => t + subgroups[i].mean * subgroups[i].n, 0) / totN;

    let sigma: number;
    if (histSigma !== null) {
      sigma = histSigma;
    } else if (params.sigmaMethod === "pooled") {
      const num = keep.reduce(
        (t, i) => t + (subgroups[i].n - 1) * subgroups[i].sd ** 2,
        0
      );
      const den = keep.reduce((t, i) => t + (subgroups[i].n - 1), 0);
      const sp = Math.sqrt(num / den);
      // La raiz de la varianza combinada es sesgada por abajo; c4 lo corrige.
      sigma = params.unbias ? sp / c4(den + 1) : sp;
    } else {
      // Con tamanos iguales esto es exactamente Rbar/d2. Con tamanos
      // desiguales cada rango se divide por el d2 que le corresponde antes
      // de promediar, porque d2 depende de n.
      sigma =
        keep.reduce((t, i) => t + subgroups[i].range / d2(subgroups[i].n), 0) /
        keep.length;
    }

    if (!(sigma > 0))
      return fail(
        "The estimated standard deviation is zero: every subgroup has identical values, so there is no variation to chart."
      );

    stages.push({
      label: stageLabels[s],
      from: idx[0],
      to: idx[idx.length - 1],
      center,
      sigma,
      kUsed: keep.length,
    });
  }

  // --- Limites punto a punto -------------------------------------------
  const xLoB = parseNum(params.xLowerBound);
  const xUpB = parseNum(params.xUpperBound);
  const rUpB = parseNum(params.rUpperBound);

  const xCL: number[] = [];
  const xUCL: number[] = [];
  const xLCL: number[] = [];
  const rCL: number[] = [];
  const rUCL: number[] = [];
  const rLCL: number[] = [];

  for (let i = 0; i < k; i++) {
    const st = stages[stageOf[i]];
    const n = subgroups[i].n;
    const se = st.sigma / Math.sqrt(n);

    xCL.push(st.center);
    let u = st.center + 3 * se;
    let l = st.center - 3 * se;
    if (xUpB !== null) u = Math.min(u, xUpB);
    if (xLoB !== null) l = Math.max(l, xLoB);
    xUCL.push(u);
    xLCL.push(l);

    const rc = d2(n) * st.sigma;
    let ru = rc + 3 * d3(n) * st.sigma;
    if (rUpB !== null) ru = Math.min(ru, rUpB);
    rCL.push(rc);
    rUCL.push(ru);
    rLCL.push(Math.max(0, rc - 3 * d3(n) * st.sigma));
  }

  // --- Tests ------------------------------------------------------------
  const on =
    params.testMode === "all"
      ? new Array(8).fill(true)
      : params.testMode === "one"
      ? [true, false, false, false, false, false, false, false]
      : params.testsOn.slice(0, 8);

  const kArr = params.testK.map((s, i) => {
    const v = parseNum(s);
    const dflt = [3, 9, 6, 14, 2, 4, 15, 8][i];
    return v === null || !(v > 0) ? dflt : v;
  });

  const xbar = subgroups.map((s) => s.mean);
  const ranges = subgroups.map((s) => s.range);

  const xSigma = subgroups.map(
    (s, i) => stages[stageOf[i]].sigma / Math.sqrt(s.n)
  );
  const rSigma = subgroups.map((s, i) => d3(s.n) * stages[stageOf[i]].sigma);

  const xViolations: Violation[] = runTests({
    values: xbar,
    center: xCL,
    sigma: xSigma,
    stageOf,
    on,
    k: kArr,
    allowed: [1, 2, 3, 4, 5, 6, 7, 8],
  });

  // Igual que en la I-MR: la distribucion del rango es asimetrica, asi que
  // los tests de zonas solo se aplican a la carta de medias.
  const rViolations: Violation[] = runTests({
    values: ranges,
    center: rCL,
    sigma: rSigma,
    stageOf,
    on,
    k: kArr,
    allowed: [1, 2, 3, 4],
  });

  const flat = (vs: Violation[]) =>
    [...new Set(vs.flatMap((v) => v.points))].sort((a, b) => a - b);

  const rBar = ranges.reduce((t, v) => t + v, 0) / k;

  return {
    ok: true,
    title,
    k,
    commonN,
    nMissing,
    subgroups,
    stages,
    stageOf,
    xUCL,
    xLCL,
    xCL,
    rUCL,
    rLCL,
    rCL,
    xbar,
    ranges,
    xViolations,
    rViolations,
    xFlagged: flat(xViolations),
    rFlagged: flat(rViolations),
    rBar,
    lambda,
    usedHistorical,
    omitted,
    notes,
  };
}

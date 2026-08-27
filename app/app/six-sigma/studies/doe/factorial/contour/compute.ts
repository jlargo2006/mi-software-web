// app/app/six-sigma/studies/doe/factorial/contour/compute.ts
import type { ColumnSnapshot } from "../../../types";
import {
  GRID_N,
  MAX_CONTOUR_FACTORS,
  MIN_CONTOUR_FACTORS,
  type ContourTerm,
  type DoeContourParams,
  type DoeContourResult,
  type HoldInfo,
} from "./types";

const cellNum = (c: number | string | null | undefined): number => {
  if (typeof c === "number") return c;
  if (typeof c !== "string") return NaN;
  const t = c.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

const cellText = (c: number | string | null | undefined): string =>
  c === null || c === undefined ? "" : String(c).trim();

const fail = (error: string): DoeContourResult => ({ ok: false, error });

/** Terminos hasta el orden k en orden estandar, igual que en el cubo. */
function contourTerms(names: string[]): { key: string; members: number[]; order: number }[] {
  const k = names.length;
  const out: { key: string; members: number[]; order: number }[] = [];
  const combos = (start: number, pick: number, acc: number[]) => {
    if (acc.length === pick) {
      out.push({ key: acc.map((i) => names[i]).join("*"), members: [...acc], order: pick });
      return;
    }
    for (let i = start; i < k; i++) combos(i + 1, pick, [...acc, i]);
  };
  // Se para en orden 3: por encima de eso el modelo no es interpretable en un
  // contorno, y la lista de casillas se vuelve inmanejable.
  for (let o = 1; o <= Math.min(k, 3); o++) combos(0, o, []);
  return out;
}

export function contourParents(members: number[], names: string[]): string[] {
  const out: string[] = [];
  const sub = (start: number, acc: number[]) => {
    if (acc.length > 0 && acc.length < members.length) {
      out.push(acc.map((i) => names[i]).join("*"));
    }
    for (let i = start; i < members.length; i++) sub(i + 1, [...acc, members[i]]);
  };
  sub(0, []);
  return out;
}

function solveOls(X: number[][], y: number[]): number[] | null {
  const p = X.length;
  const n = y.length;
  const A: number[][] = Array.from({ length: p }, () => new Array(p + 1).fill(0));
  for (let a = 0; a < p; a++) {
    for (let b = 0; b < p; b++) {
      let s = 0;
      for (let i = 0; i < n; i++) s += X[a][i] * X[b][i];
      A[a][b] = s;
    }
    let s = 0;
    for (let i = 0; i < n; i++) s += X[a][i] * y[i];
    A[a][p] = s;
  }
  for (let c = 0; c < p; c++) {
    let piv = c;
    for (let r = c + 1; r < p; r++) {
      if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
    }
    if (Math.abs(A[piv][c]) < 1e-10) return null;
    [A[c], A[piv]] = [A[piv], A[c]];
    for (let r = 0; r < p; r++) {
      if (r === c) continue;
      const f = A[r][c] / A[c][c];
      if (f === 0) continue;
      for (let cc = c; cc <= p; cc++) A[r][cc] -= f * A[c][cc];
    }
  }
  return A.map((row, i) => row[p] / A[i][i]);
}

/** Paso "bonito" para los contornos automaticos: 1, 2 o 5 por decada. */
function niceStep(span: number, target: number): number {
  if (!(span > 0)) return 1;
  const raw = span / target;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const mult = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return mult * mag;
}

export function computeDoeContour(
  data: ColumnSnapshot,
  params: DoeContourParams
): DoeContourResult {
  const resp = params.response.trim();
  if (resp === "") return fail("Select the response.");

  const facs = params.factors.filter((s) => s.trim() !== "" && s !== resp);
  if (facs.length < MIN_CONTOUR_FACTORS) {
    return fail("Select at least two factors: a contour plot needs two axes.");
  }
  if (facs.length > MAX_CONTOUR_FACTORS) {
    return fail(
      `Too many factors (${facs.length}). The limit is ${MAX_CONTOUR_FACTORS}.`
    );
  }

  const xf = params.xFactor.trim();
  const yf = params.yFactor.trim();
  if (xf === "" || yf === "") return fail("Choose the factor for each axis.");
  if (xf === yf) return fail("The two axes must use different factors.");
  const xIndex = facs.indexOf(xf);
  const yIndex = facs.indexOf(yf);
  if (xIndex < 0 || yIndex < 0) {
    return fail("The axis factors must be among the factors of the model.");
  }

  const yCol = data[resp];
  if (!yCol) return fail(`Column "${resp}" does not exist.`);
  for (const nm of facs) if (!data[nm]) return fail(`Column "${nm}" does not exist.`);

  const k = facs.length;

  // --- Filas utilizables ----------------------------------------------------
  const len = Math.max(
    yCol.values.length,
    ...facs.map((nm) => data[nm].values.length)
  );
  const yv: number[] = [];
  const xs: number[][] = facs.map(() => []);
  let nMissing = 0;

  for (let i = 0; i < len; i++) {
    const r = cellNum(yCol.values[i]);
    const vals = facs.map((nm) => cellNum(data[nm].values[i]));
    const allBlank =
      cellText(yCol.values[i]) === "" &&
      facs.every((nm) => cellText(data[nm].values[i]) === "");
    if (allBlank) continue;
    if (!Number.isFinite(r) || vals.some((v) => !Number.isFinite(v))) {
      nMissing++;
      continue;
    }
    yv.push(r);
    vals.forEach((v, j) => xs[j].push(v));
  }
  if (yv.length < 4) {
    return fail(
      "Not enough complete numeric runs. A contour plot needs numeric factors: " +
        "a text factor has no axis to draw."
    );
  }

  // --- Niveles: dos extremos, mas centro opcional ---------------------------
  const bounds: [number, number][] = [];
  for (let j = 0; j < k; j++) {
    const uniq = [...new Set(xs[j])].sort((a, b) => a - b);
    if (uniq.length < 2) return fail(`Factor "${facs[j]}" has a single level.`);
    if (uniq.length === 2) {
      bounds.push([uniq[0], uniq[1]]);
      continue;
    }
    if (uniq.length === 3) {
      const centre = (uniq[0] + uniq[2]) / 2;
      if (Math.abs(uniq[1] - centre) > 1e-9 * Math.max(1, Math.abs(centre))) {
        return fail(
          `Factor "${facs[j]}" has three levels and the middle one is not centred. ` +
            `A contour plot from a factorial fit needs a two-level design.`
        );
      }
      bounds.push([uniq[0], uniq[2]]);
      continue;
    }
    return fail(
      `Factor "${facs[j]}" has ${uniq.length} levels. Two are needed, plus an ` +
        `optional centre point.`
    );
  }

  const mid = (j: number) => (bounds[j][0] + bounds[j][1]) / 2;
  const half = (j: number) => (bounds[j][1] - bounds[j][0]) / 2;
  const coded = (j: number, v: number) => (v - mid(j)) / half(j);

  // --- Esquinas y centro ----------------------------------------------------
  const cornerY: number[] = [];
  const cornerCoded: number[][] = [];
  const centerY: number[] = [];
  for (let i = 0; i < yv.length; i++) {
    const c: number[] = [];
    let corner = true;
    for (let j = 0; j < k; j++) {
      const v = xs[j][i];
      if (v === bounds[j][0]) c.push(-1);
      else if (v === bounds[j][1]) c.push(1);
      else {
        corner = false;
        break;
      }
    }
    if (corner) {
      cornerY.push(yv[i]);
      cornerCoded.push(c);
    } else centerY.push(yv[i]);
  }
  const n = cornerY.length;
  if (n < 4) return fail("Not enough corner runs to fit the surface.");
  const centerN = centerY.length;
  const centerMean =
    centerN > 0 ? centerY.reduce((a, b) => a + b, 0) / centerN : null;

  // --- Modelo ---------------------------------------------------------------
  const excluded = new Set(params.excluded);
  const all = contourTerms(facs);
  const active = all.filter((t) => !excluded.has(t.key));
  if (active.length === 0) return fail("Every term has been removed from the model.");

  const activeKeys = new Set(active.map((t) => t.key));
  for (const t of active) {
    const missing = contourParents(t.members, facs).filter((p) => !activeKeys.has(p));
    if (missing.length > 0) {
      return fail(
        `The model is not hierarchical: "${t.key}" is in, but ${missing
          .map((m) => `"${m}"`)
          .join(", ")} ${missing.length === 1 ? "is" : "are"} out.`
      );
    }
  }

  const X: number[][] = [
    new Array(n).fill(1),
    ...active.map((t) => cornerCoded.map((c) => t.members.reduce((a, m) => a * c[m], 1))),
  ];
  const sol = solveOls(X, cornerY);
  if (sol === null) {
    return fail(
      "The surface could not be fitted: the design does not support these terms."
    );
  }
  const constant = sol[0];
  const coefs = sol.slice(1);

  const terms: ContourTerm[] = all.map((t) => {
    const ai = active.findIndex((a) => a.key === t.key);
    return {
      key: t.key,
      members: t.members,
      order: t.order,
      coef: ai >= 0 ? coefs[ai] : NaN,
      included: ai >= 0,
    };
  });

  // --- Valores fijos de los factores que no van a los ejes ------------------
  // Por omision, el centro del rango: es el punto sobre el que menos se
  // extrapola, y con centrales es donde de verdad hay datos.
  const holds: HoldInfo[] = [];
  const holdCoded: number[] = new Array(k).fill(0);
  for (let j = 0; j < k; j++) {
    if (j === xIndex || j === yIndex) continue;
    const raw = params.holds[facs[j]];
    const v = Number.isFinite(raw) ? (raw as number) : mid(j);
    holdCoded[j] = coded(j, v);
    holds.push({
      factor: facs[j],
      value: v,
      outside: v < bounds[j][0] - 1e-9 || v > bounds[j][1] + 1e-9,
    });
  }

  // --- Rejilla --------------------------------------------------------------
  const lin = (lo: number, hi: number) =>
    Array.from({ length: GRID_N }, (_, i) => lo + ((hi - lo) * i) / (GRID_N - 1));
  const xGrid = lin(bounds[xIndex][0], bounds[xIndex][1]);
  const yGrid = lin(bounds[yIndex][0], bounds[yIndex][1]);

  const predict = (xv: number, yvv: number): number => {
    const c = [...holdCoded];
    c[xIndex] = coded(xIndex, xv);
    c[yIndex] = coded(yIndex, yvv);
    return active.reduce(
      (acc, t, ti) => acc + coefs[ti] * t.members.reduce((a, m) => a * c[m], 1),
      constant
    );
  };

  const z: number[][] = yGrid.map((yy) => xGrid.map((xx) => predict(xx, yy)));
  let zLo = Infinity;
  let zHi = -Infinity;
  for (const row of z) {
    for (const v of row) {
      if (v < zLo) zLo = v;
      if (v > zHi) zHi = v;
    }
  }

  // --- Contornos ------------------------------------------------------------
  let levels: number[] = [];
  const unreachable: number[] = [];
  if (params.useSpec) {
    const lo = params.specLow;
    const hi = params.specHigh;
    if (lo === null && hi === null) {
      return fail("Give a lower limit, an upper limit, or both.");
    }
    if (lo !== null && hi !== null && lo >= hi) {
      return fail("The lower limit must be below the upper limit.");
    }
    for (const v of [lo, hi]) {
      if (v === null) continue;
      levels.push(v);
      // La superficie es continua: si el nivel no esta entre el minimo y el
      // maximo del recuadro, la linea no existe y no hay nada que dibujar.
      if (v < zLo || v > zHi) unreachable.push(v);
    }
  } else {
    const step = niceStep(zHi - zLo, 6);
    const start = Math.ceil(zLo / step) * step;
    for (let v = start; v <= zHi + 1e-9; v += step) {
      levels.push(Number(v.toFixed(10)));
    }
    if (levels.length === 0) levels = [(zLo + zHi) / 2];
  }

  const probes = [
    { x: xGrid[0], y: yGrid[0], label: "low / low" },
    { x: xGrid[GRID_N - 1], y: yGrid[0], label: "high / low" },
    { x: xGrid[0], y: yGrid[GRID_N - 1], label: "low / high" },
    { x: xGrid[GRID_N - 1], y: yGrid[GRID_N - 1], label: "high / high" },
    { x: mid(xIndex), y: mid(yIndex), label: "centre" },
  ].map((p) => ({ ...p, z: predict(p.x, p.y) }));

  return {
    ok: true,
    response: resp,
    factors: facs,
    bounds,
    xFactor: xf,
    yFactor: yf,
    xIndex,
    yIndex,
    xGrid,
    yGrid,
    z,
    zRange: [zLo, zHi],
    terms,
    constant,
    holds,
    levels,
    useSpec: params.useSpec,
    specLow: params.specLow,
    specHigh: params.specHigh,
    unreachable,
    filled: params.filled,
    probes,
    reduced: active.length < all.length,
    n,
    nMissing,
    centerMean,
    centerN,
  };
}

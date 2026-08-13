// app/app/six-sigma/studies/improve/boxcox/compute.ts
import type { ColumnSnapshot } from "../../types";
import {
  bcStdDev,
  bcTransform,
  boxCoxFit,
  chi2Crit1,
} from "../../../lib/boxcox";
import {
  ROUND_GRID,
  type BoxCoxPoint,
  type ImpBoxCoxParams,
  type ImpBoxCoxResult,
} from "./types";

const cellNum = (c: number | string | null | undefined): number => {
  if (typeof c === "number") return c;
  if (typeof c !== "string") return NaN;
  const t = c.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

const cellText = (c: number | string | null | undefined): string =>
  c === null || c === undefined ? "" : String(c).trim();

const num = (s: string): number => {
  const t = s.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

const fail = (error: string): ImpBoxCoxResult => ({ ok: false, error });

const skewness = (v: number[]): number => {
  const n = v.length;
  if (n < 3) return NaN;
  const m = v.reduce((a, b) => a + b, 0) / n;
  const s2 = v.reduce((a, t) => a + (t - m) * (t - m), 0) / n;
  if (!(s2 > 0)) return NaN;
  const m3 = v.reduce((a, t) => a + Math.pow(t - m, 3), 0) / n;
  return m3 / Math.pow(s2, 1.5);
};

const sdOf = (v: number[]): number => {
  const n = v.length;
  if (n < 2) return NaN;
  const m = v.reduce((a, b) => a + b, 0) / n;
  return Math.sqrt(v.reduce((a, t) => a + (t - m) * (t - m), 0) / (n - 1));
};

export function computeImpBoxCox(
  data: ColumnSnapshot,
  params: ImpBoxCoxParams
): ImpBoxCoxResult {
  const col = params.column ? data[params.column] : undefined;
  if (!col) return fail("Select the column to transform.");

  const confLevel = num(params.confidenceLevel);
  if (!(confLevel > 0 && confLevel < 100)) {
    return fail("The confidence level must be between 0 and 100.");
  }

  // --- 1. Datos ------------------------------------------------------------
  const raw: number[] = [];
  const rowIdx: number[] = [];
  let nMissing = 0;
  for (let i = 0; i < col.values.length; i++) {
    const v = cellNum(col.values[i]);
    if (!Number.isFinite(v)) {
      if (cellText(col.values[i]) !== "") nMissing++;
      continue;
    }
    raw.push(v);
    rowIdx.push(i);
  }
  if (raw.length < 3) {
    return fail("At least three numeric observations are required.");
  }
  // La transformacion pasa por logaritmos y potencias fraccionarias: los
  // valores han de ser estrictamente positivos.
  if (raw.some((v) => v <= 0)) {
    return fail(
      "All values must be strictly positive. Add a constant to the column first."
    );
  }

  // --- 2. Subgrupos --------------------------------------------------------
  const sgText = params.subgroupSize.trim();
  const groups: number[][] = [];
  let subgroupSize: number | null = null;
  let subgroupColumn: string | null = null;

  if (sgText === "" || sgText === "1") {
    subgroupSize = 1;
    // Un solo grupo con todo: la variabilidad es la global.
    groups.push(raw.map((_, i) => i));
  } else if (data[sgText]) {
    // Columna de subgrupos: valores iguales consecutivos forman un subgrupo.
    subgroupColumn = sgText;
    const lab = data[sgText].values;
    let cur: number[] = [];
    let prev: string | null = null;
    for (let k = 0; k < raw.length; k++) {
      const t = cellText(lab[rowIdx[k]]);
      if (prev !== null && t !== prev && cur.length) {
        groups.push(cur);
        cur = [];
      }
      cur.push(k);
      prev = t;
    }
    if (cur.length) groups.push(cur);
  } else {
    const m = num(sgText);
    if (!Number.isFinite(m) || m < 1 || !Number.isInteger(m)) {
      return fail(
        "The subgroup size must be a positive whole number or a column name."
      );
    }
    subgroupSize = m;
    for (let k = 0; k < raw.length; k += m) {
      groups.push(
        Array.from(
          { length: Math.min(m, raw.length - k) },
          (_, j) => k + j
        )
      );
    }
  }

  let df = 0;
  for (const g of groups) if (g.length >= 2) df += g.length - 1;
  if (df < 2) {
    return fail(
      "Subgroups have no internal variability: use a larger subgroup size."
    );
  }

  // --- 3. Ajuste -----------------------------------------------------------
  const chi2 = chi2Crit1(confLevel);
  const fit = boxCoxFit(raw, groups, chi2);
  if (!fit) return fail("Lambda cannot be estimated from these data.");

  // Valor conveniente mas proximo, que es el que Minitab aplica.
  let rounded = ROUND_GRID[0];
  for (const g of ROUND_GRID) {
    if (Math.abs(g - fit.lambdaHat) < Math.abs(rounded - fit.lambdaHat)) {
      rounded = g;
    }
  }

  // --- 4. Lambda aplicado --------------------------------------------------
  let lambdaUsed = rounded;
  let usedRounded = true;
  if (params.lambdaMode === "other") {
    const l = num(params.otherLambda);
    if (!Number.isFinite(l) || l < -5 || l > 5) {
      return fail("Lambda must be a value between -5 and 5.");
    }
    lambdaUsed = l;
    usedRounded = false;
  }

  // --- 5. Columna de destino -----------------------------------------------
  const store = params.storeColumn.trim();
  if (store === "") {
    return fail("Select an empty column to store the transformed values.");
  }
  if (store === params.column) {
    return fail("The storage column must be different from the source column.");
  }
  const target = data[store];
  if (!target) return fail(`Column "${store}" does not exist.`);
  if (target.values.some((c) => cellText(c) !== "")) {
    return fail(`Column "${store}" is not empty.`);
  }

  // --- 6. Curva ------------------------------------------------------------
  // Se muestra el tramo en que la desviacion no pasa de cuatro veces el
  // minimo: mas alla la curva sube tanto que aplasta la zona de interes.
  const logGm = raw.reduce((a, v) => a + Math.log(v), 0) / raw.length;
  const curve: BoxCoxPoint[] = [];
  const cap = fit.sdMin * 4;
  for (let l = -5; l <= 5.0000001; l += 0.02) {
    const s = bcStdDev(raw, groups, l, logGm);
    if (Number.isFinite(s) && s <= cap) curve.push({ lambda: l, sd: s });
  }

  const transformed = raw.map((v) => bcTransform(v, lambdaUsed));

  return {
    ok: true,
    title: params.column,
    n: raw.length,
    nMissing,
    nSubgroups: groups.length,
    subgroupSize,
    subgroupColumn,
    confLevel,
    lambdaHat: fit.lambdaHat,
    sdMin: fit.sdMin,
    lowerCL: fit.lowerCL,
    upperCL: fit.upperCL,
    sdLimit: fit.sdLimit,
    roundedLambda: rounded,
    lambdaUsed,
    usedRounded,
    curve,
    original: raw,
    transformed,
    storeColumn: store,
    skewBefore: skewness(raw),
    skewAfter: skewness(transformed),
    sdBefore: sdOf(raw),
    sdAfter: sdOf(transformed),
  };
}

// app/app/six-sigma/studies/doe/factorial/cube/compute.ts
import type { ColumnSnapshot } from "../../../types";
import {
  MAX_CUBE_FACTORS,
  MIN_CUBE_FACTORS,
  type CubeTerm,
  type CubeVertex,
  type DoeCubeParams,
  type DoeCubeResult,
} from "./types";

const cellNum = (c: number | string | null | undefined): number => {
  if (typeof c === "number") return c;
  if (typeof c !== "string") return NaN;
  const t = c.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

const cellText = (c: number | string | null | undefined): string =>
  c === null || c === undefined ? "" : String(c).trim();

const fail = (error: string): DoeCubeResult => ({ ok: false, error });

const levelLabel = (raw: string): string => {
  const v = cellNum(raw);
  return Number.isFinite(v) ? String(v).replace(".", ",") : raw;
};

/**
 * Todos los terminos hasta el orden k, en orden estandar: primero los efectos
 * principales, luego las interacciones dobles y por ultimo la triple. Es el
 * mismo orden que usa Analyze, para que las dos pantallas se lean igual.
 */
function cubeTerms(names: string[]): { key: string; members: number[]; order: number }[] {
  const k = names.length;
  const out: { key: string; members: number[]; order: number }[] = [];
  const combos = (start: number, pick: number, acc: number[]) => {
    if (acc.length === pick) {
      out.push({
        key: acc.map((i) => names[i]).join("*"),
        members: [...acc],
        order: pick,
      });
      return;
    }
    for (let i = start; i < k; i++) combos(i + 1, pick, [...acc, i]);
  };
  for (let o = 1; o <= k; o++) combos(0, o, []);
  return out;
}

/** Terminos de orden inferior contenidos en otro: los padres jerarquicos. */
export function cubeParents(members: number[], names: string[]): string[] {
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

/**
 * Minimos cuadrados por ecuaciones normales con eliminacion gaussiana y pivoteo
 * parcial. Con ocho columnas como mucho la precision sobra, y evita arrastrar
 * aqui toda la maquinaria de multiregression, que resuelve un problema mayor
 * del que hay: no hacen falta ni VIF ni SS de tipo III para dibujar un cubo.
 */
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

export function computeDoeCube(
  data: ColumnSnapshot,
  params: DoeCubeParams
): DoeCubeResult {
  const resp = params.response.trim();
  if (resp === "") return fail("Select the response.");

  const facs = params.factors.filter((s) => s.trim() !== "" && s !== resp);
  if (facs.length < MIN_CUBE_FACTORS) {
    return fail("Select two or three factors: a cube has three edges at most.");
  }
  if (facs.length > MAX_CUBE_FACTORS) {
    return fail(
      `A cube plot takes ${MAX_CUBE_FACTORS} factors at most, and ${facs.length} ` +
        `were selected. With more, the corners overlap and nothing can be read. ` +
        `Drop factors, or use the interaction plot.`
    );
  }

  const yCol = data[resp];
  if (!yCol) return fail(`Column "${resp}" does not exist.`);
  for (const nm of facs) {
    if (!data[nm]) return fail(`Column "${nm}" does not exist.`);
  }

  const k = facs.length;

  // --- Filas utilizables ----------------------------------------------------
  const len = Math.max(
    yCol.values.length,
    ...facs.map((nm) => data[nm].values.length)
  );
  const y: number[] = [];
  const raw: string[][] = facs.map(() => []);
  let nMissing = 0;

  for (let i = 0; i < len; i++) {
    const yv = cellNum(yCol.values[i]);
    const texts = facs.map((nm) => cellText(data[nm].values[i]));
    const allBlank =
      cellText(yCol.values[i]) === "" && texts.every((t) => t === "");
    if (allBlank) continue;
    if (!Number.isFinite(yv) || texts.some((t) => t === "")) {
      nMissing++;
      continue;
    }
    y.push(yv);
    texts.forEach((t, j) => raw[j].push(t));
  }

  if (y.length < 4) return fail("Not enough complete runs to build a cube.");

  // --- Niveles: exactamente dos por factor ----------------------------------
  // Lo que no es ninguno de los dos extremos es punto central. No se busca la
  // columna CenterPt: un nivel intermedio es un punto central lo diga o no la
  // hoja, y asi el grafico tambien funciona con datos traidos de fuera.
  const levels: string[][] = [];
  for (let j = 0; j < k; j++) {
    const uniq = [...new Set(raw[j])];
    const allNum = uniq.every((s) => Number.isFinite(cellNum(s)));
    uniq.sort((a, b) =>
      allNum
        ? cellNum(a) - cellNum(b)
        : a.localeCompare(b, undefined, { numeric: true })
    );
    if (uniq.length < 2) {
      return fail(`Factor "${facs[j]}" has a single level.`);
    }
    if (uniq.length === 2) {
      levels.push(uniq);
      continue;
    }
    if (uniq.length === 3 && allNum) {
      // Tres niveles numericos: el central solo vale si esta en medio de los
      // otros dos. Si no lo esta no es un punto central, es otro diseno.
      const [lo, mid, hi] = uniq.map(cellNum);
      const centre = (lo + hi) / 2;
      if (Math.abs(mid - centre) > 1e-9 * Math.max(1, Math.abs(centre))) {
        return fail(
          `Factor "${facs[j]}" has three levels and the middle one is not ` +
            `centred between the other two. A cube plot needs a two-level design.`
        );
      }
      levels.push([uniq[0], uniq[2]]);
      continue;
    }
    return fail(
      `Factor "${facs[j]}" has ${uniq.length} levels. A cube plot needs two, ` +
        `plus an optional centre point.`
    );
  }

  // --- Reparto de corridas: esquinas y centro -------------------------------
  const cornerY: number[] = [];
  const cornerCode: number[][] = [];
  const centerY: number[] = [];

  for (let i = 0; i < y.length; i++) {
    const code: number[] = [];
    let isCorner = true;
    for (let j = 0; j < k; j++) {
      if (raw[j][i] === levels[j][0]) code.push(0);
      else if (raw[j][i] === levels[j][1]) code.push(1);
      else {
        isCorner = false;
        break;
      }
    }
    if (isCorner) {
      cornerY.push(y[i]);
      cornerCode.push(code);
    } else {
      centerY.push(y[i]);
    }
  }

  const n = cornerY.length;
  if (n < 4) {
    return fail("Not enough corner runs: every run sits away from the corners.");
  }

  const centerN = centerY.length;
  const centerMean =
    centerN > 0 ? centerY.reduce((a, b) => a + b, 0) / centerN : null;

  // --- Medias de celda ------------------------------------------------------
  const nv = 1 << k;
  const idxOf = (code: number[]) =>
    code.reduce((acc, b, j) => acc + (b << j), 0);
  const sums = new Array(nv).fill(0);
  const cnts = new Array(nv).fill(0);
  for (let i = 0; i < n; i++) {
    const ix = idxOf(cornerCode[i]);
    sums[ix] += cornerY[i];
    cnts[ix]++;
  }
  const dataMeans = sums.map((s, i) => (cnts[i] > 0 ? s / cnts[i] : null));

  // --- Modelo ---------------------------------------------------------------
  const excluded = new Set(params.excluded);
  const all = cubeTerms(facs);
  const active = params.fittedMeans
    ? all.filter((t) => !excluded.has(t.key))
    : [];

  // La jerarquia se comprueba igual que en Analyze: una interaccion sin su
  // efecto principal da coeficientes que dependen del origen de la escala.
  const activeKeys = new Set(active.map((t) => t.key));
  for (const t of active) {
    const missing = cubeParents(t.members, facs).filter((p) => !activeKeys.has(p));
    if (missing.length > 0) {
      return fail(
        `The model is not hierarchical: "${t.key}" is in, but ${missing
          .map((m) => `"${m}"`)
          .join(", ")} ${missing.length === 1 ? "is" : "are"} out. ` +
          `Put the lower-order term(s) back, or remove the interaction as well.`
      );
    }
  }

  const codedOf = (code: number[], members: number[]): number =>
    members.reduce((acc, m) => acc * (code[m] === 1 ? 1 : -1), 1);

  let constant: number;
  let coefs: number[] = [];
  let values: number[];

  if (!params.fittedMeans) {
    // Medias de datos: no hay nada que ajustar y las celdas vacias se quedan
    // vacias, porque no existe modelo que las rellene.
    constant = cornerY.reduce((a, b) => a + b, 0) / n;
    values = dataMeans.map((v) => (v === null ? NaN : v));
  } else {
    if (active.length === 0) {
      return fail("Every term has been removed from the model.");
    }
    const X: number[][] = [
      new Array(n).fill(1),
      ...active.map((t) => cornerCode.map((c) => codedOf(c, t.members))),
    ];
    const sol = solveOls(X, cornerY);
    if (sol === null) {
      return fail(
        "The model could not be fitted: the design does not support these terms. " +
          "Remove interactions, or add the missing corner runs."
      );
    }
    constant = sol[0];
    coefs = sol.slice(1);
    values = Array.from({ length: nv }, (_, ix) => {
      const code = Array.from({ length: k }, (_, j) => (ix >> j) & 1);
      return active.reduce(
        (acc, t, ti) => acc + coefs[ti] * codedOf(code, t.members),
        constant
      );
    });
  }

  const terms: CubeTerm[] = all.map((t) => {
    const ai = active.findIndex((a) => a.key === t.key);
    return {
      key: t.key,
      members: t.members,
      order: t.order,
      coef: ai >= 0 ? coefs[ai] : NaN,
      included: ai >= 0,
    };
  });

  const vertices: CubeVertex[] = Array.from({ length: nv }, (_, ix) => {
    const code = Array.from({ length: k }, (_, j) => (ix >> j) & 1);
    return {
      code,
      levels: code.map((b, j) => levelLabel(levels[j][b])),
      value: values[ix],
      dataMean: dataMeans[ix],
      n: cnts[ix],
    };
  });

  const emptyVertices = cnts.filter((c) => c === 0).length;
  if (emptyVertices === nv) {
    return fail("No corner of the cube has any run.");
  }

  const printed = vertices.map((v) => v.value).filter(Number.isFinite);
  if (centerMean !== null) printed.push(centerMean);
  const lo = Math.min(...printed);
  const hi = Math.max(...printed);

  return {
    ok: true,
    response: resp,
    factors: facs,
    levels: levels.map((ls) => ls.map(levelLabel)),
    vertices,
    terms,
    constant,
    fittedMeans: params.fittedMeans,
    reduced: params.fittedMeans && active.length < all.length,
    centerMean,
    centerN,
    n,
    nMissing,
    emptyVertices,
    valueRange: [lo, hi],
  };
}

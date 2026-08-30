// app/app/six-sigma/studies/control/laneyp/compute.ts
import type { ColumnSnapshot } from "../../types";
// Mismo motor de tests que el resto de cartas de atributos: solo los cuatro
// primeros. Los del 5 al 8 leen zonas sigma que presuponen simetria.
import { runTests } from "../imr/tests";
import type {
  LaneyPParams,
  LaneyPResult,
  Stage,
  Violation,
} from "./types";

const fail = (error: string): LaneyPResult => ({ ok: false, error });

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

export function computeLaneyP(
  data: ColumnSnapshot,
  params: LaneyPParams
): LaneyPResult {
  const notes: string[] = [];

  const nm = params.col?.trim() ?? "";
  if (nm === "") return fail("Select the column of defectives.");
  const col = data[nm];
  if (!col) return fail(`Column "${nm}" does not exist.`);

  const dCells = (col.values ?? []).map((c) => String(c ?? "").trim());

  // --- Tamanos de subgrupo ---------------------------------------------
  let sizeAt: (i: number) => string;
  if (params.sizeMode === "number") {
    const sz = parseNum(params.size);
    if (sz === null || !(sz >= 1) || !Number.isInteger(sz))
      return fail("Subgroup size must be a positive whole number.");
    sizeAt = () => String(sz);
  } else {
    const sn = params.sizeCol?.trim() ?? "";
    if (sn === "")
      return fail("Select the column containing the subgroup sizes.");
    const sc = data[sn];
    if (!sc) return fail(`Column "${sn}" does not exist.`);
    const cells = (sc.values ?? []).map((c) => String(c ?? "").trim());
    sizeAt = (i) => cells[i] ?? "";
  }

  // --- Lectura pareada --------------------------------------------------
  const d: number[] = [];
  const n: number[] = [];
  const rowOf: number[] = [];
  let skipped = 0;

  for (let i = 0; i < dCells.length; i++) {
    const dt = dCells[i];
    const st = sizeAt(i);
    if (dt === "" && st === "") continue;
    const dv = Number(dt.replace(",", "."));
    const sv = Number(st.replace(",", "."));
    if (!Number.isFinite(dv) || !Number.isFinite(sv) || sv <= 0) {
      skipped += 1;
      continue;
    }
    if (dv < 0)
      return fail(`Subgroup ${i + 1} has a negative count of defectives.`);
    if (dv > sv)
      return fail(
        `Subgroup ${i + 1} has ${dv} defectives out of ${sv} units. A count of defective units cannot exceed the sample size \u2014 if a unit can carry several defects, the right chart is a Laney U\u2032.`
      );
    if (!Number.isInteger(dv) || !Number.isInteger(sv))
      return fail(
        `Subgroup ${i + 1} has a non-integer count or size. A P\u2032 chart counts whole units.`
      );
    d.push(dv);
    n.push(sv);
    rowOf.push(i);
  }

  if (skipped > 0)
    notes.push(
      `${skipped} row(s) skipped for a missing or invalid count or size.`
    );

  const k = d.length;
  // Se necesitan tres para que el rango movil de los z tenga al menos dos
  // valores: con dos subgrupos habria un solo rango y Sigma Z no seria
  // estimable con ningun sentido.
  if (k < 3)
    return fail(
      "At least three subgroups are needed: Sigma Z comes from the moving ranges of the standardised points."
    );

  const sizes = new Set(n);
  const commonN = sizes.size === 1 ? n[0] : null;
  const minN = Math.min(...n);
  const maxN = Math.max(...n);
  if (commonN === null)
    notes.push(
      `Subgroup sizes range from ${minN} to ${maxN}, so the control limits step with each subgroup.`
    );

  // --- Etapas -----------------------------------------------------------
  const stageOf: number[] = new Array(k).fill(0);
  const stageLabels: string[] = [];
  const sName = params.stageCol?.trim() ?? "";
  if (sName !== "") {
    const sCol = data[sName];
    if (!sCol) return fail(`Stage column "${sName}" does not exist.`);
    const cells = (sCol.values ?? []).map((c) => String(c ?? "").trim());
    let cur = -1;
    let prev: string | null = null;
    for (let i = 0; i < k; i++) {
      const raw = cells[rowOf[i]] ?? "";
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

  const p = d.map((v, i) => v / n[i]);

  const omitted = parseOmit(params.omit, k);
  const omitSet = new Set(omitted);
  const histP = parseNum(params.histP);
  if (histP !== null && (histP <= 0 || histP >= 1))
    return fail("The historical proportion must lie strictly between 0 and 1.");
  const usedHistorical = histP !== null;

  // ---------------------------------------------------------------------
  //  Paso 1: la carta P de siempre. Proporcion central y sigma binomial.
  // ---------------------------------------------------------------------
  const pBarOf: number[] = new Array(k).fill(0);
  const stages: Stage[] = [];

  for (let s = 0; s < stageLabels.length; s++) {
    const idx: number[] = [];
    for (let i = 0; i < k; i++) if (stageOf[i] === s) idx.push(i);
    const keep = idx.filter((i) => !omitSet.has(i + 1));
    if (keep.length < 2)
      return fail(
        `Stage "${stageLabels[s] || "1"}" needs at least two usable subgroups after omissions.`
      );

    const totalN = keep.reduce((t, i) => t + n[i], 0);
    const totalD = keep.reduce((t, i) => t + d[i], 0);
    const pBar = histP !== null ? histP : totalD / totalN;

    for (const i of idx) pBarOf[i] = pBar;

    stages.push({
      label: stageLabels[s],
      from: idx[0],
      to: idx[idx.length - 1],
      pBar,
      sigmaZ: 1,
      kUsed: keep.length,
      totalN,
      totalD,
    });
  }

  if (stages.every((s) => s.pBar <= 0))
    return fail(
      "No defectives were found in any subgroup, so there is nothing to chart."
    );
  if (stages.every((s) => s.pBar >= 1))
    return fail("Every unit is defective, so there is nothing to chart.");

  // Sigma binomial de cada subgrupo: es el tamano de paso de los limites.
  const sigmaP = p.map((_, i) => {
    const pb = pBarOf[i];
    return Math.sqrt((pb * (1 - pb)) / n[i]);
  });

  // ---------------------------------------------------------------------
  //  Paso 2: estandarizar y medir cuanto se dispersan de verdad los puntos.
  // ---------------------------------------------------------------------
  const z = p.map((v, i) => (sigmaP[i] > 0 ? (v - pBarOf[i]) / sigmaP[i] : 0));

  for (let s = 0; s < stages.length; s++) {
    const idx: number[] = [];
    for (let i = 0; i < k; i++) if (stageOf[i] === s) idx.push(i);

    // Sigma Z se estima con el rango movil medio de los z, dividido por d2 de
    // n = 2. Es la misma cuenta que la sigma de corto plazo de una I-MR: mide
    // la variacion entre puntos consecutivos, que no arrastra los cambios de
    // nivel de largo plazo.
    //
    // Los rangos moviles se calculan sobre los subgrupos CONSECUTIVOS, sin
    // excluir los omitidos: un rango movil exige adyacencia real, y saltarse
    // un punto crearia un salto artificial que infla la dispersion y ensancha
    // los limites, justo lo contrario de lo que se busca al omitir un punto
    // anomalo. Tampoco se cruza la frontera de etapa.
    let tot = 0;
    let cnt = 0;
    for (let j = 1; j < idx.length; j++) {
      tot += Math.abs(z[idx[j]] - z[idx[j - 1]]);
      cnt += 1;
    }
    // 1,128 es d2 para n = 2.
    const sz = cnt > 0 ? tot / cnt / 1.128 : 1;
    // Si los puntos se dispersan MENOS de lo que la binomial permite, no se
    // estrechan los limites: Laney define la correccion como una ampliacion.
    // Por debajo de 1 la carta P\u2032 coincide con la P.
    stages[s].sigmaZ = sz > 1 ? sz : 1;
    if (sz < 1)
      notes.push(
        `Sigma Z came out ${sz.toFixed(4).replace(".", ",")}, below 1, so it was held at 1: the P\u2032 chart never narrows the ordinary P limits, it only widens them.`
      );
  }

  // ---------------------------------------------------------------------
  //  Paso 3: limites de la P multiplicados por Sigma Z.
  // ---------------------------------------------------------------------
  const loB = parseNum(params.lowerBound);
  const upB = parseNum(params.upperBound);

  const cl: number[] = [];
  const ucl: number[] = [];
  const lcl: number[] = [];
  const clippedLow: boolean[] = [];
  const clippedHigh: boolean[] = [];
  const sigmaEff: number[] = [];

  for (let i = 0; i < k; i++) {
    const st = stages[stageOf[i]];
    // Toda la carta esta en esta linea: la sigma binomial escalada por Sigma Z.
    const se = sigmaP[i] * st.sigmaZ;
    sigmaEff.push(se);
    cl.push(st.pBar);

    let u = st.pBar + 3 * se;
    let l = st.pBar - 3 * se;
    // Una proporcion vive entre 0 y 1.
    const cLow = l < 0;
    const cHigh = u > 1;
    if (cLow) l = 0;
    if (cHigh) u = 1;
    if (loB !== null) l = Math.max(l, loB);
    if (upB !== null) u = Math.min(u, upB);

    ucl.push(u);
    lcl.push(l);
    clippedLow.push(cLow);
    clippedHigh.push(cHigh);
  }

  if (clippedLow.some((v) => v))
    notes.push(
      "The lower limit is zero in at least one subgroup: with this rate and sample size the chart cannot detect an improvement there."
    );

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
    values: p,
    center: cl,
    sigma: sigmaEff,
    stageOf,
    on,
    k: kArr,
    allowed: [1, 2, 3, 4],
  });

  const flagged = [...new Set(violations.flatMap((v) => v.points))].sort(
    (a, b) => a - b
  );

  const minNP = Math.min(
    ...n.map((v, i) => Math.min(v * pBarOf[i], v * (1 - pBarOf[i])))
  );

  return {
    ok: true,
    colName: col.name ?? nm,
    k,
    commonN,
    minN,
    maxN,
    p,
    d,
    n,
    z,
    cl,
    ucl,
    lcl,
    clippedLow,
    clippedHigh,
    stages,
    stageOf,
    violations,
    flagged,
    sigmaZ: stages[0].sigmaZ,
    minNP,
    usedHistorical,
    omitted,
    notes,
  };
}

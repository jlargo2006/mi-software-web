// app/app/six-sigma/studies/control/laneyu/compute.ts
import type { ColumnSnapshot } from "../../types";
// Mismo motor de tests que el resto de cartas de atributos: solo los cuatro
// primeros. Los del 5 al 8 leen zonas sigma que presuponen simetria.
import { runTests } from "../imr/tests";
import type {
  LaneyUParams,
  LaneyUResult,
  Stage,
  Violation,
} from "./types";

const fail = (error: string): LaneyUResult => ({ ok: false, error });

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

export function computeLaneyU(
  data: ColumnSnapshot,
  params: LaneyUParams
): LaneyUResult {
  const notes: string[] = [];

  const nm = params.col?.trim() ?? "";
  if (nm === "") return fail("Select the column of defect counts.");
  const col = data[nm];
  if (!col) return fail(`Column "${nm}" does not exist.`);

  const cCells = (col.values ?? []).map((x) => String(x ?? "").trim());

  // --- Tamanos de subgrupo ---------------------------------------------
  let sizeAt: (i: number) => string;
  if (params.sizeMode === "number") {
    const sz = parseNum(params.size);
    // El tamano puede ser fraccionario: es un numero de unidades de
    // inspeccion (2,5 metros de cable, 0,7 turnos), no un recuento de piezas.
    if (sz === null || !(sz > 0))
      return fail("Subgroup size must be a positive number of inspection units.");
    sizeAt = () => String(sz);
  } else {
    const sn = params.sizeCol?.trim() ?? "";
    if (sn === "")
      return fail("Select the column containing the subgroup sizes.");
    const sc = data[sn];
    if (!sc) return fail(`Column "${sn}" does not exist.`);
    const cells = (sc.values ?? []).map((x) => String(x ?? "").trim());
    sizeAt = (i) => cells[i] ?? "";
  }

  // --- Lectura pareada --------------------------------------------------
  const c: number[] = [];
  const n: number[] = [];
  const rowOf: number[] = [];
  let skipped = 0;

  for (let i = 0; i < cCells.length; i++) {
    const ct = cCells[i];
    const st = sizeAt(i);
    if (ct === "" && st === "") continue;
    const cv = Number(ct.replace(",", "."));
    const sv = Number(st.replace(",", "."));
    if (!Number.isFinite(cv) || !Number.isFinite(sv) || !(sv > 0)) {
      skipped += 1;
      continue;
    }
    if (cv < 0) return fail(`Subgroup ${i + 1} has a negative count of defects.`);
    // Igual que en la carta U, no se comprueba que el conteo no exceda el
    // tamano: un defecto no es una unidad defectuosa, y una misma unidad puede
    // llevar varios.
    if (!Number.isInteger(cv))
      return fail(
        `Subgroup ${i + 1} has a non-integer count of defects. Defects are counted whole; the size, not the count, is what may be fractional.`
      );
    c.push(cv);
    n.push(sv);
    rowOf.push(i);
  }

  if (skipped > 0)
    notes.push(`${skipped} row(s) skipped for a missing or invalid count or size.`);

  const k = c.length;
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
      `Inspection units range from ${minN} to ${maxN}, so the control limits step with each subgroup.`
    );

  // --- Etapas -----------------------------------------------------------
  const stageOf: number[] = new Array(k).fill(0);
  const stageLabels: string[] = [];
  const sName = params.stageCol?.trim() ?? "";
  if (sName !== "") {
    const sCol = data[sName];
    if (!sCol) return fail(`Stage column "${sName}" does not exist.`);
    const cells = (sCol.values ?? []).map((x) => String(x ?? "").trim());
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

  const u = c.map((v, i) => v / n[i]);

  const omitted = parseOmit(params.omit, k);
  const omitSet = new Set(omitted);
  const histU = parseNum(params.histU);
  if (histU !== null && !(histU > 0))
    return fail("The historical rate must be greater than zero.");
  const usedHistorical = histU !== null;

  // ---------------------------------------------------------------------
  //  Paso 1: la carta U de siempre. Tasa central y sigma de Poisson.
  // ---------------------------------------------------------------------
  const uBarOf: number[] = new Array(k).fill(0);
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
    const totalC = keep.reduce((t, i) => t + c[i], 0);
    // La linea central es la tasa agregada, no la media de las tasas: cada
    // unidad inspeccionada debe pesar igual.
    const uBar = histU !== null ? histU : totalC / totalN;

    for (const i of idx) uBarOf[i] = uBar;

    stages.push({
      label: stageLabels[s],
      from: idx[0],
      to: idx[idx.length - 1],
      uBar,
      sigmaZ: 1,
      kUsed: keep.length,
      totalN,
      totalC,
    });
  }

  if (stages.every((s) => s.uBar <= 0))
    return fail(
      "No defects were found in any subgroup, so there is no rate to chart."
    );

  // Sigma de Poisson de cada subgrupo: raiz(ubar / n). Sin el factor (1 - p)
  // de la binomial, porque un conteo de defectos no tiene techo.
  const sigmaU = u.map((_, i) => Math.sqrt(uBarOf[i] / n[i]));

  // ---------------------------------------------------------------------
  //  Paso 2: estandarizar y medir cuanto se dispersan de verdad los puntos.
  // ---------------------------------------------------------------------
  const z = u.map((v, i) => (sigmaU[i] > 0 ? (v - uBarOf[i]) / sigmaU[i] : 0));

  for (let s = 0; s < stages.length; s++) {
    const idx: number[] = [];
    for (let i = 0; i < k; i++) if (stageOf[i] === s) idx.push(i);

    // Sigma Z se estima con el rango movil medio de los z, dividido por d2 de
    // n = 2. Es la misma cuenta que la sigma de corto plazo de una I-MR: mide
    // la variacion entre puntos consecutivos, que no arrastra los cambios de
    // nivel de largo plazo. Usar la desviacion tipica global de los z seria un
    // error, porque incluiria las senales que la carta debe detectar.
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
    // Si los puntos se dispersan MENOS de lo que Poisson permite, no se
    // estrechan los limites: Laney define la correccion como una ampliacion.
    // Por debajo de 1 la carta U\u2032 coincide con la U.
    stages[s].sigmaZ = sz > 1 ? sz : 1;
    if (sz < 1)
      notes.push(
        `Sigma Z came out ${sz.toFixed(4).replace(".", ",")}, below 1, so it was held at 1: the U\u2032 chart never narrows the ordinary U limits, it only widens them.`
      );
  }

  // ---------------------------------------------------------------------
  //  Paso 3: limites de la U multiplicados por Sigma Z.
  // ---------------------------------------------------------------------
  const loB = parseNum(params.lowerBound);
  const upB = parseNum(params.upperBound);

  const cl: number[] = [];
  const ucl: number[] = [];
  const lcl: number[] = [];
  const clippedLow: boolean[] = [];
  const sigmaEff: number[] = [];

  for (let i = 0; i < k; i++) {
    const st = stages[stageOf[i]];
    // Toda la carta esta en esta linea: la sigma de Poisson escalada por
    // Sigma Z.
    const se = sigmaU[i] * st.sigmaZ;
    sigmaEff.push(se);
    cl.push(st.uBar);

    let up = st.uBar + 3 * se;
    let lo = st.uBar - 3 * se;
    // Una tasa no puede ser negativa. Por arriba no hay recorte: a diferencia
    // de una proporcion, un conteo de defectos no tiene techo.
    const cLow = lo < 0;
    if (cLow) lo = 0;
    if (loB !== null) lo = Math.max(lo, loB);
    if (upB !== null) up = Math.min(up, upB);

    ucl.push(up);
    lcl.push(lo);
    clippedLow.push(cLow);
  }

  if (clippedLow.some((v) => v))
    notes.push(
      "The lower limit is zero in at least one subgroup: with this rate and inspection size the chart cannot detect an improvement there."
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
    values: u,
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

  const minExpected = Math.min(...n.map((v, i) => v * uBarOf[i]));

  return {
    ok: true,
    colName: col.name ?? nm,
    k,
    commonN,
    minN,
    maxN,
    u,
    c,
    n,
    z,
    cl,
    ucl,
    lcl,
    clippedLow,
    stages,
    stageOf,
    violations,
    flagged,
    sigmaZ: stages[0].sigmaZ,
    minExpected,
    usedHistorical,
    omitted,
    notes,
  };
}

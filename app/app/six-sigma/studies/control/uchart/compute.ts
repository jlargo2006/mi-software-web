// app/app/six-sigma/studies/control/uchart/compute.ts
import type { ColumnSnapshot } from "../../types";
// Mismo motor de tests que el resto de cartas. En atributos solo existen los
// cuatro primeros: del 5 al 8 leen zonas sigma que presuponen simetria, y la
// Poisson es asimetrica salvo con una tasa esperada alta.
import { runTests } from "../imr/tests";
import type { Stage, UChartParams, UChartResult, Violation } from "./types";

const fail = (error: string): UChartResult => ({ ok: false, error });

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

export function computeUChart(
  data: ColumnSnapshot,
  params: UChartParams
): UChartResult {
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
    // Una fila sin conteo ni tamano es final de hoja, no un subgrupo.
    if (ct === "" && st === "") continue;
    const cv = Number(ct.replace(",", "."));
    const sv = Number(st.replace(",", "."));
    if (!Number.isFinite(cv) || !Number.isFinite(sv) || !(sv > 0)) {
      skipped += 1;
      continue;
    }
    if (cv < 0) return fail(`Subgroup ${i + 1} has a negative count of defects.`);
    // Aqui NO se comprueba que el conteo no exceda el tamano: un defecto no
    // es una unidad defectuosa, y una misma unidad puede llevar varios. Esa
    // es justamente la diferencia con las cartas P y NP.
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
  if (k < 2)
    return fail("At least two subgroups are needed to draw control limits.");

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

    const totalN = keep.reduce((t, i) => t + n[i], 0);
    const totalC = keep.reduce((t, i) => t + c[i], 0);
    // La linea central es la tasa agregada, no la media de las tasas: cada
    // unidad inspeccionada debe pesar igual, y con tamanos desiguales
    // promediar las tasas daria el mismo peso a un subgrupo de 1 unidad que a
    // uno de 20.
    const uBar = histU !== null ? histU : totalC / totalN;

    stages.push({
      label: stageLabels[s],
      from: idx[0],
      to: idx[idx.length - 1],
      uBar,
      kUsed: keep.length,
      totalN,
      totalC,
    });
  }

  if (stages.every((s) => s.uBar <= 0))
    return fail(
      "No defects were found in any subgroup, so there is no rate to chart."
    );

  // --- Limites ----------------------------------------------------------
  const loB = parseNum(params.lowerBound);
  const upB = parseNum(params.upperBound);

  let effN: number[] = n;
  if (params.unequalMode === "assume" && commonN === null) {
    const a = parseNum(params.assumeSize);
    if (a === null || !(a > 0))
      return fail("Enter the size to assume for all subgroups.");
    effN = new Array(k).fill(a);
    notes.push(
      `Limits computed as if every subgroup had ${a} inspection unit(s); the plotted rates still use the actual sizes.`
    );
  }

  const cl: number[] = [];
  const ucl: number[] = [];
  const lcl: number[] = [];
  const clippedLow: boolean[] = [];
  const sigma: number[] = [];

  for (let i = 0; i < k; i++) {
    const ub = stages[stageOf[i]].uBar;
    // Desviacion tipica Poisson de una tasa: raiz(ubar / n). Sin el factor
    // (1 - p) de la binomial, porque un conteo de defectos no tiene techo.
    const se = Math.sqrt(ub / effN[i]);
    sigma.push(se);
    cl.push(ub);

    let up = ub + 3 * se;
    let lo = ub - 3 * se;
    // Una tasa no puede ser negativa. Por arriba no hay recorte: a diferencia
    // de la carta P, el conteo no esta acotado por el tamano de la muestra.
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
    sigma,
    stageOf,
    on,
    k: kArr,
    allowed: [1, 2, 3, 4],
  });

  const flagged = [...new Set(violations.flatMap((v) => v.points))].sort(
    (a, b) => a - b
  );

  // --- Diagnosticos -----------------------------------------------------
  // Sobredispersion frente a Poisson: si los z estandarizados varian mas de lo
  // que el modelo permite, los limites son demasiado estrechos.
  let dispersion = 1;
  if (k >= 3) {
    const z = u.map((v, i) => (sigma[i] > 0 ? (v - cl[i]) / sigma[i] : 0));
    let tot = 0;
    for (let i = 1; i < k; i++) tot += Math.abs(z[i] - z[i - 1]);
    dispersion = tot / (k - 1) / 1.128;
  }

  const minExpected = Math.min(
    ...n.map((v, i) => v * stages[stageOf[i]].uBar)
  );

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
    cl,
    ucl,
    lcl,
    clippedLow,
    stages,
    stageOf,
    violations,
    flagged,
    dispersion,
    minExpected,
    usedHistorical,
    omitted,
    notes,
  };
}

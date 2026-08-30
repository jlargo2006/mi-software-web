// app/app/six-sigma/studies/control/mrchart/compute.ts
import type { ColumnSnapshot } from "../../types";
// Mismo motor de tests que el resto de cartas. Aqui solo se habilitan los
// cuatro primeros: la distribucion del rango movil es asimetrica a la derecha,
// asi que las zonas sigma simetricas de los tests 5 a 8 no reparten la
// probabilidad como esos tests suponen.
import { runTests } from "../imr/tests";
import { MAX_SPAN, rangeConstants } from "./constants";
import type { MRParams, MRResult, Stage, Violation } from "./types";

const fail = (error: string): MRResult => ({ ok: false, error });

const parseNum = (s: string): number | null => {
  const t = s.trim().replace(",", ".");
  if (t === "") return null;
  const v = Number(t);
  return Number.isFinite(v) ? v : null;
};

function parseList(s: string, k: number): number[] {
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

export function computeMR(
  data: ColumnSnapshot,
  params: MRParams
): MRResult {
  const notes: string[] = [];

  const nm = params.col?.trim() ?? "";
  if (nm === "") return fail("Select the column of individual values.");
  const col = data[nm];
  if (!col) return fail(`Column "${nm}" does not exist.`);

  // --- Lectura ----------------------------------------------------------
  const x: number[] = [];
  const rowOf: number[] = [];
  let skipped = 0;

  const cells = (col.values ?? []).map((c) => String(c ?? "").trim());
  for (let i = 0; i < cells.length; i++) {
    const t = cells[i];
    if (t === "") continue;
    const v = Number(t.replace(",", "."));
    if (!Number.isFinite(v)) {
      skipped += 1;
      continue;
    }
    x.push(v);
    rowOf.push(i);
  }

  if (skipped > 0)
    notes.push(`${skipped} row(s) skipped for a non-numeric value.`);

  const m = x.length;

  // --- Longitud del rango movil ----------------------------------------
  const spanRaw = parseNum(params.span);
  if (spanRaw === null || !Number.isInteger(spanRaw) || spanRaw < 2)
    return fail("The moving range length must be a whole number of 2 or more.");
  if (spanRaw > MAX_SPAN)
    return fail(
      `The moving range length is limited to ${MAX_SPAN}: beyond that the range constants are not tabulated and a range is a poor estimator of spread anyway.`
    );
  const span = spanRaw;

  // Hacen falta al menos dos rangos para que MRbar y los tests signifiquen
  // algo, de ahi span + 1 observaciones.
  if (m < span + 1)
    return fail(
      `At least ${span + 1} observations are needed for a moving range of length ${span}.`
    );

  const rc = rangeConstants(span);
  if (!rc) return fail("No range constants are tabulated for that length.");
  const { d2, d3, D3, D4 } = rc;

  if (span > 2)
    notes.push(
      `With a moving range of length ${span} each range shares ${span - 1} observations with the next, so consecutive points are strongly dependent. The run tests are unreliable here and a length of 2 is almost always the better choice.`
    );

  // --- Rangos moviles ---------------------------------------------------
  // El rango j abarca las observaciones j .. j + span - 1 y se traza en la
  // ultima de ellas, que es donde Minitab lo situa: el punto aparece cuando
  // hay datos suficientes para calcularlo.
  const mr: number[] = [];
  const obsOf: number[] = [];
  for (let j = 0; j + span <= m; j++) {
    const win = x.slice(j, j + span);
    mr.push(Math.max(...win) - Math.min(...win));
    obsOf.push(j + span);
  }
  const k = mr.length;

  // --- Etapas -----------------------------------------------------------
  // Una etapa se define sobre las observaciones, pero la carta dibuja rangos.
  // Un rango pertenece a la etapa de la observacion en la que se traza; los
  // rangos que cruzarian una frontera se descartan, porque mezclarian dos
  // niveles de variabilidad distintos en un solo numero.
  const stageOf: number[] = new Array(k).fill(0);
  const stageLabels: string[] = [];
  const dropped: number[] = [];
  const sName = params.stageCol?.trim() ?? "";

  if (sName !== "") {
    const sCol = data[sName];
    if (!sCol) return fail(`Stage column "${sName}" does not exist.`);
    const sc = (sCol.values ?? []).map((c) => String(c ?? "").trim());

    const obsStage: number[] = new Array(m).fill(0);
    let cur = -1;
    let prev: string | null = null;
    for (let i = 0; i < m; i++) {
      const raw = sc[rowOf[i]] ?? "";
      const v = raw === "" ? "\u2014" : raw;
      if (v !== prev) {
        cur += 1;
        stageLabels.push(v);
        prev = v;
      }
      obsStage[i] = cur;
    }

    for (let j = 0; j < k; j++) {
      const a = obsStage[j];
      const b = obsStage[j + span - 1];
      if (a !== b) {
        dropped.push(obsOf[j]);
        stageOf[j] = -1;
      } else {
        stageOf[j] = b;
      }
    }
    if (dropped.length > 0)
      notes.push(
        `${dropped.length} moving range(s) span a stage boundary and were dropped: they would mix two different levels of variability into one number.`
      );
  } else {
    stageLabels.push("");
  }

  const live = Array.from({ length: k }, (_, j) => j).filter(
    (j) => stageOf[j] >= 0
  );

  // --- Omisiones y sigma historica -------------------------------------
  // Las omisiones se indican por observacion, que es como las lee el usuario
  // en la tabla; se traducen al rango trazado en esa observacion.
  const omitted = parseList(params.omit, m);
  const omitObs = new Set(omitted);

  const histSigma = parseNum(params.histSigma);
  if (histSigma !== null && !(histSigma > 0))
    return fail("The historical standard deviation must be greater than zero.");
  const usedHistorical = histSigma !== null;

  const stages: Stage[] = [];

  for (let s = 0; s < stageLabels.length; s++) {
    const idx = live.filter((j) => stageOf[j] === s);
    if (idx.length === 0)
      return fail(
        `Stage "${stageLabels[s] || "1"}" has no moving range that lies entirely inside it.`
      );
    const keep = idx.filter((j) => !omitObs.has(obsOf[j]));
    if (keep.length < 2)
      return fail(
        `Stage "${stageLabels[s] || "1"}" needs at least two usable moving ranges after omissions.`
      );

    // MRbar es la media de los rangos, y sigma = MRbar / d2. Si se da sigma
    // historica se invierte la relacion, para que la linea central siga siendo
    // el rango medio esperado con esa sigma.
    const mrBar =
      histSigma !== null
        ? histSigma * d2
        : keep.reduce((t, j) => t + mr[j], 0) / keep.length;

    const sigma = mrBar / d2;

    stages.push({
      label: stageLabels[s],
      from: idx[0],
      to: idx[idx.length - 1],
      mrBar,
      sigma,
      // D3 y D4 son solo 1 -+ 3 d3/d2: los tres sigma de la distribucion del
      // rango, no un recorte arbitrario.
      ucl: D4 * mrBar,
      lcl: D3 * mrBar,
      nUsed: keep.length,
    });
  }

  if (stages.every((s) => s.mrBar === 0))
    return fail(
      "Every moving range is zero: the data show no variation at all, so there is nothing to chart."
    );

  // --- Limites ----------------------------------------------------------
  const loB = parseNum(params.lowerBound);
  const upB = parseNum(params.upperBound);

  const cl: number[] = [];
  const ucl: number[] = [];
  const lcl: number[] = [];

  for (let j = 0; j < k; j++) {
    const st = stages[Math.max(0, stageOf[j])];
    cl.push(st.mrBar);
    let u = st.ucl;
    let l = st.lcl;
    if (loB !== null) l = Math.max(l, loB);
    if (upB !== null) u = Math.min(u, upB);
    ucl.push(u);
    lcl.push(l);
  }

  // Con span de 2 a 6, D3 es cero: el limite inferior no es un recorte, es que
  // 1 - 3 d3/d2 sale negativo. La carta no puede senalar una reduccion de la
  // variabilidad, solo un aumento.
  const lclStructural = D3 === 0;

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

  // La sigma que ven los tests es la del rango, no la del proceso: el test 1
  // debe reproducir exactamente D4 = 1 + 3 d3/d2, de modo que tres sigmas del
  // rango son d3 * sigma cada uno.
  const sigmaR = cl.map((v) => (d3 / d2) * v);

  const violations: Violation[] = runTests({
    values: mr,
    center: cl,
    sigma: sigmaR,
    stageOf: stageOf.map((v) => Math.max(0, v)),
    on,
    k: kArr,
    allowed: [1, 2, 3, 4],
  });

  // Los tests devuelven posiciones dentro del vector de rangos; se traducen a
  // numero de observacion, que es lo que el usuario ve en el eje.
  const mapped: Violation[] = violations.map((v) => ({
    ...v,
    points: v.points.map((p) => obsOf[p - 1]),
  }));

  const flagged = [...new Set(mapped.flatMap((v) => v.points))].sort(
    (a, b) => a - b
  );

  let maxMr = -Infinity;
  let maxMrAt = 0;
  for (let j = 0; j < k; j++)
    if (mr[j] > maxMr) {
      maxMr = mr[j];
      maxMrAt = obsOf[j];
    }

  const extraSigma = (params.extraSigma ?? "")
    .split(/[\s,;]+/)
    .map((t) => parseNum(t))
    .filter((v): v is number => v !== null && v > 0 && v !== 3);

  return {
    ok: true,
    colName: col.name ?? nm,
    m,
    k,
    span,
    d2,
    d3,
    D3,
    D4,
    mr,
    obsOf,
    cl,
    ucl,
    lcl,
    lclStructural,
    stages,
    stageOf,
    violations: mapped,
    flagged,
    maxMr,
    maxMrAt,
    usedHistorical,
    omitted,
    extraSigma,
    notes,
  };
}

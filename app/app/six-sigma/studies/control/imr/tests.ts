// app/app/six-sigma/studies/control/imr/tests.ts
//
// Los ocho tests de causas especiales de Nelson.
//
// Nota importante sobre su alcance: en el grafico de individuos se aplican los
// ocho; en el de rangos moviles, solo del 1 al 4. Los tests 5 a 8 razonan por
// zonas sigma y presuponen simetria alrededor de la linea central. La
// distribucion del rango movil esta sesgada y su limite inferior se pega al
// cero, asi que las zonas de abajo no existen y esos cuatro tests producen
// falsas alarmas sistematicas. Minitab hace exactamente lo mismo.

import type { Violation } from "./types";

export const TEST_TEXT: Record<number, (k: number) => string> = {
  1: (k) => `One point more than ${k.toFixed(2).replace(".", ",")} standard deviations from center line.`,
  2: (k) => `${k} points in a row on same side of center line.`,
  3: (k) => `${k} points in a row all increasing or all decreasing.`,
  4: (k) => `${k} points in a row alternating up and down.`,
  5: (k) =>
    `${k} out of ${k + 1} points more than 2 standard deviations from center line (on one side of CL).`,
  6: (k) =>
    `${k} out of ${k + 1} points more than 1 standard deviation from center line (on one side of CL).`,
  7: (k) => `${k} points within 1 standard deviation of center line (above and below CL).`,
  8: (k) => `${k} points in a row more than 1 standard deviation from center line (above and below CL).`,
};

export interface TestInput {
  /** Valor de cada punto; null donde no hay dato (primer MR). */
  values: (number | null)[];
  /** Linea central de cada punto: puede variar por etapa. */
  center: number[];
  /** Sigma de cada punto. */
  sigma: number[];
  /** Etapa de cada punto, para no cruzar fronteras. */
  stageOf: number[];
  /** Tests activos, indice 0 = test 1. */
  on: boolean[];
  /** Constantes K, indice 0 = test 1. */
  k: number[];
  /** Tests permitidos en este grafico. */
  allowed: number[];
}

/**
 * Aplica los tests y devuelve las violaciones, con los puntos en base 1
 * respecto de la serie original.
 *
 * Ninguna racha cruza una frontera de etapa: un cambio de etapa es un cambio
 * declarado del proceso, y encadenar puntos a traves de el inventaria una
 * tendencia que no existe.
 */
export function runTests(inp: TestInput): Violation[] {
  const { values, center, sigma, stageOf, on, k, allowed } = inp;
  const m = values.length;

  // z estandarizado; null donde no hay punto valido.
  const z: (number | null)[] = values.map((v, i) =>
    v === null || !(sigma[i] > 0) ? null : (v - center[i]) / sigma[i]
  );

  const sameStage = (a: number, b: number) => stageOf[a] === stageOf[b];
  const out: Violation[] = [];
  const add = (t: number, pts: number[]) => {
    if (pts.length > 0)
      out.push({ test: t, description: TEST_TEXT[t](k[t - 1]), points: pts });
  };

  /** Ventana de longitud len que acaba en i, sin nulos y dentro de la etapa. */
  const window = (i: number, len: number): number[] | null => {
    if (i - len + 1 < 0) return null;
    const idx: number[] = [];
    for (let j = i - len + 1; j <= i; j++) {
      if (z[j] === null || !sameStage(j, i)) return null;
      idx.push(j);
    }
    return idx;
  };

  // --- Test 1: un punto fuera de K sigmas -------------------------------
  if (on[0] && allowed.includes(1)) {
    const pts: number[] = [];
    for (let i = 0; i < m; i++) {
      const zi = z[i];
      if (zi !== null && Math.abs(zi) > k[0]) pts.push(i + 1);
    }
    add(1, pts);
  }

  // --- Test 2: K puntos seguidos al mismo lado --------------------------
  if (on[1] && allowed.includes(2)) {
    const pts: number[] = [];
    for (let i = 0; i < m; i++) {
      const w = window(i, k[1]);
      if (!w) continue;
      if (w.every((j) => z[j]! > 0) || w.every((j) => z[j]! < 0)) pts.push(i + 1);
    }
    add(2, pts);
  }

  // --- Test 3: K puntos seguidos, todos subiendo o todos bajando --------
  // Hacen falta K+1 puntos para tener K diferencias.
  if (on[2] && allowed.includes(3)) {
    const pts: number[] = [];
    for (let i = 0; i < m; i++) {
      const w = window(i, k[2] + 1);
      if (!w) continue;
      let up = true;
      let down = true;
      for (let j = 1; j < w.length; j++) {
        const d = values[w[j]]! - values[w[j - 1]]!;
        if (!(d > 0)) up = false;
        if (!(d < 0)) down = false;
      }
      if (up || down) pts.push(i + 1);
    }
    add(3, pts);
  }

  // --- Test 4: K puntos alternando arriba y abajo -----------------------
  if (on[3] && allowed.includes(4)) {
    const pts: number[] = [];
    for (let i = 0; i < m; i++) {
      const w = window(i, k[3] + 1);
      if (!w) continue;
      const d: number[] = [];
      for (let j = 1; j < w.length; j++) d.push(values[w[j]]! - values[w[j - 1]]!);
      let alt = d.every((v) => v !== 0);
      for (let j = 1; alt && j < d.length; j++)
        if (Math.sign(d[j]) === Math.sign(d[j - 1])) alt = false;
      if (alt) pts.push(i + 1);
    }
    add(4, pts);
  }

  /** Tests 5 y 6: K de K+1 puntos mas alla de `limit` sigmas, al mismo lado. */
  const kOfKPlus1 = (testNo: number, kk: number, limit: number) => {
    const pts: number[] = [];
    for (let i = 0; i < m; i++) {
      const w = window(i, kk + 1);
      if (!w) continue;
      const zi = z[i]!;
      // El punto actual debe estar el mismo en la zona: si no, la senal se
      // atribuiria a una observacion que esta dentro de limites.
      if (zi > limit) {
        if (w.filter((j) => z[j]! > limit).length >= kk) pts.push(i + 1);
      } else if (zi < -limit) {
        if (w.filter((j) => z[j]! < -limit).length >= kk) pts.push(i + 1);
      }
    }
    add(testNo, pts);
  };

  if (on[4] && allowed.includes(5)) kOfKPlus1(5, k[4], 2);
  if (on[5] && allowed.includes(6)) kOfKPlus1(6, k[5], 1);

  // --- Test 7: K puntos seguidos dentro de 1 sigma ----------------------
  if (on[6] && allowed.includes(7)) {
    const pts: number[] = [];
    for (let i = 0; i < m; i++) {
      const w = window(i, k[6]);
      if (!w) continue;
      if (w.every((j) => Math.abs(z[j]!) < 1)) pts.push(i + 1);
    }
    add(7, pts);
  }

  // --- Test 8: K puntos seguidos fuera de 1 sigma, a ambos lados --------
  if (on[7] && allowed.includes(8)) {
    const pts: number[] = [];
    for (let i = 0; i < m; i++) {
      const w = window(i, k[7]);
      if (!w) continue;
      if (w.every((j) => Math.abs(z[j]!) > 1)) pts.push(i + 1);
    }
    add(8, pts);
  }

  return out.sort((a, b) => a.test - b.test);
}

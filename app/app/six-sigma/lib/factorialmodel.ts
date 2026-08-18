// app/app/six-sigma/lib/factorialmodel.ts
// Construccion de terminos, deteccion de alias y metodo de Lenth para
// disenos factoriales de dos niveles. El ajuste se delega en
// lib/multiregression.ts, que ya resuelve OLS con VIF y SS de tipo III.
import { tQuantile, tSf } from "./regression";

/** Un termino del modelo: producto de uno o mas factores. */
export interface Term {
  /** Clave y rotulo: "Temp" o "Temp*Supplier". */
  key: string;
  /** Indices de los factores implicados, ascendentes. */
  members: number[];
  order: number;
  /** Letras del diseno: "A", "AC". */
  letters: string;
}

export const LETTER = (i: number): string => String.fromCharCode(65 + i);

/**
 * Todos los terminos hasta un orden dado. El orden de salida es el de
 * Minitab: primero los efectos principales, luego las interacciones dobles en
 * orden lexicografico de indices, y asi sucesivamente.
 */
export function buildTerms(names: string[], maxOrder: number): Term[] {
  const k = names.length;
  const out: Term[] = [];
  const combos = (start: number, pick: number, acc: number[]) => {
    if (acc.length === pick) {
      out.push({
        key: acc.map((i) => names[i]).join("*"),
        members: [...acc],
        order: pick,
        letters: acc.map(LETTER).join(""),
      });
      return;
    }
    for (let i = start; i < k; i++) combos(i + 1, pick, [...acc, i]);
  };
  for (let o = 1; o <= Math.min(maxOrder, k); o++) combos(0, o, []);
  return out;
}

/** Terminos de orden inferior contenidos en otro: los padres jerarquicos. */
export function parentKeys(t: Term, names: string[]): string[] {
  const out: string[] = [];
  const sub = (start: number, acc: number[]) => {
    if (acc.length > 0 && acc.length < t.members.length) {
      out.push(acc.map((i) => names[i]).join("*"));
    }
    for (let i = start; i < t.members.length; i++) {
      sub(i + 1, [...acc, t.members[i]]);
    }
  };
  sub(0, []);
  return out;
}

/** Columna codificada de un termino: producto de las columnas de sus factores. */
export function termColumn(coded: number[][], t: Term): number[] {
  const n = coded[0].length;
  const out = new Array<number>(n).fill(1);
  for (const m of t.members) {
    for (let i = 0; i < n; i++) out[i] *= coded[m][i];
  }
  return out;
}

export interface AliasGroup {
  /** Termino representante, o "I" para la identidad. */
  term: string;
  /** Terminos confundidos con el, vacio si esta limpio. */
  aliases: string[];
}

/**
 * Alias detectados sobre los DATOS, no sobre generadores: dos terminos estan
 * confundidos si sus columnas codificadas son iguales salvo el signo. Es lo
 * unico posible cuando el diseno llega desde una hoja de calculo.
 */
export function detectAliases(
  coded: number[][],
  terms: Term[]
): { groups: AliasGroup[]; clean: boolean } {
  const n = coded[0].length;
  const ones = new Array<number>(n).fill(1);
  const cols: { key: string; v: number[] }[] = [
    { key: "I", v: ones },
    ...terms.map((t) => ({ key: t.letters, v: termColumn(coded, t) })),
  ];

  const same = (a: number[], b: number[]): boolean => {
    let pos = true;
    let neg = true;
    for (let i = 0; i < n; i++) {
      if (Math.abs(a[i] - b[i]) > 1e-9) pos = false;
      if (Math.abs(a[i] + b[i]) > 1e-9) neg = false;
      if (!pos && !neg) return false;
    }
    return pos || neg;
  };

  const used = new Set<number>();
  const groups: AliasGroup[] = [];
  let clean = true;
  for (let i = 0; i < cols.length; i++) {
    if (used.has(i)) continue;
    used.add(i);
    const aliases: string[] = [];
    for (let j = i + 1; j < cols.length; j++) {
      if (used.has(j)) continue;
      if (same(cols[i].v, cols[j].v)) {
        used.add(j);
        aliases.push(cols[j].key);
        clean = false;
      }
    }
    groups.push({ term: cols[i].key, aliases });
  }
  return { groups, clean };
}

export interface LenthResult {
  /** Pseudo error tipico de Lenth. */
  pse: number;
  /** Grados de libertad ficticios, m / 3. */
  df: number;
  /** Margen de error al nivel dado. */
  margin: number;
}

/**
 * Metodo de Lenth: unica salida cuando el diseno no tiene replicas y no queda
 * ningun grado de libertad para el error. Supone que la MAYORIA de los efectos
 * son nulos y usa su mediana como medida de ruido.
 */
export function lenth(effects: number[], alpha: number): LenthResult | null {
  const m = effects.length;
  if (m < 3) return null;
  const abs = effects.map(Math.abs).sort((a, b) => a - b);
  const median = (arr: number[]): number => {
    if (arr.length === 0) return NaN;
    const h = arr.length >> 1;
    return arr.length % 2 ? arr[h] : (arr[h - 1] + arr[h]) / 2;
  };
  const s0 = 1.5 * median(abs);
  if (!(s0 > 0)) return null;
  // Se recalcula excluyendo los efectos grandes: los que si son reales no
  // deben contaminar la estimacion del ruido.
  const trimmed = abs.filter((v) => v < 2.5 * s0);
  const pse = 1.5 * median(trimmed.length > 0 ? trimmed : abs);
  if (!(pse > 0)) return null;
  const df = m / 3;
  return { pse, df, margin: tQuantile(1 - alpha / 2, df) * pse };
}

/** p-valor bilateral con los grados de libertad de Lenth. */
export function lenthP(effect: number, pse: number, df: number): number {
  const t = Math.abs(effect) / pse;
  return Math.min(1, 2 * tSf(t, df));
}

/** Un factor y como se traduce entre unidades reales y codificadas. */
export interface FactorCoding {
  name: string;
  /** true si los niveles son de texto. */
  text: boolean;
  /** Niveles observados, en el orden del eje. */
  levels: string[];
  /** Centro y semirrecorrido; 0 y 1 para los factores de texto. */
  center: number;
  half: number;
}

/**
 * Coeficientes de la ecuacion en unidades NO codificadas.
 *
 * Cada variable codificada es (x - centro) / semirrecorrido, salvo en los
 * factores de texto, que se quedan en -1 / +1 porque no existe una escala
 * real que decodificar. Se expande el producto de cada termino y se acumulan
 * los monomios resultantes.
 */
export function uncodedCoefficients(
  constant: number,
  coefs: { term: Term; coef: number }[],
  coding: FactorCoding[]
): { key: string; members: number[]; value: number }[] {
  const acc = new Map<string, { members: number[]; value: number }>();
  const add = (members: number[], value: number) => {
    const key = members.join(",");
    const cur = acc.get(key);
    if (cur) cur.value += value;
    else acc.set(key, { members: [...members], value });
  };

  add([], constant);

  for (const { term, coef } of coefs) {
    const ms = term.members;
    const total = 1 << ms.length;
    // Cada subconjunto del termino aporta un monomio: los factores incluidos
    // contribuyen x/h, los excluidos el termino constante -centro/h.
    for (let mask = 0; mask < total; mask++) {
      let v = coef;
      const present: number[] = [];
      for (let b = 0; b < ms.length; b++) {
        const fi = ms[b];
        const c = coding[fi];
        if (mask & (1 << b)) {
          v /= c.half;
          present.push(fi);
        } else {
          v *= -c.center / c.half;
        }
      }
      present.sort((a, b) => a - b);
      add(present, v);
    }
  }

  return [...acc.values()]
    .filter((e) => Math.abs(e.value) > 1e-12 || e.members.length === 0)
    .sort((a, b) => a.members.length - b.members.length ||
      a.members[0] - b.members[0])
    .map((e) => ({
      key: e.members.join(","),
      members: e.members,
      value: e.value,
    }));
}

/** Clave del termino indicador de punto central. */
export const CT_PT_KEY = "Ct Pt";

/**
 * Termino ficticio para el punto central. No es producto de factores: es un
 * indicador que vale 1 en las corridas centrales y 0 en las esquinas. Se le da
 * orden 0 para que la ANOVA lo agrupe en su propia fila, "Curvature".
 */
export const CT_PT_TERM: Term = {
  key: CT_PT_KEY,
  members: [],
  order: 0,
  letters: "",
};

/** Prefijo de las claves de los terminos de bloque. */
export const BLOCK_KEY = "Blocks";

/**
 * Termino ficticio para una columna de bloque.
 *
 * Con b bloques hacen falta b-1 columnas. Se les da orden -1 para que la ANOVA
 * las agrupe en su propia fila, delante de los efectos lineales.
 */
export const blockTerm = (i: number): Term => ({
  key: `${BLOCK_KEY}|${i}`,
  members: [],
  order: -1,
  letters: `Block ${i + 1}`,
});

export const isBlockTerm = (t: Term): boolean => t.order === -1;

/** Etiqueta que se muestra en la tabla: el numero de bloque. */
export const blockLabel = (t: Term): string =>
  String(Number(t.key.split("|")[1]) + 1);

/**
 * Codificacion de efectos, con suma cero.
 *
 * Con b bloques se construyen b-1 columnas: la columna j vale 1 en el bloque j,
 * -1 en el ULTIMO bloque y 0 en el resto. No son variables indicadoras 0/1, y
 * la diferencia importa: asi los coeficientes suman cero y la constante del
 * modelo es la media global, no la media del bloque de referencia.
 *
 * El precio es que las columnas no son ortogonales entre si, de modo que el VIF
 * de los bloques pasa de 1. Con tres bloques vale 1,33; es inevitable y no
 * indica ningun problema.
 */
export function blockColumns(
  blockOf: number[],
  levels: number[]
): number[][] {
  const last = levels[levels.length - 1];
  return levels.slice(0, -1).map((lv) =>
    blockOf.map((b) => (b === lv ? 1 : b === last ? -1 : 0))
  );
}

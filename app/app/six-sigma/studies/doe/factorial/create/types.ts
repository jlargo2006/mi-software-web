// app/app/six-sigma/studies/doe/factorial/create/types.ts
import type { Cell } from "../../../../lib/types";

export const MIN_FACTORS = 2;
export const MAX_FACTORS = 15;

export type FactorType = "numeric" | "text";

export interface FactorSpec {
  /** Letra fija: A, B, C... */
  letter: string;
  name: string;
  type: FactorType;
  low: string;
  high: string;
}

export interface DoeCreateParams {
  numFactors: string;
  /** Corridas base del diseno elegido, 4/8/16/32/64/128. */
  baseRuns: string;
  centerPoints: string;
  replicates: string;
  blocks: string;
  randomize: boolean;
  /** Semilla. Vacio: se usa una fija para que el resultado sea reproducible. */
  seed: string;
  factors: FactorSpec[];
}

const defaultFactors = (k: number): FactorSpec[] =>
  Array.from({ length: k }, (_, i) => {
    const letter = String.fromCharCode(65 + i);
    return { letter, name: letter, type: "numeric" as FactorType, low: "-1", high: "1" };
  });

export const DOECREATE_DEFAULT: DoeCreateParams = {
  numFactors: "3",
  baseRuns: "8",
  centerPoints: "0",
  replicates: "1",
  blocks: "1",
  randomize: true,
  seed: "",
  factors: defaultFactors(3),
};

/** Ajusta la lista de factores al numero pedido, conservando lo escrito. */
export function fitFactors(cur: FactorSpec[], k: number): FactorSpec[] {
  const out = defaultFactors(k);
  for (let i = 0; i < Math.min(cur.length, k); i++) {
    out[i] = { ...cur[i], letter: out[i].letter };
  }
  return out;
}

export interface DesignRow {
  stdOrder: number;
  runOrder: number;
  /** 1 en las esquinas, 0 en los puntos centrales. */
  centerPt: number;
  block: number;
  /** Niveles codificados, -1 / 0 / +1. */
  coded: number[];
}

export interface DoeCreateModel {
  numFactors: number;
  baseRuns: number;
  /** Etiqueta del diseno: "Full factorial" o "1/2 fraction". */
  designLabel: string;
  notation: string;
  resolutionLabel: string;
  isFull: boolean;

  totalRuns: number;
  replicates: number;
  blocks: number;
  /**
   * Como se han construido los bloques. Agrupar REPLICAS enteras no confunde
   * nada; partir DENTRO de una replica cuesta una interaccion.
   */
  blockRepGroups: number;
  blockWithin: number;
  centerPerBlock: number;
  centerTotal: number;
  randomized: boolean;
  seedUsed: number;

  factors: FactorSpec[];
  rows: DesignRow[];
  /** Alias, vacio en el factorial completo. */
  alias: { term: string; aliases: string[] }[];
  /** Terminos confundidos con los bloques. */
  blockConfounded: string[];

  /** Cabeceras y celdas de la hoja que se va a crear. */
  sheetHeaders: string[];
  sheetRows: Cell[][];
  sheetName: string;
  
  /** "I = ABD = ACE = BCDE". Vacio en el factorial completo. */
  definingRelation: string;
  /** "D = AB; E = AC". Vacio en el factorial completo. */
  generators: string;  
}

export type DoeCreateResult =
  | ({ ok: true; error?: undefined } & DoeCreateModel)
  | { ok: false; error: string };

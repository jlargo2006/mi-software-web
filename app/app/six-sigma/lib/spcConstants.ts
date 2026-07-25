// app/app/six-sigma/lib/spcConstants.ts

/** Constantes de cartas de control por tamaño de subgrupo n (2..10). */
export const D2: Record<number, number> = {
  2: 1.128, 3: 1.693, 4: 2.059, 5: 2.326,
  6: 2.534, 7: 2.704, 8: 2.847, 9: 2.970, 10: 3.078,
};

export const D3: Record<number, number> = {
  2: 0, 3: 0, 4: 0, 5: 0, 6: 0,
  7: 0.076, 8: 0.136, 9: 0.184, 10: 0.223,
};

export const D4: Record<number, number> = {
  2: 3.267, 3: 2.574, 4: 2.282, 5: 2.114,
  6: 2.004, 7: 1.924, 8: 1.864, 9: 1.816, 10: 1.777,
};

export const A2: Record<number, number> = {
  2: 1.880, 3: 1.023, 4: 0.729, 5: 0.577,
  6: 0.483, 7: 0.419, 8: 0.373, 9: 0.337, 10: 0.308,
};

export const d2 = (n: number) => D2[n] ?? 1.128;
export const d3 = (n: number) => D3[n] ?? 0;
export const d4 = (n: number) => D4[n] ?? 3.267;
export const a2 = (n: number) => A2[n] ?? 1.880;

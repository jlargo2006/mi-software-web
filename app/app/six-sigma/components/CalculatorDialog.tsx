// app/app/six-sigma/components/CalculatorDialog.tsx
"use client";

import React, { useMemo, useRef, useState } from "react";
import type { Cell, SheetData } from "../lib/types";
import { compileFormula, FORMULA_HELP, FormulaError } from "../lib/formula";

function colLabel(i: number): string {
  let label = "";
  let n = i;
  do {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return label;
}

const NUM_COLS = 26; // A..Z, igual que FIXED_COLS del DataGrid

interface Props {
  sheet: SheetData;
  onApply: (col: number, values: Cell[]) => void;
  onClose: () => void;
}

/**
 * Calculadora de columnas.
 *
 * El calculo es ESTATICO: se escriben los valores una vez. No se guarda la
 * formula ni se recalcula al editar los origenes. Una columna calculada viva
 * obligaria a un grafo de dependencias y a detectar ciclos, que es otro
 * proyecto; y para un estudio Six Sigma, donde los datos se cargan y luego se
 * analizan, el resultado congelado es lo habitual.
 */
export default function CalculatorDialog({ sheet, onApply, onClose }: Props) {
  const [target, setTarget] = useState(0);
  const [expr, setExpr] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const numRows = sheet.rows.length;

  // Se compila en cada tecla para dar el error y la vista previa en vivo. Es
  // barato: la expresion es corta y solo se evaluan las primeras filas.
  const { error, preview } = useMemo(() => {
    if (!expr.trim()) return { error: null as string | null, preview: [] as Cell[] };
    try {
      const f = compileFormula(expr, sheet.rows);
      const n = Math.min(5, numRows);
      const out: Cell[] = [];
      for (let r = 0; r < n; r++) out.push(f.evalRow(r));
      return { error: null, preview: out };
    } catch (e) {
      const msg =
        e instanceof FormulaError
          ? e.message
          : e instanceof Error
          ? e.message
          : "Expresion no valida";
      return { error: msg, preview: [] };
    }
  }, [expr, sheet.rows, numRows]);

  const canApply = expr.trim() !== "" && !error && numRows > 0;

  /** Inserta texto en la posicion del cursor, no al final. */
  const insert = (text: string) => {
    const el = inputRef.current;
    if (!el) {
      setExpr((s) => s + text);
      return;
    }
    const start = el.selectionStart ?? expr.length;
    const end = el.selectionEnd ?? expr.length;
    const next = expr.slice(0, start) + text + expr.slice(end);
    setExpr(next);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + text.length;
      el.setSelectionRange(caret, caret);
    });
  };

  const apply = () => {
    if (!canApply) return;
    try {
      const f = compileFormula(expr, sheet.rows);
      const values: Cell[] = [];
      for (let r = 0; r < numRows; r++) values.push(f.evalRow(r));
      onApply(target, values);
      onClose();
    } catch {
      /* el error ya se muestra en vivo */
    }
  };

  const targetHasData = sheet.rows.some((r) => (r[target] ?? "") !== "");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-lg bg-white shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h2 className="text-sm font-semibold text-[#00513d]">
            Calculadora de columnas
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
            aria-label="Cerrar"
          >
            {"\u2715"}
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          {/* Destino */}
          <div className="flex items-center gap-3">
            <label className="w-32 shrink-0 text-xs font-medium text-gray-600">
              Guardar en
            </label>
            <select
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#00674d]"
            >
              {Array.from({ length: NUM_COLS }, (_, c) => (
                <option key={c} value={c}>
                  {colLabel(c)}
                  {sheet.headers[c] ? ` \u2014 ${sheet.headers[c]}` : ""}
                </option>
              ))}
            </select>
            {targetHasData && (
              <span className="text-xs text-amber-600">
                Esta columna tiene datos y se sobrescribira.
              </span>
            )}
          </div>

          {/* Expresion */}
          <div className="flex items-start gap-3">
            <label className="w-32 shrink-0 pt-1.5 text-xs font-medium text-gray-600">
              Expresion
            </label>
            <div className="flex-1">
              <input
                ref={inputRef}
                value={expr}
                onChange={(e) => setExpr(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canApply) apply();
                  if (e.key === "Escape") onClose();
                }}
                placeholder="(A + B) / 2"
                autoFocus
                spellCheck={false}
                className={`w-full rounded border px-2 py-1.5 font-mono text-sm outline-none ${
                  error
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-300 focus:border-[#00674d]"
                }`}
              />
              <p className="mt-1 text-xs text-gray-500">
                Las columnas se referencian por su letra: A, B, C{"\u2026"}
              </p>
              {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            </div>
          </div>

          {/* Vista previa */}
          {preview.length > 0 && (
            <div className="flex items-start gap-3">
              <span className="w-32 shrink-0 text-xs font-medium text-gray-600">
                Vista previa
              </span>
              <div className="flex flex-wrap gap-1">
                {preview.map((v, i) => (
                  <span
                    key={i}
                    className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700"
                    title={`Fila ${i + 1}`}
                  >
                    {v === "" ? "\u2014" : String(v)}
                  </span>
                ))}
                {numRows > preview.length && (
                  <span className="px-1 py-0.5 text-xs text-gray-400">
                    {"\u2026"} y {numRows - preview.length} filas mas
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Ayuda: pulsar inserta en el cursor */}
          <div className="rounded border border-gray-200 bg-gray-50 p-3">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
              {FORMULA_HELP.map((g) => (
                <div key={g.group}>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                    {g.group}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {g.items.map((it) => (
                      <button
                        key={it}
                        type="button"
                        onClick={() => {
                          // De "ROUND(x, n)" se inserta "ROUND(" y se deja el
                          // cursor dentro: escribir los argumentos es lo
                          // siguiente que va a hacer el usuario.
                          const m = /^([A-Z]+)\(/.exec(it);
                          insert(m ? `${m[1]}(` : it);
                        }}
                        className="rounded border border-gray-300 bg-white px-1.5 py-0.5 font-mono text-[11px] text-gray-700 hover:border-[#00674d] hover:text-[#00674d]"
                      >
                        {it}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={apply}
            disabled={!canApply}
            className="rounded bg-[#00674d] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#00513d] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Calcular
          </button>
        </div>
      </div>
    </div>
  );
}

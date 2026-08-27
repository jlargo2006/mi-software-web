// app/app/six-sigma/studies/doe/factorial/cube/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../../lib/columns";
import { MAX_CUBE_FACTORS, type DoeCubeParams } from "./types";
import { cubeParents } from "./compute";

const label = "block text-sm font-medium text-gray-700 mb-1";
const field =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";
const check =
  "h-4 w-4 rounded border-gray-300 text-[#00674d] focus:ring-[#00674d]";

/** Columnas de servicio del diseno: no son factores. */
const RESERVED = ["stdorder", "runorder", "centerpt", "blocks"];

/** Terminos en orden estandar, igual que en compute. */
function termsOf(names: string[]): { key: string; members: number[] }[] {
  const out: { key: string; members: number[] }[] = [];
  const combos = (start: number, pick: number, acc: number[]) => {
    if (acc.length === pick) {
      out.push({ key: acc.map((i) => names[i]).join("*"), members: [...acc] });
      return;
    }
    for (let i = start; i < names.length; i++) combos(i + 1, pick, [...acc, i]);
  };
  for (let o = 1; o <= names.length; o++) combos(0, o, []);
  return out;
}

export default function DoeCubeControls({
  params,
  onChange,
  columns,
}: {
  params: DoeCubeParams;
  onChange: (p: DoeCubeParams) => void;
  columns: ColumnInfo[];
}) {
  const set = <K extends keyof DoeCubeParams>(k: K, v: DoeCubeParams[K]) =>
    onChange({ ...params, [k]: v });

  const isReserved = (nm: string) => RESERVED.includes(nm.trim().toLowerCase());
  const chosen = params.factors.filter((s) => s !== params.response);
  const k = chosen.length;

  const toggleFactor = (name: string) => {
    const cur = params.factors;
    const next = cur.includes(name)
      ? cur.filter((s) => s !== name)
      : [...cur, name];
    // Al cambiar los factores cambian las claves de termino: lo desmarcado
    // antes deja de existir y arrastrarlo dejaria el modelo mudo sin motivo.
    onChange({ ...params, factors: next, excluded: [] });
  };

  const terms = termsOf(chosen);
  const excluded = new Set(params.excluded);

  const toggleTerm = (key: string, members: number[]) => {
    const next = new Set(excluded);
    if (next.has(key)) {
      // Al recuperar un termino vuelven sus padres: sin ellos no es ajustable.
      next.delete(key);
      for (const p of cubeParents(members, chosen)) next.delete(p);
    } else {
      next.add(key);
      // Y al quitarlo caen sus hijos, que es lo que mantiene la jerarquia.
      for (const t of terms) {
        if (cubeParents(t.members, chosen).includes(key)) next.add(t.key);
      }
    }
    set("excluded", [...next]);
  };

  const inModel = terms.length - excluded.size;

  return (
    <div className="space-y-4">
      <div>
        <label className={label}>Response</label>
        <select
          className={field}
          value={params.response}
          onChange={(e) => set("response", e.target.value)}
        >
          <option value="">Select a column...</option>
          {columns.map((c) => (
            <option key={c.index} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <span className={label}>Type of means to use</span>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="radio"
            className={check}
            checked={!params.fittedMeans}
            onChange={() => set("fittedMeans", false)}
          />
          Data means
        </label>
        <label className="mt-1 flex items-center gap-2 text-sm text-gray-700">
          <input
            type="radio"
            className={check}
            checked={params.fittedMeans}
            onChange={() => set("fittedMeans", true)}
          />
          Fitted means
        </label>
        <p className="mt-1 text-xs text-gray-500">
          Data means are the raw average of the runs at each corner. Fitted
          means come from the model below, and differ only when a term has been
          taken out of it.
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Factors
            {k > 0 && (
              <span className="ml-1 font-normal text-gray-500">
                ({k} of {MAX_CUBE_FACTORS})
              </span>
            )}
          </span>
        </div>
        <div className="max-h-52 overflow-y-auto rounded-md border border-gray-300 p-2 space-y-1">
          {columns.length === 0 && (
            <p className="text-xs text-gray-400">No columns available.</p>
          )}
          {columns
            .filter((c) => c.name !== params.response)
            .map((c) => {
              const on = params.factors.includes(c.name);
              const full = k >= MAX_CUBE_FACTORS && !on;
              return (
                <label
                  key={c.index}
                  className={`flex items-center gap-2 text-sm ${
                    full ? "text-gray-400" : "text-gray-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    className={check}
                    checked={on}
                    disabled={full}
                    onChange={() => toggleFactor(c.name)}
                  />
                  <span className={isReserved(c.name) ? "text-gray-400" : ""}>
                    {c.name}
                  </span>
                </label>
              );
            })}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {k >= 2
            ? k === 3
              ? "A cube: three factors, eight corners."
              : "A square: two factors, four corners."
            : `Two or three factors. Above ${MAX_CUBE_FACTORS} the corners overlap and the plot cannot be read.`}
        </p>
      </div>

      {params.fittedMeans && k >= 2 && (
        <div className="border-t border-gray-200 pt-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Terms in the model
              <span className="ml-1 font-normal text-gray-500">
                ({inModel} of {terms.length})
              </span>
            </span>
            {excluded.size > 0 && (
              <button
                type="button"
                onClick={() => set("excluded", [])}
                className="rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50"
              >
                Full model
              </button>
            )}
          </div>
          <div className="max-h-52 overflow-y-auto rounded-md border border-gray-300 p-2 space-y-1">
            {terms.map((t) => (
              <label
                key={t.key}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  className={check}
                  checked={!excluded.has(t.key)}
                  onChange={() => toggleTerm(t.key, t.members)}
                />
                {t.key}
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            The full model reproduces the cell means exactly, which is why it is
            the default. Take terms out to see the corners the reduced model
            predicts: that is what makes fitted means differ from data means.
          </p>
        </div>
      )}
    </div>
  );
}

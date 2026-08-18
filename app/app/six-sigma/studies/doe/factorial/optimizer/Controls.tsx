// app/app/six-sigma/studies/doe/factorial/optimizer/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../../lib/columns";
import { GOAL_LABEL, type Goal } from "../../../../lib/desirability";
import { buildTerms, parentKeys } from "../../../../lib/factorialmodel";
import {
  EMPTY_SETUP,
  type DoeOptParams,
  type ResponseSetup,
} from "./types";

const label = "block text-sm font-medium text-gray-700 mb-1";
const small =
  "w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-[#00674d] focus:outline-none";
const tiny =
  "w-full rounded border border-gray-300 px-1 py-1 text-xs focus:border-[#00674d] focus:outline-none";
const check =
  "h-4 w-4 rounded border-gray-300 text-[#00674d] focus:ring-[#00674d]";
const off = "bg-gray-100 text-gray-400";

const RESERVED = ["stdorder", "runorder", "centerpt", "blocks"];

export default function DoeOptControls({
  params,
  onChange,
  columns,
}: {
  params: DoeOptParams;
  onChange: (p: DoeOptParams) => void;
  columns: ColumnInfo[];
}) {
  const set = <K extends keyof DoeOptParams>(k: K, v: DoeOptParams[K]) =>
    onChange({ ...params, [k]: v });

  const isReserved = (nm: string) => RESERVED.includes(nm.trim().toLowerCase());

  const toggleResponse = (name: string) => {
    const has = params.responses.includes(name);
    const responses = has
      ? params.responses.filter((s) => s !== name)
      : [...params.responses, name];
    const setups = has
      ? params.setups.filter((s) => s.column !== name)
      : [...params.setups, EMPTY_SETUP(name)];
    onChange({
      ...params,
      responses,
      setups,
      factors: params.factors.filter((f) => !responses.includes(f)),
    });
  };

  const toggleFactor = (name: string) => {
    const cur = params.factors;
    const next = cur.includes(name)
      ? cur.filter((s) => s !== name)
      : [...cur, name];
    onChange({ ...params, factors: next, excluded: [], holds: [] });
  };

  const setSetup = (col: string, patch: Partial<ResponseSetup>) =>
    set(
      "setups",
      params.setups.map((s) => (s.column === col ? { ...s, ...patch } : s))
    );

  const facs = params.factors.filter((s) => !params.responses.includes(s));
  const maxOrder = Number(params.maxOrder);
  const terms =
    facs.length > 0 && Number.isInteger(maxOrder) ? buildTerms(facs, maxOrder) : [];
  const excluded = new Set(params.excluded);

  const toggleTerm = (key: string) => {
    const next = new Set(excluded);
    if (next.has(key)) {
      next.delete(key);
      const t = terms.find((x) => x.key === key);
      if (t) parentKeys(t, facs).forEach((p) => next.delete(p));
    } else {
      next.add(key);
      terms.forEach((o) => {
        if (parentKeys(o, facs).includes(key)) next.add(o.key);
      });
    }
    set("excluded", [...next]);
  };

  const holdOf = (nm: string) =>
    params.holds.find((h) => h.factor === nm)?.value ?? "";

  const setHold = (nm: string, value: string) => {
    const rest = params.holds.filter((h) => h.factor !== nm);
    set("holds", value.trim() === "" ? rest : [...rest, { factor: nm, value }]);
  };

  return (
    <div className="space-y-4">
      {/* Respuestas */}
      <div>
        <span className={label}>Responses to optimize</span>
        <div className="max-h-32 overflow-y-auto rounded-md border border-gray-300 p-2 space-y-1">
          {columns.map((c) => (
            <label
              key={c.index}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <input
                type="checkbox"
                className={check}
                checked={params.responses.includes(c.name)}
                onChange={() => toggleResponse(c.name)}
              />
              <span className={isReserved(c.name) ? "text-gray-400" : ""}>
                {c.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Setup por respuesta */}
      {params.setups.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <span className={label}>Goals</span>
          <div className="overflow-x-auto rounded-md border border-gray-300">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-300">
                  <th className="px-1 py-1 text-left font-medium text-gray-600">
                    Response
                  </th>
                  <th className="px-1 py-1 text-left font-medium text-gray-600">
                    Goal
                  </th>
                  <th className="px-1 py-1 text-left font-medium text-gray-600">
                    Lower
                  </th>
                  <th className="px-1 py-1 text-left font-medium text-gray-600">
                    Target
                  </th>
                  <th className="px-1 py-1 text-left font-medium text-gray-600">
                    Upper
                  </th>
                  <th className="px-1 py-1 text-left font-medium text-gray-600">
                    Wt
                  </th>
                  <th className="px-1 py-1 text-left font-medium text-gray-600">
                    Imp
                  </th>
                </tr>
              </thead>
              <tbody>
                {params.setups.map((s) => {
                  // Cada objetivo usa solo los limites que le hacen falta.
                  const needLower = s.goal === "maximize" || s.goal === "target";
                  const needUpper = s.goal === "minimize" || s.goal === "target";
                  const needTarget = s.goal !== "none";
                  return (
                    <tr key={s.column} className="border-b border-gray-200">
                      <td className="px-1 py-1 whitespace-nowrap">{s.column}</td>
                      <td className="px-1 py-1">
                        <select
                          className={tiny}
                          value={s.goal}
                          onChange={(e) =>
                            setSetup(s.column, { goal: e.target.value as Goal })
                          }
                        >
                          {(Object.keys(GOAL_LABEL) as Goal[]).map((g) => (
                            <option key={g} value={g}>
                              {GOAL_LABEL[g]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-1 py-1">
                        <input
                          className={`${tiny} ${needLower ? "" : off}`}
                          value={s.lower}
                          disabled={!needLower}
                          onChange={(e) =>
                            setSetup(s.column, { lower: e.target.value })
                          }
                        />
                      </td>
                      <td className="px-1 py-1">
                        <input
                          className={`${tiny} ${needTarget ? "" : off}`}
                          value={s.target}
                          disabled={!needTarget}
                          onChange={(e) =>
                            setSetup(s.column, { target: e.target.value })
                          }
                        />
                      </td>
                      <td className="px-1 py-1">
                        <input
                          className={`${tiny} ${needUpper ? "" : off}`}
                          value={s.upper}
                          disabled={!needUpper}
                          onChange={(e) =>
                            setSetup(s.column, { upper: e.target.value })
                          }
                        />
                      </td>
                      <td className="px-1 py-1">
                        <input
                          className={tiny}
                          value={s.weight}
                          onChange={(e) =>
                            setSetup(s.column, { weight: e.target.value })
                          }
                        />
                      </td>
                      <td className="px-1 py-1">
                        <input
                          className={tiny}
                          value={s.importance}
                          onChange={(e) =>
                            setSetup(s.column, { importance: e.target.value })
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Weight bends the desirability curve; importance weighs one response
            against the others. Leave both at 1 unless you have a reason.
          </p>
        </div>
      )}

      {/* Factores */}
      <div className="border-t border-gray-200 pt-4">
        <span className={label}>
          Factors
          {facs.length > 0 && (
            <span className="ml-1 font-normal text-gray-500">({facs.length})</span>
          )}
        </span>
        <div className="max-h-40 overflow-y-auto rounded-md border border-gray-300 p-2 space-y-1">
          {columns
            .filter((c) => !params.responses.includes(c.name))
            .map((c) => (
              <label
                key={c.index}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  className={check}
                  checked={params.factors.includes(c.name)}
                  onChange={() => toggleFactor(c.name)}
                />
                <span className={isReserved(c.name) ? "text-gray-400" : ""}>
                  {c.name}
                </span>
              </label>
            ))}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Include only the factors your reduced model kept. A factor that turned
          out not to matter has no place here.
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4 grid grid-cols-2 gap-2">
        <div>
          <label className={label}>Model order</label>
          <select
            className={small}
            value={params.maxOrder}
            onChange={(e) =>
              onChange({ ...params, maxOrder: e.target.value, excluded: [] })
            }
          >
            {[1, 2, 3, 4, 5, 6]
              .filter((o) => facs.length === 0 || o <= facs.length)
              .map((o) => (
                <option key={o} value={String(o)}>
                  {o}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className={label}>Confidence level (%)</label>
          <input
            className={small}
            value={params.confidenceLevel}
            onChange={(e) => set("confidenceLevel", e.target.value)}
            inputMode="decimal"
          />
        </div>
      </div>

      {/* Terminos */}
      {terms.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <span className={label}>
            Terms in the model
            <span className="ml-1 font-normal text-gray-500">
              ({terms.length - excluded.size} of {terms.length})
            </span>
          </span>
          <div className="max-h-40 overflow-y-auto rounded-md border border-gray-300 p-2 space-y-1">
            {terms.map((t) => (
              <label
                key={t.key}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  className={check}
                  checked={!excluded.has(t.key)}
                  onChange={() => toggleTerm(t.key)}
                />
                {t.key}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Restricciones */}
      {facs.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <span className={label}>Hold a factor (optional)</span>
          <div className="space-y-1">
            {facs.map((nm) => (
              <div key={nm} className="flex items-center gap-2">
                <span className="w-1/2 truncate text-sm text-gray-700">{nm}</span>
                <input
                  className={small}
                  value={holdOf(nm)}
                  onChange={(e) => setHold(nm, e.target.value)}
                  placeholder="free"
                />
              </div>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Fix a factor at a value the process forces on you. Leave it empty to
            let the optimizer choose.
          </p>
        </div>
      )}

      <div className="border-t border-gray-200 pt-4 space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className={check}
            checked={params.showOptPlot}
            onChange={(e) => set("showOptPlot", e.target.checked)}
          />
          Optimization plot
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className={check}
            checked={params.showDesirCurves}
            onChange={(e) => set("showDesirCurves", e.target.checked)}
          />
          Desirability functions
        </label>
      </div>
    </div>
  );
}

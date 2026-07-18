// components/DescriptiveStatsDialog.tsx
"use client";

import React, { useState } from "react";
import {
  STAT_DEFS, StatKey, DEFAULT_KEYS, ALL_KEYS, GROUP_TITLES,
} from "../lib/descriptiveStats";

const BRAND = "#00674d";
const BRAND_DARK = "#00513d";

type Preset = "default" | "none" | "all";

interface Props {
  initial: Set<StatKey>;
  onApply: (selected: Set<StatKey>) => void;
  onClose: () => void;
}

export default function DescriptiveStatsDialog({ initial, onApply, onClose }: Props) {
  const [sel, setSel] = useState<Set<StatKey>>(new Set(initial));

  const toggle = (k: StatKey) =>
    setSel((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });

  const applyPreset = (p: Preset) => {
    if (p === "default") setSel(new Set(DEFAULT_KEYS));
    else if (p === "all") setSel(new Set(ALL_KEYS));
    else setSel(new Set());
  };

  const groups = [1, 2, 3, 4, 5] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="font-semibold text-gray-800">Descriptive Statistics {"\u2014"} Statistics</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">{"\u2715"}</button>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-3">
          {groups.map((g) => (
            <div key={g}>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND_DARK }}>
                {GROUP_TITLES[g]}
              </div>
              <div className="space-y-1.5">
                {STAT_DEFS.filter((s) => s.group === g).map((s) => (
                  <label key={s.key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sel.has(s.key)}
                      onChange={() => toggle(s.key)}
                      style={{ accentColor: BRAND }}
                    />
                    {s.menuLabel}
                    {s.isDefault && <span style={{ color: BRAND }}>*</span>}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Grupo 6: presets excluyentes */}
        <div className="flex items-center gap-4 border-t px-5 py-3">
          <span className="text-sm font-medium text-gray-600">Check statistics:</span>
          {(["default", "none", "all"] as Preset[]).map((p) => (
            <label key={p} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer capitalize">
              <input
                type="radio"
                name="preset"
                onChange={() => applyPreset(p)}
                style={{ accentColor: BRAND }}
              />
              {p}
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2 border-t px-5 py-3">
          <button
            onClick={onClose}
            className="rounded border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onApply(sel)}
            className="rounded px-4 py-1.5 text-sm text-white hover:opacity-90"
            style={{ backgroundColor: BRAND }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

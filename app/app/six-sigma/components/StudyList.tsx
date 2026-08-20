// app/app/six-sigma/components/StudyList.tsx
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import type { SavedStudy } from "../lib/studies";
import { formatStudyDate } from "../lib/studies";

type SortKey = "date-desc" | "date-asc" | "name-asc" | "name-desc";

const SORT_LABEL: Record<SortKey, string> = {
  "date-desc": "Newest first",
  "date-asc": "Oldest first",
  "name-asc": "Name A \u2192 Z",
  "name-desc": "Name Z \u2192 A",
};

interface StudyListProps {
  studies: SavedStudy[];
  viewingId: string | null;
  onSelect: (study: SavedStudy) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

export default function StudyList({
  studies,
  viewingId,
  onSelect,
  onDelete,
  onRename,
}: StudyListProps) {
  const [sort, setSort] = useState<SortKey>("date-desc");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId !== null) inputRef.current?.select();
  }, [editingId]);

  // El orden es solo de presentacion: no se toca el array de estudios, para
  // que exportar el proyecto conserve el orden real de creacion.
  const sorted = useMemo(() => {
    const copy = [...studies];
    const byName = (a: SavedStudy, b: SavedStudy) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    const byDate = (a: SavedStudy, b: SavedStudy) =>
      Date.parse(a.createdAt) - Date.parse(b.createdAt);
    switch (sort) {
      case "date-asc":
        return copy.sort(byDate);
      case "name-asc":
        return copy.sort(byName);
      case "name-desc":
        return copy.sort((a, b) => byName(b, a));
      default:
        return copy.sort((a, b) => byDate(b, a));
    }
  }, [studies, sort]);

  const startRename = (s: SavedStudy) => {
    setEditingId(s.id);
    setDraft(s.name);
  };

  const commitRename = () => {
    if (editingId === null) return;
    const trimmed = draft.trim();
    // Un nombre vacio se ignora y se conserva el anterior: no hay nada que
    // avisar, simplemente no se aplica.
    if (trimmed) onRename(editingId, trimmed);
    setEditingId(null);
  };

  return (
    <>
      <div className="px-3 py-2 border-b border-gray-300">
        <div className="font-semibold text-sm text-gray-700">Saved Studies</div>
        {studies.length > 1 && (
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="mt-1 w-full text-xs border border-gray-300 rounded px-1 py-0.5 bg-white text-gray-700"
            title="Sort studies"
          >
            {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABEL[k]}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {studies.length === 0 && (
          <div className="text-sm text-gray-400">No saved studies yet.</div>
        )}

        {sorted.map((s) => {
          const isViewing = viewingId === s.id;

          if (editingId === s.id) {
            return (
              <div
                key={s.id}
                className="rounded border border-[#00674d] bg-white px-2 py-1.5"
              >
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  onBlur={commitRename}
                  className="w-full text-sm outline-none text-gray-800 bg-transparent"
                />
              </div>
            );
          }

          return (
            <div
              key={s.id}
              className={`group relative flex items-start rounded border ${
                isViewing
                  ? "bg-emerald-50 border-[#00674d]"
                  : "border-transparent hover:bg-emerald-50 hover:border-[#00674d]"
              }`}
            >
              <button
                onClick={() => onSelect(s)}
                onDoubleClick={() => startRename(s)}
                className="flex-1 min-w-0 text-left px-2 py-1.5 pr-12"
                title={`${s.name}\nDouble-click to rename`}
              >
                <div className="text-sm text-gray-700 truncate">{s.name}</div>
                <div className="text-[11px] text-gray-400">
                  {formatStudyDate(s.createdAt)}
                </div>
              </button>

              {/* Los controles solo aparecen al pasar por encima, para que la
                  lista no parezca una botonera. */}
              <div className="absolute right-1 top-1 flex gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startRename(s);
                  }}
                  className="text-gray-400 hover:text-[#00674d] px-1 text-xs"
                  title="Rename study"
                  aria-label="Rename study"
                >
                  {"\u270E"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(s.id);
                  }}
                  className="text-gray-400 hover:text-red-500 px-1 text-xs"
                  title="Delete study"
                  aria-label="Delete study"
                >
                  {"\u00D7"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

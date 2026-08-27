// app/app/six-sigma/components/SheetTabs.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";

interface SheetTabsProps {
  order: string[];
  activeSheet: string;
  onSelect: (name: string) => void;
  onAddSheet: () => void;
  onDeleteSheet: (name: string) => void;
  onMoveSheet: (name: string, delta: number) => void;
  /** Devuelve null si el renombrado fue bien, o el motivo del rechazo. */
  onRenameSheet: (oldName: string, newName: string) => string | null;
}

export default function SheetTabs({
  order,
  activeSheet,
  onSelect,
  onAddSheet,
  onDeleteSheet,
  onMoveSheet,
  onRenameSheet,
}: SheetTabsProps) {
  // Nombre de la hoja en edicion, o null si no se esta renombrando.
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const index = order.indexOf(activeSheet);
  const canMoveLeft = index > 0;
  const canMoveRight = index >= 0 && index < order.length - 1;

  // Al entrar en edicion, foco y seleccion completa: escribir sustituye.
  useEffect(() => {
    if (editing !== null) inputRef.current?.select();
  }, [editing]);

  // La pestaña activa se trae a la vista. Con muchas hojas, cambiar de hoja o
  // moverla dejaria la pestaña fuera del area visible.
  useEffect(() => {
    const strip = stripRef.current;
    const tab = strip?.querySelector<HTMLElement>('[data-active="true"]');
    tab?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeSheet, order]);

  const startRename = (name: string) => {
    setEditing(name);
    setDraft(name);
    setError(null);
  };

  const commitRename = () => {
    if (editing === null) return;
    const msg = onRenameSheet(editing, draft);
    if (msg) {
      setError(msg); // se queda en edicion para corregir
      return;
    }
    setEditing(null);
    setError(null);
  };

  const cancelRename = () => {
    setEditing(null);
    setError(null);
  };

  const ctrl =
    "px-2 py-1 text-sm rounded text-[#00674d] hover:bg-gray-200 " +
    "disabled:text-gray-300 disabled:hover:bg-transparent " +
    "disabled:cursor-not-allowed";

  return (
    <div className="shrink-0 border-t border-gray-300 bg-gray-50">
      <div className="flex items-stretch gap-1 px-2 py-1">
        {/* IZQUIERDA (fija): mover la hoja activa */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => onMoveSheet(activeSheet, -1)}
            disabled={!canMoveLeft || editing !== null}
            className={ctrl}
            title="Move sheet left"
            aria-label="Move sheet left"
          >
            {"\u25C0"}
          </button>
          <button
            onClick={() => onMoveSheet(activeSheet, 1)}
            disabled={!canMoveRight || editing !== null}
            className={ctrl}
            title="Move sheet right"
            aria-label="Move sheet right"
          >
            {"\u25B6"}
          </button>
        </div>

        <span className="w-px bg-gray-300 my-1 shrink-0" />

        {/* CENTRO: la unica zona que desplaza */}
        <div
          ref={stripRef}
          className="flex items-center gap-1 overflow-x-auto min-w-0 flex-1"
        >
          {order.map((name) => {
            const isActive = name === activeSheet;
            const isEditing = editing === name;

            if (isEditing) {
              return (
                <div
                  key={name}
                  className="flex items-center rounded-t px-1 py-1 bg-white border border-b-white border-gray-300"
                >
                  <input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => {
                      setDraft(e.target.value);
                      setError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename();
                      if (e.key === "Escape") cancelRename();
                    }}
                    // Al perder el foco se confirma, como en Excel. Si el
                    // nombre es invalido, commitRename mantiene la edicion.
                    onBlur={commitRename}
                    size={Math.max(draft.length, 6)}
                    className="text-sm px-1 outline-none text-[#00674d] font-semibold bg-transparent"
                  />
                </div>
              );
            }

            return (
              <div
                key={name}
                data-active={isActive}
                className={`group flex items-center rounded-t px-3 py-1 text-sm cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-white border border-b-white border-gray-300 font-semibold text-[#00674d]"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
                onClick={() => onSelect(name)}
                onDoubleClick={() => {
                  onSelect(name);
                  startRename(name);
                }}
                title="Double-click to rename"
              >
                {name}
                {order.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSheet(name);
                    }}
                    className="ml-2 text-gray-400 hover:text-red-500"
                    title="Delete sheet"
                  >
                    {"\u00D7"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <span className="w-px bg-gray-300 my-1 shrink-0" />

        {/* DERECHA (fija): siempre alcanzable, haya 3 hojas o 30 */}
        <div className="flex items-center shrink-0">
          <button
            onClick={onAddSheet}
            disabled={editing !== null}
            className={ctrl}
            title="Add sheet"
            aria-label="Add sheet"
          >
            +
          </button>
          <button
            onClick={() => startRename(activeSheet)}
            disabled={editing !== null}
            className={ctrl}
            title="Rename active sheet"
            aria-label="Rename active sheet"
          >
            {"\u270E"}
          </button>
        </div>
      </div>

      {/* El error se muestra en la barra, no en un dialogo: el usuario sigue
          escribiendo en el input sin tener que descartar nada. */}
      {error && (
        <div className="px-3 pb-1 text-xs text-red-600">{error}</div>
      )}
    </div>
  );
}

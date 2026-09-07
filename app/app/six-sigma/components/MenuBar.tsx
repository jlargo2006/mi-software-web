// app/app/six-sigma/components/MenuBar.tsx
"use client";

import React, { useState, useRef, useCallback } from "react";
import { PHASES, RibbonTool, ToolId } from "../lib/ribbon";
import { useRouter } from "next/navigation";
import { useDismiss } from "../hooks/useDismiss";

interface MenuBarProps {
  userEmail?: string;
  projectName?: string;        // ← nueva
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveProject?: () => void;  // ← nueva
  onExportProject: () => void;
  onImportProject: () => void;
  onSignOut: () => void;
  onSelectTool: (tool: ToolId) => void;
}

export default function MenuBar({
  userEmail,
  onNew,
  onOpen,
  onSave,
  onExportProject,
  onImportProject,
  onSignOut,
  onSelectTool,
}: MenuBarProps) {
  const [fileOpen, setFileOpen] = useState(false);
  const [activePhase, setActivePhase] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const fileRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Cada menu flotante se cierra al pulsar fuera o con Escape.
  const closeFile = useCallback(() => setFileOpen(false), []);
  useDismiss(fileRef, closeFile, fileOpen);

  const closeGroup = useCallback(() => {
    setOpenGroup(null);
    setOpenSub(null);
  }, []);

  useDismiss(toolsRef, closeGroup, openGroup !== null);

  const togglePhase = (name: string) => {
    setActivePhase((prev) => (prev === name ? null : name));
    setOpenGroup(null);
    // Abrir una fase cierra el menu File: son dos menus del mismo nivel y no
    // deben quedar los dos desplegados.
    setFileOpen(false);
  };

  const phaseTools = PHASES.find((p) => p.name === activePhase)?.tools ?? [];

  const handleToolClick = (t: RibbonTool) => {
    if (!t.enabled) return;
    if (t.children) {
      setOpenGroup((prev) => (prev === t.id ? null : t.id));
      return;
    }
    if (t.tool) {
      setOpenGroup(null);
      onSelectTool(t.tool);
    }
  };

  const handleChildClick = (child: RibbonTool) => {
    if (!child.enabled || !child.tool) return;
    onSelectTool(child.tool);
    setOpenGroup(null);
  };

  // Ejecuta una accion del menu File cerrandolo primero.
  const runFile = (action: () => void) => () => {
    setFileOpen(false);
    action();
  };

  const fileItem =
    "w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700";

  return (
    <div className="bg-[#00674d] text-white shrink-0">
      {/* MAIN ROW */}
      <div className="flex items-center gap-1 px-2 py-1">
        {/* File menu */}
        <div className="relative" ref={fileRef}>
          <button
            onClick={() => setFileOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={fileOpen}
            className="px-3 py-1.5 rounded text-sm font-medium hover:bg-white/15"
          >
            File {"\u25BE"}
          </button>
          {fileOpen && (
            <div
              role="menu"
              className="absolute left-0 top-full mt-1 w-56 bg-white rounded shadow-lg border border-gray-200 py-1 z-50"
            >
              <button className={fileItem} onClick={runFile(onNew)}>
                New
              </button>
              <button className={fileItem} onClick={runFile(onOpen)}>
                Open Excel{"\u2026"}
              </button>
              <button className={fileItem} onClick={runFile(onSave)}>
                Save Excel
              </button>

              <div className="my-1 border-t border-gray-200" />

              <button className={fileItem} onClick={runFile(onExportProject)}>
                {"\uD83D\uDCBE"} Export project{"\u2026"}
              </button>
              <button className={fileItem} onClick={runFile(onImportProject)}>
                {"\uD83D\uDCC2"} Import project{"\u2026"}
              </button>

              <div className="my-1 border-t border-gray-200" />

              <button
                className={`${fileItem} text-red-600`}
                onClick={runFile(onSignOut)}
              >
                Sign out
              </button>
            </div>
          )}
        </div>

        <span className="mx-1 text-white/40">|</span>
        <button
          onClick={() => router.push("/")}
          className="font-bold text-sm mr-2 hover:underline"
          title="Go to landing page"
        >
          Six Sigma Analyzer
        </button>

        {/* DMAIC phase buttons */}
        {PHASES.map((p) => (
          <button
            key={p.name}
            onClick={() => togglePhase(p.name)}
            aria-pressed={activePhase === p.name}
            className={`px-3 py-1.5 rounded text-sm font-medium ${
              activePhase === p.name
                ? "bg-white text-[#00674d]"
                : "hover:bg-white/15"
            }`}
          >
            {p.name}
          </button>
        ))}

        {/* User + sign out (right) */}
        <div className="ml-auto flex items-center gap-3 text-sm">
          {userEmail && <span className="text-white/80">{userEmail}</span>}
          <button
            onClick={onSignOut}
            className="bg-white/15 hover:bg-white/25 px-3 py-1 rounded"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* SECONDARY ROW: tools for the active phase.
          Esta fila es una cinta de opciones y permanece visible a proposito:
          se recoge pulsando de nuevo la fase. Lo que si se cierra al pulsar
          fuera son los submenus de cada herramienta. */}
      {activePhase && (
        <div
          ref={toolsRef}
          className="flex flex-wrap items-center gap-1 bg-[#00513d] px-3 py-1.5"
        >
          {phaseTools.length === 0 && (
            <span className="text-white/60 text-sm">
              No tools available in this phase yet.
            </span>
          )}
          {phaseTools.map((t) => (
            <div key={t.id} className="relative">
              <button
                onClick={() => handleToolClick(t)}
                disabled={!t.enabled}
                aria-haspopup={t.children ? "menu" : undefined}
                aria-expanded={t.children ? openGroup === t.id : undefined}
                className={`px-3 py-1 text-sm rounded ${
                  t.enabled
                    ? "bg-white/10 hover:bg-white/25 text-white"
                    : "text-white/40 cursor-not-allowed"
                }`}
                title={t.enabled ? "" : "Coming soon"}
              >
                {t.label}
                {t.children ? " \u25BE" : ""}
              </button>

              {/* Sub-menu for grouped tools.
                  Un hijo con children propios abre un tercer nivel lateral al
                  pasar por encima. El flyout es hijo del mismo <div> que lo
                  dispara, asi que mover el raton hacia el no lo cierra. */}
              {t.children && openGroup === t.id && (
                <div
                  role="menu"
                  className="absolute left-0 top-full mt-1 w-60 bg-white rounded shadow-lg border border-gray-200 py-1 z-50"
                >
                  {t.children.map((c) => {
                    if (c.separator) {
                      return (
                        <div key={c.id} className="my-1 border-t border-gray-200" />
                      );
                    }

                    if (c.children) {
                      const open = openSub === c.id;
                      return (
                        <div
                          key={c.id}
                          className="relative"
                          onMouseEnter={() => setOpenSub(c.id)}
                          onMouseLeave={() => setOpenSub(null)}
                        >
                          <button
                            type="button"
                            aria-haspopup="menu"
                            aria-expanded={open}
                            onClick={() => setOpenSub(open ? null : c.id)}
                            className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                              open
                                ? "bg-gray-100 text-gray-800"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <span>{c.label}</span>
                            <span className="ml-3 text-gray-400">{"\u25B8"}</span>
                          </button>

                          {open && (
                            <div
                              role="menu"
                              /* -mt-1 alinea el primer item del flyout con su
                                 disparador; left-full lo saca por la derecha. */
                              className="absolute left-full top-0 -mt-1 ml-0.5 w-56 rounded border border-gray-200 bg-white py-1 shadow-lg z-50"
                            >
                              {c.children.map((g) =>
                                g.separator ? (
                                  <div
                                    key={g.id}
                                    className="my-1 border-t border-gray-200"
                                  />
                                ) : (
                                  <button
                                    key={g.id}
                                    onClick={() => handleChildClick(g)}
                                    disabled={!g.enabled}
                                    className={`w-full px-4 py-2 text-left text-sm ${
                                      g.enabled
                                        ? "text-gray-700 hover:bg-gray-100"
                                        : "text-gray-400 cursor-not-allowed"
                                    }`}
                                    title={g.enabled ? "" : "Coming soon"}
                                  >
                                    {g.label}
                                  </button>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <button
                        key={c.id}
                        onClick={() => handleChildClick(c)}
                        onMouseEnter={() => setOpenSub(null)}
                        disabled={!c.enabled}
                        className={`w-full px-4 py-2 text-left text-sm ${
                          c.enabled
                            ? "text-gray-700 hover:bg-gray-100"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                        title={c.enabled ? "" : "Coming soon"}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

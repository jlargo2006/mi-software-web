"use client";

import React, { useState, useRef, useEffect } from "react";
import { PHASES, RibbonTool, ToolId } from "../lib/ribbon";

interface MenuBarProps {
  userEmail?: string;
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSignOut: () => void;
  onSelectTool: (tool: ToolId) => void;
}

export default function MenuBar({
  userEmail,
  onNew,
  onOpen,
  onSave,
  onSignOut,
  onSelectTool,
}: MenuBarProps) {
  const [fileOpen, setFileOpen] = useState(false);
  const [activePhase, setActivePhase] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const fileRef = useRef<HTMLDivElement>(null);

  // Close the File menu when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (fileRef.current && !fileRef.current.contains(e.target as Node)) {
        setFileOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  const togglePhase = (name: string) => {
    setActivePhase((prev) => (prev === name ? null : name));
    setOpenGroup(null);
  };

  const phaseTools = PHASES.find((p) => p.name === activePhase)?.tools ?? [];

  const handleToolClick = (t: RibbonTool) => {
    if (!t.enabled) return;
    if (t.children) {
      setOpenGroup((prev) => (prev === t.id ? null : t.id));
      return;
    }
    if (t.tool) onSelectTool(t.tool);
  };

  const handleChildClick = (child: RibbonTool) => {
    if (!child.enabled || !child.tool) return;
    onSelectTool(child.tool);
    setOpenGroup(null);
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
            className="px-3 py-1.5 rounded text-sm font-medium hover:bg-white/15"
          >
            File ▾
          </button>
          {fileOpen && (
            <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded shadow-lg border border-gray-200 py-1 z-50">
              <button className={fileItem} onClick={() => { setFileOpen(false); onNew(); }}>
                New
              </button>
              <button className={fileItem} onClick={() => { setFileOpen(false); onOpen(); }}>
                Open Excel…
              </button>
              <button className={fileItem} onClick={() => { setFileOpen(false); onSave(); }}>
                Save Excel
              </button>
              <div className="my-1 border-t border-gray-200" />
              <button
                className={`${fileItem} text-red-600`}
                onClick={() => { setFileOpen(false); onSignOut(); }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>

        <span className="mx-1 text-white/40">|</span>
        <span className="font-bold text-sm mr-2">Six Sigma Analyzer</span>

        {/* DMAIC phase buttons */}
        {PHASES.map((p) => (
          <button
            key={p.name}
            onClick={() => togglePhase(p.name)}
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

      {/* SECONDARY ROW: tools for the active phase */}
      {activePhase && (
        <div className="flex flex-wrap items-center gap-1 bg-[#00513d] px-3 py-1.5">
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
                className={`px-3 py-1 text-sm rounded ${
                  t.enabled
                    ? "bg-white/10 hover:bg-white/25 text-white"
                    : "text-white/40 cursor-not-allowed"
                }`}
                title={t.enabled ? "" : "Coming soon"}
              >
                {t.label}
                {t.children ? " ▾" : ""}
              </button>

              {/* Sub-menu for grouped tools */}
              {t.children && openGroup === t.id && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded shadow-lg border border-gray-200 py-1 z-50">
                  {t.children.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleChildClick(c)}
                      disabled={!c.enabled}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        c.enabled
                          ? "text-gray-700 hover:bg-gray-100"
                          : "text-gray-400 cursor-not-allowed"
                      }`}
                      title={c.enabled ? "" : "Coming soon"}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


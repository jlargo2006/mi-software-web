"use client";

import React, { useRef, useState } from "react";
import { useWorkbook } from "./hooks/useWorkbook";
import { readExcelFile, writeExcelFile } from "./lib/excel";
import { ToolId } from "./lib/ribbon";
import MenuBar from "./components/MenuBar";
import DataGrid from "./components/DataGrid";
import SheetTabs from "./components/SheetTabs";
import Splitter from "./components/Splitter";
import AnalysisPanel from "./components/AnalysisPanel";

type ViewMode = "split" | "grid" | "graphics";

interface SavedStudy {
  id: string;
  type: "capability" | "normality";
  name: string;
  params: Record<string, unknown>;
  results: Record<string, unknown>;
}

interface SixSigmaAnalyzerProps {
  userEmail?: string;
  onSignOut: () => void;
}

export default function SixSigmaAnalyzer({
  userEmail,
  onSignOut,
}: SixSigmaAnalyzerProps) {
  const wb = useWorkbook();
  const [view, setView] = useState<ViewMode>("split");
  const [topPercent, setTopPercent] = useState(80);
  const [activeTool, setActiveTool] = useState<ToolId>(null);
  const [studies, setStudies] = useState<SavedStudy[]>([]);
  const splitRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (file: File) => {
    try {
      const { data, order } = await readExcelFile(file);
      wb.loadWorkbook(data, order);
    } catch (err) {
      alert("Could not read file: " + (err as Error).message);
    }
  };

  const handleExport = () => writeExcelFile(wb.data, wb.order);

  const handleNew = () => {
    const ok = window.confirm(
      "Do you want to save your current work before clearing it?\n\nOK = save first, Cancel = discard."
    );
    if (ok) handleExport();
    wb.resetWorkbook();
    setStudies([]);
    setActiveTool(null);
  };

  const saveStudy = (study: Omit<SavedStudy, "id">) => {
    setStudies((prev) => [{ ...study, id: crypto.randomUUID() }, ...prev]);
  };

  const showTop = view === "split" || view === "graphics";
  const showBottom = view === "split" || view === "grid";

  const viewBtn = (mode: ViewMode, label: string) => (
    <button
      onClick={() => setView(mode)}
      className={`px-3 py-1 text-xs rounded border ${
        view === mode
          ? "bg-[#00674d] text-white border-[#00674d]"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <MenuBar
        userEmail={userEmail}
        onNew={handleNew}
        onOpen={() => fileInputRef.current?.click()}
        onSave={handleExport}
        onSignOut={onSignOut}
        onSelectTool={(tool) => {
          setActiveTool(tool);
          if (view === "grid") setView("split");
        }}
      />

      {/* Hidden file input for "Open Excel" */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleImport(f);
          e.target.value = "";
        }}
      />

      {/* Body: sidebar + central area */}
      <div className="flex flex-1 min-h-0">
        {/* Saved studies sidebar */}
        <aside className="w-52 bg-gray-50 border-r border-gray-300 flex flex-col shrink-0">
          <div className="px-3 py-2 font-semibold text-sm text-gray-700 border-b border-gray-300">
            Saved Studies
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {studies.length === 0 && (
              <div className="text-sm text-gray-400">No saved studies yet.</div>
            )}
            {studies.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveTool(s.type);
                  if (view === "grid") setView("split");
                }}
                className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-emerald-50 border border-transparent hover:border-[#00674d] text-gray-700"
              >
                {s.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Central area: two frames + splitter */}
        <div className="flex-1 flex flex-col min-w-0">
          <div ref={splitRef} className="flex-1 flex flex-col min-h-0">
            {showTop && (
              <div
                className="overflow-auto bg-white border-b border-gray-200"
                style={{ height: view === "split" ? `${topPercent}%` : "100%" }}
              >
                <AnalysisPanel
                  tool={activeTool}
                  sheet={wb.data[wb.activeSheet] ?? []}
                  onSaveStudy={saveStudy}
                />
              </div>
            )}

            {view === "split" && (
              <Splitter onChange={setTopPercent} containerRef={splitRef} />
            )}

            {showBottom && (
              <div
                className="overflow-hidden flex flex-col min-h-0"
                style={{
                  height: view === "split" ? `${100 - topPercent}%` : "100%",
                }}
              >
                <div className="flex-1 overflow-auto">
                  <DataGrid
                    sheet={wb.data[wb.activeSheet] ?? []}
                    onCellChange={wb.setCell}
                    onPaste={wb.pasteData}
                  />
                </div>
              </div>
            )}
          </div>

          {showBottom && (
            <SheetTabs
              order={wb.order}
              activeSheet={wb.activeSheet}
              onSelect={wb.setActiveSheet}
              onAddSheet={wb.addSheet}
              onDeleteSheet={wb.deleteSheet}
              onAddRow={wb.addRow}
              onDeleteRow={wb.deleteRow}
              onAddColumn={wb.addColumn}
              onDeleteColumn={wb.deleteColumn}
            />
          )}

          <div className="flex justify-end gap-2 bg-gray-100 border-t border-gray-300 px-3 py-1.5 shrink-0">
            {viewBtn("split", "⊞ Split")}
            {viewBtn("grid", "▦ Grid only")}
            {viewBtn("graphics", "📊 Charts only")}
          </div>
        </div>
      </div>
    </div>
  );
}

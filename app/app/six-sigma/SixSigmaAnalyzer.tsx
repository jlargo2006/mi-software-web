"use client";

import React, { useRef, useState } from "react";
import { useWorkbook } from "./hooks/useWorkbook";
import { readExcelFile, writeExcelFile } from "./lib/excel";
import TopBar from "./components/TopBar";
import DataGrid from "./components/DataGrid";
import SheetTabs from "./components/SheetTabs";
import Splitter from "./components/Splitter";

type ViewMode = "split" | "grid" | "graphics";
const PHASES = ["Define", "Measure", "Analyze", "Improve", "Control"];

export default function SixSigmaAnalyzer() {
  const wb = useWorkbook();
  const [view, setView] = useState<ViewMode>("split");
  const [topPercent, setTopPercent] = useState(45);
  const [activePhase, setActivePhase] = useState("Measure");
  const splitRef = useRef<HTMLDivElement>(null);

  const handleImport = async (file: File) => {
    try {
      const { data, order } = await readExcelFile(file);
      wb.loadWorkbook(data, order);
    } catch (err) {
      alert("No se pudo leer el archivo: " + (err as Error).message);
    }
  };

  const handleExport = () => writeExcelFile(wb.data, wb.order);

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
      {/* Barra superior */}
      <TopBar onImport={handleImport} onExport={handleExport} />

      {/* Barra DMAIC */}
      <div className="flex gap-1 bg-gray-100 border-b border-gray-300 px-3 py-1.5 shrink-0">
        {PHASES.map((p) => (
          <button
            key={p}
            onClick={() => setActivePhase(p)}
            className={`px-4 py-1 text-sm rounded font-medium ${
              activePhase === p
                ? "bg-[#00674d] text-white"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Cuerpo: sidebar + área central */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar de estudios (izquierda) */}
        <aside className="w-52 bg-gray-50 border-r border-gray-300 flex flex-col shrink-0">
          <div className="px-3 py-2 font-semibold text-sm text-gray-700 border-b border-gray-300">
            Saved Studies
          </div>
          <div className="flex-1 overflow-y-auto p-2 text-sm text-gray-400">
            (Aún no hay estudios guardados)
          </div>
        </aside>

        {/* Área central: 2 frames + splitter */}
        <div className="flex-1 flex flex-col min-w-0">
          <div ref={splitRef} className="flex-1 flex flex-col min-h-0">
            {/* FRAME SUPERIOR: resultados / gráficos */}
            {showTop && (
              <div
                className="overflow-auto bg-gray-50 border-b border-gray-200"
                style={{ height: view === "split" ? `${topPercent}%` : "100%" }}
              >
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  Aquí aparecerán los resultados y gráficos de los estudios.
                </div>
              </div>
            )}

            {/* SPLITTER (solo en vista dividida) */}
            {view === "split" && (
              <Splitter onChange={setTopPercent} containerRef={splitRef} />
            )}
            {/* FRAME INFERIOR: grid */}
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

          {/* Pestañas de hojas (debajo del grid) */}
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

          {/* 3 botones de vista (abajo derecha) */}
          <div className="flex justify-end gap-2 bg-gray-100 border-t border-gray-300 px-3 py-1.5 shrink-0">
            {viewBtn("split", "⊞ Split")}
            {viewBtn("grid", "▦ Solo grid")}
            {viewBtn("graphics", "📊 Solo gráficos")}
          </div>
        </div>
      </div>
    </div>
  );
}

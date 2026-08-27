// app/app/six-sigma/components/SidebarSplitter.tsx
"use client";

import React from "react";

interface SidebarSplitterProps {
  onStartDrag: (clientX: number) => void;
  onReset: () => void;
  onNudge: (delta: number) => void;
  dragging: boolean;
  width: number;
}

/**
 * Divisor vertical entre el panel lateral y el area central.
 *
 * Es estrecho a la vista (2px) pero ancho al raton (8px con un margen
 * negativo): un divisor de 2px reales obliga a apuntar con precision.
 */
export default function SidebarSplitter({
  onStartDrag,
  onReset,
  onNudge,
  dragging,
  width,
}: SidebarSplitterProps) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize saved studies panel"
      aria-valuenow={width}
      tabIndex={0}
      onPointerDown={(e) => {
        e.preventDefault();
        onStartDrag(e.clientX);
      }}
      onDoubleClick={onReset}
      onKeyDown={(e) => {
        // Accesible con teclado: el arrastre solo con raton excluye a quien
        // navega con tabulador.
        if (e.key === "ArrowLeft") onNudge(-16);
        if (e.key === "ArrowRight") onNudge(16);
      }}
      title="Drag to resize \u2014 double-click to reset"
      className={`w-2 -mx-1 shrink-0 cursor-col-resize z-10 flex justify-center
        group focus:outline-none ${dragging ? "bg-[#00674d]/20" : ""}`}
    >
      <span
        className={`w-0.5 h-full transition-colors ${
          dragging ? "bg-[#00674d]" : "bg-gray-300 group-hover:bg-[#00674d]/60"
        }`}
      />
    </div>
  );
}

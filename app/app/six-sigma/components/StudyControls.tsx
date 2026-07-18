// components/StudyControls.tsx
// Contenedor GENERICO de controles de configuracion de un estudio.
// En modo "view" (estudio guardado) NO renderiza ningun control.
// Regla para todos los estudios: control de entrada -> dentro de StudyControls;
// resultado/grafico -> fuera.
"use client";

import React from "react";

export type StudyMode = "edit" | "view";

interface StudyControlsProps {
  mode: StudyMode;
  children: React.ReactNode;
  /** Si false, no aplica el contenedor con estilo (util para botones sueltos). */
  boxed?: boolean;
}

export default function StudyControls({
  mode,
  children,
  boxed = true,
}: StudyControlsProps) {
  if (mode === "view") return null;
  if (!boxed) return <>{children}</>;
  return (
    <div className="flex flex-wrap items-end gap-3 mb-4 bg-gray-50 p-3 rounded border border-gray-200">
      {children}
    </div>
  );
}

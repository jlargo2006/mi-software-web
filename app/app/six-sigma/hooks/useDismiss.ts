// app/app/six-sigma/hooks/useDismiss.ts

"use client";

import { useEffect } from "react";

/**
 * Cierra un menu flotante al pulsar fuera de el o al pulsar Escape.
 *
 * Se escucha "pointerdown" y no "click" a proposito: el menu debe cerrarse
 * ANTES de que la pulsacion llegue al control que hay debajo, que es lo que el
 * usuario espera. Con "click" el menu sigue abierto durante la pulsacion y
 * puede tapar el destino.
 *
 * Los listeners solo se instalan cuando el menu esta abierto (`active`), para
 * no tener docenas de manejadores dormidos en el documento.
 *
 * @param ref     Contenedor del menu (boton + panel). Una pulsacion dentro no cierra.
 * @param onClose Se invoca para cerrar. Conviene envolverlo en useCallback.
 * @param active  Si el menu esta abierto.
 */
export function useDismiss(
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void,
  active: boolean
) {
  useEffect(() => {
    if (!active) return;

    const onPointerDown = (e: PointerEvent) => {
      const el = ref.current;
      if (el && !el.contains(e.target as Node)) onClose();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [ref, onClose, active]);
}

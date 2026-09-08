// app/app/six-sigma/hooks/useDraggable.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Pos {
  x: number;
  y: number;
}

/**
 * Arrastrar una ventana flotante por su barra de titulo.
 *
 * Los manejadores se declaran DENTRO de onMouseDown, no en useCallback a nivel
 * de hook. Asi onUp puede desregistrarse a si mismo (dentro de su cuerpo ya
 * esta declarado) y se quita siempre exactamente la misma referencia que se
 * anadio. Es el mismo patron que startResize en el DataGrid.
 */
export function useDraggable() {
  // null = todavia centrado por CSS. En cuanto se arrastra pasa a coordenadas
  // absolutas. Asi el dialogo aparece centrado sin tener que medirlo antes.
  const [pos, setPos] = useState<Pos | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  // Solo para poder cortar un arrastre en curso si el dialogo se desmonta.
  const cleanupRef = useRef<(() => void) | null>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    // Solo boton principal, y nunca desde un control de la cabecera (la X).
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button, input, select, textarea")) return;

    const el = boxRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const dx = e.clientX - r.left;
    const dy = e.clientY - r.top;
    const w = r.width;

    // Se fija la posicion actual antes de mover: hasta ahora estaba centrado
    // con transform y saltaria de golpe al primer pixel de arrastre.
    setPos({ x: r.left, y: r.top });

    const onMove = (ev: MouseEvent) => {
      // Se deja siempre un trozo visible: si la ventana sale entera de la
      // pantalla ya no hay forma de recuperarla con el raton.
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 40;
      setPos({
        x: Math.min(Math.max(ev.clientX - dx, 80 - w), maxX),
        y: Math.min(Math.max(ev.clientY - dy, 0), maxY),
      });
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.userSelect = "";
      cleanupRef.current = null;
    };

    e.preventDefault();
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    cleanupRef.current = onUp;
  }, []);

  // Red de seguridad: si el dialogo se cierra a mitad de arrastre, los
  // listeners quedarian colgados de window para siempre.
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  const style: React.CSSProperties = pos
    ? { left: pos.x, top: pos.y, transform: "none" }
    : { left: "50%", top: "50%", transform: "translate(-50%, -50%)" };

  return { boxRef, style, onMouseDown };
}

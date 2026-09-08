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
 * Mismo patron que el redimensionado de columnas del DataGrid, que es el que
 * funciona en esta app: eventos de raton y listeners en window anadidos dentro
 * del propio manejador. Con setPointerCapture el navegador deja de entregar
 * los move de forma fiable en cuanto hay elementos sticky de por medio.
 */
export function useDraggable() {
  // null = todavia centrado por CSS. En cuanto se arrastra pasa a coordenadas
  // absolutas. Asi el dialogo aparece centrado sin tener que medirlo antes.
  const [pos, setPos] = useState<Pos | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ dx: number; dy: number; w: number; h: number } | null>(null);

  // Los manejadores viven en refs, no en useCallback: stop tiene que poder
  // desregistrarse a si mismo, y una funcion no puede referenciarse dentro de
  // su propia definicion. Ademas garantiza que se quita EXACTAMENTE la misma
  // referencia que se anadio, sin depender de que el callback no se recree.
  const onMoveRef = useRef<(e: MouseEvent) => void>(() => {});
  const stopRef = useRef<() => void>(() => {});

  onMoveRef.current = (e: MouseEvent) => {
    const d = dragRef.current;
    if (!d) return;
    // Se deja siempre un trozo visible: si la ventana sale entera de la
    // pantalla ya no hay forma de recuperarla con el raton.
    const maxX = window.innerWidth - 80;
    const maxY = window.innerHeight - 40;
    setPos({
      x: Math.min(Math.max(e.clientX - d.dx, 80 - d.w), maxX),
      y: Math.min(Math.max(e.clientY - d.dy, 0), maxY),
    });
  };

  const onMove = useCallback((e: MouseEvent) => onMoveRef.current(e), []);

  const stop = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", stopRef.current);
    document.body.style.userSelect = "";
  }, [onMove]);

  stopRef.current = stop;

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Solo boton principal, y nunca desde un control de la cabecera (la X).
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest("button, input, select, textarea")) return;

      const el = boxRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      dragRef.current = {
        dx: e.clientX - r.left,
        dy: e.clientY - r.top,
        w: r.width,
        h: r.height,
      };
      // Se fija la posicion actual antes de mover: hasta ahora estaba centrado
      // con transform y saltaria de golpe al primer pixel de arrastre.
      setPos({ x: r.left, y: r.top });

      e.preventDefault();
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", stopRef.current);
    },
    [onMove, stop]
  );

  // Red de seguridad: si el componente se desmonta a mitad de arrastre, los
  // listeners quedarian colgados de window para siempre.
  useEffect(() => stop, [stop]);

  const style: React.CSSProperties = pos
    ? { left: pos.x, top: pos.y, transform: "none" }
    : { left: "50%", top: "50%", transform: "translate(-50%, -50%)" };

  return { boxRef, style, onMouseDown };
}

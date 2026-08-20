// app/app/six-sigma/hooks/useSidebar.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const MIN = 160;   // por debajo, los nombres de estudio no se leen
const MAX = 480;
const DEFAULT = 208; // el w-52 que habia fijo (13rem)
const KEY = "sixsigma.sidebarWidth";

/**
 * Ancho del panel lateral, arrastrable y plegable.
 *
 * El ancho se guarda en localStorage porque es una preferencia de puesto de
 * trabajo, no del proyecto: quien tiene pantalla ancha lo quiere ancho siempre,
 * y no tendria sentido que viajara dentro del fichero .sixsigma.
 *
 * Plegar no altera el ancho guardado, para que al desplegar se recupere el que
 * el usuario habia elegido.
 */
export function useSidebar() {
  const [width, setWidth] = useState(DEFAULT);
  const [collapsed, setCollapsed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const asideRef = useRef<HTMLElement | null>(null);

  // La lectura va en un efecto y no en el estado inicial: en el primer render
  // del servidor no hay localStorage, y usarlo ahi provoca un desajuste de
  // hidratacion.
  useEffect(() => {
    const saved = Number(window.localStorage.getItem(KEY));
    if (Number.isFinite(saved) && saved >= MIN && saved <= MAX) setWidth(saved);
  }, []);

  const clamp = (n: number) => Math.min(MAX, Math.max(MIN, n));

  const startDrag = useCallback(() => setDragging(true), []);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: PointerEvent) => {
      const left = asideRef.current?.getBoundingClientRect().left ?? 0;
      setWidth(clamp(e.clientX - left));
    };
    const onUp = () => setDragging(false);

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    // Sin esto, arrastrar sobre la rejilla selecciona texto y el cursor
    // parpadea entre la flecha y la barra de redimension.
    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
    };
  }, [dragging]);

  // Se persiste al soltar, no en cada pixel del arrastre.
  useEffect(() => {
    if (dragging) return;
    window.localStorage.setItem(KEY, String(width));
  }, [dragging, width]);

  const nudge = useCallback((delta: number) => {
    setWidth((w) => clamp(w + delta));
  }, []);

  return {
    width,
    collapsed,
    dragging,
    asideRef,
    startDrag,
    nudge,
    reset: useCallback(() => setWidth(DEFAULT), []),
    toggle: useCallback(() => setCollapsed((c) => !c), []),
    expand: useCallback(() => setCollapsed(false), []),
  };
}

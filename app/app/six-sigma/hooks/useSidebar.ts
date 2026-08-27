// app/app/six-sigma/hooks/useSidebar.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const MIN = 160;   // por debajo, los nombres de estudio no se leen
const MAX = 480;
const DEFAULT = 208; // el w-52 que habia fijo (13rem)
const KEY = "sixsigma.sidebarWidth";

const clamp = (n: number) => Math.min(MAX, Math.max(MIN, n));

/**
 * Lee la preferencia guardada. En el render del servidor no hay localStorage,
 * asi que devuelve el valor por omision: el <aside> lleva
 * suppressHydrationWarning para tolerar esa diferencia de un solo render.
 */
function initialWidth(): number {
  if (typeof window === "undefined") return DEFAULT;
  const saved = Number(window.localStorage.getItem(KEY));
  return Number.isFinite(saved) && saved >= MIN && saved <= MAX ? saved : DEFAULT;
}

/**
 * Ancho del panel lateral, arrastrable y plegable.
 *
 * El ancho se guarda en localStorage porque es una preferencia de puesto de
 * trabajo, no del proyecto: no tendria sentido que viajara dentro del .sixsigma.
 *
 * Plegar no altera el ancho guardado, para que al desplegar se recupere el que
 * el usuario habia elegido.
 */
export function useSidebar() {
  const [width, setWidth] = useState<number>(initialWidth);
  const [collapsed, setCollapsed] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Origen del arrastre. Es un ref interno y no sale del hook: devolverlo
  // haria que el linter tratase todo el objeto como un ref.
  const origin = useRef({ x: 0, width: DEFAULT });

  /**
   * El ancho se calcula como desplazamiento respecto al punto de pulsacion, no
   * midiendo el borde del panel. Asi no hace falta un ref al <aside> y da igual
   * lo que haya a su izquierda en el layout.
   */
  const startDrag = useCallback((clientX: number) => {
    setDragging(true);
    setWidth((w) => {
      origin.current = { x: clientX, width: w };
      return w;
    });
  }, []);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: PointerEvent) => {
      setWidth(clamp(origin.current.width + (e.clientX - origin.current.x)));
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
    startDrag,
    nudge,
    reset: useCallback(() => setWidth(DEFAULT), []),
    toggle: useCallback(() => setCollapsed((c) => !c), []),
    expand: useCallback(() => setCollapsed(false), []),
  };
}

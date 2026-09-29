import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  MARGEN_VIEWPORT_PANEL_FILTRO,
  SEPARACION_PANEL_FILTRO,
} from "@maximilian/shared/constants/components/coordinador/custom-encabezado-filtro-factura.constants";

export function usePanelFiltroFlotante() {
  const [estaAbierto, setEstaAbierto] = useState(false);
  const refDisparador = useRef<HTMLButtonElement>(null);
  const refPanel = useRef<HTMLDivElement>(null);

  const posicionarPanel = useCallback(() => {
    const disparador = refDisparador.current;
    const panel = refPanel.current;
    if (!disparador || !panel) return;

    const ancla = disparador.getBoundingClientRect();
    const anchoPanel = panel.offsetWidth;
    const altoPanel = panel.offsetHeight;
    const limiteDerecho = window.innerWidth - MARGEN_VIEWPORT_PANEL_FILTRO;
    const limiteInferior = window.innerHeight - MARGEN_VIEWPORT_PANEL_FILTRO;

    const izquierda = ancla.left + anchoPanel <= limiteDerecho
      ? ancla.left
      : Math.max(MARGEN_VIEWPORT_PANEL_FILTRO, Math.min(ancla.right - anchoPanel, limiteDerecho - anchoPanel));

    const arribaDebajo = ancla.bottom + SEPARACION_PANEL_FILTRO;
    const arribaEncima = ancla.top - SEPARACION_PANEL_FILTRO - altoPanel;
    const arriba = arribaDebajo + altoPanel <= limiteInferior || arribaEncima < MARGEN_VIEWPORT_PANEL_FILTRO
      ? arribaDebajo
      : arribaEncima;

    panel.style.top = `${arriba}px`;
    panel.style.left = `${izquierda}px`;
    panel.style.maxWidth = `${window.innerWidth - MARGEN_VIEWPORT_PANEL_FILTRO * 2}px`;
  }, []);

  useLayoutEffect(() => {
    if (!estaAbierto) return;

    posicionarPanel();
    window.addEventListener("resize", posicionarPanel);
    window.addEventListener("scroll", posicionarPanel, true);
    return () => {
      window.removeEventListener("resize", posicionarPanel);
      window.removeEventListener("scroll", posicionarPanel, true);
    };
  }, [estaAbierto, posicionarPanel]);

  return {
    alternarPanel: () => setEstaAbierto((valorActual) => !valorActual),
    cerrarPanel: () => setEstaAbierto(false),
    estaAbierto,
    refDisparador,
    refPanel,
  };
}

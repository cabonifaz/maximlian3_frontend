import { useRef, useState } from "react";
import type { InformeObservacion } from "@maximilian/shared/types/informe.type";

export function useModalObservacionesRechazoAnalista(
  observaciones: InformeObservacion[],
) {
  const [posicion, setPosicion] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [dimensiones, setDimensiones] = useState<{
    ancho: number;
    alto: number;
  } | null>(null);
  const [observacionesDesplegadas, setObservacionesDesplegadas] = useState<
    Set<number>
  >(() => new Set());
  const panelRef = useRef<HTMLDivElement>(null);
  const arrastreRef = useRef<{
    desplazamientoX: number;
    desplazamientoY: number;
  } | null>(null);
  const redimensionRef = useRef<{
    xInicial: number;
    yInicial: number;
    anchoInicial: number;
    altoInicial: number;
  } | null>(null);

  const totalCumplidas = observaciones.filter(
    (observacion) => observacion.checked,
  ).length;

  const alternarObservacionDesplegada = (idInformeObservacion: number) => {
    setObservacionesDesplegadas((idsActuales) => {
      const nuevosIds = new Set(idsActuales);
      if (nuevosIds.has(idInformeObservacion)) {
        nuevosIds.delete(idInformeObservacion);
      } else {
        nuevosIds.add(idInformeObservacion);
      }
      return nuevosIds;
    });
  };

  const iniciarArrastre = (evento: React.PointerEvent<HTMLDivElement>) => {
    if (!panelRef.current) return;
    const limites = panelRef.current.getBoundingClientRect();
    arrastreRef.current = {
      desplazamientoX: evento.clientX - limites.left,
      desplazamientoY: evento.clientY - limites.top,
    };
    setPosicion({ x: limites.left, y: limites.top });
    evento.currentTarget.setPointerCapture(evento.pointerId);
  };

  const moverPanel = (evento: React.PointerEvent<HTMLDivElement>) => {
    const arrastre = arrastreRef.current;
    const panel = panelRef.current;
    if (!arrastre || !panel) return;

    const margen = 8;
    const xMaximo = Math.max(
      margen,
      window.innerWidth - panel.offsetWidth - margen,
    );
    const yMaximo = Math.max(
      margen,
      window.innerHeight - panel.offsetHeight - margen,
    );

    setPosicion({
      x: Math.min(
        xMaximo,
        Math.max(margen, evento.clientX - arrastre.desplazamientoX),
      ),
      y: Math.min(
        yMaximo,
        Math.max(margen, evento.clientY - arrastre.desplazamientoY),
      ),
    });
  };

  const finalizarArrastre = (evento: React.PointerEvent<HTMLDivElement>) => {
    arrastreRef.current = null;
    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId);
    }
  };

  const iniciarRedimension = (evento: React.PointerEvent<HTMLDivElement>) => {
    if (!panelRef.current) return;
    evento.preventDefault();
    evento.stopPropagation();
    const limites = panelRef.current.getBoundingClientRect();
    redimensionRef.current = {
      xInicial: limites.left,
      yInicial: limites.top,
      anchoInicial: limites.width,
      altoInicial: limites.height,
    };
    setPosicion({ x: limites.left, y: limites.top });
    setDimensiones({ ancho: limites.width, alto: limites.height });
    evento.currentTarget.setPointerCapture(evento.pointerId);
  };

  const redimensionarPanel = (evento: React.PointerEvent<HTMLDivElement>) => {
    const redimension = redimensionRef.current;
    if (!redimension) return;

    const margen = 8;
    const bordeDerecho = redimension.xInicial + redimension.anchoInicial;
    const anchoMinimo = Math.min(320, window.innerWidth - margen * 2);
    const anchoMaximo = Math.max(anchoMinimo, bordeDerecho - margen);
    const altoMinimo = Math.min(280, window.innerHeight - margen * 2);
    const altoMaximo = Math.max(
      altoMinimo,
      window.innerHeight - redimension.yInicial - margen,
    );
    const ancho = Math.min(
      anchoMaximo,
      Math.max(
        anchoMinimo,
        redimension.anchoInicial - (evento.clientX - redimension.xInicial),
      ),
    );
    const alto = Math.min(
      altoMaximo,
      Math.max(altoMinimo, evento.clientY - redimension.yInicial),
    );

    setPosicion({ x: bordeDerecho - ancho, y: redimension.yInicial });
    setDimensiones({ ancho, alto });
  };

  const finalizarRedimension = (evento: React.PointerEvent<HTMLDivElement>) => {
    redimensionRef.current = null;
    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId);
    }
  };

  return {
    alternarObservacionDesplegada,
    dimensiones,
    finalizarArrastre,
    finalizarRedimension,
    iniciarArrastre,
    iniciarRedimension,
    moverPanel,
    observacionesDesplegadas,
    panelRef,
    posicion,
    redimensionarPanel,
    totalCumplidas,
  };
}

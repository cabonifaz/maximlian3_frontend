import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

const ZOOM_MINIMO_INFORME = 0.35;
const ZOOM_MAXIMO_INFORME = 1.6;
const PASO_ZOOM_INFORME = 0.1;

export type ModoInteraccionInforme = "arrastrar" | "seleccionar";

export function usePanZoomInforme(anchoPaginaPx: number) {
  const contenedorScrollRef = useRef<HTMLDivElement>(null);
  const posicionArrastreRef = useRef({
    x: 0,
    y: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });
  const [zoomInforme, setZoomInforme] = useState(1);
  const [anchoDisponibleInforme, setAnchoDisponibleInforme] = useState(0);
  const [zoomModificadoPorUsuario, setZoomModificadoPorUsuario] = useState(false);
  const [estaArrastrandoInforme, setEstaArrastrandoInforme] = useState(false);
  const [modoInteraccionInforme, setModoInteraccionInforme] = useState<ModoInteraccionInforme>("arrastrar");

  const zoomAjustadoInforme = useMemo(() => {
    if (anchoDisponibleInforme <= 0) return 1;
    const espacioUtil = Math.max(280, anchoDisponibleInforme - 32);
    const zoomAjustado = Math.min(1, espacioUtil / anchoPaginaPx);
    return Math.max(ZOOM_MINIMO_INFORME, Number(zoomAjustado.toFixed(2)));
  }, [anchoDisponibleInforme, anchoPaginaPx]);

  useEffect(() => {
    const contenedor = contenedorScrollRef.current;
    if (!contenedor) return;

    const actualizarAncho = () => {
      setAnchoDisponibleInforme(contenedor.clientWidth);
    };

    actualizarAncho();
    const observador = new ResizeObserver(actualizarAncho);
    observador.observe(contenedor);

    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    if (!zoomModificadoPorUsuario) {
      const idTemporizador = window.setTimeout(() => {
        setZoomInforme(zoomAjustadoInforme);
      }, 0);

      return () => window.clearTimeout(idTemporizador);
    }
  }, [zoomAjustadoInforme, zoomModificadoPorUsuario]);

  const acercarInforme = useCallback(() => {
    setZoomModificadoPorUsuario(true);
    setZoomInforme((zoomActual) => Math.min(ZOOM_MAXIMO_INFORME, Number((zoomActual + PASO_ZOOM_INFORME).toFixed(2))));
  }, []);

  const alejarInforme = useCallback(() => {
    setZoomModificadoPorUsuario(true);
    setZoomInforme((zoomActual) => Math.max(ZOOM_MINIMO_INFORME, Number((zoomActual - PASO_ZOOM_INFORME).toFixed(2))));
  }, []);

  const restablecerZoomInforme = useCallback(() => {
    setZoomModificadoPorUsuario(false);
    setZoomInforme(zoomAjustadoInforme);
  }, [zoomAjustadoInforme]);

  const iniciarArrastreInforme = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (modoInteraccionInforme !== "arrastrar") return;

    const contenedor = contenedorScrollRef.current;
    if (!contenedor || event.pointerType !== "mouse" || event.button !== 0) return;

    const objetivo = event.target as HTMLElement;
    if (objetivo.closest("button, a, input, textarea, select")) return;

    posicionArrastreRef.current = {
      x: event.clientX,
      y: event.clientY,
      scrollLeft: contenedor.scrollLeft,
      scrollTop: contenedor.scrollTop,
    };
    setEstaArrastrandoInforme(true);
    contenedor.setPointerCapture(event.pointerId);
  }, [modoInteraccionInforme]);

  const moverArrastreInforme = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (modoInteraccionInforme !== "arrastrar") return;

    const contenedor = contenedorScrollRef.current;
    if (!contenedor || !estaArrastrandoInforme) return;

    event.preventDefault();
    const posicionInicial = posicionArrastreRef.current;
    contenedor.scrollLeft = posicionInicial.scrollLeft - (event.clientX - posicionInicial.x);
    contenedor.scrollTop = posicionInicial.scrollTop - (event.clientY - posicionInicial.y);
  }, [estaArrastrandoInforme, modoInteraccionInforme]);

  const terminarArrastreInforme = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const contenedor = contenedorScrollRef.current;
    if (!contenedor || !estaArrastrandoInforme) return;

    setEstaArrastrandoInforme(false);
    if (contenedor.hasPointerCapture(event.pointerId)) {
      contenedor.releasePointerCapture(event.pointerId);
    }
  }, [estaArrastrandoInforme]);

  const porcentajeZoom = Math.round(zoomInforme * 100);
  const puedeAlejar = zoomInforme > ZOOM_MINIMO_INFORME;
  const puedeAcercar = zoomInforme < ZOOM_MAXIMO_INFORME;
  const estaModoArrastrarInforme = modoInteraccionInforme === "arrastrar";

  const restablecerZoomNoModificado = useCallback(() => {
    setZoomModificadoPorUsuario(false);
  }, []);

  return {
    contenedorScrollRef,
    zoomInforme,
    zoomModificadoPorUsuario,
    zoomAjustadoInforme,
    restablecerZoomNoModificado,
    estaArrastrandoInforme,
    modoInteraccionInforme,
    setModoInteraccionInforme,
    estaModoArrastrarInforme,
    porcentajeZoom,
    puedeAlejar,
    puedeAcercar,
    acercarInforme,
    alejarInforme,
    restablecerZoomInforme,
    iniciarArrastreInforme,
    moverArrastreInforme,
    terminarArrastreInforme,
  };
}

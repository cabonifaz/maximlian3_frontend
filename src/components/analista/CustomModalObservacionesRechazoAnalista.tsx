import { CheckCircle2, ChevronDown, ChevronUp, ClipboardCheck, Maximize2, Move, X } from "lucide-react";
import { useRef, useState } from "react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import type { InformeObservacion } from "@maximilian/shared/types/informe.type";

interface PropsCustomModalObservacionesRechazoAnalista {
  estaAbierto: boolean;
  observaciones: InformeObservacion[];
  estaCargando: boolean;
  idObservacionActualizando?: number;
  onAbrir: () => void;
  onCerrar: () => void;
  onCambiarEstado: (observacion: InformeObservacion, checked: boolean) => void;
}

export function CustomModalObservacionesRechazoAnalista({
  estaAbierto,
  observaciones,
  estaCargando,
  idObservacionActualizando,
  onAbrir,
  onCerrar,
  onCambiarEstado,
}: PropsCustomModalObservacionesRechazoAnalista) {
  const [posicion, setPosicion] = useState<{ x: number; y: number } | null>(null);
  const [dimensiones, setDimensiones] = useState<{ ancho: number; alto: number } | null>(null);
  const [observacionesDesplegadas, setObservacionesDesplegadas] = useState<Set<number>>(
    () => new Set(),
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const arrastreRef = useRef<{ desplazamientoX: number; desplazamientoY: number } | null>(null);
  const redimensionRef = useRef<{
    xInicial: number;
    yInicial: number;
    anchoInicial: number;
    altoInicial: number;
  } | null>(null);
  const totalCumplidas = observaciones.filter((observacion) => observacion.checked).length;

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
    const xMaximo = Math.max(margen, window.innerWidth - panel.offsetWidth - margen);
    const yMaximo = Math.max(margen, window.innerHeight - panel.offsetHeight - margen);
    setPosicion({
      x: Math.min(xMaximo, Math.max(margen, evento.clientX - arrastre.desplazamientoX)),
      y: Math.min(yMaximo, Math.max(margen, evento.clientY - arrastre.desplazamientoY)),
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
    const altoMaximo = Math.max(altoMinimo, window.innerHeight - redimension.yInicial - margen);
    const ancho = Math.min(
      anchoMaximo,
      Math.max(anchoMinimo, redimension.anchoInicial - (evento.clientX - redimension.xInicial)),
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

  if (!estaAbierto) {
    return (
      <CustomButton
        variant="wine"
        size="sm"
        className="fixed bottom-5 right-5 z-[60] shadow-xl"
        onClick={onAbrir}
      >
        <ClipboardCheck size={16} />
        Observaciones ({totalCumplidas}/{observaciones.length})
      </CustomButton>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]">
      <section
        ref={panelRef}
        className="pointer-events-auto absolute flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-2xl"
        style={{
          ...(posicion ? { left: posicion.x, top: posicion.y } : { right: 16, top: 80 }),
          width: dimensiones?.ancho ?? "min(28rem, calc(100vw - 2rem))",
          ...(dimensiones ? { height: dimensiones.alto } : {}),
        }}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-amber-100 bg-amber-50 px-4 py-3">
          <div
            className="flex min-w-0 flex-1 touch-none cursor-grab select-none items-start gap-3 active:cursor-grabbing"
            onPointerDown={iniciarArrastre}
            onPointerMove={moverPanel}
            onPointerUp={finalizarArrastre}
            onPointerCancel={finalizarArrastre}
          >
            <div className="mt-0.5 rounded-lg bg-amber-100 p-2 text-amber-700">
              <ClipboardCheck size={18} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Correcciones solicitadas</h2>
              <p className="text-xs text-slate-500">Marca cada punto cuando esté resuelto.</p>
              <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <Move size={11} /> Arrastra para mover · redimensiona desde la esquina inferior
              </span>
            </div>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar} aria-label="Cerrar observaciones">
            <X size={18} />
          </CustomButton>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {estaCargando ? (
            <p className="py-8 text-center text-sm text-slate-500">Cargando observaciones...</p>
          ) : observaciones.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No hay observaciones registradas.</p>
          ) : (
            <ul className="space-y-2.5">
              {observaciones.map((observacion, indice) => (
                <li
                  key={observacion.idInformeObservacion}
                  className={`rounded-xl border p-3 transition-colors ${
                    observacion.checked
                      ? "border-emerald-200 bg-emerald-50/70"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={observacion.checked}
                      disabled={idObservacionActualizando === observacion.idInformeObservacion}
                      onChange={(evento) => onCambiarEstado(observacion, evento.target.checked)}
                      className="mt-1 h-4 w-4 accent-emerald-600"
                      aria-label={`Marcar observacion ${indice + 1} como cumplida`}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={[
                          "block text-sm leading-6",
                          observacion.checked ? "text-slate-500 line-through" : "text-slate-700",
                          observacionesDesplegadas.has(observacion.idInformeObservacion)
                            ? "whitespace-pre-wrap break-words"
                            : "overflow-hidden text-ellipsis whitespace-nowrap",
                        ].join(" ")}
                      >
                        <strong className="mr-1">{indice + 1}.</strong>
                        {observacion.observacion}
                      </span>
                      <button
                        type="button"
                        className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand-wine hover:text-brand-black"
                        onClick={(evento) => {
                          evento.preventDefault();
                          evento.stopPropagation();
                          alternarObservacionDesplegada(observacion.idInformeObservacion);
                        }}
                      >
                        {observacionesDesplegadas.has(observacion.idInformeObservacion) ? (
                          <>
                            <ChevronUp size={14} />
                            Ver menos
                          </>
                        ) : (
                          <>
                            <ChevronDown size={14} />
                            Desplegar mas texto
                          </>
                        )}
                      </button>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
          {observaciones.length > 0 && totalCumplidas === observaciones.length ? (
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <CheckCircle2 size={14} /> Todo corregido
            </span>
          ) : null}
          <span>{totalCumplidas} de {observaciones.length} cumplidas</span>
        </footer>

        <div
          role="separator"
          aria-label="Cambiar tamaño del panel"
          className="absolute bottom-1 left-1 z-10 flex h-8 w-8 touch-none cursor-nesw-resize items-end justify-start rounded-bl-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          onPointerDown={iniciarRedimension}
          onPointerMove={redimensionarPanel}
          onPointerUp={finalizarRedimension}
          onPointerCancel={finalizarRedimension}
        >
          <Maximize2 size={14} className="rotate-90" />
        </div>
      </section>
    </div>
  );
}

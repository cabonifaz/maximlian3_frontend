import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Maximize2,
  Move,
  X,
} from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { useModalObservacionesRechazoAnalista } from "@maximilian/hooks/useModalObservacionesRechazoAnalista";
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
  const {
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
  } = useModalObservacionesRechazoAnalista(observaciones);

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
          ...(posicion
            ? { left: posicion.x, top: posicion.y }
            : { right: 16, top: 80 }),
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
              <h2 className="font-bold text-slate-900">
                Correcciones solicitadas
              </h2>
              <p className="text-xs text-slate-500">
                Marca cada punto cuando este resuelto.
              </p>
              <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <Move size={11} /> Arrastra para mover y redimensiona desde la
                esquina inferior
              </span>
            </div>
          </div>
          <CustomButton
            variant="ghost"
            size="icon"
            onClick={onCerrar}
            aria-label="Cerrar observaciones"
          >
            <X size={18} />
          </CustomButton>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {estaCargando ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Cargando observaciones...
            </p>
          ) : observaciones.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No hay observaciones registradas.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {observaciones.map((observacion, indice) => {
                const estaDesplegada = observacionesDesplegadas.has(
                  observacion.idInformeObservacion,
                );

                return (
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
                        disabled={
                          idObservacionActualizando ===
                          observacion.idInformeObservacion
                        }
                        onChange={(evento) =>
                          onCambiarEstado(observacion, evento.target.checked)
                        }
                        className="mt-1 h-4 w-4 accent-emerald-600"
                        aria-label={`Marcar observacion ${indice + 1} como cumplida`}
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={[
                            "block text-sm leading-6",
                            observacion.checked
                              ? "text-slate-500 line-through"
                              : "text-slate-700",
                            estaDesplegada
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
                            alternarObservacionDesplegada(
                              observacion.idInformeObservacion,
                            );
                          }}
                        >
                          {estaDesplegada ? (
                            <>
                              <ChevronUp size={14} />
                              Ver menos
                            </>
                          ) : (
                            <>
                              <ChevronDown size={14} />
                              Desplegar más texto
                            </>
                          )}
                        </button>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
          {observaciones.length > 0 &&
          totalCumplidas === observaciones.length ? (
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <CheckCircle2 size={14} /> Todo corregido
            </span>
          ) : null}
          <span>
            {totalCumplidas} de {observaciones.length} cumplidas
          </span>
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

import { CircleAlert, Maximize2, Move, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import type { InformeObservacion } from "@maximilian/shared/types/informe.type";

interface PropsCustomModalRechazoInforme {
  estaAbierto: boolean;
  observacionesRechazo: InformeObservacion[];
  onObservacionesRechazoChange: (valor: InformeObservacion[]) => void;
  onCerrar: () => void;
  onConfirmar: () => void;
  onEliminarObservacion: (observacion: InformeObservacion) => void;
  idObservacionEliminando?: number;
  cargando?: boolean;
}

export function CustomModalRechazoInforme({
  estaAbierto,
  observacionesRechazo,
  onObservacionesRechazoChange,
  onCerrar,
  onConfirmar,
  onEliminarObservacion,
  idObservacionEliminando,
  cargando = false,
}: PropsCustomModalRechazoInforme) {
  const [observacionActual, setObservacionActual] = useState("");
  const [indiceEdicion, setIndiceEdicion] = useState<number | null>(null);
  const [posicion, setPosicion] = useState<{ x: number; y: number } | null>(null);
  const [dimensiones, setDimensiones] = useState<{ ancho: number; alto: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const arrastreRef = useRef<{ desplazamientoX: number; desplazamientoY: number } | null>(null);
  const redimensionRef = useRef<{
    xInicial: number;
    yInicial: number;
    anchoInicial: number;
    altoInicial: number;
  } | null>(null);

  if (!estaAbierto) return null;

  const cerrarModal = () => {
    setObservacionActual("");
    setIndiceEdicion(null);
    onCerrar();
  };

  const agregarObservacion = () => {
    const texto = observacionActual.trim();
    if (!texto) return;

    onObservacionesRechazoChange([
      ...observacionesRechazo,
      { idInformeObservacion: 0, observacion: texto, checked: false },
    ]);
    setObservacionActual("");
    setIndiceEdicion(null);
  };

  const eliminarObservacion = (indiceObservacion: number) => {
    const observacion = observacionesRechazo[indiceObservacion];
    if (!observacion) return;
    if (observacion.idInformeObservacion > 0) {
      onEliminarObservacion(observacion);
      return;
    }

    onObservacionesRechazoChange(
      observacionesRechazo.filter((_, indice) => indice !== indiceObservacion),
    );
    setIndiceEdicion((indiceActual) => {
      if (indiceActual == null) return null;
      if (indiceActual === indiceObservacion) return null;
      return indiceActual > indiceObservacion ? indiceActual - 1 : indiceActual;
    });
  };

  const actualizarObservacion = (indiceObservacion: number, valor: string) => {
    onObservacionesRechazoChange(
      observacionesRechazo.map((observacion, indice) =>
        indice === indiceObservacion
          ? { ...observacion, observacion: valor }
          : observacion,
      ),
    );
  };

  const observacionesValidas = observacionesRechazo
    .filter((observacion) => observacion.observacion.trim());
  const tieneObservacionNueva = observacionesValidas.some(
    (observacion) => observacion.idInformeObservacion <= 0,
  );

  const iniciarArrastre = (evento: React.PointerEvent<HTMLDivElement>) => {
    if (cargando || !panelRef.current) return;
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
    if (cargando || !panelRef.current) return;
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
    const anchoMinimo = Math.min(360, window.innerWidth - margen * 2);
    const anchoMaximo = Math.max(anchoMinimo, bordeDerecho - margen);
    const altoMinimo = Math.min(320, window.innerHeight - margen * 2);
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

  return (
    <div className="pointer-events-none fixed inset-0 z-[130]">
      <div
        ref={panelRef}
        className="pointer-events-auto absolute flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-2xl"
        style={{
          ...(posicion ? { left: posicion.x, top: posicion.y } : { right: 16, top: 80 }),
          width: dimensiones?.ancho ?? "min(42rem, calc(100vw - 2rem))",
          ...(dimensiones ? { height: dimensiones.alto } : {}),
        }}
      >
        <div className="shrink-0 border-b border-slate-200 bg-slate-50/95 px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div
              className="flex min-w-0 flex-1 touch-none select-none items-start gap-3 cursor-grab active:cursor-grabbing"
              onPointerDown={iniciarArrastre}
              onPointerMove={moverPanel}
              onPointerUp={finalizarArrastre}
              onPointerCancel={finalizarArrastre}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600">
                <CircleAlert size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-900">
                  Rechazar informe
                </h2>
                <p className="mt-0.5 max-w-xl text-sm leading-5 text-slate-500">
                  Registra las correcciones pendientes como tareas concretas.
                </p>
                <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                  <Move size={12} />
                  Arrastra para mover · redimensiona desde la esquina inferior
                </span>
              </div>
            </div>
            <CustomButton
              variant="ghost"
              size="icon"
              onClick={cerrarModal}
              disabled={cargando}
            >
              <X size={22} className="text-slate-400" />
            </CustomButton>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <CustomLabel
                htmlFor="observacion-rechazo"
                className="text-sm font-bold text-slate-700"
              >
                Nueva observacion
              </CustomLabel>
              <span className="text-xs font-medium text-slate-400">
                Ctrl + Enter para agregar
              </span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <textarea
                id="observacion-rechazo"
                value={observacionActual}
                onChange={(event) => setObservacionActual(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                    event.preventDefault();
                    agregarObservacion();
                  }
                }}
                placeholder="Ej. Corregir la seccion de referencias bancarias"
                rows={3}
                className="min-h-24 min-w-0 flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:border-brand-black focus:bg-white focus:ring-2 focus:ring-brand-black/5"
                disabled={cargando}
              />
              <CustomButton
                type="button"
                size="compact"
                className="min-h-11 min-w-28 rounded-xl sm:self-end"
                disabled={!observacionActual.trim() || cargando}
                onClick={agregarObservacion}
              >
                <Plus size={16} />
                Agregar
              </CustomButton>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
            <div className="flex items-center justify-between gap-3">
              <CustomLabel as="p" className="text-sm font-bold text-slate-700">
                Observaciones para corregir
              </CustomLabel>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-500 shadow-sm">
                {observacionesValidas.length}{" "}
                {observacionesValidas.length === 1 ? "punto" : "puntos"}
              </span>
            </div>

            {observacionesRechazo.length > 0 ? (
              <ol className="max-h-60 space-y-2.5 overflow-y-auto pr-1">
                {observacionesRechazo.map((observacion, indice) => {
                  const estaEditando = indiceEdicion === indice;

                  return (
                    <li
                      key={indice}
                      className={[
                        "group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all",
                        estaEditando
                          ? "border-brand-wine ring-2 ring-brand-wine/10"
                          : "border-slate-200 hover:border-slate-300 hover:shadow-md",
                      ].join(" ")}
                    >
                      <div className="flex items-stretch">
                        <div className="flex w-12 shrink-0 items-start justify-center border-r border-slate-100 bg-white px-2.5 py-3 text-slate-500">
                          <span
                            className={[
                              "flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-bold",
                              estaEditando
                                ? "border-brand-wine bg-brand-wine text-white"
                                : "border-slate-200 bg-slate-50 text-slate-600",
                            ].join(" ")}
                          >
                            {indice + 1}
                          </span>
                        </div>

                        <div className="flex min-w-0 flex-1 items-start gap-3 px-3 py-3">
                          {estaEditando ? (
                            <textarea
                              value={observacion.observacion}
                              onChange={(event) =>
                                actualizarObservacion(
                                  indice,
                                  event.target.value,
                                )
                              }
                              className="min-h-16 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-300 focus:border-brand-wine focus:bg-white focus:ring-2 focus:ring-brand-wine/10"
                              placeholder={`Observacion ${indice + 1}`}
                              disabled={cargando}
                              autoFocus
                            />
                          ) : (
                            <p className="min-h-8 flex-1 whitespace-pre-wrap break-words py-0.5 text-sm font-medium leading-6 text-slate-700">
                              {observacion.observacion.trim() || "Observacion sin texto"}
                            </p>
                          )}

                          <div className="flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                            <CustomButton
                              type="button"
                              variant="ghost"
                              size="icon"
                              title={
                                estaEditando
                                  ? "Guardar observacion"
                                  : "Editar observacion"
                              }
                              className={[
                                "h-8 w-8 rounded-lg text-slate-500 hover:bg-white",
                                estaEditando
                                  ? "text-emerald-600 hover:bg-emerald-50"
                                  : "",
                              ].join(" ")}
                              disabled={cargando}
                              onClick={() =>
                                setIndiceEdicion(estaEditando ? null : indice)
                              }
                            >
                              {estaEditando ? (
                                <Save size={17} />
                              ) : (
                                <Pencil size={17} />
                              )}
                            </CustomButton>
                            <CustomButton
                              type="button"
                              variant="ghost"
                              size="icon"
                              title="Eliminar observacion"
                              className="h-8 w-8 rounded-lg text-rose-500 hover:bg-white"
                              loading={idObservacionEliminando === observacion.idInformeObservacion}
                              disabled={cargando}
                              onClick={() => eliminarObservacion(indice)}
                            >
                              <Trash2 size={17} />
                            </CustomButton>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-7 text-center text-sm text-slate-500">
                Agrega al menos una observacion para rechazar el informe.
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {tieneObservacionNueva
              ? "Se enviaran como lista numerada de correcciones."
              : "Agrega al menos una observacion nueva para continuar."}
          </p>
          <div className="flex justify-end gap-3">
            <CustomButton
              variant="secondary"
              size="compact"
              className="min-w-32 rounded-xl"
              disabled={cargando}
              onClick={cerrarModal}
            >
              CANCELAR
            </CustomButton>
            <CustomButton
              size="compact"
              className="min-w-36 rounded-xl uppercase tracking-[0.06em]"
              loading={cargando}
              loadingText="CONFIRMANDO"
              disabled={!tieneObservacionNueva}
              onClick={onConfirmar}
            >
              CONFIRMAR
            </CustomButton>
          </div>
        </div>

        <div
          role="separator"
          aria-label="Cambiar tamaño del panel"
          className="absolute bottom-1 left-1 z-10 flex h-8 w-8 touch-none cursor-nesw-resize items-end justify-start rounded-bl-[18px] p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          onPointerDown={iniciarRedimension}
          onPointerMove={redimensionarPanel}
          onPointerUp={finalizarRedimension}
          onPointerCancel={finalizarRedimension}
        >
          <Maximize2 size={14} className="rotate-90" />
        </div>
      </div>
    </div>
  );
}

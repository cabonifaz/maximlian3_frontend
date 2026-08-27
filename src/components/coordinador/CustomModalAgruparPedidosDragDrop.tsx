import { createPortal } from "react-dom";
import { ChevronRight, LayoutGrid, Loader2, Sparkles, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomFiltrosAgruparPedidosDragDrop } from "@maximilian/components/coordinador/CustomFiltrosAgruparPedidosDragDrop";
import { CustomLineaPedidoDisponible } from "@maximilian/components/coordinador/CustomLineaPedidoDisponible";
import { CustomModalConfirmarLineasFactura } from "@maximilian/components/coordinador/CustomModalConfirmarLineasFactura";
import { CustomPanelRecomendacionesGrupoPedidos } from "@maximilian/components/coordinador/CustomPanelRecomendacionesGrupoPedidos";
import { useAgruparPedidosDragDrop } from "@maximilian/hooks/useAgruparPedidosDragDrop";

interface CustomModalAgruparPedidosDragDropProps {
  abierto: boolean;
  idCliente: number;
  onCerrar: () => void;
}

export function CustomModalAgruparPedidosDragDrop({
  abierto,
  idCliente,
  onCerrar,
}: CustomModalAgruparPedidosDragDropProps) {
  const {
    abrirConfirmacion,
    actualizarCodigoLinea,
    actualizarDescripcionLinea,
    agregarPedidoALinea,
    alternarEnfoqueLinea,
    alternarSeleccionLinea,
    cambiarFiltros,
    cerrarConfirmacion,
    confirmarCreacionLineas,
    crearLineaVacia,
    creandoLineas,
    eliminarLinea,
    estaCargando,
    fechasCompletas,
    filtros,
    hayError,
    idLineaEnfocada,
    limpiarEnfoque,
    limpiarTodo,
    lineaEnfocada,
    lineas,
    lineasParaConfirmar,
    mostrarConfirmacion,
    moverAPedidosSinGrupo,
    pedidosDisponibles,
    pedidosTotales,
    recargar,
    reiniciarWorkspace,
  } = useAgruparPedidosDragDrop(idCliente, abierto);

  const cerrar = () => {
    limpiarTodo();
    onCerrar();
  };

  const manejarConfirmarCreacion = async () => {
    try {
      await confirmarCreacionLineas();
      cerrar();
    } catch {
      // el interceptor global ya muestra el toast de error; se deja el modal abierto para reintentar
    }
  };

  if (!abierto) return null;

  const totalPedidosAgrupados = lineas.reduce((total, linea) => total + linea.idsPedido.length, 0);
  const buscandoGlobalmente = filtros.busqueda.trim().length > 0;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="flex h-[94vh] w-[97vw] max-w-[1900px] flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/25">
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-white to-brand-wine/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-wine/10 text-brand-wine">
              <LayoutGrid size={17} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-brand-black">Agrupar pedidos</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Arrastra pedidos hacia un grupo, o crea uno nuevo, para armar las lineas de factura.
              </p>
            </div>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={cerrar} aria-label="Cerrar agrupar pedidos">
            <X size={16} className="text-slate-400" />
          </CustomButton>
        </div>

        <div className="flex flex-1 min-h-0 flex-col gap-3 overflow-hidden bg-slate-50/60 px-6 py-4">
          <CustomFiltrosAgruparPedidosDragDrop
            filtros={filtros}
            fechasCompletas={fechasCompletas}
            onCambiar={cambiarFiltros}
          />

          {!fechasCompletas ? (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-300 text-sm italic text-slate-400">
              Selecciona fecha de inicio y fin para ver los pedidos.
            </div>
          ) : hayError ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-red-200 bg-red-50/40">
              <p className="text-sm text-red-500">No se pudieron cargar los pedidos.</p>
              <CustomButton type="button" variant="secondary" size="sm" onClick={() => void recargar()}>
                Reintentar
              </CustomButton>
            </div>
          ) : estaCargando ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="animate-spin text-slate-400" size={28} />
            </div>
          ) : (
            <div className="flex flex-1 min-h-0 gap-3 overflow-hidden">
              <CustomPanelRecomendacionesGrupoPedidos
                lineas={lineas}
                pedidosTotales={pedidosTotales}
                idLineaEnfocada={idLineaEnfocada}
                onAlternarEnfoque={alternarEnfoqueLinea}
                onAlternarSeleccion={alternarSeleccionLinea}
                onSoltarPedido={(idLinea, carga) => agregarPedidoALinea(carga.idPedido, idLinea)}
                onActualizarCodigo={actualizarCodigoLinea}
                onActualizarDescripcion={actualizarDescripcionLinea}
                onEliminar={eliminarLinea}
                onCrearLinea={crearLineaVacia}
              />

              <div
                className="flex min-w-0 flex-1 min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <div className="mb-2 flex items-center gap-1 px-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={limpiarEnfoque}
                    disabled={!lineaEnfocada || buscandoGlobalmente}
                    className={lineaEnfocada && !buscandoGlobalmente ? "text-slate-400 hover:text-brand-wine" : "text-slate-500"}
                  >
                    Pedidos disponibles
                  </button>
                  {lineaEnfocada && !buscandoGlobalmente ? (
                    <>
                      <ChevronRight size={13} className="shrink-0 text-slate-300" />
                      <span className="text-brand-wine">{lineaEnfocada.descripcion || "Sin descripcion"}</span>
                    </>
                  ) : null}
                  <span className="font-medium text-slate-400">({pedidosDisponibles.length})</span>
                </div>
                <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto">
                  <div className="min-w-[900px]">
                    {pedidosDisponibles.length > 0 ? (
                      <div className="mb-1 flex w-full items-center gap-3 px-3 text-[9px] font-bold uppercase text-slate-400">
                        <span className="w-[14px] shrink-0" />
                        <span className="w-28 shrink-0">Codigo</span>
                        <span className="min-w-[160px] flex-1">Investigado</span>
                        <span className="w-28 shrink-0">Pais</span>
                        <span className="w-20 shrink-0">Tipo</span>
                        <span className="w-20 shrink-0">Fecha</span>
                        <span className="w-24 shrink-0 text-right">Precio</span>
                        <span className="w-24 shrink-0 text-right">Descuento</span>
                        <span className="w-6 shrink-0" />
                      </div>
                    ) : null}
                    <div className="flex flex-col gap-2">
                      {pedidosDisponibles.length === 0 ? (
                        <p className="w-full py-4 text-center text-[11px] italic text-slate-400">
                          {buscandoGlobalmente
                            ? "No se encontraron pedidos para la busqueda."
                            : lineaEnfocada
                              ? "Este grupo aun no tiene pedidos."
                              : "No hay pedidos disponibles con los filtros actuales."}
                        </p>
                      ) : (
                        pedidosDisponibles.map((pedido) => (
                          <CustomLineaPedidoDisponible
                            key={pedido.idPedido}
                            pedido={pedido}
                            onQuitar={lineaEnfocada && !buscandoGlobalmente ? () => moverAPedidosSinGrupo(pedido.idPedido) : undefined}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-3">
          <div className="text-xs font-medium text-slate-400">
            {lineas.length} grupo{lineas.length === 1 ? "" : "s"} · {totalPedidosAgrupados} pedido{totalPedidosAgrupados === 1 ? "" : "s"} asignados
          </div>
          <div className="flex items-center gap-2">
            <CustomButton type="button" variant="secondary" size="compact" onClick={reiniciarWorkspace}>
              Reiniciar
            </CustomButton>
            <CustomButton
              type="button"
              variant="primary"
              size="compact"
              onClick={abrirConfirmacion}
              disabled={lineasParaConfirmar.length === 0}
            >
              <Sparkles size={14} />
              Crear lineas
            </CustomButton>
          </div>
        </div>
      </div>

      <CustomModalConfirmarLineasFactura
        abierto={mostrarConfirmacion}
        lineas={lineasParaConfirmar}
        creando={creandoLineas}
        onCerrar={cerrarConfirmacion}
        onConfirmar={() => void manejarConfirmarCreacion()}
      />
    </div>,
    document.body,
  );
}

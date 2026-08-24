import { useState } from "react";
import { createPortal } from "react-dom";
import { Layers, Loader2, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomModalConfirmacionAccion } from "@maximilian/components/common/CustomModalConfirmacionAccion";
import { CustomFilaLineaAgrupada } from "@maximilian/components/coordinador/CustomFilaLineaAgrupada";
import { CustomModalEditarLineaAgrupada } from "@maximilian/components/coordinador/CustomModalEditarLineaAgrupada";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { CustomSelectorMes } from "@maximilian/components/common/CustomSelectorMes";
import { useGestionLineasAgrupadas } from "@maximilian/hooks/useGestionLineasAgrupadas";
import type { EntradaLineaAgrupadaPendiente } from "@maximilian/shared/types/facturacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";

interface CustomModalGestionLineasAgrupadasProps {
  abierto: boolean;
  idCliente: number;
  onCerrar: () => void;
}

export function CustomModalGestionLineasAgrupadas({
  abierto,
  idCliente,
  onCerrar,
}: CustomModalGestionLineasAgrupadasProps) {
  const {
    cambiarMes,
    cambiarTipoTramite,
    editandoLinea,
    editarLinea,
    eliminandoLinea,
    eliminarLinea,
    estaCargando,
    hayError,
    idTipoTramite,
    lineas,
    mesSeleccionado,
    recargar,
    reiniciarFiltros,
  } = useGestionLineasAgrupadas(idCliente, abierto);
  const [lineaAEditar, setLineaAEditar] =
    useState<EntradaLineaAgrupadaPendiente | null>(null);
  const [lineaAEliminar, setLineaAEliminar] =
    useState<EntradaLineaAgrupadaPendiente | null>(null);

  const cerrar = () => {
    reiniciarFiltros();
    onCerrar();
  };

  const guardarEdicion = async (datos: { codigo: string; descripcion: string }) => {
    if (!lineaAEditar) return;
    await editarLinea({ idPedidoFacturaLinea: lineaAEditar.idPedidoFacturaLinea, datos });
    setLineaAEditar(null);
  };

  const confirmarEliminacion = async () => {
    if (!lineaAEliminar) return;
    await eliminarLinea(lineaAEliminar.idPedidoFacturaLinea);
    setLineaAEliminar(null);
  };

  if (!abierto) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-7xl overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/25">
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-white to-brand-wine/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-wine/10 text-brand-wine">
              <Layers size={17} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-brand-black">Líneas agrupadas</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Edita o elimina las líneas ya creadas para este cliente.
              </p>
            </div>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={cerrar} aria-label="Cerrar líneas agrupadas">
            <X size={16} className="text-slate-400" />
          </CustomButton>
        </div>

        <div className="space-y-4 bg-slate-50/60 px-6 py-4">
          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
            <CustomSelectorBuscable
              label="Tipo de trámite"
              optional
              idMaster={TablaMaestraId.TIPO_TRAMITE}
              value={idTipoTramite}
              onChange={cambiarTipoTramite}
              onClear={() => cambiarTipoTramite(undefined)}
              obtenerEtiquetaOpcion={(opcion) => opcion.string2 ?? opcion.string1 ?? ""}
            />
            <CustomSelectorMes
              label="Mes"
              optional
              value={mesSeleccionado}
              onChange={cambiarMes}
            />
          </div>

          <div className="max-h-[280px] max-w-full overflow-x-auto overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[960px] text-left text-xs">
              <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] font-bold text-slate-500">
                <tr>
                  <th className="px-3 py-2">Código</th>
                  <th className="px-3 py-2">Descripción</th>
                  <th className="px-3 py-2 text-center">Tipo</th>
                  <th className="px-3 py-2 text-center">Moneda</th>
                  <th className="px-3 py-2 text-center">Cantidad</th>
                  <th className="px-3 py-2 text-right">Valor U.</th>
                  <th className="px-3 py-2 text-center">Dscto. %</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {estaCargando ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-slate-400">
                      <Loader2 className="mx-auto animate-spin" size={20} />
                    </td>
                  </tr>
                ) : hayError ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center">
                      <p className="mb-3 text-sm text-red-500">No se pudieron cargar las líneas agrupadas.</p>
                      <CustomButton type="button" variant="secondary" size="sm" onClick={() => void recargar()}>
                        Reintentar
                      </CustomButton>
                    </td>
                  </tr>
                ) : lineas.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-sm italic text-slate-400">
                      No hay líneas agrupadas para este filtro.
                    </td>
                  </tr>
                ) : lineas.map((linea) => (
                  <CustomFilaLineaAgrupada
                    key={linea.idPedidoFacturaLinea}
                    linea={linea}
                    onEditar={setLineaAEditar}
                    onEliminar={setLineaAEliminar}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CustomModalEditarLineaAgrupada
        linea={lineaAEditar}
        guardando={editandoLinea}
        onCerrar={() => setLineaAEditar(null)}
        onGuardar={(datos) => void guardarEdicion(datos)}
      />

      <CustomModalConfirmacionAccion
        isOpen={lineaAEliminar !== null}
        onClose={() => setLineaAEliminar(null)}
        onConfirm={() => void confirmarEliminacion()}
        title="Eliminar línea agrupada"
        descripcion="¿Deseas eliminar esta línea agrupada? Esta acción no se puede deshacer."
        isSubmitting={eliminandoLinea}
        textoConfirmar="Eliminar"
        textoCargandoConfirmar="Eliminando..."
        zIndexClassName="z-[90]"
      >
        <p>
          <span className="font-bold">Código:</span> {lineaAEliminar?.codigo}
        </p>
        <p>
          <span className="font-bold">Descripción:</span> {lineaAEliminar?.descripcion}
        </p>
      </CustomModalConfirmacionAccion>
    </div>,
    document.body,
  );
}

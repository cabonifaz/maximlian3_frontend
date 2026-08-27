import { useState } from "react";
import { createPortal } from "react-dom";
import { Check, Layers, Loader2, PackagePlus, Pencil, Plus, Trash2, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomModalAgruparPedidosDragDrop } from "@maximilian/components/coordinador/CustomModalAgruparPedidosDragDrop";
import { CustomModalConfirmacionAccion } from "@maximilian/components/common/CustomModalConfirmacionAccion";
import { CustomModalEditarLineaAgrupada } from "@maximilian/components/coordinador/CustomModalEditarLineaAgrupada";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { CustomSelectorMes } from "@maximilian/components/common/CustomSelectorMes";
import { useLineasPendientesFactura } from "@maximilian/hooks/useLineasPendientesFactura";
import type {
  EditarLineaAgrupadaFacturaRequest,
  EntradaLineaAgrupadaPendiente,
} from "@maximilian/shared/types/facturacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { formatearMontoDosDecimales } from "@maximilian/shared/utils/formato-monto.util";

interface CustomModalLineasPendientesFacturaProps {
  abierto: boolean;
  idCliente: number;
  idDocumentoElectronico?: number | null;
  idMonedaFactura?: number;
  idsLineasAgregadas: number[];
  onCerrar: () => void;
  onConfirmar: (
    paraAgregar: EntradaLineaAgrupadaPendiente[],
    paraQuitar: EntradaLineaAgrupadaPendiente[],
  ) => void;
}

export function CustomModalLineasPendientesFactura({
  abierto,
  idCliente,
  idDocumentoElectronico = null,
  idMonedaFactura,
  idsLineasAgregadas,
  onCerrar,
  onConfirmar,
}: CustomModalLineasPendientesFacturaProps) {
  const {
    cambiarMes,
    cambiarMoneda,
    editandoLinea,
    editarLinea,
    eliminandoLinea,
    eliminarLinea,
    estaCargando,
    hayError,
    idMoneda,
    lineas,
    mesSeleccionado,
    recargar,
    reiniciarFiltros,
  } = useLineasPendientesFactura(
    idCliente,
    abierto,
    idDocumentoElectronico,
    idMonedaFactura,
  );
  const [crearLineaAbierta, setCrearLineaAbierta] = useState(false);
  const [lineaAEditar, setLineaAEditar] =
    useState<EntradaLineaAgrupadaPendiente | null>(null);
  const [lineaAEliminar, setLineaAEliminar] =
    useState<EntradaLineaAgrupadaPendiente | null>(null);
  // Ids cuyo estado de selección se movió respecto al valor por defecto
  // (ya agregada = seleccionada por defecto), para no perder la selección
  // inicial de las líneas que ya están en la factura al listarlas de nuevo.
  const [togglados, setTogglados] = useState<Set<number>>(new Set());

  const estaSeleccionada = (idPedidoFacturaLinea: number) =>
    idsLineasAgregadas.includes(idPedidoFacturaLinea)
      !== togglados.has(idPedidoFacturaLinea);

  const establecerSeleccion = (
    siguiente: Set<number>,
    idPedidoFacturaLinea: number,
    seleccionada: boolean,
  ) => {
    const yaAgregada = idsLineasAgregadas.includes(idPedidoFacturaLinea);
    if (yaAgregada !== seleccionada) {
      siguiente.add(idPedidoFacturaLinea);
    } else {
      siguiente.delete(idPedidoFacturaLinea);
    }
  };

  const alternarLinea = (idPedidoFacturaLinea: number) => {
    setTogglados((actual) => {
      const siguiente = new Set(actual);
      establecerSeleccion(
        siguiente,
        idPedidoFacturaLinea,
        !estaSeleccionada(idPedidoFacturaLinea),
      );
      return siguiente;
    });
  };

  const todosSeleccionados =
    lineas.length > 0
    && lineas.every((linea) => estaSeleccionada(linea.idPedidoFacturaLinea));

  const alternarTodos = () => {
    const objetivo = !todosSeleccionados;
    setTogglados((actual) => {
      const siguiente = new Set(actual);
      lineas.forEach((linea) =>
        establecerSeleccion(siguiente, linea.idPedidoFacturaLinea, objetivo),
      );
      return siguiente;
    });
  };

  const cerrar = () => {
    setTogglados(new Set());
    reiniciarFiltros();
    onCerrar();
  };

  const paraAgregar = lineas.filter(
    (linea) =>
      estaSeleccionada(linea.idPedidoFacturaLinea)
      && !idsLineasAgregadas.includes(linea.idPedidoFacturaLinea),
  );
  const paraQuitar = lineas.filter(
    (linea) =>
      !estaSeleccionada(linea.idPedidoFacturaLinea)
      && idsLineasAgregadas.includes(linea.idPedidoFacturaLinea),
  );
  const cantidadSeleccionadas = lineas.filter((linea) =>
    estaSeleccionada(linea.idPedidoFacturaLinea),
  ).length;
  const hayCambiosPendientes = paraAgregar.length > 0 || paraQuitar.length > 0;

  const confirmar = () => {
    onConfirmar(paraAgregar, paraQuitar);
    setTogglados(new Set());
    reiniciarFiltros();
  };

  const guardarEdicion = async (datos: EditarLineaAgrupadaFacturaRequest) => {
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

  if (crearLineaAbierta) {
    return (
      <CustomModalAgruparPedidosDragDrop
        abierto
        idCliente={idCliente}
        onCerrar={() => {
          setCrearLineaAbierta(false);
          void recargar();
        }}
      />
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-7xl overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/25">
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-white to-brand-wine/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-wine/10 text-brand-wine">
              <Layers size={17} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-brand-black">Líneas agrupadas pendientes</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Elige qué líneas ya agrupadas se agregan a la factura.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CustomButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setCrearLineaAbierta(true)}
            >
              <PackagePlus size={14} />
              Crear línea
            </CustomButton>
            <CustomButton variant="ghost" size="icon" onClick={cerrar} aria-label="Cerrar líneas agrupadas">
              <X size={16} className="text-slate-400" />
            </CustomButton>
          </div>
        </div>

        <div className="space-y-4 bg-slate-50/60 px-6 py-4">
          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
            <CustomSelectorMes
              label="Mes"
              optional
              value={mesSeleccionado}
              onChange={cambiarMes}
            />
            <CustomSelectorBuscable
              label="Moneda"
              optional
              idMaster={TablaMaestraId.MONEDA_SUNAT}
              value={idMoneda}
              onChange={cambiarMoneda}
              onClear={() => cambiarMoneda(undefined)}
            />
          </div>

          <div className="max-h-[280px] max-w-full overflow-x-auto overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[960px] text-left text-xs">
              <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] font-bold text-slate-500">
                <tr>
                  <th className="w-10 px-3 py-2">
                    <button
                      type="button"
                      onClick={alternarTodos}
                      disabled={lineas.length === 0}
                      className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        todosSeleccionados
                          ? "border-brand-black bg-brand-black text-white"
                          : "border-slate-300 bg-white"
                      }`}
                      aria-label="Seleccionar todas las líneas"
                    >
                      {todosSeleccionados ? <Check size={10} /> : null}
                    </button>
                  </th>
                  <th className="px-3 py-2">Código</th>
                  <th className="px-3 py-2">Descripción</th>
                  <th className="px-3 py-2 text-center">Moneda</th>
                  <th className="px-3 py-2 text-center">Cantidad</th>
                  <th className="px-3 py-2 text-right">Valor U.</th>
                  <th className="px-3 py-2 text-center">Dscto.</th>
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
                      <p className="mb-3 text-sm text-red-500">No se pudieron cargar las líneas pendientes.</p>
                      <CustomButton type="button" variant="secondary" size="sm" onClick={() => void recargar()}>
                        Reintentar
                      </CustomButton>
                    </td>
                  </tr>
                ) : lineas.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-sm italic text-slate-400">
                      No hay líneas agrupadas pendientes para este filtro.
                    </td>
                  </tr>
                ) : lineas.map((linea) => {
                  const seleccionada = estaSeleccionada(linea.idPedidoFacturaLinea);
                  const total = linea.cantidad * linea.valorUnitario - linea.descuento;

                  return (
                    <tr
                      key={linea.idPedidoFacturaLinea}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => alternarLinea(linea.idPedidoFacturaLinea)}
                    >
                      <td className="px-3 py-2">
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                            seleccionada
                              ? "border-brand-black bg-brand-black text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {seleccionada ? <Check size={10} /> : null}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-bold text-slate-700">{linea.codigo}</td>
                      <td className="px-3 py-2 text-slate-600">{linea.descripcion}</td>
                      <td className="px-3 py-2 text-center text-slate-600">{linea.moneda}</td>
                      <td className="px-3 py-2 text-center text-slate-600">{linea.cantidad}</td>
                      <td className="px-3 py-2 text-right text-slate-600">
                        {formatearMontoDosDecimales(linea.valorUnitario)}
                      </td>
                      <td className="px-3 py-2 text-center text-slate-600">
                        {formatearMontoDosDecimales(linea.descuento)}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-slate-700">
                        {formatearMontoDosDecimales(total)}
                      </td>
                      <td className="px-3 py-2" onClick={(evento) => evento.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <CustomButton
                            variant="ghost"
                            size="icon"
                            onClick={() => setLineaAEditar(linea)}
                            aria-label={`Editar línea ${linea.codigo}`}
                          >
                            <Pencil size={14} className="text-slate-500" />
                          </CustomButton>
                          <CustomButton
                            variant="ghost"
                            size="icon"
                            onClick={() => setLineaAEliminar(linea)}
                            aria-label={`Eliminar línea ${linea.codigo}`}
                          >
                            <Trash2 size={14} className="text-red-500" />
                          </CustomButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-3">
          <p className="text-xs font-medium text-slate-400">
            {cantidadSeleccionadas} línea{cantidadSeleccionadas === 1 ? "" : "s"} seleccionada
            {cantidadSeleccionadas === 1 ? "" : "s"}
          </p>
          <CustomButton
            type="button"
            variant="primary"
            size="compact"
            onClick={confirmar}
            disabled={!hayCambiosPendientes}
          >
            <Plus size={14} />
            Aplicar selección
          </CustomButton>
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

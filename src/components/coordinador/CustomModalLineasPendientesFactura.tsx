import { useState } from "react";
import { createPortal } from "react-dom";
import { Check, Layers, Loader2, PackagePlus, Plus, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomModalProductosFactura } from "@maximilian/components/coordinador/CustomModalProductosFactura";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { CustomSelectorMes } from "@maximilian/components/common/CustomSelectorMes";
import { useLineasPendientesFactura } from "@maximilian/hooks/useLineasPendientesFactura";
import type { EntradaLineaAgrupadaPendiente } from "@maximilian/shared/types/facturacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { obtenerEstiloTipoTramiteAgrupado } from "@maximilian/shared/utils/facturacion.util";
import { formatearMontoDosDecimales } from "@maximilian/shared/utils/formato-monto.util";

interface CustomModalLineasPendientesFacturaProps {
  abierto: boolean;
  idCliente: number;
  idsLineasAgregadas: number[];
  onCerrar: () => void;
  onAgregar: (lineas: EntradaLineaAgrupadaPendiente[]) => void;
}

export function CustomModalLineasPendientesFactura({
  abierto,
  idCliente,
  idsLineasAgregadas,
  onCerrar,
  onAgregar,
}: CustomModalLineasPendientesFacturaProps) {
  const {
    cambiarMes,
    cambiarTipoTramite,
    estaCargando,
    hayError,
    idTipoTramite,
    lineas: lineasFiltradas,
    mesSeleccionado,
    recargar,
    reiniciarFiltros,
  } = useLineasPendientesFactura(idCliente, abierto);
  const [seleccionadas, setSeleccionadas] = useState<Set<number>>(new Set());
  const [crearLineaAbierta, setCrearLineaAbierta] = useState(false);

  const lineas = lineasFiltradas.filter(
    (linea) => !idsLineasAgregadas.includes(linea.idPedidoFacturaLinea),
  );

  const alternarLinea = (idPedidoFacturaLinea: number) => {
    setSeleccionadas((actual) => {
      const siguiente = new Set(actual);
      if (siguiente.has(idPedidoFacturaLinea)) {
        siguiente.delete(idPedidoFacturaLinea);
      } else {
        siguiente.add(idPedidoFacturaLinea);
      }
      return siguiente;
    });
  };

  const todosSeleccionados =
    lineas.length > 0
    && lineas.every((linea) => seleccionadas.has(linea.idPedidoFacturaLinea));

  const alternarTodos = () => {
    setSeleccionadas((actual) => {
      const siguiente = new Set(actual);
      if (todosSeleccionados) {
        lineas.forEach((linea) => siguiente.delete(linea.idPedidoFacturaLinea));
      } else {
        lineas.forEach((linea) => siguiente.add(linea.idPedidoFacturaLinea));
      }
      return siguiente;
    });
  };

  const cerrar = () => {
    setSeleccionadas(new Set());
    reiniciarFiltros();
    onCerrar();
  };

  const confirmar = () => {
    const elegidas = lineas.filter((linea) =>
      seleccionadas.has(linea.idPedidoFacturaLinea),
    );
    onAgregar(elegidas);
    setSeleccionadas(new Set());
    reiniciarFiltros();
  };

  if (!abierto) return null;

  if (crearLineaAbierta) {
    return (
      <CustomModalProductosFactura
        abierto
        idCliente={idCliente}
        idDocumentoElectronico={null}
        onCerrar={() => setCrearLineaAbierta(false)}
        onLineaCreada={() => {
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
                  <th className="px-3 py-2 text-center">Tipo</th>
                  <th className="px-3 py-2 text-center">Moneda</th>
                  <th className="px-3 py-2 text-center">Cantidad</th>
                  <th className="px-3 py-2 text-right">Valor U.</th>
                  <th className="px-3 py-2 text-center">Dscto. %</th>
                  <th className="px-3 py-2 text-right">Total</th>
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
                  const estaSeleccionada = seleccionadas.has(linea.idPedidoFacturaLinea);
                  const total = linea.cantidad * linea.valorUnitario - linea.descuento;
                  const estiloTipo = obtenerEstiloTipoTramiteAgrupado(linea.tipoTramite);

                  return (
                    <tr
                      key={linea.idPedidoFacturaLinea}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => alternarLinea(linea.idPedidoFacturaLinea)}
                    >
                      <td className="px-3 py-2">
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                            estaSeleccionada
                              ? "border-brand-black bg-brand-black text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {estaSeleccionada ? <Check size={10} /> : null}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-bold text-slate-700">{linea.codigo}</td>
                      <td className="px-3 py-2 text-slate-600">{linea.descripcion}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${estiloTipo.clase}`}>
                          {estiloTipo.texto}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center text-slate-600">{linea.moneda}</td>
                      <td className="px-3 py-2 text-center text-slate-600">{linea.cantidad}</td>
                      <td className="px-3 py-2 text-right text-slate-600">
                        {formatearMontoDosDecimales(linea.valorUnitario)}
                      </td>
                      <td className="px-3 py-2 text-center text-slate-600">{linea.descuentoPorcentaje}%</td>
                      <td className="px-3 py-2 text-right font-medium text-slate-700">
                        {formatearMontoDosDecimales(total)}
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
            {seleccionadas.size} línea{seleccionadas.size === 1 ? "" : "s"} seleccionada
            {seleccionadas.size === 1 ? "" : "s"}
          </p>
          <CustomButton
            type="button"
            variant="primary"
            size="compact"
            onClick={confirmar}
            disabled={seleccionadas.size === 0}
          >
            <Plus size={14} />
            Agregar seleccionadas
          </CustomButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}

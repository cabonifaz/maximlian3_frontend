import { useState } from "react";
import { createPortal } from "react-dom";
import { Check, CheckCheck, ChevronLeft, ChevronRight, Loader2, PackagePlus, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomEncabezadoFiltroTabla } from "@maximilian/components/common/CustomEncabezadoFiltroTabla";
import { CustomFiltroRangoFechas } from "@maximilian/components/common/CustomFiltroRangoFechas";
import { useProductosFacturables } from "@maximilian/hooks/useProductosFacturables";
import { ESTILOS_TIPO_PRODUCTO_FACTURABLE } from "@maximilian/shared/constants/components/coordinador/facturacion.constants";
import type { EntradaProductoFacturable } from "@maximilian/shared/types/facturacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { formatearFechaIsoADdMmYyyy } from "@maximilian/shared/utils/fecha.util";
import { formatearMontoDosDecimales } from "@maximilian/shared/utils/formato-monto.util";

interface CustomModalProductosFacturaProps {
  abierto: boolean;
  idCliente: number;
  idsProductosAgregados: number[];
  onCerrar: () => void;
  onConfirmar: (productos: EntradaProductoFacturable[]) => void;
}

export function CustomModalProductosFactura({
  abierto,
  idCliente,
  idsProductosAgregados,
  onCerrar,
  onConfirmar,
}: CustomModalProductosFacturaProps) {
  const [productosSeleccionados, setProductosSeleccionados] = useState<
    Map<number, EntradaProductoFacturable>
  >(new Map());
  const {
    cambiarFechaFin,
    cambiarFechaInicio,
    cambiarPagina,
    cambiarTipoTramite,
    estaCargando,
    fechaFin,
    fechaInicio,
    fechasInvalidas,
    hayError,
    idTipoTramite,
    paginaActual,
    productos,
    recargar,
    reiniciarFiltros,
    totalPaginas,
    totalRegistros,
  } = useProductosFacturables(idCliente, abierto);
  const estaProductoAgregado = (idProductoFacturable: number) =>
    idsProductosAgregados.includes(idProductoFacturable);
  const estaProductoSeleccionado = (idProductoFacturable: number) =>
    estaProductoAgregado(idProductoFacturable)
    || productosSeleccionados.has(idProductoFacturable);
  const todosSeleccionados = productos.length > 0
    && productos.every((producto) =>
      estaProductoSeleccionado(producto.idProductoFacturable),
    );
  const cantidadProductosSeleccionados = new Set([
    ...idsProductosAgregados,
    ...productosSeleccionados.keys(),
  ]).size;

  const alternarProducto = (producto: EntradaProductoFacturable) => {
    if (estaProductoAgregado(producto.idProductoFacturable)) return;
    setProductosSeleccionados((previos) => {
      const siguientes = new Map(previos);
      if (siguientes.has(producto.idProductoFacturable)) {
        siguientes.delete(producto.idProductoFacturable);
      } else {
        siguientes.set(producto.idProductoFacturable, producto);
      }
      return siguientes;
    });
  };

  const alternarTodos = () => {
    if (todosSeleccionados) {
      setProductosSeleccionados((seleccionadosActuales) => {
        const siguientes = new Map(seleccionadosActuales);
        productos.forEach((producto) => siguientes.delete(producto.idProductoFacturable));
        return siguientes;
      });
      return;
    }

    setProductosSeleccionados((seleccionadosActuales) => {
      const siguientes = new Map(seleccionadosActuales);
      productos.forEach((producto) => {
        if (!estaProductoAgregado(producto.idProductoFacturable)) {
          siguientes.set(producto.idProductoFacturable, producto);
        }
      });
      return siguientes;
    });
  };

  const cerrar = () => {
    setProductosSeleccionados(new Map());
    reiniciarFiltros();
    onCerrar();
  };

  const confirmar = () => {
    onConfirmar(Array.from(productosSeleccionados.values()));
    setProductosSeleccionados(new Map());
    reiniciarFiltros();
  };

  if (!abierto) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/25">
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-white to-brand-wine/5 px-7 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-wine/10 text-brand-wine">
              <PackagePlus size={19} />
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-black">Productos a facturar</h2>
              <p className="mt-0.5 text-xs text-slate-500">Selecciona los productos que deseas incorporar a la factura.</p>
            </div>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={cerrar} aria-label="Cerrar productos">
            <X size={16} className="text-slate-400" />
          </CustomButton>
        </div>

        <div className="space-y-5 bg-slate-50/60 px-7 py-6">
          <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <CustomFiltroRangoFechas
              fechaInicio={fechaInicio}
              fechaFin={fechaFin}
              fechasInvalidas={fechasInvalidas}
              onFechaInicioChange={cambiarFechaInicio}
              onFechaFinChange={cambiarFechaFin}
              onLimpiarFechaInicio={() => cambiarFechaInicio(undefined)}
              onLimpiarFechaFin={() => cambiarFechaFin(undefined)}
            />
            <CustomButton
              type="button"
              variant="secondary"
              size="sm"
              className="bg-slate-50 text-xs"
              onClick={alternarTodos}
            >
              <CheckCheck size={14} />
              Seleccionar todo
            </CustomButton>
          </div>

          <div className="max-w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500">
                <tr>
                  <th className="w-12 px-4 py-2.5">
                    <button
                      type="button"
                      onClick={alternarTodos}
                      className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                        todosSeleccionados
                          ? "border-brand-black bg-brand-black text-white"
                          : "border-slate-300 bg-white"
                      }`}
                      aria-label="Seleccionar todos los productos"
                    >
                      {todosSeleccionados ? <Check size={10} /> : null}
                    </button>
                  </th>
                  <th className="px-4 py-2.5">ID</th>
                  <th className="px-4 py-2.5">Investigado</th>
                  <th className="px-4 py-2.5 text-center">Aplica penalidad</th>
                  <th className="px-4 py-2.5 text-center">
                    <CustomEncabezadoFiltroTabla
                      titulo="Tipo"
                      idMaster={TablaMaestraId.TIPO_TRAMITE}
                      valores={idTipoTramite ? [idTipoTramite] : []}
                      onChange={(valores) => cambiarTipoTramite(valores.at(-1))}
                      placeholder="Todos"
                      multiple={false}
                    />
                  </th>
                  <th className="px-4 py-2.5 text-center">Fecha</th>
                  <th className="px-4 py-2.5 text-right">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {estaCargando ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                      <Loader2 className="mx-auto animate-spin" size={20} />
                    </td>
                  </tr>
                ) : hayError ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center">
                      <p className="mb-3 text-sm text-red-500">No se pudieron cargar los pedidos.</p>
                      <CustomButton type="button" variant="secondary" size="sm" onClick={() => void recargar()}>
                        Reintentar
                      </CustomButton>
                    </td>
                  </tr>
                ) : productos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm italic text-slate-400">
                      No hay pedidos disponibles para facturar.
                    </td>
                  </tr>
                ) : productos.map((producto) => {
                  const yaEstaAgregado = estaProductoAgregado(
                    producto.idProductoFacturable,
                  );
                  const estaSeleccionado = estaProductoSeleccionado(
                    producto.idProductoFacturable,
                  );
                  const tipo = ESTILOS_TIPO_PRODUCTO_FACTURABLE[producto.tipo];

                  return (
                    <tr key={producto.idProductoFacturable} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5">
                        <button
                          type="button"
                          onClick={() => alternarProducto(producto)}
                          disabled={yaEstaAgregado}
                          className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${
                            estaSeleccionado ? "border-brand-black bg-brand-black text-white" : "border-slate-300"
                          } ${yaEstaAgregado ? "cursor-not-allowed opacity-70" : ""}`}
                          aria-label={
                            yaEstaAgregado
                              ? `${producto.codigo} ya esta agregado`
                              : `Seleccionar ${producto.codigo}`
                          }
                          title={yaEstaAgregado ? "Producto ya agregado" : undefined}
                        >
                          {estaSeleccionado ? <Check size={10} /> : null}
                        </button>
                      </td>
                      <td className="px-4 py-2.5 font-bold text-slate-700">{producto.codigo}</td>
                      <td className="px-4 py-2.5 text-slate-600">{producto.investigado}</td>
                      <td className="px-4 py-2.5 text-center text-slate-600">
                        {producto.aplicaPenalidad ? "Sí" : "No"}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${tipo.clase}`}>
                          {tipo.texto}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center text-slate-600">
                        {formatearFechaIsoADdMmYyyy(producto.fecha)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium text-slate-700">
                        {formatearMontoDosDecimales(producto.precio)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
            <button
              type="button"
              disabled={paginaActual <= 1}
              onClick={() => cambiarPagina(paginaActual - 1)}
              className="text-slate-400 disabled:opacity-30"
              aria-label="Página anterior"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-medium">
              Página {paginaActual} de {totalPaginas} · {totalRegistros} pedido{totalRegistros === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              disabled={paginaActual >= totalPaginas}
              onClick={() => cambiarPagina(paginaActual + 1)}
              className="text-slate-400 disabled:opacity-30"
              aria-label="Página siguiente"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-white px-7 py-4">
          <p className="text-xs font-medium text-slate-400">
            {cantidadProductosSeleccionados} producto{cantidadProductosSeleccionados === 1 ? "" : "s"} seleccionado{cantidadProductosSeleccionados === 1 ? "" : "s"}
          </p>
          <CustomButton
            variant="primary"
            size="compact"
            onClick={confirmar}
            disabled={productosSeleccionados.size === 0}
          >
            Confirmar
          </CustomButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}

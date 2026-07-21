import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Check, CheckCheck, ChevronLeft, ChevronRight, PackagePlus, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomSelectorFecha } from "@maximilian/components/common/CustomSelectorFecha";
import {
  ESTILOS_TIPO_PRODUCTO_FACTURABLE,
  IDS_PRODUCTOS_FACTURA_SELECCIONADOS_INICIALES,
} from "@maximilian/shared/constants/components/coordinador/facturacion.constants";
import type { EntradaProductoFacturable } from "@maximilian/shared/types/facturacion.type";
import { convertirTextoAFecha } from "@maximilian/shared/utils/fecha.util";

interface CustomModalProductosFacturaProps {
  abierto: boolean;
  productos: EntradaProductoFacturable[];
  onCerrar: () => void;
  onConfirmar: (productos: EntradaProductoFacturable[]) => void;
}

export function CustomModalProductosFactura({
  abierto,
  productos,
  onCerrar,
  onConfirmar,
}: CustomModalProductosFacturaProps) {
  const [idsSeleccionados, setIdsSeleccionados] = useState<Set<number>>(
    new Set(IDS_PRODUCTOS_FACTURA_SELECCIONADOS_INICIALES),
  );
  const [fechaDesde, setFechaDesde] = useState<Date | undefined>(new Date(2024, 0, 1));
  const [fechaHasta, setFechaHasta] = useState<Date | undefined>(new Date(2024, 11, 31));

  const productosFiltrados = useMemo(
    () => productos.filter((producto) => {
      const fechaProducto = convertirTextoAFecha(producto.fecha);
      if (!fechaProducto) return true;
      if (fechaDesde && fechaProducto < fechaDesde) return false;
      if (fechaHasta && fechaProducto > fechaHasta) return false;
      return true;
    }),
    [fechaDesde, fechaHasta, productos],
  );

  const todosSeleccionados = productosFiltrados.length > 0
    && productosFiltrados.every((producto) => idsSeleccionados.has(producto.idProductoFacturable));

  const productosSeleccionados = useMemo(
    () => productos.filter((producto) => idsSeleccionados.has(producto.idProductoFacturable)),
    [idsSeleccionados, productos],
  );

  const alternarProducto = (idProductoFacturable: number) => {
    setIdsSeleccionados((previo) => {
      const siguiente = new Set(previo);
      if (siguiente.has(idProductoFacturable)) {
        siguiente.delete(idProductoFacturable);
      } else {
        siguiente.add(idProductoFacturable);
      }
      return siguiente;
    });
  };

  const alternarTodos = () => {
    if (todosSeleccionados) {
      setIdsSeleccionados((seleccionadosActuales) => {
        const siguientes = new Set(seleccionadosActuales);
        productosFiltrados.forEach((producto) => siguientes.delete(producto.idProductoFacturable));
        return siguientes;
      });
      return;
    }

    setIdsSeleccionados((seleccionadosActuales) => new Set([
      ...seleccionadosActuales,
      ...productosFiltrados.map((producto) => producto.idProductoFacturable),
    ]));
  };

  const reiniciarFiltros = () => {
    setFechaDesde(new Date(2024, 0, 1));
    setFechaHasta(new Date(2024, 11, 31));
  };

  const cerrar = () => {
    setIdsSeleccionados(new Set(IDS_PRODUCTOS_FACTURA_SELECCIONADOS_INICIALES));
    reiniciarFiltros();
    onCerrar();
  };

  const confirmar = () => {
    onConfirmar(productosSeleccionados);
    setIdsSeleccionados(new Set(IDS_PRODUCTOS_FACTURA_SELECCIONADOS_INICIALES));
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
          <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
            <div className="space-y-1.5">
              <CustomSelectorFecha
                label="Desde"
                value={fechaDesde}
                onChange={setFechaDesde}
                placeholder="Desde"
              />
            </div>
            <div className="space-y-1.5">
              <CustomSelectorFecha
                label="Hasta"
                value={fechaHasta}
                onChange={setFechaHasta}
                placeholder="Hasta"
              />
            </div>
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

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs">
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
                  <th className="px-4 py-2.5 text-center">Tipo</th>
                  <th className="px-4 py-2.5 text-center">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productosFiltrados.map((producto) => {
                  const estaSeleccionado = idsSeleccionados.has(producto.idProductoFacturable);
                  const tipo = ESTILOS_TIPO_PRODUCTO_FACTURABLE[producto.tipo];

                  return (
                    <tr key={producto.idProductoFacturable} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5">
                        <button
                          type="button"
                          onClick={() => alternarProducto(producto.idProductoFacturable)}
                          className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${
                            estaSeleccionado ? "border-brand-black bg-brand-black text-white" : "border-slate-300"
                          }`}
                          aria-label={`Seleccionar ${producto.codigo}`}
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
                      <td className="px-4 py-2.5 text-center text-slate-600">{producto.fecha}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500">
            <button type="button" className="text-slate-400" aria-label="Página anterior">
              <ChevronLeft size={14} />
            </button>
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-black font-bold text-white">1</span>
            <span>2</span>
            <span>3</span>
            <span>...</span>
            <span>12</span>
            <button type="button" className="text-slate-400" aria-label="Página siguiente">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-white px-7 py-4">
          <p className="text-xs font-medium text-slate-400">
            {productosSeleccionados.length} producto{productosSeleccionados.length === 1 ? "" : "s"} seleccionado{productosSeleccionados.length === 1 ? "" : "s"}
          </p>
          <CustomButton
            variant="primary"
            size="compact"
            onClick={confirmar}
            disabled={productosSeleccionados.length === 0}
          >
            Confirmar
          </CustomButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}

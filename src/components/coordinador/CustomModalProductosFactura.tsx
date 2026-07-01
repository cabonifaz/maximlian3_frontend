import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import type { EntradaProductoFacturable } from "@maximilian/shared/types/facturacion.type";

interface CustomModalProductosFacturaProps {
  abierto: boolean;
  productos: EntradaProductoFacturable[];
  onCerrar: () => void;
  onConfirmar: (productos: EntradaProductoFacturable[]) => void;
}

const ESTILOS_TIPO_PRODUCTO: Record<EntradaProductoFacturable["tipo"], { texto: string; clase: string }> = {
  express: { texto: "EXPRESS", clase: "bg-amber-100 text-amber-700" },
  normal: { texto: "NORMAL", clase: "bg-blue-100 text-blue-700" },
  "super-flash": { texto: "SUPER FLASH", clase: "bg-red-100 text-red-700" },
};

export function CustomModalProductosFactura({
  abierto,
  productos,
  onCerrar,
  onConfirmar,
}: CustomModalProductosFacturaProps) {
  const [idsSeleccionados, setIdsSeleccionados] = useState<Set<number>>(new Set([1, 2]));

  const todosSeleccionados = productos.length > 0 && productos.every((producto) => idsSeleccionados.has(producto.idProductoFacturable));

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
      setIdsSeleccionados(new Set());
      return;
    }

    setIdsSeleccionados(new Set(productos.map((producto) => producto.idProductoFacturable)));
  };

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5">
          <h2 className="text-lg font-bold text-brand-black">Productos a facturar</h2>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar} aria-label="Cerrar productos">
            <X size={18} className="text-slate-400" />
          </CustomButton>
        </div>

        <div className="space-y-5 px-8 py-6">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase text-slate-500">Desde</p>
              <input
                type="date"
                defaultValue="2024-01-01"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase text-slate-500">Hasta</p>
              <input
                type="date"
                defaultValue="2024-12-31"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10"
              />
            </div>
            <CustomButton variant="secondary" size="sm" onClick={alternarTodos}>
              <Check size={14} />
              Seleccionar todo
            </CustomButton>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="w-12 px-4 py-3" />
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Investigado</th>
                  <th className="px-4 py-3 text-center">Tipo</th>
                  <th className="px-4 py-3 text-center">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productos.map((producto) => {
                  const estaSeleccionado = idsSeleccionados.has(producto.idProductoFacturable);
                  const tipo = ESTILOS_TIPO_PRODUCTO[producto.tipo];

                  return (
                    <tr key={producto.idProductoFacturable} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3 font-bold text-slate-700">{producto.codigo}</td>
                      <td className="px-4 py-3 text-slate-600">{producto.investigado}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${tipo.clase}`}>
                          {tipo.texto}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600">{producto.fecha}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
            <ChevronLeft size={16} />
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-black font-bold text-white">1</span>
            <span>2</span>
            <span>3</span>
            <span>...</span>
            <span>12</span>
            <ChevronRight size={16} />
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 px-8 py-5">
          <CustomButton
            variant="primary"
            size="compact"
            onClick={() => onConfirmar(productosSeleccionados)}
            disabled={productosSeleccionados.length === 0}
          >
            Confirmar
          </CustomButton>
        </div>
      </div>
    </div>
  );
}

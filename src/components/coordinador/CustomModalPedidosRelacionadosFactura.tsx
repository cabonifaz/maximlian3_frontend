import { createPortal } from "react-dom";
import { ClipboardList, Loader2, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { usePedidosRelacionadosFactura } from "@maximilian/hooks/usePedidosRelacionadosFactura";
import { obtenerEstiloTipoTramiteAgrupado } from "@maximilian/shared/utils/facturacion.util";

interface CustomModalPedidosRelacionadosFacturaProps {
  abierto: boolean;
  idDocumentoElectronico: number | null;
  onCerrar: () => void;
}

export function CustomModalPedidosRelacionadosFactura({
  abierto,
  idDocumentoElectronico,
  onCerrar,
}: CustomModalPedidosRelacionadosFacturaProps) {
  const { estaCargando, hayError, pedidos, recargar } =
    usePedidosRelacionadosFactura(idDocumentoElectronico, abierto);

  if (!abierto) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/25">
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-white to-brand-wine/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-wine/10 text-brand-wine">
              <ClipboardList size={17} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-brand-black">Pedidos relacionados</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Pedidos incluidos en las líneas de esta factura.
              </p>
            </div>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar} aria-label="Cerrar pedidos relacionados">
            <X size={16} className="text-slate-400" />
          </CustomButton>
        </div>

        <div className="bg-slate-50/60 px-6 py-4">
          <div className="max-h-[420px] max-w-full overflow-x-auto overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[860px] text-left text-xs">
              <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] font-bold text-slate-500">
                <tr>
                  <th className="px-3 py-2">Código</th>
                  <th className="px-3 py-2">N.° de referencia</th>
                  <th className="px-3 py-2">Investigado</th>
                  <th className="px-3 py-2 text-center">Tipo</th>
                  <th className="px-3 py-2">País</th>
                  <th className="px-3 py-2 text-right">Valor U.</th>
                  <th className="px-3 py-2 text-right">Descuento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {estaCargando ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                      <Loader2 className="mx-auto animate-spin" size={20} />
                    </td>
                  </tr>
                ) : hayError ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center">
                      <p className="mb-3 text-sm text-red-500">No se pudieron cargar los pedidos relacionados.</p>
                      <CustomButton type="button" variant="secondary" size="sm" onClick={() => void recargar()}>
                        Reintentar
                      </CustomButton>
                    </td>
                  </tr>
                ) : pedidos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-sm italic text-slate-400">
                      No hay pedidos relacionados a esta factura.
                    </td>
                  </tr>
                ) : (
                  pedidos.map((pedido) => {
                    const estiloTipo = obtenerEstiloTipoTramiteAgrupado(pedido.tipoTramite);

                    return (
                      <tr key={`${pedido.codigo}-${pedido.numReferencia}`}>
                        <td className="px-3 py-2 font-bold text-slate-700">{pedido.codigo}</td>
                        <td className="px-3 py-2 text-slate-600">{pedido.numReferencia}</td>
                        <td className="px-3 py-2 text-slate-600">{pedido.investigado}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${estiloTipo.clase}`}>
                            {estiloTipo.texto}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-600">{pedido.pais}</td>
                        <td className="px-3 py-2 text-right text-slate-600">{pedido.valorUnitario}</td>
                        <td className="px-3 py-2 text-right text-slate-600">{pedido.descuento}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-slate-100 bg-white px-6 py-3">
          <CustomButton variant="secondary" size="compact" onClick={onCerrar}>
            Cerrar
          </CustomButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}

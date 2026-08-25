import { ClipboardList, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomTabla, type TableColumn } from "@maximilian/components/common/CustomTabla";
import { useDetallePedidosFacturaVerificacion } from "@maximilian/hooks/useDetallePedidosFacturaVerificacion";
import type { PedidoRelacionadoFacturaApi } from "@maximilian/shared/types/facturacion.type";
import { obtenerEstiloTipoTramiteAgrupado } from "@maximilian/shared/utils/facturacion.util";

interface PropsCustomModalDetallePedidosFacturaVerificacion {
  abierto: boolean;
  token: string | undefined;
  onCerrar: () => void;
}

const COLUMNAS_DETALLE_PEDIDOS_FACTURA_VERIFICACION: TableColumn[] = [
  { label: "Código", width: "14%" },
  { label: "N.° de referencia", className: "whitespace-nowrap", width: "16%" },
  { label: "Investigado", width: "24%" },
  { label: "Tipo de informe", className: "text-center whitespace-nowrap", width: "12%" },
  { label: "País", width: "14%" },
  { label: "Valor U.", className: "text-right whitespace-nowrap", width: "10%" },
  { label: "Descuento", className: "text-right whitespace-nowrap", width: "10%" },
];

function FilaPedidoDetalle(pedido: PedidoRelacionadoFacturaApi & { idFila: number }) {
  const tipo = obtenerEstiloTipoTramiteAgrupado(pedido.tipoTramite);

  return (
    <>
      <td className="px-6 py-4 text-sm font-medium text-brand-black">{pedido.codigo}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {pedido.numReferencia}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{pedido.investigado}</td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${tipo.clase}`}>
          {tipo.texto}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{pedido.pais}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-brand-black">
        {pedido.valorUnitario}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
        {pedido.descuento}
      </td>
    </>
  );
}

export function CustomModalDetallePedidosFacturaVerificacion({
  abierto,
  token,
  onCerrar,
}: PropsCustomModalDetallePedidosFacturaVerificacion) {
  const {
    cambiarPagina,
    estaCargando,
    hayError,
    paginaActual,
    pedidosPagina,
    recargar,
    totalPaginas,
    totalRegistros,
  } = useDetallePedidosFacturaVerificacion(token, abierto);

  if (!abierto) return null;

  return (
    <div className="fixed left-0 top-0 z-[80] flex h-[100dvh] w-[100dvw] items-center justify-center overflow-hidden bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="flex max-h-[90dvh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-brand-white shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-wine/10 text-brand-wine">
              <ClipboardList size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-black">Detalle de pedidos</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Pedidos incluidos en el comprobante.
              </p>
            </div>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar} aria-label="Cerrar detalle de pedidos">
            <X size={20} className="text-gray-400" />
          </CustomButton>
        </div>

        <div className="min-h-0 overflow-y-auto px-8 py-6">
          <CustomTabla
            columns={COLUMNAS_DETALLE_PEDIDOS_FACTURA_VERIFICACION}
            data={pedidosPagina}
            getId={(pedido) => pedido.idFila}
            renderRow={FilaPedidoDetalle}
            isLoading={estaCargando}
            isError={hayError}
            onRetry={() => void recargar()}
            paginaActual={paginaActual}
            totalPages={totalPaginas}
            totalRecords={totalRegistros}
            onPageChange={cambiarPagina}
            entityLabel="pedidos"
            emptyMessage="No hay pedidos relacionados a este comprobante."
            errorMessage="No se pudieron cargar los pedidos relacionados."
          />
        </div>

        <div className="shrink-0 border-t border-gray-100 bg-gray-50/50 px-8 py-4">
          <div className="flex justify-end">
            <CustomButton variant="secondary" size="md" onClick={onCerrar}>
              Cerrar
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
}

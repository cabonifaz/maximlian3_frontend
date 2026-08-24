import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomModalPestanas } from "@maximilian/components/common/CustomModalPestanas";
import { CustomTabla, type TableColumn } from "@maximilian/components/common/CustomTabla";
import { useDetallePedidosFacturaVerificacion } from "@maximilian/hooks/useDetallePedidosFacturaVerificacion";
import { ESTILOS_TIPO_PRODUCTO_FACTURABLE } from "@maximilian/shared/constants/components/coordinador/facturacion.constants";
import {
  PESTANAS_DETALLE_PEDIDOS_FACTURA_VERIFICACION,
  type PestanaDetallePedidosFacturaVerificacion,
} from "@maximilian/shared/constants/components/publico/detalle-pedidos-factura-verificacion.constants";
import type { PedidoDetalleFacturaVerificacion } from "@maximilian/shared/types/verificacion-factura.type";
import { formatearMontoConSimbolo } from "@maximilian/shared/utils/formato-monto.util";

interface PropsCustomModalDetallePedidosFacturaVerificacion {
  abierto: boolean;
  pestanaInicial: PestanaDetallePedidosFacturaVerificacion;
  onCerrar: () => void;
}

const COLUMNAS_DETALLE_PEDIDOS_FACTURA_VERIFICACION: TableColumn[] = [
  { label: "Empresa", width: "22%" },
  { label: "Tipo de informe", className: "text-center whitespace-nowrap", width: "11%" },
  { label: "N.° de referencia", className: "whitespace-nowrap", width: "13%" },
  { label: "País", width: "12%" },
  { label: "F. de solicitud", className: "text-center whitespace-nowrap", width: "12%" },
  { label: "F. de envío", className: "text-center whitespace-nowrap", width: "12%" },
  { label: "Tipo de servicio", className: "text-center whitespace-nowrap", width: "8%" },
  { label: "Precio", className: "text-right whitespace-nowrap", width: "10%" },
];

function FilaPedidoDetalle(pedido: PedidoDetalleFacturaVerificacion) {
  const tipo = ESTILOS_TIPO_PRODUCTO_FACTURABLE[pedido.tipo];

  return (
    <>
      <td className="px-6 py-4 text-sm font-medium text-brand-black">
        {pedido.investigarRazonSocialNombres}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${tipo.clase}`}>
          {tipo.texto}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {pedido.numeroReferencia}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{pedido.pais}</td>
      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
        {pedido.fechaSolicitud}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
        {pedido.fechaEnvio}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
        {pedido.tipoServicio}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-brand-black">
        {formatearMontoConSimbolo(pedido.precio, "PEN")}
      </td>
    </>
  );
}

export function CustomModalDetallePedidosFacturaVerificacion({
  abierto,
  pestanaInicial,
  onCerrar,
}: PropsCustomModalDetallePedidosFacturaVerificacion) {
  const {
    cambiarPagina,
    cambiarPestana,
    paginaActual,
    pedidosPagina,
    pestanaActiva,
    totalPaginas,
    totalRegistros,
  } = useDetallePedidosFacturaVerificacion(abierto, pestanaInicial);

  return (
    <CustomModalPestanas
      isOpen={abierto}
      onClose={onCerrar}
      title="Detalle de pedidos"
      subtitle={
        <p className="text-xs text-gray-500">
          Pedidos agrupados por tipo de servicio incluidos en el comprobante.
        </p>
      }
      tabs={PESTANAS_DETALLE_PEDIDOS_FACTURA_VERIFICACION.map((pestana) => ({
        id: pestana.id,
        label: pestana.etiqueta,
        content: (
          <CustomTabla
            columns={COLUMNAS_DETALLE_PEDIDOS_FACTURA_VERIFICACION}
            data={pedidosPagina}
            getId={(pedido) => pedido.idPedido}
            renderRow={FilaPedidoDetalle}
            paginaActual={paginaActual}
            totalPages={totalPaginas}
            totalRecords={totalRegistros}
            onPageChange={cambiarPagina}
            entityLabel="pedidos"
            emptyMessage="No hay pedidos para este tipo de servicio."
          />
        ),
      }))}
      activeTab={pestanaActiva}
      onTabChange={cambiarPestana}
      footer={
        <div className="flex justify-end">
          <CustomButton variant="secondary" size="md" onClick={onCerrar}>
            Cerrar
          </CustomButton>
        </div>
      }
      maxWidth="max-w-[96rem]"
      zIndex="z-[80]"
    />
  );
}

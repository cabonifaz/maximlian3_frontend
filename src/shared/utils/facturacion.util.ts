import type { DatosFormularioFactura } from "@maximilian/schemas";
import type {
  DetalleFactura,
  GuardarBorradorFacturaRequest,
} from "@maximilian/shared/types/facturacion.type";
import { ID_FORMA_PAGO_CONTADO } from "@maximilian/shared/constants/components/coordinador/facturacion.constants";

function convertirFechaAIso(fecha: string) {
  const coincidenciaIso = fecha.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (coincidenciaIso) return coincidenciaIso[0];

  const [dia, mes, ano] = fecha.split("/");
  return `${ano}-${mes}-${dia}`;
}

export function construirPayloadGuardarBorradorFactura(
  detalle: DetalleFactura,
  datos: DatosFormularioFactura,
): GuardarBorradorFacturaRequest {
  return {
    idTipoDocumentoMaestro: datos.idTipoDocumentoMaestro,
    idMonedaMaestro: datos.idMonedaMaestro,
    idTipoOperacionMaestro: datos.idTipoOperacionMaestro,
    idFormaPago: datos.idFormaPago,
    cuotas: datos.idFormaPago === ID_FORMA_PAGO_CONTADO
      ? []
      : detalle.cuotas.map((cuota) => ({
          numeroCuota: cuota.numeroCuota,
          fechaVencimiento: convertirFechaAIso(cuota.vencimiento),
          monto: cuota.monto,
        })),
    idCliente: detalle.idCliente,
    documentoAfectado: null,
    lineas: detalle.productos.map((producto) => {
      const claveProducto = String(producto.idProductoFactura);
      const descuentoPorcentaje = datos.descuentos[claveProducto] ?? producto.descuentoPorcentaje;

      return {
        idPedido: producto.idPedido,
        productoSunatCodigo: null,
        unidadMedidaCodigo: "",
        cantidad: producto.cantidad,
        valorUnitario: producto.valorUnitario,
        precioUnitario: datos.preciosUnitarios[claveProducto],
        montoDescuento: producto.cantidad * producto.valorUnitario * descuentoPorcentaje / 100,
        idAfectacionIgvMaestro: datos.afectacionesIgv[claveProducto],
        porcentajeIgv: datos.porcentajesIgv[claveProducto],
      };
    }),
  };
}

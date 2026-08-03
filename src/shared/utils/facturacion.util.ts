import type { DatosFormularioFactura } from "@maximilian/schemas";
import type {
  DetalleFactura,
  GuardarBorradorFacturaRequest,
  GuardarCambiosFacturaRequest,
} from "@maximilian/shared/types/facturacion.type";
import { ID_FORMA_PAGO_CONTADO } from "@maximilian/shared/constants/components/coordinador/facturacion.constants";

function convertirFechaAIso(fecha: string) {
  const coincidenciaIso = fecha.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (coincidenciaIso) return coincidenciaIso[0];

  const [dia, mes, ano] = fecha.split("/");
  return `${ano}-${mes}-${dia}`;
}

export function calcularPrecioUnitarioFactura(
  valorUnitario: number,
  idAfectacionIgvMaestro: number,
  porcentajeIgv: number,
) {
  const esGravado = idAfectacionIgvMaestro >= 10
    && idAfectacionIgvMaestro <= 17;

  return esGravado
    ? valorUnitario * (1 + porcentajeIgv / 100)
    : valorUnitario;
}

export function construirPayloadGuardarBorradorFactura(
  detalle: DetalleFactura,
  datos: DatosFormularioFactura,
): GuardarBorradorFacturaRequest {
  return {
    idTipoDocumentoMaestro: datos.idTipoDocumentoMaestro,
    numeroReferencia: detalle.ordenCompra,
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
        productoSunatCodigo: producto.productoSunatCodigo,
        unidadMedidaCodigo: producto.unidadMedidaCodigo,
        cantidad: producto.cantidad,

        montoDescuento: producto.cantidad * producto.valorUnitario * descuentoPorcentaje / 100,
        idAfectacionIgvMaestro: datos.afectacionesIgv[claveProducto],
        porcentajeIgv: datos.porcentajesIgv[claveProducto],
      };
    }),
  };
}
export function construirPayloadGuardarCambiosFactura(
  detalle: DetalleFactura,
  datos: DatosFormularioFactura,
): GuardarCambiosFacturaRequest {
  return {
    idFormaPago: datos.idFormaPago,
    numeroReferencia: detalle.ordenCompra,
    idMonedaMaestro: datos.idMonedaMaestro,
    idTipoOperacionMaestro: datos.idTipoOperacionMaestro,
    lineas: detalle.productos.map((producto, indice) => {
      const claveProducto = String(producto.idProductoFactura);
      const descuentoPorcentaje =
        datos.descuentos[claveProducto] ?? producto.descuentoPorcentaje;

      return {
        idPedido: producto.idPedido,
        productoSunatCodigo: producto.productoSunatCodigo,
        unidadMedidaCodigo: producto.unidadMedidaCodigo,
        cantidad: producto.cantidad,

        montoDescuento:
          producto.cantidad
          * producto.valorUnitario
          * descuentoPorcentaje
          / 100,
        idAfectacionIgvMaestro: datos.afectacionesIgv[claveProducto],
        porcentajeIgv: datos.porcentajesIgv[claveProducto],
        numeroLinea: producto.numeroLinea || indice + 1,
        idLineaDocumentoElectronico:
          producto.idLineaDocumentoElectronico,
      };
    }),
    cuotas: datos.idFormaPago === ID_FORMA_PAGO_CONTADO
      ? []
      : detalle.cuotas.map((cuota) => ({
          numeroCuota: cuota.numeroCuota,
          fechaVencimiento: convertirFechaAIso(cuota.vencimiento),
          monto: cuota.monto,
          idCuotaDocumentoElectronico:
            cuota.idCuotaDocumentoElectronico,
        })),
  };
}

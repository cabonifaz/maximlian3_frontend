import type { DatosFormularioFactura } from "@maximilian/schemas";
import type {
  DetalleFactura,
  GuardarBorradorFacturaRequest,
  GuardarCambiosFacturaRequest,
} from "@maximilian/shared/types/facturacion.type";
import {
  ID_FORMA_PAGO_CONTADO,
  LIMITE_CARACTERES_ORDEN_COMPRA,
} from "@maximilian/shared/constants/components/coordinador/facturacion.constants";

export function limitarOrdenCompra(valor: string) {
  return valor.slice(0, LIMITE_CARACTERES_ORDEN_COMPRA);
}

export function concatenarCodigosOrdenCompra(
  valorActual: string,
  codigos: string[],
) {
  const valoresUnicos = [...valorActual.split(","), ...codigos]
    .map((valor) => valor.trim())
    .filter((valor, indice, valores) =>
      valor.length > 0 && valores.indexOf(valor) === indice
    );

  return limitarOrdenCompra(valoresUnicos.join(","));
}

export function formatearImporteFactura(
  importe: number,
  moneda?: string,
) {
  if (!moneda) {
    return new Intl.NumberFormat("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(importe);
  }

  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: moneda,
  }).format(importe);
}

function convertirFechaAIso(fecha: string) {
  const coincidenciaIso = fecha.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (coincidenciaIso) return coincidenciaIso[0];

  const [dia, mes, ano] = fecha.split("/");
  return `${ano}-${mes}-${dia}`;
}

// Refleja el mismo cálculo que el backend (SP_DocumentoElectronico_Insertar/GuardarCambios):
// PrecioUnitario = (ValorLinea + MontoIgv) / Cantidad = valorUnitario * (1 - descuento%) * (1 + IGV%).
// Antes no incluía el descuento, mostrando un precio unitario distinto al que realmente se factura a SUNAT.
export function calcularPrecioUnitarioFactura(
  valorUnitario: number,
  idAfectacionIgvMaestro: number,
  porcentajeIgv: number,
  descuentoPorcentaje: number,
) {
  const esGravado = idAfectacionIgvMaestro >= 10
    && idAfectacionIgvMaestro <= 17;

  const valorUnitarioConDescuento = valorUnitario * (1 - descuentoPorcentaje / 100);

  return esGravado
    ? valorUnitarioConDescuento * (1 + porcentajeIgv / 100)
    : valorUnitarioConDescuento;
}

export function construirPayloadGuardarBorradorFactura(
  detalle: DetalleFactura,
  datos: DatosFormularioFactura,
): GuardarBorradorFacturaRequest {
  return {
    idTipoDocumentoMaestro: datos.idTipoDocumentoMaestro,
    numeroReferencia: "",
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
        descripcion: datos.descripciones[claveProducto] ?? producto.descripcion,
        idUnidadMedidaMaestro: datos.unidadesMedida[claveProducto],
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
    numeroReferencia: "",
    idMonedaMaestro: datos.idMonedaMaestro,
    idTipoOperacionMaestro: datos.idTipoOperacionMaestro,
    lineas: detalle.productos.map((producto, indice) => {
      const claveProducto = String(producto.idProductoFactura);
      const descuentoPorcentaje =
        datos.descuentos[claveProducto] ?? producto.descuentoPorcentaje;

      return {
        idPedido: producto.idPedido,
        productoSunatCodigo: producto.productoSunatCodigo,
        descripcion: datos.descripciones[claveProducto] ?? producto.descripcion,
        idUnidadMedidaMaestro: datos.unidadesMedida[claveProducto],
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

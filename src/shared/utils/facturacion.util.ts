import type { DatosFormularioFactura } from "@maximilian/schemas";
import type {
  ClienteNotaCreditoDebito,
  CuotaGuardarBorradorFactura,
  CuotaGuardarCambiosFactura,
  DetalleFactura,
  EditarNotaCreditoDebitoRequest,
  GuardarBorradorFacturaRequest,
  GuardarCambiosFacturaRequest,
  NotaCreditoDebitoRequest,
} from "@maximilian/shared/types/facturacion.type";
import {
  ESTILOS_TIPO_PRODUCTO_FACTURABLE,
  ID_ESTADO_CUOTA_PAGADO,
  ID_ESTADO_CUOTA_PENDIENTE,
  ID_FORMA_PAGO_CONTADO,
  LIMITE_CARACTERES_ORDEN_COMPRA,
} from "@maximilian/shared/constants/components/coordinador/facturacion.constants";

export function obtenerEstiloTipoTramiteAgrupado(tipoTramite: string) {
  const normalizado = tipoTramite.trim().toLowerCase().replaceAll(" ", "-");
  const clave =
    normalizado === "express" || normalizado === "super-flash"
      ? normalizado
      : "normal";

  return ESTILOS_TIPO_PRODUCTO_FACTURABLE[clave];
}

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

export function obtenerIdEstadoCuotaMaestro(estado: DetalleFactura["cuotas"][number]["estado"]) {
  return estado === "pagado" ? ID_ESTADO_CUOTA_PAGADO : ID_ESTADO_CUOTA_PENDIENTE;
}

function construirCuotasBorrador(
  detalle: DetalleFactura,
  datos: DatosFormularioFactura,
): CuotaGuardarBorradorFactura[] {
  return datos.idFormaPago === ID_FORMA_PAGO_CONTADO
    ? []
    : detalle.cuotas.map((cuota) => ({
        numeroCuota: cuota.numeroCuota,
        fechaVencimiento: convertirFechaAIso(cuota.vencimiento),
        monto: cuota.monto,
        idEstadoCuotaMaestro: obtenerIdEstadoCuotaMaestro(cuota.estado),
        fechaPago: cuota.fechaPago,
      }));
}

function construirCamposExtraBorrador(detalle: DetalleFactura) {
  return detalle.camposExtra
    .map((campoExtra) => campoExtra.texto.trim())
    .filter(Boolean)
    .map((texto) => ({ texto }));
}

function construirCuotasCambios(
  detalle: DetalleFactura,
  datos: DatosFormularioFactura,
): CuotaGuardarCambiosFactura[] {
  return datos.idFormaPago === ID_FORMA_PAGO_CONTADO
    ? []
    : detalle.cuotas.map((cuota) => ({
        numeroCuota: cuota.numeroCuota,
        fechaVencimiento: convertirFechaAIso(cuota.vencimiento),
        monto: cuota.monto,
        idEstadoCuotaMaestro: obtenerIdEstadoCuotaMaestro(cuota.estado),
        fechaPago: cuota.fechaPago,
        idCuotaDocumentoElectronico: cuota.idCuotaDocumentoElectronico,
      }));
}

function construirCamposExtraCambios(detalle: DetalleFactura) {
  return detalle.camposExtra
    .filter((campoExtra) => campoExtra.texto.trim())
    .map((campoExtra) => ({
      texto: campoExtra.texto.trim(),
      idCampoExtraDocumentoElectronico: campoExtra.idCampoExtraDocumentoElectronico,
    }));
}

export function construirPayloadGuardarBorradorFactura(
  detalle: DetalleFactura,
  datos: DatosFormularioFactura,
): GuardarBorradorFacturaRequest {
  return {
    idTipoDocumentoMaestro: datos.idTipoDocumentoMaestro,
    numeroReferencia: "",
    idMonedaMaestro: datos.idMonedaMaestro,
    tipoCambio: datos.tipoCambio ?? 0,
    idTipoOperacionMaestro: datos.idTipoOperacionMaestro,
    idFormaPago: datos.idFormaPago ?? 0,
    cuotas: construirCuotasBorrador(detalle, datos),
    idCliente: detalle.idCliente,
    documentoAfectado: null,
    lineas: detalle.productos.map((producto) => {
      const claveProducto = String(producto.idProductoFactura);

      return {
        idPedidoFacturaLinea: producto.idLineaDocumentoElectronico,
        productoSunatCodigo: producto.productoSunatCodigo,
        idUnidadMedidaMaestro: datos.unidadesMedida[claveProducto],
        idAfectacionIgvMaestro: datos.afectacionesIgv[claveProducto],
        porcentajeIgv: datos.porcentajesIgv[claveProducto],
      };
    }),
    camposExtra: construirCamposExtraBorrador(detalle),
  };
}

export function construirPayloadNotaCreditoDebito(
  detalle: DetalleFactura,
  datos: DatosFormularioFactura,
  cliente: ClienteNotaCreditoDebito,
): NotaCreditoDebitoRequest {
  return {
    idTipoDocumentoMaestro: datos.idTipoDocumentoMaestro,
    numeroReferencia: "",
    idMonedaMaestro: datos.idMonedaMaestro,
    tipoCambio: datos.tipoCambio ?? 0,
    idTipoOperacionMaestro: datos.idTipoOperacionMaestro,
    cliente,
    documentoAfectado: {
      idDocumentoElectronicoRelacionado: detalle.idDocumentoElectronico ?? 0,
      idMotivoMaestro: datos.idMotivoMaestro ?? 0,
    },
    lineas: detalle.productos.map((producto) => {
      const claveProducto = String(producto.idProductoFactura);
      const descuentoPorcentaje = datos.descuentos[claveProducto] ?? producto.descuentoPorcentaje;
      const valorUnitario = datos.valoresUnitarios[claveProducto] ?? producto.valorUnitario;

      return {
        productoCodigo: datos.codigosProducto[claveProducto] ?? producto.codigo,
        productoSunatCodigo: producto.productoSunatCodigo,
        descripcion: datos.descripciones[claveProducto] ?? producto.descripcion,
        idUnidadMedidaMaestro: datos.unidadesMedida[claveProducto],
        cantidad: producto.cantidad,
        valorUnitario,
        montoDescuento: producto.cantidad * valorUnitario * descuentoPorcentaje / 100,
        idAfectacionIgvMaestro: datos.afectacionesIgv[claveProducto],
        porcentajeIgv: datos.porcentajesIgv[claveProducto],
      };
    }),
    camposExtra: construirCamposExtraBorrador(detalle),
  };
}

export function construirPayloadGuardarCambiosFactura(
  detalle: DetalleFactura,
  datos: DatosFormularioFactura,
): GuardarCambiosFacturaRequest {
  return {
    idFormaPago: datos.idFormaPago ?? 0,
    numeroReferencia: "",
    idMonedaMaestro: datos.idMonedaMaestro,
    tipoCambio: datos.tipoCambio ?? 0,
    idTipoOperacionMaestro: datos.idTipoOperacionMaestro,
    lineas: detalle.productos.map((producto, indice) => {
      const claveProducto = String(producto.idProductoFactura);

      return {
        idPedidoFacturaLinea: producto.idLineaDocumentoElectronico,
        productoSunatCodigo: producto.productoSunatCodigo,
        idUnidadMedidaMaestro: datos.unidadesMedida[claveProducto],
        idAfectacionIgvMaestro: datos.afectacionesIgv[claveProducto],
        porcentajeIgv: datos.porcentajesIgv[claveProducto],
        numeroLinea: producto.numeroLinea || indice + 1,
        idLineaDocumentoElectronico:
          producto.idLineaDocumentoElectronico,
      };
    }),
    cuotas: construirCuotasCambios(detalle, datos),
    camposExtra: construirCamposExtraCambios(detalle),
  };
}

export function construirPayloadEditarNotaCreditoDebito(
  detalle: DetalleFactura,
  datos: DatosFormularioFactura,
): EditarNotaCreditoDebitoRequest {
  return {
    numeroReferencia: "",
    idMonedaMaestro: datos.idMonedaMaestro,
    tipoCambio: datos.tipoCambio ?? 0,
    idTipoOperacionMaestro: datos.idTipoOperacionMaestro,
    idMotivoMaestro: datos.idMotivoMaestro ?? 0,
    lineas: detalle.productos.map((producto) => {
      const claveProducto = String(producto.idProductoFactura);
      const descuentoPorcentaje = datos.descuentos[claveProducto] ?? producto.descuentoPorcentaje;
      const valorUnitario = datos.valoresUnitarios[claveProducto] ?? producto.valorUnitario;

      return {
        productoCodigo: datos.codigosProducto[claveProducto] ?? producto.codigo,
        productoSunatCodigo: producto.productoSunatCodigo,
        descripcion: datos.descripciones[claveProducto] ?? producto.descripcion,
        idUnidadMedidaMaestro: datos.unidadesMedida[claveProducto],
        cantidad: producto.cantidad,
        valorUnitario,
        montoDescuento: producto.cantidad * valorUnitario * descuentoPorcentaje / 100,
        idAfectacionIgvMaestro: datos.afectacionesIgv[claveProducto],
        porcentajeIgv: datos.porcentajesIgv[claveProducto],
        idLineaDocumentoElectronico: producto.idLineaDocumentoElectronico,
      };
    }),
    camposExtra: construirCamposExtraCambios(detalle),
  };
}

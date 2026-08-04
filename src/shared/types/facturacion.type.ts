export type EstadoFacturacionPrincipal =
  | "finalizado"
  | "pendiente"
  | "en-pre-factura";

export type IdEstadoFacturacionActualizable = 2 | 3 | 4 | 7;

export type EstadoFacturaCliente =
  | "listo-para-facturacion"
  | "en-pre-factura"
  | "pre-factura-aprobada"
  | "pre-factura-rechazada"
  | "borrador-factura"
  | "aprobado"
  | "rechazado"
  | "pendiente-anulacion"
  | "anulacion-aprobada"
  | "anulacion-rechazada";

export interface ParametrosListaFacturacion {
  busqueda?: string;
  numPag?: number;
  emitirPrefactura?: number;
  idIdiomaFacturacion?: number;
  estadoFacturacion?: number;
}

export interface EntradaFacturacion {
  idFacturacion: number;
  cliente: string;
  prefacturable: boolean | null;
  totalPedidos: number;
  totalFacturados: number;
  idioma: string;
  estado: EstadoFacturacionPrincipal;
}

export interface RespuestaListaFacturacion {
  lstFacturacion: EntradaFacturacion[];
  totalRegistros: number;
  totalPaginas: number;
}

export interface EntradaFacturacionApi {
  idCliente: number;
  nombre: string;
  emitirPrefactura: "Si" | "No" | null;
  totalPedidos: number;
  pedidosFacturados: number;
  idIdiomaFacturacion: string;
  estadoFacturacion: "Finalizado" | "Pendiente" | "En pre-factura";
}

export interface ResultadoListaFacturacionApi {
  lstClientes: EntradaFacturacionApi[];
  totalRegistros: number;
  totalPaginas: number;
}

export interface EntradaFacturaCliente {
  idFactura: number;
  codigo: string;
  investigado: string;
  penalidad: boolean;
  codigoEstado: number;
  estado: EstadoFacturaCliente;
}

export interface ParametrosListaPedidosFacturacion {
  idCliente: number;
  busqueda?: string;
  numPag: number;
}

export interface EntradaPedidoFacturacionApi {
  idPedido: number;
  codigo: string;
  investigado: string | null;
  aplicaPenalidad: "Si" | "No";
  estadoFacturacion:
    | "Listo para facturación"
    | "En pre-factura"
    | "Pre-factura aprobada"
    | "Pre-factura rechazada"
    | "Aprobado"
    | "Rechazado"
    | "Pendiente Anulación"
    | "Anulación Aprobada"
    | "Anulación Rechazada"
    | "Borrador Factura";
}

export interface ResultadoListaPedidosFacturacionApi {
  lstPedidos: EntradaPedidoFacturacionApi[];
  totalRegistros: number;
  totalPaginas: number;
}

export interface RespuestaListaFacturasCliente {
  lstFacturas: EntradaFacturaCliente[];
  totalRegistros: number;
  totalPaginas: number;
}

export interface EntradaProductoFactura {
  idProductoFactura: number;
  idPedido: number;
  numeroLinea: number;
  idLineaDocumentoElectronico: number;
  productoSunatCodigo: string | null;
  idUnidadMedidaMaestro: number;
  unidadMedidaDescripcion: string;
  cantidad: number;
  descripcion: string;
  descuentoPorcentaje: number;
  valorUnitario: number;
  precioUnitario: number;
  porcentajeIgv: number;
  idAfectacionIgvMaestro: number;
  afectacionIgvDescripcion: string;
  total: number;
}

export interface EntradaCuotaFactura {
  idCuotaFactura: number;
  idCuotaDocumentoElectronico: number;
  numeroCuota: number;
  idMoneda: number;
  monto: number;
  vencimiento: string;
  estado: "pendiente" | "pagado";
}

export interface DetalleFactura {
  idFactura: number | null;
  codigoEstadoFacturacion: number | null;
  idDocumentoElectronico: number | null;
  idCliente: number;
  idTipoDocumentoMaestro: number;
  idMonedaMaestro: number;
  idTipoOperacionMaestro: number;
  idFormaPago: number;
  tipoDocumentoDescripcion: string;
  monedaDescripcion: string;
  tipoOperacionDescripcion: string;
  formaPagoDescripcion: string;
  cliente: string;
  ni: string;
  ordenCompra: string;
  fechaEmision: string;
  productos: EntradaProductoFactura[];
  cuotas: EntradaCuotaFactura[];
}

export interface EntradaProductoFacturable {
  idProductoFacturable: number;
  codigo: string;
  investigado: string;
  aplicaPenalidad: boolean;
  tipo: "express" | "normal" | "super-flash";
  fecha: string;
  penalidad: number;
  precio: number;
  descuentoPorcentaje: number;
}

export interface ParametrosListaProductosFacturables {
  idCliente: number;
  idTipoTramite?: number;
  fechaInicio?: string;
  fechaFin?: string;
  numPag: number;
}

export interface EntradaProductoFacturableApi {
  idPedido: number;
  codigo: string;
  investigado: string;
  aplicaPenalidad: "Si" | "No";
  tipoTramite: string;
  fecha: string;
  penalidad: number;
  precio: number;
  descuentoPorcentaje: number;
}

export interface ResultadoListaProductosFacturablesApi {
  totalRegistros: number;
  totalPaginas: number;
  pedidos: EntradaProductoFacturableApi[];
}

export interface RespuestaListaProductosFacturables {
  productos: EntradaProductoFacturable[];
  totalRegistros: number;
  totalPaginas: number;
}

export interface CuotaGuardarBorradorFactura {
  numeroCuota: number;
  fechaVencimiento: string;
  monto: number;
}

export interface DocumentoAfectadoGuardarBorradorFactura {
  idDocumentoElectronicoRelacionado: number;
  tipoReferenciaCodigo: string | null;
  motivoCodigo: string | null;
  motivoDescripcion: string | null;
}

export interface LineaGuardarBorradorFactura {
  idPedido: number;
  productoSunatCodigo: string | null;
  idUnidadMedidaMaestro: number;
  cantidad: number;
  montoDescuento: number;
  idAfectacionIgvMaestro: number;
  porcentajeIgv: number;
}

export interface CabeceraFacturaApi {
  idDocumentoElectronico: number;
  idEmpresa: number;
  idExterno: string;
  numeroReferencia: string | null;
  tipoDocumentoCodigo: string;
  serie: string;
  correlativo: number;
  estadoCodigo: string;
  fechaEmision: string;
  horaEmision: string;
  monedaCodigo: string;
  tipoOperacionCodigo: string;
  formaPagoCodigo: string;
  empresaRuc: string;
  empresaRazonSocial: string;
  empresaNombreComercial: string;
  empresaDireccion: string;
  empresaUbigeo: string;
  clienteTipoDocumentoCodigo: string;
  clienteNumeroDocumento: string;
  clienteNombre: string;
  clienteDireccion: string;
  clienteCorreo: string;
  clientePaisCodigo: string;
  totalGravado: number;
  totalInafecto: number;
  totalExonerado: number;
  totalGratuito: number;
  totalIgv: number;
  totalIsc: number;
  totalOtrosTributos: number;
  totalDescuento: number;
  totalCargo: number;
  totalImporte: number;
}

export interface LineaFacturaApi {
  idLineaDocumentoElectronico: number;
  numeroLinea: number;
  productoCodigo: string;
  productoSunatCodigo: string | null;
  descripcion: string;
  unidadMedidaCodigo: string;
  cantidad: number;
  valorUnitario: number;
  precioUnitario: number;
  montoDescuento: number;
  afectacionIgvCodigo: string;
  porcentajeIgv: number;
  montoIgv: number;
  montoIsc: number;
  montoOtrosTributos: number;
  valorLinea: number;
  totalLinea: number;
}

export interface CuotaFacturaApi {
  idCuotaDocumentoElectronico: number;
  numeroCuota: number;
  fechaVencimiento: string;
  monto: number;
}

export interface ResultadoObtenerFacturaApi {
  cabecera: CabeceraFacturaApi;
  lineas: LineaFacturaApi[];
  referencia: unknown | null;
  cuotas: CuotaFacturaApi[];
}

export interface LineaGuardarCambiosFactura
  extends LineaGuardarBorradorFactura {
  numeroLinea: number;
  idLineaDocumentoElectronico: number;
}

export interface CuotaGuardarCambiosFactura
  extends CuotaGuardarBorradorFactura {
  idCuotaDocumentoElectronico: number;
}

export interface GuardarCambiosFacturaRequest {
  idFormaPago: number;
  numeroReferencia: string;
  idMonedaMaestro: number;
  idTipoOperacionMaestro: number;
  lineas: LineaGuardarCambiosFactura[];
  cuotas: CuotaGuardarCambiosFactura[];
}

export interface AnularFacturaRequest {
  fechaReferencia: string;
  items: Array<{
    idDocumentoElectronico: number;
    motivoDescripcion: string;
  }>;
}

export interface ResultadoGuardarBorradorFactura {
  idDocumentoElectronico: number;
}

export interface ParametrosResumenFacturacion {
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface ResumenFacturacion {
  fechaDesde: string;
  fechaHasta: string;
  montoTotalMensual: number;
  cantidadFacturasEmitidas: number;
  promedioIngresoMensual: number | null;
}

export interface GuardarBorradorFacturaRequest {
  idTipoDocumentoMaestro: number;
  numeroReferencia: string;
  idMonedaMaestro: number;
  idTipoOperacionMaestro: number;
  idFormaPago: number;
  cuotas: CuotaGuardarBorradorFactura[];
  idCliente: number;
  documentoAfectado: DocumentoAfectadoGuardarBorradorFactura | null;
  lineas: LineaGuardarBorradorFactura[];
}

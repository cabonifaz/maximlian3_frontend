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
  estado: string;
  colorTexto: string;
  colorFondo: string;
}

export interface RespuestaListaFacturacion {
  lstFacturacion: EntradaFacturacion[];
  totalRegistros: number;
  totalPaginas: number;
}

export interface EntradaListaFactura {
  idDocumentoElectronico: number;
  numeroFactura: string;
  tipoDocumentoTexto: string;
  documentoAfectado: string | null;
  cliente: string;
  fechaEmision: string;
  formaPago: string;
  moneda?: string;
  monedaIcono: string;
  totalImporte: number;
  estado: string;
  colorLetra?: string;
  colorFondo?: string;
}

export interface EntradaListaFacturaApi {
  idDocumentoElectronico: number;
  numeroFactura: string;
  tipoDocumentoTexto: string;
  documentoAfectado: string | null;
  clienteNombre: string;
  fechaEmision: string;
  formaPagoCodigo: string;
  totalImporte: number;
  monedaIcono: string;
  estadoCodigo: string;
  colorLetra: string;
  colorFondo: string;
}

export interface ParametrosListaFacturas {
  estadoCodigo?: string;
  idFormaPago?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  busqueda?: string;
  pagina: number;
  tamanoPagina: number;
}

export interface ResultadoListaFacturasApi {
  totalRegistros: number;
  totalPaginas: number;
  items: EntradaListaFacturaApi[];
}

export interface RespuestaListaFacturas {
  totalRegistros: number;
  totalPaginas: number;
  items: EntradaListaFactura[];
}

export type FormatoDescargaFactura = 'pdf' | 'xml';

export interface ErrorDocumentoFactura {
  idErrorDocumento: number;
  origenErrorCodigo: string;
  codigoError: string;
  mensajeError: string;
  campo: string | null;
  severidadCodigo: string;
  fchCre: string;
}

export interface EntradaFacturacionApi {
  idCliente: number;
  nombre: string;
  emitirPrefactura: "Si" | "No" | null;
  totalPedidos: number;
  pedidosFacturados: number;
  idIdiomaFacturacion: string;
  estadoFacturacion: string;
  colorTexto: string;
  colorFondo: string;
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
  codigo: string;
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
  fechaPago: string | null;
}

export interface CampoExtraLineaFactura {
  idCampoExtraDocumentoElectronico: number;
  texto: string;
}

export interface DetalleFactura {
  idFactura: number | null;
  codigoEstadoFacturacion: number | null;
  idDocumentoElectronico: number | null;
  idCliente: number;
  idTipoDocumentoSunat: number;
  idTipoDocumentoMaestro: number;
  idMonedaMaestro: number;
  tipoCambio: number;
  idTipoOperacionMaestro: number;
  idFormaPago: number;
  idMotivoMaestro: number;
  esNotaCreditoDebito: boolean;
  tipoDocumentoDescripcion: string;
  monedaDescripcion: string;
  tipoOperacionDescripcion: string;
  formaPagoDescripcion: string;
  cliente: string;
  ni: string;
  ordenCompra: string;
  fechaEmision: string;
  fechaAceptacion: string | null;
  camposExtra: CampoExtraLineaFactura[];
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
  idEstadoCuotaMaestro: number;
  fechaPago: string | null;
}

export interface DocumentoAfectadoGuardarBorradorFactura {
  idDocumentoElectronicoRelacionado: number;
  idMotivoMaestro: number;
}

export interface LineaGuardarBorradorFactura {
  idPedido: number;
  productoSunatCodigo: string | null;
  idUnidadMedidaMaestro: number;
  cantidad: number;
  descripcion: string;
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
  fechaAceptacion: string | null;
  monedaCodigo: string;
  tipoCambio: number | null;
  tipoOperacionCodigo: string;
  formaPagoCodigo: string | null;
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
  estadoCuotaCodigo: string;
  fechaPago: string | null;
}

export interface CampoExtraFacturaApi {
  idCampoExtraDocumentoElectronico: number;
  texto: string;
}

export interface ReferenciaDocumentoElectronicoApi {
  idDocumentoElectronicoRelacionado: number;
  tipoDocumentoRelacionadoCodigo: string;
  serieRelacionada: string;
  correlativoRelacionado: number;
  motivoCodigo: string | null;
  motivoDescripcion: string | null;
}

export interface ResultadoObtenerFacturaApi {
  cabecera: CabeceraFacturaApi;
  lineas: LineaFacturaApi[];
  referencia: ReferenciaDocumentoElectronicoApi | null;
  cuotas: CuotaFacturaApi[] | null;
  camposExtra: CampoExtraFacturaApi[];
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

export interface CampoExtraGuardarBorradorFactura {
  texto: string;
}

export interface CampoExtraGuardarCambiosFactura {
  texto: string;
  idCampoExtraDocumentoElectronico: number;
}

export interface GuardarCambiosFacturaRequest {
  idFormaPago: number;
  numeroReferencia: string;
  idMonedaMaestro: number;
  tipoCambio: number;
  idTipoOperacionMaestro: number;
  lineas: LineaGuardarCambiosFactura[];
  cuotas: CuotaGuardarCambiosFactura[];
  camposExtra: CampoExtraGuardarCambiosFactura[];
}

export interface ActualizarEstadoCuotaRequest {
  idEstadoCuotaMaestro: number;
  fechaPago: string | null;
}

export interface AnularFacturaRequest {
  fechaReferencia: string;
  items: Array<{
    idDocumentoElectronico: number;
    motivoDescripcion: string;
  }>;
}

export interface AnularManualmenteFacturaRequest {
  motivo: string;
  fechaAnulacion: string;
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
  monedaIcono: string;
}

export interface GuardarBorradorFacturaRequest {
  idTipoDocumentoMaestro: number;
  numeroReferencia: string;
  idMonedaMaestro: number;
  tipoCambio: number;
  idTipoOperacionMaestro: number;
  idFormaPago: number;
  cuotas: CuotaGuardarBorradorFactura[];
  idCliente: number;
  documentoAfectado: DocumentoAfectadoGuardarBorradorFactura | null;
  lineas: LineaGuardarBorradorFactura[];
  camposExtra: CampoExtraGuardarBorradorFactura[];
}

export interface RespuestaExportarLibroVentas {
  archivo: Blob;
  nombreArchivo: string;
}

export interface ClienteNotaCreditoDebito {
  idTipoDocumentoSunat: number;
  numeroDocumento: string;
  nombre: string;
  correo: string;
  direccion: string;
  paisCodigo: number;
}

export interface ProductoParaNotaApi {
  numeroLinea: number;
  productoCodigo: string;
}

export interface ResultadoParaNotaApi {
  cliente: ClienteNotaCreditoDebito;
  idMonedaMaestro: number;
  tipoCambio: number;
  productos: ProductoParaNotaApi[];
}

export interface LineaNotaCreditoDebito {
  productoCodigo: string;
  productoSunatCodigo: string | null;
  descripcion: string;
  idUnidadMedidaMaestro: number;
  cantidad: number;
  valorUnitario: number;
  montoDescuento: number;
  idAfectacionIgvMaestro: number;
  porcentajeIgv: number;
}

export interface NotaCreditoDebitoRequest {
  idTipoDocumentoMaestro: number;
  numeroReferencia: string;
  idMonedaMaestro: number;
  tipoCambio: number;
  idTipoOperacionMaestro: number;
  cliente: ClienteNotaCreditoDebito;
  documentoAfectado: DocumentoAfectadoGuardarBorradorFactura;
  lineas: LineaNotaCreditoDebito[];
  camposExtra: CampoExtraGuardarBorradorFactura[];
}

export interface LineaEditarNotaCreditoDebito extends LineaNotaCreditoDebito {
  idLineaDocumentoElectronico: number;
}

export interface EditarNotaCreditoDebitoRequest {
  numeroReferencia: string;
  idMonedaMaestro: number;
  tipoCambio: number;
  idTipoOperacionMaestro: number;
  idMotivoMaestro: number;
  lineas: LineaEditarNotaCreditoDebito[];
  camposExtra: CampoExtraGuardarCambiosFactura[];
}

export interface CabeceraVerificacionFacturaApi {
  numeroReferencia: string | null;
  tipoDocumentoCodigo: string;
  serie: string;
  correlativo: number;
  estadoCodigo: string;
  fechaEmision: string;
  horaEmision: string;
  monedaCodigo: string;
  tipoCambio: number | null;
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
  sunatHash: string | null;
  sunatCodigoRespuesta: string | null;
  sunatDescripcionRespuesta: string | null;
  fechaAceptacion: string | null;
  fechaRechazo: string | null;
  fechaAnulacion: string | null;
  fchCre: string;
}

export interface LineaVerificacionFacturaApi {
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
  tributoSunatCodigo: string;
  tributoNombre: string;
  tributoTaxTypeCode: string;
  tributoCategoria: string;
  porcentajeIgv: number;
  montoIgv: number;
  montoIsc: number;
  montoOtrosTributos: number;
  valorLinea: number;
  totalLinea: number;
}

export interface CuotaVerificacionFacturaApi {
  numeroCuota: number;
  fechaVencimiento: string;
  monto: number;
  estadoCuotaCodigo: string;
  fechaPago: string | null;
}

export interface ResultadoVerificacionFacturaApi {
  cabecera: CabeceraVerificacionFacturaApi;
  lineas: LineaVerificacionFacturaApi[];
  referencia: unknown | null;
  cuotas: CuotaVerificacionFacturaApi[];
}

export type TipoPedidoDetalleFacturaVerificacion = "normal" | "express" | "super-flash";

export interface PedidoDetalleFacturaVerificacion {
  idPedido: number;
  tipo: TipoPedidoDetalleFacturaVerificacion;
  investigarRazonSocialNombres: string;
  numeroReferencia: string;
  pais: string;
  fechaSolicitud: string;
  fechaEnvio: string;
  tipoServicio: string;
  precio: number;
}

import type {
  AccionBandejaAnalista,
  ArchivoInvestigacionAnalista,
  DatosInvestigacionAnalista,
  EstadoInvestigacionAnalista,
  IdSeccionInvestigacionAnalista,
} from "./investigacion.type";

export interface InformeListParams {
  busqueda?: string;
  idPedido?: number;
  idEstado?: number;
  numPag?: number;
}

export interface InformeListEntry {
  idInforme: number;
  idInformeOriginal?: number | null;
  idPedido: number;
  idEstado: number;
  idIdioma?: number;
  codigo: string;
  investigado: string;
  pais: string;
  fecha: string;
  vigencia: string;
  vigenciaColor?: string;
  vigenciaFondo?: string;
  tipo: string;
  estadoInforme: string;
  estado: EstadoInvestigacionAnalista;
  accion: AccionBandejaAnalista;
}

export interface InformeListResponse {
  lstInforme: InformeListEntry[];
  asignado: number;
  enProceso: number;
  pendienteAprobacion: number;
  aprobado: number;
  rechazado: number;
  vigente: number;
  vencido: number;
  totalRegistros: number;
  totalPaginas: number;
}

export interface InformeBalanceRequest {
  idInformeBalance?: number;
  fechaBalance: string | null;
  fechaHasta: string | null;
  flgActualidad: boolean;
  tipoCambio: number;
  idMoneda: number;
  idTipoBalance: number;
  idTipoEstadoFinanciero?: number;
}

export interface InformeBalanceDesagregadoRequest {
  id: number;
  efectivoEquivalente?: number | null;
  otrosActivosFinancierosCorriente?: number | null;
  cuentasCobrarCorriente?: number | null;
  inventariosCorriente?: number | null;
  activosBiologicosCorriente?: number | null;
  activosImpuestosGanancias?: number | null;
  otrosActivosNoFinancierosCorriente?: number | null;
  totalActivoCorriente?: number | null;
  otrosActivosFinancierosNoCorriente?: number | null;
  inversionesSubsidiarias?: number | null;
  cuentasCobrarNoCorriente?: number | null;
  inventariosNoCorriente?: number | null;
  activosBiologicosNoCorriente?: number | null;
  propiedadesInversion?: number | null;
  propiedadesPlantaEquipo?: number | null;
  intangibles?: number | null;
  activosImpuestosDiferidos?: number | null;
  activosImpuestosCorrientes?: number | null;
  plusvalia?: number | null;
  otrosActivosNoFinancierosNoCorriente?: number | null;
  totalActivoNoCorriente?: number | null;
  totalActivo?: number | null;
  otrosPasivosFinancierosCorriente?: number | null;
  cuentasPagarCorriente?: number | null;
  beneficiosEmpleadosCorriente?: number | null;
  otrasProvisionesCorriente?: number | null;
  impuestosGananciasCorriente?: number | null;
  otrosPasivosNoFinancierosCorriente?: number | null;
  totalPasivoCorriente?: number | null;
  otrosPasivosFinancierosNoCorriente?: number | null;
  cuentasPagarNoCorriente?: number | null;
  beneficiosEmpleadosNoCorriente?: number | null;
  otrasProvisionesNoCorriente?: number | null;
  impuestosDiferidosNoCorriente?: number | null;
  impuestosCorrientesNoCorriente?: number | null;
  otrosPasivosNoFinancierosNoCorriente?: number | null;
  totalPasivoNoCorriente?: number | null;
  totalPasivos?: number | null;
  capitalEmitido?: number | null;
  primasEmision?: number | null;
  accionesInversion?: number | null;
  accionesCartera?: number | null;
  otrasReservasCapital?: number | null;
  resultadosAcumulados?: number | null;
  otrasReservasPatrimonio?: number | null;
  totalPatrimonio?: number | null;
  totalPasivoPatrimonio?: number | null;
  ingresosOrdinarios?: number | null;
  costoVentas?: number | null;
  gananciaBruta?: number | null;
  gastosVentas?: number | null;
  gastosAdministracion?: number | null;
  otrosIngresosOperativos?: number | null;
  otrosGastosOperativos?: number | null;
  otrasGananciasPerdidas?: number | null;
  gananciaOperativa?: number | null;
  ingresosFinancieros?: number | null;
  ingresosIntereses?: number | null;
  gastosFinancieros?: number | null;
  deterioroValor?: number | null;
  otrosIngresosSubsidiarias?: number | null;
  diferenciasCambio?: number | null;
  gananciaAntesImpuestos?: number | null;
  ingresoGastoImpuesto?: number | null;
  operacionesDescontinuadas?: number | null;
  gananciaNeta?: number | null;
  indiceLiquidez?: number | null;
  capitalTrabajo?: number | null;
  ratioEndeudamiento?: number | null;
  ratioRentabilidad?: number | null;
}

export interface InformeBalanceTotalizadoRequest {
  id: number;
  totalActivoCorriente?: number | null;
  totalActivoNoCorriente?: number | null;
  totalActivo?: number | null;
  totalPasivoCorriente?: number | null;
  totalPasivoNoCorriente?: number | null;
  totalPasivos?: number | null;
  totalPatrimonio?: number | null;
  totalPasivoPatrimonio?: number | null;
  ingresosOrdinarios?: number | null;
  gananciaNeta?: number | null;
  indiceLiquidez?: number | null;
  capitalTrabajo?: number | null;
  ratioEndeudamiento?: number | null;
  ratioRentabilidad?: number | null;
}

export interface InformeBalanceBancoRequest {
  id: number;
  disponible?: number | null;
  fondosInterbancarios?: number | null;
  inversionesValorRazonable?: number | null;
  carteraCreditos?: number | null;
  derivadosNegociacionActivo?: number | null;
  derivadosCoberturaActivo?: number | null;
  bienesRealizables?: number | null;
  participacionesSubsidiarias?: number | null;
  inmuebleMobiliarioEquipo?: number | null;
  impuestoRentaDiferido?: number | null;
  otrosActivos?: number | null;
  totalActivos?: number | null;
  obligacionesPublico?: number | null;
  fondosInterbancariosPasivo?: number | null;
  adeudosFinancieras?: number | null;
  derivadosNegociacionPasivo?: number | null;
  derivadosCoberturaPasivo?: number | null;
  cuentasPagarProvisiones?: number | null;
  totalPasivo?: number | null;
  capitalSocial?: number | null;
  reservas?: number | null;
  resultadosNoRealizados?: number | null;
  resultadoEjercicio?: number | null;
  totalPatrimonio?: number | null;
  totalPasivoPatrimonio?: number | null;
  ingresosIntereses?: number | null;
  utilidadEjercicio?: number | null;
}

export interface InformeBalanceSeguroRequest {
  id: number;
  efectivoDisponible?: number | null;
  inversionesFinancieras?: number | null;
  prestamosInteresesNetos?: number | null;
  primasCobrar?: number | null;
  deudasReaseguradores?: number | null;
  activosVenta?: number | null;
  propiedadesInversion?: number | null;
  propiedadPlantaEquipo?: number | null;
  otrosActivos?: number | null;
  totalActivos?: number | null;
  obligacionesAsegurados?: number | null;
  reservasSiniestros?: number | null;
  reservasTecnicas?: number | null;
  obligacionesReaseguradores?: number | null;
  obligacionesFinancieras?: number | null;
  cuentasPagar?: number | null;
  otrosPasivos?: number | null;
  totalPasivo?: number | null;
  capitalSocial?: number | null;
  aportesCapitalNoCapitalizados?: number | null;
  resultadosAcumulados?: number | null;
  patrimonioRestringido?: number | null;
  totalPatrimonio?: number | null;
  totalPasivoPatrimonio?: number | null;
  primasGanadasNetas?: number | null;
  utilidadNeta?: number | null;
}

export interface InformeBalanceTurquiaRequest {
  id: number;
  ano?: number | null;
  fechaBalance?: string | null;
  idMoneda?: number | null;
  duracionPeriodo?: number | null;
  idNivelConfiabilidad?: number | null;
  tipoCambio?: number | null;
  efectivo?: number | null;
  existencias?: number | null;
  deudores?: number | null;
  totalCorriente?: number | null;
  bienesTongibles?: number | null;
  activosIntangibles?: number | null;
  activoFijoNeto?: number | null;
  totalActivos?: number | null;
  prestamos?: number | null;
  acreedores?: number | null;
  pasivosCorrientes?: number | null;
  pasivosNoCorrientes?: number | null;
  pasivosLargoPlazo?: number | null;
  totalPasivosNoCorrientes?: number | null;
  totalPasivos?: number | null;
  capital?: number | null;
  reservas?: number | null;
  resultadosAcumulados?: number | null;
  resultadoEjercicio?: number | null;
  otrasCuentas?: number | null;
  patrimonio?: number | null;
  totalPatrimonio?: number | null;
  totalPasivosPatrimonio?: number | null;
  ventasNetas?: number | null;
  costoVentas?: number | null;
  costoMateriales?: number | null;
  gananciaBruta?: number | null;
  otrosGastosOperativos?: number | null;
  costoEmpleados?: number | null;
  depreciacion?: number | null;
  ingresosFinancieros?: number | null;
  gastosFinancieros?: number | null;
  interesesPagados?: number | null;
  plFinanciero?: number | null;
  ingresosExtraordinarios?: number | null;
  gastosExtraordinarios?: number | null;
  plExtraordinario?: number | null;
  gananciaAntesImpuestos?: number | null;
  impuestos?: number | null;
  gananciaNeta?: number | null;
  ebit?: number | null;
  ebitda?: number | null;
  ganancia?: number | null;
  indiceLiquidez?: number | null;
  capitalTrabajo?: number | null;
  ratioEndeudamiento?: number | null;
  ratioRentabilidad?: number | null;
}

export interface InformeBancoRequest {
  idInformeBanco?: number;
  idBanco: number;
  numeroCuenta: string;
  idSector: number;
  sectorista: string;
  referenciaBanco: string;
}

export interface InformeCompaniaRelacionadaRequest {
  idInformeCompaniaRelacionada?: number;
  idCompania: number;
}

export interface InformeOperacionExteriorRequest {
  idInformeExportacionImportacion?: number;
  anio: number;
  mesInicio: number;
  mesFin: number;
  idMoneda: number;
  paises: string;
  monto: number;
  productos: string;
  idTipoOperacion: number;
  numOperaciones: number;
}

export interface InformeProveedorRequest {
  idInformeProveedor?: number;
  idBancoProveedor: number;
  idTipoPersona: number;
  nombre: string;
  idPais: number;
  idTipoDocumento: number;
  numeroDocumento: string;
  idMoneda: number;
  fechaInicio: string | null;
  idLimiteCredito: number;
  promedioMensual: number;
  tipoCambio?: number;
  plazoCredito: string;
  productos: string;
  idCalificacion: number;
  comentarios: string;
  esTieneReferenciaComercial?: boolean;
  nombreContacto?: string;
  telefono?: string;
  comienzoNegociaciones?: string;
  idPlazoCredito?: number;
}

export interface InformeDirectorioEjecutivoRequest {
  idInformeDirectorioEjecutivo?: number;
  idDirectorioEjecutivo: number;
  idCargo: number;
  vinculadoDesde: string | null;
  companiaAnterior: string;
  participacion: number;
  orden: number;
  esParticipanteDirectiva: boolean;
  apareceImpresoLista: boolean;
  imprimeDatosEjecutivos: boolean;
}

export interface InformeImagenLocalRequest {
  idInformeLocalImagen?: number;
  imagenURL: string;
  idTipoArchivo: number;
}

export interface InformeLocalRequest {
  idInformeLocal?: number;
  idTipoLocal: number;
  comentario: string;
  imagenUrl: string;
  imagenes: InformeImagenLocalRequest[];
}

export interface InformePedidoRequest {
  idInformePedido?: number;
  idPedido: number;
  idIdioma: number;
  documentoWord: string;
  documentoExcel: string;
  idEstado: number;
}

export interface InformeCrearRequest {
  idInforme?: number;
  idPedido: number;
  idTipoPersona: number;
  nombre: string;
  nombreComercial: string;
  idPais: number;
  operacionesTCMoneda: number;
  taxIdType: number;
  taxNum: string;
  direccion: string;
  ubigeo: string;
  codigoPostal: string;
  telefono: string;
  fax: string;
  email: string;
  paginaWeb: string;
  idEstadoManual: number;
  idEstadoInforme: number;
  datosAdicionales: string;
  observacionesIdentificacion: string;
  idTipoEmpresa: number;
  fechaConstitucion: string | null;
  idCiudadRegistro: number;
  idNotaria: string;
  idNotario: string;
  idRegistro: string;
  idPlazo: string;
  idOperacionesCambioDivisas: number;
  capitalInicial: number;
  capitalPagado: number;
  fechaUltimoIncremento: string | null;
  idTipoIncremento: number;
  patrimonioNeto: number;
  tipoAcciones: string;
  valorAcciones: number;
  cotizaBolsa: boolean;
  idTipoCambio: number;
  tipoCambio: number;
  antecedentes: string;
  aspectosLegales: string;
  comentariosAspectoLegal: string;
  idSector: number;
  idActividad?: number;
  actividad: string;
  idIsicCategoria: number;
  idIsicClase: number;
  actividadPrincipal: string;
  ventasContado: number | null;
  ventasContadoText: string;
  ventasCredito: number | null;
  ventasCreditoText: string;
  idVentasCreditoTiempo: number;
  ventasNacionales: number | null;
  ventasNacionalesText: string;
  ventasInternacionales: number | null;
  ventasInternacionalesText: string;
  comprasNacionales: number | null;
  comprasNacionalesText: string;
  comprasContadoNacionales: number | null;
  comprasContadoNacionalesText: string;
  comprasCreditoNacionales: number | null;
  comprasCreditoNacionalesText: string;
  idComprasCreditoNacionalesTiempo: number;
  comprasInternacionales: number | null;
  comprasInternacionalesText: string;
  comprasContadoInternacionales: number | null;
  comprasContadoInternacionalesText: string;
  comprasCreditoInternacionales: number | null;
  comprasCreditoInternacionalesText: string;
  idComprasCreditoInternacionalesTiempo: number;
  numeroEmpleados: number;
  numeroEmpleadosText: string;
  comentariosOperaciones: string;
  contenidoInformacionFinanciera: string;
  comentarioInformacionFinanciera: string;
  activosFijos: string;
  seguros: string;
  comentarioProveedor: string;
  referenciaBanco: string;
  litigios: string;
  riesgoPrincipal: string;
  superintendecia: string;
  informacionGeneral: string;
  opinionCredito: string;
  flgTieneInformacion: boolean;
  lstBalances: InformeBalanceRequest[];
  lstBalancesDesagregado: InformeBalanceDesagregadoRequest[];
  lstBalancesTotalizado: InformeBalanceTotalizadoRequest[];
  lstBalancesBanco: InformeBalanceBancoRequest[];
  lstBalancesSeguro: InformeBalanceSeguroRequest[];
  lstBalancesTurquia: InformeBalanceTurquiaRequest[];
  lstBancos: InformeBancoRequest[];
  lstCompaniasRelacionadas: InformeCompaniaRelacionadaRequest[];
  lstExportacionesImportaciones: InformeOperacionExteriorRequest[];
  lstProveedores: InformeProveedorRequest[];
  lstDirectoriosEjecutivos: InformeDirectorioEjecutivoRequest[];
  lstLocales: InformeLocalRequest[];
}

export interface ImagenPendienteSubida {
  idInformeLocalImagen: number;
  nombre: string;
  uploadUrl: string;
}

export interface InformeCrearResponse {
  idInforme?: number;
  idPedido?: number;
  imagenesPendientes?: ImagenPendienteSubida[];
}

export interface InformeActualizarEstadoRequest {
  idInforme: number;
  idEstadoInforme: number;
}

export interface InformeObservacion {
  idInformeObservacion: number;
  observacion: string;
  checked: boolean;
}

export interface InformeInsertarObservacionesLoteRequest {
  idInforme: number;
  idPedido: number;
  observaciones: Array<Pick<InformeObservacion, "observacion" | "checked">>;
}

export type InformeEditarObservacionRequest = InformeObservacion;

export interface InformeEliminarObservacionRequest {
  idInformeObservacion: number;
}

export interface InformeObtenerResponse {
  idInforme?: number;
  idPedido?: number;
  idTipoPersona?: number;
  idPais?: number;
  taxIdType?: number;
  idEstadoManual?: number;
  idTipoEmpresa?: number;
  idTipoCambio?: number;
  idOperacionesTCMoneda?: number;
  idOperacionesCambioDivisas?: number;
  idVentasCreditoTiempo?: number;
  idCiudadRegistro?: number;
  idSector?: number;
  idActividad?: number;
  idIsicCategoria?: number;
  idIsicClase?: number;
  datosInvestigacion: DatosInvestigacionAnalista;
  archivosInvestigacion?: ArchivoInvestigacionAnalista[];
}

export interface InformeObtenerParams {
  idPedido: number;
}

export type AlineacionDocumentoInforme = "left" | "center" | "right" | "justify";

export interface DocumentoInformePageSetup {
  size?: string;
  orientation?: "portrait" | "landscape";
  margins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  headerDistance?: number;
  footerDistance?: number;
}

export interface DocumentoInformeLayout {
  sectionGap?: number;
  blockGap?: number;
  eachGap?: number;
  unit?: "px" | "pt" | "in" | "cm";
}

export interface DocumentoInformePagination {
  maxPageWeightPortrait?: number;
  maxPageWeightLandscape?: number;
  maxTableWeightPortrait?: number;
  maxTableWeightLandscape?: number;
  keepTablesUnderRows?: number;
  tableMinWeight?: number;
  tableRowWeight?: number;
  tableHeaderWeight?: number;
  titleRowWeight?: number;
  longTextCharactersPerWeight?: number;
  longTextWeight?: number;
  maxSplitCharacters?: number;
  reserveEndTableWeight?: number;
  keepTitleWithNext?: boolean;
  compactThreshold?: number;
}

export interface DocumentoInformeEstiloBase {
  fontFamily?: string;
  fontSize?: number;
  lineSpacing?: number;
  spaceBefore?: number;
  spaceAfter?: number;
  bold?: boolean;
  align?: AlineacionDocumentoInforme;
  width?: number;
  widthUnit?: "px" | "pt" | "in" | "cm";
  layout?: "fixed" | "auto";
  borders?: "none" | "single";
  innerHorizontalBorders?: "none" | "single";
  borderSize?: number;
  borderColor?: string;
  borderSpace?: number;
  cellBorders?: "none" | "single";
  cellBorderValue?: "nil" | "none" | "single";
  cellMargins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  columnWidths?: number[];
  columnWidthsByCols?: Record<string, number[]>;
  headerAlign?: AlineacionDocumentoInforme;
  headerBold?: boolean;
  titleTextAlign?: AlineacionDocumentoInforme;
  titleSpaceBefore?: number;
  titleSpaceAfter?: number;
  tableAlign?: AlineacionDocumentoInforme;
  textAlign?: AlineacionDocumentoInforme;
  cellAlign?: AlineacionDocumentoInforme;
  headerTextAlign?: AlineacionDocumentoInforme;
  whiteSpace?: "normal" | "pre-line" | "pre-wrap";
}

export interface DocumentoInformeBloqueParrafo {
  type: "paragraph";
  style?: string;
  text?: string;
  bold?: boolean;
  italic?: boolean;
  align?: AlineacionDocumentoInforme;
  fontFamily?: string;
  fontSize?: number;
  indent?: DocumentoInformeSangria;
  spaceBefore?: number;
  spaceAfter?: number;
}

export interface DocumentoInformeBloqueImagen {
  type: "image";
  src?: string;
  align?: AlineacionDocumentoInforme;
  width?: number;
  height?: number;
  unit?: "px" | "in" | "cm";
  tableCell?: {
    row?: number;
    col?: number;
  };
}

export interface DocumentoInformeBloqueTabla {
  type: "table";
  style?: string;
  cols?: number;
  header?: unknown[];
  rows?: unknown[][];
  static?: boolean;
  fontFamily?: string;
  fontSize?: number;
  align?: AlineacionDocumentoInforme;
  width?: number;
  widthUnit?: "px" | "pt" | "in" | "cm";
  layout?: "fixed" | "auto";
  borders?: "none" | "single";
  innerHorizontalBorders?: "none" | "single";
  borderSize?: number;
  borderColor?: string;
  borderSpace?: number;
  cellBorders?: "none" | "single";
  cellBorderValue?: "nil" | "none" | "single";
  cellMargins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  columnWidths?: number[];
  columnWidthsByCols?: Record<string, number[]>;
  headerAlign?: AlineacionDocumentoInforme;
  headerBold?: boolean;
  titleTextAlign?: AlineacionDocumentoInforme;
  titleSpaceBefore?: number;
  titleSpaceAfter?: number;
  tableAlign?: AlineacionDocumentoInforme;
  textAlign?: AlineacionDocumentoInforme;
  cellAlign?: AlineacionDocumentoInforme;
  headerTextAlign?: AlineacionDocumentoInforme;
  whiteSpace?: "normal" | "pre-line" | "pre-wrap";
}

export interface DocumentoInformeBloqueEach {
  type: "each";
  source?: string;
  blocks?: DocumentoInformeBloque[];
}

export type DocumentoInformeBloque =
  | DocumentoInformeBloqueParrafo
  | DocumentoInformeBloqueImagen
  | DocumentoInformeBloqueTabla
  | DocumentoInformeBloqueEach;

export interface DocumentoInformeSeccion {
  fontFamily?: string;
  fontSize?: number;
  align?: AlineacionDocumentoInforme;
  indent?: DocumentoInformeSangria;
  spaceBefore?: number;
  spaceAfter?: number;
  table?: DocumentoInformeBloqueTabla;
  blocks?: DocumentoInformeBloque[];
}

export interface DocumentoInformeSangria {
  left?: number;
  right?: number;
  unit?: "px" | "pt" | "in" | "cm";
}

export interface DocumentoInformeGenerado {
  html?: string;
  document?: PlantillaDocumentoConfig;
  sections?: PlantillaSeccion[];
  pageSetup?: DocumentoInformePageSetup;
  layout?: DocumentoInformeLayout;
  pagination?: DocumentoInformePagination;
  styles?: Record<string, DocumentoInformeEstiloBase>;
  header?: DocumentoInformeSeccion;
  footer?: DocumentoInformeSeccion;
  body?: DocumentoInformeBloque[];
}

export interface RespuestaDocumentoInformeGenerado {
  documento: DocumentoInformeGenerado;
  nombreInforme: string;
}

export interface DocumentoInformeObtenido {
  url: string;
  nombre: string;
}

export type FormatoDescargaInforme = ".pdf" | ".docx" | ".html" | ".xml";

export interface PlantillaIndent {
  left?: string;
  right?: string;
}

export interface PlantillaDocumentoConfig {
  pageSize?: { width?: string; height?: string };
  margins?: { top?: string; bottom?: string; left?: string; right?: string };
  contentIndent?: PlantillaIndent;
  footerIndent?: PlantillaIndent;
  headingIndent?: PlantillaIndent;
  font?: { family?: string; size?: string; lineSpacing?: number };
  header?: { logo?: string; logoWidth?: string; logoHeight?: string; align?: string; gapAfter?: string; marginTop?: string };
  footer?: { text?: string; pageLabel?: string; fontSize?: string; align?: string; showPageNumber?: boolean; gapBefore?: string; pageFontSize?: string; pageColor?: string; pageGapBefore?: string };
  pageBorder?: { width?: string; color?: string; top?: string; bottom?: string; left?: string; right?: string };
  watermark?: { image?: string; width?: string; height?: string; opacity?: number; position?: string };
}

export interface PlantillaFilaEtiquetaValor {
  label: string;
  value: string;
  separator?: string;
}

export type PlantillaSeccion =
  | { type: "heading"; level?: number; text: string; fontSize?: string }
  | { type: "subtitle"; text: string }
  | { type: "text"; field: string }
  | { type: "keyValue"; labelWidth?: string; style?: string; rows: PlantillaFilaEtiquetaValor[] }
  | { type: "borderedBox"; title: string; content?: string; rows?: PlantillaFilaEtiquetaValor[]; valueAlign?: string }
  | { type: "referenceBox"; fontSize?: string; title: string; items: string[] }
  | { type: "dataTable"; source?: string; columns: { header: string; field?: string }[]; rows?: unknown[]; style?: string; cellStyle?: string; headerStyle?: string; columnWidths?: string[] }
  | { type: "repeat"; source?: string; sections: PlantillaSeccion[] }
  | { type: "repeatDetail"; source?: string; titleField?: string; contentField?: string; items?: { title: string; content: string }[] }
  | { type: "spacer"; height?: string };

export interface InformeGenerarUrlsArchivoRequest {
  idPedido: number;
  nombres: string[];
}

export interface InformeUrlArchivoGenerada {
  nombre: string;
  uploadUrl: string;
  archivoUrl: string;
}

export interface InformeGenerarUrlsArchivoResponse {
  idInforme?: number;
  archivos: InformeUrlArchivoGenerada[];
}

export interface InformeArchivoLoteItem {
  nombre: string;
  archivoUrl: string;
  extension: string;
  tamanoBytes: number;
  idTipoArchivo: number | null;
  idFaseEvidencia: number | null;
}

export interface InformeInsertarArchivoLoteRequest {
  idInforme: number;
  idPedido: number;
  archivos: InformeArchivoLoteItem[];
}

export interface InformeInsertarArchivoLoteResponse {
  idInforme?: number;
  idPedido?: number;
}

export interface InformeObtenerArchivoRequest {
  idInformeArchivo: number;
}

export interface InformeObtenerArchivoResponse {
  downloadUrl: string;
}

export interface InformeActualizarArchivoRequest {
  idInformeArchivo: number;
  idTipoArchivo: number;
  idFaseEvidencia: number | null;
}

export interface InformeEliminarArchivoRequest {
  idInformeArchivo: number;
}

export type AlcanceExtraccionInforme = "general" | IdSeccionInvestigacionAnalista;
export type InformeConfiguracionExtraccion = Record<string, string[]>;

export type InformeContenidoTraduccionPlano = Record<string, string>;

export interface InformeContenidoTraduccionRamoOperaciones {
  campos?: InformeContenidoTraduccionPlano;
  importaciones?: InformeContenidoTraduccionPlano;
  exportaciones?: InformeContenidoTraduccionPlano;
}

export interface InformeContenidoTraduccion {
  identificacion?: InformeContenidoTraduccionPlano;
  legales?: InformeContenidoTraduccionPlano;
  ramoOperaciones?: InformeContenidoTraduccionRamoOperaciones;
  informacionFinanciera?: InformeContenidoTraduccionPlano;
  bancosProveedores?: InformeContenidoTraduccionPlano;
  datosGenerales?: InformeContenidoTraduccionPlano;
}

export interface InformeTraducirRequest {
  idioma: string;
  contenido: InformeContenidoTraduccion;
}

export interface InformeCampoExtraccionDisponible {
  id: number;
  claveCampo: string;
  etiquetaCampo: string;
  claveSeccionExtraccion?: string;
  clavesCamposExtraccion?: string[];
  esTraducible?: boolean;
}

export interface InformeSeccionExtraccionDisponible {
  claveSeccion: string;
  etiquetaSeccion: string;
  campos: InformeCampoExtraccionDisponible[];
}

export interface InformeObtenerUrlPrefirmadaRequest {
  fileName: string;
  mimeType: string;
}

export interface InformeObtenerUrlPrefirmadaResponse {
  uploadUrl: string;
  fileKey: string;
  expiresIn?: number;
}

export interface InformeAutocompletarRequest {
  fileKey: string;
  mimeType: string;
  secciones: InformeConfiguracionExtraccion;
  prompt: string;
}

export interface InformeExtraerDocumentoRequest {
  archivo: File;
  secciones: string;
  prompt: string;
}

export interface InformeExtraccionResponse {
  exito?: boolean;
  success?: boolean;
  mensaje?: string;
  camposExtraidos?: Partial<DatosInvestigacionAnalista>;
  extractedFields?: Partial<DatosInvestigacionAnalista>;
  secciones?: Partial<DatosInvestigacionAnalista>;
  result?: Partial<DatosInvestigacionAnalista>;
  alcance?: AlcanceExtraccionInforme;
}

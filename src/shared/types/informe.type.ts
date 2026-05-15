import type {
  AccionBandejaAnalista,
  DatosInvestigacionAnalista,
  EstadoInvestigacionAnalista,
} from "./investigacion.type";

export interface InformeListParams {
  busqueda?: string;
  idPedido?: number;
  idEstado?: number;
  numPag?: number;
}

export interface InformeListEntry {
  idInforme: number;
  idPedido: number;
  idEstado: number;
  codigo: string;
  investigado: string;
  pais: string;
  fecha: string;
  tipo: string;
  estado: EstadoInvestigacionAnalista;
  accion: AccionBandejaAnalista;
}

export interface InformeListResponse {
  lstInforme: InformeListEntry[];
  totalRegistros: number;
  totalPaginas: number;
}

export interface InformeCuentaBalanceRequest {
  totalCorriente: number;
  totalNoCorriente: number;
  otrosActivos: number;
  totalActivos: number;
  totalPasivosCorrientes: number;
  totalPasivosNoCorrientes: number;
  otrosPasivos: number;
  totalPasivos: number;
  patrimonio: number;
  totalPasivoPatrimonio: number;
  ventasNetas: number;
  utilidadPerdida: number;
  indiceLiquidez: number;
  capitalTrabajo: number;
  ratioEndeudamiento: number;
  ratioRentabilidad: number;
}

export interface InformeBalanceRequest {
  idInformeBalance?: number;
  fechaBalance: string | null;
  fechaHasta: string | null;
  flgActualidad: boolean;
  tipoCambio: number;
  idMoneda: number;
  tipoBalance: number;
  cuentaBalance: InformeCuentaBalanceRequest | null;
}

export interface InformeBancoRequest {
  idInformeBanco?: number;
  idBanco: number;
  numeroCuenta: string;
  idSector: number;
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
  plazoCredito: string;
  productos: string;
  idCalificacion: number;
  comentarios: string;
}

export interface InformeDirectorioEjecutivoRequest {
  idInformeDirectorioEjecutivo?: number;
  idTipoPersona: number;
  nombreCompleto: string;
  idPais: number;
  direccion: string;
  ubigeo: string;
  codigoPostal: string;
  idTipoDocumento: number;
  numeroDocumento: string;
  taxIdType: number;
  taxNum: string;
  idNacionalidad: number;
  fechaNacimiento: string | null;
  idEstadoCivil: number;
  idProfesion: number;
  referencias: string;
  cargos: string;
  formularioVinculado: string;
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
  idEstado: number;
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
  tipoCambio: number;
  antecedentes: string;
  aspectosLegales: string;
  comentariosAspectoLegal: string;
  idSector: number;
  idActividad: number;
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
  balances: InformeBalanceRequest[];
  bancos: InformeBancoRequest[];
  companiasRelacionadas: InformeCompaniaRelacionadaRequest[];
  exportacionesImportaciones: InformeOperacionExteriorRequest[];
  proveedores: InformeProveedorRequest[];
  directoriosEjecutivos: InformeDirectorioEjecutivoRequest[];
  locales: InformeLocalRequest[];
  pedidos: InformePedidoRequest[];
}

export interface InformeCrearResponse {
  idInforme?: number;
  idPedido?: number;
}

export interface InformeObtenerResponse {
  idInforme?: number;
  idPedido?: number;
  datosInvestigacion: DatosInvestigacionAnalista;
}

export type ModoInvestigacionAnalista = "iniciar" | "continuar" | "detalle";

export type IdSeccionInvestigacionAnalista =
  | "identificacion"
  | "aspectos-legales"
  | "ramo-operaciones"
  | "informacion-financiera"
  | "balances"
  | "bancos-proveedores"
  | "datos-generales"
  | "directorio-ejecutivo";

export type EstadoInvestigacionAnalista =
  | "asignado"
  | "en-proceso"
  | "pendiente-aprobacion"
  | "aprobado"
  | "rechazado";

export type AccionBandejaAnalista = "iniciar" | "continuar" | "detalle";

export interface DatosPedidoNavegacionInvestigacion {
  idPedido: number;
  idPlantilla?: number;
  investigado: string;
  pais: string;
  tipoTramite: string;
}

export type PestanaAspectosLegales = "data" | "companias";
export type PestanaRamoOperaciones = "operaciones" | "importaciones" | "exportaciones" | "locales";
export type PestanaBancosProveedores = "referencias" | "proveedores" | "bancos";

export interface TarjetaResumenAnalista {
  id: string;
  titulo: string;
  valor: number;
  colorIcono: string;
}

export interface RegistroBandejaAnalista {
  idInforme: number;
  idPedido: number;
  idPlantilla?: number;
  codigo: string;
  investigado: string;
  pais: string;
  fecha: string;
  tipo: string;
  estado: EstadoInvestigacionAnalista;
  estadoTexto?: string;
  estadoColorLetra?: string;
  estadoColorFondo?: string;
  accion: AccionBandejaAnalista;
}

export interface EmpresaRelacionadaAnalista {
  idCompania?: number;
  empresa: string;
  idFiscal: string;
  pais: string;
}

export interface RegistroImportacionExportacionAnalista {
  anio: string;
  mes: string;
  moneda: string;
  paises: string;
  productos: string;
  monto: string;
  operaciones: string;
}

export interface RegistroLocalAnalista {
  tipoLocal: string;
  direccion?: string;
  comentario: string;
  imagen: string;
  imagenUrl?: string;
  imagenTipo?: string;
  imagenes?: RegistroImagenLocalAnalista[];
}

export interface RegistroImagenLocalAnalista {
  nombre: string;
  url?: string;
  tipo?: string;
  esNueva?: boolean;
}

export interface RegistroBalanceAnalista {
  codigo: string;
  periodo: string;
  fecha: string;
  fechaInicio?: string;
  fechaFin?: string;
  esActual?: boolean;
  tipo: string;
  tipoEstadoFinanciero?: string;
  tipoCambio?: string;
  operacionCambio?: string;
  tipoBalance?: string;
  balanceGeneral: boolean;
  perdidaGanancia: boolean;
  cuentas: boolean;
  detalleCuentas?: DetalleCuentasBalanceAnalista;
}

export interface DetalleBalanceGeneralAnalista {
  totalCorrientes: string;
  totalNoCorrientes: string;
  otrosActivos: string;
  totalActivos: string;
  totalPasivosCorrientes: string;
  totalPasivosNoCorrientes: string;
  otrosPasivos: string;
  totalPasivos: string;
  patrimonio: string;
  totalPasivoPatrimonio: string;
}

export interface DetalleEstadoGananciaAnalista {
  ventasNetas: string;
  utilidadGanancia: string;
}

export interface DetalleRatiosBalanceAnalista {
  liquidez: string;
  capitalTrabajo: string;
  endeudamiento: string;
  rentabilidad: string;
}

export interface DetalleCuentasBalanceAnalista {
  balanceGeneral: DetalleBalanceGeneralAnalista;
  estadoGananciasPerdidas: DetalleEstadoGananciaAnalista;
  ratios: DetalleRatiosBalanceAnalista;
  totalesHabilitados?: boolean;
  registrosHabilitados?: boolean;
  registrosEstadoFinanciero?: Record<string, string>;
}

export interface RegistroDirectorioEjecutivoAnalista {
  id: number;
  idDirectorioEjecutivo?: number;
  ejecutivo: string;
  cargo: string;
  porcentaje: string;
  lista: boolean;
  detalleEjecutivo: boolean;
  orden: string;
  vinculadoDesde: string;
  companiaAnterior: string;
  esParteDirectorio: boolean;
  pais: string;
  tipoPersona: string;
  descripcionBusqueda: string;
  nombreCompleto: string;
}

export interface RegistroPersonaDirectorioAnalista {
  id: number;
  idDirectorioEjecutivo?: number;
  idTipoPersona?: number;
  tipoPersona: string;
  nombres: string;
  idPais?: number;
  pais: string;
  direccionPrincipal: string;
  ciudadProvinciaEstado: string;
  codigoPostal: string;
  idNacionalidad?: number;
  nacionalidad: string;
  idTipoDocumento?: number;
  tipoDocumentoIdentidad: string;
  numeroDocumentoIdentidad: string;
  taxIdType?: number;
  tipoIdFiscal: string;
  numeroIdFiscal: string;
  fechaNacimiento: string;
  idEstadoCivil?: number;
  estadoCivil: string;
  idProfesion?: number;
  profesion: string;
  referenciaAdicional: string;
}

export interface ResumenInvestigacionAnalista {
  codigo: string;
  nombreSolicitado: string;
  pais: string;
  prioridad: string;
  archivos: number;
  ultimaActualizacion?: string;
}

export interface DatosIdentificacionAnalista {
  tipoPersona: string;
  nombreEmpresa: string;
  nombreComercial: string;
  pais: string;
  operacionesCambio: string;
  tipoIdentificacionFiscal: string;
  numeroIdentificacionFiscal: string;
  direccionPrincipal: string;
  ciudadEstadoProvincia: string;
  numeroTelefono: string;
  numeroFax: string;
  correoElectronico: string;
  paginaWeb: string;
  estadoActual: string;
  datosAdicionales: string;
}

export interface DatosAspectosLegalesAnalista {
  tipoEmpresa: string;
  fechaConstitucion: string;
  ciudadRegistro: string;
  notaria: string;
  notario: string;
  registro: string;
  condiciones: string;
  operacionesCambioDivisas: string;
  monedaTipoCambio: string;
  capitalInicial: string;
  capitalDesembolsado: string;
  ultimaAmpliacion: string;
  patrimonioNeto: string;
  tipoAcciones: string;
  valorAcciones: string;
  obligacionBolsa: string;
  tipoCambio: string;
  antecedentes: string;
  aspectosLegales: string;
  comentariosEmpresasRelacionadas: string;
}

export interface DatosOperacionPrincipalAnalista {
  sector: string;
  actividad: string;
  categoriaCiiu: string;
  claseCiiu: string;
  actividadPrincipal: string;
  ventasContadoPorcentaje: string;
  ventasContadoDetalle: string;
  ventasCreditoPorcentaje: string;
  ventasCreditoDetalle: string;
  ventasCreditoSeleccion: string;
  territorioVentasPorcentaje: string;
  territorioVentasDetalle: string;
  ventasExtranjeroPorcentaje: string;
  ventasExtranjeroDetalle: string;
  comprasNacionalesPorcentaje: string;
  comprasNacionalesDetalle: string;
  comprasExtranjeroPorcentaje: string;
  comprasExtranjeroDetalle: string;
  numeroEmpleados: string;
  numeroEmpleadosDetalle: string;
  comentariosOperaciones: string;
}

export interface DatosInformacionFinancieraAnalista {
  contenido: string;
  comentariosFinancieros: string;
  activosFijos: string;
  seguros: string;
}

export interface DatosReferenciasAnalista {
  comentariosProveedores: string;
  referenciasBancos: string;
  litigios: string;
  riesgoPrincipal: string;
  superintendencia: string;
}

export interface RegistroProveedorAnalista {
  nombreEmpresa: string;
  contacto: string;
  tipoProveedor: string;
  telefono: string;
  tipoPersona: string;
  pais: string;
  taxIdType: string;
  taxIdNumber: string;
  tieneReferenciaComercial: boolean;
  comienzoNegociaciones?: string;
  operacionCambioMoneda?: string;
  tipoCambio?: string;
  limiteCredito?: string;
  promedioMensual?: string;
}

export interface RegistroBancoAnalista {
  idBanco?: number;
  idPais?: number;
  pais?: string;
  banco: string;
  numeroCuenta: string;
  sector: string;
  telefono: string;
  sectoristaJefeCuenta?: string;
}

export interface ArchivoInvestigacionAnalista {
  id: string;
  nombre: string;
  extension: string;
  tamano: number;
  tipoDocumento: "" | "Informativo" | "Evidencia";
  faseVinculada?: IdSeccionInvestigacionAnalista;
  archivo?: File;
  esPersistido?: boolean;
  urlDescarga?: string;
  mimeType?: string;
  faseVinculadaTexto?: string;
}

export interface ResultadoBusquedaBancoAnalista {
  nombres: string;
  tipoDocumento: string;
  pais: string;
  telefono: string;
  existeInforme: string;
}

export interface DatosGeneralesAnalista {
  informacionGeneral: string;
  opinionCredito: string;
}

export interface DatosInvestigacionAnalista {
  resumen: ResumenInvestigacionAnalista;
  identificacion: DatosIdentificacionAnalista;
  aspectosLegales: DatosAspectosLegalesAnalista;
  companiasRelacionadas: EmpresaRelacionadaAnalista[];
  operacionPrincipal: DatosOperacionPrincipalAnalista;
  importaciones: RegistroImportacionExportacionAnalista[];
  exportaciones: RegistroImportacionExportacionAnalista[];
  locales: RegistroLocalAnalista[];
  informacionFinanciera: DatosInformacionFinancieraAnalista;
  balances: RegistroBalanceAnalista[];
  referencias: DatosReferenciasAnalista;
  proveedores: RegistroProveedorAnalista[];
  bancos: RegistroBancoAnalista[];
  datosGenerales: DatosGeneralesAnalista;
  directorioEjecutivo: RegistroDirectorioEjecutivoAnalista[];
}

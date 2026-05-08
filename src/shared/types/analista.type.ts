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
  idPedido: number;
  codigo: string;
  investigado: string;
  pais: string;
  fecha: string;
  tipo: string;
  estado: EstadoInvestigacionAnalista;
  accion: AccionBandejaAnalista;
}

export interface EmpresaRelacionadaAnalista {
  empresa: string;
  idFiscal: string;
  pais: string;
}

export interface RegistroImportacionExportacionAnalista {
  anio: string;
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
  tipo: string;
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
}

export interface RegistroDirectorioEjecutivoAnalista {
  id: number;
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
  tipoPersona: string;
  nombres: string;
  pais: string;
  direccionPrincipal: string;
  ciudadProvinciaEstado: string;
  nacionalidad: string;
  tipoDocumentoIdentidad: string;
  numeroDocumentoIdentidad: string;
  tipoIdFiscal: string;
  numeroIdFiscal: string;
  fechaNacimiento: string;
  estadoCivil: string;
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
  banco: string;
  numeroCuenta: string;
  sector: string;
  telefono: string;
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

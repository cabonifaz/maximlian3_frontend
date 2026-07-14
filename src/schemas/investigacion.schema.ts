import { z } from "zod";

const textoFormulario = z.string().trim().catch("");
const idFormulario = z.coerce.number().catch(0);
const idOpcionalFormulario = z.coerce.number().positive().optional().catch(undefined);
const booleanoFormulario = z.coerce.boolean().catch(false);
const opcionBinariaFormulario = z.enum(["si", "no"]).catch("no");
const tipoDocumentoArchivoFormulario = z.enum(["", "Informativo", "Evidencia"]).catch("");

export const esquemaResumenInvestigacion = z.object({
  codigo: textoFormulario,
  nombreSolicitado: textoFormulario,
  pais: textoFormulario,
  prioridad: textoFormulario,
  archivos: idFormulario,
  ultimaActualizacion: textoFormulario.optional(),
});

export const esquemaIdentificacionInvestigacion = z.object({
  tipoPersona: textoFormulario,
  nombreEmpresa: textoFormulario,
  nombreComercial: textoFormulario,
  pais: textoFormulario,
  operacionesCambio: textoFormulario,
  tipoIdentificacionFiscal: textoFormulario,
  numeroIdentificacionFiscal: textoFormulario,
  direccionPrincipal: textoFormulario,
  ciudadEstadoProvincia: textoFormulario,
  numeroTelefono: textoFormulario,
  numeroFax: textoFormulario,
  correoElectronico: textoFormulario,
  paginaWeb: textoFormulario,
  estadoActual: textoFormulario,
  datosAdicionales: textoFormulario,
});

export const esquemaAspectosLegalesInvestigacion = z.object({
  tipoEmpresa: textoFormulario,
  fechaConstitucion: textoFormulario,
  ciudadRegistro: textoFormulario,
  notaria: textoFormulario,
  notario: textoFormulario,
  registro: textoFormulario,
  condiciones: textoFormulario,
  operacionesCambioDivisas: textoFormulario,
  monedaTipoCambio: textoFormulario,
  capitalInicial: textoFormulario,
  capitalDesembolsado: textoFormulario,
  ultimaAmpliacion: textoFormulario,
  patrimonioNeto: textoFormulario,
  tipoAcciones: textoFormulario,
  valorAcciones: textoFormulario,
  obligacionBolsa: textoFormulario,
  tipoCambio: textoFormulario,
  antecedentes: textoFormulario,
  aspectosLegales: textoFormulario,
  comentariosEmpresasRelacionadas: textoFormulario,
});

export const esquemaOperacionPrincipalInvestigacion = z.object({
  sector: textoFormulario,
  actividad: textoFormulario,
  categoriaCiiu: textoFormulario,
  claseCiiu: textoFormulario,
  actividadPrincipal: textoFormulario,
  ventasContadoPorcentaje: textoFormulario,
  ventasContadoDetalle: textoFormulario,
  ventasCreditoPorcentaje: textoFormulario,
  ventasCreditoDetalle: textoFormulario,
  ventasCreditoTiempo: textoFormulario,
  territorioVentasPorcentaje: textoFormulario,
  territorioVentasDetalle: textoFormulario,
  ventasExtranjeroPorcentaje: textoFormulario,
  ventasExtranjeroDetalle: textoFormulario,
  comprasNacionalesPorcentaje: textoFormulario,
  comprasNacionalesDetalle: textoFormulario,
  comprasContadoNacionalesPorcentaje: textoFormulario,
  comprasContadoNacionalesDetalle: textoFormulario,
  comprasCreditoNacionalesPorcentaje: textoFormulario,
  comprasCreditoNacionalesDetalle: textoFormulario,
  comprasCreditoNacionalesTiempo: textoFormulario,
  comprasExtranjeroPorcentaje: textoFormulario,
  comprasExtranjeroDetalle: textoFormulario,
  comprasContadoInternacionalesPorcentaje: textoFormulario,
  comprasContadoInternacionalesDetalle: textoFormulario,
  comprasCreditoInternacionalesPorcentaje: textoFormulario,
  comprasCreditoInternacionalesDetalle: textoFormulario,
  comprasCreditoInternacionalesTiempo: textoFormulario,
  numeroEmpleados: textoFormulario,
  numeroEmpleadosDetalle: textoFormulario,
  comentariosOperaciones: textoFormulario,
});

export const esquemaInformacionFinancieraInvestigacion = z.object({
  contenido: textoFormulario,
  comentariosFinancieros: textoFormulario,
  activosFijos: textoFormulario,
  seguros: textoFormulario,
});

export const esquemaReferenciasInvestigacion = z.object({
  comentariosProveedores: textoFormulario,
  referenciasBancos: textoFormulario,
  litigios: textoFormulario,
  riesgoPrincipal: textoFormulario,
  superintendencia: textoFormulario,
});

export const esquemaDatosGeneralesInvestigacion = z.object({
  informacionGeneral: textoFormulario,
  opinionCredito: textoFormulario,
});

export const esquemaEmpresaRelacionadaInvestigacion = z.object({
  idInformeCompaniaRelacionada: idOpcionalFormulario,
  idCompania: idOpcionalFormulario,
  empresa: textoFormulario,
  idFiscal: textoFormulario,
  pais: textoFormulario,
});

export const esquemaModalOperacionInvestigacion = z.object({
  idInformeExportacionImportacion: idOpcionalFormulario,
  idMesInicio: idOpcionalFormulario,
  idMesFin: idOpcionalFormulario,
  idMoneda: idOpcionalFormulario,
  anio: textoFormulario,
  mes: textoFormulario,
  moneda: textoFormulario,
  paises: textoFormulario,
  productos: textoFormulario,
  monto: textoFormulario,
  operaciones: textoFormulario,
});

export const esquemaModalLocalInvestigacion = z.object({
  idInformeLocal: idOpcionalFormulario,
  idTipoLocal: idOpcionalFormulario,
  tipoLocal: textoFormulario,
  direccion: textoFormulario.optional(),
  comentario: textoFormulario,
  imagen: textoFormulario,
  imagenUrl: textoFormulario.optional(),
  imagenTipo: textoFormulario.optional(),
  imagenes: z.array(z.object({
    idInformeLocalImagen: idOpcionalFormulario,
    idTipoArchivo: idOpcionalFormulario,
    nombre: textoFormulario,
    url: textoFormulario.optional(),
    tipo: textoFormulario.optional(),
    esNueva: booleanoFormulario.optional(),
    archivo: z.any().optional(),
  })).optional(),
});

export const esquemaDetalleCuentasBalanceInvestigacion = z.object({
  balanceGeneral: z.object({
    totalCorrientes: textoFormulario,
    totalNoCorrientes: textoFormulario,
    otrosActivos: textoFormulario,
    totalActivos: textoFormulario,
    totalPasivosCorrientes: textoFormulario,
    totalPasivosNoCorrientes: textoFormulario,
    otrosPasivos: textoFormulario,
    totalPasivos: textoFormulario,
    patrimonio: textoFormulario,
    totalPasivoPatrimonio: textoFormulario,
  }),
  estadoGananciasPerdidas: z.object({
    ventasNetas: textoFormulario,
    utilidadGanancia: textoFormulario,
  }),
  ratios: z.object({
    liquidez: textoFormulario,
    capitalTrabajo: textoFormulario,
    endeudamiento: textoFormulario,
    rentabilidad: textoFormulario,
  }),
  tipoBalanceTurquia: z.enum(["C", "I"]).optional(),
  totalesHabilitados: booleanoFormulario.optional(),
  registrosHabilitados: booleanoFormulario.optional(),
  registrosEstadoFinanciero: z.record(z.string(), textoFormulario).optional(),
});

export const esquemaModalBalanceInvestigacion = z.object({
  idInformeBalance: idOpcionalFormulario,
  codigo: textoFormulario,
  periodo: textoFormulario,
  fecha: textoFormulario,
  fechaInicio: textoFormulario.optional(),
  fechaFin: textoFormulario.optional(),
  esActual: booleanoFormulario.optional(),
  tipo: textoFormulario,
  idTipoEstadoFinanciero: idOpcionalFormulario,
  tipoEstadoFinanciero: textoFormulario.optional(),
  tipoCambio: textoFormulario.optional(),
  idMoneda: idOpcionalFormulario,
  operacionCambio: textoFormulario.optional(),
  idTipoBalance: idOpcionalFormulario,
  tipoBalance: textoFormulario.optional(),
  balanceGeneral: booleanoFormulario,
  perdidaGanancia: booleanoFormulario,
  cuentas: booleanoFormulario,
  detalleCuentas: esquemaDetalleCuentasBalanceInvestigacion.optional(),
});

export const esquemaModalProveedorInvestigacion = z.object({
  idInformeProveedor: idOpcionalFormulario,
  idTipoProveedor: idOpcionalFormulario,
  nombreEmpresa: textoFormulario,
  contacto: textoFormulario,
  tipoProveedor: textoFormulario,
  telefono: textoFormulario,
  tipoPersona: textoFormulario,
  idPais: idOpcionalFormulario,
  pais: textoFormulario,
  idTipoDocumento: idOpcionalFormulario,
  taxIdType: textoFormulario,
  taxIdNumber: textoFormulario,
  tieneReferenciaComercial: booleanoFormulario,
  esTieneReferenciaComercial: booleanoFormulario.optional(),
  comienzoNegociaciones: textoFormulario.optional(),
  idMoneda: idOpcionalFormulario,
  operacionCambioMoneda: textoFormulario.optional(),
  tipoCambio: textoFormulario.optional(),
  idLimiteCredito: idOpcionalFormulario,
  idPlazoCredito: idOpcionalFormulario,
  limiteCredito: textoFormulario.optional(),
  promedioMensual: textoFormulario.optional(),
});

export const esquemaModalBancoInvestigacion = z.object({
  idInformeBanco: idOpcionalFormulario,
  idBanco: idOpcionalFormulario,
  idPais: idOpcionalFormulario,
  idSector: idOpcionalFormulario,
  pais: textoFormulario.optional(),
  banco: textoFormulario,
  numeroCuenta: textoFormulario,
  sector: textoFormulario,
  telefono: textoFormulario,
  sectoristaJefeCuenta: textoFormulario.optional(),
});

export const esquemaArchivoInvestigacion = z.object({
  id: textoFormulario,
  idInformeArchivo: idOpcionalFormulario,
  nombre: textoFormulario,
  extension: textoFormulario,
  tamano: idFormulario,
  tipoDocumento: tipoDocumentoArchivoFormulario,
  idTipoEvidencia: idOpcionalFormulario,
  idFaseEvidencia: idOpcionalFormulario,
  faseVinculada: z.string().optional(),
  archivo: z.any().optional(),
  esPersistido: booleanoFormulario.optional(),
  urlDescarga: textoFormulario.optional(),
  mimeType: textoFormulario.optional(),
  faseVinculadaTexto: textoFormulario.optional(),
});

export const esquemaRegistroDirectorioEjecutivoInvestigacion = z.object({
  idInformeDirectorioEjecutivo: idOpcionalFormulario,
  id: idFormulario,
  idDirectorioEjecutivo: idOpcionalFormulario,
  idCargo: idOpcionalFormulario,
  ejecutivo: textoFormulario,
  cargo: textoFormulario,
  porcentaje: textoFormulario,
  lista: booleanoFormulario,
  detalleEjecutivo: booleanoFormulario,
  orden: textoFormulario,
  vinculadoDesde: textoFormulario,
  companiaAnterior: textoFormulario,
  esParteDirectorio: booleanoFormulario,
  pais: textoFormulario,
  tipoPersona: textoFormulario,
  descripcionBusqueda: textoFormulario,
  nombreCompleto: textoFormulario,
});

export const esquemaDatosInvestigacion = z.object({
  resumen: esquemaResumenInvestigacion,
  identificacion: esquemaIdentificacionInvestigacion,
  aspectosLegales: esquemaAspectosLegalesInvestigacion,
  companiasRelacionadas: z.array(esquemaEmpresaRelacionadaInvestigacion),
  operacionPrincipal: esquemaOperacionPrincipalInvestigacion,
  importaciones: z.array(esquemaModalOperacionInvestigacion),
  exportaciones: z.array(esquemaModalOperacionInvestigacion),
  locales: z.array(esquemaModalLocalInvestigacion),
  informacionFinanciera: esquemaInformacionFinancieraInvestigacion,
  balances: z.array(esquemaModalBalanceInvestigacion),
  referencias: esquemaReferenciasInvestigacion,
  proveedores: z.array(esquemaModalProveedorInvestigacion),
  bancos: z.array(esquemaModalBancoInvestigacion),
  datosGenerales: esquemaDatosGeneralesInvestigacion,
  directorioEjecutivo: z.array(esquemaRegistroDirectorioEjecutivoInvestigacion),
});

export type DatosInvestigacionSchema = z.infer<typeof esquemaDatosInvestigacion>;

export const registroEjecutivoInvestigacionSchema = z.object({
  ejecutivo: textoFormulario,
  vinculadoDesde: textoFormulario,
  companiaAnterior: textoFormulario,
  porcentaje: textoFormulario,
  esParteDirectorio: opcionBinariaFormulario,
  imprimirListado: opcionBinariaFormulario,
  imprimirDetalle: opcionBinariaFormulario,
});

export type DatosFormularioRegistroEjecutivoInvestigacion = z.infer<
  typeof registroEjecutivoInvestigacionSchema
>;

export const registroPersonaDirectorioInvestigacionSchema = z.object({
  idTipoPersona: idFormulario,
  tipoPersona: textoFormulario,
  nombres: textoFormulario,
  idPais: idFormulario,
  pais: textoFormulario,
  direccionPrincipal: textoFormulario,
  ciudadProvinciaEstado: textoFormulario,
  codigoPostal: textoFormulario,
  idNacionalidad: idFormulario,
  nacionalidad: textoFormulario,
  idTipoDocumento: idFormulario,
  tipoDocumentoIdentidad: textoFormulario,
  numeroDocumentoIdentidad: textoFormulario,
  taxIdType: idFormulario,
  tipoIdFiscal: textoFormulario,
  numeroIdFiscal: textoFormulario,
  fechaNacimiento: textoFormulario,
  idEstadoCivil: idFormulario,
  estadoCivil: textoFormulario,
  idProfesion: idFormulario,
  profesion: textoFormulario,
  referenciaAdicional: textoFormulario,
});

export type DatosFormularioRegistroPersonaDirectorioInvestigacion = z.infer<
  typeof registroPersonaDirectorioInvestigacionSchema
>;

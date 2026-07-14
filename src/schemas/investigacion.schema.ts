import { z } from "zod";

const textoFormulario = z.string().trim().catch("");
const idFormulario = z.coerce.number().catch(0);
const opcionBinariaFormulario = z.enum(["si", "no"]).catch("no");

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

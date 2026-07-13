import type { RegistroPersonaDirectorioAnalista } from "./investigacion.type";

export interface DirectorioEjecutivoListarParams {
  busqueda?: string;
  numPag?: number;
}

export interface DirectorioEjecutivoObtenerParams {
  idDirectorioEjecutivo?: number;
  nombreCompleto?: string;
  numeroDocumento?: string;
}

export interface DirectorioEjecutivoGuardarRequest {
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
}

export interface DirectorioEjecutivoEditarRequest extends DirectorioEjecutivoGuardarRequest {
  idDirectorioEjecutivo: number;
}

export interface DirectorioEjecutivoEliminarRequest {
  idDirectorioEjecutivo: number;
}

export interface DirectorioEjecutivoGuardarResponse {
  idDirectorioEjecutivo?: number;
}

export interface DirectorioEjecutivoListarResponse {
  registros: RegistroPersonaDirectorioAnalista[];
  totalRegistros: number;
  totalPaginas: number;
}

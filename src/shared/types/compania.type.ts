export interface CompaniaListParams {
  busqueda?: string;
  numPag?: number;
}

export interface CompaniaObtenerParams {
  idCompania?: number;
  numDocumento?: string;
  nombre?: string;
}

export interface CompaniaListaItem {
  idCompania: number;
  idTipoPersona?: number;
  idTipoDocumento?: number;
  idPais?: number;
  direccion?: string;
  ubigeo?: string;
  codigoPostal?: string;
  numeroDocumento: string;
  nombreCompleto: string;
  pais: string;
  telefono: string;
  existeInformacion: string;
  tipoPersona?: string;
  tipoDocumento?: string;
}

export interface CompaniaListResponse {
  lstCompania: CompaniaListaItem[];
  totalRegistros: number;
  totalPaginas: number;
}

export interface CompaniaCrearRequest {
  idTipoPersona: number;
  idTipoDocumento: number;
  numeroDocumento: string;
  nombreCompleto: string;
  idPais: number;
  telefono: string;
  direccion: string;
  ciudadProvinciaEstado: string;
  codigoPostal: string;
  existeInformacion: boolean;
}

export interface DirectorioEjecutivoCrearRequest {
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

export interface CompaniaEditarRequest extends CompaniaCrearRequest {
  idCompania: number;
}

export interface CompaniaEliminarRequest {
  idCompania: number;
}

export interface CompaniaGuardarResponse {
  idCompania?: number;
}

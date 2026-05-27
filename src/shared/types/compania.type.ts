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
  numeroDocumento: string;
  nombreCompleto: string;
  pais: string;
  telefono: string;
  existeInformacion: boolean;
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
  existeInformacion: boolean;
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

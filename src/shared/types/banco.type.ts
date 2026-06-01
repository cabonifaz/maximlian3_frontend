export interface BancoListParams {
  busqueda?: string;
  numPag?: number;
}

export interface BancoObtenerParams {
  idBanco?: number;
  nombre?: string;
}

export interface BancoListaItem {
  idBanco: number;
  idPais?: number;
  idSector?: number;
  nombre: string;
  telefono: string;
  pais: string;
  sector?: string;
}

export interface BancoListResponse {
  lstBanco: BancoListaItem[];
  totalRegistros: number;
  totalPaginas: number;
}

export interface BancoCrearRequest {
  idPais: number;
  nombre: string;
  telefono: string;
}

export interface BancoEditarRequest extends BancoCrearRequest {
  idBanco: number;
}

export interface BancoEliminarRequest {
  idBanco: number;
}

export interface BancoGuardarResponse {
  idBanco?: number;
}

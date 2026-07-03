export interface CompaniaNoticiaArchivo {
  idCompaniaNoticiaArchivo: number;
  idTipoArchivo: number;
  nombreArchivo: string;
  formatoArchivo: string;
  archivoUrl: string;
  downloadUrl: string;
  uploadUrl: string;
}

export interface CompaniaNoticiaListaItem {
  idCompaniaNoticia: number;
  idCompania: number;
  compania: string;
  titulo: string;
  descripcion: string;
  fechaNoticia: string;
  categoria: string;
  archivos: CompaniaNoticiaArchivo[];
}

export interface CompaniaNoticiaListParams {
  idCompania?: number;
  busqueda?: string;
  numPag?: number;
}

export interface CompaniaNoticiaObtenerParams {
  idCompaniaNoticia?: number;
  idCompania?: number;
}

export interface CompaniaNoticiaListResponse {
  lstCompaniaNoticia: CompaniaNoticiaListaItem[];
  totalRegistros: number;
  totalPaginas: number;
}

export interface CompaniaNoticiaCrearRequest {
  idCompania: number;
  titulo: string;
  descripcion: string;
  fechaNoticia: string;
  categoria: string;
  archivos: CompaniaNoticiaArchivo[];
}

export interface CompaniaNoticiaEditarRequest extends CompaniaNoticiaCrearRequest {
  idCompaniaNoticia: number;
}

export interface CompaniaNoticiaEliminarRequest {
  idCompaniaNoticia: number;
}

export interface CompaniaNoticiaGuardarResponse {
  idCompaniaNoticia?: number;
  archivos: CompaniaNoticiaArchivo[];
}

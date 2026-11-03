export interface CompaniaNoticiaArchivo {
  idCompaniaNoticiaArchivo: number;
  idTipoArchivo: number;
  nombreArchivo: string;
  nombreDocumento?: string;
  formatoArchivo: string;
  extension?: string;
  tamanoBytes?: number;
  archivoUrl: string;
  downloadUrl: string;
  uploadUrl: string;
}

export interface CompaniaNoticiaArchivoRequest {
  idCompaniaNoticiaArchivo: number;
  idTipoArchivo: number;
  nombreArchivo: string;
  nombreDocumento: string;
  formatoArchivo: string;
  archivoUrl: string;
  uploadUrl: string;
}

export interface CompaniaNoticiaListaItem {
  idCompaniaNoticia: number;
  idNoticia: number;
  idIdioma: number;
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
  fechaInicio?: string;
  fechaFin?: string;
}

export interface CompaniaNoticiaObtenerParams {
  idCompania?: number;
  idNoticia?: number;
  idIdioma?: number;
}

export interface CompaniaNoticiaTraducirParams {
  idNoticia: number;
  idIdiomaOrigen: number;
  idIdiomaDestino: number;
}

export interface CompaniaNoticiaTraduccion {
  titulo: string;
  descripcion: string;
}

export interface CompaniaNoticiaArchivoObtenerParams {
  idCompaniaNoticiaArchivo: number;
}

export interface CompaniaNoticiaArchivoObtenerResponse {
  downloadUrl: string;
}

export interface CompaniaNoticiaArchivoEliminarRequest {
  idCompaniaNoticiaArchivo: number;
}

export interface CompaniaNoticiaListResponse {
  lstCompaniaNoticia: CompaniaNoticiaListaItem[];
  totalRegistros: number;
  totalPaginas: number;
}

export interface CompaniaNoticiaCrearRequest {
  idCompania: number;
  idIdioma?: number;
  idNoticia?: number;
  titulo: string;
  descripcion: string;
  fechaNoticia: string;
  categoria: string;
  archivos: CompaniaNoticiaArchivoRequest[];
}

export interface CompaniaNoticiaEditarRequest extends CompaniaNoticiaCrearRequest {
  idNoticia: number;
  idIdioma: number;
}

export interface CompaniaNoticiaEliminarRequest {
  idNoticia: number;
}

export interface CompaniaNoticiaGuardarResponse {
  idNoticia?: number;
  idIdioma?: number;
  archivos: CompaniaNoticiaArchivo[];
}

export interface CompaniaNoticiaDetalleListParams {
  idCompania?: number;
  busqueda?: string;
  numPag?: number;
}

export interface CompaniaNoticiaDetalleListaItem {
  idCompania: number;
  razonSocial: string;
  numeroDocumento: string;
  pais: string;
  direccion: string;
  telefono: string;
  actividadComercial: string;
  trabajadores: number;
}

export interface CompaniaNoticiaDetalleListResponse {
  lstCompaniaNoticiaDetalle: CompaniaNoticiaDetalleListaItem[];
  totalRegistros: number;
  totalPaginas: number;
}

export interface CompaniaNoticiaDetalleExportResponse {
  archivo?: Blob;
  downloadUrl?: string;
  nombreArchivo: string;
}

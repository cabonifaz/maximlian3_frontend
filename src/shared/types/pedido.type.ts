export interface PedidoListEntry {
  idPedido: number;
  codigo: string;
  idCliente: number;
  cliente: string;
  investigado: string;
  idIdioma: number;
  idioma: string;
  logoImprimible: boolean;
  estado: number;
  descripcionEstado: string;
  colorLetra: string;
  colorFondo: string;
  vigencia: number;
}

export interface PedidoListResponse {
  lstPedido: PedidoListEntry[];
  totalRegistros: number;
  totalPaginas: number;
}

export interface PedidoListParams {
  busqueda?: string;
  idCliente?: number;
  idEstado?: number;
  numPag?: number;
}

export interface CreatePedidoArchivoRequest {
  tipoArchivo: string;
  nombreDocumento: string;
  tamanoArchivo: number;
}

export interface CreatePedidoRequest {
  codigo: string;
  idCliente: number;
  numeroDocumento: string;
  nombreCliente: string;
  idTipoPersona: number;
  idCompania: number;
  investigarRazonSocialNombres: string;
  idTarifario: number;
  idPlantilla: number;
  idIdioma: number;
  idClaseInforme: number;
  numReferencia?: string;
  montoCredito?: number;
  plazoCredito?: number;
  fchDesde: string;
  fchHasta: string;
  comentario: string;
  idEstado: number;
  archivos: CreatePedidoArchivoRequest[];
}

export interface CreatePedidoArchivoResponse {
  nombreDocumento: string;
  rutaArchivo: string;
  uploadUrl: string;
}

export interface CreatePedidoResponse {
  idPedido: number;
  archivos: CreatePedidoArchivoResponse[];
}

export interface PedidoAsignacionEntry {
  idEstadoAsignacion: number;
  descripcion: string;
  idEstadoInforme?: number | null;
  descripcionEstadoInforme?: string | null;
}

export interface PedidoListEntry {
  idPedido: number;
  idAsignacion?: number;
  fechaMod?: string;
  codigo: string;
  idCliente: number;
  cliente: string;
  investigado: string;
  idIdioma?: number;
  idioma: string;
  tipoTramite?: string;
  analista?: string;
  traductor?: string;
  logoImprimible: boolean;
  estado: number;
  descripcionEstado: string;
  colorLetra: string;
  colorFondo: string;
  idFase?: number;
  requiereTraduccion?: 0 | 1;
  vigencia: string | number;
  asignaciones: PedidoAsignacionEntry[];
}

export interface PedidoListResponse {
  lstPedido: PedidoListEntry[];
  pendiente: number;
  enRevision: number;
  aprobado: number;
  observado: number;
  cancelado: number;
  totalRegistros: number;
  totalPaginas: number;
}

export interface PedidoListParams {
  busqueda?: string;
  idPedido?: number;
  idCliente?: number;
  idEstado?: string;
  idEstadoAsignacion?: number;
  numPag?: number;
}

export interface PedidoAccionRequest {
  idPedido: number;
}

export interface CreatePedidoArchivoRequest {
  formatoArchivo: string;
  nombreDocumento: string;
  tamanoArchivo: number;
  idTipoArchivo: number;
}

export interface CreatePedidoRequest {
  codigo: string | null;
  idCliente: number;
  numeroDocumento: string;
  nombreCliente: string;
  idTipoPersona: number;
  idEmpresaAtencion: number;
  numeroDocumentoInvestigado: string;
  investigarRazonSocialNombres: string;
  idCompania: number;
  idTarifario: number;
  idPlantilla: number;
  idIdioma: number;
  idClaseInforme: number;
  numReferencia?: string;
  montoCredito?: number;
  plazoCredito?: number;
  idTipoPlazoCredito?: number;
  tipoPlazoCredito?: string;
  fchDesde: string;
  fchHasta: string;
  comentario: string;
  idEstado: number;
  imprimeLogoSafety: boolean;
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

export interface GetPedidoResponse {
  idPedido: number;
  codigoPedido?: string;
  codigo: string | null;
  idCliente: number;
  numeroDocumento: string;
  nombreCliente: string;
  idTipoPersona: number;
  idCompania: number;
  idEmpresaAtencion: number;
  numeroDocumentoInvestigado: string;
  investigarRazonSocialNombres: string;
  idTarifario: number;
  idPlantilla: number;
  idIdioma: number;
  idClaseInforme: number;
  numReferencia: string | null;
  montoCredito: number | null;
  plazoCredito: number | null;
  idTipoPlazoCredito: number | null;
  tipoPlazoCredito: string | null;
  fchDesde: string;
  fchHasta: string;
  comentario: string;
  idEstado: number;
  imprimeLogoSafety: boolean;
}

export interface UpdatePedidoRequest {
  idPedido: number;
  codigo: string | null;
  idCliente: number;
  numeroDocumento: string;
  nombreCliente: string;
  idTipoPersona: number;
  idEmpresaAtencion: number;
  numeroDocumentoInvestigado: string;
  investigarRazonSocialNombres: string;
  idCompania: number;
  idTarifario: number;
  idPlantilla: number;
  idIdioma: number;
  idClaseInforme: number;
  numReferencia?: string;
  montoCredito?: number;
  plazoCredito?: number;
  idTipoPlazoCredito?: number;
  tipoPlazoCredito?: string;
  fchDesde: string;
  fchHasta: string;
  comentario: string;
  idEstado: number;
  imprimeLogoSafety: boolean;
}

export interface PedidoArchivoEntry {
  idPedidoArchivo: number;
  idPedido: number;
  documentoURL: string;
  nombreDocumento: string;
  tamanoArchivo: number;
  tipoFormato: string;
  idFormato: number;
  idTipoArchivo: number;
  idEstado: number;
  fechaCarga: string;
}

export interface PedidoArchivoListResponse {
  lstPedidoArchivo: PedidoArchivoEntry[];
  totalRegistros: number;
  totalPaginas: number;
}

export interface AddPedidoArchivosRequest {
  idPedido: number;
  archivos: CreatePedidoArchivoRequest[];
}

export interface DeletePedidoArchivoRequest {
  idPedidoArchivo: number;
  idPedido: number;
}

export interface GetPedidoArchivoResponse {
  idPedidoArchivo: number;
  idPedido: number;
  documentoURL: string;
  nombreDocumento: string;
  tamanoArchivo: number;
  idFormato: number;
  idEstado: number;
  idTipoArchivo: number;
  downloadUrl: string;
}

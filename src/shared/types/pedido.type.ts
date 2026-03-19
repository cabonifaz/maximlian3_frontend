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

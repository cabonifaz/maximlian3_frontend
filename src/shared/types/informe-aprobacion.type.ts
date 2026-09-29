export interface RegistroInformePendienteAprobacion {
  idInforme: number;
  idPedido: number;
  investigado: string;
  pais: string;
  plantilla: string;
  idioma: string;
  usuario: string;
  fecha: string;
}

export interface ParametrosListaInformesPendientesAprobacion {
  idPais?: number;
  idPlantilla?: number;
  idIdioma?: number;
  fchInicio?: string;
  fchFin?: string;
  numPag: number;
}

export interface RespuestaListaInformesPendientesAprobacion {
  lstInformes: RegistroInformePendienteAprobacion[];
  totalRegistros: number;
  totalPaginas: number;
}

export interface AprobarInformesRequest {
  idInformes: number[];
}

export interface RegistroInformePendienteAprobacion {
  idInforme: number;
  idPedido: number;
  investigado: string;
  pais: string;
  plantilla: string;
  idioma: string;
  usuario: string;
  fecha: string;
  esMuestra: boolean;
}

export interface ParametrosListaInformesPendientesAprobacion {
  idPais?: number;
  idPlantilla?: number;
  idIdioma?: number;
  fchInicio?: string;
  fchFin?: string;
  soloMuestra?: boolean;
  numPag: number;
}

export interface RespuestaListaInformesPendientesAprobacion {
  lstInformes: RegistroInformePendienteAprobacion[];
  totalRegistros: number;
  totalPaginas: number;
  totalMuestra?: number;
}

export interface AprobarInformesRequest {
  idInformes: number[];
}

export interface MuestraInformesRequest {
  idInformes: number[];
}

export interface AprobarTodosInformesRequest {
  idPais: number | null;
  idPlantilla: number | null;
  idIdioma: number | null;
  fchInicio: string | null;
  fchFin: string | null;
  totalEsperado: number;
}

export type ModoVistaRevisionMigracion = "formulario" | "documento";

export type ModalBandejaAprobacionMigraciones = "aprobar-seleccionados" | "aprobar-todos";

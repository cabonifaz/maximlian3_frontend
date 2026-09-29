export type RolMigracionInforme = "analista" | "traductor";

export type EstadoMigracionInforme =
  | "borrador"
  | "en-proceso"
  | "pendiente-aprobacion"
  | "aprobado"
  | "rechazado";

export interface ParametrosListaMigracionesInforme {
  busqueda?: string;
  idEstado?: string;
  idPlantilla?: string;
  numPag?: number;
}

export interface RegistroMigracionInforme {
  idInformeMigracion: number;
  idInformeMigracionOriginal?: number | null;
  idEstado: number;
  estado: EstadoMigracionInforme;
  estadoDescripcion: string;
  investigado: string;
  idPais: number | null;
  pais: string;
  idPlantilla: number | null;
  plantilla: string;
  idIdiomaOrigen: number | null;
  idiomaOrigen: string;
  idIdiomaDestino: number | null;
  idiomaDestino: string;
  creador: string;
  rolCreador: string;
  fechaModificacion: string;
  requiereTraduccion: boolean;
}

export interface RespuestaListaMigracionesInforme {
  listaMigraciones: RegistroMigracionInforme[];
  borrador: number;
  enProceso: number;
  pendienteAprobacion: number;
  aprobado: number;
  rechazado: number;
  totalRegistros: number;
  totalPaginas: number;
}

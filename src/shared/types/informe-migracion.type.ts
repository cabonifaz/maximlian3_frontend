export type RolMigracionInforme = "analista" | "traductor" | "coordinador";

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
  soloPendientesAprobacion?: boolean;
}

export interface RegistroMigracionInforme {
  idInformeMigracion: number;
  idInformeMigracionOriginal?: number | null;
  idEstado: number;
  estado: EstadoMigracionInforme;
  estadoDescripcion: string;
  investigado: string;
  pais: string;
  plantilla: string;
  idiomaOrigen: string;
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

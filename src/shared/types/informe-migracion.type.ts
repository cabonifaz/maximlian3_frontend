export type RolMigracionInforme = "analista" | "traductor";

export type EstadoMigracionInforme =
  | "borrador"
  | "en-proceso"
  | "pendiente-aprobacion"
  | "aprobado"
  | "rechazado";

export interface ParametrosListaMigracionesInforme {
  busqueda?: string;
  idEstado?: number;
  idPlantilla?: number;
  numPag?: number;
}

export interface PermisosMigracionInforme {
  puedeVer: boolean;
  puedeEditar: boolean;
  puedeEnviar: boolean;
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
  permisos: PermisosMigracionInforme;
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
  puedeCrear: boolean;
  puedeCrearLote: boolean;
}

export interface ConfiguracionAltaMigracionInforme {
  idPlantilla: number;
  idIdiomaOrigen: number;
  idIdiomaDestino?: number;
  idFormatoFecha: number;
}

export type EstadoLoteMigracion =
  | "encolado"
  | "extrayendo"
  | "listo-para-ia"
  | "procesando-ia"
  | "completado"
  | "fallido"
  | "parcial";

export interface ArchivoLoteMigracionSolicitud {
  nombre: string;
  tipoArchivo: string;
  tamano: number;
}

export interface CrearLoteMigracionSolicitud extends ConfiguracionAltaMigracionInforme {
  nombre: string;
  rol: RolMigracionInforme;
  archivos: ArchivoLoteMigracionSolicitud[];
}

export interface ArchivoCargaLoteMigracion {
  nombre: string;
  urlCarga: string;
}

export interface CrearLoteMigracionRespuesta {
  idLote: string;
  archivos: ArchivoCargaLoteMigracion[];
}

export interface RegistroLoteMigracion {
  idLote: string;
  nombre: string;
  estado: EstadoLoteMigracion;
  estadoDescripcion: string;
  total: number;
  completados: number;
  fallidos: number;
  fechaCreacion: string;
  puedeReintentar: boolean;
}

export interface RespuestaListaLotesMigracion {
  lotes: RegistroLoteMigracion[];
}

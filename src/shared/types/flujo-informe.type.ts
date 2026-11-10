export type EtapaFlujoPedido =
  | "sin-asignar"
  | "en-analisis"
  | "listo-traduccion"
  | "en-traduccion"
  | "por-revisar"
  | "finalizado";

export type TabFlujoAsignacion = EtapaFlujoPedido | "complementos";

export type PrioridadPedido = "super-flash" | "express" | "normal";

export type RolFlujoAsignacion = "analista" | "traductor";

export interface FilaFlujoAsignacion {
  idPedido: number;
  cliente: string;
  investigado: string;
  pais: string;
  idIdioma: number;
  idiomaInforme: string;
  requiereTraduccion: boolean;
  prioridad: PrioridadPedido;
  fechaPedido: string;
  fechaVencimiento: string;
  etapa: EtapaFlujoPedido;
  idUsuarioAnalista: number | null;
  analista: string | null;
  idUsuarioTraductor: number | null;
  traductor: string | null;
  idInformeAnalista: number | null;
  idInformeTraductor: number | null;
  fechaFinAnalisis: string | null;
  rechazado: boolean;
  fechaFinalizacion: string | null;
}

export interface FiltroFlujoAsignacion {
  etapa: EtapaFlujoPedido;
  busqueda?: string;
  numPag: number;
}

export type ConteoTabsFlujoAsignacion = Record<TabFlujoAsignacion, number>;

export interface ListaFlujoAsignacion {
  lstPedido: FilaFlujoAsignacion[];
  totalRegistros: number;
  totalPaginas: number;
  conteos: ConteoTabsFlujoAsignacion;
}

export interface CandidatoFlujoAsignacion {
  idUsuario: number;
  nombre: string;
  cantidadAsignaciones: number;
}

export interface AsignarRolFlujoRequest {
  idPedido: number;
  rol: RolFlujoAsignacion;
  idUsuarioAsignado: number;
}

export interface AsignarRolMasivoFlujoRequest {
  idsPedido: number[];
  rol: RolFlujoAsignacion;
  idUsuarioAsignado: number;
}

export interface PedidoNoAsignadoFlujo {
  idPedido: number;
  mensaje: string;
}

export interface ResultadoAsignacionMasivaFlujo {
  totalAsignados: number;
  lstNoAsignado: PedidoNoAsignadoFlujo[];
}

export type TipoInformeRepositorio = "informe" | "complemento";

export type EstadoComplemento = "borrador" | "en-proceso" | "pendiente-aprobacion" | "aprobado" | "rechazado";

export interface InformeRepositorio {
  idInforme: number;
  idCompania: number;
  tipo: TipoInformeRepositorio;
  investigado: string;
  pais: string;
  cliente: string;
  idioma: string;
  traductor: string;
  fechaAprobacion: string;
  idInformeBase: number | null;
  esUltimaVersion: boolean;
}

export interface FiltroRepositorioInformes {
  busqueda?: string;
  tipo?: TipoInformeRepositorio;
  numPag: number;
}

export interface ListaRepositorioInformes {
  lstInforme: InformeRepositorio[];
  totalRegistros: number;
  totalPaginas: number;
}

export interface Complemento {
  idComplemento: number;
  idCompania: number;
  investigado: string;
  pais: string;
  idInformeBase: number;
  tipoInformeBase: TipoInformeRepositorio;
  clienteBase: string;
  idClienteDestino: number;
  clienteDestino: string;
  idioma: string;
  idUsuarioTraductor: number;
  traductor: string;
  estado: EstadoComplemento;
  fechaCreacion: string;
  fechaModificacion: string;
  idInforme: number | null;
  codigo: string | null;
  idPlantilla: number | null;
}

export interface FiltroComplementos {
  busqueda?: string;
  soloPropios: boolean;
  numPag: number;
}

export interface ListaComplementos {
  lstComplemento: Complemento[];
  totalRegistros: number;
  totalPaginas: number;
}

export interface CrearComplementoRequest {
  idCompania: number;
  idClienteDestino: number;
  idIdioma: number;
  observacion?: string;
}

export interface OpcionClienteDestino {
  idCliente: number;
  nombre: string;
}

export interface ListaClientesDestino {
  lstCliente: OpcionClienteDestino[];
}

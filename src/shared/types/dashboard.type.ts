export interface ResumenClientesDashboard {
  totalClientes: number;
  totalActivos: number;
  totalInactivos: number;
  porcentajeActivos: number;
  porcentajeCrecimiento: number;
  fechaActualizacion: string;
}

export interface ResumenEstadoPedidoDashboard {
  idEstado: number;
  descripcionEstado: string;
  colorLetra: string;
  colorFondo: string;
  cantidad: number;
}

export interface ParametrosResumenUsuariosDashboard {
  busqueda?: string;
  idRolAsignado?: number;
  fchDesde?: string;
  fchHasta?: string;
  idEficiencia?: string;
  numPag: number;
}

export interface ResumenUsuarioDashboard {
  idUsuario: number;
  nombreCompleto: string;
  iniciales: string;
  descripcionRol: string;
  ordenes: number;
  aTiempo: number;
  cumplimiento: number;
  idEficiencia: number;
  descripcionEficiencia: string;
  colorLetra: string;
  colorFondo: string;
}

export interface RespuestaResumenUsuariosDashboard {
  lstUsuarios: ResumenUsuarioDashboard[];
  totalRegistros: number;
  totalPaginas: number;
  porcentajeEntregados: number;
  porcentajeAtrasados: number;
}

export interface PropsCargadorTarjetaDashboard {
  titulo: string;
  variante: "resumen" | "grafica" | "tabla";
}

export interface PropsTarjetaDashboard {
  estaCargando?: boolean;
}

export type GranularidadTiempoDashboard = "dia" | "semana" | "mes" | "ano";

export type MetricaDesgloseFacturacionAnaliticaDashboard = "monto" | "pedidos";

export interface FiltrosFacturacionAnaliticaDashboard {
  fechaDesde?: Date;
  fechaHasta?: Date;
  idCliente?: number;
  idPais?: number;
  idTipoTramite?: number;
  idEstadoBucket?: number;
  idTipoDocumentoMaestro?: number;
}

export interface ParametrosResumenAnaliticoFacturacionDashboard {
  fechaDesde?: string;
  fechaHasta?: string;
  idCliente?: number;
  idPais?: number;
  idTipoTramite?: number;
  idEstadoBucket?: number;
  idTipoDocumentoMaestro?: number;
}

export interface ParametrosEvolucionAnaliticaFacturacionDashboard {
  fechaDesde?: string;
  fechaHasta?: string;
  idCliente?: number;
  idPais?: number;
  idTipoTramite?: number;
  granularidad: number;
}

export interface IndicadoresFacturacionAnaliticaDashboard {
  totalFacturado: number;
  montoPendienteFacturar: number;
  cantidadPedidosFacturados: number;
  cantidadPedidosPendientes: number;
  totalNotasCredito: number;
  totalNotasDebito: number;
  monedaIcono: string;
}

export interface GrupoFacturacionAnaliticaDashboard {
  id: number;
  etiqueta: string;
  cantidadPedidos: number;
  montoFacturado: number;
}

export interface GrupoEstadoFacturacionAnaliticaDashboard {
  idEstadoMaestro: number;
  estado: string;
  cantidadFacturas: number;
  montoFacturado: number;
}

export interface ResumenAnaliticoFacturacionDashboard {
  indicadores: IndicadoresFacturacionAnaliticaDashboard;
  desglosePorTramite: GrupoFacturacionAnaliticaDashboard[];
  desglosePorPais: GrupoFacturacionAnaliticaDashboard[];
  desglosePorEstado: GrupoEstadoFacturacionAnaliticaDashboard[];
}

export interface EvolucionFacturacionAnaliticaDashboard {
  periodo: string;
  etiqueta: string;
  montoFacturado: number;
  cantidadPedidos: number;
}

export interface ResumenClienteFacturacionAnaliticaDashboard {
  idCliente: number;
  cliente: string;
  totalFacturado: number;
  cantidadPedidosFacturados: number;
  montoPendienteFacturar: number;
  monedaIcono: string;
}

export type RolColaboradorDesempenoDashboard = "Analista" | "Traductor";

export interface ColaboradorDesempenoDashboard {
  idColaborador: number;
  colaborador: string;
  rol: RolColaboradorDesempenoDashboard;
  iniciales: string;
  colorLetra: string;
  colorFondo: string;
}

export interface InformeColaboradorDesempenoDashboard {
  id: number;
  idColaborador: number;
  fechaEntrega: string;
  esTardio: boolean;
  tieneObservaciones: boolean;
  tieneInformacionFinanciera: boolean;
}

export interface FiltrosDesempenoColaboradoresDashboard {
  fechaDesde?: Date;
  fechaHasta?: Date;
  idColaborador?: number;
  idRol?: number;
}

export interface EvolucionInformesColaboradoresDashboard {
  periodo: string;
  etiqueta: string;
  cantidadInformes: number;
}

export interface ResumenColaboradorDesempenoDashboard {
  idColaborador: number;
  colaborador: string;
  rol: RolColaboradorDesempenoDashboard;
  iniciales: string;
  colorLetra: string;
  colorFondo: string;
  cantidadOrdenes: number;
  porcentajeCumplimiento: number;
  cantidadInformes: number;
  cantidadTardios: number;
  cantidadObservados: number;
  cantidadConInformacionFinanciera: number;
}

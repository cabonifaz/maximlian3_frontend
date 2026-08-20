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

export type EstadoFacturaAnaliticaDashboard =
  | "borrador"
  | "aprobada"
  | "rechazada"
  | "aceptada"
  | "anulada"
  | "dada-de-baja";

export type TramiteFacturacionAnaliticaDashboard =
  | "normal"
  | "expres"
  | "super-flash";

export type TipoComprobanteFacturacionAnaliticaDashboard =
  | "Factura"
  | "Boleta"
  | "Nota de Crédito"
  | "Nota de Débito";

export interface DetalleFacturacionAnaliticaDashboard {
  id: number;
  idCliente: number;
  cliente: string;
  fechaEmision: string;
  pais: string;
  tramite: TramiteFacturacionAnaliticaDashboard;
  tipoComprobante: TipoComprobanteFacturacionAnaliticaDashboard;
  estado: EstadoFacturaAnaliticaDashboard;
  cantidadPedidos: number;
  montoFacturado: number;
  monedaIcono: string;
}

export interface ClientePendienteFacturacionAnaliticaDashboard {
  idCliente: number;
  cliente: string;
  montoPendienteFacturar: number;
  cantidadPedidosPendientes: number;
  monedaIcono: string;
}

export interface FiltrosFacturacionAnaliticaDashboard {
  fechaDesde?: Date;
  fechaHasta?: Date;
  idCliente?: number;
  estado?: EstadoFacturaAnaliticaDashboard;
  pais?: string;
  tramite?: TramiteFacturacionAnaliticaDashboard;
  tipoComprobante?: TipoComprobanteFacturacionAnaliticaDashboard;
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
  clave: string;
  etiqueta: string;
  cantidadPedidos: number;
  montoFacturado: number;
}

export interface GrupoEstadoFacturacionAnaliticaDashboard {
  estado: EstadoFacturaAnaliticaDashboard;
  cantidadFacturas: number;
  montoFacturado: number;
}

export interface EvolucionMensualFacturacionAnaliticaDashboard {
  mes: string;
  etiqueta: string;
  montoFacturado: number;
}

export interface ResumenClienteFacturacionAnaliticaDashboard {
  idCliente: number;
  cliente: string;
  totalFacturado: number;
  cantidadPedidos: number;
  montoPendienteFacturar: number;
  monedaIcono: string;
}

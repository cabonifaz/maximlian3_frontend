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
  idRolAsignado: number;
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
}

export interface PropsCargadorTarjetaDashboard {
  titulo: string;
  variante: "resumen" | "grafica" | "tabla";
}

export interface PropsTarjetaDashboard {
  estaCargando?: boolean;
}

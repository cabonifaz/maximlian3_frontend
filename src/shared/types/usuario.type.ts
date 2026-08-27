export type CreateUserRequest = {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  usuarioCreacion: string;
  correo: string;
  roles: number[];
  idiomas: number[];
};

export type CreateUserResponse = {
  idUsuario: number;
};

export type UserDetails = {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  correo: string;
  roles: number[];
  idiomas: number[];
  idEstado?: number;
  estado?: string;
};

export type UpdateUserRequest = {
  idUsuario: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  correo: string;
  roles: number[];
  idiomas: number[];
  idEstado: number;
};

export type DeleteUserRequest = {
  idUsuarioEliminar: number;
};

export type UserListRequest = {
  numPag: number;
  filtro?: string;
  idEstado?: number | null;
};

export type UserListEntry = {
  idUsuario: number;
  idEmpresa: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  correo: string;
  usuario: string;
  roles: string;
  estado: string;
};

export type UserListResponse = {
  lstUsuarios: UserListEntry[];
  totalRegistros: number;
  totalPaginas: number;
};

export type ParametrosListaCortaDashboardUsuario = {
  idsRolFiltro?: number[];
};

export type EntradaUsuarioCortaDashboardApi = {
  idUsuario: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
};

export type UsuarioCortaDashboard = {
  idUsuario: number;
  nombreCompleto: string;
};

export type ParametrosResumenColaboradores = {
  fchDesde?: string;
  fchHasta?: string;
  idColaborador?: number;
  idRolAsignado?: number;
  numPag: number;
};

export type EntradaResumenColaboradorApi = {
  idColaborador: number;
  nombreCompleto: string;
  iniciales: string;
  idRol: number;
  descripcionRol: string;
  cantidadOrdenes: number;
  cantidadInformes: number;
  cantidadTardios: number;
  cantidadObservados: number;
  cantidadConInformacionFinanciera: number;
  porcentajeCumplimiento: number;
};

export type ResultadoResumenColaboradoresApi = {
  lstUsuarios: EntradaResumenColaboradorApi[];
  totalRegistros: number;
  totalPaginas: number;
};

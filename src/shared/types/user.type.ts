export type CreateUserRequest = {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  usernameCreacion: string;
  email: string;
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
  email: string;
  roles: number[];
  idiomas: number[];
};

export type UpdateUserRequest = {
  idUsuario: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  roles: number[];
  idiomas: number[];
};

export type DeleteUserRequest = {
  idUsuarioEliminar: number;
};

export type UserListRequest = {
  numPag: number;
  filtro?: string;
};

export type UserListEntry = {
  idUsuario: number;
  idEmpresa: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  email: string;
  usuario: string;
  roles: string;
  estado: string;
};

export type UserListResponse = {
  lstUsuarios: UserListEntry[];
  totalRegistros: number;
  totalPaginas: number;
};

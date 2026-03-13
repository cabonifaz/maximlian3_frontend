export type CreateUserRequest = {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  roles: number[];
  idiomas: number[];
};

export type CreateUserResponse = {
  idUsuario: number;
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
  apellidoMaterno: string;
  email: string;
  username: string;
  roles: string;
  estado: string;
};

export type UserListResponse = {
  lstUsuarios: UserListEntry[];
  totalRegistros: number;
  totalPaginas: number;
};

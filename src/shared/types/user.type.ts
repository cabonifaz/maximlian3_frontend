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

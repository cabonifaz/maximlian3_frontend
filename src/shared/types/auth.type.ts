export type Role = {
  idRol: number;
  rol: string;
  descripcion: string;
};

export type UserSession = {
  idUsuario: number;
  idEmpresa: number;
  nombres: string;
  email: string;
  usuario: string;
  roles: Role[];
};

export type LoginValidatorResponse = UserSession[];

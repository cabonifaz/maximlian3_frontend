import maximilianService from "./maximilianService";
import type { ApiResponse } from "@maximilian/shared/types/api.type";
import { MessageType } from "@maximilian/shared/types/api.type";
import type {
  CreateUserRequest,
  CreateUserResponse,
  DeleteUserRequest,
  UpdateUserRequest,
  UserDetails,
  UserListRequest,
  UserListResponse,
} from "@maximilian/shared/types/user.type";

type RegistroGenerico = Record<string, unknown>;

function esRegistro(valor: unknown): valor is RegistroGenerico {
  return typeof valor === "object" && valor !== null;
}

function obtenerTexto(...valores: unknown[]): string {
  for (const valor of valores) {
    if (typeof valor === "string") {
      const texto = valor.trim();
      if (texto) return texto;
    }
  }

  return "";
}

function obtenerNumero(valor: unknown): number | undefined {
  if (typeof valor === "number" && Number.isFinite(valor)) return valor;
  if (typeof valor === "string" && valor.trim() !== "") {
    const numero = Number(valor);
    if (Number.isFinite(numero)) return numero;
  }

  return undefined;
}

function obtenerListaNumerica(valor: unknown, llaves: string[]): number[] {
  if (Array.isArray(valor)) {
    return valor
      .map((item) => {
        if (esRegistro(item)) {
          for (const llave of llaves) {
            const numero = obtenerNumero(item[llave]);
            if (numero !== undefined) return numero;
          }
        }

        return obtenerNumero(item);
      })
      .filter((numero): numero is number => numero !== undefined);
  }

  if (typeof valor === "string") {
    return valor
      .split(",")
      .map((item) => obtenerNumero(item))
      .filter((numero): numero is number => numero !== undefined);
  }

  return [];
}

function normalizarDetallesUsuario(registro: unknown): UserDetails {
  const fila = esRegistro(registro) ? registro : {};

  const roles = obtenerListaNumerica(
    fila.roles ?? fila.Roles ?? fila.lstRoles ?? fila.LstRoles,
    ["idRol", "IdRol", "idRole", "num1", "Num1"],
  );
  const idiomas = obtenerListaNumerica(
    fila.idiomas ?? fila.Idiomas ?? fila.lstIdiomas ?? fila.LstIdiomas ?? fila.languages ?? fila.Languages,
    ["idIdioma", "IdIdioma", "idLanguage", "num1", "Num1"],
  );

  return {
    nombres: obtenerTexto(fila.nombres, fila.Nombres),
    apellidoPaterno: obtenerTexto(fila.apellidoPaterno, fila.ApellidoPaterno),
    apellidoMaterno: obtenerTexto(fila.apellidoMaterno, fila.ApellidoMaterno) || null,
    correo: obtenerTexto(fila.correo, fila.Correo),
    roles,
    idiomas,
    idEstado: obtenerNumero(fila.idEstado ?? fila.IdEstado),
    estado: obtenerTexto(fila.estado, fila.Estado),
  };
}

export const userService = {
  /**
   * List users in the system.
   * @param params Pagination and filtering parameters.
   */
  list: async (params: UserListRequest) => {
    try {
      const { data } = await maximilianService.get<ApiResponse<UserListResponse>>(
        "/api/Usuario/listar",
        {
          params: {
            numPag: params.numPag,
            Filtro: params.filtro || "",
          },
        }
      );

      if (data.idTipoMensaje !== MessageType.SUCCESS) {
        throw new Error(data.mensaje || "Error al listar usuarios");
      }

      return data.result;
    } catch (error) {
      console.error("Error listing users:", error);
      throw error;
    }
  },

  /**
   * Get user details by ID.
   * @param idUsuario The ID of the user to fetch.
   */
  getById: async (idUsuario: number) => {
    try {
      // In many of our project endpoints, 'result' is an array even for single objects
      const { data } = await maximilianService.get<ApiResponse<UserDetails | UserDetails[]>>(
        "/api/Usuario/obtener",
        {
          params: { IdUsuario: idUsuario },
        }
      );

      if (data.idTipoMensaje !== MessageType.SUCCESS) {
        throw new Error(data.mensaje || "Error al obtener detalles del usuario");
      }

      // Handle both object and array response patterns
      const resultado = Array.isArray(data.result) ? data.result[0] : data.result;
      return normalizarDetallesUsuario(resultado);
    } catch (error) {
      console.error(`Error fetching user ${idUsuario}:`, error);
      throw error;
    }
  },

  /**
   * Create a new user in the system.
   * @param userData Data for the new user.
   */
  create: async (userData: CreateUserRequest) => {
    try {
      const { data } = await maximilianService.post<ApiResponse<CreateUserResponse>>(
        "/api/Usuario/crear",
        userData
      );

      if (data.idTipoMensaje !== MessageType.SUCCESS) {
        throw new Error(data.mensaje || "Error al crear el usuario");
      }

      return data.result;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  /**
   * Update an existing user in the system.
   * @param updateData Data for the user update.
   */
  update: async (updateData: UpdateUserRequest) => {
    try {
      const { data } = await maximilianService.post<ApiResponse<unknown>>(
        "/api/Usuario/editar",
        updateData
      );

      if (data.idTipoMensaje !== MessageType.SUCCESS) {
        throw new Error(data.mensaje || "Error al actualizar el usuario");
      }

      return data.result;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  /**
   * Delete an existing user in the system.
   * @param deleteData Data for the user deletion.
   */
  delete: async (deleteData: DeleteUserRequest) => {
    try {
      const { data } = await maximilianService.post<ApiResponse<unknown>>(
        "/api/Usuario/eliminar",
        deleteData
      );

      if (data.idTipoMensaje !== MessageType.SUCCESS) {
        throw new Error(data.mensaje || "Error al eliminar el usuario");
      }

      return data.result;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
};

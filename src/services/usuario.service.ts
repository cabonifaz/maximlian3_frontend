import { ENDPOINTS_USUARIO } from "@maximilian/shared/constants/endpoints/usuario.endpoint";
import maximilianService from "./maximilian-service";
import { ErrorRespuestaApi, type ApiResponse } from "@maximilian/shared/types/api.type";
import { MessageType } from "@maximilian/shared/types/api.type";
import type {
  CreateUserRequest,
  CreateUserResponse,
  DeleteUserRequest,
  UpdateUserRequest,
  UserDetails,
  UserListRequest,
  UserListResponse,
} from "@maximilian/shared/types/usuario.type";
import {
  esRegistroRespuesta as esRegistro,
  obtenerNumeroOpcional as obtenerNumero,
  obtenerTexto,
} from "@maximilian/shared/utils/normalizacion-respuesta.util";

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
    fila.idiomas ?? fila.Idiomas ?? fila.lstIdiomas ?? fila.LstIdiomas ?? fila.idiomas ?? fila.Languages,
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

export const servicioUsuario = {
  /**
   * List users in the system.
   * @param params Pagination and filtering parameters.
   */
  list: async (params: UserListRequest) => {
    try {
      const parametros = new URLSearchParams({
        numPag: String(params.numPag),
      });

      if (params.idEstado != null) {
        parametros.set("idEstado", String(params.idEstado));
      }

      if (params.filtro?.trim()) {
        parametros.set("filtro", params.filtro.trim());
      }

      const { data } = await maximilianService.get<ApiResponse<UserListResponse>>(
        `${ENDPOINTS_USUARIO.listar}?${parametros.toString()}`
      );

      if (data.idTipoMensaje !== MessageType.SUCCESS) {
        throw new ErrorRespuestaApi(data);
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
        ENDPOINTS_USUARIO.obtener,
        {
          params: { IdUsuario: idUsuario },
        }
      );

      if (data.idTipoMensaje !== MessageType.SUCCESS) {
        throw new ErrorRespuestaApi(data);
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
        ENDPOINTS_USUARIO.crear,
        userData
      );

      if (data.idTipoMensaje !== MessageType.SUCCESS) {
        throw new ErrorRespuestaApi(data);
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
        ENDPOINTS_USUARIO.editar,
        updateData
      );

      if (data.idTipoMensaje !== MessageType.SUCCESS) {
        throw new ErrorRespuestaApi(data);
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
        ENDPOINTS_USUARIO.eliminar,
        deleteData
      );

      if (data.idTipoMensaje !== MessageType.SUCCESS) {
        throw new ErrorRespuestaApi(data);
      }

      return data.result;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
};

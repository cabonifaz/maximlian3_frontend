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
      return Array.isArray(data.result) ? data.result[0] : data.result;
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

import maximilianService from "./maximilianService";
import type { ApiResponse } from "@maximilian/shared/types/api.type";
import { MessageType } from "@maximilian/shared/types/api.type";
import type {
  CreateUserRequest,
  CreateUserResponse,
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
};

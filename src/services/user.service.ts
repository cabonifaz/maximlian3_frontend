import maximilianService from "./maximilianService";
import type { ApiResponse } from "@maximilian/shared/types/api.type";
import { MessageType } from "@maximilian/shared/types/api.type";
import type { CreateUserRequest, CreateUserResponse } from "@maximilian/shared/types/user.type";

export const userService = {
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

import maximilianService from "./maximilianService";
import type { ApiResponse } from "@maximilian/shared/types/api.type";
import { MessageType } from "@maximilian/shared/types/api.type";
import type { CreateClientRequest, CreateClientResponse } from "@maximilian/shared/types/client.type";

export const clientService = {
  /**
   * Create a new client in the system.
   * @param clientData Data for the new client.
   */
  create: async (clientData: CreateClientRequest) => {
    try {
      const { data } = await maximilianService.post<ApiResponse<CreateClientResponse>>(
        "/api/Cliente/crear",
        clientData
      );

      if (data.idTipoMensaje !== MessageType.SUCCESS) {
        throw new Error(data.mensaje || "Error al crear el cliente");
      }

      return data.result;
    } catch (error) {
      console.error("Error creating client:", error);
      throw error;
    }
  },
};

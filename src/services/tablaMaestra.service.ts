import maximilianService from "./maximilianService";
import type { ApiResponse } from "@maximilian/shared/types/api.type";
import { MessageType } from "@maximilian/shared/types/api.type";
import type { MasterTableResponse } from "@maximilian/shared/types/tabla-maestra.type";

export const servicioTablaMaestra = {
  /**
   * List MasterTable parameters by idMaster
   * @param idMaster The master ID to filter by
   */
  list: async (idMaestro: number) => {
    try {
      const { data } = await maximilianService.get<ApiResponse<MasterTableResponse>>(
        "/api/TablaMaestra/listar",
        {
          params: { IdMaestro: idMaestro },
        }
      );

      if (data.idTipoMensaje !== MessageType.SUCCESS) {
        throw new Error(data.mensaje || "Error al listar parámetros de MasterTable");
      }

      return data.result;
    } catch (error) {
      console.error(`Error fetching MasterTable parameters for ID ${idMaestro}:`, error);
      throw error;
    }
  },
};

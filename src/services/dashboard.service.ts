import { ENDPOINTS_DASHBOARD } from "@maximilian/shared/constants/endpoints/dashboard.endpoint";
import {
  ErrorRespuestaApi,
  MessageType,
  type ApiResponse,
} from "@maximilian/shared/types/api.type";
import type { ResumenClientesDashboard } from "@maximilian/shared/types/dashboard.type";
import maximilianService from "./maximilian-service";

export const servicioDashboard = {
  obtenerResumenClientes: async (
    senal?: AbortSignal,
  ): Promise<ResumenClientesDashboard> => {
    const { data } = await maximilianService.get<
      ApiResponse<ResumenClientesDashboard>
    >(ENDPOINTS_DASHBOARD.resumenClientes, { signal: senal });

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }

    return data.result;
  },
};

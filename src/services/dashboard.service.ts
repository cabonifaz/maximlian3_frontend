import { ENDPOINTS_DASHBOARD } from "@maximilian/shared/constants/endpoints/dashboard.endpoint";
import {
  ErrorRespuestaApi,
  MessageType,
  type ApiResponse,
} from "@maximilian/shared/types/api.type";
import type {
  ParametrosResumenUsuariosDashboard,
  ResumenClientesDashboard,
  ResumenEstadoPedidoDashboard,
  RespuestaResumenUsuariosDashboard,
} from "@maximilian/shared/types/dashboard.type";
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

  obtenerResumenPedidos: async (
    senal?: AbortSignal,
  ): Promise<ResumenEstadoPedidoDashboard[]> => {
    const { data } = await maximilianService.get<
      ApiResponse<ResumenEstadoPedidoDashboard[]>
    >(ENDPOINTS_DASHBOARD.resumenPedidos, { signal: senal });

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }

    return data.result;
  },

  obtenerResumenUsuarios: async (
    parametros: ParametrosResumenUsuariosDashboard,
    senal?: AbortSignal,
  ): Promise<RespuestaResumenUsuariosDashboard> => {
    const { data } = await maximilianService.get<
      ApiResponse<RespuestaResumenUsuariosDashboard>
    >(ENDPOINTS_DASHBOARD.resumenUsuarios, {
      params: parametros,
      signal: senal,
    });

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }

    return data.result;
  },
};

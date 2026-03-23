import maximilianService from "./maximilianService";
import type { ApiResponse } from "@maximilian/shared/types/api.type";
import { MessageType } from "@maximilian/shared/types/api.type";
import type {
  PedidoListParams,
  PedidoListResponse,
  PedidoCancelRequest,
  CreatePedidoRequest,
  CreatePedidoResponse,
} from "@maximilian/shared/types/pedido.type";

export const pedidoService = {
  list: async (params: PedidoListParams): Promise<PedidoListResponse> => {
    try {
      const { data } = await maximilianService.get<ApiResponse<PedidoListResponse>>(
        "/api/Pedido/listar",
        { params }
      );

      if (data.idTipoMensaje !== MessageType.SUCCESS) {
        throw new Error(data.mensaje || "Error al listar los pedidos");
      }

      return data.result;
    } catch (error) {
      console.error("Error listing pedidos:", error);
      throw error;
    }
  },

  cancel: async (data: PedidoCancelRequest): Promise<void> => {
    const { data: res } = await maximilianService.post<ApiResponse<null>>("/api/Pedido/eliminar", data);
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new Error(res.mensaje);
  },

  create: async (data: CreatePedidoRequest): Promise<CreatePedidoResponse> => {
    const { data: res } = await maximilianService.post<ApiResponse<CreatePedidoResponse[]>>(
      "/api/Pedido/crear",
      data
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new Error(res.mensaje);
    return res.result[0];
  },
};

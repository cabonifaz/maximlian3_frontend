import maximilianService from "./maximilianService";
import type { ApiResponse } from "@maximilian/shared/types/api.type";
import { MessageType } from "@maximilian/shared/types/api.type";
import type {
  PedidoListParams,
  PedidoListResponse,
  PedidoCancelRequest,
  CreatePedidoRequest,
  CreatePedidoResponse,
  GetPedidoResponse,
  UpdatePedidoRequest,
  PedidoArchivoListResponse,
  AddPedidoArchivosRequest,
  DeletePedidoArchivoRequest,
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

  getById: async (idPedido: number): Promise<GetPedidoResponse> => {
    const { data } = await maximilianService.get<ApiResponse<GetPedidoResponse[]>>(
      "/api/Pedido/obtener",
      { params: { idPedido } }
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) throw new Error(data.mensaje);
    return data.result[0];
  },

  update: async (data: UpdatePedidoRequest): Promise<void> => {
    const { data: res } = await maximilianService.post<ApiResponse<null>>(
      "/api/Pedido/editar",
      data
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new Error(res.mensaje);
  },

  listArchivos: async (params: { idPedido: number; busqueda?: string; numPag?: number }): Promise<PedidoArchivoListResponse> => {
    const { data } = await maximilianService.get<ApiResponse<PedidoArchivoListResponse>>(
      "/api/PedidoArchivo/listar",
      { params: { IdPedido: params.idPedido, Busqueda: params.busqueda, NumPag: params.numPag } }
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) throw new Error(data.mensaje);
    return data.result;
  },

  addArchivos: async (data: AddPedidoArchivosRequest): Promise<CreatePedidoResponse["archivos"]> => {
    const { data: res } = await maximilianService.post<ApiResponse<CreatePedidoResponse["archivos"]>>(
      "/api/PedidoArchivo/crear",
      data
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new Error(res.mensaje);
    return res.result;
  },

  deleteArchivo: async (data: DeletePedidoArchivoRequest): Promise<void> => {
    const { data: res } = await maximilianService.post<ApiResponse<null>>(
      "/api/PedidoArchivo/eliminar",
      data
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new Error(res.mensaje);
  },
};

import maximilianService from "./maximilianService";
import type { ApiResponse } from "@maximilian/shared/types/api.type";
import { MessageType } from "@maximilian/shared/types/api.type";
import type {
  CreateClientRequest,
  CreateClientResponse,
  ClientDetail,
  ClientListRequest,
  ClientListResponse,
  DeleteClientRequest,
  UpdateClientRequest,
  TarifarioListResponse,
  ContactoListResponse,
  CreateTarifarioRequest,
  UpdateTarifarioRequest,
  DeleteTarifarioRequest,
  CreateContactoRequest,
  UpdateContactoRequest,
  DeleteContactoRequest,
} from "@maximilian/shared/types/client.type";

export const clientService = {
  /**
   * List clients with pagination and filters.
   * @param params Pagination and filter parameters.
   */
  list: async (params: ClientListRequest): Promise<ClientListResponse> => {
    try {
      const { data } = await maximilianService.get<ApiResponse<ClientListResponse>>(
        "/api/Cliente/listar",
        { params }
      );

      if (data.idTipoMensaje !== MessageType.SUCCESS) {
        throw new Error(data.mensaje || "Error al listar los clientes");
      }

      return data.result;
    } catch (error) {
      console.error("Error listing clients:", error);
      throw error;
    }
  },

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

  /**
   * Get client details by ID.
   * @param idCliente The ID of the client to fetch.
   */
  getById: async (idCliente: number): Promise<ClientDetail> => {
    const { data } = await maximilianService.get<ApiResponse<ClientDetail[]>>(
      "/api/Cliente/obtener",
      { params: { idCliente } }
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new Error(data.mensaje || "Error al obtener el cliente");
    }
    return data.result[0];
  },

  eliminate: async (data: DeleteClientRequest) => {
    try {
      const { data: responseData } = await maximilianService.post<ApiResponse<{ idCliente: number }[]>>(
        "/api/Cliente/eliminar",
        data
      );

      if (responseData.idTipoMensaje !== MessageType.SUCCESS) {
        throw new Error(responseData.mensaje || "Error al desactivar el cliente");
      }

      return responseData.result;
    } catch (error) {
      console.error("Error eliminating client:", error);
      throw error;
    }
  },

  listTarifario: async (params: {
    idCliente: number;
    busqueda?: string;
    numPag: number;
  }): Promise<TarifarioListResponse> => {
    const { data } = await maximilianService.get<ApiResponse<TarifarioListResponse>>(
      "/api/Tarifario/listar",
      { params }
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new Error(data.mensaje || "Error al listar el tarifario");
    }
    return data.result;
  },

  listContactos: async (params: {
    idCliente: number;
    numPag?: number;
  }): Promise<ContactoListResponse> => {
    const { data } = await maximilianService.get<ApiResponse<ContactoListResponse>>(
      "/api/ClienteContacto/listar",
      { params: { IdCliente: params.idCliente, NumPag: params.numPag } }
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new Error(data.mensaje || "Error al listar los contactos");
    }
    return data.result;
  },

  /**
   * Update an existing client.
   * @param clientData Data to update.
   */
  update: async (clientData: UpdateClientRequest) => {
    const { data } = await maximilianService.post<ApiResponse<CreateClientResponse[]>>(
      "/api/Cliente/editar",
      clientData
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new Error(data.mensaje || "Error al actualizar el cliente");
    }
    return data.result[0];
  },

  createTarifario: async (data: CreateTarifarioRequest): Promise<{ idTarifario: number }> => {
    const { data: res } = await maximilianService.post<ApiResponse<{ idTarifario: number }[]>>(
      "/api/Tarifario/crear", data
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new Error(res.mensaje || "Error al crear tarifa");
    return res.result[0];
  },

  updateTarifario: async (data: UpdateTarifarioRequest): Promise<{ idTarifario: number }> => {
    const { data: res } = await maximilianService.post<ApiResponse<{ idTarifario: number }[]>>(
      "/api/Tarifario/editar", data
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new Error(res.mensaje || "Error al editar tarifa");
    return res.result[0];
  },

  deleteTarifario: async (data: DeleteTarifarioRequest): Promise<{ idTarifario: number }> => {
    const { data: res } = await maximilianService.post<ApiResponse<{ idTarifario: number }[]>>(
      "/api/Tarifario/eliminar", data
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new Error(res.mensaje || "Error al eliminar tarifa");
    return res.result[0];
  },

  createContacto: async (data: CreateContactoRequest): Promise<{ idClienteContacto: number }> => {
    const { data: res } = await maximilianService.post<ApiResponse<{ idClienteContacto: number }[]>>(
      "/api/ClienteContacto/crear", data
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new Error(res.mensaje || "Error al crear contacto");
    return res.result[0];
  },

  updateContacto: async (data: UpdateContactoRequest): Promise<{ idClienteContacto: number }> => {
    const { data: res } = await maximilianService.post<ApiResponse<{ idClienteContacto: number }[]>>(
      "/api/ClienteContacto/editar", data
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new Error(res.mensaje || "Error al editar contacto");
    return res.result[0];
  },

  deleteContacto: async (data: DeleteContactoRequest): Promise<{ idClienteContacto: number }> => {
    const { data: res } = await maximilianService.post<ApiResponse<{ idClienteContacto: number }[]>>(
      "/api/ClienteContacto/eliminar", data
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new Error(res.mensaje || "Error al eliminar contacto");
    return res.result[0];
  },
};

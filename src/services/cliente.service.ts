import { ENDPOINTS_CLIENTE } from "@maximilian/shared/constants/endpoints/cliente.endpoint";
import maximilianService from "./maximilian-service";
import { ErrorRespuestaApi, type ApiResponse } from "@maximilian/shared/types/api.type";
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
  TarifarioDetail,
  ContactoListResponse,
  ContactoDetail,
  CreateTarifarioRequest,
  UpdateTarifarioRequest,
  DeleteTarifarioRequest,
  GetTarifarioRequest,
  CreateContactoRequest,
  ClienteCorta,
  ClienteListaCortaResponse,
  TarifarioCortaEntry,
  TarifarioCortaResponse,
  UpdateContactoRequest,
  DeleteContactoRequest,
  GetContactoRequest,
} from "@maximilian/shared/types/cliente.type";

export const servicioCliente = {
  /**
   * List clients with pagination and filters.
   * @param params Pagination and filter parameters.
   */
  list: async (params: ClientListRequest): Promise<ClientListResponse> => {
    try {
      const { data } = await maximilianService.get<ApiResponse<ClientListResponse>>(
        ENDPOINTS_CLIENTE.listar,
        { params }
      );

      if (data.idTipoMensaje !== MessageType.SUCCESS) {
        throw new ErrorRespuestaApi(data);
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
        ENDPOINTS_CLIENTE.crear,
        clientData
      );

      if (data.idTipoMensaje !== MessageType.SUCCESS) {
        throw new ErrorRespuestaApi(data);
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
      ENDPOINTS_CLIENTE.obtener,
      { params: { idCliente } }
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }
    return data.result[0];
  },

  eliminate: async (data: DeleteClientRequest) => {
    try {
      const { data: responseData } = await maximilianService.post<ApiResponse<{ idCliente: number }[]>>(
        ENDPOINTS_CLIENTE.eliminar,
        data
      );

      if (responseData.idTipoMensaje !== MessageType.SUCCESS) {
        throw new ErrorRespuestaApi(responseData);
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
      ENDPOINTS_CLIENTE.listarTarifario,
      { params }
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }
    return data.result;
  },

  listContactos: async (params: {
    idCliente: number;
    busqueda?: string;
    numPag?: number;
  }): Promise<ContactoListResponse> => {
    const { data } = await maximilianService.get<ApiResponse<ContactoListResponse>>(
      ENDPOINTS_CLIENTE.listarContactos,
      { params: { IdCliente: params.idCliente, Busqueda: params.busqueda, NumPag: params.numPag } }
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }
    return data.result;
  },

  /**
   * Update an existing client.
   * @param clientData Data to update.
   */
  update: async (clientData: UpdateClientRequest) => {
    const { data } = await maximilianService.post<ApiResponse<CreateClientResponse[]>>(
      ENDPOINTS_CLIENTE.editar,
      clientData
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }
    return data.result[0];
  },

  createTarifario: async (data: CreateTarifarioRequest): Promise<{ idTarifario: number }> => {
    const { data: res } = await maximilianService.post<ApiResponse<{ idTarifario: number }[]>>(
      ENDPOINTS_CLIENTE.crearTarifario, data
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(res);
    return res.result[0];
  },

  updateTarifario: async (data: UpdateTarifarioRequest): Promise<{ idTarifario: number }> => {
    const { data: res } = await maximilianService.post<ApiResponse<{ idTarifario: number }[]>>(
      ENDPOINTS_CLIENTE.editarTarifario, data
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(res);
    return res.result[0];
  },

  deleteTarifario: async (data: DeleteTarifarioRequest): Promise<{ idTarifario: number }> => {
    const { data: res } = await maximilianService.post<ApiResponse<{ idTarifario: number }[]>>(
      ENDPOINTS_CLIENTE.eliminarTarifario, data
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(res);
    return res.result[0];
  },

  createContacto: async (data: CreateContactoRequest): Promise<{ idClienteContacto: number }> => {
    const { data: res } = await maximilianService.post<ApiResponse<{ idClienteContacto: number }[]>>(
      ENDPOINTS_CLIENTE.crearContacto, data
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(res);
    return res.result[0];
  },

  updateContacto: async (data: UpdateContactoRequest): Promise<{ idClienteContacto: number }> => {
    const { data: res } = await maximilianService.post<ApiResponse<{ idClienteContacto: number }[]>>(
      ENDPOINTS_CLIENTE.editarContacto, data
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(res);
    return res.result[0];
  },

  deleteContacto: async (data: DeleteContactoRequest): Promise<{ idClienteContacto: number }> => {
    const { data: res } = await maximilianService.post<ApiResponse<{ idClienteContacto: number }[]>>(
      ENDPOINTS_CLIENTE.eliminarContacto, data
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(res);
    return res.result[0];
  },

  getTarifarioById: async (data: GetTarifarioRequest): Promise<TarifarioDetail> => {
    const { data: res } = await maximilianService.get<ApiResponse<TarifarioDetail[]>>(
      ENDPOINTS_CLIENTE.obtenerTarifario, { params: data }
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(res);
    return res.result[0];
  },

  getContactoById: async (data: GetContactoRequest): Promise<ContactoDetail> => {
    const { data: res } = await maximilianService.get<ApiResponse<ContactoDetail[]>>(
      ENDPOINTS_CLIENTE.obtenerContacto, { params: data }
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(res);
    return res.result[0];
  },

  listTarifarioCorta: async (params: {
    idCliente: number;
    IdTipoProducto?: number;
    IdTipoTramite?: number;
    IdPais?: number;
  }): Promise<TarifarioCortaEntry[]> => {
    const { data } = await maximilianService.get<ApiResponse<TarifarioCortaResponse>>(
      ENDPOINTS_CLIENTE.listaCortaTarifario,
      { params: { idCliente: params.idCliente, IdTipoProducto: params.IdTipoProducto, IdTipoTramite: params.IdTipoTramite, IdPais: params.IdPais } }
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(data);
    return data.result.lstTarifario;
  },

  listaCorta: async (): Promise<ClienteCorta[]> => {
    const { data } = await maximilianService.get<ApiResponse<ClienteListaCortaResponse>>(
      ENDPOINTS_CLIENTE.listaCorta
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(data);
    return data.result.lstCliente;
  },
};

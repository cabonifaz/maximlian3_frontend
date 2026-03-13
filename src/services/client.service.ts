import maximilianService from "./maximilianService";
import type { ApiResponse } from "@maximilian/shared/types/api.type";
import { MessageType } from "@maximilian/shared/types/api.type";
import type {
  CreateClientRequest,
  CreateClientResponse,
  ClientDetail,
} from "@maximilian/shared/types/client.type";

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

  /**
   * Get client details by ID.
   * @param idCliente The ID of the client to fetch.
   */
  getById: async (idCliente: number): Promise<ClientDetail> => {
    try {
      // Mocking for now as the endpoint might not be ready or follows similar patterns
      // In a real scenario, this would be an API call:
      // const { data } = await maximilianService.get<ApiResponse<ClientDetail>>(`/api/Cliente/obtener`, { params: { IdCliente: idCliente } });
      // return data.result;

      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        idCliente,
        idTipoPersona: 1,
        nombre: "Juan Espinoza",
        nombreCorto: "Juan Espinoza",
        idPais: 1,
        idRegistroTributario: 1,
        numRegistroTributario: "Representante Legal Name",
        correo: "juan.espinoza@softwarefactorylatam.com",
        webSite: "https://softwarefactorylatam.com",
        telefono: "+51 987 654 321",
        direccion: "Av. Siempre Viva 123",
        idFormatoDocumento: 1,
        estado: "Activo",
        contactos: [
          {
            idContacto: 1,
            nombres: "Contacto Principal",
            idTipoContacto: 1,
            areaTrabajo: 1,
            telefono: "+51 999 888 777",
            email: "contacto@empresa.com",
          },
        ],
      };
    } catch (error) {
      console.error(`Error fetching client ${idCliente}:`, error);
      throw error;
    }
  },

  /**
   * Update an existing client.
   * @param clientData Data to update.
   */
  update: async (_clientData: any) => {
    try {
      // For now, mocking success as the endpoint might not be ready
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { success: true };

      /* Real implementation:
      const { data } = await maximilianService.post<ApiResponse<any>>(
        "/api/Cliente/actualizar",
        clientData
      );
      if (data.idTipoMensaje !== MessageType.SUCCESS) {
        throw new Error(data.mensaje || "Error al actualizar el cliente");
      }
      return data.result;
      */
    } catch (error) {
      console.error("Error updating client:", error);
      throw error;
    }
  },
};

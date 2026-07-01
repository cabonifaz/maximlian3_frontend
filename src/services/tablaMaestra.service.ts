import maximilianService from "./maximilianService";
import type { ApiResponse } from "@maximilian/shared/types/api.type";
import { MessageType } from "@maximilian/shared/types/api.type";
import type {
  MasterTableResponse,
  TablaMaestraCrearRequest,
  TablaMaestraEditarRequest,
  TablaMaestraGuardarResponse,
} from "@maximilian/shared/types/tabla-maestra.type";

function obtenerNumero(...valores: unknown[]): number | undefined {
  for (const valor of valores) {
    if (typeof valor === "number" && Number.isFinite(valor)) return valor;
    if (typeof valor === "string" && valor.trim() !== "") {
      const numero = Number(valor);
      if (Number.isFinite(numero)) return numero;
    }
  }

  return undefined;
}

function obtenerRegistro(valor: unknown): Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor)
    ? valor as Record<string, unknown>
    : {};
}

function normalizarRespuestaGuardado(resultado: unknown): TablaMaestraGuardarResponse {
  if (Array.isArray(resultado)) return normalizarRespuestaGuardado(resultado[0]);

  const registro = obtenerRegistro(resultado);

  return {
    idTablaMaestra: obtenerNumero(registro.idTablaMaestra, registro.IdTablaMaestra),
    idMaestro: obtenerNumero(registro.idMaestro, registro.IdMaestro),
    idIdioma: obtenerNumero(registro.idIdioma, registro.IdIdioma),
    inputText: typeof registro.inputText === "string" ? registro.inputText : undefined,
    inputText2: typeof registro.inputText2 === "string" ? registro.inputText2 : undefined,
    descripcion: typeof registro.descripcion === "string" ? registro.descripcion : undefined,
    num1: obtenerNumero(registro.num1, registro.Num1),
    num2: obtenerNumero(registro.num2, registro.Num2),
    num3: obtenerNumero(registro.num3, registro.Num3),
    string1: typeof registro.string1 === "string" ? registro.string1 : undefined,
    string2: typeof registro.string2 === "string" ? registro.string2 : undefined,
    string3: typeof registro.string3 === "string" ? registro.string3 : undefined,
    string4: typeof registro.string4 === "string" ? registro.string4 : undefined,
    string5: typeof registro.string5 === "string" ? registro.string5 : undefined,
    string6: typeof registro.string6 === "string" ? registro.string6 : undefined,
    string7: typeof registro.string7 === "string" ? registro.string7 : undefined,
    date1: typeof registro.date1 === "string" ? registro.date1 : undefined,
    date2: typeof registro.date2 === "string" ? registro.date2 : undefined,
    date3: typeof registro.date3 === "string" ? registro.date3 : undefined,
  };
}

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
  crear: async (payload: TablaMaestraCrearRequest): Promise<TablaMaestraGuardarResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/TablaMaestra/crear", payload);

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new Error(data.mensaje || "Error al crear el parámetro de MasterTable");
    }

    return normalizarRespuestaGuardado(data.result);
  },
  editar: async (payload: TablaMaestraEditarRequest): Promise<TablaMaestraGuardarResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/TablaMaestra/editar", payload);

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new Error(data.mensaje || "Error al editar el parámetro de MasterTable");
    }

    return normalizarRespuestaGuardado(data.result);
  },
};

import maximilianService from "./maximilian-service";
import { ENDPOINTS_INFORME_APROBACION } from "@maximilian/shared/constants/endpoints/informe-aprobacion.endpoint";
import { ErrorRespuestaApi, MessageType, type ApiResponse } from "@maximilian/shared/types/api.type";
import type {
  AprobarInformesRequest,
  AprobarTodosInformesRequest,
  ParametrosListaInformesPendientesAprobacion,
  RespuestaListaInformesPendientesAprobacion,
} from "@maximilian/shared/types/informe-aprobacion.type";

async function enviarAccionAprobacion(endpoint: string, payload: unknown): Promise<void> {
  const { data } = await maximilianService.post<ApiResponse<unknown>>(endpoint, payload);
  if (data.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(data);
}

export const servicioInformeAprobacion = {
  listarPendientes: async (
    parametros: ParametrosListaInformesPendientesAprobacion,
    senal?: AbortSignal,
  ): Promise<RespuestaListaInformesPendientesAprobacion> => {
    const { data } = await maximilianService.get<ApiResponse<RespuestaListaInformesPendientesAprobacion>>(
      ENDPOINTS_INFORME_APROBACION.listarPendientes,
      {
        params: {
          IdPais: parametros.idPais,
          IdPlantilla: parametros.idPlantilla,
          IdIdioma: parametros.idIdioma,
          Busqueda: parametros.busqueda,
          FchInicio: parametros.fchInicio,
          FchFin: parametros.fchFin,
          NumPag: parametros.numPag,
        },
        signal: senal,
      },
    );

    if (data.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(data);
    return data.result;
  },
  aprobar: (payload: AprobarInformesRequest) =>
    enviarAccionAprobacion(ENDPOINTS_INFORME_APROBACION.aprobar, payload),
  aprobarTodos: (payload: AprobarTodosInformesRequest) =>
    enviarAccionAprobacion(ENDPOINTS_INFORME_APROBACION.aprobarTodos, payload),
};

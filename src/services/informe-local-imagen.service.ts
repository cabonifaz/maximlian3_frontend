import { ENDPOINTS_INFORME_LOCAL_IMAGEN } from "@maximilian/shared/constants/endpoints/informe-local-imagen.endpoint";
import maximilianService, { esRespuestaOkCompatibilidad } from "./maximilian-service";
import { ErrorRespuestaApi, type ApiResponse } from "@maximilian/shared/types/api.type";
import {
  obtenerNumero,
  obtenerRegistro,
  obtenerTextoSinRecortar as obtenerTexto,
} from "@maximilian/shared/utils/normalizacion-respuesta.util";

export const servicioInformeLocalImagen = {
  obtenerUrls: async (ids: number[]): Promise<{ idInformeLocalImagen: number; url: string }[]> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(ENDPOINTS_INFORME_LOCAL_IMAGEN.obtenerUrls, { ids });

    if (!esRespuestaOkCompatibilidad(data, ENDPOINTS_INFORME_LOCAL_IMAGEN.obtenerUrls)) {
      throw new ErrorRespuestaApi(data);
    }

    const lista = Array.isArray(data.result) ? data.result : [];
    return lista.map((item: unknown) => {
      const registro = obtenerRegistro(item);
      return {
        idInformeLocalImagen: obtenerNumero(registro.idInformeLocalImagen, registro.IdInformeLocalImagen) ?? 0,
        url: obtenerTexto(registro.url, registro.Url, registro.uploadUrl, registro.UploadUrl),
      };
    });
  },

  actualizarEstadoCarga: async (ids: number[]): Promise<void> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(ENDPOINTS_INFORME_LOCAL_IMAGEN.actualizarEstadoCarga, { ids });

    if (!esRespuestaOkCompatibilidad(data, ENDPOINTS_INFORME_LOCAL_IMAGEN.actualizarEstadoCarga)) {
      throw new ErrorRespuestaApi(data);
    }
  },
};

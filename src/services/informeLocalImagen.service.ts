import { ENDPOINTS_INFORME_LOCAL_IMAGEN } from "@maximilian/shared/constants/endpoints/informe-local-imagen.endpoint";
import maximilianService, { esRespuestaOkCompatibilidad } from "./maximilianService";
import { ErrorRespuestaApi, type ApiResponse } from "@maximilian/shared/types/api.type";

function obtenerNumero(...valores: unknown[]): number {
  for (const v of valores) {
    if (typeof v === "number" && !isNaN(v)) return v;
    if (typeof v === "string") {
      const n = Number(v);
      if (!isNaN(n)) return n;
    }
  }
  return 0;
}

function obtenerTexto(...valores: unknown[]): string {
  for (const v of valores) {
    if (typeof v === "string") return v;
  }
  return "";
}

export const servicioInformeLocalImagen = {
  obtenerUrls: async (ids: number[]): Promise<{ idInformeLocalImagen: number; url: string }[]> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(ENDPOINTS_INFORME_LOCAL_IMAGEN.obtenerUrls, { ids });

    if (!esRespuestaOkCompatibilidad(data, ENDPOINTS_INFORME_LOCAL_IMAGEN.obtenerUrls)) {
      throw new ErrorRespuestaApi(data);
    }

    const lista = Array.isArray(data.result) ? data.result : [];
    return lista.map((item: unknown) => {
      const registro = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
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

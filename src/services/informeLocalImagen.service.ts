import maximilianService, { esRespuestaOkCompatibilidad } from "./maximilianService";
import type { ApiResponse } from "@maximilian/shared/types/api.type";

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
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/informeLocalImagen/obtenerUrls", { ids });

    if (!esRespuestaOkCompatibilidad(data, "/api/informeLocalImagen/obtenerUrls")) {
      throw new Error(data.mensaje || "No se pudo obtener las URLs de las imágenes");
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
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/informeLocalImagen/actualizarEstadoCarga", { ids });

    if (!esRespuestaOkCompatibilidad(data, "/api/informeLocalImagen/actualizarEstadoCarga")) {
      throw new Error(data.mensaje || "No se pudo actualizar el estado de carga de imágenes");
    }
  },
};

import maximilianService, { esRespuestaOkCompatibilidad } from "./maximilianService";
import { ErrorRespuestaApi, type ApiResponse } from "@maximilian/shared/types/api.type";
import type {
  InformeActualizarArchivoRequest,
  InformeEliminarArchivoRequest,
  InformeGenerarUrlsArchivoRequest,
  InformeGenerarUrlsArchivoResponse,
  InformeInsertarArchivoLoteRequest,
  InformeInsertarArchivoLoteResponse,
  InformeObtenerArchivoRequest,
  InformeObtenerArchivoResponse,
  InformeUrlArchivoGenerada,
} from "@maximilian/shared/types/informe.type";

function obtenerRegistro(...valores: unknown[]): Record<string, unknown> {
  for (const v of valores) {
    if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  }
  return {};
}

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

function obtenerLista(...valores: unknown[]): unknown[] {
  for (const v of valores) {
    if (Array.isArray(v)) return v;
  }
  return [];
}

function normalizarUrlsArchivoGeneradas(resultado: unknown): InformeUrlArchivoGenerada[] {
  const registro = obtenerRegistro(resultado);
  const lista = Array.isArray(resultado)
    ? resultado
    : obtenerLista(
      registro.archivos,
      registro.Archivos,
      registro.lstArchivos,
      registro.LstArchivos,
      registro.result,
    );

  return lista.map((item) => {
    const archivo = obtenerRegistro(item);
    const uploadUrl = obtenerTexto(
      archivo.uploadUrl,
      archivo.UploadUrl,
      archivo.url,
      archivo.Url,
    );
    const archivoUrl = obtenerTexto(
      archivo.archivoUrl,
      archivo.ArchivoUrl,
      archivo.urlArchivo,
      archivo.UrlArchivo,
      archivo.fileKey,
      archivo.FileKey,
      archivo.urlDestino,
      archivo.UrlDestino,
      archivo.ruta,
      archivo.Ruta,
    ) || uploadUrl.split("?")[0];

    return {
      nombre: obtenerTexto(
        archivo.nombre,
        archivo.Nombre,
        archivo.nombreArchivo,
        archivo.NombreArchivo,
        archivo.fileName,
        archivo.FileName,
      ),
      uploadUrl,
      archivoUrl,
    };
  });
}

function normalizarRespuestaUrlsArchivo(resultado: unknown): InformeGenerarUrlsArchivoResponse {
  const registro = obtenerRegistro(resultado);

  return {
    idInforme: obtenerNumero(registro.idInforme, registro.IdInforme) || undefined,
    archivos: normalizarUrlsArchivoGeneradas(resultado),
  };
}

function normalizarRespuestaCrear(resultado: unknown): InformeInsertarArchivoLoteResponse {
  const registro = obtenerRegistro(resultado);
  return {
    idInforme: obtenerNumero(
      registro.idInforme,
      registro.IdInforme,
    ),
  };
}

export const servicioInformeArchivo = {
  generarUrls: async (
    payload: InformeGenerarUrlsArchivoRequest,
  ): Promise<InformeGenerarUrlsArchivoResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(
      "/api/informeArchivo/generarUrls",
      payload,
    );

    if (!esRespuestaOkCompatibilidad(data, "/api/informeArchivo/generarUrls")) {
      throw new ErrorRespuestaApi(data);
    }

    const respuesta = normalizarRespuestaUrlsArchivo(data.result);
    if (respuesta.archivos.some((archivo) => !archivo.nombre || !archivo.uploadUrl || !archivo.archivoUrl)) {
      throw new Error("La respuesta de URLs de archivos es invalida");
    }

    return respuesta;
  },

  insertarLote: async (
    payload: InformeInsertarArchivoLoteRequest,
  ): Promise<InformeInsertarArchivoLoteResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(
      "/api/informeArchivo/insertarLote",
      payload,
    );

    if (!esRespuestaOkCompatibilidad(data, "/api/informeArchivo/insertarLote")) {
      throw new ErrorRespuestaApi(data);
    }

    return normalizarRespuestaCrear(data.result);
  },

  obtener: async (
    payload: InformeObtenerArchivoRequest,
  ): Promise<InformeObtenerArchivoResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(
      "/api/informeArchivo/obtener",
      payload,
    );

    if (!esRespuestaOkCompatibilidad(data, "/api/informeArchivo/obtener")) {
      throw new ErrorRespuestaApi(data);
    }

    const registro = obtenerRegistro(
      Array.isArray(data.result) ? data.result[0] : data.result,
    );
    const downloadUrl = obtenerTexto(
      typeof data.result === "string" ? data.result : undefined,
      registro.downloadUrl,
      registro.DownloadUrl,
      registro.archivoUrl,
      registro.ArchivoUrl,
      registro.url,
      registro.Url,
    );
    if (!downloadUrl) throw new Error("La respuesta del archivo es invalida");

    return { downloadUrl };
  },

  actualizar: async (
    payload: InformeActualizarArchivoRequest,
  ): Promise<void> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(
      "/api/informeArchivo/actualizar",
      payload,
    );

    if (!esRespuestaOkCompatibilidad(data, "/api/informeArchivo/actualizar")) {
      throw new ErrorRespuestaApi(data);
    }
  },

  eliminar: async (
    payload: InformeEliminarArchivoRequest,
  ): Promise<void> => {
    const { data } = await maximilianService.delete<ApiResponse<unknown>>(
      "/api/informeArchivo/eliminar",
      { data: payload },
    );

    if (!esRespuestaOkCompatibilidad(data, "/api/informeArchivo/eliminar")) {
      throw new ErrorRespuestaApi(data);
    }
  },
};

import { ENDPOINTS_COMPANIA_NOTICIA } from "@maximilian/shared/constants/endpoints/compania-noticia.endpoint";
import maximilianService, { esRespuestaOkCompatibilidad } from "./maximilian-service";
import { ErrorRespuestaApi, type ApiResponse } from "@maximilian/shared/types/api.type";
import type {
  CompaniaNoticiaArchivo,
  CompaniaNoticiaArchivoEliminarRequest,
  CompaniaNoticiaArchivoObtenerParams,
  CompaniaNoticiaArchivoObtenerResponse,
  CompaniaNoticiaCrearRequest,
  CompaniaNoticiaEditarRequest,
  CompaniaNoticiaEliminarRequest,
  CompaniaNoticiaGuardarResponse,
  CompaniaNoticiaListaItem,
  CompaniaNoticiaListParams,
  CompaniaNoticiaListResponse,
  CompaniaNoticiaObtenerParams,
} from "@maximilian/shared/types/compania-noticia.type";
import {
  obtenerLista,
  obtenerNumeroOpcional as obtenerNumero,
  obtenerRegistro,
  obtenerTexto,
} from "@maximilian/shared/utils/normalizacion-respuesta.util";

function normalizarArchivo(item: unknown): CompaniaNoticiaArchivo {
  const registro = obtenerRegistro(item);

  return {
    idCompaniaNoticiaArchivo: obtenerNumero(
      registro.idCompaniaNoticiaArchivo,
      registro.IdCompaniaNoticiaArchivo,
    ) ?? 0,
    idTipoArchivo: obtenerNumero(registro.idTipoArchivo, registro.IdTipoArchivo) ?? 0,
    nombreArchivo: obtenerTexto(
      registro.nombreArchivo,
      registro.NombreArchivo,
      registro.nombreDocumento,
      registro.NombreDocumento,
      registro.archivoUrl,
      registro.ArchivoUrl,
    ) || "Archivo adjunto",
    nombreDocumento: obtenerTexto(registro.nombreDocumento, registro.NombreDocumento),
    formatoArchivo: obtenerTexto(registro.formatoArchivo, registro.FormatoArchivo, registro.tipoArchivo, registro.TipoArchivo),
    extension: obtenerTexto(registro.extension, registro.Extension),
    tamanoBytes: obtenerNumero(registro.tamanoBytes, registro.TamanoBytes) ?? undefined,
    archivoUrl: obtenerTexto(registro.archivoUrl, registro.ArchivoUrl),
    downloadUrl: obtenerTexto(registro.downloadUrl, registro.DownloadUrl),
    uploadUrl: obtenerTexto(registro.uploadUrl, registro.UploadUrl),
  };
}

function normalizarNoticia(item: unknown): CompaniaNoticiaListaItem {
  const registro = obtenerRegistro(item);
  const idCompania = obtenerNumero(registro.idCompania, registro.IdCompania) ?? 0;
  const archivos = obtenerLista(registro.archivos, registro.Archivos, registro.lstArchivos, registro.LstArchivos);

  return {
    idCompaniaNoticia: obtenerNumero(registro.idCompaniaNoticia, registro.IdCompaniaNoticia) ?? 0,
    idCompania,
    compania: obtenerTexto(
      registro.compania,
      registro.Compania,
      registro.nombreCompania,
      registro.NombreCompania,
      registro.nombreCompleto,
      registro.NombreCompleto,
      registro.empresa,
      registro.Empresa,
    ) || (idCompania ? `Compañía ${idCompania}` : "-"),
    titulo: obtenerTexto(registro.titulo, registro.Titulo) || "-",
    descripcion: obtenerTexto(registro.descripcion, registro.Descripcion),
    fechaNoticia: obtenerTexto(registro.fechaNoticia, registro.FechaNoticia),
    categoria: obtenerTexto(registro.categoria, registro.Categoria),
    archivos: archivos.map(normalizarArchivo),
  };
}

function normalizarLista(resultado: unknown): CompaniaNoticiaListResponse {
  if (Array.isArray(resultado)) {
    return {
      lstCompaniaNoticia: resultado.map(normalizarNoticia),
      totalRegistros: resultado.length,
      totalPaginas: 1,
    };
  }

  const registro = obtenerRegistro(resultado);
  const lista = obtenerLista(
    registro.lstCompaniaNoticia,
    registro.LstCompaniaNoticia,
    registro.lstCompaniaNoticias,
    registro.LstCompaniaNoticias,
    registro.lstNoticias,
    registro.LstNoticias,
    registro.noticias,
    registro.Noticias,
    registro.result,
  );

  return {
    lstCompaniaNoticia: lista.map(normalizarNoticia),
    totalRegistros: obtenerNumero(registro.totalRegistros, registro.TotalRegistros, lista.length) ?? 0,
    totalPaginas: obtenerNumero(registro.totalPaginas, registro.TotalPaginas, 1) ?? 1,
  };
}

function normalizarGuardado(resultado: unknown): CompaniaNoticiaGuardarResponse {
  if (Array.isArray(resultado)) return normalizarGuardado(resultado[0]);

  const registro = obtenerRegistro(resultado);

  return {
    idCompaniaNoticia: obtenerNumero(registro.idCompaniaNoticia, registro.IdCompaniaNoticia),
    archivos: obtenerLista(registro.archivos, registro.Archivos, registro.lstArchivos, registro.LstArchivos).map(normalizarArchivo),
  };
}

function normalizarArchivoObtenido(resultado: unknown): CompaniaNoticiaArchivoObtenerResponse {
  const registro = obtenerRegistro(Array.isArray(resultado) ? resultado[0] : resultado);
  const downloadUrl = obtenerTexto(
    typeof resultado === "string" ? resultado : undefined,
    registro.downloadUrl,
    registro.DownloadUrl,
    registro.archivoUrl,
    registro.ArchivoUrl,
    registro.url,
    registro.Url,
  );

  if (!downloadUrl) throw new Error("La respuesta del archivo es invalida");

  return { downloadUrl };
}

export const servicioCompaniaNoticia = {
  list: async (params: CompaniaNoticiaListParams): Promise<CompaniaNoticiaListResponse> => {
    const { data } = await maximilianService.get<ApiResponse<unknown>>(ENDPOINTS_COMPANIA_NOTICIA.listar, {
      params: {
        IdCompania: params.idCompania,
        Busqueda: params.busqueda,
        NumPag: params.numPag,
        FchInicio: params.fechaInicio,
        FchFin: params.fechaFin,
      },
    });

    if (!esRespuestaOkCompatibilidad(data, ENDPOINTS_COMPANIA_NOTICIA.listar)) {
      throw new ErrorRespuestaApi(data);
    }

    return normalizarLista(data.result);
  },

  obtener: async (params: CompaniaNoticiaObtenerParams): Promise<CompaniaNoticiaListaItem | null> => {
    const { data } = await maximilianService.get<ApiResponse<unknown>>(ENDPOINTS_COMPANIA_NOTICIA.obtener, {
      params: {
        IdCompaniaNoticia: params.idCompaniaNoticia,
        IdCompania: params.idCompania,
      },
    });

    if (!esRespuestaOkCompatibilidad(data, ENDPOINTS_COMPANIA_NOTICIA.obtener)) {
      throw new ErrorRespuestaApi(data);
    }

    const lista = normalizarLista(data.result).lstCompaniaNoticia;
    if (lista.length > 0) return lista[0];

    const registro = obtenerRegistro(data.result);
    if (Object.keys(registro).length > 0) return normalizarNoticia(registro);

    return null;
  },

  obtenerArchivo: async (
    params: CompaniaNoticiaArchivoObtenerParams,
  ): Promise<CompaniaNoticiaArchivoObtenerResponse> => {
    const { data } = await maximilianService.get<ApiResponse<unknown>>(
      ENDPOINTS_COMPANIA_NOTICIA.obtenerArchivo,
      {
        params: {
          IdCompaniaNoticiaArchivo: params.idCompaniaNoticiaArchivo,
        },
      },
    );

    if (!esRespuestaOkCompatibilidad(data, ENDPOINTS_COMPANIA_NOTICIA.obtenerArchivo)) {
      throw new ErrorRespuestaApi(data);
    }

    return normalizarArchivoObtenido(data.result);
  },

  crear: async (payload: CompaniaNoticiaCrearRequest): Promise<CompaniaNoticiaGuardarResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(ENDPOINTS_COMPANIA_NOTICIA.crear, payload);

    if (!esRespuestaOkCompatibilidad(data, ENDPOINTS_COMPANIA_NOTICIA.crear)) {
      throw new ErrorRespuestaApi(data);
    }

    return normalizarGuardado(data.result);
  },

  editar: async (payload: CompaniaNoticiaEditarRequest): Promise<CompaniaNoticiaGuardarResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(ENDPOINTS_COMPANIA_NOTICIA.editar, payload);

    if (!esRespuestaOkCompatibilidad(data, ENDPOINTS_COMPANIA_NOTICIA.editar)) {
      throw new ErrorRespuestaApi(data);
    }

    return normalizarGuardado(data.result);
  },

  eliminar: async (payload: CompaniaNoticiaEliminarRequest): Promise<void> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(ENDPOINTS_COMPANIA_NOTICIA.eliminar, payload);

    if (!esRespuestaOkCompatibilidad(data, ENDPOINTS_COMPANIA_NOTICIA.eliminar)) {
      throw new ErrorRespuestaApi(data);
    }
  },

  eliminarArchivo: async (payload: CompaniaNoticiaArchivoEliminarRequest): Promise<void> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(
      ENDPOINTS_COMPANIA_NOTICIA.eliminarArchivo,
      payload,
    );

    if (!esRespuestaOkCompatibilidad(data, ENDPOINTS_COMPANIA_NOTICIA.eliminarArchivo)) {
      throw new ErrorRespuestaApi(data);
    }
  },
};

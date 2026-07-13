import maximilianService, { esRespuestaOkCompatibilidad } from "./maximilianService";
import type { ApiResponse } from "@maximilian/shared/types/api.type";
import type {
  CompaniaNoticiaArchivo,
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
} from "@maximilian/shared/types/companiaNoticia.type";

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

function obtenerTexto(...valores: unknown[]): string {
  for (const valor of valores) {
    if (typeof valor === "string") {
      const texto = valor.trim();
      if (texto) return texto;
    }
  }

  return "";
}

function obtenerRegistro(valor: unknown): Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor)
    ? valor as Record<string, unknown>
    : {};
}

function obtenerLista(...valores: unknown[]): unknown[] {
  for (const valor of valores) {
    if (Array.isArray(valor)) return valor;
  }

  return [];
}

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
    formatoArchivo: obtenerTexto(registro.formatoArchivo, registro.FormatoArchivo, registro.tipoArchivo, registro.TipoArchivo),
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
    ) || (idCompania ? `Compania ${idCompania}` : "-"),
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
    const { data } = await maximilianService.get<ApiResponse<unknown>>("/api/Compania/noticia/listar", {
      params: {
        IdCompania: params.idCompania,
        Busqueda: params.busqueda,
        NumPag: params.numPag,
      },
    });

    if (!esRespuestaOkCompatibilidad(data, "/api/Compania/noticia/listar")) {
      throw new Error(data.mensaje || "Error al listar las noticias");
    }

    return normalizarLista(data.result);
  },

  obtener: async (params: CompaniaNoticiaObtenerParams): Promise<CompaniaNoticiaListaItem | null> => {
    const { data } = await maximilianService.get<ApiResponse<unknown>>("/api/Compania/noticia/obtener", {
      params: {
        IdCompaniaNoticia: params.idCompaniaNoticia,
        IdCompania: params.idCompania,
      },
    });

    if (!esRespuestaOkCompatibilidad(data, "/api/Compania/noticia/obtener")) {
      throw new Error(data.mensaje || "Error al obtener la noticia");
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
      "/api/Compania/noticia/archivo/obtener",
      {
        params: {
          IdCompaniaNoticiaArchivo: params.idCompaniaNoticiaArchivo,
        },
      },
    );

    if (!esRespuestaOkCompatibilidad(data, "/api/Compania/noticia/archivo/obtener")) {
      throw new Error(data.mensaje || "No se pudo obtener el archivo");
    }

    return normalizarArchivoObtenido(data.result);
  },

  crear: async (payload: CompaniaNoticiaCrearRequest): Promise<CompaniaNoticiaGuardarResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/Compania/noticia/crear", payload);

    if (!esRespuestaOkCompatibilidad(data, "/api/Compania/noticia/crear")) {
      throw new Error(data.mensaje || "Error al crear la noticia");
    }

    return normalizarGuardado(data.result);
  },

  editar: async (payload: CompaniaNoticiaEditarRequest): Promise<CompaniaNoticiaGuardarResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/Compania/noticia/editar", payload);

    if (!esRespuestaOkCompatibilidad(data, "/api/Compania/noticia/editar")) {
      throw new Error(data.mensaje || "Error al editar la noticia");
    }

    return normalizarGuardado(data.result);
  },

  eliminar: async (payload: CompaniaNoticiaEliminarRequest): Promise<void> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/Compania/noticia/eliminar", payload);

    if (!esRespuestaOkCompatibilidad(data, "/api/Compania/noticia/eliminar")) {
      throw new Error(data.mensaje || "Error al eliminar la noticia");
    }
  },
};

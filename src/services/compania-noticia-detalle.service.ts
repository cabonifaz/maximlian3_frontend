import { ENDPOINTS_COMPANIA_NOTICIA_DETALLE } from "@maximilian/shared/constants/endpoints/compania-noticia-detalle.endpoint";
import maximilianService, { esRespuestaOkCompatibilidad } from "./maximilian-service";
import { ErrorRespuestaApi, type ApiResponse } from "@maximilian/shared/types/api.type";
import type {
  CompaniaNoticiaDetalleExportResponse,
  CompaniaNoticiaDetalleListaItem,
  CompaniaNoticiaDetalleListParams,
  CompaniaNoticiaDetalleListResponse,
} from "@maximilian/shared/types/compania-noticia-detalle.type";
import {
  obtenerLista,
  obtenerNumeroOpcional as obtenerNumero,
  obtenerRegistro,
  obtenerTextoONumero as obtenerTexto,
} from "@maximilian/shared/utils/normalizacion-respuesta.util";

function normalizarCompaniaDetalle(item: unknown): CompaniaNoticiaDetalleListaItem {
  const registro = obtenerRegistro(item);

  return {
    idCompania: obtenerNumero(
      registro.idCompania,
      registro.IdCompania,
      registro.id,
      registro.Id,
    ) ?? 0,
    razonSocial: obtenerTexto(
      registro.razonSocial,
      registro.RazonSocial,
      registro.nombreCompleto,
      registro.NombreCompleto,
      registro.nombre,
      registro.Nombre,
      registro.compania,
      registro.Compania,
    ) || "-",
    numeroDocumento: obtenerTexto(
      registro.numeroDocumento,
      registro.NumeroDocumento,
      registro.ruc,
      registro.Ruc,
      registro.taxNum,
      registro.TaxNum,
    ) || "-",
    pais: obtenerTexto(registro.pais, registro.Pais, registro.nombrePais, registro.NombrePais) || "-",
    direccion: obtenerTexto(registro.direccion, registro.Direccion) || "-",
    telefono: obtenerTexto(registro.telefono, registro.Telefono, registro.celular, registro.Celular) || "-",
    actividadComercial: obtenerTexto(
      registro.actividadComercial,
      registro.ActividadComercial,
      registro.actividadEconomica,
      registro.ActividadEconomica,
      registro.giro,
      registro.Giro,
      registro.objetoSocial,
      registro.ObjetoSocial,
    ) || "-",
    trabajadores: obtenerNumero(
      registro.trabajadores,
      registro.Trabajadores,
      registro.numeroTrabajadores,
      registro.NumeroTrabajadores,
      registro.cantidadTrabajadores,
      registro.CantidadTrabajadores,
      registro.numTrabajadores,
      registro.NumTrabajadores,
      registro.numeroEmpleados,
      registro.NumeroEmpleados,
    ) ?? 0,
  };
}

function normalizarLista(resultado: unknown): CompaniaNoticiaDetalleListResponse {
  if (Array.isArray(resultado)) {
    return {
      lstCompaniaNoticiaDetalle: resultado.map(normalizarCompaniaDetalle),
      totalRegistros: resultado.length,
      totalPaginas: 1,
    };
  }

  const registro = obtenerRegistro(resultado);
  const lista = obtenerLista(
    registro.lstCompaniaNoticiaDetalle,
    registro.LstCompaniaNoticiaDetalle,
    registro.lstCompaniaNoticiasDetalle,
    registro.LstCompaniaNoticiasDetalle,
    registro.lstCompaniaDetalle,
    registro.LstCompaniaDetalle,
    registro.lstCompaniasDetalle,
    registro.LstCompaniasDetalle,
    registro.lstCompania,
    registro.LstCompania,
    registro.lstCompanias,
    registro.LstCompanias,
    registro.companias,
    registro.Companias,
    registro.result,
  );

  return {
    lstCompaniaNoticiaDetalle: lista.map(normalizarCompaniaDetalle),
    totalRegistros: obtenerNumero(registro.totalRegistros, registro.TotalRegistros, lista.length) ?? 0,
    totalPaginas: obtenerNumero(registro.totalPaginas, registro.TotalPaginas, 1) ?? 1,
  };
}

function obtenerNombreArchivoDesdeCabecera(cabecera?: string) {
  if (!cabecera) return "";

  const coincidenciaUtf = /filename\*=UTF-8''([^;]+)/i.exec(cabecera);
  if (coincidenciaUtf?.[1]) return decodeURIComponent(coincidenciaUtf[1]);

  const coincidencia = /filename="?([^";]+)"?/i.exec(cabecera);
  return coincidencia?.[1] ?? "";
}

function obtenerUrlExportacion(resultado: unknown) {
  if (typeof resultado === "string" && resultado.trim()) return resultado.trim();

  const registro = obtenerRegistro(Array.isArray(resultado) ? resultado[0] : resultado);
  return obtenerTexto(
    registro.downloadUrl,
    registro.DownloadUrl,
    registro.archivoUrl,
    registro.ArchivoUrl,
    registro.url,
    registro.Url,
  );
}

export const servicioCompaniaNoticiaDetalle = {
  list: async (params: CompaniaNoticiaDetalleListParams): Promise<CompaniaNoticiaDetalleListResponse> => {
    const { data } = await maximilianService.get<ApiResponse<unknown>>(ENDPOINTS_COMPANIA_NOTICIA_DETALLE.listar, {
      params: {
        IdCompania: params.idCompania,
        Busqueda: params.busqueda,
        NumPag: params.numPag,
        Paises: params.paises,
        Actividades: params.actividades,
      },
    });

    if (!esRespuestaOkCompatibilidad(data, ENDPOINTS_COMPANIA_NOTICIA_DETALLE.listar)) {
      throw new ErrorRespuestaApi(data);
    }

    return normalizarLista(data.result);
  },

  exportar: async (params: CompaniaNoticiaDetalleListParams): Promise<CompaniaNoticiaDetalleExportResponse> => {
    const respuesta = await maximilianService.get<Blob>(ENDPOINTS_COMPANIA_NOTICIA_DETALLE.exportar, {
      params: {
        IdCompania: params.idCompania,
        Busqueda: params.busqueda,
        NumPag: params.numPag,
        Paises: params.paises,
        Actividades: params.actividades,
      },
      responseType: "blob",
    });

    const tipoContenido = respuesta.headers["content-type"] ?? "";
    const nombreArchivo =
      obtenerNombreArchivoDesdeCabecera(respuesta.headers["content-disposition"])
      || "empresas.xlsx";

    if (tipoContenido.includes("application/json")) {
      const texto = await respuesta.data.text();
      const data = JSON.parse(texto) as ApiResponse<unknown> | unknown;

      if (obtenerRegistro(data).idTipoMensaje !== undefined) {
        const respuestaApi = data as ApiResponse<unknown>;
        if (!esRespuestaOkCompatibilidad(respuestaApi, ENDPOINTS_COMPANIA_NOTICIA_DETALLE.exportar)) {
          throw new ErrorRespuestaApi(respuestaApi);
        }

        const downloadUrl = obtenerUrlExportacion(respuestaApi.result);
        if (!downloadUrl) throw new Error("La respuesta de exportacion es invalida");

        return {
          downloadUrl,
          nombreArchivo,
        };
      }

      const downloadUrl = obtenerUrlExportacion(data);
      if (!downloadUrl) throw new Error("La respuesta de exportacion es invalida");

      return {
        downloadUrl,
        nombreArchivo,
      };
    }

    return {
      archivo: respuesta.data,
      nombreArchivo,
    };
  },
};

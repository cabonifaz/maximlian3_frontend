import { ENDPOINTS_COMPANIA } from "@maximilian/shared/constants/endpoints/compania.endpoint";
import maximilianService, { esRespuestaOkCompatibilidad } from "./maximilian-service";
import { ErrorRespuestaApi, type ApiResponse } from "@maximilian/shared/types/api.type";
import type {
  CompaniaCrearRequest,
  DirectorioEjecutivoCrearRequest,
  CompaniaEditarRequest,
  CompaniaEliminarRequest,
  CompaniaGuardarResponse,
  CompaniaListaItem,
  CompaniaListParams,
  CompaniaListResponse,
  CompaniaObtenerParams,
} from "@maximilian/shared/types/compania.type";
import {
  obtenerBooleanoFlexible as obtenerBooleano,
  obtenerLista,
  obtenerNumeroOpcional as obtenerNumero,
  obtenerRegistro,
  obtenerTexto,
} from "@maximilian/shared/utils/normalizacion-respuesta.util";

function normalizarCompania(item: unknown): CompaniaListaItem {
  const registro = obtenerRegistro(item);

  return {
    idCompania: obtenerNumero(registro.idCompania, registro.IdCompania) ?? 0,
    idTipoPersona: obtenerNumero(registro.idTipoPersona, registro.IdTipoPersona),
    idTipoDocumento: obtenerNumero(registro.idTipoDocumento, registro.IdTipoDocumento),
    idPais: obtenerNumero(registro.idPais, registro.IdPais),
    direccion: obtenerTexto(registro.direccion, registro.Direccion) || undefined,
    ubigeo: obtenerTexto(registro.ubigeo, registro.Ubigeo) || undefined,
    codigoPostal: obtenerTexto(registro.codigoPostal, registro.CodigoPostal) || undefined,
    numeroDocumento: obtenerTexto(registro.numeroDocumento, registro.NumeroDocumento, registro.taxNum, registro.TaxNum),
    nombreCompleto: obtenerTexto(registro.nombreCompleto, registro.NombreCompleto, registro.nombre, registro.Nombre),
    pais: obtenerTexto(registro.pais, registro.Pais, registro.nombrePais, registro.NombrePais) || "-",
    telefono: obtenerTexto(registro.telefono, registro.Telefono) || "-",
    existeInformacion: obtenerBooleano(registro.existeInformacion, registro.ExisteInformacion),
    tipoPersona: obtenerTexto(registro.tipoPersona, registro.TipoPersona) || undefined,
    tipoDocumento: obtenerTexto(registro.tipoDocumento, registro.TipoDocumento) || undefined,
  };
}

function normalizarLista(resultado: unknown): CompaniaListResponse {
  if (Array.isArray(resultado)) {
    return {
      lstCompania: resultado.map(normalizarCompania),
      totalRegistros: resultado.length,
      totalPaginas: 1,
    };
  }

  const registro = obtenerRegistro(resultado);
  const lista = obtenerLista(
    registro.lstCompania,
    registro.LstCompania,
    registro.lstCompanias,
    registro.LstCompanias,
    registro.lstCompaniaNoticiasDetalle,
    registro.LstCompaniaNoticiasDetalle,
    registro.companias,
    registro.Companias,
    registro.result,
  );

  return {
    lstCompania: lista.map(normalizarCompania),
    totalRegistros: obtenerNumero(registro.totalRegistros, registro.TotalRegistros, lista.length) ?? 0,
    totalPaginas: obtenerNumero(registro.totalPaginas, registro.TotalPaginas, 1) ?? 1,
  };
}

function normalizarGuardado(resultado: unknown): CompaniaGuardarResponse {
  if (Array.isArray(resultado)) return normalizarGuardado(resultado[0]);

  const registro = obtenerRegistro(resultado);

  return {
    idCompania: obtenerNumero(
      registro.idCompania,
      registro.IdCompania,
      registro.idDirectorioEjecutivo,
      registro.IdDirectorioEjecutivo,
      registro.id,
      registro.Id,
    ),
  };
}

const cacheCompaniaObtener = new Map<string, CompaniaListaItem | null>();
const solicitudesCompaniaObtener = new Map<string, Promise<CompaniaListaItem | null>>();

function obtenerClaveCompania(params: CompaniaObtenerParams) {
  return JSON.stringify({
    idCompania: params.idCompania ?? null,
    numDocumento: params.numDocumento?.trim() || null,
    nombre: params.nombre?.trim() || null,
  });
}

async function obtenerCompania(params: CompaniaObtenerParams): Promise<CompaniaListaItem | null> {
  const clave = obtenerClaveCompania(params);
  if (cacheCompaniaObtener.has(clave)) return cacheCompaniaObtener.get(clave) ?? null;

  const solicitudExistente = solicitudesCompaniaObtener.get(clave);
  if (solicitudExistente) return solicitudExistente;

  const solicitud = maximilianService
    .get<ApiResponse<unknown>>(ENDPOINTS_COMPANIA.obtener, {
      params: {
        IdCompania: params.idCompania,
        NumDocumento: params.numDocumento,
        Nombre: params.nombre,
      },
    })
    .then(({ data }) => {
      if (!esRespuestaOkCompatibilidad(data, ENDPOINTS_COMPANIA.obtener)) {
        throw new ErrorRespuestaApi(data);
      }

      const compania = normalizarLista(data.result).lstCompania[0] ?? null;
      cacheCompaniaObtener.set(clave, compania);
      return compania;
    })
    .finally(() => {
      solicitudesCompaniaObtener.delete(clave);
    });

  solicitudesCompaniaObtener.set(clave, solicitud);
  return solicitud;
}

export const servicioCompania = {
  list: async (params: CompaniaListParams): Promise<CompaniaListResponse> => {
    const { data } = await maximilianService.get<ApiResponse<unknown>>(ENDPOINTS_COMPANIA.listar, {
      params: {
        Busqueda: params.busqueda,
        ...(typeof params.numPag === "number" ? { NumPag: params.numPag } : {}),
      },
    });

    if (!esRespuestaOkCompatibilidad(data, ENDPOINTS_COMPANIA.listar)) {
      throw new ErrorRespuestaApi(data);
    }

    return normalizarLista(data.result);
  },

  obtener: async (params: CompaniaObtenerParams): Promise<CompaniaListaItem | null> => {
    return obtenerCompania(params);
  },

  crear: async (payload: CompaniaCrearRequest): Promise<CompaniaGuardarResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(ENDPOINTS_COMPANIA.crear, [payload]);

    if (!esRespuestaOkCompatibilidad(data, ENDPOINTS_COMPANIA.crear)) {
      throw new ErrorRespuestaApi(data);
    }

    cacheCompaniaObtener.clear();
    return normalizarGuardado(data.result);
  },

  crearDirectorioEjecutivo: async (payload: DirectorioEjecutivoCrearRequest): Promise<CompaniaGuardarResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(ENDPOINTS_COMPANIA.crearDirectorioEjecutivo, [payload]);

    if (!esRespuestaOkCompatibilidad(data, ENDPOINTS_COMPANIA.crearDirectorioEjecutivo)) {
      throw new ErrorRespuestaApi(data);
    }

    return normalizarGuardado(data.result);
  },

  editar: async (payload: CompaniaEditarRequest): Promise<CompaniaGuardarResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(ENDPOINTS_COMPANIA.editar, payload);

    if (!esRespuestaOkCompatibilidad(data, ENDPOINTS_COMPANIA.editar)) {
      throw new ErrorRespuestaApi(data);
    }

    cacheCompaniaObtener.clear();
    return normalizarGuardado(data.result);
  },

  eliminar: async (payload: CompaniaEliminarRequest): Promise<void> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(ENDPOINTS_COMPANIA.eliminar, payload);

    if (!esRespuestaOkCompatibilidad(data, ENDPOINTS_COMPANIA.eliminar)) {
      throw new ErrorRespuestaApi(data);
    }

    cacheCompaniaObtener.clear();
  },
};

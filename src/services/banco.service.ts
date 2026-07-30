import { ENDPOINTS_BANCO } from "@maximilian/shared/constants/endpoints/banco.endpoint";
import maximilianService, { esRespuestaOkCompatibilidad } from "./maximilian-service";
import { ErrorRespuestaApi, type ApiResponse } from "@maximilian/shared/types/api.type";
import type {
  BancoCrearRequest,
  BancoEditarRequest,
  BancoEliminarRequest,
  BancoGuardarResponse,
  BancoListaItem,
  BancoListParams,
  BancoListResponse,
  BancoObtenerParams,
} from "@maximilian/shared/types/banco.type";
import {
  obtenerLista,
  obtenerNumeroOpcional as obtenerNumero,
  obtenerRegistro,
  obtenerTexto,
} from "@maximilian/shared/utils/normalizacion-respuesta.util";

function normalizarBanco(item: unknown): BancoListaItem {
  const registro = obtenerRegistro(item);

  return {
    idBanco: obtenerNumero(registro.idBanco, registro.IdBanco) ?? 0,
    idPais: obtenerNumero(registro.idPais, registro.IdPais),
    idSector: obtenerNumero(registro.idSector, registro.IdSector),
    nombre: obtenerTexto(registro.nombre, registro.Nombre, registro.banco, registro.Banco) || "-",
    telefono: obtenerTexto(registro.telefono, registro.Telefono) || "-",
    pais: obtenerTexto(registro.pais, registro.Pais, registro.nombrePais, registro.NombrePais) || "-",
    sector: obtenerTexto(registro.sector, registro.Sector) || undefined,
  };
}

function normalizarLista(resultado: unknown): BancoListResponse {
  if (Array.isArray(resultado)) {
    return {
      lstBanco: resultado.map(normalizarBanco),
      totalRegistros: resultado.length,
      totalPaginas: 1,
    };
  }

  const registro = obtenerRegistro(resultado);
  const lista = obtenerLista(
    registro.lstBanco,
    registro.LstBanco,
    registro.lstBancos,
    registro.LstBancos,
    registro.bancos,
    registro.Bancos,
    registro.result,
  );

  return {
    lstBanco: lista.map(normalizarBanco),
    totalRegistros: obtenerNumero(registro.totalRegistros, registro.TotalRegistros, lista.length) ?? 0,
    totalPaginas: obtenerNumero(registro.totalPaginas, registro.TotalPaginas, 1) ?? 1,
  };
}

function normalizarGuardado(resultado: unknown): BancoGuardarResponse {
  if (Array.isArray(resultado)) return normalizarGuardado(resultado[0]);

  const registro = obtenerRegistro(resultado);

  return {
    idBanco: obtenerNumero(registro.idBanco, registro.IdBanco),
  };
}

function normalizarBancoObtenido(resultado: unknown) {
  const bancoDesdeLista = normalizarLista(resultado).lstBanco[0];
  if (bancoDesdeLista) return bancoDesdeLista;

  const registro = obtenerRegistro(resultado);
  const idBanco = obtenerNumero(registro.idBanco, registro.IdBanco);

  return idBanco ? normalizarBanco(registro) : null;
}

const cacheBancoObtener = new Map<string, BancoListaItem | null>();
const solicitudesBancoObtener = new Map<string, Promise<BancoListaItem | null>>();

function obtenerClaveBanco(params: BancoObtenerParams) {
  return JSON.stringify({
    idBanco: params.idBanco ?? null,
    nombre: params.nombre?.trim() || null,
  });
}

async function obtenerBanco(params: BancoObtenerParams): Promise<BancoListaItem | null> {
  const clave = obtenerClaveBanco(params);
  if (cacheBancoObtener.has(clave)) return cacheBancoObtener.get(clave) ?? null;

  const solicitudExistente = solicitudesBancoObtener.get(clave);
  if (solicitudExistente) return solicitudExistente;

  const solicitud = maximilianService
    .get<ApiResponse<unknown>>(ENDPOINTS_BANCO.obtener, {
      params: {
        IdBanco: params.idBanco,
        Nombre: params.nombre,
      },
    })
    .then(({ data }) => {
      if (!esRespuestaOkCompatibilidad(data, ENDPOINTS_BANCO.obtener)) {
        throw new ErrorRespuestaApi(data);
      }

      const banco = normalizarBancoObtenido(data.result);
      cacheBancoObtener.set(clave, banco);
      return banco;
    })
    .finally(() => {
      solicitudesBancoObtener.delete(clave);
    });

  solicitudesBancoObtener.set(clave, solicitud);
  return solicitud;
}

export const servicioBanco = {
  list: async (params: BancoListParams): Promise<BancoListResponse> => {
    const { data } = await maximilianService.get<ApiResponse<unknown>>(ENDPOINTS_BANCO.listar, {
      params: {
        Busqueda: params.busqueda,
        NumPag: params.numPag,
      },
    });

    if (!esRespuestaOkCompatibilidad(data, ENDPOINTS_BANCO.listar)) {
      throw new ErrorRespuestaApi(data);
    }

    return normalizarLista(data.result);
  },

  obtener: async (params: BancoObtenerParams): Promise<BancoListaItem | null> => {
    return obtenerBanco(params);
  },

  crear: async (payload: BancoCrearRequest): Promise<BancoGuardarResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(ENDPOINTS_BANCO.crear, [payload]);

    if (!esRespuestaOkCompatibilidad(data, ENDPOINTS_BANCO.crear)) {
      throw new ErrorRespuestaApi(data);
    }

    cacheBancoObtener.clear();
    return normalizarGuardado(data.result);
  },

  editar: async (payload: BancoEditarRequest): Promise<BancoGuardarResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(ENDPOINTS_BANCO.editar, payload);

    if (!esRespuestaOkCompatibilidad(data, ENDPOINTS_BANCO.editar)) {
      throw new ErrorRespuestaApi(data);
    }

    cacheBancoObtener.clear();
    return normalizarGuardado(data.result);
  },

  eliminar: async (payload: BancoEliminarRequest): Promise<void> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(ENDPOINTS_BANCO.eliminar, payload);

    if (!esRespuestaOkCompatibilidad(data, ENDPOINTS_BANCO.eliminar)) {
      throw new ErrorRespuestaApi(data);
    }

    cacheBancoObtener.clear();
  },
};

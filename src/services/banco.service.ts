import maximilianService, { esRespuestaOkCompatibilidad } from "./maximilianService";
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
    .get<ApiResponse<unknown>>("/api/Banco/obtener", {
      params: {
        IdBanco: params.idBanco,
        Nombre: params.nombre,
      },
    })
    .then(({ data }) => {
      if (!esRespuestaOkCompatibilidad(data, "/api/Banco/obtener")) {
        throw new ErrorRespuestaApi(data);
      }

      const banco = normalizarLista(data.result).lstBanco[0] ?? null;
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
    const { data } = await maximilianService.get<ApiResponse<unknown>>("/api/Banco/listar", {
      params: {
        Busqueda: params.busqueda,
        NumPag: params.numPag,
      },
    });

    if (!esRespuestaOkCompatibilidad(data, "/api/Banco/listar")) {
      throw new ErrorRespuestaApi(data);
    }

    return normalizarLista(data.result);
  },

  obtener: async (params: BancoObtenerParams): Promise<BancoListaItem | null> => {
    return obtenerBanco(params);
  },

  crear: async (payload: BancoCrearRequest): Promise<BancoGuardarResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/Banco/crear", [payload]);

    if (!esRespuestaOkCompatibilidad(data, "/api/Banco/crear")) {
      throw new ErrorRespuestaApi(data);
    }

    cacheBancoObtener.clear();
    return normalizarGuardado(data.result);
  },

  editar: async (payload: BancoEditarRequest): Promise<BancoGuardarResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/Banco/editar", payload);

    if (!esRespuestaOkCompatibilidad(data, "/api/Banco/editar")) {
      throw new ErrorRespuestaApi(data);
    }

    cacheBancoObtener.clear();
    return normalizarGuardado(data.result);
  },

  eliminar: async (payload: BancoEliminarRequest): Promise<void> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/Banco/eliminar", payload);

    if (!esRespuestaOkCompatibilidad(data, "/api/Banco/eliminar")) {
      throw new ErrorRespuestaApi(data);
    }

    cacheBancoObtener.clear();
  },
};

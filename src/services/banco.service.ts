import maximilianService, { esRespuestaOkCompatibilidad } from "./maximilianService";
import type { ApiResponse } from "@maximilian/shared/types/api.type";
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
    nombre: obtenerTexto(registro.nombre, registro.Nombre, registro.banco, registro.Banco) || "-",
    telefono: obtenerTexto(registro.telefono, registro.Telefono) || "-",
    pais: obtenerTexto(registro.pais, registro.Pais, registro.nombrePais, registro.NombrePais) || "-",
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

export const servicioBanco = {
  list: async (params: BancoListParams): Promise<BancoListResponse> => {
    const { data } = await maximilianService.get<ApiResponse<unknown>>("/api/Banco/listar", {
      params: {
        Busqueda: params.busqueda,
        NumPag: params.numPag,
      },
    });

    if (!esRespuestaOkCompatibilidad(data, "/api/Banco/listar")) {
      throw new Error(data.mensaje || "Error al listar los bancos");
    }

    return normalizarLista(data.result);
  },

  obtener: async (params: BancoObtenerParams): Promise<BancoListaItem | null> => {
    const { data } = await maximilianService.get<ApiResponse<unknown>>("/api/Banco/obtener", {
      params: {
        IdBanco: params.idBanco,
        Nombre: params.nombre,
      },
    });

    if (!esRespuestaOkCompatibilidad(data, "/api/Banco/obtener")) {
      throw new Error(data.mensaje || "Error al obtener el banco");
    }

    return normalizarLista(data.result).lstBanco[0] ?? null;
  },

  crear: async (payload: BancoCrearRequest): Promise<BancoGuardarResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/Banco/crear", [payload]);

    if (!esRespuestaOkCompatibilidad(data, "/api/Banco/crear")) {
      throw new Error(data.mensaje || "Error al crear el banco");
    }

    return normalizarGuardado(data.result);
  },

  editar: async (payload: BancoEditarRequest): Promise<BancoGuardarResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/Banco/editar", payload);

    if (!esRespuestaOkCompatibilidad(data, "/api/Banco/editar")) {
      throw new Error(data.mensaje || "Error al editar el banco");
    }

    return normalizarGuardado(data.result);
  },

  eliminar: async (payload: BancoEliminarRequest): Promise<void> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/Banco/eliminar", payload);

    if (!esRespuestaOkCompatibilidad(data, "/api/Banco/eliminar")) {
      throw new Error(data.mensaje || "Error al eliminar el banco");
    }
  },
};

import maximilianService, { esRespuestaOkCompatibilidad } from "./maximilianService";
import type { ApiResponse } from "@maximilian/shared/types/api.type";
import type {
  CompaniaCrearRequest,
  CompaniaEditarRequest,
  CompaniaEliminarRequest,
  CompaniaGuardarResponse,
  CompaniaListaItem,
  CompaniaListParams,
  CompaniaListResponse,
  CompaniaObtenerParams,
} from "@maximilian/shared/types/compania.type";

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

function obtenerBooleano(...valores: unknown[]): boolean {
  for (const valor of valores) {
    if (typeof valor === "boolean") return valor;
    if (typeof valor === "number") return valor === 1;
    if (typeof valor === "string") {
      const texto = valor.trim().toLowerCase();
      if (["1", "true", "si", "sí", "s"].includes(texto)) return true;
      if (["0", "false", "no", "n"].includes(texto)) return false;
    }
  }

  return false;
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

function normalizarCompania(item: unknown): CompaniaListaItem {
  const registro = obtenerRegistro(item);

  return {
    idCompania: obtenerNumero(registro.idCompania, registro.IdCompania) ?? 0,
    idTipoPersona: obtenerNumero(registro.idTipoPersona, registro.IdTipoPersona),
    idTipoDocumento: obtenerNumero(registro.idTipoDocumento, registro.IdTipoDocumento),
    idPais: obtenerNumero(registro.idPais, registro.IdPais),
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
    idCompania: obtenerNumero(registro.idCompania, registro.IdCompania),
  };
}

export const servicioCompania = {
  list: async (params: CompaniaListParams): Promise<CompaniaListResponse> => {
    const { data } = await maximilianService.get<ApiResponse<unknown>>("/api/Compania/listar", {
      params: {
        Busqueda: params.busqueda,
        NumPag: params.numPag,
      },
    });

    if (!esRespuestaOkCompatibilidad(data, "/api/Compania/listar")) {
      throw new Error(data.mensaje || "Error al listar las compañías");
    }

    return normalizarLista(data.result);
  },

  obtener: async (params: CompaniaObtenerParams): Promise<CompaniaListaItem | null> => {
    const { data } = await maximilianService.get<ApiResponse<unknown>>("/api/Compania/obtener", {
      params: {
        IdCompania: params.idCompania,
        NumDocumento: params.numDocumento,
        Nombre: params.nombre,
      },
    });

    if (!esRespuestaOkCompatibilidad(data, "/api/Compania/obtener")) {
      throw new Error(data.mensaje || "Error al obtener la compañía");
    }

    return normalizarLista(data.result).lstCompania[0] ?? null;
  },

  crear: async (payload: CompaniaCrearRequest): Promise<CompaniaGuardarResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/Compania/crear", payload);

    if (!esRespuestaOkCompatibilidad(data, "/api/Compania/crear")) {
      throw new Error(data.mensaje || "Error al crear la compañía");
    }

    return normalizarGuardado(data.result);
  },

  editar: async (payload: CompaniaEditarRequest): Promise<CompaniaGuardarResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/Compania/editar", payload);

    if (!esRespuestaOkCompatibilidad(data, "/api/Compania/editar")) {
      throw new Error(data.mensaje || "Error al editar la compañía");
    }

    return normalizarGuardado(data.result);
  },

  eliminar: async (payload: CompaniaEliminarRequest): Promise<void> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/Compania/eliminar", payload);

    if (!esRespuestaOkCompatibilidad(data, "/api/Compania/eliminar")) {
      throw new Error(data.mensaje || "Error al eliminar la compañía");
    }
  },
};

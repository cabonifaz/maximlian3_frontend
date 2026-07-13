import maximilianService, { esRespuestaOkCompatibilidad } from "./maximilianService";
import { ErrorRespuestaApi, type ApiResponse } from "@maximilian/shared/types/api.type";
import type {
  DirectorioEjecutivoEditarRequest,
  DirectorioEjecutivoEliminarRequest,
  DirectorioEjecutivoGuardarRequest,
  DirectorioEjecutivoGuardarResponse,
  DirectorioEjecutivoListarParams,
  DirectorioEjecutivoListarResponse,
  DirectorioEjecutivoObtenerParams,
} from "@maximilian/shared/types/directorio-ejecutivo.type";
import type { RegistroPersonaDirectorioAnalista } from "@maximilian/shared/types/investigacion.type";

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

function normalizarFechaInput(...valores: unknown[]): string {
  const texto = obtenerTexto(...valores);
  if (!texto) return "";
  return texto.includes("T") ? texto.split("T")[0] : texto;
}

function normalizarRegistroDirectorio(item: unknown): RegistroPersonaDirectorioAnalista {
  const registro = obtenerRegistro(item);
  const idDirectorioEjecutivo = obtenerNumero(
    registro.idDirectorioEjecutivo,
    registro.IdDirectorioEjecutivo,
    registro.id,
    registro.Id,
  ) ?? 0;

  return {
    id: idDirectorioEjecutivo,
    idDirectorioEjecutivo,
    idTipoPersona: obtenerNumero(registro.idTipoPersona, registro.IdTipoPersona),
    tipoPersona: obtenerTexto(registro.tipoPersona, registro.TipoPersona),
    nombres: obtenerTexto(registro.nombreCompleto, registro.NombreCompleto, registro.nombres, registro.Nombres),
    idPais: obtenerNumero(registro.idPais, registro.IdPais),
    pais: obtenerTexto(registro.pais, registro.Pais, registro.nombrePais, registro.NombrePais),
    direccionPrincipal: obtenerTexto(registro.direccion, registro.Direccion),
    ciudadProvinciaEstado: obtenerTexto(registro.ubigeo, registro.Ubigeo),
    codigoPostal: obtenerTexto(registro.codigoPostal, registro.CodigoPostal),
    idNacionalidad: obtenerNumero(registro.idNacionalidad, registro.IdNacionalidad),
    nacionalidad: obtenerTexto(registro.nacionalidad, registro.Nacionalidad),
    idTipoDocumento: obtenerNumero(registro.idTipoDocumento, registro.IdTipoDocumento),
    tipoDocumentoIdentidad: obtenerTexto(registro.tipoDocumento, registro.TipoDocumento),
    numeroDocumentoIdentidad: obtenerTexto(registro.numeroDocumento, registro.NumeroDocumento),
    taxIdType: obtenerNumero(registro.taxIdType, registro.TaxIdType),
    tipoIdFiscal: obtenerTexto(registro.tipoIdFiscal, registro.TipoIdFiscal, registro.taxIdTypeDescripcion, registro.TaxIdTypeDescripcion),
    numeroIdFiscal: obtenerTexto(registro.taxNum, registro.TaxNum),
    fechaNacimiento: normalizarFechaInput(registro.fechaNacimiento, registro.FechaNacimiento),
    idEstadoCivil: obtenerNumero(registro.idEstadoCivil, registro.IdEstadoCivil),
    estadoCivil: obtenerTexto(registro.estadoCivil, registro.EstadoCivil),
    idProfesion: obtenerNumero(registro.idProfesion, registro.IdProfesion),
    profesion: obtenerTexto(registro.profesion, registro.Profesion),
    referenciaAdicional: obtenerTexto(registro.referencias, registro.Referencias),
  };
}

function normalizarListadoDirectorio(resultado: unknown): DirectorioEjecutivoListarResponse {
  if (Array.isArray(resultado)) {
    return {
      registros: resultado.map(normalizarRegistroDirectorio),
      totalRegistros: resultado.length,
      totalPaginas: 1,
    };
  }

  const registro = obtenerRegistro(resultado);
  const lista = obtenerLista(
    registro.lstDirectorioEjecutivo,
    registro.LstDirectorioEjecutivo,
    registro.lstDirectorioEjecutivos,
    registro.LstDirectorioEjecutivos,
    registro.lstDirectoriosEjecutivos,
    registro.LstDirectoriosEjecutivos,
    registro.directorioEjecutivo,
    registro.DirectorioEjecutivo,
    registro.directoriosEjecutivos,
    registro.DirectoriosEjecutivos,
    registro.result,
  );

  return {
    registros: lista.map(normalizarRegistroDirectorio),
    totalRegistros: obtenerNumero(registro.totalRegistros, registro.TotalRegistros, lista.length) ?? 0,
    totalPaginas: obtenerNumero(registro.totalPaginas, registro.TotalPaginas, 1) ?? 1,
  };
}

function normalizarGuardado(resultado: unknown): DirectorioEjecutivoGuardarResponse {
  if (Array.isArray(resultado)) return normalizarGuardado(resultado[0]);

  const registro = obtenerRegistro(resultado);

  return {
    idDirectorioEjecutivo: obtenerNumero(
      registro.idDirectorioEjecutivo,
      registro.IdDirectorioEjecutivo,
      registro.id,
      registro.Id,
    ),
  };
}

const cacheDirectorioObtener = new Map<string, RegistroPersonaDirectorioAnalista | null>();
const solicitudesDirectorioObtener = new Map<string, Promise<RegistroPersonaDirectorioAnalista | null>>();

function obtenerClaveDirectorio(params: DirectorioEjecutivoObtenerParams) {
  return JSON.stringify({
    idDirectorioEjecutivo: params.idDirectorioEjecutivo ?? null,
    nombreCompleto: params.nombreCompleto?.trim() || null,
    numeroDocumento: params.numeroDocumento?.trim() || null,
  });
}

async function obtenerDirectorio(
  params: DirectorioEjecutivoObtenerParams,
): Promise<RegistroPersonaDirectorioAnalista | null> {
  const clave = obtenerClaveDirectorio(params);
  if (cacheDirectorioObtener.has(clave)) return cacheDirectorioObtener.get(clave) ?? null;

  const solicitudExistente = solicitudesDirectorioObtener.get(clave);
  if (solicitudExistente) return solicitudExistente;

  const solicitud = maximilianService
    .get<ApiResponse<unknown>>("/api/DirectorioEjecutivo/obtener", {
      params: {
        IdDirectorioEjecutivo: params.idDirectorioEjecutivo,
        NombreCompleto: params.nombreCompleto,
        NumeroDocumento: params.numeroDocumento,
      },
    })
    .then(({ data }) => {
      if (!esRespuestaOkCompatibilidad(data, "/api/DirectorioEjecutivo/obtener")) {
        throw new ErrorRespuestaApi(data);
      }

      const registro = normalizarListadoDirectorio(data.result).registros[0] ?? null;
      cacheDirectorioObtener.set(clave, registro);
      return registro;
    })
    .finally(() => {
      solicitudesDirectorioObtener.delete(clave);
    });

  solicitudesDirectorioObtener.set(clave, solicitud);
  return solicitud;
}

export const servicioDirectorioEjecutivo = {
  listar: async (params: DirectorioEjecutivoListarParams): Promise<DirectorioEjecutivoListarResponse> => {
    const { data } = await maximilianService.get<ApiResponse<unknown>>("/api/DirectorioEjecutivo/listar", {
      params: {
        Busqueda: params.busqueda,
        NumPag: params.numPag,
      },
    });

    if (!esRespuestaOkCompatibilidad(data, "/api/DirectorioEjecutivo/listar")) {
      throw new ErrorRespuestaApi(data);
    }

    return normalizarListadoDirectorio(data.result);
  },

  obtener: async (params: DirectorioEjecutivoObtenerParams): Promise<RegistroPersonaDirectorioAnalista | null> => {
    return obtenerDirectorio(params);
  },

  crear: async (payload: DirectorioEjecutivoGuardarRequest): Promise<DirectorioEjecutivoGuardarResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/DirectorioEjecutivo/crear", [payload]);

    if (!esRespuestaOkCompatibilidad(data, "/api/DirectorioEjecutivo/crear")) {
      throw new ErrorRespuestaApi(data);
    }

    cacheDirectorioObtener.clear();
    return normalizarGuardado(data.result);
  },

  editar: async (payload: DirectorioEjecutivoEditarRequest): Promise<DirectorioEjecutivoGuardarResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/DirectorioEjecutivo/editar", payload);

    if (!esRespuestaOkCompatibilidad(data, "/api/DirectorioEjecutivo/editar")) {
      throw new ErrorRespuestaApi(data);
    }

    cacheDirectorioObtener.clear();
    return normalizarGuardado(data.result);
  },

  eliminar: async (payload: DirectorioEjecutivoEliminarRequest): Promise<void> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/DirectorioEjecutivo/eliminar", payload);

    if (!esRespuestaOkCompatibilidad(data, "/api/DirectorioEjecutivo/eliminar")) {
      throw new ErrorRespuestaApi(data);
    }

    cacheDirectorioObtener.clear();
  },
};

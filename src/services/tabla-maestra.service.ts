import { ENDPOINTS_TABLA_MAESTRA } from "@maximilian/shared/constants/endpoints/tabla-maestra.endpoint";
import maximilianService from "./maximilian-service";
import { ErrorRespuestaApi, type ApiResponse } from "@maximilian/shared/types/api.type";
import { MessageType } from "@maximilian/shared/types/api.type";
import type {
  EntradaTablaMaestra,
  ParametrosListadoTablaMaestra,
  RespuestaListadoTablaMaestra,
  TablaMaestraCrearRequest,
  TablaMaestraEditarRequest,
  TablaMaestraGuardarResponse,
} from "@maximilian/shared/types/tabla-maestra.type";
import {
  obtenerLista,
  obtenerNumeroOpcional as obtenerNumero,
  obtenerRegistro,
} from "@maximilian/shared/utils/normalizacion-respuesta.util";

function normalizarListadoParametros(
  resultado: unknown,
  idMaestro: number,
): RespuestaListadoTablaMaestra {
  if (Array.isArray(resultado)) {
    return {
      listaTablaMaestra: resultado as EntradaTablaMaestra[],
      totalRegistros: resultado.length,
      totalPaginas: 1,
    };
  }

  const registro = obtenerRegistro(resultado);
  const listaRespuesta = obtenerLista(
    registro.listaTablaMaestra,
    registro.ListaTablaMaestra,
    registro.lstTablaMaestra,
    registro.LstTablaMaestra,
  );
  const grupoSeleccionado = listaRespuesta
    .map(obtenerRegistro)
    .find(
      (grupo) => obtenerNumero(grupo.idMaestro, grupo.IdMaestro) === idMaestro,
    );
  const listaTablaMaestra = grupoSeleccionado
    ? obtenerLista(grupoSeleccionado.items, grupoSeleccionado.Items) as EntradaTablaMaestra[]
    : listaRespuesta as EntradaTablaMaestra[];

  return {
    listaTablaMaestra,
    totalRegistros:
      obtenerNumero(
        registro.totalRegistros,
        registro.TotalRegistros,
        listaTablaMaestra.length,
      ) ?? 0,
    totalPaginas:
      obtenerNumero(registro.totalPaginas, registro.TotalPaginas, 1) ?? 1,
  };
}

export type OpcionesTablaMaestraPorId = Record<number, EntradaTablaMaestra[]>;
type SolicitudTablaMaestra = {
  resolver: (opciones: EntradaTablaMaestra[]) => void;
  rechazar: (error: unknown) => void;
};

const solicitudesPendientes = new Map<number, SolicitudTablaMaestra[]>();
const cacheOpcionesTablaMaestra = new Map<number, EntradaTablaMaestra[]>();
const solicitudesEnCursoPorId = new Map<number, Promise<EntradaTablaMaestra[]>>();
let temporizadorSolicitudes: ReturnType<typeof setTimeout> | null = null;

function normalizarRespuestaGuardado(resultado: unknown): TablaMaestraGuardarResponse {
  if (Array.isArray(resultado)) return normalizarRespuestaGuardado(resultado[0]);

  const registro = obtenerRegistro(resultado);

  return {
    idTablaMaestra: obtenerNumero(registro.idTablaMaestra, registro.IdTablaMaestra),
    idMaestro: obtenerNumero(registro.idMaestro, registro.IdMaestro),
    idIdioma: obtenerNumero(registro.idIdioma, registro.IdIdioma),
    inputText: typeof registro.inputText === "string" ? registro.inputText : undefined,
    inputText2: typeof registro.inputText2 === "string" ? registro.inputText2 : undefined,
    descripcion: typeof registro.descripcion === "string" ? registro.descripcion : undefined,
    num1: obtenerNumero(registro.num1, registro.Num1),
    num2: obtenerNumero(registro.num2, registro.Num2),
    num3: obtenerNumero(registro.num3, registro.Num3),
    string1: typeof registro.string1 === "string" ? registro.string1 : undefined,
    string2: typeof registro.string2 === "string" ? registro.string2 : undefined,
    string3: typeof registro.string3 === "string" ? registro.string3 : undefined,
    string4: typeof registro.string4 === "string" ? registro.string4 : undefined,
    string5: typeof registro.string5 === "string" ? registro.string5 : undefined,
    string6: typeof registro.string6 === "string" ? registro.string6 : undefined,
    string7: typeof registro.string7 === "string" ? registro.string7 : undefined,
    date1: typeof registro.date1 === "string" ? registro.date1 : undefined,
    date2: typeof registro.date2 === "string" ? registro.date2 : undefined,
    date3: typeof registro.date3 === "string" ? registro.date3 : undefined,
  };
}

function agruparOpcionesPorIdMaestro(opciones: EntradaTablaMaestra[], idsMaestro: number[]): OpcionesTablaMaestraPorId {
  const opcionesPorId = idsMaestro.reduce<OpcionesTablaMaestraPorId>((acumulado, idMaestro) => {
    acumulado[idMaestro] = [];
    return acumulado;
  }, {});

  opciones.forEach((opcion) => {
    const idMaestro = opcion.idMaestro;
    if (!opcionesPorId[idMaestro]) opcionesPorId[idMaestro] = [];
    opcionesPorId[idMaestro].push(opcion);
  });

  return opcionesPorId;
}

function normalizarOpcionesPorIdMaestro(resultado: unknown, idsMaestro: number[]): OpcionesTablaMaestraPorId {
  if (Array.isArray(resultado)) {
    const opcionesPorId = idsMaestro.reduce<OpcionesTablaMaestraPorId>((acumulado, idMaestro) => {
      acumulado[idMaestro] = [];
      return acumulado;
    }, {});

    resultado.forEach((item) => {
      const registro = obtenerRegistro(item);
      const idMaestro = obtenerNumero(registro.idMaestro, registro.IdMaestro);
      if (idMaestro && Array.isArray(registro.items)) {
        opcionesPorId[idMaestro] = registro.items as EntradaTablaMaestra[];
      }
    });

    const esRespuestaAgrupada = Object.values(opcionesPorId).some((opciones) => opciones.length > 0);
    return esRespuestaAgrupada ? opcionesPorId : agruparOpcionesPorIdMaestro(resultado as EntradaTablaMaestra[], idsMaestro);
  }

  const registro = obtenerRegistro(resultado);
  const gruposTablaMaestra = obtenerLista(
    registro.lstTablaMaestra,
    registro.LstTablaMaestra,
  ).map(obtenerRegistro);

  if (gruposTablaMaestra.length > 0) {
    return idsMaestro.reduce<OpcionesTablaMaestraPorId>((acumulado, idMaestro) => {
      const grupo = gruposTablaMaestra.find(
        (item) => obtenerNumero(item.idMaestro, item.IdMaestro) === idMaestro,
      );
      acumulado[idMaestro] = obtenerLista(
        grupo?.items,
        grupo?.Items,
      ) as EntradaTablaMaestra[];
      return acumulado;
    }, {});
  }

  return idsMaestro.reduce<OpcionesTablaMaestraPorId>((acumulado, idMaestro) => {
    const opciones = registro[idMaestro] ?? registro[String(idMaestro)];
    acumulado[idMaestro] = Array.isArray(opciones) ? opciones as EntradaTablaMaestra[] : [];
    return acumulado;
  }, {});
}

async function obtenerOpcionesPorIdsMaestro(idsMaestro: number[]): Promise<OpcionesTablaMaestraPorId> {
  const idsUnicos = Array.from(new Set(idsMaestro)).filter((idMaestro) => Number.isFinite(idMaestro));
  if (idsUnicos.length === 0) return {};

  const idsPendientes = idsUnicos.filter((idMaestro) => !cacheOpcionesTablaMaestra.has(idMaestro));
  if (idsPendientes.length === 0) {
    return idsUnicos.reduce<OpcionesTablaMaestraPorId>((acumulado, idMaestro) => {
      acumulado[idMaestro] = cacheOpcionesTablaMaestra.get(idMaestro) ?? [];
      return acumulado;
    }, {});
  }

  const idsSinSolicitud = idsPendientes.filter((idMaestro) => !solicitudesEnCursoPorId.has(idMaestro));

  if (idsSinSolicitud.length > 0) {
    const claveSolicitud = [...idsSinSolicitud].sort((a, b) => a - b).join(",");
    const solicitudEnCurso = maximilianService
      .get<ApiResponse<unknown>>(ENDPOINTS_TABLA_MAESTRA.listar, {
        params: { idsMaestro: claveSolicitud },
      })
      .then(({ data }) => {
        if (data.idTipoMensaje !== MessageType.SUCCESS) {
          throw new ErrorRespuestaApi(data);
        }

        const opcionesPorId = normalizarOpcionesPorIdMaestro(data.result, idsSinSolicitud);
        idsSinSolicitud.forEach((idMaestro) => {
          cacheOpcionesTablaMaestra.set(idMaestro, opcionesPorId[idMaestro] ?? []);
        });
        return opcionesPorId;
      });

    idsSinSolicitud.forEach((idMaestro) => {
      const solicitudIndividual = solicitudEnCurso
        .then((opcionesPorId) => opcionesPorId[idMaestro] ?? [])
        .finally(() => {
          solicitudesEnCursoPorId.delete(idMaestro);
        });
      solicitudesEnCursoPorId.set(idMaestro, solicitudIndividual);
    });
  }

  await Promise.all(idsPendientes.map((idMaestro) => solicitudesEnCursoPorId.get(idMaestro)));

  return idsUnicos.reduce<OpcionesTablaMaestraPorId>((acumulado, idMaestro) => {
    acumulado[idMaestro] = cacheOpcionesTablaMaestra.get(idMaestro) ?? [];
    return acumulado;
  }, {});
}

function despacharSolicitudesPendientes() {
  const solicitudes = Array.from(solicitudesPendientes.entries());
  solicitudesPendientes.clear();
  temporizadorSolicitudes = null;

  const idsMaestro = solicitudes.map(([idMaestro]) => idMaestro);
  obtenerOpcionesPorIdsMaestro(idsMaestro)
    .then((opcionesPorId) => {
      solicitudes.forEach(([idMaestro, callbacks]) => {
        const opciones = opcionesPorId[idMaestro] ?? [];
        callbacks.forEach(({ resolver }) => resolver(opciones));
      });
    })
    .catch((error) => {
      solicitudes.forEach(([, callbacks]) => {
        callbacks.forEach(({ rechazar }) => rechazar(error));
      });
    });
}

function solicitarOpcionesTablaMaestra(idMaestro: number): Promise<EntradaTablaMaestra[]> {
  return new Promise((resolver, rechazar) => {
    const solicitudes = solicitudesPendientes.get(idMaestro) ?? [];
    solicitudes.push({ resolver, rechazar });
    solicitudesPendientes.set(idMaestro, solicitudes);

    if (!temporizadorSolicitudes) {
      temporizadorSolicitudes = setTimeout(despacharSolicitudesPendientes, 0);
    }
  });
}

export const servicioTablaMaestra = {
  list: async (idMaestro: number) => {
    try {
      return await solicitarOpcionesTablaMaestra(idMaestro);
    } catch (error) {
      console.error(`Error fetching TablaMaestra parameters for ID ${idMaestro}:`, error);
      throw error;
    }
  },
  listarPorIds: async (idsMaestro: number[]): Promise<OpcionesTablaMaestraPorId> => {
    const idsUnicos = Array.from(new Set(idsMaestro)).filter((idMaestro) => Number.isFinite(idMaestro));
    if (idsUnicos.length === 0) return {};

    try {
      return await obtenerOpcionesPorIdsMaestro(idsUnicos);
    } catch (error) {
      console.error(`Error fetching TablaMaestra parameters for IDs ${idsUnicos.join(",")}:`, error);
      throw error;
    }
  },
  listarParametros: async ({
    idMaestro,
    numPag,
  }: ParametrosListadoTablaMaestra): Promise<RespuestaListadoTablaMaestra> => {
    const { data } = await maximilianService.get<ApiResponse<unknown>>(
      ENDPOINTS_TABLA_MAESTRA.listar,
      {
        params: {
          idsMaestro: String(idMaestro),
          NumPag: numPag,
        },
      },
    );

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }

    return normalizarListadoParametros(data.result, idMaestro);
  },
  crear: async (payload: TablaMaestraCrearRequest): Promise<TablaMaestraGuardarResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(ENDPOINTS_TABLA_MAESTRA.crear, payload);

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }

    cacheOpcionesTablaMaestra.delete(payload.idMaestro);
    return normalizarRespuestaGuardado(data.result);
  },
  editar: async (payload: TablaMaestraEditarRequest): Promise<TablaMaestraGuardarResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(ENDPOINTS_TABLA_MAESTRA.editar, payload);

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }

    cacheOpcionesTablaMaestra.delete(payload.idMaestro);
    return normalizarRespuestaGuardado(data.result);
  },
};

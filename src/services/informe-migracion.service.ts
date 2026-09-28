import maximilianService from "./maximilian-service";
import { ENDPOINTS_INFORME_MIGRACION } from "@maximilian/shared/constants/endpoints/informe-migracion.endpoint";
import type { ApiResponse } from "@maximilian/shared/types/api.type";
import { ErrorRespuestaApi, MessageType } from "@maximilian/shared/types/api.type";
import type {
  EstadoMigracionInforme,
  ParametrosListaMigracionesInforme,
  RegistroMigracionInforme,
  RespuestaListaMigracionesInforme,
} from "@maximilian/shared/types/informe-migracion.type";
import type {
  InformeCrearRequest,
  InformeCrearResponse,
  InformeObtenerResponse,
} from "@maximilian/shared/types/informe.type";
import {
  obtenerBooleanoFlexible,
  obtenerLista,
  obtenerNumero,
  obtenerNumeroOpcional,
  obtenerRegistro,
  obtenerTexto,
} from "@maximilian/shared/utils/normalizacion-respuesta.util";

function normalizarEstadoMigracion(...valores: unknown[]): EstadoMigracionInforme {
  for (const valor of valores) {
    if (typeof valor === "number") {
      if (valor === 5) return "pendiente-aprobacion";
      if (valor === 4) return "aprobado";
      if (valor === 3) return "en-proceso";
      if (valor === 2) return "rechazado";
      if (valor === 1) return "borrador";
    }

    if (typeof valor === "string") {
      const estado = valor.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (estado.includes("pend") && estado.includes("aprob")) return "pendiente-aprobacion";
      if (estado.includes("aprob")) return "aprobado";
      if (estado.includes("rechaz")) return "rechazado";
      if (estado.includes("proceso")) return "en-proceso";
      if (estado.includes("borrador")) return "borrador";
    }
  }

  return "borrador";
}

function normalizarRegistroMigracion(valor: unknown): RegistroMigracionInforme {
  const registro = obtenerRegistro(valor);
  const idEstado = obtenerNumero(registro.idEstado, registro.IdEstado);
  const estadoDescripcion = obtenerTexto(
    registro.estadoDescripcion,
    registro.EstadoDescripcion,
    registro.estado,
    registro.Estado,
  );

  return {
    idInformeMigracion: obtenerNumero(registro.idInformeMigracion, registro.IdInformeMigracion),
    idInformeMigracionOriginal: obtenerNumeroOpcional(
      registro.idInformeMigracionOriginal,
      registro.IdInformeMigracionOriginal,
    ) ?? null,
    idEstado,
    estado: normalizarEstadoMigracion(idEstado, estadoDescripcion),
    estadoDescripcion: estadoDescripcion || "Borrador",
    investigado: obtenerTexto(registro.investigado, registro.Investigado, registro.nombre, registro.Nombre) || "-",
    pais: obtenerTexto(registro.pais, registro.Pais, registro.nombrePais, registro.NombrePais) || "-",
    plantilla: obtenerTexto(registro.plantilla, registro.Plantilla, registro.nombrePlantilla) || "-",
    idiomaOrigen: obtenerTexto(registro.idiomaOrigen, registro.IdiomaOrigen) || "-",
    idiomaDestino: obtenerTexto(registro.idiomaDestino, registro.IdiomaDestino) || "-",
    creador: obtenerTexto(registro.creador, registro.Creador, registro.usuarioCreador) || "-",
    rolCreador: obtenerTexto(registro.rolCreador, registro.RolCreador) || "-",
    fechaModificacion: obtenerTexto(
      registro.fechaModificacion,
      registro.FechaModificacion,
      registro.fechaCreacion,
      registro.FechaCreacion,
    ) || "-",
    requiereTraduccion: obtenerBooleanoFlexible(
      registro.requiereTraduccion,
      registro.RequiereTraduccion,
    ),
  };
}

function normalizarRespuestaLista(resultado: unknown): RespuestaListaMigracionesInforme {
  const registro = obtenerRegistro(resultado);
  const lista = obtenerLista(
    registro.listaMigraciones,
    registro.ListaMigraciones,
    registro.lstInformeMigracion,
    registro.LstInformeMigracion,
    Array.isArray(resultado) ? resultado : undefined,
  ).map(normalizarRegistroMigracion);

  return {
    listaMigraciones: lista,
    borrador: obtenerNumero(registro.borrador, registro.Borrador),
    enProceso: obtenerNumero(registro.enProceso, registro.EnProceso),
    pendienteAprobacion: obtenerNumero(registro.pendienteAprobacion, registro.PendienteAprobacion),
    aprobado: obtenerNumero(registro.aprobado, registro.Aprobado),
    rechazado: obtenerNumero(registro.rechazado, registro.Rechazado),
    totalRegistros: obtenerNumero(registro.totalRegistros, registro.TotalRegistros, lista.length),
    totalPaginas: obtenerNumero(registro.totalPaginas, registro.TotalPaginas, 1),
  };
}

function construirPayloadMigracion(
  payload: InformeCrearRequest,
  idInformeMigracion?: number,
) {
  const contenido = { ...payload } as Partial<InformeCrearRequest> & {
    idInformeMigracion?: number;
  };
  delete contenido.idPedido;
  delete contenido.idInforme;
  if (idInformeMigracion && idInformeMigracion > 0) {
    contenido.idInformeMigracion = idInformeMigracion;
  }
  return contenido;
}

function normalizarRespuestaGuardado(resultado: unknown): InformeCrearResponse {
  const registro = obtenerRegistro(resultado);
  return {
    idInforme: obtenerNumero(
      registro.idInformeMigracion,
      registro.IdInformeMigracion,
      registro.idInforme,
      registro.IdInforme,
      resultado,
    ),
    imagenesPendientes: obtenerLista(
      registro.imagenesPendientes,
      registro.ImagenesPendientes,
    ) as InformeCrearResponse["imagenesPendientes"],
  };
}

export const servicioInformeMigracion = {
  listar: async (
    parametros: ParametrosListaMigracionesInforme,
    senal?: AbortSignal,
  ): Promise<RespuestaListaMigracionesInforme> => {
    const { data } = await maximilianService.get<ApiResponse<unknown>>(
      ENDPOINTS_INFORME_MIGRACION.listar,
      {
        params: {
          Busqueda: parametros.busqueda,
          IdEstado: parametros.idEstado,
          IdPlantilla: parametros.idPlantilla,
          NumPag: parametros.numPag,
          SoloPendientesAprobacion: parametros.soloPendientesAprobacion,
        },
        signal: senal,
      },
    );

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }

    return normalizarRespuestaLista(data.result);
  },
  crear: async (payload: InformeCrearRequest): Promise<InformeCrearResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(
      ENDPOINTS_INFORME_MIGRACION.crear,
      construirPayloadMigracion(payload),
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(data);
    return normalizarRespuestaGuardado(data.result);
  },
  editar: async (
    idInformeMigracion: number,
    payload: InformeCrearRequest,
  ): Promise<InformeCrearResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(
      ENDPOINTS_INFORME_MIGRACION.editar,
      construirPayloadMigracion(payload, idInformeMigracion),
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(data);
    return normalizarRespuestaGuardado(data.result);
  },
  obtener: async (idInformeMigracion: number): Promise<InformeObtenerResponse> => {
    const { data } = await maximilianService.get<ApiResponse<InformeObtenerResponse>>(
      ENDPOINTS_INFORME_MIGRACION.obtener,
      { params: { IdInformeMigracion: idInformeMigracion } },
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(data);
    return {
      ...data.result,
      idInforme: idInformeMigracion,
    };
  },
};

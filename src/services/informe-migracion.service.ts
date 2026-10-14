import maximilianService from "./maximilian-service";
import { ENDPOINTS_INFORME_MIGRACION } from "@maximilian/shared/constants/endpoints/informe-migracion.endpoint";
import type { ApiResponse } from "@maximilian/shared/types/api.type";
import { ErrorRespuestaApi, MessageType } from "@maximilian/shared/types/api.type";
import type {
  EstadoMigracionInforme,
  CrearLoteMigracionRespuesta,
  CrearLoteMigracionSolicitud,
  ParametrosListaMigracionesInforme,
  RegistroLoteMigracion,
  RegistroMigracionInforme,
  RespuestaListaLotesMigracion,
  RespuestaListaMigracionesInforme,
  RolMigracionInforme,
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

function obtenerPermisoMigracion(...valores: unknown[]): boolean {
  const valorInformado = valores.find((valor) => valor !== undefined && valor !== null);
  return valorInformado == null ? true : obtenerBooleanoFlexible(valorInformado);
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
    idPais: obtenerNumeroOpcional(registro.idPais, registro.IdPais) ?? null,
    pais: obtenerTexto(registro.pais, registro.Pais, registro.nombrePais, registro.NombrePais) || "-",
    idPlantilla: obtenerNumeroOpcional(registro.idPlantilla, registro.IdPlantilla) ?? null,
    plantilla: obtenerTexto(registro.plantilla, registro.Plantilla, registro.nombrePlantilla) || "-",
    idIdiomaOrigen: obtenerNumeroOpcional(registro.idIdiomaOrigen, registro.IdIdiomaOrigen) ?? null,
    idiomaOrigen: obtenerTexto(registro.idiomaOrigen, registro.IdiomaOrigen) || "-",
    idIdiomaDestino: obtenerNumeroOpcional(registro.idIdiomaDestino, registro.IdIdiomaDestino) ?? null,
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
    permisos: {
      puedeVer: obtenerPermisoMigracion(registro.puedeVer, registro.PuedeVer),
      puedeEditar: obtenerPermisoMigracion(registro.puedeEditar, registro.PuedeEditar),
      puedeEnviar: obtenerPermisoMigracion(registro.puedeEnviar, registro.PuedeEnviar),
    },
  };
}

function normalizarLoteMigracion(valor: unknown): RegistroLoteMigracion {
  const registro = obtenerRegistro(valor);
  return {
    idLote: obtenerTexto(registro.idLote, registro.IdLote),
    nombre: obtenerTexto(registro.nombre, registro.Nombre),
    estado: obtenerTexto(registro.estado, registro.Estado).toLowerCase().replaceAll("_", "-") as RegistroLoteMigracion["estado"],
    estadoDescripcion: obtenerTexto(registro.estadoDescripcion, registro.EstadoDescripcion),
    total: obtenerNumero(registro.total, registro.Total),
    completados: obtenerNumero(registro.completados, registro.Completados),
    fallidos: obtenerNumero(registro.fallidos, registro.Fallidos),
    fechaCreacion: obtenerTexto(registro.fechaCreacion, registro.FechaCreacion),
    puedeReintentar: obtenerBooleanoFlexible(registro.puedeReintentar, registro.PuedeReintentar),
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
    puedeCrear: obtenerPermisoMigracion(registro.puedeCrear, registro.PuedeCrear),
    puedeCrearLote: obtenerPermisoMigracion(registro.puedeCrearLote, registro.PuedeCrearLote),
  };
}

function construirPayloadMigracion(
  payload: InformeCrearRequest,
  idPlantilla?: number,
  idInformeMigracion?: number,
  idIdiomaOrigen?: number,
  idIdiomaDestino?: number,
) {
  const contenido = { ...payload, idPlantilla } as Partial<InformeCrearRequest> & {
    idPlantilla?: number;
    idInformeMigracion?: number;
    idIdiomaOrigen?: number;
    idIdiomaDestino?: number;
  };
  delete contenido.idPedido;
  delete contenido.idInforme;
  if (idInformeMigracion && idInformeMigracion > 0) {
    contenido.idInformeMigracion = idInformeMigracion;
  }
  if (idIdiomaOrigen && idIdiomaOrigen > 0) contenido.idIdiomaOrigen = idIdiomaOrigen;
  if (idIdiomaDestino && idIdiomaDestino > 0) contenido.idIdiomaDestino = idIdiomaDestino;
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
        },
        signal: senal,
      },
    );

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }

    return normalizarRespuestaLista(data.result);
  },
  crear: async (payload: InformeCrearRequest, idPlantilla?: number, idIdiomaOrigen?: number, idIdiomaDestino?: number): Promise<InformeCrearResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(
      ENDPOINTS_INFORME_MIGRACION.crear,
      construirPayloadMigracion(payload, idPlantilla, undefined, idIdiomaOrigen, idIdiomaDestino),
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(data);
    return normalizarRespuestaGuardado(data.result);
  },
  editar: async (
    idInformeMigracion: number,
    payload: InformeCrearRequest,
    idPlantilla?: number,
    idIdiomaOrigen?: number,
    idIdiomaDestino?: number,
  ): Promise<InformeCrearResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(
      ENDPOINTS_INFORME_MIGRACION.editar,
      construirPayloadMigracion(payload, idPlantilla, idInformeMigracion, idIdiomaOrigen, idIdiomaDestino),
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
    const registro = obtenerRegistro(data.result);
    return {
      ...data.result,
      idInforme: idInformeMigracion,
      idPlantilla: obtenerNumeroOpcional(registro.idPlantilla, registro.IdPlantilla),
      permisosMigracion: {
        puedeVer: obtenerPermisoMigracion(registro.puedeVer, registro.PuedeVer),
        puedeEditar: obtenerPermisoMigracion(registro.puedeEditar, registro.PuedeEditar),
        puedeEnviar: obtenerPermisoMigracion(registro.puedeEnviar, registro.PuedeEnviar),
      },
    };
  },
  crearLote: async (solicitud: CrearLoteMigracionSolicitud): Promise<CrearLoteMigracionRespuesta> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(
      ENDPOINTS_INFORME_MIGRACION.crearLote,
      solicitud,
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(data);
    const registro = obtenerRegistro(data.result);
    return {
      idLote: obtenerTexto(registro.idLote, registro.IdLote),
      archivos: obtenerLista(registro.archivos, registro.Archivos).map((archivo) => {
        const registroArchivo = obtenerRegistro(archivo);
        return {
          nombre: obtenerTexto(registroArchivo.nombre, registroArchivo.Nombre),
          urlCarga: obtenerTexto(registroArchivo.urlCarga, registroArchivo.UrlCarga),
        };
      }),
    };
  },
  subirArchivoLote: async (urlCarga: string, archivo: File): Promise<void> => {
    await fetch(urlCarga, {
      method: "PUT",
      headers: { "Content-Type": archivo.type },
      body: archivo,
    }).then((respuesta) => {
      if (!respuesta.ok) throw new Error("No se pudo cargar el documento");
    });
  },
  iniciarLote: async (idLote: string): Promise<void> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(
      ENDPOINTS_INFORME_MIGRACION.iniciarLote,
      { idLote },
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(data);
  },
  listarLotes: async (rol: RolMigracionInforme, senal?: AbortSignal): Promise<RespuestaListaLotesMigracion> => {
    const { data } = await maximilianService.get<ApiResponse<unknown>>(
      ENDPOINTS_INFORME_MIGRACION.listarLotes,
      { params: { rol }, signal: senal },
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(data);
    const registro = obtenerRegistro(data.result);
    return { lotes: obtenerLista(registro.lotes, registro.Lotes).map(normalizarLoteMigracion) };
  },
  reintentarLote: async (idLote: string): Promise<void> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(
      ENDPOINTS_INFORME_MIGRACION.reintentarLote,
      { idLote },
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(data);
  },
};

import { ENDPOINTS_PEDIDO } from "@maximilian/shared/constants/endpoints/pedido.endpoint";
import maximilianService from "./maximilianService";
import { ErrorRespuestaApi, type ApiResponse } from "@maximilian/shared/types/api.type";
import { MessageType } from "@maximilian/shared/types/api.type";
import type {
  PedidoListParams,
  PedidoListResponse,
  PedidoListEntry,
  PedidoAsignacionEntry,
  PedidoAccionRequest,
  CreatePedidoRequest,
  CreatePedidoResponse,
  GetPedidoResponse,
  UpdatePedidoRequest,
  PedidoArchivoListResponse,
  AddPedidoArchivosRequest,
  DeletePedidoArchivoRequest,
  GetPedidoArchivoResponse,
} from "@maximilian/shared/types/pedido.type";

function obtenerNumero(...valores: unknown[]): number {
  for (const valor of valores) {
    if (typeof valor === "number" && Number.isFinite(valor)) return valor;
    if (typeof valor === "string" && valor.trim() !== "") {
      const numero = Number(valor);
      if (Number.isFinite(numero)) return numero;
    }
  }

  return 0;
}

function obtenerNumeroOpcional(...valores: unknown[]): number | undefined {
  for (const valor of valores) {
    if (typeof valor === "number" && Number.isFinite(valor)) return valor;
    if (typeof valor === "string" && valor.trim() !== "") {
      const numero = Number(valor);
      if (Number.isFinite(numero)) return numero;
    }
  }

  return undefined;
}

function obtenerIndicadorBinario(...valores: unknown[]): 0 | 1 {
  for (const valor of valores) {
    if (valor === 1 || valor === "1" || valor === true) return 1;
    if (valor === 0 || valor === "0" || valor === false) return 0;
  }

  return 0;
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
      if (texto === "true" || texto === "1") return true;
      if (texto === "false" || texto === "0") return false;
    }
  }

  return false;
}

function normalizarAsignaciones(valor: unknown): PedidoAsignacionEntry[] {
  if (!Array.isArray(valor)) return [];

  return valor.map((item) => {
    const registro = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};

    return {
      idEstadoAsignacion: obtenerNumero(
        registro.idEstadoAsignacion,
        registro.IdEstadoAsignacion,
        registro.idEstado,
        registro.IdEstado,
      ),
      descripcion: obtenerTexto(
        registro.descripcion,
        registro.descripcionAsignacion,
        registro.descripcionEstado,
        registro.estadoDescripcion,
        registro.Descripcion,
        registro.DescripcionAsignacion,
      ) || "-",
      idEstadoInforme: obtenerNumeroOpcional(registro.idEstadoInforme, registro.IdEstadoInforme) ?? null,
      descripcionEstadoInforme: obtenerTexto(
        registro.descripcionEstadoInforme,
        registro.DescripcionEstadoInforme,
        registro.estadoInforme,
        registro.EstadoInforme,
      ) || null,
    };
  });
}

function normalizarFilaPedido(fila: unknown): PedidoListEntry {
  const registro = typeof fila === "object" && fila !== null ? (fila as Record<string, unknown>) : {};

  return {
    idPedido: obtenerNumero(registro.idPedido, registro.IdPedido),
    idAsignacion: obtenerNumero(registro.idAsignacion, registro.IdAsignacion),
    fechaMod: obtenerTexto(registro.fechaMod, registro.FechaMod, registro.fechaModificacion, registro.FechaModificacion),
    codigo: obtenerTexto(registro.codigo, registro.Codigo),
    idCliente: obtenerNumero(registro.idCliente, registro.IdCliente),
    cliente: obtenerTexto(registro.cliente, registro.nombre, registro.nombreCliente, registro.Cliente) || "-",
    investigado: obtenerTexto(
      registro.investigado,
      registro.investigarRazonSocialNombres,
      registro.nombreInvestigado,
      registro.Investigado,
    ) || "-",
    idIdioma: obtenerNumero(registro.idIdioma, registro.IdIdioma),
    idioma: obtenerTexto(registro.idioma, registro.idiomaInforme, registro.Idioma) || "-",
    tipoTramite: obtenerTexto(registro.tipoTramite, registro.TipoTramite) || "-",
    analista: obtenerTexto(registro.analista, registro.nombreAnalista, registro.usuarioAnalista, registro.analistaAsignado),
    traductor: obtenerTexto(registro.traductor, registro.nombreTraductor, registro.usuarioTraductor, registro.traductorAsignado),
    logoImprimible: obtenerBooleano(registro.logoImprimible, registro.imprimeLogoSafety, registro.LogoImprimible),
    estado: obtenerNumero(registro.estado, registro.idEstado, registro.IdEstado),
    descripcionEstado: obtenerTexto(registro.descripcionEstado, registro.estadoDescripcion, registro.estado, registro.Estado) || "-",
    colorLetra: obtenerTexto(registro.colorLetra, registro.estadoColorLetra, registro.ColorLetra) || "#475569",
    colorFondo: obtenerTexto(registro.colorFondo, registro.estadoColorFondo, registro.ColorFondo) || "#f1f5f9",
    idFase: obtenerNumeroOpcional(registro.idFase, registro.IdFase),
    requiereTraduccion: obtenerIndicadorBinario(registro.requiereTraduccion, registro.RequiereTraduccion),
    vigencia: obtenerTexto(registro.vigencia, registro.Vigencia) || String(obtenerNumero(registro.vigencia, registro.Vigencia)),
    asignaciones: normalizarAsignaciones(registro.asignaciones ?? registro.Asignaciones),
  };
}

function normalizarRespuestaPedido(resultado: PedidoListResponse | Record<string, unknown>): PedidoListResponse {
  const registro = typeof resultado === "object" && resultado !== null ? resultado : {};
  const respuesta = registro as Record<string, unknown>;
  const listaOriginal = Array.isArray(respuesta.lstPedido)
    ? (respuesta.lstPedido as unknown[])
    : [];

  return {
    lstPedido: listaOriginal.map(normalizarFilaPedido),
    pendiente: obtenerNumero(respuesta.pendiente, respuesta.Pendiente),
    enRevision: obtenerNumero(respuesta.enRevision, respuesta.EnRevision),
    aprobado: obtenerNumero(respuesta.aprobado, respuesta.Aprobado),
    observado: obtenerNumero(respuesta.observado, respuesta.Observado),
    cancelado: obtenerNumero(respuesta.cancelado, respuesta.Cancelado),
    totalRegistros: obtenerNumero(
      respuesta.totalRegistros,
      respuesta.TotalRegistros,
      listaOriginal.length,
    ),
    totalPaginas: obtenerNumero(
      respuesta.totalPaginas,
      respuesta.TotalPaginas,
      1,
    ),
  };
}

export const pedidoService = {
  list: async (params: PedidoListParams): Promise<PedidoListResponse> => {
    try {
      const { data } = await maximilianService.get<ApiResponse<PedidoListResponse>>(
        ENDPOINTS_PEDIDO.listar,
        { params }
      );
      if (data.idTipoMensaje !== MessageType.SUCCESS) {
        throw new ErrorRespuestaApi(data);
      }

      return normalizarRespuestaPedido(data.result);
    } catch (error) {
      console.error("Error listing pedidos:", error);
      throw error;
    }
  },

  listAsignacion: async (params: PedidoListParams): Promise<PedidoListResponse> => {
    try {
      const { data } = await maximilianService.get<ApiResponse<PedidoListResponse>>(
        ENDPOINTS_PEDIDO.listarAsignacion,
        { params }
      );
      if (data.idTipoMensaje !== MessageType.SUCCESS) {
        throw new ErrorRespuestaApi(data);
      }

      return normalizarRespuestaPedido(data.result);
    } catch (error) {
      console.error("Error listing pedidos for assignment:", error);
      throw error;
    }
  },

  cancelar: async (data: PedidoAccionRequest): Promise<void> => {
    const { data: res } = await maximilianService.post<ApiResponse<null>>(ENDPOINTS_PEDIDO.cancelar, data);
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(res);
  },

  eliminar: async (data: PedidoAccionRequest): Promise<void> => {
    const { data: res } = await maximilianService.post<ApiResponse<null>>(ENDPOINTS_PEDIDO.eliminar, data);
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(res);
  },

  create: async (data: CreatePedidoRequest): Promise<CreatePedidoResponse> => {
    const { data: res } = await maximilianService.post<ApiResponse<CreatePedidoResponse[]>>(
      ENDPOINTS_PEDIDO.crear,
      data
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(res);
    return res.result[0];
  },

  getById: async (idPedido: number): Promise<GetPedidoResponse> => {
    const { data } = await maximilianService.get<ApiResponse<GetPedidoResponse[]>>(
      ENDPOINTS_PEDIDO.obtener,
      { params: { idPedido } }
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(data);
    return data.result[0];
  },

  update: async (data: UpdatePedidoRequest): Promise<void> => {
    const { data: res } = await maximilianService.post<ApiResponse<null>>(
      ENDPOINTS_PEDIDO.editar,
      data
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(res);
  },

  listArchivos: async (params: { idPedido: number; busqueda?: string; numPag?: number }): Promise<PedidoArchivoListResponse> => {
    const { data } = await maximilianService.get<ApiResponse<PedidoArchivoListResponse>>(
      ENDPOINTS_PEDIDO.listarArchivos,
      { params: { IdPedido: params.idPedido, Busqueda: params.busqueda, NumPag: params.numPag } }
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(data);
    return data.result;
  },

  addArchivos: async (data: AddPedidoArchivosRequest): Promise<CreatePedidoResponse["archivos"]> => {
    const { data: res } = await maximilianService.post<ApiResponse<CreatePedidoResponse["archivos"]>>(
      ENDPOINTS_PEDIDO.crearArchivo,
      data
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(res);
    return res.result;
  },

  deleteArchivo: async (data: DeletePedidoArchivoRequest): Promise<void> => {
    const { data: res } = await maximilianService.post<ApiResponse<null>>(
      ENDPOINTS_PEDIDO.eliminarArchivo,
      data
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(res);
  },

  getArchivo: async (params: { idPedidoArchivo: number; idPedido: number }): Promise<GetPedidoArchivoResponse> => {
    const { data } = await maximilianService.get<ApiResponse<GetPedidoArchivoResponse[]>>(
      ENDPOINTS_PEDIDO.obtenerArchivo,
      { params: { IdPedidoArchivo: params.idPedidoArchivo, IdPedido: params.idPedido } }
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) throw new ErrorRespuestaApi(data);
    return data.result[0];
  },
};

import { ENDPOINTS_PEDIDO } from "@maximilian/shared/constants/endpoints/pedido.endpoint";
import maximilianService from "./maximilian-service";
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
import {
  obtenerBooleanoFlexible,
  obtenerIndicadorBinario,
  obtenerLista,
  obtenerNumero,
  obtenerNumeroOpcional,
  obtenerRegistro,
  obtenerTexto,
} from "@maximilian/shared/utils/normalizacion-respuesta.util";

function normalizarAsignaciones(valor: unknown): PedidoAsignacionEntry[] {
  if (!Array.isArray(valor)) return [];

  return valor.map((item) => {
    const registro = obtenerRegistro(item);

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
  const registro = obtenerRegistro(fila);
  const idPedido = obtenerNumero(registro.idPedido, registro.IdPedido);

  return {
    idPedido,
    idAsignacion: obtenerNumero(registro.idAsignacion, registro.IdAsignacion),
    fechaMod: obtenerTexto(registro.fechaMod, registro.FechaMod, registro.fechaModificacion, registro.FechaModificacion),
    codigo: obtenerTexto(registro.codigo, registro.Codigo) || String(idPedido),
    idCliente: obtenerNumero(registro.idCliente, registro.IdCliente),
    cliente: obtenerTexto(registro.cliente, registro.nombre, registro.nombreCliente, registro.Cliente) || "-",
    investigado: obtenerTexto(
      registro.investigado,
      registro.investigarRazonSocialNombres,
      registro.nombreInvestigado,
      registro.Investigado,
    ) || "-",
    idIdioma: obtenerNumeroOpcional(registro.idIdioma, registro.IdIdioma),
    idioma: obtenerTexto(registro.idioma, registro.idiomaInforme, registro.Idioma) || "-",
    tipoTramite: obtenerTexto(registro.tipoTramite, registro.TipoTramite) || "-",
    analista: obtenerTexto(registro.analista, registro.nombreAnalista, registro.usuarioAnalista, registro.analistaAsignado),
    traductor: obtenerTexto(registro.traductor, registro.nombreTraductor, registro.usuarioTraductor, registro.traductorAsignado),
    logoImprimible: obtenerBooleanoFlexible(registro.logoImprimible, registro.imprimeLogoSafety, registro.LogoImprimible),
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
  const respuesta = obtenerRegistro(resultado);
  const listaOriginal = obtenerLista(respuesta.lstPedido, respuesta.LstPedido);

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

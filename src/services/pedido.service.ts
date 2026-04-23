import maximilianService from "./maximilianService";
import type { ApiResponse } from "@maximilian/shared/types/api.type";
import { MessageType } from "@maximilian/shared/types/api.type";
import type {
  PedidoListParams,
  PedidoListResponse,
  PedidoListEntry,
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

function normalizarFilaPedido(fila: unknown): PedidoListEntry {
  const registro = typeof fila === "object" && fila !== null ? (fila as Record<string, unknown>) : {};

  return {
    idPedido: obtenerNumero(registro.idPedido, registro.IdPedido),
    idAsignacion: obtenerNumero(registro.idAsignacion, registro.IdAsignacion),
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
    vigencia: obtenerTexto(registro.vigencia, registro.Vigencia) || String(obtenerNumero(registro.vigencia, registro.Vigencia)),
  };
}

function normalizarRespuestaPedido(resultado: PedidoListResponse | Record<string, unknown>): PedidoListResponse {
  const registro = typeof resultado === "object" && resultado !== null ? resultado : {};
  const listaOriginal = Array.isArray((registro as Record<string, unknown>).lstPedido)
    ? ((registro as Record<string, unknown>).lstPedido as unknown[])
    : [];

  return {
    lstPedido: listaOriginal.map(normalizarFilaPedido),
    totalRegistros: obtenerNumero(
      (registro as Record<string, unknown>).totalRegistros,
      (registro as Record<string, unknown>).TotalRegistros,
      listaOriginal.length,
    ),
    totalPaginas: obtenerNumero(
      (registro as Record<string, unknown>).totalPaginas,
      (registro as Record<string, unknown>).TotalPaginas,
      1,
    ),
  };
}

export const pedidoService = {
  list: async (params: PedidoListParams): Promise<PedidoListResponse> => {
    try {
      const { data } = await maximilianService.get<ApiResponse<PedidoListResponse>>(
        "/api/Pedido/listar",
        { params }
      );
      if (data.idTipoMensaje !== MessageType.SUCCESS) {
        throw new Error(data.mensaje || "Error al listar los pedidos");
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
        "/api/Pedido/listarAsignacion",
        { params }
      );
      if (data.idTipoMensaje !== MessageType.SUCCESS) {
        throw new Error(data.mensaje || "Error al listar los pedidos para asignacion");
      }

      return normalizarRespuestaPedido(data.result);
    } catch (error) {
      console.error("Error listing pedidos for assignment:", error);
      throw error;
    }
  },

  cancelar: async (data: PedidoAccionRequest): Promise<void> => {
    const { data: res } = await maximilianService.post<ApiResponse<null>>("/api/Pedido/cancelar", data);
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new Error(res.mensaje);
  },

  eliminar: async (data: PedidoAccionRequest): Promise<void> => {
    const { data: res } = await maximilianService.post<ApiResponse<null>>("/api/Pedido/eliminar", data);
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new Error(res.mensaje);
  },

  create: async (data: CreatePedidoRequest): Promise<CreatePedidoResponse> => {
    const { data: res } = await maximilianService.post<ApiResponse<CreatePedidoResponse[]>>(
      "/api/Pedido/crear",
      data
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new Error(res.mensaje);
    return res.result[0];
  },

  getById: async (idPedido: number): Promise<GetPedidoResponse> => {
    const { data } = await maximilianService.get<ApiResponse<GetPedidoResponse[]>>(
      "/api/Pedido/obtener",
      { params: { idPedido } }
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) throw new Error(data.mensaje);
    return data.result[0];
  },

  update: async (data: UpdatePedidoRequest): Promise<void> => {
    const { data: res } = await maximilianService.post<ApiResponse<null>>(
      "/api/Pedido/editar",
      data
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new Error(res.mensaje);
  },

  listArchivos: async (params: { idPedido: number; busqueda?: string; numPag?: number }): Promise<PedidoArchivoListResponse> => {
    const { data } = await maximilianService.get<ApiResponse<PedidoArchivoListResponse>>(
      "/api/PedidoArchivo/listar",
      { params: { IdPedido: params.idPedido, Busqueda: params.busqueda, NumPag: params.numPag } }
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) throw new Error(data.mensaje);
    return data.result;
  },

  addArchivos: async (data: AddPedidoArchivosRequest): Promise<CreatePedidoResponse["archivos"]> => {
    const { data: res } = await maximilianService.post<ApiResponse<CreatePedidoResponse["archivos"]>>(
      "/api/PedidoArchivo/crear",
      data
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new Error(res.mensaje);
    return res.result;
  },

  deleteArchivo: async (data: DeletePedidoArchivoRequest): Promise<void> => {
    const { data: res } = await maximilianService.post<ApiResponse<null>>(
      "/api/PedidoArchivo/eliminar",
      data
    );
    if (res.idTipoMensaje !== MessageType.SUCCESS) throw new Error(res.mensaje);
  },

  getArchivo: async (params: { idPedidoArchivo: number; idPedido: number }): Promise<GetPedidoArchivoResponse> => {
    const { data } = await maximilianService.get<ApiResponse<GetPedidoArchivoResponse[]>>(
      "/api/PedidoArchivo/obtener",
      { params: { IdPedidoArchivo: params.idPedidoArchivo, IdPedido: params.idPedido } }
    );
    if (data.idTipoMensaje !== MessageType.SUCCESS) throw new Error(data.mensaje);
    return data.result[0];
  },
};

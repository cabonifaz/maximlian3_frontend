import type {
  DetalleFactura,
  EntradaFacturaCliente,
  EntradaFacturacion,
  EntradaFacturacionApi,
  EntradaPedidoFacturacionApi,
  EntradaProductoFacturable,
  EntradaProductoFacturableApi,
  GuardarBorradorFacturaRequest,
  ParametrosListaFacturacion,
  ParametrosListaPedidosFacturacion,
  ParametrosListaProductosFacturables,
  RespuestaListaFacturasCliente,
  RespuestaListaFacturacion,
  RespuestaListaProductosFacturables,
  ResultadoListaFacturacionApi,
  ResultadoListaPedidosFacturacionApi,
  ResultadoListaProductosFacturablesApi,
} from "@maximilian/shared/types/facturacion.type";
import { ENDPOINTS_FACTURACION } from "@maximilian/shared/constants/endpoints/facturacion.endpoint";
import {
  ErrorRespuestaApi,
  MessageType,
  type ApiResponse,
} from "@maximilian/shared/types/api.type";
import maximilianService from "./maximilian-service";
import { formatearFechaDdMmYyyy } from "@maximilian/shared/utils/fecha.util";
import { servicioCliente } from "./cliente.service";

function mapearFacturacion(
  facturacion: EntradaFacturacionApi,
): EntradaFacturacion {
  const estados = {
    Finalizado: "finalizado",
    Pendiente: "pendiente",
    "En pre-factura": "en-pre-factura",
  } as const;

  return {
    idFacturacion: facturacion.idCliente,
    cliente: facturacion.nombre,
    prefacturable:
      facturacion.emitirPrefactura === null
        ? null
        : facturacion.emitirPrefactura === "Si",
    totalPedidos: facturacion.totalPedidos,
    totalFacturados: facturacion.pedidosFacturados,
    idioma: facturacion.idIdiomaFacturacion,
    estado: estados[facturacion.estadoFacturacion],
  };
}

function mapearPedidoFacturacion(
  pedido: EntradaPedidoFacturacionApi,
): EntradaFacturaCliente {
  const estados = {
    Pendiente: { estado: "pendiente", codigoEstado: 1 },
    "En pre-factura": { estado: "en-pre-factura", codigoEstado: 2 },
    "Pre-factura aprobada": {
      estado: "pre-factura-aprobada",
      codigoEstado: 3,
    },
    "Pre-factura rechazada": {
      estado: "pre-factura-rechazada",
      codigoEstado: 4,
    },
    Finalizado: { estado: "finalizado", codigoEstado: 5 },
    Anulado: { estado: "anulado", codigoEstado: 6 },
  } as const;
  const estado = estados[pedido.estadoFacturacion];

  return {
    idFactura: pedido.idPedido,
    codigo: pedido.codigo,
    investigado: pedido.investigado ?? "",
    penalidad: pedido.aplicaPenalidad === "Si",
    codigoEstado: estado.codigoEstado,
    estado: estado.estado,
  };
}

function convertirPorcentajeANumero(porcentaje: string) {
  const valor = Number(porcentaje.trim().replace("%", ""));
  return Number.isNaN(valor) ? 0 : valor;
}

function mapearProductoFacturable(
  pedido: EntradaProductoFacturableApi,
): EntradaProductoFacturable {
  const tipoNormalizado = pedido.tipoTramite
    .trim()
    .toLowerCase()
    .replaceAll(" ", "-");
  const tipo = tipoNormalizado === "express" || tipoNormalizado === "super-flash"
    ? tipoNormalizado
    : "normal";

  return {
    idProductoFacturable: pedido.idPedido,
    codigo: pedido.codigo,
    investigado: pedido.investigado,
    aplicaPenalidad: pedido.aplicaPenalidad === "Si",
    tipo,
    fecha: pedido.fecha,
    penalidad: pedido.penalidad,
    precio: pedido.precio,
    descuentoPorcentaje: convertirPorcentajeANumero(
      pedido.descuentoPorcentaje,
    ),
  };
}

function crearDetalleFactura(
  idCliente: number,
  cliente: string,
  numeroIdentificacion: string,
  factura?: EntradaFacturaCliente | null,
): DetalleFactura {
  return {
    idFactura: factura?.idFactura ?? null,
    idCliente,
    cliente,
    ni: numeroIdentificacion,
    ordenCompra: "",
    fechaEmision: formatearFechaDdMmYyyy(new Date()),
    productos: [],
    cuotas: [],
  };
}

export const facturacionService = {
  list: async (
    params: ParametrosListaFacturacion,
  ): Promise<RespuestaListaFacturacion> => {
    const { data } = await maximilianService.get<
      ApiResponse<ResultadoListaFacturacionApi>
    >(ENDPOINTS_FACTURACION.listar, {
      params: {
        numPag: params.numPag,
        busqueda: params.busqueda,
        emitirPrefactura: params.emitirPrefactura,
        idIdiomaFacturacion: params.idIdiomaFacturacion,
        estadoFacturacion: params.estadoFacturacion,
      },
    });

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }

    return {
      lstFacturacion: data.result.lstClientes.map(mapearFacturacion),
      totalRegistros: data.result.totalRegistros,
      totalPaginas: data.result.totalPaginas,
    };
  },

  listarFacturasCliente: async (
    params: ParametrosListaPedidosFacturacion,
  ): Promise<RespuestaListaFacturasCliente> => {
    const { data } = await maximilianService.get<
      ApiResponse<ResultadoListaPedidosFacturacionApi>
    >(ENDPOINTS_FACTURACION.listarPedidos, {
      params: {
        idCliente: params.idCliente,
        busqueda: params.busqueda,
        numPag: params.numPag,
      },
    });

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }

    return {
      lstFacturas: data.result.lstPedidos.map(mapearPedidoFacturacion),
      totalRegistros: data.result.totalRegistros,
      totalPaginas: data.result.totalPaginas,
    };
  },

  obtenerDetalleFactura: async (
    idCliente: number,
    cliente: string,
    factura?: EntradaFacturaCliente | null,
  ): Promise<DetalleFactura> => {
    const detalleCliente = await servicioCliente.getById(idCliente);
    return crearDetalleFactura(
      idCliente,
      cliente,
      detalleCliente.numRegistroTributario ?? "",
      factura,
    );
  },

  listarProductosFacturables: async (
    parametros: ParametrosListaProductosFacturables,
  ): Promise<RespuestaListaProductosFacturables> => {
    const { data } = await maximilianService.get<
      ApiResponse<ResultadoListaProductosFacturablesApi>
    >(ENDPOINTS_FACTURACION.listarPedidosFacturables, { params: parametros });

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }

    return {
      productos: data.result.pedidos.map(mapearProductoFacturable),
      totalRegistros: data.result.totalRegistros,
      totalPaginas: data.result.totalPaginas,
    };
  },

  guardarBorrador: async (
    solicitud: GuardarBorradorFacturaRequest,
  ): Promise<unknown> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(
      ENDPOINTS_FACTURACION.guardarBorrador,
      solicitud,
    );

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }

    return data.result;
  },
};

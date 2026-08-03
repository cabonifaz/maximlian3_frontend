import type {
  DetalleFactura,
  EntradaFacturaCliente,
  EntradaFacturacion,
  EntradaFacturacionApi,
  EntradaPedidoFacturacionApi,
  EntradaProductoFacturable,
  GuardarBorradorFacturaRequest,
  ParametrosListaFacturacion,
  ParametrosListaPedidosFacturacion,
  RespuestaListaFacturasCliente,
  RespuestaListaFacturacion,
  ResultadoListaFacturacionApi,
  ResultadoListaPedidosFacturacionApi,
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

const PRODUCTOS_FACTURABLES_MOCK: EntradaProductoFacturable[] = [
  {
    idProductoFacturable: 1,
    codigo: "SR-2024-001",
    investigado: "Inversiones Delta S.A.C.",
    aplicaPenalidad: true,
    tipo: "express",
    fecha: "15/05/2024",
  },
  {
    idProductoFacturable: 2,
    codigo: "SR-2024-002",
    investigado: "Constructora Horizonte",
    aplicaPenalidad: false,
    tipo: "normal",
    fecha: "18/05/2024",
  },
  {
    idProductoFacturable: 3,
    codigo: "SR-2024-003",
    investigado: "Servicios Integrales Express",
    aplicaPenalidad: true,
    tipo: "super-flash",
    fecha: "20/05/2024",
  },
  {
    idProductoFacturable: 4,
    codigo: "SR-2024-004",
    investigado: "Consultoria Nexus",
    aplicaPenalidad: false,
    tipo: "normal",
    fecha: "22/05/2024",
  },
  {
    idProductoFacturable: 5,
    codigo: "SR-2024-005",
    investigado: "Logistica Maritima S.A.",
    aplicaPenalidad: true,
    tipo: "express",
    fecha: "25/05/2024",
  },
];

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

function crearDetalleFactura(
  idCliente: number,
  cliente: string,
  numeroIdentificacion: string,
  factura?: EntradaFacturaCliente | null,
): DetalleFactura {
  const productosBase =
    factura?.idFactura === 1
      ? [
          {
            idProductoFactura: 1,
            idPedido: 1,
            cantidad: 1,
            descripcion: "SR-2024-001 - Express",
            descuentoPorcentaje: 0,
            valorUnitario: 10.09,
            precioUnitario: 0,
            porcentajeIgv: 0,
            total: 10.09,
          },
          {
            idProductoFactura: 2,
            idPedido: 2,
            cantidad: 1,
            descripcion: "SR-2024-002 - Normal",
            descuentoPorcentaje: 0,
            valorUnitario: 10.09,
            precioUnitario: 0,
            porcentajeIgv: 0,
            total: 10.09,
          },
        ]
      : [
          {
            idProductoFactura: 1,
            idPedido: factura?.idFactura ?? 1,
            cantidad: 1,
            descripcion: "SR-2024-001 - Express",
            descuentoPorcentaje: 0,
            valorUnitario: 10.09,
            precioUnitario: 0,
            porcentajeIgv: 0,
            total: 10.09,
          },
        ];

  const totalProductos = productosBase.reduce(
    (total, producto) => total + producto.total,
    0,
  );

  return {
    idFactura: factura?.idFactura ?? null,
    idCliente,
    cliente,
    ni: numeroIdentificacion,
    ordenCompra: "OC 4589",
    fechaEmision: formatearFechaDdMmYyyy(new Date()),
    productos: productosBase,
    cuotas: [
      {
        idCuotaFactura: 1,
        numeroCuota: 1,
        idMoneda: 1,
        monto: totalProductos,
        vencimiento: "2026-01-22",
        estado: factura?.estado === "finalizado" ? "pagado" : "pendiente",
      },
    ],
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

  listarProductosFacturables: async (): Promise<
    EntradaProductoFacturable[]
  > => {
    return Promise.resolve(PRODUCTOS_FACTURABLES_MOCK);
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

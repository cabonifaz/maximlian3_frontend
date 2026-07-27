import type {
  DetalleFactura,
  EntradaFacturaCliente,
  EntradaFacturacion,
  EntradaFacturacionApi,
  EntradaProductoFacturable,
  ParametrosListaFacturacion,
  RespuestaListaFacturacion,
  ResultadoListaFacturacionApi,
} from "@maximilian/shared/types/facturacion.type";
import { ENDPOINTS_FACTURACION } from "@maximilian/shared/constants/endpoints/facturacion.endpoint";
import {
  ErrorRespuestaApi,
  MessageType,
  type ApiResponse,
} from "@maximilian/shared/types/api.type";
import maximilianService from "./maximilian-service";

const FACTURAS_CLIENTE_MOCK: EntradaFacturaCliente[] = [
  {
    idFactura: 1,
    codigo: "SR-2024-001",
    investigado: "LexCorp Asesores",
    penalidad: true,
    estado: "finalizado",
  },
  {
    idFactura: 2,
    codigo: "SR-2024-002",
    investigado: "Finanzas Estrategicas",
    penalidad: true,
    estado: "en-pre-factura",
  },
  {
    idFactura: 3,
    codigo: "SR-2024-003",
    investigado: "Andean Compliance",
    penalidad: true,
    estado: "pre-factura-aprobada",
  },
  {
    idFactura: 4,
    codigo: "SR-2024-004",
    investigado: "TrustLegal Consultores",
    penalidad: false,
    estado: "pre-factura-rechazada",
  },
  {
    idFactura: 5,
    codigo: "SR-2024-005",
    investigado: "Grupo Logistico Pacifico",
    penalidad: false,
    estado: "finalizado",
  },
];

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

function mapearFacturacion(facturacion: EntradaFacturacionApi): EntradaFacturacion {
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

function crearDetalleFactura(cliente: string, factura?: EntradaFacturaCliente | null): DetalleFactura {
  const productosBase = factura?.idFactura === 1
    ? [
        {
          idProductoFactura: 1,
          cantidad: 1,
          descripcion: "SR-2024-001 - Express",
          descuentoPorcentaje: 0,
          valorUnitario: 10256.09,
          total: 10256.09,
        },
        {
          idProductoFactura: 2,
          cantidad: 1,
          descripcion: "SR-2024-002 - Normal",
          descuentoPorcentaje: 0,
          valorUnitario: 10256.09,
          total: 10256.09,
        },
      ]
    : [
        {
          idProductoFactura: 1,
          cantidad: 1,
          descripcion: "SR-2024-001 - Express",
          descuentoPorcentaje: 0,
          valorUnitario: 10256.09,
          total: 10256.09,
        },
      ];

  const totalProductos = productosBase.reduce((total, producto) => total + producto.total, 0);

  return {
    idFactura: factura?.idFactura ?? null,
    cliente,
    ni: "12643",
    ordenCompra: "OC 4589",
    fechaEmision: "03/10/2026",
    fechaVencimiento: "03/10/2026",
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
  list: async (params: ParametrosListaFacturacion): Promise<RespuestaListaFacturacion> => {
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

  listarFacturasCliente: async (): Promise<EntradaFacturaCliente[]> => {
    return Promise.resolve(FACTURAS_CLIENTE_MOCK);
  },

  obtenerDetalleFactura: async (
    cliente: string,
    factura?: EntradaFacturaCliente | null,
  ): Promise<DetalleFactura> => {
    return Promise.resolve(crearDetalleFactura(cliente, factura));
  },

  listarProductosFacturables: async (): Promise<EntradaProductoFacturable[]> => {
    return Promise.resolve(PRODUCTOS_FACTURABLES_MOCK);
  },
};

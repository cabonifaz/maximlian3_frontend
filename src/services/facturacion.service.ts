import type {
  DetalleFactura,
  EntradaFacturaCliente,
  EntradaFacturacion,
  EntradaProductoFacturable,
  ParametrosListaFacturacion,
  RespuestaListaFacturacion,
} from "@maximilian/shared/types/facturacion.type";

const FACTURACIONES_MOCK: EntradaFacturacion[] = [
  {
    idFacturacion: 1,
    cliente: "Software Factory",
    prefacturable: true,
    totalPedidos: 23,
    totalFacturados: 23,
    idioma: "Espanol",
    estado: "finalizado",
  },
  {
    idFacturacion: 2,
    cliente: "Andina Soluciones Digitales",
    prefacturable: false,
    totalPedidos: 53,
    totalFacturados: 53,
    idioma: "Ingles",
    estado: "pendiente",
  },
  {
    idFacturacion: 3,
    cliente: "Grupo Recursos Humanos Global",
    prefacturable: true,
    totalPedidos: 62,
    totalFacturados: 62,
    idioma: "Espanol",
    estado: "en-pre-factura",
  },
  {
    idFacturacion: 4,
    cliente: "Nexa Consulting",
    prefacturable: false,
    totalPedidos: 2,
    totalFacturados: 2,
    idioma: "Ingles",
    estado: "pre-factura-aprobada",
  },
  {
    idFacturacion: 5,
    cliente: "Global Tech Systems",
    prefacturable: true,
    totalPedidos: 15,
    totalFacturados: 12,
    idioma: "Espanol",
    estado: "pre-factura-rechazada",
  },
  {
    idFacturacion: 6,
    cliente: "Innovacion Medica S.A.C.",
    prefacturable: true,
    totalPedidos: 34,
    totalFacturados: 34,
    idioma: "Espanol",
    estado: "finalizado",
  },
  {
    idFacturacion: 7,
    cliente: "Liderazgo & Gestion Corp",
    prefacturable: false,
    totalPedidos: 8,
    totalFacturados: 8,
    idioma: "Espanol",
    estado: "pendiente",
  },
  {
    idFacturacion: 8,
    cliente: "Prime Logistics",
    prefacturable: true,
    totalPedidos: 112,
    totalFacturados: 112,
    idioma: "Ingles",
    estado: "en-pre-factura",
  },
  {
    idFacturacion: 9,
    cliente: "Retail & Marketing Group",
    prefacturable: false,
    totalPedidos: 45,
    totalFacturados: 45,
    idioma: "Espanol",
    estado: "pre-factura-aprobada",
  },
  {
    idFacturacion: 10,
    cliente: "Digital Minds Agency",
    prefacturable: true,
    totalPedidos: 21,
    totalFacturados: 21,
    idioma: "Espanol",
    estado: "pre-factura-rechazada",
  },
  {
    idFacturacion: 11,
    cliente: "Integral Risk Partners",
    prefacturable: true,
    totalPedidos: 18,
    totalFacturados: 16,
    idioma: "Ingles",
    estado: "pendiente",
  },
  {
    idFacturacion: 12,
    cliente: "Mercado Industrial Sur",
    prefacturable: false,
    totalPedidos: 27,
    totalFacturados: 27,
    idioma: "Espanol",
    estado: "finalizado",
  },
];

const REGISTROS_POR_PAGINA = 10;

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
    tipo: "express",
    fecha: "15/05/2024",
  },
  {
    idProductoFacturable: 2,
    codigo: "SR-2024-002",
    investigado: "Constructora Horizonte",
    tipo: "normal",
    fecha: "18/05/2024",
  },
  {
    idProductoFacturable: 3,
    codigo: "SR-2024-003",
    investigado: "Servicios Integrales Express",
    tipo: "super-flash",
    fecha: "20/05/2024",
  },
  {
    idProductoFacturable: 4,
    codigo: "SR-2024-004",
    investigado: "Consultoria Nexus",
    tipo: "normal",
    fecha: "22/05/2024",
  },
  {
    idProductoFacturable: 5,
    codigo: "SR-2024-005",
    investigado: "Logistica Maritima S.A.",
    tipo: "express",
    fecha: "25/05/2024",
  },
];

function filtrarFacturaciones(busqueda: string | undefined) {
  const termino = busqueda?.trim().toLowerCase();
  if (!termino) return FACTURACIONES_MOCK;

  return FACTURACIONES_MOCK.filter((facturacion) =>
    facturacion.cliente.toLowerCase().includes(termino),
  );
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
        moneda: "Soles",
        monto: totalProductos,
        vencimiento: "2026-01-22",
        estado: factura?.estado === "finalizado" ? "pagado" : "pendiente",
      },
    ],
  };
}

export const facturacionService = {
  list: async (params: ParametrosListaFacturacion): Promise<RespuestaListaFacturacion> => {
    const paginaActual = Math.max(params.numPag ?? 1, 1);
    const registrosFiltrados = filtrarFacturaciones(params.busqueda);
    const inicio = (paginaActual - 1) * REGISTROS_POR_PAGINA;
    const lstFacturacion = registrosFiltrados.slice(inicio, inicio + REGISTROS_POR_PAGINA);

    return Promise.resolve({
      lstFacturacion,
      totalRegistros: registrosFiltrados.length,
      totalPaginas: Math.max(Math.ceil(registrosFiltrados.length / REGISTROS_POR_PAGINA), 1),
    });
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

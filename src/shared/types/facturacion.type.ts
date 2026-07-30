export type EstadoFacturacionPrincipal =
  | "finalizado"
  | "pendiente"
  | "en-pre-factura";

export type EstadoFacturaCliente =
  | EstadoFacturacionPrincipal
  | "pre-factura-aprobada"
  | "pre-factura-rechazada"
  | "anulado";

export interface ParametrosListaFacturacion {
  busqueda?: string;
  numPag?: number;
  emitirPrefactura?: number;
  idIdiomaFacturacion?: number;
  estadoFacturacion?: number;
}

export interface EntradaFacturacion {
  idFacturacion: number;
  cliente: string;
  prefacturable: boolean | null;
  totalPedidos: number;
  totalFacturados: number;
  idioma: string;
  estado: EstadoFacturacionPrincipal;
}

export interface RespuestaListaFacturacion {
  lstFacturacion: EntradaFacturacion[];
  totalRegistros: number;
  totalPaginas: number;
}

export interface EntradaFacturacionApi {
  idCliente: number;
  nombre: string;
  emitirPrefactura: "Si" | "No" | null;
  totalPedidos: number;
  pedidosFacturados: number;
  idIdiomaFacturacion: string;
  estadoFacturacion: "Finalizado" | "Pendiente" | "En pre-factura";
}

export interface ResultadoListaFacturacionApi {
  lstClientes: EntradaFacturacionApi[];
  totalRegistros: number;
  totalPaginas: number;
}

export interface EntradaFacturaCliente {
  idFactura: number;
  codigo: string;
  investigado: string;
  penalidad: boolean;
  codigoEstado: number;
  estado: EstadoFacturaCliente;
}

export interface ParametrosListaPedidosFacturacion {
  idCliente: number;
  busqueda?: string;
  numPag: number;
}

export interface EntradaPedidoFacturacionApi {
  idPedido: number;
  codigo: string;
  investigado: string | null;
  aplicaPenalidad: "Si" | "No";
  estadoFacturacion:
    | "Pendiente"
    | "En pre-factura"
    | "Pre-factura aprobada"
    | "Pre-factura rechazada"
    | "Finalizado"
    | "Anulado";
}

export interface ResultadoListaPedidosFacturacionApi {
  lstPedidos: EntradaPedidoFacturacionApi[];
  totalRegistros: number;
  totalPaginas: number;
}

export interface RespuestaListaFacturasCliente {
  lstFacturas: EntradaFacturaCliente[];
  totalRegistros: number;
  totalPaginas: number;
}

export interface EntradaProductoFactura {
  idProductoFactura: number;
  cantidad: number;
  descripcion: string;
  descuentoPorcentaje: number;
  valorUnitario: number;
  total: number;
}

export interface EntradaCuotaFactura {
  idCuotaFactura: number;
  numeroCuota: number;
  idMoneda: number;
  monto: number;
  vencimiento: string;
  estado: "pendiente" | "pagado";
}

export interface DetalleFactura {
  idFactura: number | null;
  cliente: string;
  ni: string;
  ordenCompra: string;
  fechaEmision: string;
  fechaVencimiento: string;
  productos: EntradaProductoFactura[];
  cuotas: EntradaCuotaFactura[];
}

export interface EntradaProductoFacturable {
  idProductoFacturable: number;
  codigo: string;
  investigado: string;
  aplicaPenalidad: boolean;
  tipo: "express" | "normal" | "super-flash";
  fecha: string;
}

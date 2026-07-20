export type EstadoFacturacion =
  | "finalizado"
  | "pendiente"
  | "en-pre-factura"
  | "pre-factura-aprobada"
  | "pre-factura-rechazada";

export interface ParametrosListaFacturacion {
  busqueda?: string;
  numPag?: number;
}

export interface EntradaFacturacion {
  idFacturacion: number;
  cliente: string;
  prefacturable: boolean;
  totalPedidos: number;
  totalFacturados: number;
  idioma: string;
  estado: EstadoFacturacion;
}

export interface RespuestaListaFacturacion {
  lstFacturacion: EntradaFacturacion[];
  totalRegistros: number;
  totalPaginas: number;
}

export interface EntradaFacturaCliente {
  idFactura: number;
  codigo: string;
  investigado: string;
  penalidad: boolean;
  estado: EstadoFacturacion;
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
  moneda: string;
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
  tipo: "express" | "normal" | "super-flash";
  fecha: string;
}

export const ENDPOINTS_FACTURACION = {
  listar: "/api/Cliente/listarFacturacion",
  listarPedidos: "/api/Cliente/listarPedidosFacturacion",
  listarPedidosFacturables: "/api/PedidoFactura/listarPedidos",
  guardarBorrador: "/api/PedidoFactura/guardarBorrador",
} as const;

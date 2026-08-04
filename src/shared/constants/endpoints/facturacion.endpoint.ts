export const ENDPOINTS_FACTURACION = {
  listar: "/api/Cliente/listarFacturacion",
  listarPedidos: "/api/Cliente/listarPedidosFacturacion",
  listarPedidosFacturables: "/api/PedidoFactura/listarPedidos",
  guardarBorrador: "/api/PedidoFactura/guardarBorrador",
  resumen: "/api/PedidoFactura/resumen",
  obtenerFactura: (idPedido: number) => `/api/PedidoFactura/factura/${idPedido}`,
  guardarCambios: (idDocumentoElectronico: number) =>
    `/api/PedidoFactura/guardarCambios/${idDocumentoElectronico}`,
  actualizarEstado: (idPedido: number) =>
    `/api/PedidoFactura/estado/${idPedido}`,
  anular: "/api/PedidoFactura/anular",
  emitir: (idDocumentoElectronico: number) =>
    `/api/PedidoFactura/emitir/${idDocumentoElectronico}`,
} as const;

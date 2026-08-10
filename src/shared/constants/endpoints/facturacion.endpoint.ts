export const ENDPOINTS_FACTURACION = {
  listar: "/api/Cliente/listarFacturacion",
  listarPedidos: "/api/Cliente/listarPedidosFacturacion",
  listarPedidosFacturables: "/api/PedidoFactura/listarPedidos",
  listarFacturas: "/api/PedidoFactura/listarFacturas",
  guardarBorrador: "/api/PedidoFactura/guardarBorrador",
  resumen: "/api/PedidoFactura/resumen",
  obtenerFactura: (idPedido: number) => `/api/PedidoFactura/factura/${idPedido}`,
  obtenerFacturaPorId: (idDocumentoElectronico: number) =>
    `/api/PedidoFactura/facturaPorId/${idDocumentoElectronico}`,
  obtenerDatosParaNota: (idDocumentoElectronico: number) =>
    `/api/PedidoFactura/facturaPorId/${idDocumentoElectronico}/paraNota`,
  obtenerUrlDescargaFactura: (idDocumentoElectronico: number) =>
    `/api/PedidoFactura/facturaPorId/${idDocumentoElectronico}/urlDescarga`,
  obtenerUrlVerificacionFactura: (idDocumentoElectronico: number) =>
    `/api/PedidoFactura/facturaPorId/${idDocumentoElectronico}/urlVerificacion`,
  erroresUltimoEnvio: (idDocumentoElectronico: number) =>
    `/api/PedidoFactura/facturaPorId/${idDocumentoElectronico}/erroresUltimoEnvio`,
  guardarCambios: (idDocumentoElectronico: number) =>
    `/api/PedidoFactura/guardarCambios/${idDocumentoElectronico}`,
  actualizarEstado: (idPedido: number) =>
    `/api/PedidoFactura/estado/${idPedido}`,
  anular: "/api/PedidoFactura/anular",
  emitir: (idDocumentoElectronico: number) =>
    `/api/PedidoFactura/emitir/${idDocumentoElectronico}`,
  notaCreditoDebito: "/api/PedidoFactura/notaCreditoDebito",
  editarNotaCreditoDebito: (idDocumentoElectronico: number) =>
    `/api/PedidoFactura/notaCreditoDebito/${idDocumentoElectronico}`,
  sireRvieTxt: "/api/PedidoFactura/sireRvie/txt",
} as const;

export const ENDPOINTS_FACTURACION = {
  listar: "/api/Cliente/listarFacturacion",
  listarPedidos: "/api/Cliente/listarPedidosFacturacion",
  listarPedidosFacturables: "/api/PedidoFactura/listarPedidos",
  listarFacturas: "/api/PedidoFactura/listarFacturas",
  guardarBorrador: "/api/PedidoFactura/guardarBorrador",
  eliminarBorrador: (idDocumentoElectronico: number) =>
    `/api/PedidoFactura/borrador/${idDocumentoElectronico}`,
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
  actualizarEstadoCuota: (
    idDocumentoElectronico: number,
    idCuotaDocumentoElectronico: number,
  ) =>
    `/api/PedidoFactura/facturaPorId/${idDocumentoElectronico}/cuotas/${idCuotaDocumentoElectronico}/estado`,
  anular: "/api/PedidoFactura/anular",
  anularPreview: "/api/PedidoFactura/anular/preview",
  anularManualmente: (idDocumentoElectronico: number) =>
    `/api/PedidoFactura/facturaPorId/${idDocumentoElectronico}/anularManualmente`,
  anularManualmentePreview: (idDocumentoElectronico: number) =>
    `/api/PedidoFactura/facturaPorId/${idDocumentoElectronico}/anularManualmente/preview`,
  emitir: (idDocumentoElectronico: number) =>
    `/api/PedidoFactura/emitir/${idDocumentoElectronico}`,
  notaCreditoDebito: "/api/PedidoFactura/notaCreditoDebito",
  editarNotaCreditoDebito: (idDocumentoElectronico: number) =>
    `/api/PedidoFactura/notaCreditoDebito/${idDocumentoElectronico}`,
  sireRvieTxt: "/api/PedidoFactura/sireRvie/txt",
  exportarPrefactura: "/api/PedidoFactura/listarPedidos/exportarExcel",
} as const;

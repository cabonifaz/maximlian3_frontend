export const ENDPOINTS_PEDIDO = {
  listar: "/api/Pedido/listar",
  listarAsignacion: "/api/Pedido/listarAsignacion",
  cancelar: "/api/Pedido/cancelar",
  eliminar: "/api/Pedido/eliminar",
  crear: "/api/Pedido/crear",
  obtener: "/api/Pedido/obtener",
  editar: "/api/Pedido/editar",
  listarArchivos: "/api/PedidoArchivo/listar",
  crearArchivo: "/api/PedidoArchivo/crear",
  eliminarArchivo: "/api/PedidoArchivo/eliminar",
  obtenerArchivo: "/api/PedidoArchivo/obtener",
} as const;

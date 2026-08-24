import type { PestanaDetallePedidosFacturaVerificacion } from "@maximilian/shared/constants/components/publico/detalle-pedidos-factura-verificacion.constants";
import type { LineaVerificacionFacturaApi } from "@maximilian/shared/types/verificacion-factura.type";

export function detectarPestanaDetallePedidos(
  linea: LineaVerificacionFacturaApi,
): PestanaDetallePedidosFacturaVerificacion {
  const texto = `${linea.descripcion} ${linea.productoCodigo}`.toLowerCase();

  if (texto.includes("super") || texto.includes("flash")) return "super-flash";
  if (texto.includes("express")) return "express";
  if (texto.includes("normal")) return "normal";

  return "general";
}

import type {
  ClientePendienteFacturacionAnaliticaDashboard,
  DetalleFacturacionAnaliticaDashboard,
  EstadoFacturaAnaliticaDashboard,
  TramiteFacturacionAnaliticaDashboard,
} from "@maximilian/shared/types/dashboard.type";
import type { TableColumn } from "@maximilian/components/common/CustomTabla";

const MONEDA_ICONO_MOCK = "S/ ";

export const DETALLE_FACTURACION_ANALITICA_DASHBOARD_MOCK: DetalleFacturacionAnaliticaDashboard[] = [
  { id: 1, idCliente: 1, cliente: "Grupo Andino SAC", fechaEmision: "2026-01-08", pais: "Perú", tramite: "normal", tipoComprobante: "Factura", estado: "aceptada", cantidadPedidos: 12, montoFacturado: 8400, monedaIcono: MONEDA_ICONO_MOCK },
  { id: 2, idCliente: 4, cliente: "Textiles Peru", fechaEmision: "2026-01-15", pais: "Perú", tramite: "expres", tipoComprobante: "Factura", estado: "aceptada", cantidadPedidos: 6, montoFacturado: 5200, monedaIcono: MONEDA_ICONO_MOCK },
  { id: 3, idCliente: 3, cliente: "Comercial del Sur", fechaEmision: "2026-01-22", pais: "Bolivia", tramite: "super-flash", tipoComprobante: "Boleta", estado: "aprobada", cantidadPedidos: 4, montoFacturado: 6100, monedaIcono: MONEDA_ICONO_MOCK },
  { id: 4, idCliente: 2, cliente: "Import Export Bolivia", fechaEmision: "2026-02-05", pais: "Bolivia", tramite: "normal", tipoComprobante: "Factura", estado: "aceptada", cantidadPedidos: 9, montoFacturado: 5400, monedaIcono: MONEDA_ICONO_MOCK },
  { id: 5, idCliente: 5, cliente: "Logística Continental", fechaEmision: "2026-02-11", pais: "Colombia", tramite: "expres", tipoComprobante: "Factura", estado: "rechazada", cantidadPedidos: 3, montoFacturado: 2100, monedaIcono: MONEDA_ICONO_MOCK },
  { id: 6, idCliente: 1, cliente: "Grupo Andino SAC", fechaEmision: "2026-02-19", pais: "Perú", tramite: "super-flash", tipoComprobante: "Nota de Crédito", estado: "aceptada", cantidadPedidos: 2, montoFacturado: -800, monedaIcono: MONEDA_ICONO_MOCK },
  { id: 7, idCliente: 4, cliente: "Textiles Peru", fechaEmision: "2026-03-03", pais: "Perú", tramite: "normal", tipoComprobante: "Factura", estado: "aceptada", cantidadPedidos: 14, montoFacturado: 9800, monedaIcono: MONEDA_ICONO_MOCK },
  { id: 8, idCliente: 3, cliente: "Comercial del Sur", fechaEmision: "2026-03-14", pais: "Chile", tramite: "expres", tipoComprobante: "Boleta", estado: "aprobada", cantidadPedidos: 5, montoFacturado: 4300, monedaIcono: MONEDA_ICONO_MOCK },
  { id: 9, idCliente: 2, cliente: "Import Export Bolivia", fechaEmision: "2026-03-27", pais: "Bolivia", tramite: "super-flash", tipoComprobante: "Factura", estado: "aceptada", cantidadPedidos: 7, montoFacturado: 7700, monedaIcono: MONEDA_ICONO_MOCK },
  { id: 10, idCliente: 5, cliente: "Logística Continental", fechaEmision: "2026-04-02", pais: "Colombia", tramite: "normal", tipoComprobante: "Factura", estado: "borrador", cantidadPedidos: 10, montoFacturado: 6600, monedaIcono: MONEDA_ICONO_MOCK },
  { id: 11, idCliente: 1, cliente: "Grupo Andino SAC", fechaEmision: "2026-04-16", pais: "Perú", tramite: "expres", tipoComprobante: "Factura", estado: "aceptada", cantidadPedidos: 8, montoFacturado: 6800, monedaIcono: MONEDA_ICONO_MOCK },
  { id: 12, idCliente: 4, cliente: "Textiles Peru", fechaEmision: "2026-04-24", pais: "Perú", tramite: "super-flash", tipoComprobante: "Nota de Débito", estado: "aceptada", cantidadPedidos: 1, montoFacturado: 950, monedaIcono: MONEDA_ICONO_MOCK },
  { id: 13, idCliente: 3, cliente: "Comercial del Sur", fechaEmision: "2026-05-06", pais: "Bolivia", tramite: "normal", tipoComprobante: "Factura", estado: "aceptada", cantidadPedidos: 11, montoFacturado: 7150, monedaIcono: MONEDA_ICONO_MOCK },
  { id: 14, idCliente: 2, cliente: "Import Export Bolivia", fechaEmision: "2026-05-18", pais: "Bolivia", tramite: "expres", tipoComprobante: "Boleta", estado: "anulada", cantidadPedidos: 4, montoFacturado: 3200, monedaIcono: MONEDA_ICONO_MOCK },
  { id: 15, idCliente: 5, cliente: "Logística Continental", fechaEmision: "2026-05-25", pais: "Chile", tramite: "super-flash", tipoComprobante: "Factura", estado: "aceptada", cantidadPedidos: 6, montoFacturado: 8900, monedaIcono: MONEDA_ICONO_MOCK },
  { id: 16, idCliente: 1, cliente: "Grupo Andino SAC", fechaEmision: "2026-06-09", pais: "Perú", tramite: "normal", tipoComprobante: "Factura", estado: "aceptada", cantidadPedidos: 13, montoFacturado: 9100, monedaIcono: MONEDA_ICONO_MOCK },
  { id: 17, idCliente: 4, cliente: "Textiles Peru", fechaEmision: "2026-06-19", pais: "Perú", tramite: "expres", tipoComprobante: "Factura", estado: "aprobada", cantidadPedidos: 7, montoFacturado: 5950, monedaIcono: MONEDA_ICONO_MOCK },
  { id: 18, idCliente: 3, cliente: "Comercial del Sur", fechaEmision: "2026-06-28", pais: "Colombia", tramite: "super-flash", tipoComprobante: "Factura", estado: "dada-de-baja", cantidadPedidos: 3, montoFacturado: 4100, monedaIcono: MONEDA_ICONO_MOCK },
  { id: 19, idCliente: 2, cliente: "Import Export Bolivia", fechaEmision: "2026-07-07", pais: "Bolivia", tramite: "normal", tipoComprobante: "Factura", estado: "aceptada", cantidadPedidos: 10, montoFacturado: 6500, monedaIcono: MONEDA_ICONO_MOCK },
  { id: 20, idCliente: 5, cliente: "Logística Continental", fechaEmision: "2026-07-16", pais: "Chile", tramite: "expres", tipoComprobante: "Boleta", estado: "aceptada", cantidadPedidos: 5, montoFacturado: 4700, monedaIcono: MONEDA_ICONO_MOCK },
  { id: 21, idCliente: 1, cliente: "Grupo Andino SAC", fechaEmision: "2026-07-29", pais: "Perú", tramite: "super-flash", tipoComprobante: "Factura", estado: "borrador", cantidadPedidos: 9, montoFacturado: 10200, monedaIcono: MONEDA_ICONO_MOCK },
  { id: 22, idCliente: 4, cliente: "Textiles Peru", fechaEmision: "2026-08-04", pais: "Perú", tramite: "normal", tipoComprobante: "Factura", estado: "aceptada", cantidadPedidos: 12, montoFacturado: 8300, monedaIcono: MONEDA_ICONO_MOCK },
  { id: 23, idCliente: 3, cliente: "Comercial del Sur", fechaEmision: "2026-08-12", pais: "Bolivia", tramite: "expres", tipoComprobante: "Factura", estado: "rechazada", cantidadPedidos: 4, montoFacturado: 3400, monedaIcono: MONEDA_ICONO_MOCK },
  { id: 24, idCliente: 2, cliente: "Import Export Bolivia", fechaEmision: "2026-08-19", pais: "Bolivia", tramite: "super-flash", tipoComprobante: "Factura", estado: "aceptada", cantidadPedidos: 6, montoFacturado: 7600, monedaIcono: MONEDA_ICONO_MOCK },
  { id: 25, idCliente: 1, cliente: "Grupo Andino SAC", fechaEmision: "2026-03-20", pais: "Ecuador", tramite: "normal", tipoComprobante: "Factura", estado: "aceptada", cantidadPedidos: 3, montoFacturado: 2200, monedaIcono: MONEDA_ICONO_MOCK },
  { id: 26, idCliente: 4, cliente: "Textiles Peru", fechaEmision: "2026-07-22", pais: "México", tramite: "expres", tipoComprobante: "Factura", estado: "aprobada", cantidadPedidos: 2, montoFacturado: 1500, monedaIcono: MONEDA_ICONO_MOCK },
];

export const CLIENTES_PENDIENTES_FACTURACION_ANALITICA_DASHBOARD_MOCK: ClientePendienteFacturacionAnaliticaDashboard[] = [
  { idCliente: 1, cliente: "Grupo Andino SAC", montoPendienteFacturar: 4200, cantidadPedidosPendientes: 5, monedaIcono: MONEDA_ICONO_MOCK },
  { idCliente: 4, cliente: "Textiles Peru", montoPendienteFacturar: 1800, cantidadPedidosPendientes: 2, monedaIcono: MONEDA_ICONO_MOCK },
  { idCliente: 3, cliente: "Comercial del Sur", montoPendienteFacturar: 6300, cantidadPedidosPendientes: 7, monedaIcono: MONEDA_ICONO_MOCK },
  { idCliente: 2, cliente: "Import Export Bolivia", montoPendienteFacturar: 950, cantidadPedidosPendientes: 1, monedaIcono: MONEDA_ICONO_MOCK },
  { idCliente: 5, cliente: "Logística Continental", montoPendienteFacturar: 2650, cantidadPedidosPendientes: 3, monedaIcono: MONEDA_ICONO_MOCK },
];

export const OPCIONES_CLIENTE_FACTURACION_ANALITICA_DASHBOARD = [
  { valor: 1, etiqueta: "Grupo Andino SAC" },
  { valor: 2, etiqueta: "Import Export Bolivia" },
  { valor: 3, etiqueta: "Comercial del Sur" },
  { valor: 4, etiqueta: "Textiles Peru" },
  { valor: 5, etiqueta: "Logística Continental" },
];

export const OPCIONES_ESTADO_FACTURACION_ANALITICA_DASHBOARD: Array<{
  valor: EstadoFacturaAnaliticaDashboard;
  etiqueta: string;
}> = [
  { valor: "borrador", etiqueta: "Borrador" },
  { valor: "aprobada", etiqueta: "Aprobada" },
  { valor: "rechazada", etiqueta: "Rechazada" },
  { valor: "aceptada", etiqueta: "Aceptada" },
  { valor: "anulada", etiqueta: "Anulada" },
  { valor: "dada-de-baja", etiqueta: "Dada de baja" },
];

export const OPCIONES_PAIS_FACTURACION_ANALITICA_DASHBOARD = [
  { valor: "Perú", etiqueta: "Perú" },
  { valor: "Bolivia", etiqueta: "Bolivia" },
  { valor: "Colombia", etiqueta: "Colombia" },
  { valor: "Chile", etiqueta: "Chile" },
  { valor: "Ecuador", etiqueta: "Ecuador" },
  { valor: "México", etiqueta: "México" },
];

export const OPCIONES_TRAMITE_FACTURACION_ANALITICA_DASHBOARD: Array<{
  valor: TramiteFacturacionAnaliticaDashboard;
  etiqueta: string;
}> = [
  { valor: "normal", etiqueta: "Normal" },
  { valor: "expres", etiqueta: "Expres" },
  { valor: "super-flash", etiqueta: "Super Flash" },
];

export const OPCIONES_TIPO_COMPROBANTE_FACTURACION_ANALITICA_DASHBOARD = [
  { valor: "Factura", etiqueta: "Factura" },
  { valor: "Boleta", etiqueta: "Boleta" },
  { valor: "Nota de Crédito", etiqueta: "Nota de Crédito" },
  { valor: "Nota de Débito", etiqueta: "Nota de Débito" },
];

export const ESTILOS_ESTADO_FACTURA_ANALITICA_DASHBOARD: Record<
  EstadoFacturaAnaliticaDashboard,
  { texto: string; clase: string; colorBarra: string }
> = {
  borrador: { texto: "Borrador", clase: "bg-amber-100 text-amber-700", colorBarra: "#f59e0b" },
  aprobada: { texto: "Aprobada", clase: "bg-cyan-100 text-cyan-700", colorBarra: "#0891b2" },
  rechazada: { texto: "Rechazada", clase: "bg-red-100 text-red-600", colorBarra: "#ef4444" },
  aceptada: { texto: "Aceptada", clase: "bg-emerald-100 text-emerald-700", colorBarra: "#10b981" },
  anulada: { texto: "Anulada", clase: "bg-slate-200 text-slate-700", colorBarra: "#94a3b8" },
  "dada-de-baja": { texto: "Dada de baja", clase: "bg-rose-100 text-rose-700", colorBarra: "#f43f5e" },
};

export const ESTILOS_TRAMITE_FACTURACION_ANALITICA_DASHBOARD: Record<
  TramiteFacturacionAnaliticaDashboard,
  { texto: string; color: string }
> = {
  normal: { texto: "Normal", color: "#2563eb" },
  expres: { texto: "Expres", color: "#f59e0b" },
  "super-flash": { texto: "Super Flash", color: "#dc2626" },
};

export const CANTIDAD_MAXIMA_SEGMENTOS_TORTA_PAIS = 5;
export const CLAVE_OTROS_PAISES_FACTURACION_ANALITICA_DASHBOARD = "otros-paises";
export const ETIQUETA_OTROS_PAISES_FACTURACION_ANALITICA_DASHBOARD = "Otros";
export const COLOR_OTROS_PAISES_FACTURACION_ANALITICA_DASHBOARD = "#94a3b8";

export const PALETA_COLORES_PAIS_FACTURACION_ANALITICA_DASHBOARD = [
  "#722f37",
  "#0891b2",
  "#f59e0b",
  "#10b981",
  "#6366f1",
];

export const ETIQUETAS_MES_CORTO_ES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
] as const;

export const COLUMNAS_TABLA_CLIENTES_FACTURACION_ANALITICA_DASHBOARD: TableColumn[] = [
  { label: "Cliente", width: "34%" },
  { label: "Total facturado", className: "text-right", width: "22%" },
  { label: "Pedidos facturados", className: "text-center", width: "22%" },
  { label: "Pendiente por facturar", className: "text-right", width: "22%" },
];

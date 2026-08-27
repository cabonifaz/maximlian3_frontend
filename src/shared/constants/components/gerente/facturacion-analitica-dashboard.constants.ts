import type { TableColumn } from "@maximilian/components/common/CustomTabla";

export const CANTIDAD_REINTENTOS_CONSULTA_FACTURACION_ANALITICA_DASHBOARD = 2;

export const CANTIDAD_MAXIMA_ESTADOS_FACTURACION_ANALITICA_DASHBOARD = 5;

export const ID_OTROS_ESTADOS_FACTURACION_ANALITICA_DASHBOARD = -1;

export const ETIQUETA_OTROS_ESTADOS_FACTURACION_ANALITICA_DASHBOARD = "Otros";

export const COLOR_OTROS_ESTADOS_FACTURACION_ANALITICA_DASHBOARD = "#94a3b8";

export const PALETA_COLORES_DESGLOSE_FACTURACION_ANALITICA_DASHBOARD = [
  "#722f37",
  "#0891b2",
  "#f59e0b",
  "#10b981",
  "#6366f1",
  "#dc2626",
  "#94a3b8",
];

export const COLUMNAS_TABLA_CLIENTES_FACTURACION_ANALITICA_DASHBOARD: TableColumn[] = [
  { label: "Cliente", width: "44%" },
  { label: "Total facturado", className: "text-right", width: "28%" },
  { label: "Pedidos facturados", className: "text-center", width: "28%" },
];

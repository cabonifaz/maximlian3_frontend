import type { TableColumn } from "@maximilian/components/common/CustomTabla";

export const OPCIONES_ESTADO_BUCKET_FACTURACION_ANALITICA_DASHBOARD = [
  { valor: 1, etiqueta: "Aceptada" },
  { valor: 2, etiqueta: "Rechazada" },
  { valor: 3, etiqueta: "Borrador" },
  { valor: 4, etiqueta: "Anulada" },
  { valor: 5, etiqueta: "Dada de baja" },
  { valor: 6, etiqueta: "En proceso" },
];

export const OPCIONES_TIPO_DOCUMENTO_MAESTRO_FACTURACION_ANALITICA_DASHBOARD = [
  { valor: 1, etiqueta: "Factura" },
  { valor: 3, etiqueta: "Boleta de venta" },
  { valor: 7, etiqueta: "Nota de crédito" },
  { valor: 8, etiqueta: "Nota de débito" },
];

export const ESTILOS_ESTADO_BUCKET_FACTURACION_ANALITICA_DASHBOARD: Record<
  number,
  { clase: string; colorBarra: string }
> = {
  1: { clase: "bg-emerald-100 text-emerald-700", colorBarra: "#10b981" }, // Aceptada
  2: { clase: "bg-red-100 text-red-600", colorBarra: "#ef4444" }, // Rechazada
  3: { clase: "bg-amber-100 text-amber-700", colorBarra: "#f59e0b" }, // Borrador
  4: { clase: "bg-slate-200 text-slate-700", colorBarra: "#94a3b8" }, // Anulada
  5: { clase: "bg-rose-100 text-rose-700", colorBarra: "#f43f5e" }, // Dada de baja
  6: { clase: "bg-cyan-100 text-cyan-700", colorBarra: "#0891b2" }, // En proceso
};

export const ESTILO_ESTADO_BUCKET_DESCONOCIDO_FACTURACION_ANALITICA_DASHBOARD = {
  clase: "bg-slate-100 text-slate-600",
  colorBarra: "#94a3b8",
};

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
  { label: "Cliente", width: "34%" },
  { label: "Total facturado", className: "text-right", width: "22%" },
  { label: "Pedidos facturados", className: "text-center", width: "22%" },
  { label: "Pendiente por facturar", className: "text-right", width: "22%" },
];

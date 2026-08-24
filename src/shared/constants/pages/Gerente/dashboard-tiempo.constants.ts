import type { GranularidadTiempoDashboard } from "@maximilian/shared/types/dashboard.type";

export const ETIQUETAS_MES_CORTO_ES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
] as const;

export const OPCIONES_GRANULARIDAD_FACTURACION_DASHBOARD: Array<{
  valor: GranularidadTiempoDashboard;
  etiqueta: string;
}> = [
  { valor: "dia", etiqueta: "Día" },
  { valor: "semana", etiqueta: "Semana" },
  { valor: "mes", etiqueta: "Mes" },
];

export const OPCIONES_GRANULARIDAD_ANALISTAS_DASHBOARD: Array<{
  valor: GranularidadTiempoDashboard;
  etiqueta: string;
}> = [
  { valor: "dia", etiqueta: "Día" },
  { valor: "semana", etiqueta: "Semana" },
  { valor: "mes", etiqueta: "Mes" },
  { valor: "ano", etiqueta: "Año" },
];

export const OPCIONES_METRICA_DESGLOSE_FACTURACION_DASHBOARD: Array<{
  valor: "monto" | "pedidos";
  etiqueta: string;
}> = [
  { valor: "monto", etiqueta: "Monto" },
  { valor: "pedidos", etiqueta: "Pedidos" },
];

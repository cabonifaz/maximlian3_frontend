export const CLAVE_CONSULTA_RESUMEN_CLIENTES_DASHBOARD = [
  "dashboard",
  "resumen-clientes",
] as const;

export const CLAVE_CONSULTA_RESUMEN_PEDIDOS_DASHBOARD = [
  "dashboard",
  "resumen-pedidos",
] as const;

export const CLAVE_CONSULTA_RESUMEN_USUARIOS_DASHBOARD = [
  "dashboard",
  "resumen-usuarios",
] as const;

export const fechasFacturacionGerente = [
  { etiqueta: "Desde", fecha: "01/07/2026" },
  { etiqueta: "Hasta", fecha: "31/07/2026" },
];

export const resumenFacturacionGerente = {
  montoTotal: 142500,
  ordenes: 312,
  promedio: 456.7,
};

export const facturacionMensualGerente = [
  { mes: "Sem 1", altura: "h-10", color: "bg-indigo-100" },
  { mes: "Sem 2", altura: "h-16", color: "bg-indigo-200" },
  { mes: "Sem 3", altura: "h-12", color: "bg-indigo-300" },
  { mes: "Sem 4", altura: "h-24", color: "bg-indigo-500" },
  { mes: "Sem 5", altura: "h-16", color: "bg-indigo-300" },
];

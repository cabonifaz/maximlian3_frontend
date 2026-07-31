export const CLAVE_CONSULTA_RESUMEN_CLIENTES_DASHBOARD = [
  "dashboard",
  "resumen-clientes",
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

export const resumenCumplimientoGerente = {
  porcentajeEntregados: 88,
  porcentajeAtrasados: 12,
};

export const estadosPedidosGerente = [
  { nombre: "Pendiente", cantidad: 42, porcentaje: 34, color: "bg-amber-400" },
  { nombre: "Bajo investigación", cantidad: 18, porcentaje: 23, color: "bg-sky-400" },
  { nombre: "En traducción", cantidad: 85, porcentaje: 78, color: "bg-violet-500" },
  { nombre: "En revisión", cantidad: 63, porcentaje: 58, color: "bg-emerald-500" },
  { nombre: "Cancelado", cantidad: 22, porcentaje: 18, color: "bg-slate-400" },
];

export const facturacionMensualGerente = [
  { mes: "Sem 1", altura: "h-10", color: "bg-indigo-100" },
  { mes: "Sem 2", altura: "h-16", color: "bg-indigo-200" },
  { mes: "Sem 3", altura: "h-12", color: "bg-indigo-300" },
  { mes: "Sem 4", altura: "h-24", color: "bg-indigo-500" },
  { mes: "Sem 5", altura: "h-16", color: "bg-indigo-300" },
];

export const colaboradoresGerente = [
  {
    iniciales: "AM",
    nombre: "Andrea Martínez",
    rol: "Analista",
    ordenes: 142,
    porcentajeCumplimiento: 86,
    entregasCumplidas: 122,
    eficiencia: "Alta",
    colorEficiencia: "text-emerald-600",
  },
  {
    iniciales: "RL",
    nombre: "Ricardo Luna",
    rol: "Traductor",
    ordenes: 88,
    porcentajeCumplimiento: 72,
    entregasCumplidas: 63,
    eficiencia: "Media",
    colorEficiencia: "text-amber-500",
  },
  {
    iniciales: "CP",
    nombre: "Carlos Pérez",
    rol: "Coordinador",
    ordenes: 94,
    porcentajeCumplimiento: 65,
    entregasCumplidas: 61,
    eficiencia: "Baja",
    colorEficiencia: "text-rose-500",
  },
];

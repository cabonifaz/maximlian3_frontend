import type { PrioridadPedido, RolFlujoAsignacion, TabFlujoAsignacion } from "@maximilian/shared/types/flujo-informe.type";

export const TABS_FLUJO_ASIGNACION: { id: TabFlujoAsignacion; etiqueta: string; descripcion: string }[] = [
  { id: "sin-asignar", etiqueta: "Sin asignar", descripcion: "Pedidos nuevos esperando analista." },
  { id: "en-analisis", etiqueta: "En análisis", descripcion: "El analista está elaborando el informe." },
  {
    id: "listo-traduccion",
    etiqueta: "Listos para traducción",
    descripcion: "El analista finalizó su informe. Asigna un traductor para continuar.",
  },
  { id: "en-traduccion", etiqueta: "En traducción", descripcion: "El traductor está traduciendo o editando el informe." },
  {
    id: "por-revisar",
    etiqueta: "Por revisar",
    descripcion: "El traductor envió su informe. Revisa ambos informes antes de aprobar.",
  },
  {
    id: "finalizado",
    etiqueta: "Finalizados",
    descripcion: "Pedidos aprobados, del más reciente al más antiguo.",
  },
  {
    id: "complementos",
    etiqueta: "Complementos",
    descripcion: "Complementos creados por traductores sin pedido registrado.",
  },
];

export const TAB_FLUJO_ASIGNACION_INICIAL: TabFlujoAsignacion = "sin-asignar";

export const TABS_FLUJO_CON_ALERTA: TabFlujoAsignacion[] = ["listo-traduccion", "por-revisar"];

export const PRIORIDAD_PEDIDO_VISUAL: Record<PrioridadPedido, { etiqueta: string; clase: string }> = {
  "super-flash": { etiqueta: "Super Flash", clase: "bg-red-100 text-red-700" },
  express: { etiqueta: "Express", clase: "bg-amber-100 text-amber-700" },
  normal: { etiqueta: "Normal", clase: "bg-slate-100 text-slate-600" },
};

export const COLUMNAS_FLUJO_ASIGNACION = [
  { label: "Prioridad", width: "9%" },
  { label: "Cliente", width: "15%" },
  { label: "Investigado", width: "18%" },
  { label: "País / Idioma", width: "11%" },
  { label: "Analista", width: "13%" },
  { label: "Traductor", width: "13%" },
  { label: "Vencimiento", width: "9%" },
  { label: "Acciones", className: "text-right", width: "12%" },
];

export const COLUMNAS_COMPLEMENTOS_COORDINADOR = [
  { label: "Investigado", width: "20%" },
  { label: "Base", width: "18%" },
  { label: "Cliente destino", width: "16%" },
  { label: "Traductor", width: "14%" },
  { label: "Estado", className: "text-center", width: "14%" },
  { label: "Creado", width: "9%" },
  { label: "Última modificación", width: "9%" },
];

export const ETIQUETA_ROL_FLUJO = {
  analista: "analista",
  traductor: "traductor",
} as const;

export const MENSAJE_MODO_EDICION_TRADUCTOR =
  "El informe está en español: el traductor editará y mejorará el informe del analista.";

export const MENSAJE_MODO_TRADUCCION =
  "El traductor recibirá el informe finalizado del analista para traducirlo.";

export const AVISO_DATOS_SIMULADOS =
  "Vista con datos simulados: el backend aún no expone este flujo. Las acciones solo cambian datos en memoria.";

// Tabs donde se pueden seleccionar varios pedidos y el rol que se les asigna en masa
export const ROL_ASIGNACION_MASIVA_POR_TAB: Partial<Record<TabFlujoAsignacion, RolFlujoAsignacion>> = {
  "sin-asignar": "analista",
  "listo-traduccion": "traductor",
};

export const MENSAJE_MODO_MIXTO_TRADUCTOR =
  "Según el idioma de cada pedido, el traductor traducirá el informe o solo lo editará.";

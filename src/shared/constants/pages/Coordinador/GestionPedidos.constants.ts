export const PEDIDO_COLUMNS = [
  { label: "Cliente", width: "22%" },
  { label: "Investigado", width: "21%" },
  { label: "Idioma del Informe", className: "text-center", width: "13%" },
  { label: "Logo Imprimible", className: "text-center", width: "12%" },
  { label: "Estado", className: "text-center", width: "13%" },
  { label: "Fase", className: "text-center", width: "8%" },
  { label: "", className: "text-center w-14", width: "4%" },
  { label: "Acciones", className: "text-right", width: "7%" },
];

export const ESTADO_OPTIONS = [
  { num1: 1, string1: "Pendiente" },
  { num1: 2, string1: "En revisión" },
  { num1: 3, string1: "Aprobado" },
  { num1: 4, string1: "Observado" },
  { num1: 5, string1: "Cancelado" },
] as EntradaTablaMaestra[];

export const TARJETAS_ESTADO_PEDIDO = [
  { clave: "pendiente", titulo: "Pendiente", Icono: Clock3, colorIcono: "text-orange-500" },
  { clave: "enRevision", titulo: "En revisión", Icono: SearchCheck, colorIcono: "text-blue-500" },
  { clave: "aprobado", titulo: "Aprobado", Icono: CheckCircle2, colorIcono: "text-emerald-500" },
  { clave: "observado", titulo: "Observado", Icono: CircleAlert, colorIcono: "text-amber-500" },
  { clave: "cancelado", titulo: "Cancelado", Icono: CircleX, colorIcono: "text-rose-500" },
] as const;

export const FASE_ASIGNACION = {
  ASIGNADO_ANALISTA: 1,
  ASIGNADO_TRADUCCION: 2,
  ANALISIS_COMPLETO: 3,
  REASIGNADO_ANALISTA: 4,
  REASIGNADO_TRADUCCION: 5,
  TRADUCCION_COMPLETA: 6,
  ASIGNACION_ANULADA: 7,
} as const;
import { CheckCircle2, CircleAlert, CircleX, Clock3, SearchCheck } from "lucide-react";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

import type { EstadoComplemento } from "@maximilian/shared/types/flujo-informe.type";
import type { ModoInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";

export const ESTADO_COMPLEMENTO_VISUAL: Record<EstadoComplemento, { etiqueta: string; clase: string }> = {
  borrador: { etiqueta: "Borrador", clase: "bg-slate-100 text-slate-600" },
  "en-proceso": { etiqueta: "En proceso", clase: "bg-blue-50 text-blue-700" },
  "pendiente-aprobacion": { etiqueta: "Pendiente de aprobación", clase: "bg-amber-50 text-amber-700" },
  aprobado: { etiqueta: "Aprobado", clase: "bg-green-50 text-green-700" },
  rechazado: { etiqueta: "Rechazado", clase: "bg-red-50 text-red-700" },
};

export const ESTADOS_COMPLEMENTO_ENVIABLES: EstadoComplemento[] = ["borrador", "en-proceso", "rechazado"];

export const ACCION_EDITOR_COMPLEMENTO: Record<EstadoComplemento, { modo: ModoInvestigacionAnalista; etiqueta: string }> = {
  borrador: { modo: "iniciar", etiqueta: "Iniciar" },
  "en-proceso": { modo: "continuar", etiqueta: "Continuar" },
  rechazado: { modo: "continuar", etiqueta: "Corregir" },
  "pendiente-aprobacion": { modo: "detalle", etiqueta: "Ver" },
  aprobado: { modo: "detalle", etiqueta: "Ver" },
};

export const RUTA_EDITOR_TRADUCTOR = "/traductor/traduccion";

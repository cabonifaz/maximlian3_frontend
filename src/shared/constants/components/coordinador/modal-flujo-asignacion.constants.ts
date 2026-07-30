import type { AssignmentRole, AssignmentRoleSelection } from "@maximilian/shared/types/asignacion.type";

export const PEDIDO_COLUMNS = [
  { label: "Cliente", width: "24%" },
  { label: "Investigado", width: "24%" },
  { label: "Idioma del informe", width: "14%" },
  { label: "Tipo de trámite", width: "16%" },
  { label: "Vencimiento", width: "14%" },
  { label: "Ver detalle", className: "text-center", width: "8%" },
];

export const ASIGNACIONES_INICIALES: AssignmentRoleSelection[] = [
  { role: "analyst", assignee: null },
  { role: "translator", assignee: null },
];

export const ID_ESTADO_ASIGNACION_SIN_ASIGNACION_PENDIENTE = 4;

export const ETIQUETAS_ROL: Record<AssignmentRole, string> = {
  analyst: "Analista",
  translator: "Traductor(a)",
};

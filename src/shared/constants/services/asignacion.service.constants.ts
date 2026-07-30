import type { AssignmentRole } from "@maximilian/shared/types/asignacion.type";

export const ESTADO_ASIGNACION_ANALISTA = 1;

export const ESTADO_ASIGNACION_TRADUCTOR = 2;

export const ESTADO_REASIGNACION_ANALISTA = 4;

export const ESTADO_REASIGNACION_TRADUCTOR = 5;

export const IDS_ROL_POR_TIPO: Record<AssignmentRole, number> = {
  translator: 4,
  analyst: 3,
};

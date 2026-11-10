import type { EtapaFlujoPedido, PrioridadPedido } from "@maximilian/shared/types/flujo-informe.type";

export const ORDEN_PRIORIDAD_PEDIDO: Record<PrioridadPedido, number> = {
  "super-flash": 0,
  express: 1,
  normal: 2,
};

export const ETAPAS_CON_TRADUCTOR_ASIGNABLE: EtapaFlujoPedido[] = [
  "listo-traduccion",
  "en-traduccion",
  "por-revisar",
];

export const MENSAJE_ANALISTA_NO_FINALIZADO =
  "El analista aún no finaliza su informe. Podrás asignar un traductor cuando lo termine.";

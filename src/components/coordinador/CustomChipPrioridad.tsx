import { Zap } from "lucide-react";
import { PRIORIDAD_PEDIDO_VISUAL } from "@maximilian/shared/constants/pages/Coordinador/flujo-asignaciones.constants";
import type { PrioridadPedido } from "@maximilian/shared/types/flujo-informe.type";

export function CustomChipPrioridad({ prioridad }: { prioridad: PrioridadPedido }) {
  const { etiqueta, clase } = PRIORIDAD_PEDIDO_VISUAL[prioridad];

  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${clase}`}>
      {prioridad !== "normal" ? <Zap size={12} /> : null}
      {etiqueta}
    </span>
  );
}

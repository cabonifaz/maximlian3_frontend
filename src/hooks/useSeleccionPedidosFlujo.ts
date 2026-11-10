import { useMemo, useState } from "react";
import type { FilaFlujoAsignacion } from "@maximilian/shared/types/flujo-informe.type";

// Selección de pedidos que se conserva al cambiar de página: guarda la fila completa porque el modal de
// asignación necesita el idioma y el investigado de pedidos que ya no están en la página visible.
export function useSeleccionPedidosFlujo(pedidosPagina: FilaFlujoAsignacion[] | undefined) {
  const [seleccion, setSeleccion] = useState<Map<number, FilaFlujoAsignacion>>(new Map());

  const idsSeleccionados = useMemo(() => new Set(seleccion.keys()), [seleccion]);
  const pedidosSeleccionados = useMemo(() => Array.from(seleccion.values()), [seleccion]);

  const cambiarSeleccion = (ids: Set<number>) => {
    setSeleccion((actual) => {
      const siguiente = new Map<number, FilaFlujoAsignacion>();
      ids.forEach((idPedido) => {
        const pedido = actual.get(idPedido) ?? pedidosPagina?.find((fila) => fila.idPedido === idPedido);
        if (pedido) siguiente.set(idPedido, pedido);
      });
      return siguiente;
    });
  };

  const conservarSolo = (ids: number[]) => {
    const idsConservados = new Set(ids);
    setSeleccion((actual) => new Map([...actual].filter(([idPedido]) => idsConservados.has(idPedido))));
  };

  return {
    cambiarSeleccion,
    conservarSolo,
    idsSeleccionados,
    limpiarSeleccion: () => setSeleccion(new Map()),
    pedidosSeleccionados,
  };
}

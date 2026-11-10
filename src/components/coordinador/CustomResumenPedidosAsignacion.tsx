import { Info } from "lucide-react";
import type { FilaFlujoAsignacion, RolFlujoAsignacion } from "@maximilian/shared/types/flujo-informe.type";
import { obtenerMensajeModoTraductor } from "@maximilian/shared/utils/flujo-informe.util";

interface PropsCustomResumenPedidosAsignacion {
  pedidos: FilaFlujoAsignacion[];
  rol: RolFlujoAsignacion;
}

export function CustomResumenPedidosAsignacion({ pedidos, rol }: PropsCustomResumenPedidosAsignacion) {
  return (
    <>
      <ul className="max-h-40 divide-y divide-gray-100 overflow-y-auto rounded-xl bg-gray-50 text-sm text-gray-700">
        {pedidos.map((pedido) => (
          <li key={pedido.idPedido} className="px-4 py-2.5">
            <p className="truncate font-semibold" title={pedido.investigado}>{pedido.investigado}</p>
            <p className="truncate text-xs text-slate-500">
              {pedido.cliente} · {pedido.pais} · {pedido.idiomaInforme}
            </p>
          </li>
        ))}
      </ul>

      {rol === "traductor" ? (
        <p className="flex items-start gap-2 rounded-xl bg-blue-50 px-4 py-3 text-xs text-blue-800">
          <Info size={14} className="mt-0.5 shrink-0" />
          {obtenerMensajeModoTraductor(pedidos)}
        </p>
      ) : null}
    </>
  );
}

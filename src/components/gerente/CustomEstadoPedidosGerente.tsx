import { BarChart3 } from "lucide-react";
import { estadosPedidosGerente } from "@maximilian/shared/constants/pages/Gerente/dashboard-gerente.constants";
import { NumberTicker } from "@maximilian/components/common/shadcn/number-ticker";
import { CustomCargadorTarjetaDashboard } from "./CustomCargadorTarjetaDashboard";
import type { PropsTarjetaDashboard } from "@maximilian/shared/types/dashboard.type";

export function CustomEstadoPedidosGerente({
  estaCargando = false,
}: PropsTarjetaDashboard) {
  if (estaCargando) {
    return (
      <CustomCargadorTarjetaDashboard
        titulo="estado de pedidos"
        variante="grafica"
      />
    );
  }

  return (
    <section className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800">Estado de Pedidos</h2>
        <BarChart3 className="text-indigo-500" size={24} />
      </div>

      <div className="space-y-4">
        {estadosPedidosGerente.map((estado) => (
          <div key={estado.nombre}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium text-slate-600">
                <span className={`h-2.5 w-2.5 rounded-full ${estado.color}`} />
                {estado.nombre}
              </span>
              <NumberTicker
                value={estado.cantidad}
                className="font-bold tracking-normal text-slate-700"
              />
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`animacion-crecer-horizontal-dashboard h-full rounded-full ${estado.color}`}
                style={{ width: `${estado.porcentaje}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

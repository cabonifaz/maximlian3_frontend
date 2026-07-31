import { CalendarDays } from "lucide-react";
import {
  facturacionMensualGerente,
  fechasFacturacionGerente,
  resumenFacturacionGerente,
} from "@maximilian/shared/constants/pages/Gerente/dashboard-gerente.constants";
import { NumberTicker } from "@maximilian/components/common/shadcn/number-ticker";
import { CustomCargadorTarjetaDashboard } from "./CustomCargadorTarjetaDashboard";
import type { PropsTarjetaDashboard } from "@maximilian/shared/types/dashboard.type";

export function CustomFacturacionGerente({
  estaCargando = false,
}: PropsTarjetaDashboard) {
  if (estaCargando) {
    return (
      <CustomCargadorTarjetaDashboard
        titulo="pedidos facturados"
        variante="grafica"
      />
    );
  }

  return (
    <section className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-bold text-slate-800">Pedidos Facturados</h2>

      <div className="mb-5 grid grid-cols-2 gap-3">
        {fechasFacturacionGerente.map((periodo) => (
          <div
            key={periodo.etiqueta}
            className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
          >
            <span className="text-[9px] uppercase text-slate-400">
              {periodo.etiqueta}
            </span>
            <span className="text-[10px] font-semibold text-slate-600">{periodo.fecha}</span>
            <CalendarDays size={12} className="text-slate-400" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_1.25fr]">
        <div>
          <strong className="block text-2xl font-bold text-slate-800">
            $
            <NumberTicker
              value={resumenFacturacionGerente.montoTotal}
              decimalPlaces={2}
              className="tracking-normal text-slate-800"
            />
          </strong>
          <span className="text-[10px] text-slate-400">Monto Total Mensual</span>
          <div className="mt-5 flex gap-6">
            <div>
              <NumberTicker
                value={resumenFacturacionGerente.ordenes}
                className="block text-sm font-bold tracking-normal text-slate-700"
              />
              <span className="text-[9px] uppercase text-slate-400">Órdenes</span>
            </div>
            <div>
              <strong className="block text-sm text-slate-700">
                $
                <NumberTicker
                  value={resumenFacturacionGerente.promedio}
                  decimalPlaces={1}
                  className="tracking-normal text-slate-700"
                />
              </strong>
              <span className="text-[9px] uppercase text-slate-400">Promedio</span>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-3 text-[9px] font-semibold uppercase text-slate-400">
            Tendencia de facturación
          </p>
          <div className="flex h-28 items-end justify-between gap-2 border-b border-slate-100">
            {facturacionMensualGerente.map((dato, indice) => (
              <div key={dato.mes} className="flex flex-1 flex-col items-center justify-end gap-2">
                <div
                  className={`animacion-crecer-vertical-dashboard w-full max-w-8 rounded-t-sm ${dato.altura} ${dato.color}`}
                  style={{ animationDelay: `${indice * 80}ms` }}
                />
                <span className="text-[8px] text-slate-400">{dato.mes}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

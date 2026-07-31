import { CalendarDays } from "lucide-react";
import { facturacionMensualGerente } from "@maximilian/shared/constants/pages/Gerente/dashboard-gerente.constants";

export function CustomFacturacionGerente() {
  return (
    <section className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-bold text-slate-800">Pedidos Facturados</h2>

      <div className="mb-5 grid grid-cols-2 gap-3">
        {["01/07/2026", "31/07/2026"].map((fecha, indice) => (
          <div
            key={fecha}
            className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
          >
            <span className="text-[9px] uppercase text-slate-400">
              {indice === 0 ? "Desde" : "Hasta"}
            </span>
            <span className="text-[10px] font-semibold text-slate-600">{fecha}</span>
            <CalendarDays size={12} className="text-slate-400" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_1.25fr]">
        <div>
          <strong className="block text-2xl font-bold text-slate-800">$142,500.00</strong>
          <span className="text-[10px] text-slate-400">Monto Total Mensual</span>
          <div className="mt-5 flex gap-6">
            <div>
              <strong className="block text-sm text-slate-700">312</strong>
              <span className="text-[9px] uppercase text-slate-400">Órdenes</span>
            </div>
            <div>
              <strong className="block text-sm text-slate-700">$456.7</strong>
              <span className="text-[9px] uppercase text-slate-400">Promedio</span>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-3 text-[9px] font-semibold uppercase text-slate-400">
            Tendencia de facturación
          </p>
          <div className="flex h-28 items-end justify-between gap-2 border-b border-slate-100">
            {facturacionMensualGerente.map((dato) => (
              <div key={dato.mes} className="flex flex-1 flex-col items-center justify-end gap-2">
                <div className={`w-full max-w-8 rounded-t-sm ${dato.altura} ${dato.color}`} />
                <span className="text-[8px] text-slate-400">{dato.mes}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

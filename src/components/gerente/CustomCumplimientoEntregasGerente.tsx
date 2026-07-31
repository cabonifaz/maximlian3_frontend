import { BarChart3, CalendarDays, Search } from "lucide-react";
import { colaboradoresGerente } from "@maximilian/shared/constants/pages/Gerente/dashboard-gerente.constants";

export function CustomCumplimientoEntregasGerente() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-slate-800">Cumplimiento de entregas</h2>
        <div className="flex items-center gap-4 rounded-lg bg-slate-50 px-4 py-2 text-[10px] font-semibold">
          <span className="text-emerald-600">● 88% Entregados</span>
          <span className="text-rose-500">● 12% Atrasados</span>
          <BarChart3 size={20} className="text-emerald-500" />
        </div>
      </div>

      <div className="mb-6 grid gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 md:grid-cols-4">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-400">
          <Search size={14} />
          Buscar colaborador...
        </div>
        {["Fecha inicio", "Fecha fin"].map((etiqueta) => (
          <div
            key={etiqueta}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
          >
            <span className="text-[10px] text-slate-400">{etiqueta}</span>
            <CalendarDays size={14} className="text-slate-400" />
          </div>
        ))}
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] text-slate-500">
          Todos los estados
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[650px]">
          <div className="grid grid-cols-[1.6fr_1fr_1fr_0.8fr] px-3 pb-3 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
            <span>Colaborador</span>
            <span>Órdenes (mes)</span>
            <span>Cumplimiento</span>
            <span>Eficiencia</span>
          </div>
          {colaboradoresGerente.map((colaborador) => (
            <div
              key={colaborador.nombre}
              className="grid grid-cols-[1.6fr_1fr_1fr_0.8fr] items-center border-t border-slate-100 px-3 py-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-500">
                  {colaborador.iniciales}
                </span>
                <div>
                  <strong className="block text-slate-700">{colaborador.nombre}</strong>
                  <span className="text-[9px] text-slate-400">{colaborador.rol}</span>
                </div>
              </div>
              <strong className="text-slate-700">{colaborador.ordenes}</strong>
              <strong className={colaborador.colorEficiencia}>{colaborador.cumplimiento}</strong>
              <span className={colaborador.colorEficiencia}>◯ {colaborador.eficiencia}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

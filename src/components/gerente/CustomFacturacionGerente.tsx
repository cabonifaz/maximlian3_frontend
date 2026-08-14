import { CalendarDays } from "lucide-react";
import { NumberTicker } from "@maximilian/components/common/shadcn/number-ticker";
import { CustomCargadorTarjetaDashboard } from "./CustomCargadorTarjetaDashboard";
import { useResumenFacturacionDashboard } from "@maximilian/hooks/useDashboardGerente";
import { formatearFechaIsoADdMmYyyy } from "@maximilian/shared/utils/fecha.util";

export function CustomFacturacionGerente() {
  const {
    resumenFacturacion,
    estaCargandoResumenFacturacion,
  } = useResumenFacturacionDashboard();

  if (estaCargandoResumenFacturacion) {
    return (
      <CustomCargadorTarjetaDashboard
        titulo="pedidos facturados"
        variante="grafica"
      />
    );
  }

  const fechas = [
    {
      etiqueta: "Desde",
      fecha: resumenFacturacion?.fechaDesde
        ? formatearFechaIsoADdMmYyyy(resumenFacturacion.fechaDesde)
        : "-",
    },
    {
      etiqueta: "Hasta",
      fecha: resumenFacturacion?.fechaHasta
        ? formatearFechaIsoADdMmYyyy(resumenFacturacion.fechaHasta)
        : "-",
    },
  ];

  return (
    <section className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-bold text-slate-800">
        Pedidos Facturados
      </h2>

      <div className="mb-5 grid grid-cols-2 gap-3">
        {fechas.map((periodo) => (
          <div
            key={periodo.etiqueta}
            className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
          >
            <span className="text-[9px] uppercase text-slate-400">
              {periodo.etiqueta}
            </span>
            <span className="text-[10px] font-semibold text-slate-600">
              {periodo.fecha}
            </span>
            <CalendarDays size={12} className="text-slate-400" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4">
          <strong className="block text-2xl font-bold text-slate-800">
            {resumenFacturacion?.monedaIcono}
            <NumberTicker
              value={resumenFacturacion?.montoTotalMensual ?? 0}
              rigidez={260}
              decimalPlaces={2}
              className="tracking-normal text-slate-800"
            />
          </strong>
          <span className="text-[10px] text-slate-400">
            Monto Total Mensual
          </span>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <NumberTicker
            value={resumenFacturacion?.cantidadFacturasEmitidas ?? 0}
            rigidez={260}
            className="block text-2xl font-bold tracking-normal text-slate-800"
          />
          <span className="text-[10px] uppercase text-slate-400">
            Facturas emitidas
          </span>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <strong className="block text-2xl font-bold text-slate-800">
            {resumenFacturacion?.monedaIcono}
            <NumberTicker
              value={resumenFacturacion?.promedioIngresoMensual ?? 0}
              rigidez={260}
              decimalPlaces={2}
              className="tracking-normal text-slate-800"
            />
          </strong>
          <span className="text-[10px] uppercase text-slate-400">
            Promedio mensual
          </span>
        </div>
      </div>
    </section>
  );
}
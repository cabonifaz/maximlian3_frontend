import { useEffect, useState } from "react";
import { NumberTicker } from "@maximilian/components/common/shadcn/number-ticker";
import type { EvolucionMensualFacturacionAnaliticaDashboard } from "@maximilian/shared/types/dashboard.type";

interface PropsCustomEvolucionFacturacionAnaliticaGerente {
  evolucionMensual: EvolucionMensualFacturacionAnaliticaDashboard[];
  monedaIcono: string;
}

export function CustomEvolucionFacturacionAnaliticaGerente({
  evolucionMensual,
  monedaIcono,
}: PropsCustomEvolucionFacturacionAnaliticaGerente) {
  const firmaEvolucion = evolucionMensual
    .map((mes) => `${mes.mes}:${mes.montoFacturado}`)
    .join("|");

  return (
    <section className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-5 text-sm font-bold text-slate-800">Evolución de facturación por mes</h3>

      {evolucionMensual.length === 0 ? (
        <p className="py-10 text-center text-xs italic text-slate-400">
          No hay facturación en el período seleccionado.
        </p>
      ) : (
        <BarrasEvolucionFacturacionAnaliticaGerente
          key={firmaEvolucion}
          evolucionMensual={evolucionMensual}
          monedaIcono={monedaIcono}
        />
      )}
    </section>
  );
}

function BarrasEvolucionFacturacionAnaliticaGerente({
  evolucionMensual,
  monedaIcono,
}: PropsCustomEvolucionFacturacionAnaliticaGerente) {
  const montoMaximo = Math.max(1, ...evolucionMensual.map((mes) => mes.montoFacturado));
  const [barrasCrecidas, setBarrasCrecidas] = useState(false);

  useEffect(() => {
    const temporizador = setTimeout(() => setBarrasCrecidas(true), 20);
    return () => clearTimeout(temporizador);
  }, []);

  return (
    <div className="flex h-40 items-end gap-3">
      {evolucionMensual.map((mes, indice) => (
        <div key={mes.mes} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="text-[9px] font-semibold text-slate-500">
            {monedaIcono}
            <NumberTicker
              value={mes.montoFacturado}
              decimalPlaces={0}
              rigidez={260}
              className="tracking-normal text-inherit"
            />
          </span>
          <div className="flex h-28 w-full items-end overflow-hidden rounded-t-md bg-slate-100">
            <div
              className="w-full rounded-t-md bg-brand-wine transition-[height] duration-700 ease-out"
              style={{
                height: barrasCrecidas
                  ? `${Math.max(4, (mes.montoFacturado / montoMaximo) * 100)}%`
                  : "0%",
                transitionDelay: `${indice * 60}ms`,
              }}
            />
          </div>
          <span className="text-[10px] font-semibold uppercase text-slate-400">
            {mes.etiqueta}
          </span>
        </div>
      ))}
    </div>
  );
}

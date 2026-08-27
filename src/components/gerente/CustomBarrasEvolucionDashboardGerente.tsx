import { useEffect, useState } from "react";
import { NumberTicker } from "@maximilian/components/common/shadcn/number-ticker";

interface DatoBarraEvolucionDashboard {
  periodo: string;
  etiqueta: string;
  valor: number;
}

interface PropsCustomBarrasEvolucionDashboardGerente {
  datos: DatoBarraEvolucionDashboard[];
  prefijo?: string;
  decimalPlaces?: number;
  mensajeVacio?: string;
}

export function CustomBarrasEvolucionDashboardGerente({
  datos,
  prefijo = "",
  decimalPlaces = 0,
  mensajeVacio = "No hay datos en el período seleccionado.",
}: PropsCustomBarrasEvolucionDashboardGerente) {
  const firmaDatos = datos.map((dato) => `${dato.periodo}:${dato.valor}`).join("|");

  if (datos.length === 0) {
    return <p className="py-10 text-center text-xs italic text-slate-400">{mensajeVacio}</p>;
  }

  return (
    <BarrasEvolucionDashboardGerente
      key={firmaDatos}
      datos={datos}
      prefijo={prefijo}
      decimalPlaces={decimalPlaces}
    />
  );
}

function BarrasEvolucionDashboardGerente({
  datos,
  prefijo,
  decimalPlaces,
}: Required<Pick<PropsCustomBarrasEvolucionDashboardGerente, "datos" | "prefijo" | "decimalPlaces">>) {
  const valorMaximo = Math.max(1, ...datos.map((dato) => dato.valor));
  const [barrasCrecidas, setBarrasCrecidas] = useState(false);

  useEffect(() => {
    const temporizador = setTimeout(() => setBarrasCrecidas(true), 20);
    return () => clearTimeout(temporizador);
  }, []);

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex h-40 min-w-full items-end gap-3">
        {datos.map((dato, indice) => (
          <div key={dato.periodo} className="flex w-11 shrink-0 flex-col items-center gap-1.5">
            <span className="whitespace-nowrap text-[9px] font-semibold text-slate-500">
              {prefijo}
              <NumberTicker
                value={dato.valor}
                decimalPlaces={decimalPlaces}
                rigidez={260}
                className="tracking-normal text-inherit"
              />
            </span>
            <div className="flex h-28 w-full items-end overflow-hidden rounded-t-md bg-slate-100">
              <div
                className="w-full rounded-t-md bg-brand-wine transition-[height] duration-700 ease-out"
                style={{
                  height: barrasCrecidas
                    ? `${Math.max(4, (dato.valor / valorMaximo) * 100)}%`
                    : "0%",
                  transitionDelay: `${indice * 60}ms`,
                }}
              />
            </div>
            <span className="whitespace-nowrap text-[10px] font-semibold uppercase text-slate-400">
              {dato.etiqueta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

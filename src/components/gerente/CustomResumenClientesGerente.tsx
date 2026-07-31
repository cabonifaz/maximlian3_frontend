import { useResumenClientesDashboard } from "@maximilian/hooks/useDashboardGerente";
import { formatearFechaVisual } from "@maximilian/shared/utils/fecha.util";
import { NumberTicker } from "@maximilian/components/common/shadcn/number-ticker";
import { CustomCargadorTarjetaDashboard } from "./CustomCargadorTarjetaDashboard";
import type { CSSProperties } from "react";

export function CustomResumenClientesGerente() {
  const { resumenClientes, estaCargandoResumenClientes } =
    useResumenClientesDashboard();
  const datosResumen = [
    {
      etiqueta: "Total de clientes",
      valor: resumenClientes?.totalClientes ?? 0,
      variacion: resumenClientes?.porcentajeCrecimiento,
    },
    {
      etiqueta: "Activos",
      valor: resumenClientes?.totalActivos ?? 0,
    },
    {
      etiqueta: "Inactivos",
      valor: resumenClientes?.totalInactivos ?? 0,
    },
  ];
  const fechaActualizacion = formatearFechaVisual(
    resumenClientes?.fechaActualizacion,
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
    "es-BO",
    "-",
  );
  const estiloPorcentaje = resumenClientes
    ? ({
        "--porcentaje-dashboard": resumenClientes.porcentajeActivos,
      } as CSSProperties)
    : undefined;

  if (estaCargandoResumenClientes) {
    return (
      <CustomCargadorTarjetaDashboard
        titulo="resumen de clientes"
        variante="resumen"
      />
    );
  }

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      aria-busy={estaCargandoResumenClientes}
    >
      <div className="mb-5 flex items-start justify-between">
        <h2 className="text-sm font-bold text-slate-800">Resumen de Clientes</h2>
        <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
          Actualizado {fechaActualizacion}
        </span>
      </div>

      <div className="grid items-center gap-5 sm:grid-cols-[repeat(3,1fr)_112px]">
        {datosResumen.map((dato) => (
          <div
            key={dato.etiqueta}
            className="border-b border-slate-100 pb-4 sm:border-r sm:border-b-0 sm:pb-0"
          >
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {dato.etiqueta}
            </p>
            <div className="flex items-baseline gap-2">
              <NumberTicker
                value={dato.valor}
                className="text-2xl font-bold tracking-normal text-slate-800"
              />
              {dato.variacion !== undefined ? (
                <span
                  className={`text-xs font-bold ${
                    (resumenClientes?.porcentajeCrecimiento ?? 0) < 0
                      ? "text-rose-500"
                      : "text-emerald-500"
                  }`}
                >
                  {dato.variacion > 0 ? "+" : ""}
                  <NumberTicker
                    value={dato.variacion}
                    decimalPlaces={2}
                    className="tracking-normal text-inherit"
                  />
                  %
                </span>
              ) : null}
            </div>
          </div>
        ))}

        <div
          className="grafica-circular-dashboard mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-200"
          style={estiloPorcentaje}
        >
          <div className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-white">
            <strong className="text-sm text-slate-800">
              <NumberTicker
                value={resumenClientes?.porcentajeActivos ?? 0}
                decimalPlaces={2}
                className="tracking-normal text-slate-800"
              />
              %
            </strong>
            <span className="text-[8px] font-semibold uppercase text-slate-400">Activo</span>
          </div>
        </div>
      </div>
    </section>
  );
}

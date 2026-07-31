import { useDashboardGerente } from "@maximilian/hooks/useDashboardGerente";
import { formatearFechaVisual } from "@maximilian/shared/utils/fecha.util";

export function CustomResumenClientesGerente() {
  const { resumenClientes, estaCargandoResumenClientes } =
    useDashboardGerente();
  const datosResumen = [
    {
      etiqueta: "Total de clientes",
      valor: resumenClientes?.totalClientes ?? "-",
      variacion: resumenClientes
        ? `${resumenClientes.porcentajeCrecimiento > 0 ? "+" : ""}${resumenClientes.porcentajeCrecimiento}%`
        : "",
    },
    {
      etiqueta: "Activos",
      valor: resumenClientes?.totalActivos ?? "-",
      variacion: "",
    },
    {
      etiqueta: "Inactivos",
      valor: resumenClientes?.totalInactivos ?? "-",
      variacion: "",
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
    ? {
        background: `conic-gradient(#19b98a 0 ${resumenClientes.porcentajeActivos}%, #e2e8f0 ${resumenClientes.porcentajeActivos}% 100%)`,
      }
    : undefined;

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
              <strong
                className={`text-2xl font-bold text-slate-800 ${estaCargandoResumenClientes ? "animate-pulse" : ""}`}
              >
                {dato.valor}
              </strong>
              {dato.variacion ? (
                <span
                  className={`text-xs font-bold ${
                    (resumenClientes?.porcentajeCrecimiento ?? 0) < 0
                      ? "text-rose-500"
                      : "text-emerald-500"
                  }`}
                >
                  {dato.variacion}
                </span>
              ) : null}
            </div>
          </div>
        ))}

        <div
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-200"
          style={estiloPorcentaje}
        >
          <div className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-white">
            <strong className="text-sm text-slate-800">
              {resumenClientes
                ? `${resumenClientes.porcentajeActivos}%`
                : "-"}
            </strong>
            <span className="text-[8px] font-semibold uppercase text-slate-400">Activo</span>
          </div>
        </div>
      </div>
    </section>
  );
}

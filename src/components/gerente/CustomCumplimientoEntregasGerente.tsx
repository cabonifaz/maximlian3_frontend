import { BarChart3, Search } from "lucide-react";
import { CustomEncabezadoFiltroTabla } from "@maximilian/components/common/CustomEncabezadoFiltroTabla";
import { CustomFiltroRangoFechas } from "@maximilian/components/common/CustomFiltroRangoFechas";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { NumberTicker } from "@maximilian/components/common/shadcn/number-ticker";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { useCumplimientoEntregasDashboard } from "@maximilian/hooks/useDashboardGerente";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { obtenerCantidadDecimales } from "@maximilian/shared/utils/numero.util";
import { CustomCargadorTarjetaDashboard } from "./CustomCargadorTarjetaDashboard";
import { CustomFilaCumplimientoEntregasGerente } from "./CustomFilaCumplimientoEntregasGerente";

export function CustomCumplimientoEntregasGerente() {
  const {
    busqueda,
    cambiarBusqueda,
    fechaInicio,
    fechaFin,
    fechasInvalidas,
    cambiarFechaInicio,
    cambiarFechaFin,
    limpiarFechaInicio,
    limpiarFechaFin,
    idsEficiencia,
    cambiarEficiencia,
    pagina,
    cambiarPagina,
    respuesta,
    estaCargando,
    estaActualizando,
    hayError,
    recargar,
  } = useCumplimientoEntregasDashboard();

  if (estaCargando) {
    return (
      <CustomCargadorTarjetaDashboard
        titulo="cumplimiento de entregas"
        variante="tabla"
      />
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-slate-800">
          Cumplimiento de entregas
        </h2>
        {respuesta ? (
          <div
            aria-busy={estaActualizando}
            className={`flex items-center gap-4 rounded-lg bg-slate-50 px-4 py-2 text-[10px] font-semibold transition-opacity ${
              estaActualizando ? "animate-pulse opacity-45" : "opacity-100"
            }`}
          >
            <span className="inline-flex items-center gap-1.5 text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              <NumberTicker
                value={respuesta.porcentajeEntregados}
                decimalPlaces={obtenerCantidadDecimales(
                  respuesta.porcentajeEntregados,
                )}
                className="tracking-normal text-inherit"
              />
              % Entregados
            </span>
            <span className="inline-flex items-center gap-1.5 text-rose-500">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              <NumberTicker
                value={respuesta.porcentajeAtrasados}
                decimalPlaces={obtenerCantidadDecimales(
                  respuesta.porcentajeAtrasados,
                )}
                className="tracking-normal text-inherit"
              />
              % Atrasados
            </span>
            <BarChart3
              size={20}
              className="animacion-aparecer-grafica-dashboard text-emerald-500"
            />
          </div>
        ) : null}
      </div>

      <div className="mb-5 flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 lg:flex-row lg:items-end">
        <div className="relative min-w-0 flex-1">
          <CustomLabel
            htmlFor="busqueda-cumplimiento-entregas"
            className="mb-1.5 block text-xs"
          >
            Colaborador
          </CustomLabel>
          <Search
            size={15}
            className="absolute bottom-2.5 left-3 text-slate-400"
          />
          <input
            id="busqueda-cumplimiento-entregas"
            type="search"
            value={busqueda}
            onChange={(evento) => cambiarBusqueda(evento.target.value)}
            placeholder="Buscar colaborador..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-wine/40 focus:ring-2 focus:ring-brand-wine/10"
          />
        </div>

        <CustomFiltroRangoFechas
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          fechasInvalidas={fechasInvalidas}
          onFechaInicioChange={cambiarFechaInicio}
          onFechaFinChange={cambiarFechaFin}
          onLimpiarFechaInicio={limpiarFechaInicio}
          onLimpiarFechaFin={limpiarFechaFin}
        />
      </div>

      <CustomTabla
        columns={[
          { label: "Colaborador", width: "36%" },
          { label: "Órdenes", width: "16%", className: "text-center" },
          {
            label: "Cumplimiento",
            width: "24%",
            className: "text-center",
          },
          {
            label: (
              <CustomEncabezadoFiltroTabla
                titulo="Eficiencia"
                idMaster={TablaMaestraId.EFICIENCIA_CUMPLIMIENTO}
                valores={idsEficiencia}
                onChange={cambiarEficiencia}
                placeholder="Todas"
                multiple={false}
              />
            ),
            width: "24%",
            className: "text-center",
          },
        ]}
        data={respuesta?.lstUsuarios}
        getId={(usuario) => usuario.idUsuario}
        isLoading={estaActualizando}
        isError={hayError}
        onRetry={() => void recargar()}
        emptyMessage="No se encontraron colaboradores."
        errorMessage="No se pudo cargar el cumplimiento de entregas."
        paginaActual={pagina}
        totalPages={Math.max(respuesta?.totalPaginas ?? 1, 1)}
        totalRecords={respuesta?.totalRegistros ?? 0}
        onPageChange={cambiarPagina}
        entityLabel="colaboradores"
        renderRow={(usuario) => (
          <CustomFilaCumplimientoEntregasGerente usuario={usuario} />
        )}
      />
    </section>
  );
}

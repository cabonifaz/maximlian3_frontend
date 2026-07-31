import { Search } from "lucide-react";
import { CustomEncabezadoFiltroTabla } from "@maximilian/components/common/CustomEncabezadoFiltroTabla";
import { CustomFiltroRangoFechas } from "@maximilian/components/common/CustomFiltroRangoFechas";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { useCumplimientoEntregasDashboard } from "@maximilian/hooks/useDashboardGerente";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
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
      <h2 className="mb-5 text-sm font-bold text-slate-800">
        Cumplimiento de entregas
      </h2>

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
          { label: "Órdenes", width: "16%" },
          { label: "Cumplimiento", width: "24%" },
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
          },
        ]}
        data={respuesta?.lstUsuarios}
        getId={(usuario) =>
          usuario.idUsuario * 10_000 + usuario.idRolAsignado
        }
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

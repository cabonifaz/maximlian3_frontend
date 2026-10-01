import { useNavigate } from "react-router";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { CustomEncabezadoFiltroTabla } from "@maximilian/components/common/CustomEncabezadoFiltroTabla";
import { CustomAccionesBandejaAprobacionMigraciones } from "@maximilian/components/coordinador/CustomAccionesBandejaAprobacionMigraciones";
import { CustomModalesAprobacionMigraciones } from "@maximilian/components/coordinador/CustomModalesAprobacionMigraciones";
import { CustomFiltroColumnaFactura } from "@maximilian/components/coordinador/CustomFiltroColumnaFactura";
import { useBandejaAprobacionMigraciones } from "@maximilian/hooks/useBandejaAprobacionMigraciones";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { formatearFechaUtcALocal } from "@maximilian/shared/utils/fecha.util";

export function CustomBandejaAprobacionMigraciones() {
  const navigate = useNavigate();
  const bandeja = useBandejaAprobacionMigraciones();
  const { data, rangoFechas, reiniciarPagina } = bandeja;

  const columnas = [
    { label: "Investigado", width: "22%" },
    {
      label: (
        <CustomEncabezadoFiltroTabla
          titulo="País"
          idMaster={TablaMaestraId.PAIS}
          valores={bandeja.filtroPaises}
          onChange={bandeja.setFiltroPaises}
          onFiltroCambiado={reiniciarPagina}
          multiple={false}
        />
      ),
      width: "13%",
    },
    {
      label: (
        <CustomEncabezadoFiltroTabla
          titulo="Plantilla"
          idMaster={TablaMaestraId.PLANTILLA_INFORME}
          valores={bandeja.filtroPlantillas}
          onChange={bandeja.setFiltroPlantillas}
          onFiltroCambiado={reiniciarPagina}
          multiple={false}
        />
      ),
      width: "15%",
    },
    {
      label: (
        <CustomEncabezadoFiltroTabla
          titulo="Idioma"
          idMaster={TablaMaestraId.IDIOMA}
          valores={bandeja.filtroIdiomas}
          onChange={bandeja.setFiltroIdiomas}
          onFiltroCambiado={reiniciarPagina}
          multiple={false}
        />
      ),
      width: "12%",
    },
    { label: "Usuario", width: "12%" },
    {
      label: (
        <CustomFiltroColumnaFactura
          titulo="Fecha"
          fechaDesde={rangoFechas.fechaInicioFiltro}
          fechaHasta={rangoFechas.fechaFinFiltro}
          fechasInvalidas={rangoFechas.fechasInvalidas}
          onCambiarFechaDesde={rangoFechas.cambiarFechaInicioFiltro}
          onCambiarFechaHasta={rangoFechas.cambiarFechaFinFiltro}
        />
      ),
      width: "14%",
    },
    { label: "Acción", className: "text-right", width: "12%" },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-black">Migración</h1>
            <p className="mt-2 text-sm text-gray-500">Informes pendientes de aprobación.</p>
          </div>

          <CustomAccionesBandejaAprobacionMigraciones
            acciones={bandeja.acciones}
            soloMuestra={bandeja.soloMuestra}
            terminoBusqueda={bandeja.terminoBusqueda}
            totalMuestra={data?.totalMuestra}
            onAlternarSoloMuestra={bandeja.alternarSoloMuestra}
            onTerminoBusquedaChange={bandeja.cambiarTerminoBusqueda}
          />
        </div>

        <CustomTabla
          columns={columnas}
          data={data?.lstInformes}
          getId={(registro) => registro.idInforme}
          isLoading={bandeja.isLoading}
          isError={bandeja.isError}
          onRetry={() => void bandeja.refetch()}
          errorMessage="No se pudo cargar la bandeja de migración."
          paginaActual={bandeja.paginaActual}
          totalPages={data?.totalPaginas ?? 1}
          totalRecords={data?.totalRegistros ?? 0}
          entityLabel="informes"
          onPageChange={bandeja.setPaginaActual}
          emptyMessage={bandeja.soloMuestra
            ? "No hay informes de la muestra pendientes de aprobación."
            : "No hay informes pendientes de aprobación."}
          selectable
          selectedIds={bandeja.idsSeleccionados}
          onSelectionChange={bandeja.setIdsSeleccionados}
          renderRow={(registro) => (
            <>
              <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                  <span>{registro.investigado}</span>
                  {registro.esMuestra ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                      Muestra
                    </span>
                  ) : null}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500">{registro.pais}</td>
              <td className="px-6 py-4 text-sm text-slate-500">{registro.plantilla}</td>
              <td className="px-6 py-4 text-sm text-slate-500">{registro.idioma}</td>
              <td className="px-6 py-4 text-sm font-medium text-slate-700">{registro.usuario}</td>
              <td className="px-6 py-4 text-sm text-slate-500">{formatearFechaUtcALocal(registro.fecha)}</td>
              <td className="px-6 py-4">
                <div className="flex justify-end">
                  <CustomButton
                    size="sm"
                    className="h-10 w-36 justify-center px-3 text-[11px] uppercase tracking-[0.12em]"
                    onClick={() => navigate(
                      `/coordinador/migraciones/${registro.idInforme}?idPedido=${registro.idPedido}`,
                      { state: registro },
                    )}
                  >
                    Revisar
                  </CustomButton>
                </div>
              </td>
            </>
          )}
        />
      </section>

      <CustomModalesAprobacionMigraciones
        acciones={bandeja.acciones}
        totalRegistros={data?.totalRegistros ?? 0}
        tieneFiltrosActivos={bandeja.tieneFiltrosActivos}
      />
    </div>
  );
}

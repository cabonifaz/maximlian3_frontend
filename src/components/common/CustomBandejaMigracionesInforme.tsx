import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router";
import { CustomChipEstado } from "@maximilian/components/common/CustomChipEstado";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { CustomTarjetaResumenMigracion } from "@maximilian/components/common/CustomTarjetaResumenMigracion";
import { CustomTarjetaResumenSkeleton } from "@maximilian/components/common/CustomTarjetaResumenSkeleton";
import { useBandejaMigracionesInforme } from "@maximilian/hooks/useBandejaMigracionesInforme";
import { COLUMNAS_BANDEJA_MIGRACIONES_INFORME } from "@maximilian/shared/constants/components/common/custom-bandeja-migraciones-informe.constants";
import type { EstadoMigracionInforme, RolMigracionInforme } from "@maximilian/shared/types/informe-migracion.type";

interface PropsCustomBandejaMigracionesInforme {
  rol: RolMigracionInforme;
}

function obtenerColorEstado(estado: EstadoMigracionInforme) {
  if (estado === "aprobado") return "bg-emerald-50 text-emerald-700";
  if (estado === "rechazado") return "bg-rose-50 text-rose-700";
  if (estado === "pendiente-aprobacion") return "bg-orange-50 text-orange-700";
  if (estado === "en-proceso") return "bg-blue-50 text-blue-700";
  return "bg-slate-100 text-slate-600";
}

function esEstadoEditable(estado: EstadoMigracionInforme) {
  return estado === "borrador" || estado === "en-proceso" || estado === "rechazado";
}

export function CustomBandejaMigracionesInforme({ rol }: PropsCustomBandejaMigracionesInforme) {
  const navigate = useNavigate();
  const {
    data,
    isError,
    isLoading,
    paginaActual,
    refetch,
    setPaginaActual,
    setTerminoBusqueda,
    tarjetasResumen,
    terminoBusqueda,
  } = useBandejaMigracionesInforme(rol);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {isLoading
          ? tarjetasResumen.map((tarjeta) => <CustomTarjetaResumenSkeleton key={tarjeta.id} />)
          : tarjetasResumen.map((tarjeta) => <CustomTarjetaResumenMigracion key={tarjeta.id} {...tarjeta} />)}
      </div>

      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-black">Migración de informes</h1>
            <p className="mt-2 text-sm text-gray-500">Informes creados sin pedido ni asignación previa.</p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <label className="relative w-full lg:w-80">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                value={terminoBusqueda}
                onChange={(evento) => {
                  setTerminoBusqueda(evento.target.value);
                  setPaginaActual(1);
                }}
                placeholder="Buscar por investigado..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
              />
            </label>
            <button
              type="button"
              onClick={() => navigate(`/${rol}/migraciones/nueva`)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-wine px-5 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
            >
              <Plus size={17} />
              Añadir informe
            </button>
          </div>
        </div>

        <CustomTabla
          columns={COLUMNAS_BANDEJA_MIGRACIONES_INFORME}
          data={data?.listaMigraciones}
          getId={(registro) => registro.idInformeMigracion}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          errorMessage="No se pudo cargar la bandeja de migraciones."
          paginaActual={paginaActual}
          totalPages={data?.totalPaginas ?? 1}
          totalRecords={data?.totalRegistros ?? 0}
          entityLabel="migraciones"
          onPageChange={setPaginaActual}
          emptyMessage="No se encontraron informes migrados."
          renderRow={(registro) => (
            <>
              <td className="px-6 py-4 text-sm font-semibold text-slate-700">{registro.investigado}</td>
              <td className="px-6 py-4 text-sm text-slate-500">{registro.pais}</td>
              <td className="px-6 py-4 text-sm text-slate-500">{registro.plantilla}</td>
              <td className="px-6 py-4 text-sm text-slate-500">
                {registro.requiereTraduccion
                  ? `${registro.idiomaOrigen} → ${registro.idiomaDestino}`
                  : registro.idiomaOrigen}
              </td>
              <td className="px-6 py-4 text-sm text-slate-500">{registro.fechaModificacion}</td>
              <td className="px-6 py-4 text-center">
                <CustomChipEstado forma="rectangular" tamano="amplio" claseColor={obtenerColorEstado(registro.estado)}>
                  {registro.estadoDescripcion}
                </CustomChipEstado>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end">
                  <CustomButton
                    size="sm"
                    className="h-10 w-36 justify-center px-3 text-[11px] uppercase tracking-[0.12em]"
                    onClick={() => navigate(
                      `/${rol}/migraciones/${registro.idInformeMigracion}?modo=${esEstadoEditable(registro.estado) ? "continuar" : "detalle"}`,
                    )}
                  >
                    {esEstadoEditable(registro.estado) ? "Continuar" : "Ver informe"}
                  </CustomButton>
                </div>
              </td>
            </>
          )}
        />
      </section>
    </div>
  );
}

import { CheckCircle2, CircleX, Clock3, FileClock, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router";
import { CustomChipEstado } from "@maximilian/components/common/CustomChipEstado";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { CustomTarjetaResumenSkeleton } from "@maximilian/components/common/CustomTarjetaResumenSkeleton";
import { useBandejaMigracionesInforme } from "@maximilian/hooks/useBandejaMigracionesInforme";
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

function obtenerIconoTarjeta(id: string) {
  if (id === "aprobado") return <CheckCircle2 size={18} className="text-emerald-500" />;
  if (id === "rechazado") return <CircleX size={18} className="text-rose-500" />;
  if (id === "pendiente") return <Clock3 size={18} className="text-orange-500" />;
  return <FileClock size={18} className="text-blue-500" />;
}

export function CustomBandejaMigracionesInforme({ rol }: PropsCustomBandejaMigracionesInforme) {
  const navigate = useNavigate();
  const {
    data,
    esCoordinador,
    isError,
    isLoading,
    paginaActual,
    refetch,
    setPaginaActual,
    setTerminoBusqueda,
    tarjetasResumen,
    terminoBusqueda,
  } = useBandejaMigracionesInforme(rol);

  const columnas = [
    { label: "Investigado", width: "22%" },
    { label: "País", width: "12%" },
    { label: "Plantilla", width: "17%" },
    { label: "Idiomas", width: "15%" },
    ...(esCoordinador ? [{ label: "Creado por", width: "14%" }] : []),
    { label: "Última modificación", width: "12%" },
    { label: "Estado", className: "text-center", width: "14%" },
    ...(!esCoordinador ? [{ label: "Acción", className: "text-right", width: "13%" }] : []),
  ];

  return (
    <div className="space-y-8">
      <div className={`grid gap-4 sm:grid-cols-2 ${esCoordinador ? "xl:grid-cols-3" : "xl:grid-cols-5"}`}>
        {isLoading
          ? tarjetasResumen.map((tarjeta) => <CustomTarjetaResumenSkeleton key={tarjeta.id} />)
          : tarjetasResumen.map((tarjeta) => (
              <article key={tarjeta.id} className="rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50">
                    {obtenerIconoTarjeta(tarjeta.id)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    {tarjeta.titulo}
                  </span>
                </div>
                <p className="text-3xl font-bold text-brand-black">{tarjeta.valor}</p>
              </article>
            ))}
      </div>

      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-black">
              {esCoordinador ? "Aprobación de migraciones" : "Migración de informes"}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {esCoordinador
                ? "Revisión independiente de informes migrados sin pedido."
                : "Informes creados sin pedido ni asignación previa."}
            </p>
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
            {!esCoordinador ? (
              <button
                type="button"
                onClick={() => navigate(`/${rol}/migraciones/nueva`)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-wine px-5 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
              >
                <Plus size={17} />
                Añadir informe
              </button>
            ) : null}
          </div>
        </div>

        <CustomTabla
          columns={columnas}
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
              {esCoordinador ? (
                <td className="px-6 py-4 text-sm text-slate-500">
                  <span className="block font-medium text-slate-700">{registro.creador}</span>
                  <span className="text-xs">{registro.rolCreador}</span>
                </td>
              ) : null}
              <td className="px-6 py-4 text-sm text-slate-500">{registro.fechaModificacion}</td>
              <td className="px-6 py-4 text-center">
                <CustomChipEstado forma="rectangular" tamano="amplio" claseColor={obtenerColorEstado(registro.estado)}>
                  {registro.estadoDescripcion}
                </CustomChipEstado>
              </td>
              {!esCoordinador ? (
                <td className="px-6 py-4">
                  <div className="flex justify-end">
                    <CustomButton
                      size="sm"
                      onClick={() => navigate(`/${rol}/migraciones/${registro.idInformeMigracion}?modo=${registro.estado === "borrador" || registro.estado === "en-proceso" || registro.estado === "rechazado" ? "continuar" : "detalle"}`)}
                    >
                      {registro.estado === "borrador" || registro.estado === "en-proceso" || registro.estado === "rechazado"
                        ? "Continuar"
                        : "Ver informe"}
                    </CustomButton>
                  </div>
                </td>
              ) : null}
            </>
          )}
        />
      </section>
    </div>
  );
}

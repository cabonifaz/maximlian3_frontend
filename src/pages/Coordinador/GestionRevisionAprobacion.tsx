import {
  BadgeCheck,
  CheckCircle2,
  CircleX,
  ClipboardList,
  FileSearch,
  Info,
  Languages,
  Search,
  TriangleAlert,
} from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomChipEstado } from "@maximilian/components/common/CustomChipEstado";
import { CustomChipVigencia } from "@maximilian/components/common/CustomChipVigencia";
import { CustomEncabezadoFiltroTabla } from "@maximilian/components/common/CustomEncabezadoFiltroTabla";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { useGestionRevisionAprobacion } from "@maximilian/hooks/useGestionRevisionAprobacion";
import type { InformeListEntry } from "@maximilian/shared/types/informe.type";
import {
  obtenerColorEstadoAnalista,
  obtenerTextoEstadoAnalista,
} from "@maximilian/shared/utils/investigacion.util";
import type { EstadoInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";

function obtenerIconoTarjeta(id: string) {
  if (id === "pendiente")
    return <ClipboardList size={18} className="text-orange-500" />;
  if (id === "aprobado")
    return <CheckCircle2 size={18} className="text-emerald-500" />;
  if (id === "rechazado")
    return <CircleX size={18} className="text-rose-500" />;
  if (id === "vigente")
    return <BadgeCheck size={18} className="text-slate-600" />;
  return <TriangleAlert size={18} className="text-red-400" />;
}

function obtenerClasesFaseActiva(estado: InformeListEntry["estado"]) {
  return `${obtenerColorEstadoAnalista(estado)} border-transparent`;
}

function obtenerClaseIconoFase(claseFase: string) {
  return [
    "relative z-10 flex h-7 w-7 items-center justify-center rounded-full border shadow-sm",
    "cursor-help transition-all duration-200 ease-out",
    "hover:-translate-y-0.5 hover:scale-110 hover:shadow-md hover:ring-4 hover:ring-slate-100",
    claseFase,
  ].join(" ");
}

function obtenerTituloFaseRevision(rol: "Analista" | "Traductor", estado: EstadoInvestigacionAnalista | null) {
  return `${rol} - ${estado ? obtenerTextoEstadoAnalista(estado) : "Sin iniciar"}`;
}

function obtenerIndicadorFase(registro: InformeListEntry) {
  const requiereTraduccion = registro.requiereTraduccion === 1;
  const esFaseTraduccion = requiereTraduccion && registro.idFase === 2;
  const clasesAnalista = esFaseTraduccion
    ? "border-green-200 bg-green-50 text-green-600"
    : obtenerClasesFaseActiva(registro.estado);
  const tituloAnalista = obtenerTituloFaseRevision(
    "Analista",
    esFaseTraduccion ? "aprobado" : registro.estado,
  );
  if (!requiereTraduccion) {
    return (
      <div className="mx-auto flex w-16 items-center justify-center" title="No requiere traducción">
        <span className={obtenerClaseIconoFase(clasesAnalista)} title={tituloAnalista}>
          <FileSearch size={14} />
        </span>
      </div>
    );
  }

  const clasesTraduccion = esFaseTraduccion
    ? obtenerClasesFaseActiva(registro.estado)
    : "border-slate-200 bg-slate-50 text-slate-300";
  const tituloTraduccion = obtenerTituloFaseRevision(
    "Traductor",
    esFaseTraduccion ? registro.estado : null,
  );
  const clasesLinea = esFaseTraduccion
    ? "bg-green-200"
    : "bg-slate-200";

  return (
    <div className="relative mx-auto flex w-16 items-center justify-between" title="Analista / Traducción">
      <span className={`absolute left-4 right-4 top-1/2 h-1 -translate-y-1/2 rounded-full ${clasesLinea}`} />
      <span className={obtenerClaseIconoFase(clasesAnalista)} title={tituloAnalista}>
        <FileSearch size={14} />
      </span>
      <span className={obtenerClaseIconoFase(clasesTraduccion)} title={tituloTraduccion}>
        <Languages size={14} />
      </span>
    </div>
  );
}

export default function GestionRevisionAprobacion() {
  const {
    abrirRevision,
    filtroEstados,
    filtroPlantillas,
    filtroTipos,
    isError,
    isLoading,
    opcionesEstadoFiltro,
    opcionesPlantillaFiltro,
    opcionesTipoFiltro,
    paginaActual,
    refetch,
    registros,
    reiniciarPagina,
    respuestaInformes,
    resumenTarjetas,
    setFiltroEstados,
    setFiltroPlantillas,
    setFiltroTipos,
    setPaginaActual,
    setTerminoBusqueda,
    terminoBusqueda,
  } = useGestionRevisionAprobacion();

  const columnas = [
    { label: "Código Pedido", width: "12%" },
    { label: "Investigado", width: "21%" },
    { label: "Vigencia", width: "11%" },
    {
      label: (
        <CustomEncabezadoFiltroTabla
          titulo="Tipo"
          opciones={opcionesTipoFiltro}
          valores={filtroTipos}
          onChange={setFiltroTipos}
          onFiltroCambiado={reiniciarPagina}
        />
      ),
      width: "10%",
    },
    {
      label: (
        <CustomEncabezadoFiltroTabla
          titulo="Estado"
          opciones={opcionesEstadoFiltro}
          valores={filtroEstados}
          onChange={setFiltroEstados}
          onFiltroCambiado={reiniciarPagina}
        />
      ),
      className: "text-center",
      width: "13%",
    },
    {
      label: (
        <CustomEncabezadoFiltroTabla
          titulo="Plantilla"
          opciones={opcionesPlantillaFiltro}
          valores={filtroPlantillas}
          onChange={setFiltroPlantillas}
          onFiltroCambiado={reiniciarPagina}
        />
      ),
      className: "text-center",
      width: "15%",
    },
    {
      label: (
        <span className="inline-flex items-center justify-center gap-1">
          Fase
          <span title="Pase el mouse sobre cada icono para ver el estado">
            <Info
              size={13}
              className="cursor-help text-slate-400"
              aria-label="Pase el mouse sobre cada icono para ver el estado"
            />
          </span>
        </span>
      ),
      className: "text-center",
      width: "8%",
    },
    { label: "Acción", className: "text-right", width: "12%" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {resumenTarjetas.map((tarjeta) => (
          <article
            key={tarjeta.id}
            className="rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50">
                {obtenerIconoTarjeta(tarjeta.id)}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                {tarjeta.titulo}
              </span>
            </div>
            <p
              className={`text-3xl font-bold ${tarjeta.id === "vencido" ? "text-red-500" : "text-brand-black"}`}
            >
              {tarjeta.valor}
            </p>
          </article>
        ))}
      </div>

      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-black">Informes</h1>
            <p className="mt-2 text-sm text-gray-500">
              Control de aprobaciones de informes asignados.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <label className="relative min-w-[320px]">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
              />
              <input
                value={terminoBusqueda}
                onChange={(event) => setTerminoBusqueda(event.target.value)}
                placeholder="Buscar por Investigado..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
              />
            </label>
          </div>
        </div>


        <CustomTabla
          columns={columnas}
          data={registros}
          getId={(registro) => registro.idInforme}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          errorMessage="No se pudo cargar la bandeja de revisión."
          paginaActual={paginaActual}
          totalPages={respuestaInformes?.totalPaginas ?? 1}
          totalRecords={respuestaInformes?.totalRegistros ?? 0}
          entityLabel="informes"
          onPageChange={setPaginaActual}
          emptyMessage="No se encontraron informes para revisión."
          renderRow={(registro) => (
            <>
              <td className="px-6 py-4 text-sm font-medium text-slate-400">
                {registro.codigoPedido || "-"}
              </td>
              <td className="max-w-48 px-6 py-4 text-sm font-semibold text-slate-700">
                <span className="block truncate" title={registro.investigado}>
                  {registro.investigado}
                </span>
              </td>
              <td className="px-6 py-4">
                <CustomChipVigencia
                  texto={registro.vigencia}
                  colorTexto={registro.vigenciaColor}
                  colorFondo={registro.vigenciaFondo}
                />
              </td>
              <td className="px-6 py-4 text-sm text-slate-500">
                {registro.tipo}
              </td>
              <td className="px-6 py-4 text-center">
                <CustomChipEstado
                  forma="rectangular"
                  tamano="amplio"
                  claseColor={obtenerColorEstadoAnalista(registro.estado)}
                  className="text-[11px] uppercase tracking-wide"
                >
                  {registro.estadoInforme}
                </CustomChipEstado>
              </td>
              <td className="px-6 py-4 text-center text-sm font-semibold leading-5 text-slate-500">
                <span
                  className="block whitespace-normal break-words"
                  title={registro.plantilla || "-"}
                >
                  {registro.plantilla || "-"}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                {obtenerIndicadorFase(registro)}
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end">
                  <CustomButton
                    size="sm"
                    className="h-10 w-36 justify-center px-3 text-[11px] uppercase tracking-[0.12em]"
                    onClick={() => abrirRevision(registro)}
                  >
                    {registro.estado === "pendiente-aprobacion"
                      ? "Revisar"
                      : "Ver Informe"}
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

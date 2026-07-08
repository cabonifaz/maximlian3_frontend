import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import {
  BadgeCheck,
  CheckCircle2,
  CircleX,
  ClipboardList,
  Filter,
  Search,
  TriangleAlert,
} from "lucide-react";
import { MultiCustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscableMultiple";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { informeService } from "@maximilian/services/informe.service";
import { servicioTablaMaestra } from "@maximilian/services/tablaMaestra.service";
import type { InformeListEntry } from "@maximilian/shared/types/informe.type";
import type { TarjetaResumenAnalista } from "@maximilian/shared/types/investigacion.type";
import { TablaMaestraId, type EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";
import { obtenerColorEstadoAnalista } from "@maximilian/shared/utils/investigacion.util";

const OPCIONES_ESTADO_INFORME = [
  { num1: 5, string1: "Pendiente Aprobacion" },
  { num1: 4, string1: "Aprobado" },
  { num1: 2, string1: "Rechazado" },
] as EntradaTablaMaestra[];

function normalizarOpcionesFiltro(opciones?: EntradaTablaMaestra[]) {
  return opciones?.map((opcion) => ({
    ...opcion,
    string1: opcion.string1 || opcion.descripcion,
  }));
}

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

function obtenerBadgeVigencia(registro: InformeListEntry) {
  const texto = registro.vigencia || "-";
  const textoNormalizado = texto.toLowerCase();
  const esVencido = textoNormalizado.includes("venc");
  const dias = texto.match(/\d+/)?.[0];
  const esVencimientoInmediato =
    !esVencido && dias != null && Number(dias) <= 1;
  const color =
    registro.vigenciaColor ||
    (esVencido ? "#dc2626" : esVencimientoInmediato ? "#b45309" : "#166534");
  const fondo =
    registro.vigenciaFondo ||
    (esVencido ? "#fef2f2" : esVencimientoInmediato ? "#fffbeb" : "#ecfdf5");

  return (
    <span
      className="inline-flex min-w-24 flex-col rounded-xl px-3 py-2 text-center text-xs font-semibold"
      style={{ color, backgroundColor: fondo }}
    >
      <span>{esVencido ? "Vencido" : texto}</span>
      {esVencido && dias ? (
        <span className="text-[11px] font-medium opacity-80">
          {dias} {dias === "1" ? "dia" : "dias"}
        </span>
      ) : null}
    </span>
  );
}

export default function GestionRevisionAprobacion() {
  const navigate = useNavigate();
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtroPlantillas, setFiltroPlantillas] = useState<number[]>([]);
  const [filtroEstados, setFiltroEstados] = useState<number[]>([]);
  const [filtroTipos, setFiltroTipos] = useState<number[]>([]);
  const [estaAbiertoFiltro, setEstaAbiertoFiltro] = useState(false);
  const terminoBusquedaConRetardo = useRetardo(terminoBusqueda);
  const plantillasFiltroClave = useMemo(
    () => [...filtroPlantillas].sort((a, b) => a - b).join(","),
    [filtroPlantillas],
  );
  const estadosFiltroClave = useMemo(
    () => [...filtroEstados].sort((a, b) => a - b).join(","),
    [filtroEstados],
  );
  const tiposFiltroClave = useMemo(
    () => [...filtroTipos].sort((a, b) => a - b).join(","),
    [filtroTipos],
  );
  const cantidadFiltrosAplicados =
    filtroPlantillas.length + filtroEstados.length + filtroTipos.length;
  const limpiarFiltros = () => {
    setFiltroPlantillas([]);
    setFiltroEstados([]);
    setFiltroTipos([]);
    setPaginaActual(1);
  };

  const {
    data: respuestaInformes,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "informes-bandeja-coordinador-revision",
      "con-plantilla",
      paginaActual,
      terminoBusquedaConRetardo,
      plantillasFiltroClave,
      estadosFiltroClave,
      tiposFiltroClave,
    ],
    queryFn: () =>
      informeService.list({
        numPag: paginaActual,
        busqueda: terminoBusquedaConRetardo.trim() || undefined,
        idPlantilla: plantillasFiltroClave || undefined,
        idEstado: estadosFiltroClave || undefined,
        idTipoTramite: tiposFiltroClave || undefined,
      }),
    enabled: terminoBusqueda === terminoBusquedaConRetardo,
    retry: false,
    refetchOnMount: "always",
  });

  const registros = useMemo<InformeListEntry[]>(
    () => respuestaInformes?.lstInforme ?? [],
    [respuestaInformes?.lstInforme],
  );

  const { data: opcionesPlantillaInforme } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.PLANTILLA_INFORME],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.PLANTILLA_INFORME),
    staleTime: Infinity,
  });

  const { data: opcionesTipoTramite } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_TRAMITE],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_TRAMITE),
    staleTime: Infinity,
  });

  const opcionesPlantillaFiltro = useMemo(
    () => normalizarOpcionesFiltro(opcionesPlantillaInforme),
    [opcionesPlantillaInforme],
  );
  const opcionesTipoFiltro = useMemo(
    () => normalizarOpcionesFiltro(opcionesTipoTramite),
    [opcionesTipoTramite],
  );

  const resumenTarjetas = useMemo<TarjetaResumenAnalista[]>(() => {
    return [
      {
        id: "pendiente",
        titulo: "Pendiente",
        valor: respuestaInformes?.pendienteAprobacion ?? 0,
        colorIcono: "text-orange-500",
      },
      {
        id: "aprobado",
        titulo: "Aprobado",
        valor: respuestaInformes?.aprobado ?? 0,
        colorIcono: "text-emerald-500",
      },
      {
        id: "rechazado",
        titulo: "Rechazado",
        valor: respuestaInformes?.rechazado ?? 0,
        colorIcono: "text-rose-500",
      },
      {
        id: "vigente",
        titulo: "Vigentes",
        valor: respuestaInformes?.vigente ?? 0,
        colorIcono: "text-slate-600",
      },
      {
        id: "vencido",
        titulo: "Vencidos",
        valor: respuestaInformes?.vencido ?? 0,
        colorIcono: "text-red-400",
      },
    ];
  }, [respuestaInformes]);

  const registrosFiltrados = useMemo(() => {
    let lista = registros;

    if (filtroPlantillas.length > 0) {
      const plantillasSeleccionadas = new Set(filtroPlantillas);
      lista = lista.filter(
        (registro) => registro.idPlantilla != null && plantillasSeleccionadas.has(registro.idPlantilla),
      );
    }

    if (filtroEstados.length > 0) {
      const estadosSeleccionados = new Set(filtroEstados);
      lista = lista.filter((registro) => estadosSeleccionados.has(registro.idEstado));
    }

    if (filtroTipos.length > 0) {
      const tiposSeleccionados = new Set(
        opcionesTipoFiltro
          ?.filter((opcion) => opcion.num1 != null && filtroTipos.includes(opcion.num1))
          .map((opcion) => (opcion.string1 || "").trim().toLowerCase())
          .filter(Boolean) ?? [],
      );

      if (tiposSeleccionados.size > 0) {
        lista = lista.filter((registro) => tiposSeleccionados.has(registro.tipo.trim().toLowerCase()));
      }
    }

    return lista;
  }, [filtroEstados, filtroPlantillas, filtroTipos, opcionesTipoFiltro, registros]);

  const abrirRevision = (registro: InformeListEntry) => {
    const parametros = new URLSearchParams();
    parametros.set("idInforme", String(registro.idInforme));
    if (registro.idIdioma != null) {
      parametros.set("idIdioma", String(registro.idIdioma));
    }
    if (registro.idInformeOriginal != null && registro.idInformeOriginal > 0) {
      parametros.set("idInformeOriginal", String(registro.idInformeOriginal));
    }
    navigate(
      `/coordinador/revision/${registro.idPedido}?${parametros.toString()}`,
    );
  };

  const columnas = [
    { label: "ID Pedido", width: "9%" },
    { label: "Investigado", width: "29%" },
    { label: "Vigencia", width: "13%" },
    { label: "Tipo", width: "10%" },
    { label: "Estado", className: "text-center", width: "14%" },
    { label: "Plantilla", className: "text-center", width: "13%" },
    { label: "Acción", className: "text-right", width: "12%" },
  ];

  const obtenerNombrePlantilla = (idPlantilla?: number) => {
    if (!idPlantilla) return "-";
    const opcionPlantilla = opcionesPlantillaInforme?.find(
      (opcion) => opcion.num1 === idPlantilla,
    );

    return (
      opcionPlantilla?.string1 ||
      opcionPlantilla?.descripcion ||
      `Plantilla ${idPlantilla}`
    );
  };

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

            <div className="relative">
              <CustomButton
                variant="secondary"
                size="md"
                className={`h-12 min-w-28 rounded-xl text-sm font-semibold shadow-sm ${
                  estaAbiertoFiltro || cantidadFiltrosAplicados > 0
                    ? "border-brand-wine/30 bg-brand-wine/5 text-brand-wine"
                    : ""
                }`}
                onClick={() => setEstaAbiertoFiltro((abierto) => !abierto)}
              >
                <Filter size={16} />
                Filtros
                {cantidadFiltrosAplicados > 0 ? (
                  <span className="ml-1 rounded-full bg-brand-wine px-2 py-0.5 text-[11px] font-bold text-white">
                    {cantidadFiltrosAplicados}
                  </span>
                ) : null}
              </CustomButton>

              {estaAbiertoFiltro ? (
                <>
                  <div
                    className="fixed inset-0 z-[90]"
                    onClick={() => setEstaAbiertoFiltro(false)}
                  />
                  <div className="absolute right-0 top-full z-[91] mt-2 w-[min(38rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15">
                    <div
                      className="bg-white"
                      role="menu"
                      aria-labelledby="titulo-filtros-revision"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-1.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-wine/10 text-brand-wine">
                            <Filter size={14} />
                          </span>
                          <div className="flex items-center gap-2">
                            <h2
                              id="titulo-filtros-revision"
                              className="text-sm font-bold text-slate-900"
                            >
                              Filtros de revision
                            </h2>
                            {cantidadFiltrosAplicados > 0 ? (
                              <p className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                                {cantidadFiltrosAplicados} activos
                              </p>
                            ) : null}
                          </div>
                        </div>

                        {cantidadFiltrosAplicados > 0 ? (
                          <button
                            type="button"
                            className="h-7 rounded-lg border border-brand-wine/20 bg-white px-2 text-[11px] font-bold text-brand-wine transition hover:bg-brand-wine/10"
                            onClick={limpiarFiltros}
                          >
                            Limpiar
                          </button>
                        ) : null}
                      </div>

                      <div className="grid gap-2 bg-slate-50/80 p-2 sm:grid-cols-3">
                        <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
                          <MultiCustomSelectorBuscable
                            label="Plantilla"
                            triggerIcon={Filter}
                            options={opcionesPlantillaFiltro}
                            value={filtroPlantillas}
                            onChange={(ids) => {
                              setFiltroPlantillas(ids);
                              setPaginaActual(1);
                            }}
                            resumirSelecciones
                            mostrarAccionSeleccionarTodos
                            placeholder="Seleccione"
                          />
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
                          <MultiCustomSelectorBuscable
                            label="Estado"
                            triggerIcon={Filter}
                            options={OPCIONES_ESTADO_INFORME}
                            value={filtroEstados}
                            onChange={(ids) => {
                              setFiltroEstados(ids);
                              setPaginaActual(1);
                            }}
                            resumirSelecciones
                            mostrarAccionSeleccionarTodos
                            placeholder="Seleccione"
                          />
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
                          <MultiCustomSelectorBuscable
                            label="Tipo"
                            triggerIcon={Filter}
                            options={opcionesTipoFiltro}
                            value={filtroTipos}
                            onChange={(ids) => {
                              setFiltroTipos(ids);
                              setPaginaActual(1);
                            }}
                            resumirSelecciones
                            mostrarAccionSeleccionarTodos
                            placeholder="Seleccione"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>


        <CustomTabla
          columns={columnas}
          data={registrosFiltrados}
          getId={(registro) => registro.idInforme}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          errorMessage="No se pudo cargar la bandeja de revision."
          paginaActual={paginaActual}
          totalPages={respuestaInformes?.totalPaginas ?? 1}
          totalRecords={respuestaInformes?.totalRegistros ?? 0}
          entityLabel="informes"
          onPageChange={setPaginaActual}
          emptyMessage="No se encontraron informes para revisión."
          renderRow={(registro) => (
            <>
              <td className="px-6 py-4 text-sm font-medium text-slate-400">
                #{registro.idPedido}
              </td>
              <td className="max-w-48 px-6 py-4 text-sm font-semibold text-slate-700">
                <span className="block truncate" title={registro.investigado}>
                  {registro.investigado}
                </span>
              </td>
              <td className="px-6 py-4">{obtenerBadgeVigencia(registro)}</td>
              <td className="px-6 py-4 text-sm text-slate-500">
                {registro.tipo}
              </td>
              <td className="px-6 py-4 text-center">
                <span
                  className={`inline-flex rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-wide ${obtenerColorEstadoAnalista(registro.estado)}`}
                >
                  {registro.estadoInforme}
                </span>
              </td>
              <td className="px-6 py-4 text-center text-sm font-semibold leading-5 text-slate-500">
                <span
                  className="block whitespace-normal break-words"
                  title={obtenerNombrePlantilla(registro.idPlantilla)}
                >
                  {obtenerNombrePlantilla(registro.idPlantilla)}
                </span>
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

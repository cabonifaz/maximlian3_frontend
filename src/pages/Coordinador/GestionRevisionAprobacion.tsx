import { type CSSProperties, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import {
  BadgeCheck,
  CheckCircle2,
  CircleX,
  ClipboardList,
  FileSearch,
  Filter,
  Languages,
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

type ClaveFiltroRevision = "tipo" | "estado" | "plantilla";

function normalizarOpcionesFiltro(
  opciones?: EntradaTablaMaestra[],
  campoTexto: "string1" | "string2" = "string1",
) {
  return opciones?.map((opcion) => ({
    ...opcion,
    string1: opcion[campoTexto] || opcion.string1 || opcion.descripcion,
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

function obtenerClasesFaseActiva(estado: InformeListEntry["estado"]) {
  return `${obtenerColorEstadoAnalista(estado)} border-transparent`;
}

function obtenerIndicadorFase(registro: InformeListEntry) {
  const requiereTraduccion = registro.requiereTraduccion === 1;
  const esFaseTraduccion = requiereTraduccion && registro.idFase === 2;
  const clasesAnalista = esFaseTraduccion
    ? "border-green-200 bg-green-50 text-green-600"
    : obtenerClasesFaseActiva(registro.estado);
  if (!requiereTraduccion) {
    return (
      <div className="mx-auto flex w-16 items-center justify-center" title="No requiere traduccion">
        <span className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border shadow-sm ${clasesAnalista}`}>
          <FileSearch size={14} />
        </span>
      </div>
    );
  }

  const clasesTraduccion = esFaseTraduccion
    ? obtenerClasesFaseActiva(registro.estado)
    : "border-slate-200 bg-slate-50 text-slate-300";
  const clasesLinea = esFaseTraduccion
    ? "bg-green-200"
    : "bg-slate-200";

  return (
    <div className="relative mx-auto flex w-16 items-center justify-between" title="Analista / Traduccion">
      <span className={`absolute left-4 right-4 top-1/2 h-1 -translate-y-1/2 rounded-full ${clasesLinea}`} />
      <span className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border shadow-sm ${clasesAnalista}`}>
        <FileSearch size={14} />
      </span>
      <span className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border shadow-sm ${clasesTraduccion}`}>
        <Languages size={14} />
      </span>
    </div>
  );
}

export default function GestionRevisionAprobacion() {
  const navigate = useNavigate();
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtroPlantillas, setFiltroPlantillas] = useState<number[]>([]);
  const [filtroEstados, setFiltroEstados] = useState<number[]>([]);
  const [filtroTipos, setFiltroTipos] = useState<number[]>([]);
  const [filtroEncabezadoAbierto, setFiltroEncabezadoAbierto] =
    useState<ClaveFiltroRevision | null>(null);
  const [estiloFiltroEncabezado, setEstiloFiltroEncabezado] =
    useState<CSSProperties>({});
  const terminoBusquedaConRetardo = useRetardo(terminoBusqueda);
  const idPlantillaFiltro = filtroPlantillas.join(",") || undefined;
  const idEstadoFiltro = filtroEstados.join(",") || undefined;
  const idTipoTramiteFiltro = filtroTipos.join(",") || undefined;
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
      idPlantillaFiltro,
      idEstadoFiltro,
      idTipoTramiteFiltro,
    ],
    queryFn: () =>
      informeService.list({
        numPag: paginaActual,
        busqueda: terminoBusquedaConRetardo.trim() || undefined,
        idPlantilla: idPlantillaFiltro,
        idEstado: idEstadoFiltro,
        idTipoTramite: idTipoTramiteFiltro,
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

  const { data: opcionesEstadoInforme } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.ESTADO_INFORME],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.ESTADO_INFORME),
    staleTime: Infinity,
  });

  const opcionesPlantillaFiltro = useMemo(
    () => normalizarOpcionesFiltro(opcionesPlantillaInforme),
    [opcionesPlantillaInforme],
  );
  const opcionesTipoFiltro = useMemo(
    () => normalizarOpcionesFiltro(opcionesTipoTramite, "string2"),
    [opcionesTipoTramite],
  );
  const opcionesEstadoFiltro = useMemo(
    () => normalizarOpcionesFiltro(opcionesEstadoInforme),
    [opcionesEstadoInforme],
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

  const crearEncabezadoFiltro = (
    clave: ClaveFiltroRevision,
    titulo: string,
    opciones: EntradaTablaMaestra[] | undefined,
    valores: number[],
    onChange: (ids: number[]) => void,
  ) => {
    const estaAbierto = filtroEncabezadoAbierto === clave;
    const tieneFiltro = valores.length > 0;
    const actualizarSeleccion = (ids: number[]) => {
      onChange(ids);
      setPaginaActual(1);
    };

    return (
      <div className="relative normal-case">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {titulo}
          </span>
          <button
            type="button"
            aria-label={`Filtrar por ${titulo}`}
            title={`Filtrar por ${titulo}`}
            className={`relative flex h-8 w-8 items-center justify-center rounded-lg border transition ${
              estaAbierto || tieneFiltro
                ? "border-brand-wine/30 bg-brand-wine/10 text-brand-wine"
                : "border-gray-200 bg-white text-gray-400 hover:border-brand-wine/30 hover:text-brand-wine"
            }`}
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              setEstiloFiltroEncabezado({
                top: rect.bottom + 8,
                left: Math.min(rect.left, window.innerWidth - 280),
              });
              setFiltroEncabezadoAbierto((actual) =>
                actual === clave ? null : clave,
              );
            }}
          >
            <Filter size={15} />
            {tieneFiltro ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-wine px-1 text-[10px] font-bold text-white">
                {valores.length}
              </span>
            ) : null}
          </button>
        </div>

        {estaAbierto ? (
          <>
            <div
              className="fixed inset-0 z-[90]"
              onClick={() => setFiltroEncabezadoAbierto(null)}
            />
            <div
              className="fixed z-[91] w-64 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-2xl shadow-slate-950/15"
              style={estiloFiltroEncabezado}
              onClick={(event) => event.stopPropagation()}
            >
              <MultiCustomSelectorBuscable
                label={titulo}
                triggerIcon={Filter}
                options={opciones}
                value={valores}
                onChange={actualizarSeleccion}
                resumirSelecciones
                placeholder="Seleccione"
              />
            </div>
          </>
        ) : null}
      </div>
    );
  };

  const columnas = [
    { label: "ID Pedido", width: "7%" },
    { label: "Investigado", width: "22%" },
    { label: "Vigencia", width: "11%" },
    {
      label: crearEncabezadoFiltro("tipo", "Tipo", opcionesTipoFiltro, filtroTipos, setFiltroTipos),
      width: "10%",
    },
    {
      label: crearEncabezadoFiltro("estado", "Estado", opcionesEstadoFiltro, filtroEstados, setFiltroEstados),
      className: "text-center",
      width: "13%",
    },
    {
      label: crearEncabezadoFiltro("plantilla", "Plantilla", opcionesPlantillaFiltro, filtroPlantillas, setFiltroPlantillas),
      className: "text-center",
      width: "15%",
    },
    { label: "Fase", className: "text-center", width: "8%" },
    { label: "Accion", className: "text-right", width: "12%" },
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
          </div>
        </div>


        <CustomTabla
          columns={columnas}
          data={registros}
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

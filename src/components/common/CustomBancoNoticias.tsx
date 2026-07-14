import { esquemaNoticia, valoresIniciales } from "@maximilian/shared/constants/components/common/customBancoNoticias.constants";
import { useEffect, useMemo, useState, type UIEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2,
  UploadCloud,
  User,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { servicioCompania } from "@maximilian/services/compania.service";
import { servicioCompaniaNoticia } from "@maximilian/services/companiaNoticia.service";
import type { CompaniaListaItem } from "@maximilian/shared/types/compania.type";
import type {
  CompaniaNoticiaArchivo,
  CompaniaNoticiaCrearRequest,
  CompaniaNoticiaListaItem,
} from "@maximilian/shared/types/companiaNoticia.type";
import { CustomButton } from "./CustomButton";
import { CustomLabel } from "./CustomLabel";
import { CustomSelectorFecha } from "./CustomSelectorFecha";

type FormularioNoticiaEntrada = z.input<typeof esquemaNoticia>;
type FormularioNoticia = z.output<typeof esquemaNoticia>;

interface PropsCustomBancoNoticias {
  busqueda: string;
  mostrarBotonAgregar?: boolean;
  senalApertura?: number;
}

export function CustomBancoNoticias({
  busqueda,
  mostrarBotonAgregar = true,
  senalApertura = 0,
}: PropsCustomBancoNoticias) {
  const queryClient = useQueryClient();
  const [estaAbiertoModalNoticia, setEstaAbiertoModalNoticia] = useState(false);
  const [noticiaDetalle, setNoticiaDetalle] =
    useState<CompaniaNoticiaListaItem | null>(null);
  const [companiaDetalle, setCompaniaDetalle] =
    useState<CompaniaListaItem | null>(null);
  const [idNoticiaCargandoDetalle, setIdNoticiaCargandoDetalle] = useState<
    number | null
  >(null);
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<File[]>(
    [],
  );
  const [claveInputArchivo, setClaveInputArchivo] = useState(0);
  const [paginaNoticias, setPaginaNoticias] = useState(1);

  useEffect(() => {
    setPaginaNoticias(1);
  }, [busqueda]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormularioNoticiaEntrada, unknown, FormularioNoticia>({
    resolver: zodResolver(esquemaNoticia),
    mode: "onTouched",
    defaultValues: valoresIniciales,
  });

  useEffect(() => {
    if (senalApertura > 0) {
      setEstaAbiertoModalNoticia(true);
    }
  }, [senalApertura]);

  const {
    data: respuestaNoticias,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["companiaNoticia", { busqueda, numPag: paginaNoticias }],
    queryFn: () => servicioCompaniaNoticia.list({ busqueda, numPag: paginaNoticias }),
  });

  const crearNoticiaMutation = useMutation({
    mutationFn: async ({
      payload,
      archivos,
    }: {
      payload: CompaniaNoticiaCrearRequest;
      archivos: File[];
    }) => {
      const respuesta = await servicioCompaniaNoticia.crear(payload);
      await subirArchivosNoticia(respuesta.archivos, archivos);
      return respuesta;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["companiaNoticia"] });
      cerrarModalNoticia();
    },
    onError: () => {
      toast.error("No se pudo completar el registro de la noticia.");
    },
  });

  const noticias = respuestaNoticias?.lstCompaniaNoticia ?? [];
  const totalRegistros = respuestaNoticias?.totalRegistros ?? noticias.length;
  const totalPaginas = Math.max(respuestaNoticias?.totalPaginas ?? 1, 1);
  const idCompaniaSeleccionada = watch("idCompania");
  const fechaNoticiaSeleccionada = watch("fechaNoticia");

  const cerrarModalNoticia = () => {
    setEstaAbiertoModalNoticia(false);
    setArchivosSeleccionados([]);
    setClaveInputArchivo((valor) => valor + 1);
    reset(valoresIniciales);
  };

  const guardarNoticia = (datos: FormularioNoticia) => {
    crearNoticiaMutation.mutate({
      payload: {
        idCompania: datos.idCompania,
        titulo: datos.titulo.trim(),
        descripcion: datos.descripcion.trim(),
        fechaNoticia: new Date(`${datos.fechaNoticia}T00:00:00`).toISOString(),
        categoria: datos.categoria.trim(),
        archivos: archivosSeleccionados.map(convertirArchivo),
      },
      archivos: archivosSeleccionados,
    });
  };

  const verDetalleNoticia = async (noticia: CompaniaNoticiaListaItem) => {
    setIdNoticiaCargandoDetalle(noticia.idCompaniaNoticia);
    setNoticiaDetalle(null);
    setCompaniaDetalle(null);

    let detalleNoticia: CompaniaNoticiaListaItem | null = null;
    let compania: CompaniaListaItem | null = null;
    try {
      [detalleNoticia, compania] = await Promise.all([
        servicioCompaniaNoticia.obtener({
          idCompaniaNoticia: noticia.idCompaniaNoticia,
          idCompania: noticia.idCompania,
        }),
        servicioCompania.obtener({
          idCompania: noticia.idCompania,
        }),
      ]);
    } catch {
      detalleNoticia = null;
      compania = null;
    } finally {
      setCompaniaDetalle(compania);
      setNoticiaDetalle(
        detalleNoticia ? { ...noticia, ...detalleNoticia } : noticia,
      );
      setIdNoticiaCargandoDetalle(null);
    }
  };

  return (
    <>
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">
            Noticias recientes
          </p>
          {mostrarBotonAgregar ? (
            <CustomButton
              size="sm"
              onClick={() => setEstaAbiertoModalNoticia(true)}
            >
              <Plus size={14} />
              Agregar Noticia
            </CustomButton>
          ) : null}
        </div>

        {isLoading ? (
          <EstadoCargandoNoticias />
        ) : isError ? (
          <EstadoNoticias
            texto="No se pudieron cargar las noticias."
            accion={
              <CustomButton
                variant="secondary"
                size="sm"
                onClick={() => void refetch()}
              >
                Reintentar
              </CustomButton>
            }
          />
        ) : noticias.length === 0 ? (
          <EstadoNoticias texto="No hay noticias registradas." />
        ) : (
          <div className="space-y-4">
            {noticias.map((noticia) => (
              <article
                key={noticia.idCompaniaNoticia}
                className="rounded-lg border border-slate-100 bg-white px-6 py-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
                      <span className="rounded-md bg-slate-50 px-3 py-1.5 text-slate-600 shadow-sm ring-1 ring-slate-100">
                        Empresa relacionada:{" "}
                        <span className="text-slate-950">
                          {noticia.compania}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 uppercase tracking-wide">
                        <CalendarDays size={14} className="text-slate-300" />
                        {formatearFecha(noticia.fechaNoticia)}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-lg font-bold text-slate-950">
                        {noticia.titulo}
                      </h2>
                      <p className="line-clamp-2 max-w-4xl text-sm font-semibold leading-6 text-slate-400">
                        {noticia.descripcion}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-5 text-xs font-bold text-slate-400">
                      {noticia.categoria ? (
                        <span className="inline-flex items-center gap-1.5">
                          <User size={14} className="text-slate-300" />
                          {noticia.categoria}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <CustomButton
                    size="sm"
                    onClick={() => void verDetalleNoticia(noticia)}
                    className="h-10 shrink-0 rounded-lg px-6 text-[11px] font-black uppercase tracking-wide"
                    loading={
                      idNoticiaCargandoDetalle === noticia.idCompaniaNoticia
                    }
                    loadingText="Cargando..."
                  >
                    VER DETALLE
                  </CustomButton>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <CustomPaginacionBanco
        paginaActual={paginaNoticias}
        totalPaginas={totalPaginas}
        totalRegistros={totalRegistros}
        totalPaginaActual={noticias.length}
        etiqueta="noticias"
        deshabilitado={isLoading || isError}
        onCambiarPagina={setPaginaNoticias}
      />

      <CustomModalDetalleNoticia
        noticia={noticiaDetalle}
        compania={companiaDetalle}
        onCerrar={() => {
          setNoticiaDetalle(null);
          setCompaniaDetalle(null);
        }}
      />

      {estaAbiertoModalNoticia ? (
        <CustomModalBase ancho="max-w-2xl" onCerrar={cerrarModalNoticia}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={handleSubmit(guardarNoticia)}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-8 py-6">
              <h2 className="text-lg font-bold text-slate-950">
                Agregar Nueva Noticia
              </h2>
              <BotonCerrar onCerrar={cerrarModalNoticia} />
            </div>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-8 py-6">
              <CampoSelectorCompania
                valor={
                  typeof idCompaniaSeleccionada === "number"
                    ? idCompaniaSeleccionada
                    : Number(idCompaniaSeleccionada)
                }
                error={errors.idCompania?.message}
                onSeleccionar={(compania) => {
                  setValue("idCompania", compania.idCompania, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  });
                }}
              />
              <CampoFormulario
                etiqueta="Titulo"
                error={errors.titulo?.message}
                requerido
              >
                <input
                  className="h-11 w-full rounded-lg border border-slate-100 bg-slate-50 px-3 text-sm text-slate-600 outline-none focus:border-slate-300"
                  placeholder="Ej. Actualizacion de protocolos de seguridad"
                  {...register("titulo")}
                />
              </CampoFormulario>
              <CampoFormulario
                etiqueta="Descripcion"
                error={errors.descripcion?.message}
                requerido
              >
                <textarea
                  className="min-h-36 w-full resize-none rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-300"
                  placeholder="Detalle la informacion de la noticia o reporte aqui..."
                  {...register("descripcion")}
                />
              </CampoFormulario>
              <div className="grid gap-4 sm:grid-cols-2">
                <CustomSelectorFecha
                  label="Fecha"
                  required
                  value={convertirTextoFechaADate(
                    String(fechaNoticiaSeleccionada ?? ""),
                  )}
                  onChange={(fecha) => {
                    setValue("fechaNoticia", convertirDateATextoFecha(fecha), {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    });
                  }}
                  error={errors.fechaNoticia?.message}
                  placeholder="Seleccione fecha"
                />
                <CampoFormulario
                  etiqueta="Categoria"
                  error={errors.categoria?.message}
                  requerido
                >
                  <input
                    className="h-11 w-full rounded-lg border border-slate-100 bg-slate-50 px-3 text-sm text-slate-600 outline-none focus:border-slate-300"
                    placeholder="Ej. Financiero"
                    {...register("categoria")}
                  />
                </CampoFormulario>
              </div>
              <CampoArchivos
                archivos={archivosSeleccionados}
                claveInputArchivo={claveInputArchivo}
                onCambiarArchivos={(archivos) =>
                  setArchivosSeleccionados((anteriores) => [
                    ...anteriores,
                    ...archivos,
                  ])
                }
                onEliminarArchivo={(indiceArchivo) =>
                  setArchivosSeleccionados((anteriores) =>
                    anteriores.filter((_, indice) => indice !== indiceArchivo),
                  )
                }
              />
            </div>
            <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 px-8 py-5">
              <CustomButton
                type="button"
                variant="secondary"
                size="compact"
                onClick={cerrarModalNoticia}
                disabled={crearNoticiaMutation.isPending}
              >
                Cancelar
              </CustomButton>
              <CustomButton
                type="submit"
                size="compact"
                loading={crearNoticiaMutation.isPending}
                loadingText="Guardando..."
              >
                Guardar
              </CustomButton>
            </div>
          </form>
        </CustomModalBase>
      ) : null}
    </>
  );
}

function CustomModalDetalleNoticia({
  noticia,
  compania,
  onCerrar,
}: {
  noticia: CompaniaNoticiaListaItem | null;
  compania: CompaniaListaItem | null;
  onCerrar: () => void;
}) {
  const [idArchivoAbriendo, setIdArchivoAbriendo] = useState<number | null>(
    null,
  );

  const abrirArchivo = async (archivo: CompaniaNoticiaArchivo) => {
    if (!archivo.idCompaniaNoticiaArchivo) {
      toast.error("No se pudo identificar el archivo.");
      return;
    }

    setIdArchivoAbriendo(archivo.idCompaniaNoticiaArchivo);
    try {
      const respuesta = await servicioCompaniaNoticia.obtenerArchivo({
        idCompaniaNoticiaArchivo: archivo.idCompaniaNoticiaArchivo,
      });
      window.open(respuesta.downloadUrl, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("No se pudo abrir el archivo.");
    } finally {
      setIdArchivoAbriendo(null);
    }
  };

  if (!noticia) return null;

  return (
    <CustomModalBase ancho="max-w-5xl" onCerrar={onCerrar}>
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/60 px-8 py-6">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Banco de informacion
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">
            Detalle de Noticia
          </h2>
        </div>
        <BotonCerrar onCerrar={onCerrar} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid gap-8 px-8 py-7 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {noticia.categoria ? (
                  <span className="rounded-md bg-brand-wine/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-brand-wine">
                    {noticia.categoria}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  <CalendarDays size={13} />
                  {formatearFecha(noticia.fechaNoticia)}
                </span>
              </div>
              <h3 className="text-2xl font-bold leading-tight text-slate-950 md:text-3xl">
                {noticia.titulo}
              </h3>
            </div>

            <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Descripcion
              </p>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                {noticia.descripcion}
              </p>
            </section>

            <section className="rounded-xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm ring-1 ring-slate-100">
                  <Building2 size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Empresa relacionada
                  </p>
                  <p className="mt-2 text-base font-bold text-slate-900">
                    {compania?.nombreCompleto ?? noticia.compania}
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 text-xs font-semibold text-slate-500 sm:grid-cols-2">
                <DetalleCompania
                  etiqueta="Documento"
                  valor={compania?.numeroDocumento}
                />
                <DetalleCompania etiqueta="Pais" valor={compania?.pais} />
                <DetalleCompania
                  etiqueta="Telefono"
                  valor={compania?.telefono}
                />
                <DetalleCompania
                  etiqueta="Direccion"
                  valor={compania?.direccion}
                  className="sm:col-span-2"
                />
              </div>
            </section>
          </div>

          <aside className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Documentos adjuntos
              </p>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                {noticia.archivos.length}
              </span>
            </div>
            <div className="space-y-3">
              {noticia.archivos.length === 0 ? (
                <p className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-xs font-semibold text-slate-400">
                  Sin documentos adjuntos
                </p>
              ) : (
                noticia.archivos.map((archivo) => (
                  <div
                    key={`${archivo.idCompaniaNoticiaArchivo}-${archivo.nombreArchivo}`}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-100">
                        <FileText size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-xs font-bold leading-5 text-slate-700">
                          {archivo.nombreArchivo}
                        </p>
                        {archivo.formatoArchivo ? (
                          <p className="mt-1 truncate text-[10px] font-semibold text-slate-400">
                            {archivo.formatoArchivo}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-3">
                      <CustomButton
                        type="button"
                        size="sm"
                        className="h-8 rounded-md px-3 text-[10px] font-bold uppercase tracking-wide"
                        loading={
                          idArchivoAbriendo === archivo.idCompaniaNoticiaArchivo
                        }
                        loadingText="Descargando..."
                        onClick={() => void abrirArchivo(archivo)}
                      >
                        Descargar
                      </CustomButton>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
      <div className="flex shrink-0 justify-end border-t border-slate-100 bg-slate-50/60 px-8 py-5">
        <CustomButton variant="secondary" size="sm" onClick={onCerrar}>
          Cerrar
        </CustomButton>
      </div>
    </CustomModalBase>
  );
}

function DetalleCompania({
  etiqueta,
  valor,
  className = "",
}: {
  etiqueta: string;
  valor?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-slate-100 bg-white px-3 py-2 ${className}`}
    >
      <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
        {etiqueta}
      </span>
      <span className="mt-1 block break-words text-slate-700">
        {valor || "-"}
      </span>
    </div>
  );
}

function CampoFormulario({
  etiqueta,
  error,
  requerido = false,
  children,
}: {
  etiqueta: string;
  error?: string;
  requerido?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <CustomLabel
        required={requerido}
        className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400"
      >
        {etiqueta}
      </CustomLabel>
      {children}
      {error ? (
        <p className="text-xs font-semibold text-red-500">{error}</p>
      ) : null}
    </div>
  );
}

function CampoSelectorCompania({
  valor,
  error,
  onSeleccionar,
}: {
  valor: number;
  error?: string;
  onSeleccionar: (compania: CompaniaListaItem) => void;
}) {
  const [busquedaCompania, setBusquedaCompania] = useState("");
  const busquedaCompaniaConRetardo = useRetardo(busquedaCompania);
  const [estaAbierto, setEstaAbierto] = useState(false);
  const [companiaActual, setCompaniaActual] =
    useState<CompaniaListaItem | null>(null);

  const {
    data: respuestaCompanias,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["companiasNoticia", { busqueda: busquedaCompaniaConRetardo }],
    queryFn: ({ pageParam }) =>
      servicioCompania.list({
        busqueda: busquedaCompaniaConRetardo,
        numPag: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (ultimaPagina, paginas) => {
      const siguientePagina = paginas.length + 1;
      return siguientePagina <= ultimaPagina.totalPaginas
        ? siguientePagina
        : undefined;
    },
    enabled: estaAbierto,
  });

  const companias = useMemo(() => {
    const mapaCompanias = new Map<number, CompaniaListaItem>();
    respuestaCompanias?.pages.forEach((pagina) => {
      pagina.lstCompania.forEach((compania) => {
        mapaCompanias.set(compania.idCompania, compania);
      });
    });
    return Array.from(mapaCompanias.values());
  }, [respuestaCompanias?.pages]);
  const companiaEncontrada = companias.find(
    (compania) => compania.idCompania === valor,
  );
  const companiaSeleccionada =
    companiaActual?.idCompania === valor ? companiaActual : companiaEncontrada;

  useEffect(() => {
    if (companiaEncontrada) {
      setCompaniaActual(companiaEncontrada);
    }
  }, [companiaEncontrada]);

  const cargarSiguientePagina = (event: UIEvent<HTMLDivElement>) => {
    const elemento = event.currentTarget;
    const llegoAlFinal =
      elemento.scrollTop + elemento.clientHeight >= elemento.scrollHeight - 24;

    if (llegoAlFinal && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  return (
    <div className="space-y-2">
      <CustomLabel
        required
        className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400"
      >
        Compania
      </CustomLabel>
      <div className="relative">
        <button
          type="button"
          onClick={() => setEstaAbierto((abierto) => !abierto)}
          className={`flex h-11 w-full items-center justify-between rounded-lg border bg-slate-50 px-3 text-left text-sm outline-none transition ${
            error ? "border-red-500" : "border-slate-100 hover:border-slate-300"
          }`}
        >
          <span
            className={`min-w-0 truncate ${companiaSeleccionada ? "text-slate-700" : "text-slate-400"}`}
          >
            {companiaSeleccionada
              ? obtenerEtiquetaCompania(companiaSeleccionada)
              : "Buscar y seleccionar compania..."}
          </span>
          <Search size={16} className="shrink-0 text-slate-400" />
        </button>

        {estaAbierto ? (
          <div className="absolute left-0 right-0 top-full z-[120] mt-2 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-2xl">
            <div className="border-b border-slate-100 p-2">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                />
                <input
                  value={busquedaCompania}
                  onChange={(event) => setBusquedaCompania(event.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-100 bg-slate-50 pl-9 pr-3 text-xs text-slate-600 outline-none focus:border-slate-300"
                  placeholder="Buscar compania..."
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-56 overflow-y-auto" onScroll={cargarSiguientePagina}>
              {isFetching && companias.length === 0 ? (
                <div className="flex justify-center px-4 py-6 text-slate-400">
                  <Loader2 size={16} className="animate-spin" />
                </div>
              ) : isError ? (
                <div className="space-y-3 px-4 py-5 text-center">
                  <p className="text-xs font-semibold text-slate-400">
                    No se pudieron cargar las companias.
                  </p>
                  <CustomButton
                    variant="secondary"
                    size="sm"
                    onClick={() => void refetch()}
                  >
                    Reintentar
                  </CustomButton>
                </div>
              ) : companias.length === 0 ? (
                <p className="px-4 py-5 text-center text-xs font-semibold text-slate-400">
                  No se encontraron companias.
                </p>
              ) : (
                <>
                  {companias.map((compania) => (
                    <button
                      key={compania.idCompania}
                      type="button"
                      onClick={() => {
                        setCompaniaActual(compania);
                        onSeleccionar(compania);
                        setEstaAbierto(false);
                      }}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition hover:bg-slate-50 ${
                        valor === compania.idCompania
                          ? "bg-slate-50 text-slate-950"
                          : "text-slate-600"
                      }`}
                    >
                      <Building2
                        size={16}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">
                          {obtenerEtiquetaCompania(compania)}
                        </span>
                        {compania.numeroDocumento ? (
                          <span className="block truncate text-xs text-slate-400">
                            {compania.numeroDocumento}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  ))}
                  {isFetchingNextPage ? (
                    <div className="flex justify-center px-4 py-3 text-slate-400">
                      <Loader2 size={16} className="animate-spin" />
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
      {error ? (
        <p className="text-xs font-semibold text-red-500">{error}</p>
      ) : null}
    </div>
  );
}

function CampoArchivos({
  archivos,
  claveInputArchivo,
  onCambiarArchivos,
  onEliminarArchivo,
}: {
  archivos: File[];
  claveInputArchivo: number;
  onCambiarArchivos: (archivos: File[]) => void;
  onEliminarArchivo: (indiceArchivo: number) => void;
}) {
  return (
    <div className="space-y-2">
      <CustomLabel
        optional
        className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400"
      >
        Archivos adjuntos
      </CustomLabel>
      <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
        <input
          key={claveInputArchivo}
          type="file"
          multiple
          className="sr-only"
          onChange={(event) =>
            onCambiarArchivos(Array.from(event.target.files ?? []))
          }
        />
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
          <UploadCloud size={18} />
        </span>
        <span className="mt-3 text-sm font-bold text-slate-600">
          Haga clic o arrastre archivos aqui
        </span>
        <span className="text-xs text-slate-400">
          Soporta documentos e imagenes adjuntas
        </span>
      </label>
      {archivos.length > 0 ? (
        <div className="space-y-2">
          {archivos.map((archivo, indice) => (
            <div
              key={`${archivo.name}-${archivo.lastModified}`}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-sm"
            >
              <FileText size={16} className="text-blue-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-700">
                  {archivo.name}
                </p>
                <p className="text-[11px] text-slate-400">
                  {formatearTamano(archivo.size)}
                </p>
              </div>
              <CustomButton
                type="button"
                variant="ghost"
                size="icon"
                title="Eliminar archivo"
                aria-label="Eliminar archivo"
                onClick={() => onEliminarArchivo(indice)}
              >
                <Trash2 size={14} />
              </CustomButton>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function EstadoNoticias({
  texto,
  accion,
}: {
  texto: string;
  accion?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-slate-100 bg-white p-6 text-center text-sm font-semibold text-slate-400">
      <p>{texto}</p>
      {accion}
    </div>
  );
}

function EstadoCargandoNoticias() {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-slate-100 bg-white p-6 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-brand-wine" />
      <p className="text-sm font-medium text-gray-500">Cargando...</p>
    </div>
  );
}

function obtenerPaginasPaginacion(
  paginaActual: number,
  totalPaginas: number,
): (number | "...")[] {
  if (totalPaginas <= 7) {
    return Array.from({ length: totalPaginas }, (_, indice) => indice + 1);
  }

  const paginas: (number | "...")[] = [1];
  if (paginaActual > 3) paginas.push("...");

  for (
    let pagina = Math.max(2, paginaActual - 1);
    pagina <= Math.min(totalPaginas - 1, paginaActual + 1);
    pagina++
  ) {
    paginas.push(pagina);
  }

  if (paginaActual < totalPaginas - 2) paginas.push("...");
  paginas.push(totalPaginas);

  return paginas;
}

function CustomPaginacionBanco({
  paginaActual,
  totalPaginas,
  totalRegistros,
  totalPaginaActual,
  etiqueta,
  deshabilitado = false,
  onCambiarPagina,
}: {
  paginaActual: number;
  totalPaginas: number;
  totalRegistros: number;
  totalPaginaActual: number;
  etiqueta: string;
  deshabilitado?: boolean;
  onCambiarPagina: (pagina: number) => void;
}) {
  const paginas = obtenerPaginasPaginacion(paginaActual, totalPaginas);

  return (
    <div className="flex flex-col gap-3 pt-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
      <p>
        Mostrando {totalPaginaActual} de {totalRegistros} {etiqueta}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onCambiarPagina(paginaActual - 1)}
          disabled={deshabilitado || paginaActual <= 1}
          className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Pagina anterior"
        >
          <ChevronLeft size={14} />
        </button>
        {paginas.map((pagina, indice) =>
          pagina === "..." ? (
            <span
              key={`ellipsis-${indice}`}
              className="flex h-8 w-8 items-center justify-center text-xs text-slate-400"
            >
              ...
            </span>
          ) : (
            <button
              key={pagina}
              type="button"
              onClick={() => onCambiarPagina(pagina)}
              disabled={deshabilitado}
              className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                pagina === paginaActual
                  ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-100"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {pagina}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onCambiarPagina(paginaActual + 1)}
          disabled={deshabilitado || paginaActual >= totalPaginas}
          className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Pagina siguiente"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function CustomModalBase({
  children,
  ancho,
  onCerrar,
}: {
  children: React.ReactNode;
  ancho: string;
  onCerrar: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCerrar();
      }}
    >
      <div
        className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl ${ancho}`}
      >
        {children}
      </div>
    </div>
  );
}

function BotonCerrar({ onCerrar }: { onCerrar: () => void }) {
  return (
    <button
      type="button"
      onClick={onCerrar}
      className="rounded-full p-1 text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
    >
      <X size={18} />
    </button>
  );
}

function convertirArchivo(archivo: File): CompaniaNoticiaArchivo {
  const tipoArchivo = archivo.type || "application/octet-stream";

  return {
    idCompaniaNoticiaArchivo: 0,
    idTipoArchivo: 0,
    nombreArchivo: archivo.name,
    formatoArchivo: tipoArchivo,
    archivoUrl: "",
    downloadUrl: "",
    uploadUrl: "",
  };
}

async function subirArchivosNoticia(
  archivosRespuesta: CompaniaNoticiaArchivo[],
  archivosLocales: File[],
) {
  if (archivosLocales.length === 0) return;

  const archivosConUrl = archivosRespuesta.filter(
    (archivo) => archivo.uploadUrl,
  );
  if (archivosConUrl.length !== archivosLocales.length) {
    throw new Error("La respuesta de carga de archivos es invalida");
  }

  await Promise.all(
    archivosLocales.map(async (archivoLocal, indice) => {
      const archivoRespuesta =
        archivosConUrl.find(
          (archivo) => archivo.nombreArchivo === archivoLocal.name,
        ) ?? archivosConUrl[indice];

      if (!archivoRespuesta?.uploadUrl) {
        throw new Error("No se pudo obtener la URL de carga del archivo");
      }

      const respuesta = await fetch(archivoRespuesta.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": archivoLocal.type || "application/octet-stream",
        },
        body: archivoLocal,
      });

      if (!respuesta.ok) {
        throw new Error("No se pudo subir el archivo adjunto");
      }
    }),
  );
}

function formatearFecha(fecha: string) {
  if (!fecha) return "-";
  const fechaParseada = new Date(fecha);
  if (Number.isNaN(fechaParseada.getTime())) return fecha;

  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(fechaParseada);
}

function formatearTamano(tamano: number) {
  if (tamano < 1024) return `${tamano} B`;
  if (tamano < 1024 * 1024) return `${(tamano / 1024).toFixed(1)} KB`;

  return `${(tamano / 1024 / 1024).toFixed(1)} MB`;
}

function obtenerEtiquetaCompania(compania: CompaniaListaItem) {
  return compania.nombreCompleto || `Compania ${compania.idCompania}`;
}

function convertirTextoFechaADate(fecha: string) {
  if (!fecha) return undefined;

  const fechaParseada = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(fechaParseada.getTime())) return undefined;

  return fechaParseada;
}

function convertirDateATextoFecha(fecha: Date | undefined) {
  if (!fecha) return "";

  const ano = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

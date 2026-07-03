import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CalendarDays, Clock3, FileText, Loader2, Plus, Search, Trash2, UploadCloud, User, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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

const esquemaNoticia = z.object({
  idCompania: z.coerce.number().int("Ingrese un ID valido").min(1, "Seleccione una compania"),
  titulo: z.string().trim().min(1, "Ingrese el titulo"),
  descripcion: z.string().trim().min(1, "Ingrese la descripcion"),
  fechaNoticia: z.string().trim().min(1, "Ingrese la fecha"),
  categoria: z.string().trim().optional(),
});

type FormularioNoticiaEntrada = z.input<typeof esquemaNoticia>;
type FormularioNoticia = z.output<typeof esquemaNoticia>;

interface PropsCustomBancoNoticias {
  busqueda: string;
  mostrarBotonAgregar?: boolean;
  senalApertura?: number;
}

const valoresIniciales: FormularioNoticiaEntrada = {
  idCompania: 0,
  titulo: "",
  descripcion: "",
  fechaNoticia: new Date().toISOString().slice(0, 10),
  categoria: "",
};

export function CustomBancoNoticias({
  busqueda,
  mostrarBotonAgregar = true,
  senalApertura = 0,
}: PropsCustomBancoNoticias) {
  const queryClient = useQueryClient();
  const [estaAbiertoModalNoticia, setEstaAbiertoModalNoticia] = useState(false);
  const [noticiaDetalle, setNoticiaDetalle] = useState<CompaniaNoticiaListaItem | null>(null);
  const [companiaDetalle, setCompaniaDetalle] = useState<CompaniaListaItem | null>(null);
  const [idNoticiaCargandoDetalle, setIdNoticiaCargandoDetalle] = useState<number | null>(null);
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<File[]>([]);
  const [claveInputArchivo, setClaveInputArchivo] = useState(0);

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
    queryKey: ["companiaNoticia", { busqueda, numPag: 1 }],
    queryFn: () => servicioCompaniaNoticia.list({ busqueda, numPag: 1 }),
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
  const idCompaniaSeleccionada = watch("idCompania");
  const fechaNoticiaSeleccionada = watch("fechaNoticia");

  const etiquetaPaginacion = useMemo(
    () => `Mostrando ${noticias.length} de ${totalRegistros} noticias`,
    [noticias.length, totalRegistros],
  );

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
        categoria: datos.categoria?.trim() ?? "",
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
      setNoticiaDetalle(detalleNoticia ? { ...noticia, ...detalleNoticia } : noticia);
      setIdNoticiaCargandoDetalle(null);
    }
  };

  return (
    <>
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">Noticias recientes</p>
          {mostrarBotonAgregar ? (
            <CustomButton size="sm" onClick={() => setEstaAbiertoModalNoticia(true)}>
              <Plus size={14} />
              Agregar Noticia
            </CustomButton>
          ) : null}
        </div>

        {isLoading ? (
          <EstadoNoticias texto="Cargando noticias..." />
        ) : isError ? (
          <EstadoNoticias
            texto="No se pudieron cargar las noticias."
            accion={(
              <CustomButton variant="secondary" size="sm" onClick={() => void refetch()}>
                Reintentar
              </CustomButton>
            )}
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
                        Empresa relacionada: <span className="text-slate-950">{noticia.compania}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 uppercase tracking-wide">
                        <CalendarDays size={14} className="text-slate-300" />
                        {formatearFecha(noticia.fechaNoticia)}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-lg font-bold text-slate-950">{noticia.titulo}</h2>
                      <p className="line-clamp-2 max-w-4xl text-sm font-semibold leading-6 text-slate-400">
                        {noticia.descripcion}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-5 text-xs font-bold text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 size={14} className="text-slate-300" />
                        {formatearTiempoRelativo(noticia.fechaNoticia)}
                      </span>
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
                    loading={idNoticiaCargandoDetalle === noticia.idCompaniaNoticia}
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

      <div className="flex items-center justify-between pt-4 text-xs text-slate-400">
        <p>{etiquetaPaginacion}</p>
      </div>

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
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit(guardarNoticia)}>
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-8 py-6">
              <h2 className="text-lg font-bold text-slate-950">Agregar Nueva Noticia</h2>
              <BotonCerrar onCerrar={cerrarModalNoticia} />
            </div>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-8 py-6">
              <CampoSelectorCompania
                valor={typeof idCompaniaSeleccionada === "number" ? idCompaniaSeleccionada : Number(idCompaniaSeleccionada)}
                error={errors.idCompania?.message}
                onSeleccionar={(compania) => {
                  setValue("idCompania", compania.idCompania, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
                }}
              />
              <CampoFormulario etiqueta="Titulo" error={errors.titulo?.message} requerido>
                <input
                  className="h-11 w-full rounded-lg border border-slate-100 bg-slate-50 px-3 text-sm text-slate-600 outline-none focus:border-slate-300"
                  placeholder="Ej. Actualizacion de protocolos de seguridad"
                  {...register("titulo")}
                />
              </CampoFormulario>
              <CampoFormulario etiqueta="Descripcion" error={errors.descripcion?.message} requerido>
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
                  value={convertirTextoFechaADate(String(fechaNoticiaSeleccionada ?? ""))}
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
                <CampoFormulario etiqueta="Categoria" error={errors.categoria?.message}>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-100 bg-slate-50 px-3 text-sm text-slate-600 outline-none focus:border-slate-300"
                    placeholder="Ej. Riesgo"
                    {...register("categoria")}
                  />
                </CampoFormulario>
              </div>
              <CampoArchivos
                archivos={archivosSeleccionados}
                claveInputArchivo={claveInputArchivo}
                onCambiarArchivos={(archivos) => setArchivosSeleccionados((anteriores) => [...anteriores, ...archivos])}
                onEliminarArchivo={(indiceArchivo) =>
                  setArchivosSeleccionados((anteriores) => anteriores.filter((_, indice) => indice !== indiceArchivo))
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
  if (!noticia) return null;

  return (
    <CustomModalBase ancho="max-w-5xl" onCerrar={onCerrar}>
      <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-8 py-6">
        <h2 className="text-base font-bold text-slate-950">Detalle de Noticia</h2>
        <BotonCerrar onCerrar={onCerrar} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid gap-8 px-8 py-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-7">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Titulo del articulo</p>
            <h3 className="mt-3 text-2xl font-bold leading-tight text-slate-950">{noticia.titulo}</h3>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Descripcion</p>
            <p className="mt-3 text-sm leading-7 text-slate-500">{noticia.descripcion}</p>
          </div>
          <div className="border-t border-slate-100 pt-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Empresa relacionada</p>
            <p className="mt-3 text-sm font-bold text-slate-800">{compania?.nombreCompleto ?? noticia.compania}</p>
            <div className="mt-3 grid gap-3 text-xs font-semibold text-slate-500 sm:grid-cols-2">
              <DetalleCompania etiqueta="Documento" valor={compania?.numeroDocumento} />
              <DetalleCompania etiqueta="Pais" valor={compania?.pais} />
              <DetalleCompania etiqueta="Telefono" valor={compania?.telefono} />
              <DetalleCompania etiqueta="Direccion" valor={compania?.direccion} />
            </div>
          </div>
        </div>
        <div>
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Documentos adjuntos</p>
          <div className="space-y-3">
            {noticia.archivos.length === 0 ? (
              <p className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-xs font-semibold text-slate-400">
                Sin documentos adjuntos
              </p>
            ) : (
              noticia.archivos.map((archivo) => (
                <div
                  key={`${archivo.idCompaniaNoticiaArchivo}-${archivo.nombreArchivo}`}
                  className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                      <FileText size={16} />
                    </span>
                    <span className="min-w-0 truncate text-xs font-bold text-slate-700">{archivo.nombreArchivo}</span>
                  </div>
                  {(archivo.downloadUrl || archivo.archivoUrl) ? (
                    <div className="mt-3 text-[10px] font-bold uppercase tracking-wide">
                      <a className="text-slate-950" href={archivo.downloadUrl || archivo.archivoUrl} download={archivo.nombreArchivo}>
                        Descargar
                      </a>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
        </div>
      </div>
      <div className="flex shrink-0 justify-end border-t border-slate-100 px-8 py-5">
        <CustomButton size="sm" onClick={onCerrar}>Cerrar</CustomButton>
      </div>
    </CustomModalBase>
  );
}

function DetalleCompania({ etiqueta, valor }: { etiqueta: string; valor?: string }) {
  return (
    <div>
      <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{etiqueta}</span>
      <span className="mt-1 block text-slate-700">{valor || "-"}</span>
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
      <CustomLabel required={requerido} className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {etiqueta}
      </CustomLabel>
      {children}
      {error ? <p className="text-xs font-semibold text-red-500">{error}</p> : null}
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
  const [estaAbierto, setEstaAbierto] = useState(false);
  const [companiaActual, setCompaniaActual] = useState<CompaniaListaItem | null>(null);

  const {
    data: respuestaCompanias,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["companiasNoticia", { busqueda: busquedaCompania, numPag: 1 }],
    queryFn: () => servicioCompania.list({ busqueda: busquedaCompania, numPag: 1 }),
    enabled: estaAbierto,
  });

  const companias = respuestaCompanias?.lstCompania ?? [];
  const companiaEncontrada = companias.find((compania) => compania.idCompania === valor);
  const companiaSeleccionada = companiaActual?.idCompania === valor ? companiaActual : companiaEncontrada;

  useEffect(() => {
    if (companiaEncontrada) {
      setCompaniaActual(companiaEncontrada);
    }
  }, [companiaEncontrada]);

  return (
    <div className="space-y-2">
      <CustomLabel required className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
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
          <span className={`min-w-0 truncate ${companiaSeleccionada ? "text-slate-700" : "text-slate-400"}`}>
            {companiaSeleccionada ? obtenerEtiquetaCompania(companiaSeleccionada) : "Buscar y seleccionar compania..."}
          </span>
          <Search size={16} className="shrink-0 text-slate-400" />
        </button>

        {estaAbierto ? (
          <div className="absolute left-0 right-0 top-full z-[120] mt-2 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-2xl">
            <div className="border-b border-slate-100 p-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  value={busquedaCompania}
                  onChange={(event) => setBusquedaCompania(event.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-100 bg-slate-50 pl-9 pr-3 text-xs text-slate-600 outline-none focus:border-slate-300"
                  placeholder="Buscar compania..."
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-56 overflow-y-auto">
              {isFetching ? (
                <div className="flex justify-center px-4 py-6 text-slate-400">
                  <Loader2 size={16} className="animate-spin" />
                </div>
              ) : isError ? (
                <div className="space-y-3 px-4 py-5 text-center">
                  <p className="text-xs font-semibold text-slate-400">No se pudieron cargar las companias.</p>
                  <CustomButton variant="secondary" size="sm" onClick={() => void refetch()}>
                    Reintentar
                  </CustomButton>
                </div>
              ) : companias.length === 0 ? (
                <p className="px-4 py-5 text-center text-xs font-semibold text-slate-400">No se encontraron companias.</p>
              ) : (
                companias.map((compania) => (
                  <button
                    key={compania.idCompania}
                    type="button"
                    onClick={() => {
                      setCompaniaActual(compania);
                      onSeleccionar(compania);
                      setEstaAbierto(false);
                    }}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition hover:bg-slate-50 ${
                      valor === compania.idCompania ? "bg-slate-50 text-slate-950" : "text-slate-600"
                    }`}
                  >
                    <Building2 size={16} className="mt-0.5 shrink-0 text-slate-400" />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{obtenerEtiquetaCompania(compania)}</span>
                      {compania.numeroDocumento ? (
                        <span className="block truncate text-xs text-slate-400">{compania.numeroDocumento}</span>
                      ) : null}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>
      {error ? <p className="text-xs font-semibold text-red-500">{error}</p> : null}
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
      <CustomLabel optional className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        Archivos adjuntos
      </CustomLabel>
      <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
        <input
          key={claveInputArchivo}
          type="file"
          multiple
          className="sr-only"
          onChange={(event) => onCambiarArchivos(Array.from(event.target.files ?? []))}
        />
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
          <UploadCloud size={18} />
        </span>
        <span className="mt-3 text-sm font-bold text-slate-600">Haga clic o arrastre archivos aqui</span>
        <span className="text-xs text-slate-400">Soporta documentos e imagenes adjuntas</span>
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
                <p className="truncate text-xs font-bold text-slate-700">{archivo.name}</p>
                <p className="text-[11px] text-slate-400">{formatearTamano(archivo.size)}</p>
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

function EstadoNoticias({ texto, accion }: { texto: string; accion?: React.ReactNode }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-slate-100 bg-white p-6 text-center text-sm font-semibold text-slate-400">
      <p>{texto}</p>
      {accion}
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
      <div className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl ${ancho}`}>
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

async function subirArchivosNoticia(archivosRespuesta: CompaniaNoticiaArchivo[], archivosLocales: File[]) {
  if (archivosLocales.length === 0) return;

  const archivosConUrl = archivosRespuesta.filter((archivo) => archivo.uploadUrl);
  if (archivosConUrl.length !== archivosLocales.length) {
    throw new Error("La respuesta de carga de archivos es invalida");
  }

  await Promise.all(
    archivosLocales.map(async (archivoLocal, indice) => {
      const archivoRespuesta =
        archivosConUrl.find((archivo) => archivo.nombreArchivo === archivoLocal.name)
        ?? archivosConUrl[indice];

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

function formatearTiempoRelativo(fecha: string) {
  if (!fecha) return "-";

  const fechaParseada = new Date(fecha);
  if (Number.isNaN(fechaParseada.getTime())) return "-";

  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime();
  const inicioFecha = new Date(
    fechaParseada.getFullYear(),
    fechaParseada.getMonth(),
    fechaParseada.getDate(),
  ).getTime();
  const dias = Math.floor((inicioHoy - inicioFecha) / 86_400_000);

  if (dias <= 0) return "Hoy";
  if (dias === 1) return "Ayer";

  return `Hace ${dias} dias`;
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

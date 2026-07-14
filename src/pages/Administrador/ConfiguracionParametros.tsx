import { opcionesParametros, REGISTROS_POR_PAGINA, CONFIGURACION_CAMPOS_POR_MAESTRO } from "@maximilian/shared/constants/pages/Administrador/configuracion-parametros.constants";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import {
  TablaMaestraId,
  obtenerDescripcionTablaMaestra,
  obtenerSiguienteNumTablaMaestra,
  type EntradaTablaMaestra,
  type TablaMaestraCrearRequest,
  type TablaMaestraEditarRequest,
} from "@maximilian/shared/types/tabla-maestra.type";

type ModoFormulario = "crear" | "editar";

interface FormularioParametro {
  codigo: string;
  referencia: string;
  descripcion: string;
  detalle: string;
  traduccionIngles1: string;
  traduccionIngles2: string;
  traduccionPortugues1: string;
  traduccionPortugues2: string;
}

interface FilaFormularioParametro {
  modo: ModoFormulario;
  claveRegistro?: string;
  idTablaMaestra?: number;
  valores: FormularioParametro;
}

export interface ConfiguracionCamposParametro {
  etiquetaCodigo?: string;
  codigoRequerido?: boolean;
  etiquetaReferencia?: string;
  referenciaRequerida?: boolean;
  idMaestroReferencia?: number;
  mostrarReferenciaConCodigo?: boolean;
  etiquetaDetalle?: string;
  etiquetaDescripcion?: string;
  codigoDespuesDescripcion?: boolean;
}

interface ColumnasVisiblesParametro {
  codigo: boolean;
  referencia: boolean;
  detalle: boolean;
  ingles: boolean;
  portugues: boolean;
}

function normalizarTexto(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function obtenerNumeroParametro(parametro: EntradaTablaMaestra) {
  return String(parametro.num1 ?? "");
}

function obtenerCodigoParametro(parametro: EntradaTablaMaestra) {
  return parametro.string2?.trim() || "";
}

function obtenerReferenciaParametro(parametro: EntradaTablaMaestra) {
  return parametro.num2 != null ? String(parametro.num2) : "";
}

function obtenerEtiquetaReferenciaParametro(
  parametro: EntradaTablaMaestra,
  opcionesReferencia: EntradaTablaMaestra[] | undefined,
  configuracion: ConfiguracionCamposParametro,
) {
  const referencia = parametro.num2;
  if (referencia == null) return "";

  const opcionReferencia = opcionesReferencia?.find(
    (opcion) => opcion.num1 === referencia,
  );

  if (!opcionReferencia) return String(referencia);

  if (configuracion.mostrarReferenciaConCodigo) {
    return obtenerEtiquetaCodigoDescripcionParametro(opcionReferencia);
  }

  return opcionReferencia.string1?.trim() || String(referencia);
}

function obtenerDescripcionParametro(parametro: EntradaTablaMaestra) {
  return parametro.string1?.trim() || parametro.descripcion?.trim() || "";
}

function obtenerEtiquetaCodigoDescripcionParametro(parametro: EntradaTablaMaestra) {
  const codigo = obtenerCodigoParametro(parametro);
  const descripcion = obtenerDescripcionParametro(parametro);

  return [codigo, descripcion].filter(Boolean).join(" - ");
}

function obtenerSimboloParametro(parametro: EntradaTablaMaestra) {
  return parametro.string3?.trim() || "";
}

function obtenerConfiguracionCampos(
  idMaestro: number,
): ConfiguracionCamposParametro {
  return CONFIGURACION_CAMPOS_POR_MAESTRO[idMaestro as TablaMaestraId] ?? {};
}

function obtenerTraduccionInglesParametro(parametro: EntradaTablaMaestra) {
  return parametro.string4?.trim() || "";
}

function obtenerDetalleInglesParametro(parametro: EntradaTablaMaestra) {
  return parametro.string5?.trim() || "";
}

function obtenerTraduccionPortuguesParametro(parametro: EntradaTablaMaestra) {
  return parametro.string6?.trim() || "";
}

function obtenerDetallePortuguesParametro(parametro: EntradaTablaMaestra) {
  return parametro.string7?.trim() || "";
}

function tieneValorTexto(valor?: string | null) {
  return Boolean(valor?.trim());
}

function obtenerColumnasVisibles(
  parametros: EntradaTablaMaestra[] | undefined,
  configuracion: ConfiguracionCamposParametro,
): ColumnasVisiblesParametro {
  const lista = parametros ?? [];

  return {
    codigo:
      Boolean(configuracion.etiquetaCodigo) ||
      lista.some((parametro) => tieneValorTexto(parametro.string2)),
    referencia:
      Boolean(configuracion.etiquetaReferencia) ||
      lista.some((parametro) => parametro.num2 != null),
    detalle:
      Boolean(configuracion.etiquetaDetalle) ||
      lista.some((parametro) => tieneValorTexto(parametro.string3)),
    ingles: lista.some(
      (parametro) =>
        tieneValorTexto(parametro.string4) ||
        tieneValorTexto(parametro.string5),
    ),
    portugues: lista.some(
      (parametro) =>
        tieneValorTexto(parametro.string6) ||
        tieneValorTexto(parametro.string7),
    ),
  };
}

function obtenerClaveRegistroParametro(parametro: EntradaTablaMaestra) {
  if (parametro.idTablaMaestra != null)
    return `tabla-${parametro.idTablaMaestra}`;

  return [
    "maestro",
    parametro.idMaestro,
    "num",
    parametro.num1 ?? "",
    "numero",
    obtenerNumeroParametro(parametro),
  ].join("-");
}

function crearValoresFormulario(
  parametro?: EntradaTablaMaestra,
): FormularioParametro {
  return {
    codigo: parametro ? obtenerCodigoParametro(parametro) : "",
    referencia: parametro ? obtenerReferenciaParametro(parametro) : "",
    descripcion: parametro ? obtenerDescripcionParametro(parametro) : "",
    detalle: parametro ? obtenerSimboloParametro(parametro) : "",
    traduccionIngles1: parametro
      ? obtenerTraduccionInglesParametro(parametro)
      : "",
    traduccionIngles2: parametro ? obtenerDetalleInglesParametro(parametro) : "",
    traduccionPortugues1: parametro
      ? obtenerTraduccionPortuguesParametro(parametro)
      : "",
    traduccionPortugues2: parametro
      ? obtenerDetallePortuguesParametro(parametro)
      : "",
  };
}

function crearPayloadBase(
  idMaestro: number,
  valores: FormularioParametro,
  opcionesActuales: EntradaTablaMaestra[],
  parametro?: EntradaTablaMaestra,
): TablaMaestraCrearRequest {
  const configuracion = obtenerConfiguracionCampos(idMaestro);
  const codigo = configuracion.etiquetaCodigo
    ? valores.codigo.trim() || null
    : parametro?.string2 ?? null;
  const referencia = configuracion.etiquetaReferencia
    ? Number.parseInt(valores.referencia, 10)
    : parametro?.num2 ?? null;
  const detalle = configuracion.etiquetaDetalle
    ? valores.detalle.trim() || null
    : parametro?.string3 ?? null;

  return {
    idMaestro,
    descripcion: obtenerDescripcionTablaMaestra(
      idMaestro,
      parametro?.descripcion,
    ),
    num1: parametro?.num1 ?? obtenerSiguienteNumTablaMaestra(opcionesActuales),
    num2: Number.isNaN(referencia) ? null : referencia,
    num3: parametro?.num3 ?? null,
    inputText: valores.descripcion.trim(),
    inputText2: codigo,
    string1: valores.descripcion.trim(),
    string2: codigo,
    string3: detalle,
    string4: valores.traduccionIngles1.trim() || null,
    string5: valores.traduccionIngles2.trim() || null,
    string6: valores.traduccionPortugues1.trim() || null,
    string7: valores.traduccionPortugues2.trim() || null,
    date1: parametro?.date1 ?? null,
    date2: parametro?.date2 ?? null,
    date3: parametro?.date3 ?? null,
  };
}

function CamposEdicionParametro({
  valores,
  onCambiar,
  numero,
  configuracion,
  columnasVisibles,
  opcionesReferencia,
}: {
  valores: FormularioParametro;
  onCambiar: (valores: FormularioParametro) => void;
  numero?: number | null;
  configuracion: ConfiguracionCamposParametro;
  columnasVisibles: ColumnasVisiblesParametro;
  opcionesReferencia?: EntradaTablaMaestra[];
}) {
  return (
    <>
      <td className="px-5 py-3">
        <span className="inline-flex h-9 min-w-16 items-center rounded-md bg-slate-100 px-3 text-xs font-bold text-slate-500">
          {numero ?? "Automatico"}
        </span>
      </td>
      {columnasVisibles.codigo && !configuracion.codigoDespuesDescripcion ? (
        <td className="px-5 py-3">
          {configuracion.etiquetaCodigo ? (
            <input
              value={valores.codigo}
              onChange={(event) =>
                onCambiar({ ...valores, codigo: event.target.value })
              }
              placeholder={configuracion.etiquetaCodigo}
              className="h-9 w-full rounded-md border border-blue-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          ) : (
            <span className="text-xs text-slate-300">
              {valores.codigo || "-"}
            </span>
          )}
        </td>
      ) : null}
      {columnasVisibles.referencia ? (
        <td className="px-5 py-3">
          {configuracion.idMaestroReferencia ? (
            <CustomSelectorBuscable
              options={opcionesReferencia ?? []}
              value={
                valores.referencia ? Number.parseInt(valores.referencia, 10) : undefined
              }
              onChange={(valor) =>
                onCambiar({ ...valores, referencia: String(valor) })
              }
              placeholder={`Seleccione ${configuracion.etiquetaReferencia?.toLowerCase()}`}
              obtenerEtiquetaOpcion={(opcion) =>
                configuracion.mostrarReferenciaConCodigo
                  ? obtenerEtiquetaCodigoDescripcionParametro(opcion)
                  : opcion.string1 ?? ""
              }
            />
          ) : configuracion.etiquetaReferencia ? (
            <input
              value={valores.referencia}
              onChange={(event) =>
                onCambiar({
                  ...valores,
                  referencia: event.target.value.replace(/\D/g, ""),
                })
              }
              placeholder={configuracion.etiquetaReferencia}
              className="h-9 w-28 rounded-md border border-blue-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          ) : (
            <span className="text-xs text-slate-300">
              {valores.referencia || "-"}
            </span>
          )}
        </td>
      ) : null}
      <td className="px-5 py-3">
        <input
          value={valores.descripcion}
          onChange={(event) =>
            onCambiar({ ...valores, descripcion: event.target.value })
          }
          placeholder={configuracion.etiquetaDescripcion ?? "Descripcion"}
          className="h-9 w-full rounded-md border border-blue-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </td>
      {columnasVisibles.codigo && configuracion.codigoDespuesDescripcion ? (
        <td className="px-5 py-3">
          <input
            value={valores.codigo}
            onChange={(event) =>
              onCambiar({ ...valores, codigo: event.target.value })
            }
            placeholder={configuracion.etiquetaCodigo}
            className="h-9 w-full rounded-md border border-blue-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </td>
      ) : null}
      {columnasVisibles.detalle ? (
        <td className="px-5 py-3">
          {configuracion.etiquetaDetalle ? (
            <input
              value={valores.detalle}
              onChange={(event) =>
                onCambiar({ ...valores, detalle: event.target.value })
              }
              placeholder={configuracion.etiquetaDetalle}
              className="h-9 w-full rounded-md border border-blue-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          ) : (
            <span className="text-xs text-slate-300">
              {valores.detalle || "-"}
            </span>
          )}
        </td>
      ) : null}
      {columnasVisibles.ingles ? (
        <td className="px-5 py-3">
          <div className="space-y-2">
            <input
              value={valores.traduccionIngles1}
              onChange={(event) =>
                onCambiar({
                  ...valores,
                  traduccionIngles1: event.target.value,
                })
              }
              placeholder="Traduccion"
              className="h-9 w-full rounded-md border border-blue-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            <input
              value={valores.traduccionIngles2}
              onChange={(event) =>
                onCambiar({
                  ...valores,
                  traduccionIngles2: event.target.value,
                })
              }
              placeholder="Detalle"
              className="h-9 w-full rounded-md border border-blue-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </td>
      ) : null}
      {columnasVisibles.portugues ? (
        <td className="px-5 py-3">
          <div className="space-y-2">
            <input
              value={valores.traduccionPortugues1}
              onChange={(event) =>
                onCambiar({
                  ...valores,
                  traduccionPortugues1: event.target.value,
                })
              }
              placeholder="Traducao"
              className="h-9 w-full rounded-md border border-blue-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            <input
              value={valores.traduccionPortugues2}
              onChange={(event) =>
                onCambiar({
                  ...valores,
                  traduccionPortugues2: event.target.value,
                })
              }
              placeholder="Detalhe"
              className="h-9 w-full rounded-md border border-blue-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </td>
      ) : null}
    </>
  );
}

export default function ConfiguracionParametros() {
  const clienteConsultas = useQueryClient();
  const [idMaestroSeleccionado, setIdMaestroSeleccionado] = useState<number>(
    TablaMaestraId.MONEDA,
  );
  const [filtro, setFiltro] = useState("");
  const filtroConRetardo = useRetardo(filtro);
  const [paginaActual, setPaginaActual] = useState(1);
  const [filaFormulario, setFilaFormulario] =
    useState<FilaFormularioParametro | null>(null);
  const [mensajeValidacion, setMensajeValidacion] = useState("");

  const {
    data: parametros,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["masterTable", idMaestroSeleccionado],
    queryFn: () => servicioTablaMaestra.list(idMaestroSeleccionado),
    staleTime: Infinity,
  });

  const configuracionCampos = obtenerConfiguracionCampos(
    idMaestroSeleccionado,
  );

  const { data: opcionesReferencia } = useQuery({
    queryKey: ["masterTable", configuracionCampos.idMaestroReferencia],
    queryFn: () =>
      servicioTablaMaestra.list(configuracionCampos.idMaestroReferencia!),
    enabled: Boolean(configuracionCampos.idMaestroReferencia),
    staleTime: Infinity,
  });

  const mutacionCrear = useMutation({
    mutationFn: (payload: TablaMaestraCrearRequest) =>
      servicioTablaMaestra.crear(payload),
    onSuccess: () => {
      clienteConsultas.invalidateQueries({
        queryKey: ["masterTable", idMaestroSeleccionado],
      });
      setFilaFormulario(null);
      setMensajeValidacion("");
      setPaginaActual(1);
    },
  });

  const mutacionEditar = useMutation({
    mutationFn: (payload: TablaMaestraEditarRequest) =>
      servicioTablaMaestra.editar(payload),
    onSuccess: () => {
      clienteConsultas.invalidateQueries({
        queryKey: ["masterTable", idMaestroSeleccionado],
      });
      setFilaFormulario(null);
      setMensajeValidacion("");
    },
  });

  const parametrosFiltrados = useMemo(() => {
    const termino = normalizarTexto(filtroConRetardo);
    const lista = parametros ?? [];
    if (!termino) return lista;

    return lista.filter((parametro) =>
      [
        obtenerNumeroParametro(parametro),
        obtenerCodigoParametro(parametro),
        obtenerReferenciaParametro(parametro),
        obtenerDescripcionParametro(parametro),
        obtenerSimboloParametro(parametro),
        obtenerTraduccionInglesParametro(parametro),
        obtenerDetalleInglesParametro(parametro),
        obtenerTraduccionPortuguesParametro(parametro),
        obtenerDetallePortuguesParametro(parametro),
      ].some((valor) => normalizarTexto(valor).includes(termino)),
    );
  }, [filtroConRetardo, parametros]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(parametrosFiltrados.length / REGISTROS_POR_PAGINA),
  );
  const registrosPagina = parametrosFiltrados.slice(
    (paginaActual - 1) * REGISTROS_POR_PAGINA,
    paginaActual * REGISTROS_POR_PAGINA,
  );

  const estaGuardando = mutacionCrear.isPending || mutacionEditar.isPending;
  const columnasVisibles = obtenerColumnasVisibles(
    parametros,
    configuracionCampos,
  );
  const totalColumnas =
    3 + Object.values(columnasVisibles).filter(Boolean).length;
  const anchoMinimoTabla = Math.max(760, totalColumnas * 150);

  const cambiarParametroSeleccionado = (idMaestro: number) => {
    setIdMaestroSeleccionado(idMaestro);
    setFiltro("");
    setPaginaActual(1);
    setFilaFormulario(null);
    setMensajeValidacion("");
  };

  const iniciarCreacion = () => {
    setFilaFormulario({
      modo: "crear",
      valores: crearValoresFormulario(),
    });
    setMensajeValidacion("");
    setPaginaActual(1);
  };

  const iniciarEdicion = (parametro: EntradaTablaMaestra) => {
    setFilaFormulario({
      modo: "editar",
      claveRegistro: obtenerClaveRegistroParametro(parametro),
      idTablaMaestra: parametro.idTablaMaestra ?? undefined,
      valores: crearValoresFormulario(parametro),
    });
    setMensajeValidacion("");
  };

  const cancelarFormulario = () => {
    setFilaFormulario(null);
    setMensajeValidacion("");
  };

  const guardarFormulario = () => {
    if (!filaFormulario) return;

    const descripcion = filaFormulario.valores.descripcion.trim();
    const codigo = filaFormulario.valores.codigo.trim();
    const referencia = filaFormulario.valores.referencia.trim();

    if (!descripcion) {
      setMensajeValidacion("Ingrese descripcion para continuar.");
      return;
    }

    if (configuracionCampos.codigoRequerido && !codigo) {
      setMensajeValidacion(
        `Ingrese ${configuracionCampos.etiquetaCodigo?.toLowerCase()} para continuar.`,
      );
      return;
    }

    if (configuracionCampos.referenciaRequerida && !referencia) {
      setMensajeValidacion(
        `Ingrese ${configuracionCampos.etiquetaReferencia?.toLowerCase()} para continuar.`,
      );
      return;
    }

    const parametroActual = parametros?.find(
      (parametro) =>
        obtenerClaveRegistroParametro(parametro) ===
        filaFormulario.claveRegistro,
    );

    const payload = crearPayloadBase(
      idMaestroSeleccionado,
      filaFormulario.valores,
      parametros ?? [],
      parametroActual,
    );

    if (filaFormulario.modo === "crear") {
      mutacionCrear.mutate(payload);
      return;
    }

    mutacionEditar.mutate({
      ...payload,
      idTablaMaestra: filaFormulario.idTablaMaestra,
    });
  };

  const cambiarPagina = (pagina: number) => {
    if (pagina < 1 || pagina > totalPaginas) return;
    setPaginaActual(pagina);
  };

  const paginas = useMemo(() => {
    const paginasVisibles = new Set([
      1,
      totalPaginas,
      paginaActual - 1,
      paginaActual,
      paginaActual + 1,
    ]);
    const paginasOrdenadas = Array.from(paginasVisibles)
      .filter((pagina) => pagina >= 1 && pagina <= totalPaginas)
      .sort((paginaA, paginaB) => paginaA - paginaB);

    return paginasOrdenadas.reduce<Array<number | "puntos">>(
      (acumulado, pagina, indice) => {
        const paginaAnterior = paginasOrdenadas[indice - 1];

        if (paginaAnterior && pagina - paginaAnterior > 1) {
          acumulado.push("puntos");
        }

        acumulado.push(pagina);
        return acumulado;
      },
      [],
    );
  }, [paginaActual, totalPaginas]);
  const mostrarFilaCreacion = filaFormulario?.modo === "crear";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">
            Mantenimiento de parametros
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Configura y gestiona los valores maestros del sistema.
          </p>
        </div>
        <CustomButton
          type="button"
          variant="primary"
          size="sm"
          onClick={iniciarCreacion}
          disabled={estaGuardando}
          className="h-10 rounded-lg px-4 text-[11px] uppercase tracking-wide"
        >
          <Plus size={14} />
          <span>Agregar parametro</span>
        </CustomButton>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-5 p-6 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:max-w-sm">
            <CustomSelectorBuscable
              label="Seleccionar parametro"
              options={opcionesParametros}
              value={idMaestroSeleccionado}
              onChange={cambiarParametroSeleccionado}
              placeholder="Seleccione parametro"
              obtenerEtiquetaOpcion={(opcion) => opcion.string1 ?? ""}
            />
          </div>
          <div className="relative w-full md:max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
              size={16}
            />
            <input
              type="text"
              value={filtro}
              onChange={(event) => {
                setFiltro(event.target.value);
                setPaginaActual(1);
              }}
              placeholder="Buscar en la tabla..."
              className="h-10 w-full rounded-lg border border-transparent bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />
          </div>
        </div>

        {mensajeValidacion && (
          <div className="mx-6 mb-2 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            <AlertCircle size={16} />
            <span>{mensajeValidacion}</span>
          </div>
        )}

        <div className="overflow-x-auto px-6">
          <table
            className="w-full border-collapse text-left"
            style={{ minWidth: `${anchoMinimoTabla}px` }}
          >
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-4 text-[11px] font-bold uppercase text-slate-300">
                  Numeracion
                </th>
                {columnasVisibles.codigo &&
                !configuracionCampos.codigoDespuesDescripcion ? (
                  <th className="px-5 py-4 text-[11px] font-bold uppercase text-slate-300">
                    {configuracionCampos.etiquetaCodigo ?? "Codigo"}
                  </th>
                ) : null}
                {columnasVisibles.referencia ? (
                  <th className="px-5 py-4 text-[11px] font-bold uppercase text-slate-300">
                    {configuracionCampos.etiquetaReferencia ?? "Referencia"}
                  </th>
                ) : null}
                <th className="px-5 py-4 text-[11px] font-bold uppercase text-slate-300">
                  {configuracionCampos.etiquetaDescripcion ?? "Descripcion"}
                </th>
                {columnasVisibles.codigo &&
                configuracionCampos.codigoDespuesDescripcion ? (
                  <th className="px-5 py-4 text-[11px] font-bold uppercase text-slate-300">
                    {configuracionCampos.etiquetaCodigo ?? "Codigo"}
                  </th>
                ) : null}
                {columnasVisibles.detalle ? (
                  <th className="px-5 py-4 text-[11px] font-bold uppercase text-slate-300">
                    {configuracionCampos.etiquetaDetalle ?? "Detalle"}
                  </th>
                ) : null}
                {columnasVisibles.ingles ? (
                  <th className="px-5 py-4 text-[11px] font-bold uppercase text-slate-300">
                    Ingles
                  </th>
                ) : null}
                {columnasVisibles.portugues ? (
                  <th className="px-5 py-4 text-[11px] font-bold uppercase text-slate-300">
                    Portugues
                  </th>
                ) : null}
                <th className="px-5 py-4 text-right text-[11px] font-bold uppercase text-slate-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mostrarFilaCreacion && filaFormulario && (
                <tr className="bg-slate-50/70">
                  <CamposEdicionParametro
                    valores={filaFormulario.valores}
                    numero={obtenerSiguienteNumTablaMaestra(parametros ?? [])}
                    configuracion={configuracionCampos}
                    columnasVisibles={columnasVisibles}
                    opcionesReferencia={opcionesReferencia}
                    onCambiar={(valores) =>
                      setFilaFormulario({ ...filaFormulario, valores })
                    }
                  />
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <CustomButton
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={guardarFormulario}
                        disabled={estaGuardando}
                        className="h-8 w-8 rounded-md text-emerald-500 hover:bg-emerald-50"
                        title="Guardar"
                      >
                        {estaGuardando ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Check size={16} />
                        )}
                      </CustomButton>
                      <CustomButton
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={cancelarFormulario}
                        disabled={estaGuardando}
                        className="h-8 w-8 rounded-md text-slate-300 hover:bg-slate-100 hover:text-slate-500"
                        title="Cancelar"
                      >
                        <X size={16} />
                      </CustomButton>
                    </div>
                  </td>
                </tr>
              )}

              {isLoading ? (
                <tr>
                  <td colSpan={totalColumnas} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="text-sm font-medium">
                        Cargando parametros...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={totalColumnas} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <span className="text-sm font-bold text-slate-700">
                        Error al cargar parametros
                      </span>
                      <CustomButton
                        type="button"
                        variant="wine"
                        size="sm"
                        onClick={() => refetch()}
                      >
                        Reintentar
                      </CustomButton>
                    </div>
                  </td>
                </tr>
              ) : registrosPagina.length === 0 ? (
                <tr>
                  <td
                    colSpan={totalColumnas}
                    className="px-5 py-16 text-center text-sm text-slate-400"
                  >
                    No se encontraron parametros registrados.
                  </td>
                </tr>
              ) : (
                registrosPagina.map((parametro) => {
                  const claveRegistro =
                    obtenerClaveRegistroParametro(parametro);
                  const estaEditando =
                    filaFormulario?.modo === "editar" &&
                    filaFormulario.claveRegistro === claveRegistro;

                  return (
                    <tr
                      key={claveRegistro}
                      className={
                        estaEditando ? "bg-blue-50/40" : "hover:bg-slate-50/60"
                      }
                    >
                      {estaEditando && filaFormulario ? (
                        <CamposEdicionParametro
                          valores={filaFormulario.valores}
                          numero={parametro.num1}
                          configuracion={configuracionCampos}
                          columnasVisibles={columnasVisibles}
                          opcionesReferencia={opcionesReferencia}
                          onCambiar={(valores) =>
                            setFilaFormulario({ ...filaFormulario, valores })
                          }
                        />
                      ) : (
                        <>
                          <td className="px-5 py-5 text-xs font-bold text-slate-600">
                            {obtenerNumeroParametro(parametro)}
                          </td>
                          {columnasVisibles.codigo &&
                          !configuracionCampos.codigoDespuesDescripcion ? (
                            <td className="px-5 py-5 text-xs font-semibold text-slate-600">
                              {obtenerCodigoParametro(parametro) || "-"}
                            </td>
                          ) : null}
                          {columnasVisibles.referencia ? (
                            <td className="px-5 py-5 text-xs font-semibold text-slate-600">
                              {obtenerEtiquetaReferenciaParametro(
                                parametro,
                                opcionesReferencia,
                                configuracionCampos,
                              ) || "-"}
                            </td>
                          ) : null}
                          <td className="px-5 py-5 text-xs text-slate-600">
                            {obtenerDescripcionParametro(parametro)}
                          </td>
                          {columnasVisibles.codigo &&
                          configuracionCampos.codigoDespuesDescripcion ? (
                            <td className="px-5 py-5 text-xs font-semibold text-slate-600">
                              {obtenerCodigoParametro(parametro) || "-"}
                            </td>
                          ) : null}
                          {columnasVisibles.detalle ? (
                            <td className="px-5 py-5 text-xs font-semibold text-slate-600">
                              {obtenerSimboloParametro(parametro) || "-"}
                            </td>
                          ) : null}
                          {columnasVisibles.ingles ? (
                            <td className="px-5 py-5 text-xs text-slate-600">
                              {[
                                obtenerTraduccionInglesParametro(parametro),
                                obtenerDetalleInglesParametro(parametro),
                              ]
                                .filter(Boolean)
                                .join(" / ") || "-"}
                            </td>
                          ) : null}
                          {columnasVisibles.portugues ? (
                            <td className="px-5 py-5 text-xs text-slate-600">
                              {[
                                obtenerTraduccionPortuguesParametro(parametro),
                                obtenerDetallePortuguesParametro(parametro),
                              ]
                                .filter(Boolean)
                                .join(" / ") || "-"}
                            </td>
                          ) : null}
                        </>
                      )}
                      <td className="px-5 py-5">
                        <div className="flex justify-end gap-2">
                          {estaEditando ? (
                            <>
                              <CustomButton
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={guardarFormulario}
                                disabled={estaGuardando}
                                className="h-8 w-8 rounded-md text-emerald-500 hover:bg-emerald-50"
                                title="Guardar"
                              >
                                {estaGuardando ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Check size={16} />
                                )}
                              </CustomButton>
                              <CustomButton
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={cancelarFormulario}
                                disabled={estaGuardando}
                                className="h-8 w-8 rounded-md text-slate-300 hover:bg-slate-100 hover:text-slate-500"
                                title="Cancelar"
                              >
                                <X size={16} />
                              </CustomButton>
                            </>
                          ) : (
                            <CustomButton
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => iniciarEdicion(parametro)}
                              disabled={estaGuardando}
                              className="h-8 w-8 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </CustomButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <p className="text-xs font-medium text-slate-400">
            Mostrando {registrosPagina.length} de {parametrosFiltrados.length}{" "}
            registros
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1 || isLoading || isError}
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Pagina anterior"
            >
              <ChevronLeft size={16} />
            </button>
            {paginas.map((pagina, indice) =>
              pagina === "puntos" ? (
                <span
                  key={`puntos-${indice}`}
                  className="flex h-8 w-8 items-center justify-center text-xs font-bold text-slate-300"
                >
                  ...
                </span>
              ) : (
                <button
                  key={pagina}
                  type="button"
                  onClick={() => cambiarPagina(pagina)}
                  className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold transition-colors ${
                    pagina === paginaActual
                      ? "bg-brand-black text-white"
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  }`}
                >
                  {pagina}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas || isLoading || isError}
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Pagina siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

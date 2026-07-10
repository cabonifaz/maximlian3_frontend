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
import { servicioTablaMaestra } from "@maximilian/services/tablaMaestra.service";
import {
  TablaMaestraId,
  obtenerDescripcionTablaMaestra,
  obtenerSiguienteNumTablaMaestra,
  type EntradaTablaMaestra,
  type TablaMaestraCrearRequest,
  type TablaMaestraEditarRequest,
} from "@maximilian/shared/types/tabla-maestra.type";

type ModoFormulario = "crear" | "editar";

interface ParametroDisponible {
  idMaestro: number;
  etiqueta: string;
}

interface FormularioParametro {
  codigo: string;
  descripcion: string;
  simbolo: string;
  activo: boolean;
}

interface FilaFormularioParametro {
  modo: ModoFormulario;
  claveRegistro?: string;
  idTablaMaestra?: number;
  valores: FormularioParametro;
}

const PARAMETROS_DISPONIBLES: ParametroDisponible[] = [
  { idMaestro: TablaMaestraId.MONEDA, etiqueta: "Tipo de moneda" },
  { idMaestro: TablaMaestraId.PAIS, etiqueta: "Pais" },
  { idMaestro: TablaMaestraId.IDIOMA, etiqueta: "Idioma" },
  { idMaestro: TablaMaestraId.TIPO_TRAMITE, etiqueta: "Tipo de tramite" },
  { idMaestro: TablaMaestraId.ROLES, etiqueta: "Roles" },
  {
    idMaestro: TablaMaestraId.TIPO_REG_TRIBUTARIO,
    etiqueta: "Tipo reg. tributario",
  },
  { idMaestro: TablaMaestraId.TIPO_CONTACTO, etiqueta: "Tipo contacto" },
  { idMaestro: TablaMaestraId.AREA_TRABAJO, etiqueta: "Area trabajo" },
  { idMaestro: TablaMaestraId.ESTADO_CLIENTE, etiqueta: "Estado del cliente" },
  { idMaestro: TablaMaestraId.PRODUCTO, etiqueta: "Producto" },
  { idMaestro: TablaMaestraId.EMPRESA_ATENCION, etiqueta: "Empresa atencion" },
  {
    idMaestro: TablaMaestraId.PLANTILLA_INFORME,
    etiqueta: "Plantilla informe",
  },
  { idMaestro: TablaMaestraId.TIPO_DOCUMENTO, etiqueta: "Tipo documento" },
  {
    idMaestro: TablaMaestraId.TIPO_PLAZO_CREDITO,
    etiqueta: "Tipo plazo credito",
  },
  { idMaestro: TablaMaestraId.TIPO_EMPRESA, etiqueta: "Tipo empresa" },
  { idMaestro: TablaMaestraId.CIUDAD, etiqueta: "Ciudad" },
  { idMaestro: TablaMaestraId.MES, etiqueta: "Mes" },
  { idMaestro: TablaMaestraId.SECTOR_ECONOMICO, etiqueta: "Sector economico" },
  {
    idMaestro: TablaMaestraId.ACTIVIDAD_ECONOMICA,
    etiqueta: "Actividad economica",
  },
  { idMaestro: TablaMaestraId.TIPO_LOCAL, etiqueta: "Tipo de local" },
  { idMaestro: TablaMaestraId.TIPO_BALANCE, etiqueta: "Tipo de balance" },
  {
    idMaestro: TablaMaestraId.ESTADO_FINANCIERO,
    etiqueta: "Estado financiero",
  },
  { idMaestro: TablaMaestraId.TIPO_PROVEEDOR, etiqueta: "Tipo de proveedor" },
  { idMaestro: TablaMaestraId.ETAPA_ASIGNACION, etiqueta: "Fase asignacion" },
  { idMaestro: TablaMaestraId.CLASE_CIIU, etiqueta: "Clase CIIU" },
  {
    idMaestro: TablaMaestraId.LIMITE_CREDITO_PROVEEDOR,
    etiqueta: "Limite credito proveedor",
  },
  {
    idMaestro: TablaMaestraId.TIEMPO_CREDITO_VENTAS,
    etiqueta: "Tiempo credito ventas",
  },
  { idMaestro: TablaMaestraId.CARGO_DIRECTORIO, etiqueta: "Cargo directorio" },
  {
    idMaestro: TablaMaestraId.NIVEL_CONFIABILIDAD,
    etiqueta: "Nivel confiabilidad",
  },
  { idMaestro: TablaMaestraId.TIPO_EVIDENCIA, etiqueta: "Tipo evidencia" },
  { idMaestro: TablaMaestraId.FASE_EVIDENCIA, etiqueta: "Fase evidencia" },
  {
    idMaestro: TablaMaestraId.OBLIGACION_BOLSA,
    etiqueta: "Obligacion en bolsa",
  },
  {
    idMaestro: TablaMaestraId.FORMATO_FECHA_INFORME,
    etiqueta: "Formato fecha informe",
  },
];

const opcionesParametros: EntradaTablaMaestra[] = PARAMETROS_DISPONIBLES.map(
  (parametro) => ({
    idEmpresa: 0,
    idTablaMaestra: null,
    idMaestro: 0,
    descripcion: parametro.etiqueta,
    num1: parametro.idMaestro,
    num2: null,
    num3: null,
    string1: parametro.etiqueta,
    string2: null,
    string3: null,
    date1: null,
    date2: null,
    date3: null,
  }),
);

const REGISTROS_POR_PAGINA = 4;
const ID_ESTADO_ACTIVO = 1;
const ID_ESTADO_INACTIVO = 2;

function normalizarTexto(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function obtenerCodigoParametro(parametro: EntradaTablaMaestra) {
  return parametro.string2?.trim() || String(parametro.num1 ?? "");
}

function obtenerDescripcionParametro(parametro: EntradaTablaMaestra) {
  return parametro.string1?.trim() || parametro.descripcion?.trim() || "";
}

function obtenerSimboloParametro(parametro: EntradaTablaMaestra) {
  return parametro.string3?.trim() || "";
}

function obtenerEstadoActivo(parametro: EntradaTablaMaestra) {
  return parametro.num3 !== ID_ESTADO_INACTIVO;
}

function obtenerClaveRegistroParametro(parametro: EntradaTablaMaestra) {
  if (parametro.idTablaMaestra != null)
    return `tabla-${parametro.idTablaMaestra}`;

  return [
    "maestro",
    parametro.idMaestro,
    "num",
    parametro.num1 ?? "",
    "codigo",
    obtenerCodigoParametro(parametro),
  ].join("-");
}

function crearValoresFormulario(
  parametro?: EntradaTablaMaestra,
): FormularioParametro {
  return {
    codigo: parametro ? obtenerCodigoParametro(parametro) : "",
    descripcion: parametro ? obtenerDescripcionParametro(parametro) : "",
    simbolo: parametro ? obtenerSimboloParametro(parametro) : "",
    activo: parametro ? obtenerEstadoActivo(parametro) : true,
  };
}

function crearPayloadBase(
  idMaestro: number,
  valores: FormularioParametro,
  opcionesActuales: EntradaTablaMaestra[],
  parametro?: EntradaTablaMaestra,
): TablaMaestraCrearRequest {
  return {
    idMaestro,
    descripcion: obtenerDescripcionTablaMaestra(
      idMaestro,
      parametro?.descripcion,
    ),
    num1: parametro?.num1 ?? obtenerSiguienteNumTablaMaestra(opcionesActuales),
    num2: parametro?.num2 ?? null,
    num3: valores.activo ? ID_ESTADO_ACTIVO : ID_ESTADO_INACTIVO,
    inputText: valores.descripcion.trim(),
    inputText2: valores.codigo.trim(),
    string1: valores.descripcion.trim(),
    string2: valores.codigo.trim(),
    string3: valores.simbolo.trim() || null,
    string4: parametro?.string4 ?? null,
    string5: parametro?.string5 ?? null,
    string6: parametro?.string6 ?? null,
    string7: parametro?.string7 ?? null,
    date1: parametro?.date1 ?? null,
    date2: parametro?.date2 ?? null,
    date3: parametro?.date3 ?? null,
  };
}

function EstadoParametro({ activo }: { activo: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
        activo
          ? "bg-emerald-50 text-emerald-600"
          : "bg-slate-100 text-slate-400"
      }`}
    >
      {activo ? "Activo" : "Inactivo"}
    </span>
  );
}

function CamposEdicionParametro({
  valores,
  onCambiar,
}: {
  valores: FormularioParametro;
  onCambiar: (valores: FormularioParametro) => void;
}) {
  return (
    <>
      <td className="px-5 py-3">
        <input
          value={valores.codigo}
          onChange={(event) =>
            onCambiar({ ...valores, codigo: event.target.value })
          }
          placeholder="Ej. BRL"
          className="h-9 w-full rounded-md border border-blue-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </td>
      <td className="px-5 py-3">
        <input
          value={valores.descripcion}
          onChange={(event) =>
            onCambiar({ ...valores, descripcion: event.target.value })
          }
          placeholder="Ej. Real Brasileno"
          className="h-9 w-full rounded-md border border-blue-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </td>
      <td className="px-5 py-3">
        <input
          value={valores.simbolo}
          onChange={(event) =>
            onCambiar({ ...valores, simbolo: event.target.value })
          }
          placeholder="R$"
          className="h-9 w-20 rounded-md border border-blue-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </td>
      <td className="px-5 py-3">
        <select
          value={valores.activo ? "activo" : "inactivo"}
          onChange={(event) =>
            onCambiar({ ...valores, activo: event.target.value === "activo" })
          }
          className="h-9 rounded-full border border-blue-200 bg-white px-3 text-[10px] font-bold uppercase text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </td>
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
        obtenerCodigoParametro(parametro),
        obtenerDescripcionParametro(parametro),
        obtenerSimboloParametro(parametro),
        obtenerEstadoActivo(parametro) ? "activo" : "inactivo",
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

    const codigo = filaFormulario.valores.codigo.trim();
    const descripcion = filaFormulario.valores.descripcion.trim();

    if (!codigo || !descripcion) {
      setMensajeValidacion("Ingrese codigo y descripcion para continuar.");
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

  const paginas = Array.from(
    { length: totalPaginas },
    (_, indice) => indice + 1,
  );
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
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-4 text-[11px] font-bold uppercase text-slate-300">
                  Codigo
                </th>
                <th className="px-5 py-4 text-[11px] font-bold uppercase text-slate-300">
                  Descripcion
                </th>
                <th className="px-5 py-4 text-[11px] font-bold uppercase text-slate-300">
                  Simbolo
                </th>
                <th className="px-5 py-4 text-[11px] font-bold uppercase text-slate-300">
                  Estado
                </th>
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
                  <td colSpan={5} className="px-5 py-16 text-center">
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
                  <td colSpan={5} className="px-5 py-16 text-center">
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
                    colSpan={5}
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
                          onCambiar={(valores) =>
                            setFilaFormulario({ ...filaFormulario, valores })
                          }
                        />
                      ) : (
                        <>
                          <td className="px-5 py-5 text-xs font-bold text-slate-600">
                            {obtenerCodigoParametro(parametro)}
                          </td>
                          <td className="px-5 py-5 text-xs text-slate-600">
                            {obtenerDescripcionParametro(parametro)}
                          </td>
                          <td className="px-5 py-5 text-xs font-semibold text-slate-600">
                            {obtenerSimboloParametro(parametro) || "-"}
                          </td>
                          <td className="px-5 py-5">
                            <EstadoParametro
                              activo={obtenerEstadoActivo(parametro)}
                            />
                          </td>
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
            {paginas.map((pagina) => (
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
            ))}
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

import { useEffect, useMemo, useState } from "react";
import { FileText, Sparkles, Trash2, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { MultiCustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscableMultiple";
import { CustomBloqueCargaArchivosAnalista } from "@maximilian/components/investigacion/CustomBloqueCargaArchivosAnalista";
import type {
  AlcanceExtraccionInforme,
  InformeConfiguracionExtraccion,
  InformeSeccionExtraccionDisponible,
} from "@maximilian/shared/types/informe.type";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

interface PropsCustomModalExtraccionInformacionAnalista {
  estaAbierto: boolean;
  alcance: AlcanceExtraccionInforme;
  tituloSeccion?: string;
  seccionesDisponibles?: InformeSeccionExtraccionDisponible[];
  onCerrar: () => void;
  onExtraer: (
    archivos: File[],
    alcance: AlcanceExtraccionInforme,
    especificaciones: string,
    configuracionSecciones: InformeConfiguracionExtraccion,
  ) => Promise<void> | void;
}

function formatearTamanoArchivo(tamano: number) {
  if (tamano < 1024) return `${tamano} B`;
  if (tamano < 1024 * 1024) return `${(tamano / 1024).toFixed(0)} KB`;
  return `${(tamano / (1024 * 1024)).toFixed(1)} MB`;
}

function obtenerExtensionArchivo(nombreArchivo: string) {
  return nombreArchivo.split(".").pop()?.toUpperCase() ?? "—";
}

function crearOpcionSelector(id: number, etiqueta: string): EntradaTablaMaestra {
  return {
    idEmpresa: 0,
    idTablaMaestra: null,
    idMaestro: 0,
    descripcion: "",
    num1: id,
    num2: null,
    num3: null,
    string1: etiqueta,
    string2: null,
    string3: null,
    date1: null,
    date2: null,
    date3: null,
  };
}

export function CustomModalExtraccionInformacionAnalista({
  estaAbierto,
  alcance,
  tituloSeccion,
  seccionesDisponibles = [],
  onCerrar,
  onExtraer,
}: PropsCustomModalExtraccionInformacionAnalista) {
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<File[]>([]);
  const [especificaciones, setEspecificaciones] = useState("");
  const [estaProcesando, setEstaProcesando] = useState(false);
  const [camposSeleccionadosPorSeccion, setCamposSeleccionadosPorSeccion] = useState<Record<string, number[]>>({});

  const titulo = tituloSeccion
    ? `Extraer información para "${tituloSeccion}"`
    : alcance === "general"
      ? "Extraer información del pedido"
      : "Extraer información de la sección";
  const descripcion = useMemo(() => {
    if (alcance === "general") {
      return "Se procesarán los documentos para intentar completar todas las secciones del informe.";
    }

    return "Se procesarán los documentos para completar únicamente los campos de la sección seleccionada.";
  }, [alcance]);

  const seccionesConOpciones = useMemo(
    () => seccionesDisponibles.map((seccion) => ({
      ...seccion,
      opciones: seccion.campos.map((campo) => crearOpcionSelector(campo.id, campo.etiquetaCampo)),
    })),
    [seccionesDisponibles],
  );

  const totalCamposSeleccionados = useMemo(
    () => Object.values(camposSeleccionadosPorSeccion).reduce((total, campos) => total + campos.length, 0),
    [camposSeleccionadosPorSeccion],
  );

  useEffect(() => {
    if (!estaAbierto) return;

    setCamposSeleccionadosPorSeccion(
      Object.fromEntries(
        seccionesDisponibles.map((seccion) => [seccion.claveSeccion, seccion.campos.map((campo) => campo.id)]),
      ),
    );
  }, [estaAbierto, seccionesDisponibles]);

  if (!estaAbierto) return null;

  const manejarCerrar = () => {
    if (estaProcesando) return;
    setArchivosSeleccionados([]);
    setEspecificaciones("");
    setCamposSeleccionadosPorSeccion({});
    onCerrar();
  };

  const manejarExtraer = async () => {
    if (archivosSeleccionados.length === 0 || (seccionesConOpciones.length > 0 && totalCamposSeleccionados === 0)) return;

    const configuracionSecciones = seccionesConOpciones.reduce<InformeConfiguracionExtraccion>((acumulado, seccion) => {
      const idsSeleccionados = camposSeleccionadosPorSeccion[seccion.claveSeccion] ?? [];
      const camposSeleccionados = seccion.campos
        .filter((campo) => idsSeleccionados.includes(campo.id))
        .map((campo) => campo.claveCampo);

      if (camposSeleccionados.length > 0) {
        acumulado[seccion.claveSeccion] = camposSeleccionados;
      }

      return acumulado;
    }, {});

    setEstaProcesando(true);
    try {
      await onExtraer(archivosSeleccionados, alcance, especificaciones, configuracionSecciones);
      setArchivosSeleccionados([]);
      setEspecificaciones("");
      setCamposSeleccionadosPorSeccion({});
      onCerrar();
    } finally {
      setEstaProcesando(false);
    }
  };

  const agregarArchivos = (listaArchivos: File[]) => {
    if (!listaArchivos.length) return;

    setArchivosSeleccionados((anteriores) => [...anteriores, ...listaArchivos]);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-7 py-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">
              Demo de extracción
            </p>
            <h2 className="mt-2 text-2xl font-bold text-brand-black">{titulo}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">{descripcion}</p>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={manejarCerrar} disabled={estaProcesando}>
            <X size={18} className="text-[#8ea0c0]" />
          </CustomButton>
        </div>

        <div className="space-y-4 overflow-y-auto px-6 py-1">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div className="shrink-0">
              <CustomBloqueCargaArchivosAnalista
                textoIndicativo="Arrastra archivos aquí o haz clic para subir"
                onAgregarArchivos={agregarArchivos}
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-3 self-start">
              <div className="space-y-1">
                <CustomLabel>Documentos</CustomLabel>
                
              </div>

              <div className="max-h-72 overflow-y-auto rounded-xl border border-gray-100">
                {archivosSeleccionados.length === 0 ? (
                  <div className="flex min-h-20 items-center justify-center text-sm text-gray-400">
                    No hay archivos adjuntos
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-white">
                      <tr className="border-b border-gray-100">
                        <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-400">Nombre</th>
                        <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-400">Formato</th>
                        <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-400">Tamaño</th>
                        <th className="px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {archivosSeleccionados.map((archivo, indice) => (
                        <tr key={`${archivo.name}-${archivo.size}-${indice}`} className="bg-amber-50 transition-colors hover:bg-amber-100/60">
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <FileText size={18} className="shrink-0 text-gray-400" />
                              <span className="max-w-64 truncate font-medium text-gray-700">{archivo.name}</span>
                              <span className="shrink-0 rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                                Nuevo
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-gray-500">{obtenerExtensionArchivo(archivo.name)}</td>
                          <td className="px-3 py-2.5 whitespace-nowrap text-gray-500">{formatearTamanoArchivo(archivo.size)}</td>
                          <td className="px-3 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setArchivosSeleccionados((anteriores) =>
                                  anteriores.filter((_, indiceActual) => indiceActual !== indice),
                                );
                              }}
                              className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {seccionesConOpciones.length > 0 && (
                <div className="space-y-2 rounded-xl border border-gray-100 bg-slate-50/40 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <CustomLabel>Campos a completar</CustomLabel>
                    <span className="text-xs text-slate-400">
                      {totalCamposSeleccionados} seleccionado{totalCamposSeleccionados === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="max-h-40 space-y-2 overflow-y-auto">
                    {seccionesConOpciones.map((seccion) => (
                      <div key={seccion.claveSeccion} className="grid gap-2 rounded-lg border border-gray-100 bg-white p-2 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-brand-black">{seccion.etiquetaSeccion}</p>
                          <p className="text-[11px] text-slate-400">
                            {seccion.campos.length} campo{seccion.campos.length === 1 ? "" : "s"}
                          </p>
                        </div>
                        <MultiCustomSelectorBuscable
                          label={`Campos de ${seccion.etiquetaSeccion}`}
                          options={seccion.opciones}
                          value={camposSeleccionadosPorSeccion[seccion.claveSeccion] ?? []}
                          onChange={(valor) =>
                            setCamposSeleccionadosPorSeccion((anterior) => ({
                              ...anterior,
                              [seccion.claveSeccion]: valor,
                            }))
                          }
                          hideLabel
                          resumirSelecciones
                          placeholder="Seleccione campos"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <label className="space-y-2">
            <CustomLabel>Especificaciones</CustomLabel>
            <input
              value={especificaciones}
              onChange={(event) => setEspecificaciones(event.target.value)}
              placeholder="Ingrese instrucciones para la IA"
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-7 py-5">
          <CustomButton variant="secondary" size="sm" onClick={manejarCerrar} disabled={estaProcesando}>
            Cancelar
          </CustomButton>
          <CustomButton
            size="sm"
            onClick={manejarExtraer}
            disabled={archivosSeleccionados.length === 0 || (seccionesConOpciones.length > 0 && totalCamposSeleccionados === 0)}
            loading={estaProcesando}
            loadingText="Extrayendo..."
          >
            <Sparkles size={14} />
            Extraer información
          </CustomButton>
        </div>
      </div>
    </div>
  );
}

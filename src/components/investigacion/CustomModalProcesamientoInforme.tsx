import { FileText, Sparkles, Trash2, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { MultiCustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscableMultiple";
import { CustomBloqueCargaArchivosAnalista } from "@maximilian/components/investigacion/CustomBloqueCargaArchivos";
import { useModalProcesamientoInforme } from "@maximilian/hooks/useModalProcesamientoInforme";
import type {
  AlcanceExtraccionInforme,
  InformeConfiguracionExtraccion,
  InformeSeccionExtraccionDisponible,
} from "@maximilian/shared/types/informe.type";
import {
  formatearTamanoArchivo,
  obtenerExtensionArchivo,
} from "@maximilian/shared/utils/archivo.util";

export type ModoProcesamientoInforme = "revision" | "directo";

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
    modo: ModoProcesamientoInforme,
  ) => Promise<void> | void;
  etiquetaContexto?: string;
  textoBotonAccion?: string;
  textoBotonAccionCargando?: string;
  textoBotonAccionDirecta?: string;
  textoBotonAccionDirectaCargando?: string;
  textoEspecificaciones?: string;
  marcadorEspecificaciones?: string;
  verboAccion?: string;
  archivosDisponibles?: File[];
  ocultarCargaArchivos?: boolean;
  ocultarEspecificaciones?: boolean;
  ocultarCancelar?: boolean;
  mostrarAccionDirecta?: boolean;
}

export function CustomModalExtraccionInformacionAnalista({
  estaAbierto,
  alcance,
  tituloSeccion,
  seccionesDisponibles = [],
  onCerrar,
  onExtraer,
  etiquetaContexto = "",
  textoBotonAccion = "Extraer información",
  textoBotonAccionCargando = "Extrayendo...",
  textoBotonAccionDirecta = "Aplicar directamente",
  textoBotonAccionDirectaCargando = "Aplicando...",
  textoEspecificaciones = "Especificaciones",
  marcadorEspecificaciones = "Ingrese instrucciones para la IA",
  verboAccion = "Extraer",
  archivosDisponibles = [],
  ocultarCargaArchivos = false,
  ocultarEspecificaciones = false,
  ocultarCancelar = false,
  mostrarAccionDirecta = false,
}: PropsCustomModalExtraccionInformacionAnalista) {
  const {
    actualizarCamposSeccion,
    agregarArchivos,
    archivosSeleccionados,
    camposSeleccionadosPorSeccion,
    descripcion,
    eliminarArchivo,
    especificaciones,
    estaAccionDeshabilitada,
    estaProcesando,
    manejarCerrar,
    manejarExtraer,
    modoProcesando,
    seccionesConOpciones,
    setEspecificaciones,
    titulo,
    totalCamposSeleccionados,
  } = useModalProcesamientoInforme({
    alcance,
    archivosDisponibles,
    estaAbierto,
    ocultarCargaArchivos,
    onCerrar,
    onExtraer,
    seccionesDisponibles,
    tituloSeccion,
    verboAccion,
  });

  if (!estaAbierto) return null;

  const selectorCampos = (
    compacto: boolean,
    claseContenedor: string,
    claseItem: string,
  ) => (
    <div className={claseContenedor}>
      <div className="flex items-center justify-between gap-3">
        <CustomLabel>Campos a completar</CustomLabel>
        <span className="text-xs text-slate-400">
          {totalCamposSeleccionados} seleccionado
          {totalCamposSeleccionados === 1 ? "" : "s"}
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
        {seccionesConOpciones.map((seccion) => (
          <div key={seccion.claveSeccion} className={claseItem}>
            <div className="min-w-0">
              <p
                className={`${compacto ? "text-xs" : "text-sm"} truncate font-bold text-brand-black`}
              >
                {seccion.etiquetaSeccion}
              </p>
              <p className={`${compacto ? "text-[11px]" : "text-xs"} text-slate-400`}>
                {seccion.campos.length} campo
                {seccion.campos.length === 1 ? "" : "s"}
              </p>
            </div>
            <MultiCustomSelectorBuscable
              label={`Campos de ${seccion.etiquetaSeccion}`}
              options={seccion.opciones}
              value={camposSeleccionadosPorSeccion[seccion.claveSeccion] ?? []}
              onChange={(valor) =>
                actualizarCamposSeccion(seccion.claveSeccion, valor)
              }
              hideLabel
              resumirSelecciones
              mostrarAccionSeleccionarTodos
              placeholder="Seleccione campos"
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[110] flex min-h-screen items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="flex max-h-[calc(100vh-2rem)] min-h-0 w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-7 py-6">
          <div>
            {etiquetaContexto ? (
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">
                {etiquetaContexto}
              </p>
            ) : null}
            <h2 className="mt-2 text-2xl font-bold text-brand-black">
              {titulo}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              {descripcion}
            </p>
          </div>
          <CustomButton
            variant="ghost"
            size="icon"
            onClick={manejarCerrar}
            disabled={estaProcesando}
          >
            <X size={18} className="text-[#8ea0c0]" />
          </CustomButton>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-4 lg:overflow-hidden">
          {ocultarCargaArchivos ? null : (
            <div className="flex min-h-0 flex-col gap-4 lg:flex-1 lg:flex-row lg:items-stretch">
              <div className="shrink-0">
                <CustomBloqueCargaArchivosAnalista
                  textoIndicativo="Arrastra archivos aquí o haz clic para subir"
                  onAgregarArchivos={agregarArchivos}
                />
              </div>

              <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
                <div className="flex min-w-0 flex-col gap-3">
                  <div className="space-y-1">
                    <CustomLabel>Documentos</CustomLabel>
                  </div>

                  <div className="max-h-72 max-w-full overflow-auto rounded-xl border border-gray-100">
                    {archivosSeleccionados.length === 0 ? (
                      <div className="flex min-h-20 items-center justify-center text-sm text-gray-400">
                        No hay archivos adjuntos
                      </div>
                    ) : (
                      <table className="w-full min-w-[560px] text-sm">
                        <thead className="sticky top-0 z-10 bg-white">
                          <tr className="border-b border-gray-100">
                            <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-400">
                              Nombre
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-400">
                              Formato
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-400">
                              Tamaño
                            </th>
                            <th className="px-3 py-2" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {archivosSeleccionados.map((archivo, indice) => (
                            <tr
                              key={`${archivo.name}-${archivo.size}-${indice}`}
                              className="bg-amber-50 transition-colors hover:bg-amber-100/60"
                            >
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-2">
                                  <FileText
                                    size={18}
                                    className="shrink-0 text-gray-400"
                                  />
                                  <span className="max-w-64 truncate font-medium text-gray-700">
                                    {archivo.name}
                                  </span>
                                  <span className="shrink-0 rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                                    Nuevo
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-2.5 text-gray-500">
                                {obtenerExtensionArchivo(archivo.name)}
                              </td>
                              <td className="px-3 py-2.5 whitespace-nowrap text-gray-500">
                                {formatearTamanoArchivo(archivo.size)}
                              </td>
                              <td className="px-3 py-2.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => eliminarArchivo(indice)}
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
                </div>

                {seccionesConOpciones.length > 0
                  ? selectorCampos(
                      true,
                      "flex min-h-48 flex-1 flex-col gap-2 rounded-xl border border-gray-100 bg-slate-50/40 p-3",
                      "grid gap-2 rounded-lg border border-gray-100 bg-white p-2 md:grid-cols-[180px_minmax(0,1fr)] md:items-center",
                    )
                  : null}
              </div>
            </div>
          )}

          {ocultarCargaArchivos && seccionesConOpciones.length > 0
            ? selectorCampos(
                false,
                "flex min-h-0 flex-1 flex-col gap-3 rounded-2xl border border-gray-100 bg-slate-50/60 p-4",
                "grid gap-3 rounded-xl border border-gray-100 bg-white p-3 md:grid-cols-[220px_minmax(0,1fr)] md:items-center",
              )
            : null}

          {ocultarEspecificaciones ? null : (
            <label className="shrink-0 space-y-2">
              <CustomLabel>{textoEspecificaciones}</CustomLabel>
              <input
                type="text"
                value={especificaciones}
                onChange={(event) => setEspecificaciones(event.target.value)}
                placeholder={marcadorEspecificaciones}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
              />
            </label>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-7 py-5">
          {ocultarCancelar ? null : (
            <CustomButton
              variant="secondary"
              size="sm"
              onClick={manejarCerrar}
              disabled={estaProcesando}
            >
              Cancelar
            </CustomButton>
          )}
          {mostrarAccionDirecta ? (
            <CustomButton
              variant="secondary"
              size="sm"
              onClick={() => manejarExtraer("directo")}
              disabled={estaAccionDeshabilitada}
              loading={estaProcesando && modoProcesando === "directo"}
              loadingText={textoBotonAccionDirectaCargando}
            >
              <Sparkles size={14} />
              {textoBotonAccionDirecta}
            </CustomButton>
          ) : null}
          <CustomButton
            size="sm"
            onClick={() => manejarExtraer("revision")}
            disabled={estaAccionDeshabilitada}
            loading={estaProcesando && modoProcesando === "revision"}
            loadingText={textoBotonAccionCargando}
          >
            <Sparkles size={14} />
            {textoBotonAccion}
          </CustomButton>
        </div>
      </div>
    </div>
  );
}

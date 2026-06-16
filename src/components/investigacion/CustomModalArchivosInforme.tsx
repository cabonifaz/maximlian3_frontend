import { Download, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomModalConfirmacionEliminacion } from "@maximilian/components/common/CustomModalConfirmacionEliminacion";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { CustomBloqueCargaArchivosAnalista } from "@maximilian/components/investigacion/CustomBloqueCargaArchivos";
import type { ReferenciaBloqueCargaArchivosAnalista } from "@maximilian/components/investigacion/CustomBloqueCargaArchivos";
import type { ArchivoInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { informeService } from "@maximilian/services/informe.service";
import { servicioTablaMaestra } from "@maximilian/services/tablaMaestra.service";

interface PropsCustomModalArchivosInvestigacionAnalista {
  estaAbierto: boolean;
  idPedido?: number;
  idInforme?: number;
  archivos: ArchivoInvestigacionAnalista[];
  onCerrar: () => void;
  onInformeCreado?: (idInforme: number) => void;
  onArchivosChange: (archivos: ArchivoInvestigacionAnalista[]) => void;
}

function formatearTamanoArchivo(tamano: number) {
  if (tamano < 1024) return `${tamano} B`;
  if (tamano < 1024 * 1024) return `${(tamano / 1024).toFixed(0)} KB`;
  return `${(tamano / (1024 * 1024)).toFixed(1)} MB`;
}

function obtenerExtensionArchivo(nombre: string) {
  return nombre.split(".").pop()?.toUpperCase() ?? "—";
}

export function CustomModalArchivosInvestigacionAnalista({
  estaAbierto,
  idPedido,
  idInforme,
  archivos,
  onCerrar,
  onInformeCreado,
  onArchivosChange,
}: PropsCustomModalArchivosInvestigacionAnalista) {
  const bloqueCargaRef = useRef<ReferenciaBloqueCargaArchivosAnalista>(null);
  const [idArchivoDescargando, setIdArchivoDescargando] = useState<string | null>(null);
  const [idArchivoActualizando, setIdArchivoActualizando] = useState<string | null>(null);
  const [archivoAEliminar, setArchivoAEliminar] = useState<ArchivoInvestigacionAnalista | null>(null);
  const [estaEliminando, setEstaEliminando] = useState(false);
  const [estaGuardandoArchivos, setEstaGuardandoArchivos] = useState(false);
  const { data: opcionesTipoEvidencia } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_EVIDENCIA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_EVIDENCIA),
    enabled: estaAbierto,
    staleTime: Infinity,
  });
  const { data: opcionesFaseEvidencia } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.FASE_EVIDENCIA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.FASE_EVIDENCIA),
    enabled: estaAbierto,
    staleTime: Infinity,
  });

  if (!estaAbierto) return null;

  const descargarArchivo = async (archivo: ArchivoInvestigacionAnalista) => {
    if (!archivo.idInformeArchivo && !archivo.urlDescarga) return;

    setIdArchivoDescargando(archivo.id);
    try {
      const downloadUrl = archivo.idInformeArchivo
        ? (await informeService.obtenerArchivo({
            idInformeArchivo: archivo.idInformeArchivo,
          })).downloadUrl
        : archivo.urlDescarga;
      if (downloadUrl) window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } finally {
      setIdArchivoDescargando(null);
    }
  };

  const agregarArchivos = (listaArchivos: File[]) => {
    if (!listaArchivos.length) return;

    const nuevosArchivos: ArchivoInvestigacionAnalista[] = listaArchivos.map((archivo) => ({
      id: `${archivo.name}-${archivo.size}-${Date.now()}-${Math.random()}`,
      nombre: archivo.name,
      extension: obtenerExtensionArchivo(archivo.name),
      tamano: archivo.size,
      tipoDocumento: "",
      archivo,
    }));

    onArchivosChange([...archivos, ...nuevosArchivos]);
  };

  const obtenerIdTipoEvidencia = (archivo: ArchivoInvestigacionAnalista) =>
    archivo.idTipoEvidencia
    ?? opcionesTipoEvidencia?.find(
      (opcion) => opcion.string1?.trim().toLowerCase() === archivo.tipoDocumento.toLowerCase(),
    )?.num1
    ?? undefined;

  const esTipoEvidencia = (archivo: ArchivoInvestigacionAnalista) => {
    const idTipoEvidencia = obtenerIdTipoEvidencia(archivo);
    const textoTipo = opcionesTipoEvidencia
      ?.find((opcion) => opcion.num1 === idTipoEvidencia)
      ?.string1
      ?.trim()
      .toLowerCase();

    return textoTipo?.includes("evidencia") ?? archivo.tipoDocumento === "Evidencia";
  };

  const archivosNuevos = archivos.filter((archivo) => !archivo.esPersistido && archivo.archivo);
  const archivosNuevosSinTipo = archivosNuevos.filter((archivo) => !obtenerIdTipoEvidencia(archivo));
  const archivosNuevosEvidenciaSinFase = archivosNuevos.filter(
    (archivo) => esTipoEvidencia(archivo) && !archivo.idFaseEvidencia,
  );
  const hayArchivosNuevosIncompletos =
    archivosNuevosSinTipo.length > 0 || archivosNuevosEvidenciaSinFase.length > 0;

  const actualizarArchivoPersistido = async (
    archivo: ArchivoInvestigacionAnalista,
    cambios: Pick<ArchivoInvestigacionAnalista, "idTipoEvidencia" | "idFaseEvidencia" | "tipoDocumento">,
  ) => {
    if (!archivo.idInformeArchivo || !cambios.idTipoEvidencia) return;

    setIdArchivoActualizando(archivo.id);
    try {
      await informeService.actualizarArchivo({
        idInformeArchivo: archivo.idInformeArchivo,
        idTipoArchivo: cambios.idTipoEvidencia,
        idFaseEvidencia: cambios.idFaseEvidencia ?? null,
      });
      onArchivosChange(
        archivos.map((item) => item.id === archivo.id ? { ...item, ...cambios } : item),
      );
    } finally {
      setIdArchivoActualizando(null);
    }
  };

  const guardarArchivosNuevos = async () => {
    if (!idPedido || archivosNuevos.length === 0) return;
    if (archivosNuevosSinTipo.length > 0) {
      toast.error("Selecciona el tipo de todos los archivos antes de adjuntar.");
      return;
    }
    if (archivosNuevosEvidenciaSinFase.length > 0) {
      toast.error("Selecciona la fase de cada evidencia antes de adjuntar.");
      return;
    }

    const toastId = toast.loading("Preparando archivos...");
    setEstaGuardandoArchivos(true);
    try {
      const respuestaUrls = await informeService.generarUrlsArchivo({
        idPedido,
        nombres: archivosNuevos.map((archivo) => archivo.nombre),
      });
      const idInformeParaArchivos = respuestaUrls.idInforme ?? idInforme ?? 0;
      const urlsDisponibles = [...respuestaUrls.archivos];
      const archivosSubidos: Array<{
        archivo: ArchivoInvestigacionAnalista;
        archivoUrl: string;
      }> = [];
      const nombresFallidos: string[] = [];

      for (const archivo of archivosNuevos) {
        const indiceUrl = urlsDisponibles.findIndex((item) => item.nombre === archivo.nombre);
        const urlGenerada = indiceUrl >= 0
          ? urlsDisponibles.splice(indiceUrl, 1)[0]
          : urlsDisponibles.shift();
        if (!urlGenerada || !archivo.archivo) {
          nombresFallidos.push(archivo.nombre);
          continue;
        }

        try {
          toast.loading(`Subiendo ${archivo.nombre}...`, { id: toastId });
          await informeService.subirArchivoUrlPrefirmada(urlGenerada.uploadUrl, archivo.archivo);
          archivosSubidos.push({ archivo, archivoUrl: urlGenerada.archivoUrl });
        } catch {
          nombresFallidos.push(archivo.nombre);
        }
      }

      if (archivosSubidos.length > 0) {
        toast.loading("Registrando archivos...", { id: toastId });
        const respuestaInsercion = await informeService.insertarArchivoLote({
          idInforme: idInformeParaArchivos,
          idPedido,
          archivos: archivosSubidos.map(({ archivo, archivoUrl }) => ({
            nombre: archivo.nombre,
            archivoUrl,
            extension: archivo.extension,
            tamanoBytes: archivo.tamano,
            idTipoArchivo: archivo.idTipoEvidencia ?? null,
            idFaseEvidencia: archivo.idFaseEvidencia ?? null,
          })),
        });
        const idInformeCreado = respuestaInsercion.idInforme ?? respuestaUrls.idInforme;
        if (!idInforme && idInformeCreado) {
          onInformeCreado?.(idInformeCreado);
        }

        const idsSubidos = new Set(archivosSubidos.map(({ archivo }) => archivo.id));
        onArchivosChange(
          archivos.map((archivo) =>
            idsSubidos.has(archivo.id)
              ? { ...archivo, esPersistido: true, archivo: undefined }
              : archivo,
          ),
        );
      }

      if (nombresFallidos.length > 0) {
        toast.error(`No se pudieron subir: ${nombresFallidos.join(", ")}.`, { id: toastId });
      } else {
        toast.dismiss(toastId);
      }
    } catch {
      toast.error("No se pudieron adjuntar los archivos.", { id: toastId });
    } finally {
      setEstaGuardandoArchivos(false);
    }
  };

  const eliminarArchivoPersistido = async () => {
    if (!archivoAEliminar?.idInformeArchivo) return;

    setEstaEliminando(true);
    try {
      await informeService.eliminarArchivo({
        idInformeArchivo: archivoAEliminar.idInformeArchivo,
      });
      onArchivosChange(archivos.filter((archivo) => archivo.id !== archivoAEliminar.id));
      setArchivoAEliminar(null);
    } finally {
      setEstaEliminando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-black">Archivos del informe</h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">
              Anexos de trabajo
            </p>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
            <X size={18} className="text-[#8ea0c0]" />
          </CustomButton>
        </div>

        <div className="flex gap-4 px-8 py-6">
          <CustomBloqueCargaArchivosAnalista
            ref={bloqueCargaRef}
            textoIndicativo="Arrastra archivos aquí o haz clic para subir"
            onAgregarArchivos={agregarArchivos}
          />

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-100">
              {archivos.length === 0 ? (
              <div className="flex min-h-40 items-center justify-center text-sm text-gray-400">
                  No hay archivos adjuntos
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr className="border-b border-gray-100">
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-400">Nombre</th>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-400">Formato</th>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-400">Tamaño</th>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-400">Tipo</th>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-400">Fase</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {archivos.map((archivo) => (
                      <tr
                        key={archivo.id}
                        className={
                          archivo.esPersistido
                            ? "transition-colors hover:bg-slate-50"
                            : "bg-amber-50 transition-colors hover:bg-amber-100/60"
                        }
                      >
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <span title={archivo.nombre} className="max-w-32 truncate font-medium text-gray-700">{archivo.nombre}</span>
                            {!archivo.esPersistido ? (
                              <span className="shrink-0 rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                                Nuevo
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-gray-500">{archivo.extension}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-gray-500">{formatearTamanoArchivo(archivo.tamano)}</td>
                        <td className="px-3 py-2.5">
                          <CustomSelectorBuscable
                            options={opcionesTipoEvidencia}
                            value={obtenerIdTipoEvidencia(archivo)}
                            disabled={idArchivoActualizando === archivo.id}
                            onChange={(valor) => {
                              const textoTipo = opcionesTipoEvidencia
                                ?.find((opcion) => opcion.num1 === valor)
                                ?.string1
                                ?.trim();
                              const evidenciaSeleccionada = textoTipo?.toLowerCase().includes("evidencia") ?? false;
                              const cambios = {
                                idTipoEvidencia: valor,
                                tipoDocumento: evidenciaSeleccionada ? "Evidencia" as const : "Informativo" as const,
                                idFaseEvidencia: evidenciaSeleccionada ? archivo.idFaseEvidencia : undefined,
                              };

                              if (archivo.esPersistido) {
                                void actualizarArchivoPersistido(archivo, cambios);
                              } else {
                                onArchivosChange(
                                  archivos.map((item) =>
                                    item.id === archivo.id ? { ...item, ...cambios } : item,
                                  ),
                                );
                              }
                            }}
                            onClear={archivo.esPersistido ? undefined : () =>
                              onArchivosChange(
                                archivos.map((item) =>
                                  item.id === archivo.id
                                    ? {
                                        ...item,
                                        tipoDocumento: "",
                                        idTipoEvidencia: undefined,
                                        idFaseEvidencia: undefined,
                                        faseVinculada: undefined,
                                      }
                                    : item,
                                ),
                              )
                            }
                            optional
                            mostrarTextoOpcionalEnLabel={false}
                            placeholder={archivo.esPersistido ? "Seleccione" : "Tipo requerido"}
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          {esTipoEvidencia(archivo) ? (
                            <CustomSelectorBuscable
                              options={opcionesFaseEvidencia}
                              value={archivo.idFaseEvidencia}
                              disabled={idArchivoActualizando === archivo.id}
                              onChange={(valor) => {
                                const cambios = {
                                  idTipoEvidencia: obtenerIdTipoEvidencia(archivo),
                                  idFaseEvidencia: valor,
                                  tipoDocumento: "Evidencia" as const,
                                };

                                if (archivo.esPersistido) {
                                  void actualizarArchivoPersistido(archivo, cambios);
                                } else {
                                  onArchivosChange(
                                    archivos.map((item) =>
                                      item.id === archivo.id
                                        ? { ...item, idFaseEvidencia: valor }
                                        : item,
                                    ),
                                  );
                                }
                              }}
                              onClear={archivo.esPersistido ? undefined : () =>
                                onArchivosChange(
                                  archivos.map((item) =>
                                    item.id === archivo.id
                                      ? { ...item, idFaseEvidencia: undefined }
                                      : item,
                                  ),
                                )
                              }
                              optional
                              mostrarTextoOpcionalEnLabel={false}
                              placeholder={archivo.esPersistido ? "Seleccione" : "Fase requerida"}
                            />
                          ) : (
                            <span className="text-xs text-slate-400">No aplica</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex justify-end gap-1">
                            {archivo.idInformeArchivo || archivo.urlDescarga ? (
                              <button
                                type="button"
                                onClick={() => descargarArchivo(archivo)}
                                disabled={idArchivoDescargando === archivo.id}
                                className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-sky-50 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
                                title="Descargar archivo"
                              >
                                <Download size={15} />
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => {
                                if (archivo.esPersistido) {
                                  setArchivoAEliminar(archivo);
                                  return;
                                }
                                onArchivosChange(archivos.filter((item) => item.id !== archivo.id));
                              }}
                              className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500"
                              title={archivo.esPersistido ? "Eliminar archivo" : "Quitar archivo"}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/50 px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium text-slate-500">
            {archivosNuevosSinTipo.length > 0
              ? "Completa el tipo de archivo antes de adjuntar."
              : archivosNuevosEvidenciaSinFase.length > 0
                ? "Completa la fase de cada evidencia antes de adjuntar."
                : ""}
          </p>
          <CustomButton
            variant="wine"
            size="sm"
            loading={estaGuardandoArchivos}
            loadingText="Adjuntando..."
            disabled={!idPedido || archivosNuevos.length === 0 || hayArchivosNuevosIncompletos}
            onClick={() => void guardarArchivosNuevos()}
          >
            Adjuntar archivos
          </CustomButton>
        </div>
      </div>

      <CustomModalConfirmacionEliminacion
        isOpen={archivoAEliminar !== null}
        onClose={() => setArchivoAEliminar(null)}
        onConfirm={() => void eliminarArchivoPersistido()}
        title="Eliminar archivo"
        isSubmitting={estaEliminando}
      >
        <p className="text-sm font-medium">{archivoAEliminar?.nombre}</p>
      </CustomModalConfirmacionEliminacion>
    </div>
  );
}

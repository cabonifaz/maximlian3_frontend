import { Download, Trash2, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomModalConfirmacionEliminacion } from "@maximilian/components/common/CustomModalConfirmacionEliminacion";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { CustomBloqueCargaArchivosAnalista } from "@maximilian/components/investigacion/CustomBloqueCargaArchivos";
import {
  esOpcionEvidencia,
  useModalArchivosInforme,
} from "@maximilian/hooks/useModalArchivosInforme";
import type { ArchivoInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";
import { formatearTamanoArchivo } from "@maximilian/shared/utils/archivo.util";

interface PropsCustomModalArchivosInvestigacionAnalista {
  estaAbierto: boolean;
  idPedido?: number;
  idInforme?: number;
  archivos: ArchivoInvestigacionAnalista[];
  idIdioma?: number;
  soloLectura?: boolean;
  onCerrar: () => void;
  onInformeCreado?: (idInforme: number) => void;
  onArchivosChange: (archivos: ArchivoInvestigacionAnalista[]) => void;
}

export function CustomModalArchivosInvestigacionAnalista({
  estaAbierto,
  idPedido,
  idInforme,
  archivos,
  idIdioma,
  soloLectura = false,
  onCerrar,
  onInformeCreado,
  onArchivosChange,
}: PropsCustomModalArchivosInvestigacionAnalista) {
  const {
    actualizarArchivoLocal,
    actualizarArchivoPersistido,
    agregarArchivos,
    archivoAEliminar,
    archivosNuevos,
    archivosNuevosEvidenciaSinFase,
    archivosNuevosSinTipo,
    bloqueCargaRef,
    descargarArchivo,
    eliminarArchivoPersistido,
    esTipoEvidencia,
    estaEliminando,
    estaGuardandoArchivos,
    guardarArchivosNuevos,
    hayArchivosNuevosIncompletos,
    idArchivoActualizando,
    idArchivoDescargando,
    obtenerIdTipoEvidencia,
    opcionesFaseEvidencia,
    opcionesTipoEvidencia,
    quitarArchivoLocal,
    setArchivoAEliminar,
  } = useModalArchivosInforme({
    archivos,
    estaAbierto,
    idIdioma,
    idInforme,
    idPedido,
    onArchivosChange,
    onInformeCreado,
    soloLectura,
  });

  if (!estaAbierto) return null;

  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-8 sm:py-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-black">
              Archivos del informe
            </h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">
              Anexos de trabajo
            </p>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
            <X size={18} className="text-[#8ea0c0]" />
          </CustomButton>
        </div>

        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-8 sm:py-6 lg:flex-row">
          {!soloLectura ? (
            <CustomBloqueCargaArchivosAnalista
              ref={bloqueCargaRef}
              textoIndicativo="Arrastra archivos aquí o haz clic para subir"
              onAgregarArchivos={agregarArchivos}
            />
          ) : null}

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="max-h-80 max-w-full overflow-auto rounded-xl border border-gray-100">
              {archivos.length === 0 ? (
                <div className="flex min-h-40 items-center justify-center text-sm text-gray-400">
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
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-400">
                        Tipo
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-400">
                        Fase
                      </th>
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
                            <span
                              title={archivo.nombre}
                              className="max-w-32 truncate font-medium text-gray-700"
                            >
                              {archivo.nombre}
                            </span>
                            {!archivo.esPersistido ? (
                              <span className="shrink-0 rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                                Nuevo
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-gray-500">
                          {archivo.extension}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-gray-500">
                          {formatearTamanoArchivo(archivo.tamano)}
                        </td>
                        <td className="px-3 py-2.5">
                          <CustomSelectorBuscable
                            options={opcionesTipoEvidencia}
                            value={obtenerIdTipoEvidencia(archivo)}
                            disabled={
                              soloLectura || idArchivoActualizando === archivo.id
                            }
                            onChange={(valor) => {
                              const opcionTipo = opcionesTipoEvidencia?.find(
                                (opcion) => opcion.num1 === valor,
                              );
                              const evidenciaSeleccionada =
                                esOpcionEvidencia(opcionTipo);
                              const cambios = {
                                idTipoEvidencia: valor,
                                tipoDocumento: evidenciaSeleccionada
                                  ? ("Evidencia" as const)
                                  : ("Informativo" as const),
                                idFaseEvidencia: evidenciaSeleccionada
                                  ? archivo.idFaseEvidencia
                                  : undefined,
                              };

                              if (archivo.esPersistido) {
                                void actualizarArchivoPersistido(archivo, cambios);
                              } else {
                                actualizarArchivoLocal(archivo.id, cambios);
                              }
                            }}
                            onClear={
                              archivo.esPersistido
                                ? undefined
                                : () =>
                                    actualizarArchivoLocal(archivo.id, {
                                      tipoDocumento: "",
                                      idTipoEvidencia: undefined,
                                      idFaseEvidencia: undefined,
                                      faseVinculada: undefined,
                                    })
                            }
                            optional
                            mostrarTextoOpcionalEnLabel={false}
                            placeholder={
                              archivo.esPersistido
                                ? "Seleccione"
                                : "Tipo requerido"
                            }
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          {esTipoEvidencia(archivo) ? (
                            <CustomSelectorBuscable
                              options={opcionesFaseEvidencia}
                              value={archivo.idFaseEvidencia}
                              disabled={
                                soloLectura ||
                                idArchivoActualizando === archivo.id
                              }
                              onChange={(valor) => {
                                const cambios = {
                                  idTipoEvidencia:
                                    obtenerIdTipoEvidencia(archivo),
                                  idFaseEvidencia: valor,
                                  tipoDocumento: "Evidencia" as const,
                                };

                                if (archivo.esPersistido) {
                                  void actualizarArchivoPersistido(
                                    archivo,
                                    cambios,
                                  );
                                } else {
                                  actualizarArchivoLocal(archivo.id, {
                                    idFaseEvidencia: valor,
                                  });
                                }
                              }}
                              onClear={
                                archivo.esPersistido
                                  ? undefined
                                  : () =>
                                      actualizarArchivoLocal(archivo.id, {
                                        idFaseEvidencia: undefined,
                                      })
                              }
                              optional
                              mostrarTextoOpcionalEnLabel={false}
                              placeholder={
                                archivo.esPersistido
                                  ? "Seleccione"
                                  : "Fase requerida"
                              }
                            />
                          ) : (
                            <span className="text-xs text-slate-400">
                              No aplica
                            </span>
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
                            {!soloLectura ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (archivo.esPersistido) {
                                    setArchivoAEliminar(archivo);
                                    return;
                                  }
                                  quitarArchivoLocal(archivo.id);
                                }}
                                className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500"
                                title={
                                  archivo.esPersistido
                                    ? "Eliminar archivo"
                                    : "Quitar archivo"
                                }
                              >
                                <Trash2 size={15} />
                              </button>
                            ) : null}
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

        {!soloLectura ? (
          <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5">
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
              disabled={
                !idPedido ||
                archivosNuevos.length === 0 ||
                hayArchivosNuevosIncompletos
              }
              onClick={() => void guardarArchivosNuevos()}
            >
              Adjuntar archivos
            </CustomButton>
          </div>
        ) : null}
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

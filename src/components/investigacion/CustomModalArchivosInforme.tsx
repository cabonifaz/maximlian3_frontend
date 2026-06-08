import { Download, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { CustomBloqueCargaArchivosAnalista } from "@maximilian/components/investigacion/CustomBloqueCargaArchivos";
import type { ReferenciaBloqueCargaArchivosAnalista } from "@maximilian/components/investigacion/CustomBloqueCargaArchivos";
import type { ArchivoInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { servicioTablaMaestra } from "@maximilian/services/tablaMaestra.service";

interface PropsCustomModalArchivosInvestigacionAnalista {
  estaAbierto: boolean;
  archivos: ArchivoInvestigacionAnalista[];
  onCerrar: () => void;
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
  archivos,
  onCerrar,
  onArchivosChange,
}: PropsCustomModalArchivosInvestigacionAnalista) {
  const bloqueCargaRef = useRef<ReferenciaBloqueCargaArchivosAnalista>(null);
  const [idArchivoDescargando, setIdArchivoDescargando] = useState<string | null>(null);
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
    if (!archivo.urlDescarga) return;

    setIdArchivoDescargando(archivo.id);
    try {
      window.open(archivo.urlDescarga, "_blank", "noopener,noreferrer");
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
      tipoDocumento: "Informativo",
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
                      <tr key={archivo.id} className="bg-amber-50 transition-colors hover:bg-amber-100/60">
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <span title={archivo.nombre} className="max-w-32 truncate font-medium text-gray-700">{archivo.nombre}</span>
                            <span
                              className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                archivo.esPersistido
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-200 text-amber-800"
                              }`}
                            >
                              {archivo.esPersistido ? "Subido" : "Nuevo"}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-gray-500">{archivo.extension}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-gray-500">{formatearTamanoArchivo(archivo.tamano)}</td>
                        <td className="px-3 py-2.5">
                          {archivo.esPersistido ? (
                            <span className="text-xs text-slate-500">{archivo.tipoDocumento || "-"}</span>
                          ) : (
                            <CustomSelectorBuscable
                              options={opcionesTipoEvidencia}
                              value={obtenerIdTipoEvidencia(archivo)}
                              onChange={(valor) => {
                                const textoTipo = opcionesTipoEvidencia
                                  ?.find((opcion) => opcion.num1 === valor)
                                  ?.string1
                                  ?.trim();
                                const esEvidencia = textoTipo?.toLowerCase().includes("evidencia") ?? false;

                                onArchivosChange(
                                  archivos.map((item) =>
                                    item.id === archivo.id
                                      ? {
                                          ...item,
                                          idTipoEvidencia: valor,
                                          tipoDocumento: esEvidencia ? "Evidencia" : "Informativo",
                                          idFaseEvidencia: esEvidencia ? item.idFaseEvidencia : undefined,
                                        }
                                      : item,
                                  ),
                                );
                              }}
                              onClear={() =>
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
                              placeholder="Seleccione"
                            />
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          {archivo.esPersistido ? (
                            <span className="text-xs text-slate-500">{archivo.faseVinculadaTexto || "No aplica"}</span>
                          ) : esTipoEvidencia(archivo) ? (
                            <CustomSelectorBuscable
                              options={opcionesFaseEvidencia}
                              value={archivo.idFaseEvidencia}
                              onChange={(valor) =>
                                onArchivosChange(
                                  archivos.map((item) =>
                                    item.id === archivo.id
                                      ? { ...item, idFaseEvidencia: valor }
                                      : item,
                                ),
                              )
                            }
                              onClear={() =>
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
                              placeholder="Seleccione"
                            />
                          ) : (
                            <span className="text-xs text-slate-400">No aplica</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex justify-end gap-1">
                            {archivo.urlDescarga ? (
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
                            {!archivo.esPersistido ? (
                              <button
                                type="button"
                                onClick={() => onArchivosChange(archivos.filter((item) => item.id !== archivo.id))}
                                className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500"
                                title="Quitar archivo"
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

        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-8 py-5">
          <CustomButton variant="secondary" size="sm" onClick={() => bloqueCargaRef.current?.abrirSelector()}>
            <Upload size={14} />
            Subir archivos
          </CustomButton>
        </div>
      </div>
    </div>
  );
}

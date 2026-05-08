import { Paperclip, Trash2, Upload, X } from "lucide-react";
import { useRef } from "react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import type { ArchivoInvestigacionAnalista, IdSeccionInvestigacionAnalista } from "@maximilian/shared/types/analista.type";

interface PropsCustomModalArchivosInvestigacionAnalista {
  estaAbierto: boolean;
  archivos: ArchivoInvestigacionAnalista[];
  secciones: Array<{ id: IdSeccionInvestigacionAnalista; titulo: string }>;
  faseActual: IdSeccionInvestigacionAnalista;
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
  secciones,
  faseActual,
  onCerrar,
  onArchivosChange,
}: PropsCustomModalArchivosInvestigacionAnalista) {
  const inputRef = useRef<HTMLInputElement>(null);

  if (!estaAbierto) return null;

  const agregarArchivos = (listaArchivos?: FileList | null) => {
    if (!listaArchivos?.length) return;

    const nuevosArchivos: ArchivoInvestigacionAnalista[] = Array.from(listaArchivos).map((archivo) => ({
      id: `${archivo.name}-${archivo.size}-${Date.now()}-${Math.random()}`,
      nombre: archivo.name,
      extension: obtenerExtensionArchivo(archivo.name),
      tamano: archivo.size,
      tipoDocumento: "Informativo",
      archivo,
    }));

    onArchivosChange([...archivos, ...nuevosArchivos]);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-black">Archivos de la investigación</h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">
              Anexos de trabajo
            </p>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
            <X size={18} className="text-[#8ea0c0]" />
          </CustomButton>
        </div>

        <div className="flex gap-4 px-8 py-6">
          <div
            onClick={() => inputRef.current?.click()}
            className="flex min-h-72 w-44 shrink-0 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 p-4 text-center transition-colors hover:border-brand-wine/40 hover:bg-gray-50"
          >
            <div className="rounded-full bg-gray-100 p-3">
              <Upload size={22} className="text-gray-400" />
            </div>
            <p className="text-xs leading-relaxed text-gray-500">
              Arrastra archivos aquí o haz clic para subir
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => agregarArchivos(event.target.files)}
            />
          </div>

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
                            <Paperclip size={16} className="shrink-0 text-gray-400" />
                            <span className="max-w-48 truncate font-medium text-gray-700">{archivo.nombre}</span>
                            <span className="shrink-0 rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                              Nuevo
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-gray-500">{archivo.extension}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-gray-500">{formatearTamanoArchivo(archivo.tamano)}</td>
                        <td className="px-3 py-2.5">
                          <select
                            value={archivo.tipoDocumento}
                            onChange={(event) =>
                              onArchivosChange(
                                archivos.map((item) =>
                                  item.id === archivo.id
                                    ? {
                                        ...item,
                                        tipoDocumento: event.target.value as ArchivoInvestigacionAnalista["tipoDocumento"],
                                        faseVinculada: event.target.value === "Evidencia" ? item.faseVinculada ?? faseActual : undefined,
                                      }
                                    : item,
                                ),
                              )
                            }
                            className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-slate-600 outline-none"
                          >
                            <option value="Informativo">Informativo</option>
                            <option value="Evidencia">Evidencia</option>
                          </select>
                        </td>
                        <td className="px-3 py-2.5">
                          {archivo.tipoDocumento === "Evidencia" ? (
                            <select
                              value={archivo.faseVinculada ?? faseActual}
                              onChange={(event) =>
                                onArchivosChange(
                                  archivos.map((item) =>
                                    item.id === archivo.id
                                      ? { ...item, faseVinculada: event.target.value as IdSeccionInvestigacionAnalista }
                                      : item,
                                  ),
                                )
                              }
                              className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-slate-600 outline-none"
                            >
                              {secciones.map((seccion) => (
                                <option key={seccion.id} value={seccion.id}>
                                  {seccion.titulo}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs text-slate-400">No aplica</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => onArchivosChange(archivos.filter((item) => item.id !== archivo.id))}
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
        </div>

        <div className="flex justify-end border-t border-gray-100 bg-gray-50/50 px-8 py-5">
          <CustomButton variant="secondary" size="sm" onClick={onCerrar}>
            Cerrar
          </CustomButton>
        </div>
      </div>
    </div>
  );
}

import { useMemo, useRef, useState } from "react";
import { FileText, Sparkles, Trash2, Upload, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";

type AlcanceExtraccionAnalista = "general" | "informacion-financiera";

interface PropsCustomModalExtraccionInformacionAnalista {
  estaAbierto: boolean;
  alcance: AlcanceExtraccionAnalista;
  tituloSeccion?: string;
  onCerrar: () => void;
  onExtraer: (archivos: File[], alcance: AlcanceExtraccionAnalista) => Promise<void> | void;
}

function formatearTamanoArchivo(tamano: number) {
  if (tamano < 1024) return `${tamano} B`;
  if (tamano < 1024 * 1024) return `${(tamano / 1024).toFixed(0)} KB`;
  return `${(tamano / (1024 * 1024)).toFixed(1)} MB`;
}

function obtenerExtensionArchivo(nombreArchivo: string) {
  return nombreArchivo.split(".").pop()?.toUpperCase() ?? "—";
}

export function CustomModalExtraccionInformacionAnalista({
  estaAbierto,
  alcance,
  tituloSeccion,
  onCerrar,
  onExtraer,
}: PropsCustomModalExtraccionInformacionAnalista) {
  const inputArchivoRef = useRef<HTMLInputElement>(null);
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<File[]>([]);
  const [estaProcesando, setEstaProcesando] = useState(false);

  const titulo = tituloSeccion
    ? `Extraer información para "${tituloSeccion}"`
    : alcance === "general"
      ? "Extraer información del pedido"
      : "Extraer información financiera";
  const descripcion = useMemo(() => {
    if (alcance === "general") {
      return "En el flujo final, esta opción llenará todas las secciones. En esta demo, el documento solo completará la sección Información Financiera.";
    }

    return "Para esta demo, puede subir cualquier documento y se completarán únicamente los campos de la sección Información Financiera.";
  }, [alcance]);

  if (!estaAbierto) return null;

  const manejarCerrar = () => {
    if (estaProcesando) return;
    setArchivosSeleccionados([]);
    onCerrar();
  };

  const manejarExtraer = async () => {
    if (archivosSeleccionados.length === 0) return;

    setEstaProcesando(true);
    try {
      await onExtraer(archivosSeleccionados, alcance);
      setArchivosSeleccionados([]);
      onCerrar();
    } finally {
      setEstaProcesando(false);
    }
  };

  const agregarArchivos = (listaArchivos?: FileList | null) => {
    if (!listaArchivos?.length) return;

    setArchivosSeleccionados((anteriores) => [...anteriores, ...Array.from(listaArchivos)]);

    if (inputArchivoRef.current) {
      inputArchivoRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
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

        <div className="flex gap-4 px-7 py-6">
          <div
            onClick={() => inputArchivoRef.current?.click()}
            className="flex min-h-72 w-44 shrink-0 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 p-4 text-center transition-colors hover:border-brand-wine/40 hover:bg-gray-50"
          >
            <div className="rounded-full bg-gray-100 p-3">
              <Upload size={22} className="text-gray-400" />
            </div>
            <p className="text-xs leading-relaxed text-gray-500">
              Arrastra archivos aquí o haz clic para subir
            </p>
            <input
              ref={inputArchivoRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => agregarArchivos(event.target.files)}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="space-y-1">
              <CustomLabel>Documentos</CustomLabel>
              <p className="text-xs text-slate-400">
                Puede cargar uno o varios archivos para la demo y eliminar los que no correspondan antes de extraer.
              </p>
            </div>

            <div className="max-h-72 overflow-y-auto rounded-xl border border-gray-100">
              {archivosSeleccionados.length === 0 ? (
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
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-7 py-5">
          <CustomButton variant="secondary" size="sm" onClick={manejarCerrar} disabled={estaProcesando}>
            Cancelar
          </CustomButton>
          <CustomButton
            size="sm"
            onClick={manejarExtraer}
            disabled={archivosSeleccionados.length === 0}
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

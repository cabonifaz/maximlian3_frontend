import { forwardRef } from "react";
import { Upload } from "lucide-react";
import { useBloqueCargaArchivos } from "@maximilian/hooks/useBloqueCargaArchivos";

export interface ReferenciaBloqueCargaArchivosAnalista {
  abrirSelector: () => void;
}

interface PropsCustomBloqueCargaArchivosAnalista {
  textoIndicativo: string;
  onAgregarArchivos: (archivos: File[]) => void;
}

export const CustomBloqueCargaArchivosAnalista = forwardRef<
  ReferenciaBloqueCargaArchivosAnalista,
  PropsCustomBloqueCargaArchivosAnalista
>(function CustomBloqueCargaArchivosAnalista(
  { textoIndicativo, onAgregarArchivos },
  ref,
) {
  const {
    agregarArchivos,
    estaArrastrando,
    inputRef,
    limpiarInput,
    limpiarYAbrirSelector,
    manejarDragOver,
    manejarDrop,
    setEstaArrastrando,
  } = useBloqueCargaArchivos({ onAgregarArchivos, ref });

  return (
    <div
      onPointerDownCapture={limpiarInput}
      onClick={limpiarYAbrirSelector}
      onDragOver={manejarDragOver}
      onDragLeave={() => setEstaArrastrando(false)}
      onDrop={manejarDrop}
      className={`flex min-h-72 w-44 shrink-0 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-4 text-center transition-colors ${
        estaArrastrando
          ? "border-brand-wine bg-brand-wine/5"
          : "border-gray-200 hover:border-brand-wine/40 hover:bg-gray-50"
      }`}
    >
      <div className="rounded-full bg-gray-100 p-3">
        <Upload size={22} className="text-gray-400" />
      </div>
      <p className="text-xs leading-relaxed text-gray-500">{textoIndicativo}</p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="*/*"
        className="hidden"
        onChange={(event) => agregarArchivos(event.target.files)}
      />
    </div>
  );
});

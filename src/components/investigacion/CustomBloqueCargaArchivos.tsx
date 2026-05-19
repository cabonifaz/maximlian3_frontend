import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Upload } from "lucide-react";

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
>(function CustomBloqueCargaArchivosAnalista({
  textoIndicativo,
  onAgregarArchivos,
}, ref) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [estaArrastrando, setEstaArrastrando] = useState(false);

  const limpiarYAbrirSelector = () => {
    const inputArchivo = inputRef.current;
    if (!inputArchivo) return;

    inputArchivo.value = "";

    if (typeof (inputArchivo as HTMLInputElement & { showPicker?: () => void }).showPicker === "function") {
      (inputArchivo as HTMLInputElement & { showPicker: () => void }).showPicker();
      return;
    }

    inputArchivo.click();
  };

  useImperativeHandle(ref, () => ({
    abrirSelector: limpiarYAbrirSelector,
  }));

  const agregarArchivos = (listaArchivos?: FileList | null) => {
    if (!listaArchivos?.length) return;

    onAgregarArchivos(Array.from(listaArchivos));

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div
      onPointerDownCapture={() => {
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }}
      onClick={limpiarYAbrirSelector}
      onDragOver={(event) => {
        event.preventDefault();
        setEstaArrastrando(true);
      }}
      onDragLeave={() => setEstaArrastrando(false)}
      onDrop={(event) => {
        event.preventDefault();
        setEstaArrastrando(false);
        agregarArchivos(event.dataTransfer.files);
      }}
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

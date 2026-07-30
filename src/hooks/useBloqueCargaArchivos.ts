import { useImperativeHandle, useRef, useState, type Ref } from "react";
import type { ReferenciaBloqueCargaArchivosAnalista } from "@maximilian/components/investigacion/CustomBloqueCargaArchivos";

interface ParametrosUseBloqueCargaArchivos {
  onAgregarArchivos: (archivos: File[]) => void;
  ref: Ref<ReferenciaBloqueCargaArchivosAnalista>;
}

export function useBloqueCargaArchivos({
  onAgregarArchivos,
  ref,
}: ParametrosUseBloqueCargaArchivos) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [estaArrastrando, setEstaArrastrando] = useState(false);

  const limpiarInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const limpiarYAbrirSelector = () => {
    const inputArchivo = inputRef.current;
    if (!inputArchivo) return;

    inputArchivo.value = "";

    if (
      typeof (inputArchivo as HTMLInputElement & { showPicker?: () => void })
        .showPicker === "function"
    ) {
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
    limpiarInput();
  };

  const manejarDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setEstaArrastrando(true);
  };

  const manejarDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setEstaArrastrando(false);
    agregarArchivos(event.dataTransfer.files);
  };

  return {
    agregarArchivos,
    estaArrastrando,
    inputRef,
    limpiarInput,
    limpiarYAbrirSelector,
    manejarDragOver,
    manejarDrop,
    setEstaArrastrando,
  };
}

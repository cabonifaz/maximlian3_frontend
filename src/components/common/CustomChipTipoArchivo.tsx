import {
  CLASES_TIPO_ARCHIVO,
  CLASE_TIPO_ARCHIVO_PREDETERMINADA,
} from "@maximilian/shared/constants/components/common/custom-chip-tipo-archivo.constants";

interface PropsCustomChipTipoArchivo {
  extension: string;
}

export function CustomChipTipoArchivo({ extension }: PropsCustomChipTipoArchivo) {
  const claseColor = CLASES_TIPO_ARCHIVO[extension] ?? CLASE_TIPO_ARCHIVO_PREDETERMINADA;

  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold ${claseColor}`}>
      {extension}
    </span>
  );
}

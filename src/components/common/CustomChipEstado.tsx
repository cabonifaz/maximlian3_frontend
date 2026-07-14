import type { CSSProperties, ReactNode } from "react";
import {
  CLASE_BASE_CHIP_ESTADO,
  CLASE_FORMA_CHIP_ESTADO,
  CLASE_TAMANO_CHIP_ESTADO,
} from "@maximilian/shared/constants/components/common/custom-chip-estado.constants";

interface PropsCustomChipEstado {
  children: ReactNode;
  colorTexto?: string;
  colorFondo?: string;
  claseColor?: string;
  className?: string;
  forma?: keyof typeof CLASE_FORMA_CHIP_ESTADO;
  tamano?: keyof typeof CLASE_TAMANO_CHIP_ESTADO;
  title?: string;
}

export function CustomChipEstado({
  children,
  colorTexto,
  colorFondo,
  claseColor = "bg-slate-100 text-slate-500",
  className = "",
  forma = "pildora",
  tamano = "compacto",
  title,
}: PropsCustomChipEstado) {
  const estilo: CSSProperties | undefined = colorTexto || colorFondo
    ? { color: colorTexto, backgroundColor: colorFondo }
    : undefined;

  return (
    <span
      className={`${CLASE_BASE_CHIP_ESTADO} ${CLASE_FORMA_CHIP_ESTADO[forma]} ${CLASE_TAMANO_CHIP_ESTADO[tamano]} ${claseColor} ${className}`}
      style={estilo}
      title={title}
    >
      {children}
    </span>
  );
}

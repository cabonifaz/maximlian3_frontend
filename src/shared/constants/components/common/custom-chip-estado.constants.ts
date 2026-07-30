export const CLASE_BASE_CHIP_ESTADO = "inline-flex items-center text-xs font-bold";

export const CLASE_FORMA_CHIP_ESTADO = {
  pildora: "rounded-full",
  rectangular: "rounded-lg",
  tarjeta: "rounded-xl",
  tarjetaAmplia: "rounded-2xl",
} as const;

export const CLASE_TAMANO_CHIP_ESTADO = {
  compacto: "px-2.5 py-0.5",
  normal: "px-3 py-1",
  amplio: "px-3 py-2",
} as const;

const ANCHO_PAGINA_FALLBACK_PX = 794;

export function convertirLongitudCssAPx(valor?: string): number {
  if (!valor) return ANCHO_PAGINA_FALLBACK_PX;

  const coincidencia = valor.trim().match(/^([\d.]+)\s*(in|cm|mm|px|pt)?$/i);
  if (!coincidencia) return ANCHO_PAGINA_FALLBACK_PX;

  const numero = Number(coincidencia[1]);
  if (!Number.isFinite(numero) || numero <= 0) return ANCHO_PAGINA_FALLBACK_PX;

  const unidad = coincidencia[2]?.toLowerCase() ?? "px";
  if (unidad === "in") return numero * 96;
  if (unidad === "cm") return (numero / 2.54) * 96;
  if (unidad === "mm") return (numero / 25.4) * 96;
  if (unidad === "pt") return (numero / 72) * 96;
  return numero;
}

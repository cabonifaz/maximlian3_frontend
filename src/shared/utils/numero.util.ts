export function obtenerCantidadDecimales(valor: number) {
  const [, decimales = ""] = valor.toString().split(".");
  return decimales.length;
}

export function formatearEnteroVisual(valor: number, locale: string) {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(valor);
}

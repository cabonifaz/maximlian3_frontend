export function obtenerCantidadDecimales(valor: number) {
  const [, decimales = ""] = valor.toString().split(".");
  return decimales.length;
}

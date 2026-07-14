export function formatearTamanoArchivo(tamano: number) {
  if (tamano < 1024) return `${tamano} B`;
  if (tamano < 1024 * 1024) return `${(tamano / 1024).toFixed(0)} KB`;
  return `${(tamano / (1024 * 1024)).toFixed(1)} MB`;
}

export function obtenerExtensionArchivo(nombre: string) {
  return nombre.split(".").pop()?.toUpperCase() ?? "—";
}

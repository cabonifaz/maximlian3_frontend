interface OpcionesFormatoTamanoArchivo {
  decimalesKb?: number;
  decimalesMb?: number;
}

export function formatearTamanoArchivo(tamano: number, opciones: OpcionesFormatoTamanoArchivo = {}) {
  const decimalesKb = opciones.decimalesKb ?? 0;
  const decimalesMb = opciones.decimalesMb ?? 1;

  if (tamano < 1024) return `${tamano} B`;
  if (tamano < 1024 * 1024) return `${(tamano / 1024).toFixed(decimalesKb)} KB`;
  return `${(tamano / (1024 * 1024)).toFixed(decimalesMb)} MB`;
}

export function obtenerExtensionArchivo(nombre: string) {
  return nombre.split(".").pop()?.toUpperCase() ?? "—";
}

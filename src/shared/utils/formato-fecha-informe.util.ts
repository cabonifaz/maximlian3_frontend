import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

export function obtenerEtiquetaFormatoFechaInforme(opcion: EntradaTablaMaestra): string {
  return opcion.string2?.trim() || opcion.string1?.trim() || "";
}

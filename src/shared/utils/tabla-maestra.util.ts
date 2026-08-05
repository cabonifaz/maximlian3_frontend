import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

export function obtenerEtiquetaPrincipalSecundaria(opcion: EntradaTablaMaestra) {
  return [opcion.string1?.trim(), opcion.string2?.trim()]
    .filter(Boolean)
    .join(" - ");
}

export function obtenerSimboloTablaMaestra(
  opciones: EntradaTablaMaestra[] | undefined,
  idOpcion: number | undefined,
) {
  return opciones
    ?.find((opcion) => opcion.num1 === idOpcion)
    ?.string3?.trim() ?? "";
}

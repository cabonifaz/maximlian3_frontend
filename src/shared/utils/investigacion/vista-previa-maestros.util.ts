import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

type OpcionMaestro = Pick<EntradaTablaMaestra, "num1" | "string1" | "string2">;

function buscarOpcionMaestro(opciones: OpcionMaestro[] | undefined, valor: unknown) {
  if (valor === null || valor === undefined || valor === "") return undefined;
  const texto = String(valor).trim();
  if (!/^\d+$/.test(texto)) return undefined;
  const id = Number(texto);
  return id > 0 ? opciones?.find((opcion) => Number(opcion.num1) === id) : undefined;
}

export function obtenerEtiquetaMaestroVistaPrevia(opciones: OpcionMaestro[] | undefined, valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  return buscarOpcionMaestro(opciones, valor)?.string1?.trim() || String(valor).trim();
}

export function obtenerIsoMonedaVistaPrevia(opciones: OpcionMaestro[] | undefined, valor: unknown): string {
  const porId = buscarOpcionMaestro(opciones, valor);
  if (porId) return porId.string2?.trim() ?? "";
  const texto = String(valor ?? "").trim();
  if (!texto) return "";
  return opciones?.find((opcion) => opcion.string1?.trim() === texto)?.string2?.trim() ?? "";
}

export function agregarSufijoVistaPrevia(valor: string, sufijo: string): string {
  const texto = valor.trim();
  return texto && sufijo ? `${texto} ${sufijo}` : texto;
}

export function obtenerRangoMesesVistaPrevia(
  opciones: OpcionMaestro[] | undefined,
  idMesInicio: number | undefined,
  idMesFin: number | undefined,
  mesTexto: string,
): string {
  const inicio = obtenerEtiquetaMaestroVistaPrevia(opciones, idMesInicio) || mesTexto;
  const fin = obtenerEtiquetaMaestroVistaPrevia(opciones, idMesFin);
  return fin && fin !== inicio ? `${inicio} - ${fin}` : inicio;
}

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

export function agruparMilesVistaPrevia(valor: unknown): string {
  const texto = String(valor ?? "").trim();
  const coincidencia = /^(-?)(\d+)(\.\d+)?(\s+\S.*)?$/.exec(texto);
  if (!coincidencia) return texto;
  const [, signo, entero, decimales = "", resto = ""] = coincidencia;
  return `${signo}${entero.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${decimales}${resto}`;
}

export function agregarPorcentajeVistaPrevia(valor: unknown): string {
  const texto = agruparMilesVistaPrevia(valor);
  return texto && /^-?[\d,]+(\.\d+)?$/.test(texto) ? `${texto}%` : texto;
}

export function agruparMilesRegistroVistaPrevia(registro: Record<string, unknown> | undefined): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(registro ?? {}).map(([clave, valor]) => [
      clave,
      typeof valor === "string" || typeof valor === "number" ? agruparMilesVistaPrevia(valor) : valor,
    ]),
  );
}

export function formatearMontoMonedaVistaPrevia(
  opciones: OpcionMaestro[] | undefined,
  idMoneda: unknown,
  monto: string,
): string {
  const texto = agruparMilesVistaPrevia(monto);
  const opcion = buscarOpcionMaestro(opciones, idMoneda);
  if (!texto || !opcion) return texto;
  const simbolo = (opcion as { string3?: string | null }).string3?.trim() ?? "";
  const descripcion = opcion.string1?.trim() ?? "";
  return [simbolo, texto, descripcion].filter(Boolean).join(" ");
}

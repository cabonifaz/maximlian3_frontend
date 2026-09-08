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

export function obtenerEtiquetaTipoRegistroTributario(
  opcion: EntradaTablaMaestra,
  opcionesTipoPersona: EntradaTablaMaestra[] | undefined,
) {
  const tipoPersona = opcionesTipoPersona
    ?.find((opcionTipoPersona) => opcionTipoPersona.num1 === opcion.num3)
    ?.string1?.trim();

  return [opcion.string1?.trim(), tipoPersona]
    .filter(Boolean)
    .join(" - ");
}

export function obtenerIdTipoRegistroTributario(
  opciones: Array<{
    num1: number | null;
    num3?: number | null;
    string1: string | null;
  }> | undefined,
  valor: string,
  idTipoPersona: number,
) {
  const valorNormalizado = valor.trim().toLowerCase();
  const coincidencias = opciones?.filter(
    (opcion) => opcion.string1?.trim().toLowerCase() === valorNormalizado,
  ) ?? [];

  return coincidencias.find((opcion) => opcion.num3 === idTipoPersona)?.num1
    ?? coincidencias.find((opcion) => opcion.num3 == null)?.num1
    ?? coincidencias[0]?.num1
    ?? 0;
}

export function esTipoRegistroTributarioSeleccionado(
  valor: string | number | undefined,
) {
  if (valor == null || valor === "") return false;

  const idTipoRegistro = Number(valor);
  return Number.isFinite(idTipoRegistro) && idTipoRegistro >= 0;
}
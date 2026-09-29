import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

export function tieneTraduccionTablaMaestra(idIdioma?: number) {
  return idIdioma === 2 || idIdioma === 3;
}

export function obtenerGentilicioPais(
  opcion: { string1?: string | null; string3?: string | null; string5?: string | null; string7?: string | null },
  idIdioma?: number,
) {
  const gentilicioIdioma = idIdioma === 2 ? opcion.string5 : idIdioma === 3 ? opcion.string7 : opcion.string3;
  return gentilicioIdioma?.trim() || opcion.string3?.trim() || opcion.string1?.trim() || "";
}

export function traducirOpcionesTablaMaestra(
  opciones: EntradaTablaMaestra[] | undefined,
  idIdioma?: number,
) {
  if (!tieneTraduccionTablaMaestra(idIdioma)) return opciones;

  const claveString1 = idIdioma === 2 ? "string4" : "string6";
  const claveString2 = idIdioma === 2 ? "string5" : "string7";

  return opciones?.map((opcion) => {
    const textoPrincipal = opcion[claveString1]?.trim();
    const textoSecundario = opcion[claveString2]?.trim();

    return {
      ...opcion,
      string1: textoPrincipal || opcion.string1,
      string2: textoSecundario || opcion.string2,
      string3: textoSecundario || opcion.string3,
    };
  });
}

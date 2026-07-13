import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

export function traducirOpcionesTablaMaestra(
  opciones: EntradaTablaMaestra[] | undefined,
  idIdioma?: number,
) {
  if (idIdioma !== 2 && idIdioma !== 3) return opciones;

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

import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

export function normalizarOpcionesFiltroRevision(
  opciones?: EntradaTablaMaestra[],
  campoTexto: "string1" | "string2" = "string1",
) {
  return opciones?.map((opcion) => ({
    ...opcion,
    string1: opcion[campoTexto] || opcion.string1 || opcion.descripcion,
  }));
}

export function obtenerNombrePlantillaRevision(
  idPlantilla: number | undefined,
  opcionesPlantillaInforme?: EntradaTablaMaestra[],
) {
  if (!idPlantilla) return "-";
  const opcionPlantilla = opcionesPlantillaInforme?.find(
    (opcion) => opcion.num1 === idPlantilla,
  );

  return (
    opcionPlantilla?.string1 ||
    opcionPlantilla?.descripcion ||
    `Plantilla ${idPlantilla}`
  );
}

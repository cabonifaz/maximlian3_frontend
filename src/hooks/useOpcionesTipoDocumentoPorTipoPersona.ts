import { useMemo } from "react";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";
import { filtrarTiposDocumentoPorTipoPersona } from "@maximilian/shared/utils/tabla-maestra.util";

export function useOpcionesTipoDocumentoPorTipoPersona(
  opcionesTipoDocumento: EntradaTablaMaestra[] | undefined,
  idTipoPersona: number | undefined,
) {
  return useMemo(
    () => filtrarTiposDocumentoPorTipoPersona(opcionesTipoDocumento, idTipoPersona),
    [idTipoPersona, opcionesTipoDocumento],
  );
}

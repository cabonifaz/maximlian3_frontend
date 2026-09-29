import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { servicioTablaMaestra, type OpcionesTablaMaestraPorId } from "@maximilian/services/tabla-maestra.service";
import { IDS_TABLA_MAESTRA_VISTA_PREVIA_INFORME } from "@maximilian/shared/constants/hooks/use-opciones-maestros-vista-previa-informe.constants";
import { traducirOpcionesTablaMaestra } from "@maximilian/shared/utils/tabla-maestra-idioma.util";

export function useOpcionesMaestrosVistaPreviaInforme(habilitado: boolean, idIdioma?: number) {
  const { data } = useQuery({
    queryKey: ["masterTable", "vista-previa-informe", IDS_TABLA_MAESTRA_VISTA_PREVIA_INFORME],
    queryFn: () => servicioTablaMaestra.listarPorIds(IDS_TABLA_MAESTRA_VISTA_PREVIA_INFORME),
    enabled: habilitado,
    staleTime: Infinity,
  });

  return useMemo(() => {
    if (!data) return undefined;
    return Object.fromEntries(
      Object.entries(data).map(([idMaestro, opciones]) => [
        idMaestro,
        traducirOpcionesTablaMaestra(opciones, idIdioma) ?? [],
      ]),
    ) as OpcionesTablaMaestraPorId;
  }, [data, idIdioma]);
}

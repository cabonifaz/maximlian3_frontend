import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

interface ParametrosUseOpcionesTablaMaestraBusqueda {
  idMaestro?: number;
  terminoBusqueda: string;
  activo: boolean;
}

export function useOpcionesTablaMaestraBusqueda({
  idMaestro,
  terminoBusqueda,
  activo,
}: ParametrosUseOpcionesTablaMaestraBusqueda) {
  const terminoConRetardo = useRetardo(terminoBusqueda).trim();
  const hayBusqueda = terminoBusqueda.trim() !== "";
  const consulta = useQuery({
    queryKey: ["masterTableBusqueda", idMaestro, terminoConRetardo],
    queryFn: ({ signal }) => servicioTablaMaestra.buscarSinPaginacion(idMaestro!, terminoConRetardo, signal),
    enabled: idMaestro !== undefined && activo && terminoConRetardo !== "",
    placeholderData: keepPreviousData,
    staleTime: Infinity,
  });

  return {
    hayBusqueda,
    opciones: (consulta.data ?? []) as EntradaTablaMaestra[],
    estaBuscando: hayBusqueda && (consulta.isFetching || terminoConRetardo !== terminoBusqueda.trim()),
  };
}

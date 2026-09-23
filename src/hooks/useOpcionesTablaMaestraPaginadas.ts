import { useDeferredValue, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

interface ParametrosUseOpcionesTablaMaestraPaginadas {
  idMaestro?: number;
  terminoBusqueda: string;
  activo: boolean;
}

export function useOpcionesTablaMaestraPaginadas({
  idMaestro,
  terminoBusqueda,
  activo,
}: ParametrosUseOpcionesTablaMaestraPaginadas) {
  const terminoBusquedaDiferido = useDeferredValue(terminoBusqueda.trim());
  const consulta = useInfiniteQuery({
    queryKey: ["masterTablePaginated", idMaestro, terminoBusquedaDiferido],
    queryFn: ({ pageParam }) => servicioTablaMaestra.listarParametros({
      idMaestro: idMaestro!,
      busqueda: terminoBusquedaDiferido || undefined,
      numPag: pageParam,
    }),
    initialPageParam: 1,
    getNextPageParam: (ultimaPagina, paginas) => (
      paginas.length < ultimaPagina.totalPaginas ? paginas.length + 1 : undefined
    ),
    enabled: idMaestro !== undefined && activo,
    staleTime: Infinity,
  });

  const opciones = useMemo(() => {
    const idsVistos = new Set<number>();
    return (consulta.data?.pages.flatMap((pagina) => pagina.listaTablaMaestra) ?? []).filter((opcion) => {
      if (opcion.num1 == null || idsVistos.has(opcion.num1)) return false;
      idsVistos.add(opcion.num1);
      return true;
    }) as EntradaTablaMaestra[];
  }, [consulta.data]);

  return {
    opciones,
    estaCargando: consulta.isLoading,
    estaCargandoSiguientePagina: consulta.isFetchingNextPage,
    tieneSiguientePagina: consulta.hasNextPage,
    cargarSiguientePagina: consulta.fetchNextPage,
  };
}

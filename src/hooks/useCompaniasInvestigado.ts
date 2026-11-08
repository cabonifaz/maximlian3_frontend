import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { servicioCompania } from "@maximilian/services/compania.service";
import { normalizarTextoBusqueda } from "@maximilian/shared/utils/texto.util";

export function useCompaniasInvestigado(nombreReferencia: string, estaHabilitado = true) {
  const [terminoBusqueda, setTerminoBusqueda] = useState(nombreReferencia);
  const [paginaActual, setPaginaActual] = useState(1);
  const busqueda = useRetardo(terminoBusqueda.trim());
  const estaEsperandoRetardo = terminoBusqueda.trim() !== busqueda;

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["companiasInvestigado", busqueda, paginaActual],
    queryFn: () =>
      servicioCompania.list({
        busqueda: busqueda || undefined,
        numPag: paginaActual,
      }),
    enabled: estaHabilitado,
    placeholderData: keepPreviousData,
  });

  const companias = useMemo(() => {
    const nombreNormalizado = normalizarTextoBusqueda(nombreReferencia.trim());
    return (data?.lstCompania ?? [])
      .map((compania) => ({
        compania,
        esCoincidenciaExacta:
          nombreNormalizado.length > 0 &&
          normalizarTextoBusqueda(compania.nombreCompleto) === nombreNormalizado,
      }))
      .sort((a, b) => Number(b.esCoincidenciaExacta) - Number(a.esCoincidenciaExacta));
  }, [data, nombreReferencia]);

  const totalPaginas = data?.totalPaginas ?? 1;
  const totalRegistros = data?.totalRegistros ?? 0;

  return {
    terminoBusqueda,
    cambiarTerminoBusqueda: (termino: string) => {
      setTerminoBusqueda(termino);
      setPaginaActual(1);
    },
    companias,
    paginaActual,
    totalPaginas,
    totalRegistros,
    cantidadPagina: Math.max(1, Math.ceil(totalRegistros / Math.max(1, totalPaginas))),
    cambiarPagina: setPaginaActual,
    estaCargando: estaEsperandoRetardo || isLoading,
    estaActualizando: isFetching,
    hayError: isError,
    recargar: refetch,
  };
}

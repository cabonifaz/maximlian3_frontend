import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { servicioCompania } from "@maximilian/services/compania.service";
import { normalizarTextoBusqueda } from "@maximilian/shared/utils/texto.util";

export function useCompaniasInvestigado(nombreInvestigado: string, estaHabilitado = true) {
  const nombre = nombreInvestigado.trim();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["companiasInvestigado", nombre],
    queryFn: () => servicioCompania.buscar(nombre),
    enabled: estaHabilitado && nombre.length > 0,
  });

  const companias = useMemo(() => {
    const nombreNormalizado = normalizarTextoBusqueda(nombre);
    return (data?.lstCompania ?? [])
      .map((compania) => ({
        compania,
        esCoincidenciaExacta: normalizarTextoBusqueda(compania.nombreCompleto) === nombreNormalizado,
      }))
      .sort((a, b) => Number(b.esCoincidenciaExacta) - Number(a.esCoincidenciaExacta));
  }, [data, nombre]);

  return {
    companias,
    estaCargando: isLoading,
    hayError: isError,
    recargar: refetch,
  };
}

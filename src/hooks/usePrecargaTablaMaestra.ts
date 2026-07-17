import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

export function usePrecargaTablaMaestra(idsMaestro: number[], habilitado = true) {
  const queryClient = useQueryClient();
  const claveEntrada = idsMaestro.join(",");
  const idsUnicos = useMemo(
    () => Array.from(new Set(idsMaestro)).filter((idMaestro) => Number.isFinite(idMaestro)).sort((a, b) => a - b),
    [claveEntrada],
  );
  const claveIds = idsUnicos.join(",");

  const { data: opcionesPorId } = useQuery({
    queryKey: ["masterTable", "grupo", claveIds],
    queryFn: () => servicioTablaMaestra.listarPorIds(idsUnicos),
    enabled: habilitado && idsUnicos.length > 0,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!opcionesPorId) return;

    const fechaActualizacionGrupo =
      queryClient.getQueryState(["masterTable", "grupo", claveIds])?.dataUpdatedAt ?? 0;

    idsUnicos.forEach((idMaestro) => {
      const fechaActualizacionIndividual =
        queryClient.getQueryState(["masterTable", idMaestro])?.dataUpdatedAt ?? 0;
      if (fechaActualizacionIndividual > fechaActualizacionGrupo) return;

      queryClient.setQueryData<EntradaTablaMaestra[]>(
        ["masterTable", idMaestro],
        opcionesPorId[idMaestro] ?? [],
      );
    });
  }, [claveIds, idsUnicos, opcionesPorId, queryClient]);
}

import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type {
  FiltrosDesempenoColaboradoresDashboard,
  GranularidadTiempoDashboard,
} from "@maximilian/shared/types/dashboard.type";
import {
  COLABORADORES_DESEMPENO_DASHBOARD_MOCK,
  INFORMES_COLABORADORES_DASHBOARD_MOCK,
  CANTIDAD_REINTENTOS_CONSULTA_DESEMPENO_COLABORADORES_DASHBOARD,
} from "@maximilian/shared/constants/components/gerente/desempeno-colaboradores-dashboard.constants";
import {
  agruparEvolucionInformesColaboradores,
  filtrarInformesColaboradores,
} from "@maximilian/shared/utils/desempeno-colaboradores-dashboard.util";
import { servicioUsuario } from "@maximilian/services/usuario.service";
import { formatearFechaIsoLocal } from "@maximilian/shared/utils/fecha.util";

export function useDesempenoColaboradoresDashboard() {
  const [filtros, setFiltros] = useState<FiltrosDesempenoColaboradoresDashboard>({});
  const [granularidad, setGranularidad] = useState<GranularidadTiempoDashboard>("mes");
  const [pagina, setPagina] = useState(1);

  const fechasInvalidas = Boolean(
    filtros.fechaDesde && filtros.fechaHasta && filtros.fechaDesde > filtros.fechaHasta,
  );

  const actualizarFiltros = (patch: Partial<FiltrosDesempenoColaboradoresDashboard>) => {
    setFiltros((filtrosActuales) => ({ ...filtrosActuales, ...patch }));
    setPagina(1);
  };

  const limpiarFiltros = () => {
    setFiltros({});
    setPagina(1);
  };

  const informesFiltrados = useMemo(
    () =>
      fechasInvalidas
        ? []
        : filtrarInformesColaboradores(
            INFORMES_COLABORADORES_DASHBOARD_MOCK,
            COLABORADORES_DESEMPENO_DASHBOARD_MOCK,
            filtros,
          ),
    [filtros, fechasInvalidas],
  );

  const evolucion = useMemo(
    () => agruparEvolucionInformesColaboradores(informesFiltrados, granularidad),
    [informesFiltrados, granularidad],
  );

  const consultaResumenColaboradores = useQuery({
    queryKey: ["usuarios", "resumenColaboradores", filtros, pagina],
    queryFn: () =>
      servicioUsuario.obtenerResumenColaboradores({
        fchDesde: filtros.fechaDesde ? formatearFechaIsoLocal(filtros.fechaDesde) : undefined,
        fchHasta: filtros.fechaHasta ? formatearFechaIsoLocal(filtros.fechaHasta) : undefined,
        idColaborador: filtros.idColaborador,
        idRolAsignado: filtros.idRol,
        numPag: pagina,
      }),
    enabled: !fechasInvalidas,
    retry: CANTIDAD_REINTENTOS_CONSULTA_DESEMPENO_COLABORADORES_DASHBOARD,
    placeholderData: keepPreviousData,
  });

  return {
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    fechasInvalidas,
    granularidad,
    cambiarGranularidad: setGranularidad,
    evolucion,
    resumenColaboradores: consultaResumenColaboradores.data?.resumenColaboradores ?? [],
    pagina,
    cambiarPagina: setPagina,
    totalRegistrosColaboradores: consultaResumenColaboradores.data?.totalRegistros ?? 0,
    totalPaginasColaboradores: consultaResumenColaboradores.data?.totalPaginas ?? 1,
    estaCargandoColaboradores: consultaResumenColaboradores.isLoading,
    hayErrorColaboradores: consultaResumenColaboradores.isError,
    reintentarColaboradores: () => consultaResumenColaboradores.refetch(),
  };
}

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type {
  FiltrosDesempenoColaboradoresDashboard,
  GranularidadTiempoDashboard,
} from "@maximilian/shared/types/dashboard.type";
import { CANTIDAD_REINTENTOS_CONSULTA_DESEMPENO_COLABORADORES_DASHBOARD } from "@maximilian/shared/constants/components/gerente/desempeno-colaboradores-dashboard.constants";
import { GRANULARIDAD_TIEMPO_DASHBOARD_A_ID } from "@maximilian/shared/constants/pages/Gerente/dashboard-tiempo.constants";
import { servicioUsuario } from "@maximilian/services/usuario.service";
import { informeService } from "@maximilian/services/informe.service";
import { formatearFechaIsoLocal, obtenerPrimerDiaMesActual } from "@maximilian/shared/utils/fecha.util";

const FILTROS_INICIALES_DESEMPENO_COLABORADORES_DASHBOARD: FiltrosDesempenoColaboradoresDashboard = {
  fechaDesde: obtenerPrimerDiaMesActual(),
  fechaHasta: new Date(),
};

export function useDesempenoColaboradoresDashboard() {
  const [filtros, setFiltros] = useState<FiltrosDesempenoColaboradoresDashboard>(
    FILTROS_INICIALES_DESEMPENO_COLABORADORES_DASHBOARD,
  );
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
    setFiltros(FILTROS_INICIALES_DESEMPENO_COLABORADORES_DASHBOARD);
    setPagina(1);
  };

  const consultaEvolucion = useQuery({
    queryKey: ["informes", "evolucionColaboradores", filtros, granularidad],
    queryFn: () =>
      informeService.obtenerEvolucionColaboradores({
        idColaborador: filtros.idColaborador,
        rol: filtros.idRol,
        fechaDesde: filtros.fechaDesde ? formatearFechaIsoLocal(filtros.fechaDesde) : undefined,
        fechaHasta: filtros.fechaHasta ? formatearFechaIsoLocal(filtros.fechaHasta) : undefined,
        granularidad: GRANULARIDAD_TIEMPO_DASHBOARD_A_ID[granularidad],
      }),
    enabled: !fechasInvalidas,
    retry: CANTIDAD_REINTENTOS_CONSULTA_DESEMPENO_COLABORADORES_DASHBOARD,
    placeholderData: keepPreviousData,
  });

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
    evolucion: consultaEvolucion.data ?? [],
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

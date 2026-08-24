import { useMemo, useState } from "react";
import type {
  FiltrosDesempenoColaboradoresDashboard,
  GranularidadTiempoDashboard,
} from "@maximilian/shared/types/dashboard.type";
import {
  COLABORADORES_DESEMPENO_DASHBOARD_MOCK,
  INFORMES_COLABORADORES_DASHBOARD_MOCK,
} from "@maximilian/shared/constants/components/gerente/desempeno-colaboradores-dashboard.constants";
import {
  agruparEvolucionInformesColaboradores,
  construirResumenColaboradores,
  filtrarInformesColaboradores,
} from "@maximilian/shared/utils/desempeno-colaboradores-dashboard.util";

export function useDesempenoColaboradoresDashboard() {
  const [filtros, setFiltros] = useState<FiltrosDesempenoColaboradoresDashboard>({});
  const [granularidad, setGranularidad] = useState<GranularidadTiempoDashboard>("mes");

  const fechasInvalidas = Boolean(
    filtros.fechaDesde && filtros.fechaHasta && filtros.fechaDesde > filtros.fechaHasta,
  );

  const actualizarFiltros = (patch: Partial<FiltrosDesempenoColaboradoresDashboard>) => {
    setFiltros((filtrosActuales) => ({ ...filtrosActuales, ...patch }));
  };

  const limpiarFiltros = () => setFiltros({});

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

  const resumenColaboradores = useMemo(
    () => construirResumenColaboradores(informesFiltrados, COLABORADORES_DESEMPENO_DASHBOARD_MOCK),
    [informesFiltrados],
  );

  return {
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    fechasInvalidas,
    granularidad,
    cambiarGranularidad: setGranularidad,
    evolucion,
    resumenColaboradores,
  };
}

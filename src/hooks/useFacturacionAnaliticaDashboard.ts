import { useMemo, useState } from "react";
import type {
  FiltrosFacturacionAnaliticaDashboard,
  GranularidadTiempoDashboard,
  MetricaDesgloseFacturacionAnaliticaDashboard,
} from "@maximilian/shared/types/dashboard.type";
import {
  CLIENTES_PENDIENTES_FACTURACION_ANALITICA_DASHBOARD_MOCK,
  DETALLE_FACTURACION_ANALITICA_DASHBOARD_MOCK,
} from "@maximilian/shared/constants/components/gerente/facturacion-analitica-dashboard.constants";
import {
  agruparEvolucionFacturacion,
  agruparFacturacionPorEstado,
  agruparFacturacionPorPaisTop5,
  agruparFacturacionPorTramite,
  calcularIndicadoresFacturacionAnalitica,
  construirResumenClientesFacturacionAnalitica,
  filtrarDetalleFacturacionAnalitica,
} from "@maximilian/shared/utils/facturacion-analitica-dashboard.util";

export function useFacturacionAnaliticaDashboard() {
  const [filtros, setFiltros] = useState<FiltrosFacturacionAnaliticaDashboard>({});
  const [granularidad, setGranularidad] = useState<GranularidadTiempoDashboard>("mes");
  const [metricaDesglose, setMetricaDesglose] =
    useState<MetricaDesgloseFacturacionAnaliticaDashboard>("monto");

  const fechasInvalidas = Boolean(
    filtros.fechaDesde && filtros.fechaHasta && filtros.fechaDesde > filtros.fechaHasta,
  );

  const actualizarFiltros = (patch: Partial<FiltrosFacturacionAnaliticaDashboard>) => {
    setFiltros((filtrosActuales) => ({ ...filtrosActuales, ...patch }));
  };

  const limpiarFiltros = () => setFiltros({});

  const filasFiltradas = useMemo(
    () =>
      fechasInvalidas
        ? []
        : filtrarDetalleFacturacionAnalitica(
            DETALLE_FACTURACION_ANALITICA_DASHBOARD_MOCK,
            filtros,
          ),
    [filtros, fechasInvalidas],
  );

  const clientesPendientesFiltrados = useMemo(
    () =>
      filtros.idCliente === undefined
        ? CLIENTES_PENDIENTES_FACTURACION_ANALITICA_DASHBOARD_MOCK
        : CLIENTES_PENDIENTES_FACTURACION_ANALITICA_DASHBOARD_MOCK.filter(
            (cliente) => cliente.idCliente === filtros.idCliente,
          ),
    [filtros.idCliente],
  );

  const indicadores = useMemo(
    () => calcularIndicadoresFacturacionAnalitica(filasFiltradas, clientesPendientesFiltrados),
    [filasFiltradas, clientesPendientesFiltrados],
  );

  const desglosePorTramite = useMemo(
    () => agruparFacturacionPorTramite(filasFiltradas),
    [filasFiltradas],
  );

  const desglosePorPais = useMemo(
    () => agruparFacturacionPorPaisTop5(filasFiltradas),
    [filasFiltradas],
  );

  const desglosePorEstado = useMemo(
    () => agruparFacturacionPorEstado(filasFiltradas),
    [filasFiltradas],
  );

  const evolucion = useMemo(
    () => agruparEvolucionFacturacion(filasFiltradas, granularidad),
    [filasFiltradas, granularidad],
  );

  const resumenClientes = useMemo(
    () =>
      construirResumenClientesFacturacionAnalitica(
        DETALLE_FACTURACION_ANALITICA_DASHBOARD_MOCK,
        CLIENTES_PENDIENTES_FACTURACION_ANALITICA_DASHBOARD_MOCK,
      ),
    [],
  );

  return {
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    fechasInvalidas,
    granularidad,
    cambiarGranularidad: setGranularidad,
    metricaDesglose,
    cambiarMetricaDesglose: setMetricaDesglose,
    indicadores,
    desglosePorTramite,
    desglosePorPais,
    desglosePorEstado,
    evolucion,
    resumenClientes,
    clientesPendientesFiltrados,
    filasFiltradas,
  };
}

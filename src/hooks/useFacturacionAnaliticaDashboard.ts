import { useMemo, useState } from "react";
import type { FiltrosFacturacionAnaliticaDashboard } from "@maximilian/shared/types/dashboard.type";
import {
  CLIENTES_PENDIENTES_FACTURACION_ANALITICA_DASHBOARD_MOCK,
  DETALLE_FACTURACION_ANALITICA_DASHBOARD_MOCK,
} from "@maximilian/shared/constants/components/gerente/facturacion-analitica-dashboard.constants";
import {
  agruparEvolucionMensualFacturacion,
  agruparFacturacionPorEstado,
  agruparFacturacionPorPaisTop5,
  agruparFacturacionPorTramite,
  calcularIndicadoresFacturacionAnalitica,
  construirResumenClientesFacturacionAnalitica,
  filtrarDetalleFacturacionAnalitica,
} from "@maximilian/shared/utils/facturacion-analitica-dashboard.util";

export function useFacturacionAnaliticaDashboard() {
  const [filtros, setFiltros] = useState<FiltrosFacturacionAnaliticaDashboard>({});

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

  const evolucionMensual = useMemo(
    () => agruparEvolucionMensualFacturacion(filasFiltradas),
    [filasFiltradas],
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
    indicadores,
    desglosePorTramite,
    desglosePorPais,
    desglosePorEstado,
    evolucionMensual,
    resumenClientes,
    clientesPendientesFiltrados,
    filasFiltradas,
  };
}

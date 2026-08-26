import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  FiltrosFacturacionAnaliticaDashboard,
  GranularidadTiempoDashboard,
  IndicadoresFacturacionAnaliticaDashboard,
  MetricaDesgloseFacturacionAnaliticaDashboard,
} from "@maximilian/shared/types/dashboard.type";
import { facturacionService } from "@maximilian/services/facturacion.service";
import { formatearFechaIsoLocal } from "@maximilian/shared/utils/fecha.util";
import { GRANULARIDAD_TIEMPO_DASHBOARD_A_ID } from "@maximilian/shared/constants/pages/Gerente/dashboard-tiempo.constants";

const INDICADORES_FACTURACION_ANALITICA_VACIOS: IndicadoresFacturacionAnaliticaDashboard = {
  totalFacturado: 0,
  montoPendienteFacturar: 0,
  cantidadPedidosFacturados: 0,
  cantidadPedidosPendientes: 0,
  totalNotasCredito: 0,
  totalNotasDebito: 0,
  monedaIcono: "",
};

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

  const parametrosComunes = {
    fechaDesde: filtros.fechaDesde ? formatearFechaIsoLocal(filtros.fechaDesde) : undefined,
    fechaHasta: filtros.fechaHasta ? formatearFechaIsoLocal(filtros.fechaHasta) : undefined,
    idCliente: filtros.idCliente,
    idPais: filtros.idPais,
    idTipoTramite: filtros.idTipoTramite,
  };

  const consultaResumen = useQuery({
    queryKey: ["facturacion", "resumen"],
    queryFn: ({ signal }) => facturacionService.obtenerResumen({}, signal),
    retry: false,
  });

  const consultaResumenAnalitico = useQuery({
    queryKey: ["facturacion", "resumenAnalitico", filtros],
    queryFn: ({ signal }) =>
      facturacionService.obtenerResumenAnalitico(
        {
          ...parametrosComunes,
          idEstadoBucket: filtros.idEstadoBucket,
          idTipoDocumentoMaestro: filtros.idTipoDocumentoMaestro,
        },
        signal,
      ),
    enabled: !fechasInvalidas,
    retry: false,
  });

  const consultaEvolucion = useQuery({
    queryKey: ["facturacion", "evolucionAnalitica", filtros, granularidad],
    queryFn: ({ signal }) =>
      facturacionService.obtenerEvolucionAnalitica(
        {
          ...parametrosComunes,
          granularidad: GRANULARIDAD_TIEMPO_DASHBOARD_A_ID[granularidad],
        },
        signal,
      ),
    enabled: !fechasInvalidas,
    retry: false,
  });

  const consultaResumenClientes = useQuery({
    queryKey: ["facturacion", "resumenClientesGlobal"],
    queryFn: ({ signal }) => facturacionService.obtenerResumenClientesGlobal(signal),
    retry: false,
  });

  const monedaIcono = consultaResumen.data?.monedaIcono ?? "";

  const indicadores = useMemo<IndicadoresFacturacionAnaliticaDashboard>(() => {
    const base = consultaResumenAnalitico.data?.indicadores ?? INDICADORES_FACTURACION_ANALITICA_VACIOS;
    return { ...base, monedaIcono };
  }, [consultaResumenAnalitico.data, monedaIcono]);

  const resumenClientes = useMemo(
    () => (consultaResumenClientes.data ?? []).map((cliente) => ({ ...cliente, monedaIcono })),
    [consultaResumenClientes.data, monedaIcono],
  );

  const estaCargando =
    consultaResumenAnalitico.isLoading ||
    consultaEvolucion.isLoading ||
    consultaResumenClientes.isLoading;

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
    desglosePorTramite: consultaResumenAnalitico.data?.desglosePorTramite ?? [],
    desglosePorPais: consultaResumenAnalitico.data?.desglosePorPais ?? [],
    desglosePorEstado: consultaResumenAnalitico.data?.desglosePorEstado ?? [],
    evolucion: consultaEvolucion.data ?? [],
    resumenClientes,
    estaCargando,
  };
}

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { servicioDashboard } from "@maximilian/services/dashboard.service";
import { facturacionService } from "@maximilian/services/facturacion.service";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import {
  CLAVE_CONSULTA_RESUMEN_CLIENTES_DASHBOARD,
  CLAVE_CONSULTA_RESUMEN_FACTURACION_DASHBOARD,
  CLAVE_CONSULTA_RESUMEN_PEDIDOS_DASHBOARD,
  CLAVE_CONSULTA_RESUMEN_USUARIOS_DASHBOARD,
} from "@maximilian/shared/constants/pages/Gerente/dashboard-gerente.constants";
import { formatearFechaIsoLocal } from "@maximilian/shared/utils/fecha.util";

export function useResumenClientesDashboard() {
  const consultaResumenClientes = useQuery({
    queryKey: CLAVE_CONSULTA_RESUMEN_CLIENTES_DASHBOARD,
    queryFn: ({ signal }) =>
      servicioDashboard.obtenerResumenClientes(signal),
    retry: false,
  });

  return {
    resumenClientes: consultaResumenClientes.data,
    estaCargandoResumenClientes: consultaResumenClientes.isLoading,
  };
}

export function useResumenPedidosDashboard() {
  const consultaResumenPedidos = useQuery({
    queryKey: CLAVE_CONSULTA_RESUMEN_PEDIDOS_DASHBOARD,
    queryFn: ({ signal }) =>
      servicioDashboard.obtenerResumenPedidos(signal),
    retry: false,
  });

  return {
    resumenPedidos: consultaResumenPedidos.data ?? [],
    estaCargandoResumenPedidos: consultaResumenPedidos.isLoading,
  };
}

export function useResumenFacturacionDashboard() {
  const consultaResumenFacturacion = useQuery({
    queryKey: CLAVE_CONSULTA_RESUMEN_FACTURACION_DASHBOARD,
    queryFn: ({ signal }) => facturacionService.obtenerResumen({}, signal),
    retry: false,
  });

  return {
    resumenFacturacion: consultaResumenFacturacion.data,
    estaCargandoResumenFacturacion:
      consultaResumenFacturacion.isLoading,
  };
}

export function useCumplimientoEntregasDashboard() {
  const [busqueda, setBusqueda] = useState("");
  const [fechaInicio, setFechaInicio] = useState<Date>();
  const [fechaFin, setFechaFin] = useState<Date>();
  const [idsEficiencia, setIdsEficiencia] = useState<number[]>([]);
  const [pagina, setPagina] = useState(1);
  const busquedaConRetardo = useRetardo(busqueda);
  const fechasInvalidas = Boolean(
    fechaInicio && fechaFin && fechaInicio > fechaFin,
  );

  const parametros = {
    busqueda: busquedaConRetardo || undefined,
    fchDesde: fechaInicio ? formatearFechaIsoLocal(fechaInicio) : undefined,
    fchHasta: fechaFin ? formatearFechaIsoLocal(fechaFin) : undefined,
    idEficiencia: idsEficiencia[0]?.toString(),
    numPag: pagina,
  };

  const consultaCumplimiento = useQuery({
    queryKey: [...CLAVE_CONSULTA_RESUMEN_USUARIOS_DASHBOARD, parametros],
    queryFn: ({ signal }) =>
      servicioDashboard.obtenerResumenUsuarios(parametros, signal),
    enabled: !fechasInvalidas,
    placeholderData: keepPreviousData,
    retry: false,
  });

  const cambiarBusqueda = (valor: string) => {
    setBusqueda(valor);
    setPagina(1);
  };

  const cambiarFechaInicio = (fecha?: Date) => {
    setFechaInicio(fecha);
    setPagina(1);
  };

  const cambiarFechaFin = (fecha?: Date) => {
    setFechaFin(fecha);
    setPagina(1);
  };

  const cambiarEficiencia = (ids: number[]) => {
    setIdsEficiencia(ids);
    setPagina(1);
  };

  return {
    busqueda,
    cambiarBusqueda,
    fechaInicio,
    fechaFin,
    fechasInvalidas,
    cambiarFechaInicio,
    cambiarFechaFin,
    limpiarFechaInicio: () => cambiarFechaInicio(undefined),
    limpiarFechaFin: () => cambiarFechaFin(undefined),
    idsEficiencia,
    cambiarEficiencia,
    pagina,
    cambiarPagina: setPagina,
    respuesta: consultaCumplimiento.data,
    estaCargando: consultaCumplimiento.isLoading,
    estaActualizando: consultaCumplimiento.isFetching,
    hayError: consultaCumplimiento.isError,
    recargar: consultaCumplimiento.refetch,
  };
}

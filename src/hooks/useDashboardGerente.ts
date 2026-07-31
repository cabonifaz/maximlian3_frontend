import { useQuery } from "@tanstack/react-query";
import { servicioDashboard } from "@maximilian/services/dashboard.service";
import { CLAVE_CONSULTA_RESUMEN_CLIENTES_DASHBOARD } from "@maximilian/shared/constants/pages/Gerente/dashboard-gerente.constants";

export function useDashboardGerente() {
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

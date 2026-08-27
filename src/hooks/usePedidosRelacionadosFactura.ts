import { useQuery } from "@tanstack/react-query";
import { facturacionService } from "@maximilian/services/facturacion.service";
import { CONFIGURACION_CONSULTA_FACTURACION } from "@maximilian/shared/constants/components/coordinador/facturacion.constants";

export function usePedidosRelacionadosFactura(
  idDocumentoElectronico: number | null,
  abierto: boolean,
) {
  const consulta = useQuery({
    ...CONFIGURACION_CONSULTA_FACTURACION,
    queryKey: ["facturacion", "pedidos-relacionados", idDocumentoElectronico],
    queryFn: () =>
      facturacionService.obtenerPedidosRelacionados(
        idDocumentoElectronico as number,
      ),
    enabled: abierto && Boolean(idDocumentoElectronico),
  });

  return {
    estaCargando: consulta.isLoading,
    hayError: consulta.isError,
    pedidos: consulta.data ?? [],
    recargar: consulta.refetch,
  };
}

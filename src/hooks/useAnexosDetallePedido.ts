import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { pedidoService } from "@maximilian/services/pedido.service";
import type { PedidoArchivoEntry } from "@maximilian/shared/types/pedido.type";

export function useAnexosDetallePedido(pedidoId: number | null) {
  const [idDescargando, setIdDescargando] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const busquedaConRetardo = useRetardo(busqueda);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["pedidoArchivos", "detalle", pedidoId, busquedaConRetardo],
    queryFn: () => pedidoService.listArchivos({ idPedido: pedidoId!, busqueda: busquedaConRetardo || undefined, numPag: 1 }),
    enabled: !!pedidoId,
  });

  const descargar = async (archivo: PedidoArchivoEntry) => {
    setIdDescargando(archivo.idPedidoArchivo);
    try {
      const result = await pedidoService.getArchivo({
        idPedidoArchivo: archivo.idPedidoArchivo,
        idPedido: archivo.idPedido,
      });
      window.open(result.downloadUrl, "_blank");
    } catch {
      // handled by interceptor
    } finally {
      setIdDescargando(null);
    }
  };

  return {
    archivos: data?.lstPedidoArchivo ?? [],
    busqueda,
    descargar,
    idDescargando,
    isError,
    isLoading,
    refetch,
    setBusqueda,
  };
}

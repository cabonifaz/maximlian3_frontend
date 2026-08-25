import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { verificacionFacturaService } from "@maximilian/services/verificacion-factura.service";
import { CANTIDAD_PEDIDOS_DETALLE_FACTURA_VERIFICACION_POR_PAGINA } from "@maximilian/shared/constants/components/publico/detalle-pedidos-factura-verificacion.constants";

export function useDetallePedidosFacturaVerificacion(
  token: string | undefined,
  abierto: boolean,
) {
  const [paginaActual, setPaginaActual] = useState(1);
  const [aperturaPrevia, setAperturaPrevia] = useState(abierto);

  if (abierto !== aperturaPrevia) {
    setAperturaPrevia(abierto);
    if (abierto) setPaginaActual(1);
  }

  const consulta = useQuery({
    queryKey: ["verificacionFactura", token, "pedidos"],
    queryFn: () =>
      verificacionFacturaService.obtenerPedidosRelacionados(token as string),
    enabled: abierto && Boolean(token),
    staleTime: Infinity,
  });

  const pedidos = (consulta.data ?? []).map((pedido, idFila) => ({ ...pedido, idFila }));

  const totalRegistros = pedidos.length;
  const totalPaginas = Math.max(
    1,
    Math.ceil(totalRegistros / CANTIDAD_PEDIDOS_DETALLE_FACTURA_VERIFICACION_POR_PAGINA),
  );
  const inicio =
    (paginaActual - 1) * CANTIDAD_PEDIDOS_DETALLE_FACTURA_VERIFICACION_POR_PAGINA;
  const pedidosPagina = pedidos.slice(
    inicio,
    inicio + CANTIDAD_PEDIDOS_DETALLE_FACTURA_VERIFICACION_POR_PAGINA,
  );

  return {
    cambiarPagina: setPaginaActual,
    estaCargando: consulta.isLoading,
    hayError: consulta.isError,
    paginaActual,
    pedidosPagina,
    recargar: consulta.refetch,
    totalPaginas,
    totalRegistros,
  };
}

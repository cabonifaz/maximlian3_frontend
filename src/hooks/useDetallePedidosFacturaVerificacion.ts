import { useState } from "react";
import {
  CANTIDAD_PEDIDOS_DETALLE_FACTURA_VERIFICACION_POR_PAGINA,
  PEDIDOS_DETALLE_FACTURA_VERIFICACION_MOCK,
  type PestanaDetallePedidosFacturaVerificacion,
} from "@maximilian/shared/constants/components/publico/detalle-pedidos-factura-verificacion.constants";

export function useDetallePedidosFacturaVerificacion(
  abierto: boolean,
  pestanaInicial: PestanaDetallePedidosFacturaVerificacion,
) {
  const [pestanaActiva, setPestanaActiva] =
    useState<PestanaDetallePedidosFacturaVerificacion>(pestanaInicial);
  const [paginaActual, setPaginaActual] = useState(1);
  const [aperturaPrevia, setAperturaPrevia] = useState(abierto);

  if (abierto !== aperturaPrevia) {
    setAperturaPrevia(abierto);
    if (abierto) {
      setPestanaActiva(pestanaInicial);
      setPaginaActual(1);
    }
  }

  const cambiarPestana = (pestana: string) => {
    setPestanaActiva(pestana as PestanaDetallePedidosFacturaVerificacion);
    setPaginaActual(1);
  };

  const pedidosFiltrados =
    pestanaActiva === "general"
      ? PEDIDOS_DETALLE_FACTURA_VERIFICACION_MOCK
      : PEDIDOS_DETALLE_FACTURA_VERIFICACION_MOCK.filter(
          (pedido) => pedido.tipo === pestanaActiva,
        );

  const totalRegistros = pedidosFiltrados.length;
  const totalPaginas = Math.max(
    1,
    Math.ceil(totalRegistros / CANTIDAD_PEDIDOS_DETALLE_FACTURA_VERIFICACION_POR_PAGINA),
  );
  const inicio =
    (paginaActual - 1) * CANTIDAD_PEDIDOS_DETALLE_FACTURA_VERIFICACION_POR_PAGINA;
  const pedidosPagina = pedidosFiltrados.slice(
    inicio,
    inicio + CANTIDAD_PEDIDOS_DETALLE_FACTURA_VERIFICACION_POR_PAGINA,
  );

  return {
    cambiarPagina: setPaginaActual,
    cambiarPestana,
    paginaActual,
    pedidosPagina,
    pestanaActiva,
    totalPaginas,
    totalRegistros,
  };
}

import { useState } from "react";
import type { PestanaDetallePedidosFacturaVerificacion } from "@maximilian/shared/constants/components/publico/detalle-pedidos-factura-verificacion.constants";
import type { LineaVerificacionFacturaApi } from "@maximilian/shared/types/verificacion-factura.type";
import { detectarPestanaDetallePedidos } from "@maximilian/shared/utils/verificacion-factura.util";

export function useModalDetallePedidosFacturaVerificacion() {
  const [abierto, setAbierto] = useState(false);
  const [pestanaInicial, setPestanaInicial] =
    useState<PestanaDetallePedidosFacturaVerificacion>("general");

  const abrir = (pestana: PestanaDetallePedidosFacturaVerificacion = "general") => {
    setPestanaInicial(pestana);
    setAbierto(true);
  };

  const abrirDesdeLinea = (linea: LineaVerificacionFacturaApi) => {
    abrir(detectarPestanaDetallePedidos(linea));
  };

  const cerrar = () => setAbierto(false);

  return {
    abierto,
    abrir,
    abrirDesdeLinea,
    cerrar,
    pestanaInicial,
  };
}

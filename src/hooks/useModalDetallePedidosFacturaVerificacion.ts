import { useState } from "react";

export function useModalDetallePedidosFacturaVerificacion() {
  const [abierto, setAbierto] = useState(false);

  const abrir = () => setAbierto(true);
  const cerrar = () => setAbierto(false);

  return {
    abierto,
    abrir,
    cerrar,
  };
}

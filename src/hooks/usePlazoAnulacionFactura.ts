import { useMemo } from "react";
import { PLAZO_MAXIMO_DIAS_ANULACION_FACTURA } from "@maximilian/shared/constants/components/coordinador/facturacion.constants";
import { convertirTextoAFecha } from "@maximilian/shared/utils/fecha.util";

const MILISEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;

function iniciarDia(fecha: Date) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

export function usePlazoAnulacionFactura(fechaEmision: string | undefined) {
  return useMemo(() => {
    const fechaEmisionValida = fechaEmision ? convertirTextoAFecha(fechaEmision) : undefined;

    if (!fechaEmisionValida) {
      return { puedeAnular: true, fechaLimiteAnulacion: undefined as Date | undefined };
    }

    const inicioEmision = iniciarDia(fechaEmisionValida);
    const fechaLimiteAnulacion = new Date(inicioEmision);
    fechaLimiteAnulacion.setDate(
      fechaLimiteAnulacion.getDate() + PLAZO_MAXIMO_DIAS_ANULACION_FACTURA,
    );

    const diasTranscurridos = Math.floor(
      (iniciarDia(new Date()).getTime() - inicioEmision.getTime()) / MILISEGUNDOS_POR_DIA,
    );

    return {
      puedeAnular: diasTranscurridos <= PLAZO_MAXIMO_DIAS_ANULACION_FACTURA,
      fechaLimiteAnulacion,
    };
  }, [fechaEmision]);
}

import { useMemo } from "react";
import { PLAZO_MAXIMO_DIAS_ANULACION_FACTURA } from "@maximilian/shared/constants/components/coordinador/facturacion.constants";
import { convertirTextoAFecha } from "@maximilian/shared/utils/fecha.util";

const MILISEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;

function iniciarDia(fecha: Date) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

export function usePlazoAnulacionFactura(fechaAceptacion: string | null | undefined) {
  return useMemo(() => {
    const fechaAceptacionValida = fechaAceptacion ? convertirTextoAFecha(fechaAceptacion) : undefined;

    if (!fechaAceptacionValida) {
      return { puedeAnular: true, fechaLimiteAnulacion: undefined as Date | undefined };
    }

    const inicioAceptacion = iniciarDia(fechaAceptacionValida);
    const fechaLimiteAnulacion = new Date(inicioAceptacion);
    fechaLimiteAnulacion.setDate(
      fechaLimiteAnulacion.getDate() + PLAZO_MAXIMO_DIAS_ANULACION_FACTURA,
    );

    const diasTranscurridos = Math.floor(
      (iniciarDia(new Date()).getTime() - inicioAceptacion.getTime()) / MILISEGUNDOS_POR_DIA,
    );

    return {
      puedeAnular: diasTranscurridos <= PLAZO_MAXIMO_DIAS_ANULACION_FACTURA,
      fechaLimiteAnulacion,
    };
  }, [fechaAceptacion]);
}

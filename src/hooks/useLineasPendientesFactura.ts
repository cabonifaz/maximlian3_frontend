import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { facturacionService } from "@maximilian/services/facturacion.service";
import { CONFIGURACION_CONSULTA_FACTURACION } from "@maximilian/shared/constants/components/coordinador/facturacion.constants";

export function useLineasPendientesFactura(idCliente: number, abierto: boolean) {
  const [idTipoTramite, setIdTipoTramite] = useState<number | undefined>();
  const [mesSeleccionado, setMesSeleccionado] = useState<Date | undefined>();
  const anio = mesSeleccionado?.getFullYear();
  const mes = mesSeleccionado ? mesSeleccionado.getMonth() + 1 : undefined;

  const consulta = useQuery({
    ...CONFIGURACION_CONSULTA_FACTURACION,
    queryKey: ["facturacion", "lineas-pendientes", idCliente, anio, mes],
    queryFn: () =>
      facturacionService.listarLineasPendientes({ idCliente, anio, mes }),
    enabled: abierto && idCliente > 0,
  });

  const lineas = (consulta.data ?? []).filter(
    (linea) => !idTipoTramite || linea.idTipoTramite === idTipoTramite,
  );

  const reiniciarFiltros = () => {
    setIdTipoTramite(undefined);
    setMesSeleccionado(undefined);
  };

  return {
    cambiarMes: setMesSeleccionado,
    cambiarTipoTramite: setIdTipoTramite,
    estaCargando: consulta.isLoading,
    hayError: consulta.isError,
    idTipoTramite,
    lineas,
    mesSeleccionado,
    recargar: consulta.refetch,
    reiniciarFiltros,
  };
}

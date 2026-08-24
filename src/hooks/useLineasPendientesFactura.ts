import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { facturacionService } from "@maximilian/services/facturacion.service";
import { CONFIGURACION_CONSULTA_FACTURACION } from "@maximilian/shared/constants/components/coordinador/facturacion.constants";

export function useLineasPendientesFactura(
  idCliente: number,
  abierto: boolean,
  idDocumentoElectronico: number | null = null,
  idMonedaFactura?: number,
) {
  const [idTipoTramite, setIdTipoTramite] = useState<number | undefined>();
  const [mesSeleccionado, setMesSeleccionado] = useState<Date | undefined>();
  // La moneda sigue a la de la factura hasta que el usuario la cambie manualmente
  // en este selector; reiniciarFiltros() vuelve a seguirla en la próxima apertura.
  const [idMonedaTocada, setIdMonedaTocada] = useState(false);
  const [idMonedaSeleccion, setIdMonedaSeleccion] = useState<number | undefined>();
  const anio = mesSeleccionado?.getFullYear();
  const mes = mesSeleccionado ? mesSeleccionado.getMonth() + 1 : undefined;
  const idMoneda = idMonedaTocada ? idMonedaSeleccion : idMonedaFactura;

  const consulta = useQuery({
    ...CONFIGURACION_CONSULTA_FACTURACION,
    queryKey: [
      "facturacion",
      "lineas-pendientes",
      idCliente,
      anio,
      mes,
      idDocumentoElectronico,
      idMoneda,
    ],
    queryFn: () =>
      facturacionService.listarLineasPendientes({
        idCliente,
        anio,
        mes,
        idDocumentoElectronico: idDocumentoElectronico ?? undefined,
        idMoneda,
      }),
    enabled: abierto && idCliente > 0,
  });

  const lineas = (consulta.data ?? []).filter(
    (linea) => !idTipoTramite || linea.idTipoTramite === idTipoTramite,
  );

  const cambiarMoneda = (valor?: number) => {
    setIdMonedaTocada(true);
    setIdMonedaSeleccion(valor);
  };

  const reiniciarFiltros = () => {
    setIdTipoTramite(undefined);
    setMesSeleccionado(undefined);
    setIdMonedaTocada(false);
    setIdMonedaSeleccion(undefined);
  };

  return {
    cambiarMes: setMesSeleccionado,
    cambiarMoneda,
    cambiarTipoTramite: setIdTipoTramite,
    estaCargando: consulta.isLoading,
    hayError: consulta.isError,
    idMoneda,
    idTipoTramite,
    lineas,
    mesSeleccionado,
    recargar: consulta.refetch,
    reiniciarFiltros,
  };
}

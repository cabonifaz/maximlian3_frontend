import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { facturacionService } from "@maximilian/services/facturacion.service";
import { CONFIGURACION_CONSULTA_FACTURACION } from "@maximilian/shared/constants/components/coordinador/facturacion.constants";
import type { EditarLineaAgrupadaFacturaRequest } from "@maximilian/shared/types/facturacion.type";

export function useLineasPendientesFactura(
  idCliente: number,
  abierto: boolean,
  idDocumentoElectronico: number | null = null,
  idMonedaFactura?: number,
) {
  const queryClient = useQueryClient();
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

  const lineas = consulta.data ?? [];

  const invalidarLineas = () =>
    queryClient.invalidateQueries({
      queryKey: ["facturacion", "lineas-pendientes", idCliente],
    });

  const editarLineaMutation = useMutation({
    mutationFn: ({
      idPedidoFacturaLinea,
      datos,
    }: {
      idPedidoFacturaLinea: number;
      datos: EditarLineaAgrupadaFacturaRequest;
    }) => facturacionService.editarLineaAgrupada(idPedidoFacturaLinea, datos),
    onSuccess: () => void invalidarLineas(),
  });

  const eliminarLineaMutation = useMutation({
    mutationFn: (idPedidoFacturaLinea: number) =>
      facturacionService.eliminarLinea(idPedidoFacturaLinea),
    onSuccess: () => void invalidarLineas(),
  });

  const cambiarMoneda = (valor?: number) => {
    setIdMonedaTocada(true);
    setIdMonedaSeleccion(valor);
  };

  const reiniciarFiltros = () => {
    setMesSeleccionado(undefined);
    setIdMonedaTocada(false);
    setIdMonedaSeleccion(undefined);
  };

  return {
    cambiarMes: setMesSeleccionado,
    cambiarMoneda,
    editandoLinea: editarLineaMutation.isPending,
    editarLinea: editarLineaMutation.mutateAsync,
    eliminandoLinea: eliminarLineaMutation.isPending,
    eliminarLinea: eliminarLineaMutation.mutateAsync,
    estaCargando: consulta.isLoading,
    hayError: consulta.isError,
    idMoneda,
    lineas,
    mesSeleccionado,
    recargar: consulta.refetch,
    reiniciarFiltros,
  };
}

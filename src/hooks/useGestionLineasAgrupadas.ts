import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { facturacionService } from "@maximilian/services/facturacion.service";
import { CONFIGURACION_CONSULTA_FACTURACION } from "@maximilian/shared/constants/components/coordinador/facturacion.constants";
import type { EditarLineaAgrupadaFacturaRequest } from "@maximilian/shared/types/facturacion.type";

export function useGestionLineasAgrupadas(idCliente: number, abierto: boolean) {
  const queryClient = useQueryClient();
  const [idTipoTramite, setIdTipoTramite] = useState<number | undefined>();
  const [mesSeleccionado, setMesSeleccionado] = useState<Date | undefined>();
  const anio = mesSeleccionado?.getFullYear();
  const mes = mesSeleccionado ? mesSeleccionado.getMonth() + 1 : undefined;
  const claveConsulta = ["facturacion", "lineas-pendientes", idCliente, anio, mes];

  const consulta = useQuery({
    ...CONFIGURACION_CONSULTA_FACTURACION,
    queryKey: claveConsulta,
    queryFn: () =>
      facturacionService.listarLineasPendientes({ idCliente, anio, mes }),
    enabled: abierto && idCliente > 0,
  });

  const lineas = (consulta.data ?? []).filter(
    (linea) => !idTipoTramite || linea.idTipoTramite === idTipoTramite,
  );

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

  const reiniciarFiltros = () => {
    setIdTipoTramite(undefined);
    setMesSeleccionado(undefined);
  };

  return {
    cambiarMes: setMesSeleccionado,
    cambiarTipoTramite: setIdTipoTramite,
    editandoLinea: editarLineaMutation.isPending,
    editarLinea: editarLineaMutation.mutateAsync,
    eliminandoLinea: eliminarLineaMutation.isPending,
    eliminarLinea: eliminarLineaMutation.mutateAsync,
    estaCargando: consulta.isLoading,
    hayError: consulta.isError,
    idTipoTramite,
    lineas,
    mesSeleccionado,
    recargar: consulta.refetch,
    reiniciarFiltros,
  };
}

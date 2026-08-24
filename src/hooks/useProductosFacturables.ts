import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { facturacionService } from "@maximilian/services/facturacion.service";
import { CONFIGURACION_CONSULTA_FACTURACION } from "@maximilian/shared/constants/components/coordinador/facturacion.constants";

export function useProductosFacturables(
  idCliente: number,
  idDocumentoElectronico: number | null,
  abierto: boolean,
) {
  const [idTipoTramite, setIdTipoTramite] = useState<number | undefined>();
  const [mesSeleccionado, setMesSeleccionado] = useState<Date | undefined>();
  const [idPais, setIdPais] = useState<number | undefined>();
  const [idMoneda, setIdMoneda] = useState<number | undefined>();
  const anio = mesSeleccionado?.getFullYear();
  const mes = mesSeleccionado ? mesSeleccionado.getMonth() + 1 : undefined;
  const filtrosCompletos = Boolean(idTipoTramite && anio && mes);

  const consulta = useQuery({
    ...CONFIGURACION_CONSULTA_FACTURACION,
    queryKey: [
      "facturacion",
      "pedidos-facturables",
      idCliente,
      idTipoTramite,
      anio,
      mes,
      idPais,
      idMoneda,
    ],
    queryFn: () =>
      facturacionService.listarProductosFacturables({
        idCliente,
        idTipoTramite,
        anio,
        mes,
        idPais,
        idMoneda,
      }),
    enabled: abierto && idCliente > 0 && filtrosCompletos,
  });

  const crearLineaMutation = useMutation({
    mutationFn: ({
      codigo,
      descripcion,
    }: {
      codigo: string;
      descripcion: string;
    }) =>
      facturacionService.crearLineaAgrupada({
        idCliente,
        idsPedido: (consulta.data?.productos ?? []).map(
          (producto) => producto.idProductoFacturable,
        ),
        codigo,
        descripcion,
        idDocumentoElectronico,
      }),
  });

  const cambiarTipoTramite = (valor?: number) => {
    setIdTipoTramite(valor);
  };

  const cambiarMes = (fecha?: Date) => {
    setMesSeleccionado(fecha);
  };

  const cambiarPais = (valor?: number) => {
    setIdPais(valor);
  };

  const cambiarMoneda = (valor?: number) => {
    setIdMoneda(valor);
  };

  const reiniciarFiltros = () => {
    setIdTipoTramite(undefined);
    setMesSeleccionado(undefined);
    setIdPais(undefined);
    setIdMoneda(undefined);
    crearLineaMutation.reset();
  };

  return {
    cambiarMes,
    cambiarMoneda,
    cambiarPais,
    cambiarTipoTramite,
    crearLinea: crearLineaMutation.mutateAsync,
    creandoLinea: crearLineaMutation.isPending,
    estaCargando: consulta.isLoading,
    filtrosCompletos,
    hayError: consulta.isError,
    idMoneda,
    idPais,
    idTipoTramite,
    mesSeleccionado,
    productos: consulta.data?.productos ?? [],
    recargar: consulta.refetch,
    reiniciarFiltros,
  };
}

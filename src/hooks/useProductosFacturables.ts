import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { facturacionService } from "@maximilian/services/facturacion.service";
import { formatearFechaIsoLocal } from "@maximilian/shared/utils/fecha.util";
import { CONFIGURACION_CONSULTA_FACTURACION } from "@maximilian/shared/constants/components/coordinador/facturacion.constants";

export function useProductosFacturables(idCliente: number, abierto: boolean) {
  const [idTipoTramite, setIdTipoTramite] = useState<number | undefined>();
  const [fechaInicio, setFechaInicio] = useState<Date | undefined>();
  const [fechaFin, setFechaFin] = useState<Date | undefined>();
  const [paginaActual, setPaginaActual] = useState(1);
  const fechaInicioIso = fechaInicio ? formatearFechaIsoLocal(fechaInicio) : undefined;
  const fechaFinIso = fechaFin ? formatearFechaIsoLocal(fechaFin) : undefined;
  const fechasInvalidas = Boolean(
    fechaInicio && fechaFin && fechaInicio > fechaFin,
  );

  const consulta = useQuery({
    ...CONFIGURACION_CONSULTA_FACTURACION,
    queryKey: [
      "facturacion",
      "pedidos-facturables",
      idCliente,
      idTipoTramite,
      fechaInicioIso,
      fechaFinIso,
      paginaActual,
    ],
    queryFn: () => facturacionService.listarProductosFacturables({
      idCliente,
      idTipoTramite,
      fechaInicio: fechaInicioIso,
      fechaFin: fechaFinIso,
      numPag: paginaActual,
    }),
    enabled: abierto && idCliente > 0 && !fechasInvalidas,
  });

  const cambiarTipoTramite = (valor?: number) => {
    setIdTipoTramite(valor);
    setPaginaActual(1);
  };

  const cambiarFechaInicio = (fecha?: Date) => {
    setFechaInicio(fecha);
    setPaginaActual(1);
  };

  const cambiarFechaFin = (fecha?: Date) => {
    setFechaFin(fecha);
    setPaginaActual(1);
  };

  const reiniciarFiltros = () => {
    setIdTipoTramite(undefined);
    setFechaInicio(undefined);
    setFechaFin(undefined);
    setPaginaActual(1);
  };

  return {
    cambiarFechaFin,
    cambiarFechaInicio,
    cambiarPagina: setPaginaActual,
    cambiarTipoTramite,
    estaCargando: consulta.isLoading,
    fechaFin,
    fechaInicio,
    fechasInvalidas,
    hayError: consulta.isError,
    idTipoTramite,
    paginaActual,
    productos: consulta.data?.productos ?? [],
    recargar: consulta.refetch,
    reiniciarFiltros,
    totalPaginas: Math.max(1, consulta.data?.totalPaginas ?? 1),
    totalRegistros: consulta.data?.totalRegistros ?? 0,
  };
}

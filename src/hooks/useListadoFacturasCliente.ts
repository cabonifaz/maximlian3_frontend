import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { facturacionService } from "@maximilian/services/facturacion.service";
import type {
  EntradaFacturaCliente,
  EstadoFacturaCliente,
  RespuestaListaFacturasCliente,
} from "@maximilian/shared/types/facturacion.type";

export function useListadoFacturasCliente(idCliente: number) {
  const queryClient = useQueryClient();
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const busquedaConRetardo = useRetardo(terminoBusqueda);
  const claveConsulta = [
    "facturacion",
    "pedidos-facturacion-cliente",
    idCliente,
    paginaActual,
    busquedaConRetardo,
  ] as const;

  const {
    data: respuesta,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: claveConsulta,
    queryFn: () => facturacionService.listarFacturasCliente({
      idCliente,
      busqueda: busquedaConRetardo || undefined,
      numPag: paginaActual,
    }),
    enabled: idCliente > 0,
  });

  const totalPaginas = Math.max(respuesta?.totalPaginas ?? 1, 1);

  const cambiarBusqueda = (valor: string) => {
    setTerminoBusqueda(valor);
    setPaginaActual(1);
  };

  const cambiarPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
    }
  };

  const actualizarEstadoFactura = (
    factura: EntradaFacturaCliente,
    estado: EstadoFacturaCliente,
    codigoEstado: number,
  ) => {
    queryClient.setQueryData<RespuestaListaFacturasCliente>(
      claveConsulta,
      (respuestaActual) => respuestaActual
        ? {
            ...respuestaActual,
            lstFacturas: respuestaActual.lstFacturas.map((facturaActual) =>
              facturaActual.idFactura === factura.idFactura
                ? { ...facturaActual, estado, codigoEstado }
                : facturaActual,
            ),
          }
        : respuestaActual,
    );
  };

  return {
    terminoBusqueda,
    paginaActual,
    facturasPagina: respuesta?.lstFacturas ?? [],
    totalRegistros: respuesta?.totalRegistros ?? 0,
    totalPaginas,
    isLoading: isLoading || isFetching,
    isError,
    cambiarBusqueda,
    cambiarPagina,
    actualizarEstadoFactura,
    reintentar: refetch,
  };
}

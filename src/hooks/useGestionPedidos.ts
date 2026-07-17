import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useListadoPaginado } from "@maximilian/hooks/useListadoPaginado";
import { pedidoService } from "@maximilian/services/pedido.service";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import type { PedidoListEntry } from "@maximilian/shared/types/pedido.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";

interface ModalAsignacionPedido {
  key: number;
  pedidosIniciales: PedidoListEntry[];
}

export function useGestionPedidos() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    terminoBusqueda,
    paginaActual,
    busquedaConRetardo,
    cambiarBusqueda,
    cambiarPagina,
    reiniciarPagina,
  } = useListadoPaginado();
  const [estaAbiertoModalCrear, setEstaAbiertoModalCrear] = useState(false);
  const [estaAbiertoModalEditar, setEstaAbiertoModalEditar] = useState(false);
  const [estaAbiertoModalDetalle, setEstaAbiertoModalDetalle] = useState(false);
  const [idPedidoSeleccionado, setIdPedidoSeleccionado] = useState<number | null>(null);
  const [pedidoACancelar, setPedidoACancelar] = useState<PedidoListEntry | null>(null);
  const [pedidoAEliminar, setPedidoAEliminar] = useState<PedidoListEntry | null>(null);
  const [modalAsignacion, setModalAsignacion] = useState<ModalAsignacionPedido | null>(null);
  const [filtroEstados, setFiltroEstados] = useState<number[]>([]);
  const [versionFiltroEstados, setVersionFiltroEstados] = useState(0);

  const estadosFiltroOrdenados = useMemo(
    () => [...filtroEstados].sort((a, b) => a - b),
    [filtroEstados],
  );
  const estadosFiltroClave = estadosFiltroOrdenados.join(",");

  const { data: opcionesEstadoPedido } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.ESTADO_PEDIDO],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.ESTADO_PEDIDO),
    staleTime: Infinity,
  });

  const {
    data: pedidosData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["pedidos", paginaActual, busquedaConRetardo, estadosFiltroClave, versionFiltroEstados],
    queryFn: () =>
      pedidoService.list({
        numPag: paginaActual,
        busqueda: busquedaConRetardo || undefined,
        idEstado: estadosFiltroClave || undefined,
      }),
    gcTime: 0,
  });

  const cancelarPedidoMutation = useMutation({
    mutationFn: (idPedido: number) => pedidoService.cancelar({ idPedido }),
    onSuccess: () => {
      setPedidoACancelar(null);
      queryClient.removeQueries({ queryKey: ["pedidos"], type: "inactive" });
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
    },
  });

  const eliminarPedidoMutation = useMutation({
    mutationFn: (idPedido: number) => pedidoService.eliminar({ idPedido }),
    onSuccess: () => {
      setPedidoAEliminar(null);
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
    },
  });

  const pedidosFiltrados = useMemo(() => {
    const pedidos = pedidosData?.lstPedido;
    if (!pedidos || estadosFiltroOrdenados.length === 0) return pedidos;

    const estadosSeleccionados = new Set(estadosFiltroOrdenados);
    return pedidos.filter((pedido) => estadosSeleccionados.has(pedido.estado));
  }, [estadosFiltroOrdenados, pedidosData?.lstPedido]);

  const cambiarEstadosFiltro = (ids: number[]) => {
    setFiltroEstados(ids);
    setVersionFiltroEstados((version) => version + 1);
    reiniciarPagina();
  };

  const cambiarPaginaPedido = (pagina: number) => {
    cambiarPagina(pagina, pedidosData?.totalPaginas || 1);
  };

  const abrirDetallePedido = (idPedido: number) => {
    setIdPedidoSeleccionado(idPedido);
    setEstaAbiertoModalDetalle(true);
  };

  const abrirEdicionPedido = (idPedido: number) => {
    setIdPedidoSeleccionado(idPedido);
    setEstaAbiertoModalEditar(true);
  };

  const cerrarEdicionPedido = () => {
    setEstaAbiertoModalEditar(false);
    setIdPedidoSeleccionado(null);
  };

  const cerrarDetallePedido = () => {
    setEstaAbiertoModalDetalle(false);
    setIdPedidoSeleccionado(null);
  };

  const abrirAsignacionPedido = (pedido: PedidoListEntry) => {
    if (pedido.asignaciones.length > 0) {
      navigate("/coordinador/asignaciones", {
        state: {
          busquedaInicial: pedido.investigado,
        },
      });
      return;
    }

    setModalAsignacion({
      key: Date.now(),
      pedidosIniciales: [pedido],
    });
  };

  const cerrarModalAsignacion = () => {
    setModalAsignacion(null);
  };

  const refrescarDespuesAsignacion = () => {
    queryClient.invalidateQueries({ queryKey: ["assignment-orders"] });
    queryClient.invalidateQueries({ queryKey: ["pedidos"] });
  };

  const cancelarPedido = () => {
    if (pedidoACancelar) {
      cancelarPedidoMutation.mutate(pedidoACancelar.idPedido);
    }
  };

  const eliminarPedido = () => {
    if (pedidoAEliminar) {
      eliminarPedidoMutation.mutate(pedidoAEliminar.idPedido);
    }
  };

  return {
    abrirAsignacionPedido,
    abrirDetallePedido,
    abrirEdicionPedido,
    cambiarBusqueda,
    cambiarEstadosFiltro,
    cambiarPaginaPedido,
    cancelarPedido,
    cancelarPedidoMutation,
    cerrarDetallePedido,
    cerrarEdicionPedido,
    cerrarModalAsignacion,
    eliminarPedido,
    eliminarPedidoMutation,
    estaAbiertoModalCrear,
    estaAbiertoModalDetalle,
    estaAbiertoModalEditar,
    filtroEstados,
    idPedidoSeleccionado,
    isError,
    isLoading,
    modalAsignacion,
    opcionesEstadoPedido,
    paginaActual,
    pedidoACancelar,
    pedidoAEliminar,
    pedidosData,
    pedidosFiltrados,
    refetch,
    refrescarDespuesAsignacion,
    setEstaAbiertoModalCrear,
    setPedidoACancelar,
    setPedidoAEliminar,
    terminoBusqueda,
  };
}

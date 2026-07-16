import { useState } from "react";
import { useLocation } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useListadoPaginado } from "@maximilian/hooks/useListadoPaginado";
import { servicioAsignacion } from "@maximilian/services/asignacion.service";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import type { AssignmentOrderEntry, AssignmentRoleSelection } from "@maximilian/shared/types/asignacion.type";
import type { PedidoListEntry } from "@maximilian/shared/types/pedido.type";
import type { TabAsignacion } from "@maximilian/shared/types/modal-flujo-asignacion.type";
import {
  construirOpcionesEliminacionAsignacion,
  convertirAsignacionAAsignacionesIniciales,
  convertirAsignacionAPedido,
  esNuevaAsignacionDesdeListado,
} from "@maximilian/shared/utils/gestion-asignaciones.util";

type EstadoNavegacionAsignaciones = {
  busquedaInicial?: string;
};

interface ModalAsignacion {
  key: number;
  titulo: string;
  tabInicial: TabAsignacion;
  pedidosIniciales: PedidoListEntry[];
  asignacionesIniciales: AssignmentRoleSelection[];
  modo?: "crear" | "editar";
}

export function useGestionAsignaciones() {
  const location = useLocation();
  const estadoNavegacion = location.state as EstadoNavegacionAsignaciones | null;
  const queryClient = useQueryClient();
  const {
    terminoBusqueda,
    paginaActual,
    busquedaConRetardo,
    cambiarBusqueda,
    cambiarPagina,
    reiniciarPagina,
  } = useListadoPaginado(estadoNavegacion?.busquedaInicial || "");
  const [idEstadoFiltro, setIdEstadoFiltro] = useState<number | undefined>(undefined);
  const [asignacionAAnular, setAsignacionAAnular] = useState<AssignmentOrderEntry | null>(null);
  const [idAsignacionAEliminar, setIdAsignacionAEliminar] = useState<number | undefined>(undefined);
  const [modalAsignacion, setModalAsignacion] = useState<ModalAsignacion | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["assignment-orders", paginaActual, busquedaConRetardo, idEstadoFiltro],
    queryFn: () =>
      servicioAsignacion.list({
        numPag: paginaActual,
        busqueda: busquedaConRetardo || undefined,
        idEstado: idEstadoFiltro,
      }),
  });

  const { data: opcionesEstadoAsignacion } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.ESTADO_ASIGNACION],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.ESTADO_ASIGNACION),
    staleTime: Infinity,
  });

  const anularAsignacionMutation = useMutation({
    mutationFn: ({ idAsignacion }: { idAsignacion: number }) =>
      servicioAsignacion.delete({ idAsignacion }),
    onSuccess: () => {
      setAsignacionAAnular(null);
      setIdAsignacionAEliminar(undefined);
      queryClient.invalidateQueries({ queryKey: ["assignment-orders"] });
    },
  });

  const cambiarFiltroEstado = (ids: number[]) => {
    setIdEstadoFiltro(ids[ids.length - 1]);
    reiniciarPagina();
  };

  const cambiarPaginaAsignacion = (pagina: number) => {
    cambiarPagina(pagina, data?.totalPaginas || 1);
  };

  const abrirModalNuevaAsignacion = () => {
    setModalAsignacion({
      key: Date.now(),
      titulo: "Nueva Asignacion",
      tabInicial: "pedidos",
      pedidosIniciales: [],
      asignacionesIniciales: [
        { role: "analyst", assignee: null },
        { role: "translator", assignee: null },
      ],
      modo: "crear",
    });
  };

  const abrirModalAsignacion = (asignacion: AssignmentOrderEntry) => {
    const esNuevaAsignacion = esNuevaAsignacionDesdeListado(asignacion);
    setModalAsignacion({
      key: Date.now(),
      titulo: esNuevaAsignacion ? "Nueva Asignacion" : "Modificar Asignacion",
      tabInicial: "asignacion",
      pedidosIniciales: [convertirAsignacionAPedido(asignacion)],
      asignacionesIniciales: esNuevaAsignacion
        ? [
            { role: "analyst", assignee: null },
            { role: "translator", assignee: null },
          ]
        : convertirAsignacionAAsignacionesIniciales(asignacion),
      modo: esNuevaAsignacion ? "crear" : "editar",
    });
  };

  const prepararEliminacionAsignacion = (asignacion: AssignmentOrderEntry) => {
    const opcionesEliminacion = construirOpcionesEliminacionAsignacion(asignacion);
    setAsignacionAAnular(asignacion);
    setIdAsignacionAEliminar(opcionesEliminacion.length === 1 ? (opcionesEliminacion[0].num1 ?? undefined) : undefined);
  };

  const cerrarEliminacionAsignacion = () => {
    setAsignacionAAnular(null);
    setIdAsignacionAEliminar(undefined);
  };

  const cerrarModalAsignacion = () => {
    setModalAsignacion(null);
  };

  const confirmarAnulacionAsignacion = () => {
    if (idAsignacionAEliminar === undefined) return;
    anularAsignacionMutation.mutate({ idAsignacion: idAsignacionAEliminar });
  };

  const refrescarDespuesAsignacion = () => {
    queryClient.invalidateQueries({ queryKey: ["assignment-orders"] });
    queryClient.invalidateQueries({ queryKey: ["pedidos"] });
  };

  return {
    abrirModalAsignacion,
    abrirModalNuevaAsignacion,
    anularAsignacionMutation,
    asignacionAAnular,
    cambiarBusqueda,
    cambiarFiltroEstado,
    cambiarPaginaAsignacion,
    cerrarEliminacionAsignacion,
    cerrarModalAsignacion,
    confirmarAnulacionAsignacion,
    data,
    idAsignacionAEliminar,
    idEstadoFiltro,
    isError,
    isLoading,
    modalAsignacion,
    opcionesEstadoAsignacion,
    paginaActual,
    prepararEliminacionAsignacion,
    refetch,
    refrescarDespuesAsignacion,
    setIdAsignacionAEliminar,
    terminoBusqueda,
  };
}

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ASIGNACIONES_INICIALES, ID_ESTADO_ASIGNACION_SIN_ASIGNACION_PENDIENTE } from "@maximilian/shared/constants/components/coordinador/modal-flujo-asignacion.constants";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { servicioAsignacion } from "@maximilian/services/asignacion.service";
import { pedidoService } from "@maximilian/services/pedido.service";
import type {
  AssignmentCandidate,
  AssignmentRole,
  AssignmentRoleSelection,
} from "@maximilian/shared/types/asignacion.type";
import type { PedidoListEntry } from "@maximilian/shared/types/pedido.type";
import type { TabAsignacion } from "@maximilian/shared/types/modal-flujo-asignacion.type";
import {
  convertirPedidoAAsignacionesIniciales,
  normalizarPedidoAsignacion,
  tieneAsignacionesEnPedido,
} from "@maximilian/shared/utils/modal-flujo-asignacion.util";
import { normalizarTextoBusqueda } from "@maximilian/shared/utils/texto.util";

interface ParametrosUseModalFlujoAsignacion {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  pedidosIniciales?: PedidoListEntry[];
  asignacionesIniciales?: AssignmentRoleSelection[];
  modo?: "crear" | "editar";
  tabInicial?: TabAsignacion;
}

export function useModalFlujoAsignacion({
  isOpen,
  onClose,
  onSuccess,
  pedidosIniciales = [],
  asignacionesIniciales = ASIGNACIONES_INICIALES,
  modo = "crear",
  tabInicial = "pedidos",
}: ParametrosUseModalFlujoAsignacion) {
  const queryClient = useQueryClient();
  const [tabActiva, setTabActiva] = useState<TabAsignacion>(tabInicial);
  const [terminoBusquedaPedido, setTerminoBusquedaPedido] = useState("");
  const [terminoBusquedaUsuario, setTerminoBusquedaUsuario] = useState("");
  const [paginaPedido, setPaginaPedido] = useState(1);
  const [pedidoDetalleId, setPedidoDetalleId] = useState<number | null>(null);
  const [idsSeleccionados, setIdsSeleccionados] = useState<Set<number>>(
    () => new Set(pedidosIniciales.map((pedido) => pedido.idPedido)),
  );
  const [pedidosSeleccionados, setPedidosSeleccionados] = useState<Record<number, PedidoListEntry>>(
    () =>
      pedidosIniciales.reduce<Record<number, PedidoListEntry>>((acumulado, pedido) => {
        acumulado[pedido.idPedido] = normalizarPedidoAsignacion(pedido);
        return acumulado;
      }, {}),
  );
  const [asignacionesBorrador, setAsignacionesBorrador] = useState<AssignmentRoleSelection[]>(asignacionesIniciales);
  const [rolActivo, setRolActivo] = useState<AssignmentRole | null>(null);
  const [asignacionesDerivadasDePedido, setAsignacionesDerivadasDePedido] = useState(false);
  const esModoEdicion = modo === "editar";
  const idPedidoEdicion = pedidosIniciales[0]?.idPedido;

  const busquedaPedidoDebounced = useRetardo(terminoBusquedaPedido);
  const busquedaUsuarioDebounced = useRetardo(terminoBusquedaUsuario, 250);

  const {
    data: pedidosData,
    isLoading: isLoadingPedidos,
    isFetching: isFetchingPedidos,
    isError: isErrorPedidos,
    refetch: refetchPedidos,
  } = useQuery({
    queryKey: [
      "pedidos-asignacion-modal",
      "listarAsignacion",
      modo,
      idPedidoEdicion,
      paginaPedido,
      busquedaPedidoDebounced,
      ID_ESTADO_ASIGNACION_SIN_ASIGNACION_PENDIENTE,
    ],
    queryFn: () =>
      pedidoService.listAsignacion({
        numPag: esModoEdicion ? 1 : paginaPedido,
        busqueda: !esModoEdicion ? busquedaPedidoDebounced || undefined : undefined,
        idPedido: esModoEdicion ? idPedidoEdicion : undefined,
        idEstado: !esModoEdicion ? "1" : undefined,
        idEstadoAsignacion: !esModoEdicion ? ID_ESTADO_ASIGNACION_SIN_ASIGNACION_PENDIENTE : undefined,
      }),
    enabled: isOpen && (!esModoEdicion || !!idPedidoEdicion),
  });

  const pedidoEdicion = useMemo(
    () => pedidosData?.lstPedido.find((pedido) => pedido.idPedido === idPedidoEdicion),
    [idPedidoEdicion, pedidosData?.lstPedido],
  );

  const pedidosInicialesNormalizados = useMemo(
    () => pedidosIniciales.map(normalizarPedidoAsignacion),
    [pedidosIniciales],
  );

  const pedidosActivos = esModoEdicion
    ? pedidoEdicion
      ? [pedidoEdicion]
      : pedidosInicialesNormalizados
    : pedidosData?.lstPedido ?? [];

  const pedidosElegidos = useMemo(
    () =>
      Array.from(idsSeleccionados)
        .map((idPedido) => pedidosSeleccionados[idPedido])
        .filter((pedido): pedido is PedidoListEntry => Boolean(pedido)),
    [idsSeleccionados, pedidosSeleccionados],
  );

  const idiomasPedido = useMemo(
    () =>
      Array.from(
        new Set(
          pedidosElegidos
            .map((pedido) => pedido.idIdioma)
            .filter((idIdioma): idIdioma is number => typeof idIdioma === "number" && idIdioma > 0),
        ),
      ),
    [pedidosElegidos],
  );

  const { data: candidatos, isLoading: isLoadingCandidatos, isFetching: isFetchingCandidatos } = useQuery({
    queryKey: ["assignment-candidates-inline", rolActivo, idiomasPedido],
    queryFn: () =>
      servicioAsignacion.listCandidates({
        role: rolActivo!,
        idiomasPedido,
      }),
    enabled: isOpen && tabActiva === "asignacion" && rolActivo !== null,
  });

  const candidatosFiltrados = useMemo(() => {
    const terminoNormalizado = normalizarTextoBusqueda(busquedaUsuarioDebounced);
    if (!terminoNormalizado) return candidatos ?? [];

    return (candidatos ?? []).filter((candidato) => {
      const nombreCompleto = normalizarTextoBusqueda(candidato.nombre);
      const nombres = normalizarTextoBusqueda(candidato.nombres ?? "");
      const apellidos = normalizarTextoBusqueda(candidato.apellidos ?? "");

      return (
        nombreCompleto.includes(terminoNormalizado)
        || nombres.includes(terminoNormalizado)
        || apellidos.includes(terminoNormalizado)
      );
    });
  }, [busquedaUsuarioDebounced, candidatos]);

  const { data: candidatosAnalista } = useQuery({
    queryKey: ["assignment-candidates-iniciales", "analyst", idiomasPedido],
    queryFn: () =>
      servicioAsignacion.listCandidates({
        role: "analyst",
        idiomasPedido,
      }),
    enabled: isOpen && asignacionesIniciales.some((asignacion) => asignacion.role === "analyst" && !!asignacion.assignee),
  });

  const { data: candidatosTraductor } = useQuery({
    queryKey: ["assignment-candidates-iniciales", "translator", idiomasPedido],
    queryFn: () =>
      servicioAsignacion.listCandidates({
        role: "translator",
        idiomasPedido,
      }),
    enabled: isOpen && asignacionesIniciales.some((asignacion) => asignacion.role === "translator" && !!asignacion.assignee),
  });

  useEffect(() => {
    setAsignacionesBorrador(asignacionesIniciales);
  }, [asignacionesIniciales]);

  useEffect(() => {
    if (!esModoEdicion || !pedidoEdicion) return;

    setPedidosSeleccionados({
      [pedidoEdicion.idPedido]: normalizarPedidoAsignacion(pedidoEdicion),
    });
  }, [esModoEdicion, pedidoEdicion]);

  useEffect(() => {
    setAsignacionesBorrador((actual) =>
      actual.map((asignacion) => {
        const asignadoActual = asignacion.assignee;
        if (!asignadoActual || asignadoActual.idUsuario > 0) return asignacion;

        const candidatosRol = asignacion.role === "analyst" ? (candidatosAnalista ?? []) : (candidatosTraductor ?? []);
        const nombreBuscado = normalizarTextoBusqueda(asignadoActual.nombre);
        const candidatoCoincidente = candidatosRol.find(
          (candidato) => normalizarTextoBusqueda(candidato.nombre) === nombreBuscado,
        );

        return candidatoCoincidente
          ? { ...asignacion, assignee: candidatoCoincidente }
          : asignacion;
      }),
    );
  }, [candidatosAnalista, candidatosTraductor]);

  const guardarAsignacionesMutation = useMutation({
    mutationFn: () =>
      servicioAsignacion.saveAssignments({
        idPedidos: pedidosElegidos.map((pedido) => pedido.idPedido),
        assignments: asignacionesBorrador,
        modo: modo === "editar" || pedidosElegidos.some(tieneAsignacionesEnPedido) ? "editar" : "crear",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["assignment-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      await queryClient.invalidateQueries({ queryKey: ["pedidos-asignacion-modal"] });
      onSuccess?.();
      onClose();
    },
  });

  const cantidadSeleccionados = idsSeleccionados.size;
  const puedeGuardar = cantidadSeleccionados > 0 && asignacionesBorrador.some((asignacion) => (asignacion.assignee?.idUsuario ?? 0) > 0);
  const hayErroresPedidos = cantidadSeleccionados === 0;
  const hayErroresAsignacion = cantidadSeleccionados > 0 && !puedeGuardar;

  const handleSeleccionPedidos = (ids: Set<number>) => {
    setIdsSeleccionados(ids);
    setPedidosSeleccionados((actual) => {
      const siguiente: Record<number, PedidoListEntry> = {};

      for (const idPedido of ids) {
        const pedidoActual = pedidosActivos.find((pedido) => pedido.idPedido === idPedido);
        const pedidoGuardado = pedidoActual ?? actual[idPedido];

        if (pedidoGuardado) {
          siguiente[idPedido] = normalizarPedidoAsignacion(pedidoGuardado);
        }
      }

      return siguiente;
    });

    const pedidosActualizados = Array.from(ids)
      .map((idPedido) => pedidosActivos.find((pedido) => pedido.idPedido === idPedido) ?? pedidosSeleccionados[idPedido])
      .filter((pedido): pedido is PedidoListEntry => Boolean(pedido));

    if (pedidosActualizados.length === 1 && tieneAsignacionesEnPedido(pedidosActualizados[0])) {
      setAsignacionesBorrador(convertirPedidoAAsignacionesIniciales(pedidosActualizados[0]));
      setAsignacionesDerivadasDePedido(true);
    } else if (asignacionesDerivadasDePedido) {
      setAsignacionesBorrador(asignacionesIniciales);
      setAsignacionesDerivadasDePedido(false);
    }
  };

  const handleElegirCandidato = (candidate: AssignmentCandidate) => {
    setAsignacionesBorrador((actual) =>
      actual.map((asignacion) =>
        asignacion.role === rolActivo
          ? { ...asignacion, assignee: candidate }
          : asignacion,
      ),
    );
    setRolActivo(null);
    setTerminoBusquedaUsuario("");
  };

  const handleCambiarTab = (tab: string) => {
    if (tab === "asignacion" && cantidadSeleccionados === 0) return;
    setTabActiva(tab as TabAsignacion);
    setRolActivo(null);
  };

  return {
    asignacionesBorrador,
    candidatosFiltrados,
    cantidadSeleccionados,
    esModoEdicion,
    guardarAsignacionesMutation,
    handleCambiarTab,
    handleElegirCandidato,
    handleSeleccionPedidos,
    hayErroresAsignacion,
    hayErroresPedidos,
    idsSeleccionados,
    isErrorPedidos,
    isFetchingCandidatos,
    isFetchingPedidos,
    isLoadingCandidatos,
    isLoadingPedidos,
    paginaPedido,
    pedidoDetalleId,
    pedidosActivos,
    pedidosData,
    puedeGuardar,
    refetchPedidos,
    rolActivo,
    setPaginaPedido,
    setPedidoDetalleId,
    setRolActivo,
    setTabActiva,
    setTerminoBusquedaPedido,
    setTerminoBusquedaUsuario,
    tabActiva,
    terminoBusquedaPedido,
    terminoBusquedaUsuario,
  };
}

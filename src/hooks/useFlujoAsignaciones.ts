import { useState } from "react";
import { useNavigate } from "react-router";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useListadoPaginado } from "@maximilian/hooks/useListadoPaginado";
import { servicioFlujoInforme } from "@maximilian/services/flujo-informe.service";
import { useSeleccionPedidosFlujo } from "@maximilian/hooks/useSeleccionPedidosFlujo";
import {
  ROL_ASIGNACION_MASIVA_POR_TAB,
  TAB_FLUJO_ASIGNACION_INICIAL,
} from "@maximilian/shared/constants/pages/Coordinador/flujo-asignaciones.constants";
import type {
  EtapaFlujoPedido,
  FilaFlujoAsignacion,
  RolFlujoAsignacion,
  TabFlujoAsignacion,
} from "@maximilian/shared/types/flujo-informe.type";

export interface ModalAsignarRolFlujo {
  pedidos: FilaFlujoAsignacion[];
  esMasiva: boolean;
  rol: RolFlujoAsignacion;
}

export function useFlujoAsignaciones() {
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
  const [tabActiva, setTabActiva] = useState<TabFlujoAsignacion>(TAB_FLUJO_ASIGNACION_INICIAL);
  const [ultimaEtapa, setUltimaEtapa] = useState<EtapaFlujoPedido>(TAB_FLUJO_ASIGNACION_INICIAL as EtapaFlujoPedido);
  const [modalAsignarRol, setModalAsignarRol] = useState<ModalAsignarRolFlujo | null>(null);
  const [estaAbiertaNuevaAsignacion, setEstaAbiertaNuevaAsignacion] = useState(false);
  const esTabComplementos = tabActiva === "complementos";
  const etapaConsultada = esTabComplementos ? ultimaEtapa : tabActiva;

  const consultaPedidos = useQuery({
    queryKey: ["flujo-asignaciones", etapaConsultada, paginaActual, busquedaConRetardo],
    queryFn: () =>
      servicioFlujoInforme.listarPorEtapa({
        etapa: etapaConsultada,
        busqueda: busquedaConRetardo || undefined,
        numPag: esTabComplementos ? 1 : paginaActual,
      }),
    placeholderData: keepPreviousData,
  });

  // keepPreviousData conserva los conteos de las tabs, pero las filas mostradas serían las de la tab
  // (o página) anterior: mientras llega la respuesta nueva la tabla muestra el loader.
  const estaCargandoPedidos = consultaPedidos.isLoading || consultaPedidos.isPlaceholderData;
  const seleccion = useSeleccionPedidosFlujo(
    consultaPedidos.isPlaceholderData ? undefined : consultaPedidos.data?.lstPedido,
  );
  const rolAsignacionMasiva = ROL_ASIGNACION_MASIVA_POR_TAB[tabActiva] ?? null;

  const consultaComplementos = useQuery({
    queryKey: ["flujo-complementos", "coordinador", paginaActual, busquedaConRetardo],
    queryFn: () =>
      servicioFlujoInforme.listarComplementos({
        busqueda: busquedaConRetardo || undefined,
        soloPropios: false,
        numPag: paginaActual,
      }),
    enabled: esTabComplementos,
  });

  const invalidarFlujo = async () => {
    await queryClient.invalidateQueries({ queryKey: ["flujo-asignaciones"] });
    await queryClient.invalidateQueries({ queryKey: ["flujo-complementos"] });
  };

  const simularFinalizacionMutation = useMutation({
    mutationFn: (idPedido: number) => servicioFlujoInforme.simularFinalizacionAnalista(idPedido),
    onSuccess: invalidarFlujo,
  });

  const simularEnvioTraductorMutation = useMutation({
    mutationFn: (idPedido: number) => servicioFlujoInforme.simularEnvioTraductor(idPedido),
    onSuccess: invalidarFlujo,
  });

  const simularRechazoMutation = useMutation({
    mutationFn: (idPedido: number) => servicioFlujoInforme.simularRechazoCoordinador(idPedido),
    onSuccess: invalidarFlujo,
  });

  const cambiarTab = (tab: TabFlujoAsignacion) => {
    seleccion.limpiarSeleccion();
    setTabActiva(tab);
    if (tab !== "complementos") setUltimaEtapa(tab);
    reiniciarPagina();
  };

  const totalPaginasActual = esTabComplementos
    ? consultaComplementos.data?.totalPaginas ?? 1
    : consultaPedidos.data?.totalPaginas ?? 1;

  const cambiarPaginaFlujo = (pagina: number) => cambiarPagina(pagina, totalPaginasActual);

  const cambiarBusquedaFlujo = (termino: string) => {
    seleccion.limpiarSeleccion();
    cambiarBusqueda(termino);
  };

  const abrirAsignacionMasiva = () => {
    if (!rolAsignacionMasiva || seleccion.pedidosSeleccionados.length === 0) return;
    setModalAsignarRol({ pedidos: seleccion.pedidosSeleccionados, rol: rolAsignacionMasiva, esMasiva: true });
  };

  const alAsignar = async (idsNoAsignados: number[]) => {
    if (modalAsignarRol?.esMasiva) seleccion.conservarSolo(idsNoAsignados);
    await invalidarFlujo();
  };

  const abrirRevision = (pedido: FilaFlujoAsignacion) => {
    const parametros = new URLSearchParams({
      idInforme: String(pedido.idInformeTraductor ?? 0),
      idInformeOriginal: String(pedido.idInformeAnalista ?? 0),
      idIdioma: String(pedido.idIdioma),
    });
    navigate(`/coordinador/revision/${pedido.idPedido}?${parametros.toString()}`);
  };

  return {
    abrirAsignacionMasiva,
    abrirModalAsignarRol: (pedido: FilaFlujoAsignacion, rol: RolFlujoAsignacion) =>
      setModalAsignarRol({ pedidos: [pedido], rol, esMasiva: false }),
    alAsignar,
    abrirNuevaAsignacion: () => setEstaAbiertaNuevaAsignacion(true),
    abrirRevision,
    cambiarBusqueda: cambiarBusquedaFlujo,
    cambiarPaginaFlujo,
    cambiarSeleccion: seleccion.cambiarSeleccion,
    cambiarTab,
    cerrarModalAsignarRol: () => setModalAsignarRol(null),
    cerrarNuevaAsignacion: () => setEstaAbiertaNuevaAsignacion(false),
    consultaComplementos,
    consultaPedidos,
    conteos: consultaPedidos.data?.conteos,
    esTabComplementos,
    estaAbiertaNuevaAsignacion,
    estaCargandoPedidos,
    idsSeleccionados: seleccion.idsSeleccionados,
    invalidarFlujo,
    limpiarSeleccion: seleccion.limpiarSeleccion,
    modalAsignarRol,
    paginaActual,
    rolAsignacionMasiva,
    simularEnvioTraductorMutation,
    simularFinalizacionMutation,
    simularRechazoMutation,
    tabActiva,
    terminoBusqueda,
    usaDatosSimulados: servicioFlujoInforme.usaDatosSimulados,
  };
}

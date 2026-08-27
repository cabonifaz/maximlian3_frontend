import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { facturacionService } from "@maximilian/services/facturacion.service";
import { CODIGO_PEDIDOS_SIN_GRUPO } from "@maximilian/shared/constants/components/coordinador/agrupar-pedidos-drag-drop.constants";
import { CONFIGURACION_CONSULTA_FACTURACION } from "@maximilian/shared/constants/components/coordinador/facturacion.constants";
import type {
  FiltrosAgruparPedidos,
  LineaFacturaBorrador,
} from "@maximilian/shared/types/agrupar-pedidos-drag-drop.type";
import type { RespuestaListarPedidosConGrupos } from "@maximilian/shared/types/facturacion.type";
import {
  calcularValoresLinea,
  construirLineasBorradorDesdeApi,
  crearLineaPedidosSinGrupoVacia,
  pedidoEsCompatibleConLinea,
} from "@maximilian/shared/utils/agrupar-pedidos-drag-drop.util";
import { formatearFechaIsoLocal } from "@maximilian/shared/utils/fecha.util";

const PEDIDOS_VACIO: RespuestaListarPedidosConGrupos["pedidos"] = [];

const FILTROS_INICIALES: FiltrosAgruparPedidos = {
  fechaInicio: undefined,
  fechaFin: undefined,
  idTipoTramite: undefined,
  idsPais: [],
  idMoneda: undefined,
  idVigencia: undefined,
  busqueda: "",
};

export function useAgruparPedidosDragDrop(idCliente: number, abierto: boolean) {
  const [filtros, setFiltros] = useState<FiltrosAgruparPedidos>(FILTROS_INICIALES);
  const [lineas, setLineas] = useState<LineaFacturaBorrador[]>([]);
  const [idLineaEnfocada, setIdLineaEnfocada] = useState<number | null>(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [datosBase, setDatosBase] = useState<RespuestaListarPedidosConGrupos | undefined>(undefined);

  const fechasCompletas = Boolean(filtros.fechaInicio && filtros.fechaFin);

  const consulta = useQuery({
    ...CONFIGURACION_CONSULTA_FACTURACION,
    queryKey: [
      "facturacion",
      "pedidos-con-grupos",
      idCliente,
      filtros.fechaInicio?.getTime(),
      filtros.fechaFin?.getTime(),
      filtros.idTipoTramite,
      filtros.idsPais,
      filtros.idMoneda,
      filtros.idVigencia,
    ],
    queryFn: () =>
      facturacionService.listarPedidosConGrupos({
        idCliente,
        fchInicio: formatearFechaIsoLocal(filtros.fechaInicio!),
        fchFin: formatearFechaIsoLocal(filtros.fechaFin!),
        idTipoTramite: filtros.idTipoTramite,
        idsPais: filtros.idsPais.length > 0 ? filtros.idsPais : undefined,
        idMoneda: filtros.idMoneda,
        finalizadoEnFecha: filtros.idVigencia === undefined ? undefined : Boolean(filtros.idVigencia),
      }),
    enabled: abierto && idCliente > 0 && fechasCompletas,
  });

  if (consulta.data && consulta.data !== datosBase) {
    setDatosBase(consulta.data);
    setLineas(construirLineasBorradorDesdeApi(consulta.data));
    setIdLineaEnfocada(null);
  }

  const crearLineasMutation = useMutation({
    mutationFn: (lineasAEnviar: LineaFacturaBorrador[]) =>
      facturacionService.crearLineasLote({
        idCliente,
        grupos: lineasAEnviar.map((linea) => ({
          idsPedido: linea.idsPedido,
          codigo: linea.codigo,
          descripcion: linea.descripcion,
          valorUnitario: linea.precio,
          descuento: linea.descuento,
        })),
      }),
  });

  const pedidosTotales = datosBase?.pedidos ?? PEDIDOS_VACIO;

  const lineaEnfocada = useMemo(
    () => lineas.find((linea) => linea.id === idLineaEnfocada) ?? null,
    [lineas, idLineaEnfocada],
  );

  const lineasParaConfirmar = useMemo(
    () => lineas.filter((linea) => linea.seleccionada && linea.idsPedido.length > 0),
    [lineas],
  );

  const pedidosDisponibles = useMemo(() => {
    const busquedaNormalizada = filtros.busqueda.trim().toLowerCase();

    if (busquedaNormalizada) {
      return pedidosTotales.filter((pedido) =>
        pedido.codigo.toLowerCase().includes(busquedaNormalizada)
        || pedido.investigado.toLowerCase().includes(busquedaNormalizada));
    }

    return lineaEnfocada
      ? pedidosTotales.filter((pedido) => lineaEnfocada.idsPedido.includes(pedido.idPedido))
      : pedidosTotales;
  }, [pedidosTotales, filtros.busqueda, lineaEnfocada]);

  const alternarEnfoqueLinea = (id: number) => {
    setIdLineaEnfocada((actual) => (actual === id ? null : id));
  };

  const limpiarEnfoque = () => setIdLineaEnfocada(null);

  const crearLineaVacia = () => {
    const id = lineas.reduce((max, linea) => Math.max(max, linea.id), 0) + 1;
    setLineas((actual) => [
      ...actual,
      { id, codigo: `GRP-${id}`, descripcion: "", precio: 0, descuento: 0, idsPedido: [], seleccionada: true },
    ]);
  };

  const eliminarLinea = (id: number) => {
    const linea = lineas.find((item) => item.id === id);
    if (!linea || linea.codigo === CODIGO_PEDIDOS_SIN_GRUPO) return;
    if (linea.idsPedido.length > 0) {
      moverPedidosAPedidosSinGrupo(linea.idsPedido);
    }
    setLineas((actual) => actual.filter((item) => item.id !== id));
    setIdLineaEnfocada((actual) => (actual === id ? null : actual));
  };

  const actualizarCodigoLinea = (id: number, codigo: string) => {
    setLineas((actual) => actual.map((linea) => (linea.id === id ? { ...linea, codigo } : linea)));
  };

  const actualizarDescripcionLinea = (id: number, descripcion: string) => {
    setLineas((actual) => actual.map((linea) => (linea.id === id ? { ...linea, descripcion } : linea)));
  };

  const agregarPedidoALinea = (idPedido: number, idLineaDestino: number) => {
    const lineaDestino = lineas.find((linea) => linea.id === idLineaDestino);
    const pedidoArrastrado = pedidosTotales.find((pedido) => pedido.idPedido === idPedido);
    if (!lineaDestino || !pedidoArrastrado) return;

    if (lineaDestino.codigo !== CODIGO_PEDIDOS_SIN_GRUPO) {
      const pedidosDestino = pedidosTotales.filter((pedido) => lineaDestino.idsPedido.includes(pedido.idPedido));
      if (!pedidoEsCompatibleConLinea(pedidoArrastrado, pedidosDestino)) {
        toast.error("El pedido tiene precio o moneda distintos a los del grupo.");
        return;
      }
    }

    setLineas((actual) => actual.map((linea) => {
      if (linea.id === idLineaDestino) {
        if (linea.idsPedido.includes(idPedido)) return linea;
        const idsPedido = [...linea.idsPedido, idPedido];
        return { ...linea, idsPedido, ...calcularValoresLinea(idsPedido, pedidosTotales) };
      }
      if (!linea.idsPedido.includes(idPedido)) return linea;
      const idsPedido = linea.idsPedido.filter((id) => id !== idPedido);
      return { ...linea, idsPedido, ...calcularValoresLinea(idsPedido, pedidosTotales) };
    }));
  };

  const moverPedidosAPedidosSinGrupo = (idsPedido: number[]) => {
    if (idsPedido.length === 0) return;
    setLineas((actual) => {
      const limpias = actual.map((linea) => {
        if (!linea.idsPedido.some((id) => idsPedido.includes(id))) return linea;
        const idsPedidoActualizados = linea.idsPedido.filter((id) => !idsPedido.includes(id));
        return { ...linea, idsPedido: idsPedidoActualizados, ...calcularValoresLinea(idsPedidoActualizados, pedidosTotales) };
      });
      const existente = limpias.find((linea) => linea.codigo === CODIGO_PEDIDOS_SIN_GRUPO);
      if (existente) {
        const idsPedidoActualizados = [...new Set([...existente.idsPedido, ...idsPedido])];
        return limpias.map((linea) => (
          linea.id === existente.id
            ? { ...linea, idsPedido: idsPedidoActualizados, ...calcularValoresLinea(idsPedidoActualizados, pedidosTotales) }
            : linea
        ));
      }
      const id = limpias.reduce((max, linea) => Math.max(max, linea.id), 0) + 1;
      return [
        ...limpias,
        {
          ...crearLineaPedidosSinGrupoVacia(id),
          ...calcularValoresLinea(idsPedido, pedidosTotales),
          idsPedido,
        },
      ];
    });
  };

  const moverAPedidosSinGrupo = (idPedido: number) => moverPedidosAPedidosSinGrupo([idPedido]);

  const alternarSeleccionLinea = (id: number) => {
    setLineas((actual) => actual.map((linea) => (
      linea.id === id ? { ...linea, seleccionada: !linea.seleccionada } : linea
    )));
  };

  const quitarPedidoDeTodasLasLineas = (idPedido: number) => {
    setLineas((actual) => actual.map((linea) => {
      if (!linea.idsPedido.includes(idPedido)) return linea;
      const idsPedido = linea.idsPedido.filter((id) => id !== idPedido);
      return { ...linea, idsPedido, ...calcularValoresLinea(idsPedido, pedidosTotales) };
    }));
  };

  const cambiarFiltros = (cambios: Partial<FiltrosAgruparPedidos>) => {
    setFiltros((actual) => ({ ...actual, ...cambios }));
  };

  const reiniciarWorkspace = () => {
    if (!datosBase) return;
    setLineas(construirLineasBorradorDesdeApi(datosBase));
    setIdLineaEnfocada(null);
  };

  const limpiarTodo = () => {
    setFiltros(FILTROS_INICIALES);
    setDatosBase(undefined);
    setLineas([]);
    setIdLineaEnfocada(null);
    setMostrarConfirmacion(false);
    crearLineasMutation.reset();
  };

  const abrirConfirmacion = () => setMostrarConfirmacion(true);
  const cerrarConfirmacion = () => setMostrarConfirmacion(false);

  const confirmarCreacionLineas = async () => {
    await crearLineasMutation.mutateAsync(lineasParaConfirmar);
    setMostrarConfirmacion(false);
  };

  return {
    abrirConfirmacion,
    actualizarCodigoLinea,
    actualizarDescripcionLinea,
    agregarPedidoALinea,
    alternarEnfoqueLinea,
    alternarSeleccionLinea,
    cambiarFiltros,
    cerrarConfirmacion,
    confirmarCreacionLineas,
    crearLineaVacia,
    creandoLineas: crearLineasMutation.isPending,
    eliminarLinea,
    estaCargando: consulta.isLoading,
    fechasCompletas,
    filtros,
    hayError: consulta.isError,
    idLineaEnfocada,
    limpiarEnfoque,
    limpiarTodo,
    lineaEnfocada,
    lineas,
    lineasParaConfirmar,
    mostrarConfirmacion,
    moverAPedidosSinGrupo,
    pedidosDisponibles,
    pedidosTotales,
    quitarPedidoDeTodasLasLineas,
    recargar: consulta.refetch,
    reiniciarWorkspace,
  };
}

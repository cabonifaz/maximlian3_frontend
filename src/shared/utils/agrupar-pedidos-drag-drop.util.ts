import {
  CODIGO_PEDIDOS_SIN_GRUPO,
  DESCRIPCION_PEDIDOS_SIN_GRUPO,
  FORMATO_ARRASTRE_AGRUPAR_PEDIDOS,
} from "@maximilian/shared/constants/components/coordinador/agrupar-pedidos-drag-drop.constants";
import type {
  CargaArrastrePedido,
  FiltrosAgruparPedidos,
  LineaFacturaBorrador,
  PedidoConGrupo,
} from "@maximilian/shared/types/agrupar-pedidos-drag-drop.type";
import type { RespuestaListarPedidosConGrupos } from "@maximilian/shared/types/facturacion.type";
import { convertirTextoAFecha } from "@maximilian/shared/utils/fecha.util";

export function leerCargaArrastre(evento: React.DragEvent): CargaArrastrePedido | null {
  const crudo = evento.dataTransfer.getData(FORMATO_ARRASTRE_AGRUPAR_PEDIDOS);
  if (!crudo) return null;
  try {
    return JSON.parse(crudo) as CargaArrastrePedido;
  } catch {
    return null;
  }
}

export function calcularValoresLinea(
  idsPedido: number[],
  pedidosTotales: PedidoConGrupo[],
): { precio: number; descuento: number } {
  const pedidosIncluidos = pedidosTotales.filter((pedido) => idsPedido.includes(pedido.idPedido));
  if (pedidosIncluidos.length === 0) return { precio: 0, descuento: 0 };

  const precio = pedidosIncluidos.reduce((total, pedido) => total + pedido.precio, 0) / pedidosIncluidos.length;
  const descuento = pedidosIncluidos.reduce((total, pedido) => total + pedido.penalidad, 0);
  return { precio, descuento };
}

export function construirLineasBorradorDesdeApi(
  datos: RespuestaListarPedidosConGrupos,
): LineaFacturaBorrador[] {
  const lineas = datos.grupos.map((grupo) => ({
    id: grupo.idGrupoRecomendado,
    codigo: grupo.codigo,
    descripcion: grupo.descripcion,
    precio: grupo.precio,
    descuento: grupo.descuento,
    idsPedido: datos.pedidos
      .filter((pedido) => pedido.idGrupoRecomendado === grupo.idGrupoRecomendado)
      .map((pedido) => pedido.idPedido),
    seleccionada: true,
  }));

  return asegurarLineaPedidosSinGrupo(lineas);
}

export function crearLineaPedidosSinGrupoVacia(id: number): LineaFacturaBorrador {
  return {
    id,
    codigo: CODIGO_PEDIDOS_SIN_GRUPO,
    descripcion: DESCRIPCION_PEDIDOS_SIN_GRUPO,
    precio: 0,
    descuento: 0,
    idsPedido: [],
    seleccionada: false,
  };
}

export function asegurarLineaPedidosSinGrupo(lineas: LineaFacturaBorrador[]): LineaFacturaBorrador[] {
  if (lineas.some((linea) => linea.codigo === CODIGO_PEDIDOS_SIN_GRUPO)) return lineas;
  const id = lineas.reduce((max, linea) => Math.max(max, linea.id), 0) + 1;
  return [...lineas, crearLineaPedidosSinGrupoVacia(id)];
}

export function pedidoEsCompatibleConLinea(
  pedido: PedidoConGrupo,
  pedidosLinea: PedidoConGrupo[],
): boolean {
  if (pedidosLinea.length === 0) return true;
  const referencia = pedidosLinea[0];
  return (
    referencia.idMoneda === pedido.idMoneda
    && referencia.precio === pedido.precio
  );
}

export function filtrarPedidosLocalmente(
  pedidos: PedidoConGrupo[],
  filtros: FiltrosAgruparPedidos,
): PedidoConGrupo[] {
  const busquedaNormalizada = filtros.busqueda.trim().toLowerCase();

  return pedidos.filter((pedido) => {
    if (filtros.idTipoTramite !== undefined && pedido.idTipoTramite !== filtros.idTipoTramite) return false;
    if (filtros.idsPais.length > 0 && !filtros.idsPais.includes(pedido.idPais)) return false;
    if (filtros.idMoneda !== undefined && pedido.idMoneda !== filtros.idMoneda) return false;

    const fechaPedido = convertirTextoAFecha(pedido.fecha);
    if (filtros.fechaInicio && fechaPedido && fechaPedido < filtros.fechaInicio) return false;
    if (filtros.fechaFin && fechaPedido && fechaPedido > filtros.fechaFin) return false;

    if (!busquedaNormalizada) return true;
    return (
      pedido.codigo.toLowerCase().includes(busquedaNormalizada)
      || pedido.investigado.toLowerCase().includes(busquedaNormalizada)
    );
  });
}

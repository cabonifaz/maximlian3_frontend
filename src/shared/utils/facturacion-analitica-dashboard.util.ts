import type {
  ClientePendienteFacturacionAnaliticaDashboard,
  DetalleFacturacionAnaliticaDashboard,
  EvolucionFacturacionAnaliticaDashboard,
  FiltrosFacturacionAnaliticaDashboard,
  GranularidadTiempoDashboard,
  GrupoEstadoFacturacionAnaliticaDashboard,
  GrupoFacturacionAnaliticaDashboard,
  IndicadoresFacturacionAnaliticaDashboard,
  ResumenClienteFacturacionAnaliticaDashboard,
} from "@maximilian/shared/types/dashboard.type";
import {
  CANTIDAD_MAXIMA_SEGMENTOS_TORTA_PAIS,
  CLAVE_OTROS_PAISES_FACTURACION_ANALITICA_DASHBOARD,
  ETIQUETA_OTROS_PAISES_FACTURACION_ANALITICA_DASHBOARD,
} from "@maximilian/shared/constants/components/gerente/facturacion-analitica-dashboard.constants";
import { formatearFechaIsoLocal } from "@maximilian/shared/utils/fecha.util";
import { obtenerClavePeriodo, obtenerEtiquetaPeriodo } from "@maximilian/shared/utils/dashboard-tiempo.util";

const TIPOS_COMPROBANTE_VENTA = ["Factura", "Boleta"] as const;
const TIPOS_COMPROBANTE_NOTA_CREDITO = ["Nota de Crédito"] as const;
const TIPOS_COMPROBANTE_NOTA_DEBITO = ["Nota de Débito"] as const;

export function filtrarDetalleFacturacionAnalitica(
  filas: DetalleFacturacionAnaliticaDashboard[],
  filtros: FiltrosFacturacionAnaliticaDashboard,
) {
  const fechaDesdeIso = filtros.fechaDesde
    ? formatearFechaIsoLocal(filtros.fechaDesde)
    : undefined;
  const fechaHastaIso = filtros.fechaHasta
    ? formatearFechaIsoLocal(filtros.fechaHasta)
    : undefined;

  return filas.filter((fila) => {
    if (fechaDesdeIso && fila.fechaEmision < fechaDesdeIso) return false;
    if (fechaHastaIso && fila.fechaEmision > fechaHastaIso) return false;
    if (filtros.idCliente !== undefined && fila.idCliente !== filtros.idCliente) return false;
    if (filtros.estado && fila.estado !== filtros.estado) return false;
    if (filtros.pais && fila.pais !== filtros.pais) return false;
    if (filtros.tramite && fila.tramite !== filtros.tramite) return false;
    if (filtros.tipoComprobante && fila.tipoComprobante !== filtros.tipoComprobante) return false;
    return true;
  });
}

export function calcularIndicadoresFacturacionAnalitica(
  filas: DetalleFacturacionAnaliticaDashboard[],
  clientesPendientes: ClientePendienteFacturacionAnaliticaDashboard[],
): IndicadoresFacturacionAnaliticaDashboard {
  const filasVenta = filas.filter((fila) =>
    TIPOS_COMPROBANTE_VENTA.includes(fila.tipoComprobante as (typeof TIPOS_COMPROBANTE_VENTA)[number]),
  );

  return {
    totalFacturado: sumarPor(filasVenta, (fila) => fila.montoFacturado),
    montoPendienteFacturar: sumarPor(clientesPendientes, (cliente) => cliente.montoPendienteFacturar),
    cantidadPedidosFacturados: sumarPor(filasVenta, (fila) => fila.cantidadPedidos),
    cantidadPedidosPendientes: sumarPor(clientesPendientes, (cliente) => cliente.cantidadPedidosPendientes),
    totalNotasCredito: sumarPor(
      filas.filter((fila) => TIPOS_COMPROBANTE_NOTA_CREDITO.includes(fila.tipoComprobante as (typeof TIPOS_COMPROBANTE_NOTA_CREDITO)[number])),
      (fila) => Math.abs(fila.montoFacturado),
    ),
    totalNotasDebito: sumarPor(
      filas.filter((fila) => TIPOS_COMPROBANTE_NOTA_DEBITO.includes(fila.tipoComprobante as (typeof TIPOS_COMPROBANTE_NOTA_DEBITO)[number])),
      (fila) => Math.abs(fila.montoFacturado),
    ),
    monedaIcono: filas[0]?.monedaIcono ?? clientesPendientes[0]?.monedaIcono ?? "",
  };
}

export function agruparFacturacionPorTramite(
  filas: DetalleFacturacionAnaliticaDashboard[],
): GrupoFacturacionAnaliticaDashboard[] {
  return agruparPorClave(filas, (fila) => fila.tramite);
}

export function agruparFacturacionPorPaisTop5(
  filas: DetalleFacturacionAnaliticaDashboard[],
): GrupoFacturacionAnaliticaDashboard[] {
  const grupos = agruparPorClave(filas, (fila) => fila.pais);
  if (grupos.length <= CANTIDAD_MAXIMA_SEGMENTOS_TORTA_PAIS) return grupos;

  const principales = grupos.slice(0, CANTIDAD_MAXIMA_SEGMENTOS_TORTA_PAIS);
  const resto = grupos.slice(CANTIDAD_MAXIMA_SEGMENTOS_TORTA_PAIS);

  return [
    ...principales,
    {
      clave: CLAVE_OTROS_PAISES_FACTURACION_ANALITICA_DASHBOARD,
      etiqueta: ETIQUETA_OTROS_PAISES_FACTURACION_ANALITICA_DASHBOARD,
      cantidadPedidos: sumarPor(resto, (grupo) => grupo.cantidadPedidos),
      montoFacturado: sumarPor(resto, (grupo) => grupo.montoFacturado),
    },
  ];
}

export function agruparFacturacionPorEstado(
  filas: DetalleFacturacionAnaliticaDashboard[],
): GrupoEstadoFacturacionAnaliticaDashboard[] {
  const grupos = new Map<string, GrupoEstadoFacturacionAnaliticaDashboard>();

  filas.forEach((fila) => {
    const acumulado = grupos.get(fila.estado);
    if (acumulado) {
      acumulado.cantidadFacturas += 1;
      acumulado.montoFacturado += fila.montoFacturado;
      return;
    }

    grupos.set(fila.estado, {
      estado: fila.estado,
      cantidadFacturas: 1,
      montoFacturado: fila.montoFacturado,
    });
  });

  return [...grupos.values()].sort((a, b) => b.cantidadFacturas - a.cantidadFacturas);
}

export function agruparEvolucionFacturacion(
  filas: DetalleFacturacionAnaliticaDashboard[],
  granularidad: GranularidadTiempoDashboard,
): EvolucionFacturacionAnaliticaDashboard[] {
  const totalesPorPeriodo = new Map<string, { montoFacturado: number; cantidadPedidos: number }>();

  filas.forEach((fila) => {
    const periodo = obtenerClavePeriodo(fila.fechaEmision, granularidad);
    const acumulado = totalesPorPeriodo.get(periodo) ?? { montoFacturado: 0, cantidadPedidos: 0 };
    totalesPorPeriodo.set(periodo, {
      montoFacturado: acumulado.montoFacturado + fila.montoFacturado,
      cantidadPedidos: acumulado.cantidadPedidos + fila.cantidadPedidos,
    });
  });

  return [...totalesPorPeriodo.entries()]
    .sort(([periodoA], [periodoB]) => periodoA.localeCompare(periodoB))
    .map(([periodo, totales]) => ({
      periodo,
      etiqueta: obtenerEtiquetaPeriodo(periodo, granularidad),
      ...totales,
    }));
}

export function construirResumenClientesFacturacionAnalitica(
  filas: DetalleFacturacionAnaliticaDashboard[],
  clientesPendientes: ClientePendienteFacturacionAnaliticaDashboard[],
): ResumenClienteFacturacionAnaliticaDashboard[] {
  const porCliente = new Map<number, ResumenClienteFacturacionAnaliticaDashboard>();

  filas.forEach((fila) => {
    const acumulado = porCliente.get(fila.idCliente);
    if (acumulado) {
      acumulado.totalFacturado += fila.montoFacturado;
      acumulado.cantidadPedidos += fila.cantidadPedidos;
      return;
    }

    porCliente.set(fila.idCliente, {
      idCliente: fila.idCliente,
      cliente: fila.cliente,
      totalFacturado: fila.montoFacturado,
      cantidadPedidos: fila.cantidadPedidos,
      montoPendienteFacturar: 0,
      monedaIcono: fila.monedaIcono,
    });
  });

  clientesPendientes.forEach((cliente) => {
    const existente = porCliente.get(cliente.idCliente);
    if (existente) {
      existente.montoPendienteFacturar = cliente.montoPendienteFacturar;
      return;
    }

    porCliente.set(cliente.idCliente, {
      idCliente: cliente.idCliente,
      cliente: cliente.cliente,
      totalFacturado: 0,
      cantidadPedidos: 0,
      montoPendienteFacturar: cliente.montoPendienteFacturar,
      monedaIcono: cliente.monedaIcono,
    });
  });

  return [...porCliente.values()].sort((a, b) => b.totalFacturado - a.totalFacturado);
}

function agruparPorClave(
  filas: DetalleFacturacionAnaliticaDashboard[],
  obtenerClave: (fila: DetalleFacturacionAnaliticaDashboard) => string,
): GrupoFacturacionAnaliticaDashboard[] {
  const grupos = new Map<string, GrupoFacturacionAnaliticaDashboard>();

  filas.forEach((fila) => {
    const clave = obtenerClave(fila);
    const acumulado = grupos.get(clave);
    if (acumulado) {
      acumulado.cantidadPedidos += fila.cantidadPedidos;
      acumulado.montoFacturado += fila.montoFacturado;
      return;
    }

    grupos.set(clave, {
      clave,
      etiqueta: clave,
      cantidadPedidos: fila.cantidadPedidos,
      montoFacturado: fila.montoFacturado,
    });
  });

  return [...grupos.values()].sort((a, b) => b.montoFacturado - a.montoFacturado);
}

function sumarPor<T>(items: T[], obtenerValor: (item: T) => number) {
  return items.reduce((total, item) => total + obtenerValor(item), 0);
}

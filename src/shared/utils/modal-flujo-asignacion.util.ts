import type { AssignmentRoleSelection } from "@maximilian/shared/types/asignacion.type";
import type { PedidoListEntry } from "@maximilian/shared/types/pedido.type";

export function normalizarPedidoAsignacion(pedido: PedidoListEntry): PedidoListEntry {
  return {
    ...pedido,
    cliente: pedido.cliente || "-",
    investigado: pedido.investigado || "-",
    idioma: pedido.idioma || "-",
    tipoTramite: pedido.tipoTramite || "-",
    descripcionEstado: pedido.descripcionEstado || "-",
    colorLetra: pedido.colorLetra || "#64748b",
    colorFondo: pedido.colorFondo || "#f1f5f9",
    vigencia: pedido.vigencia || "-",
  };
}

export function obtenerInicialesAsignado(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("") || "?";
}

export function tieneAsignado(nombre?: string) {
  return !!nombre && nombre !== "-" && nombre !== "Sin Asignacion";
}

export function convertirPedidoAAsignacionesIniciales(pedido: PedidoListEntry): AssignmentRoleSelection[] {
  return [
    {
      role: "analyst",
      assignee: tieneAsignado(pedido.analista)
        ? {
            idUsuario: 0,
            nombre: pedido.analista!,
            iniciales: obtenerInicialesAsignado(pedido.analista!),
            rol: "analyst",
            cantidadAsignaciones: 0,
          }
        : null,
    },
    {
      role: "translator",
      assignee: tieneAsignado(pedido.traductor)
        ? {
            idUsuario: 0,
            nombre: pedido.traductor!,
            iniciales: obtenerInicialesAsignado(pedido.traductor!),
            rol: "translator",
            cantidadAsignaciones: 0,
          }
        : null,
    },
  ];
}

export function tieneAsignacionesEnPedido(pedido: PedidoListEntry) {
  return (
    tieneAsignado(pedido.analista)
    || tieneAsignado(pedido.traductor)
    || !!pedido.idAsignacion
    || pedido.asignaciones.length > 0
  );
}

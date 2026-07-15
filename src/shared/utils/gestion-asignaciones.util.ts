import { ID_ROL_ANALISTA, ID_ROL_TRADUCTOR } from "@maximilian/shared/constants/pages/Coordinador/gestion-asignaciones.constants";
import type { AssignmentOrderEntry, AssignmentRoleSelection } from "@maximilian/shared/types/asignacion.type";
import type { PedidoListEntry } from "@maximilian/shared/types/pedido.type";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

export function tieneAsignadoAsignacion(nombre?: string) {
  return !!nombre && nombre !== "-" && nombre !== "Sin Asignacion";
}

export function obtenerInicialesAsignacion(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("") || "?";
}

export function construirOpcionesEliminacionAsignacion(asignacion: AssignmentOrderEntry): EntradaTablaMaestra[] {
  const opciones: EntradaTablaMaestra[] = [];

  if (tieneAsignadoAsignacion(asignacion.analista) && asignacion.analistaIdAsignacion) {
    opciones.push({
      idEmpresa: 0,
      idTablaMaestra: null,
      idMaestro: 0,
      descripcion: "",
      num1: asignacion.analistaIdAsignacion,
      num2: ID_ROL_ANALISTA,
      num3: null,
      string1: `Analista - ${asignacion.analista}`,
      string2: null,
      string3: null,
      date1: null,
      date2: null,
      date3: null,
    });
  }

  if (tieneAsignadoAsignacion(asignacion.traductor) && asignacion.traductorIdAsignacion) {
    opciones.push({
      idEmpresa: 0,
      idTablaMaestra: null,
      idMaestro: 0,
      descripcion: "",
      num1: asignacion.traductorIdAsignacion,
      num2: ID_ROL_TRADUCTOR,
      num3: null,
      string1: `Traductor - ${asignacion.traductor}`,
      string2: null,
      string3: null,
      date1: null,
      date2: null,
      date3: null,
    });
  }

  return opciones;
}

export function convertirAsignacionAPedido(asignacion: AssignmentOrderEntry): PedidoListEntry {
  return {
    idPedido: asignacion.idPedido,
    idAsignacion: asignacion.idAsignacion,
    codigo: "",
    idCliente: 0,
    cliente: asignacion.cliente,
    investigado: asignacion.investigado,
    idIdioma: asignacion.idIdioma ?? 0,
    idioma: asignacion.idiomaInforme || "-",
    tipoTramite: asignacion.tipoTramite || "-",
    analista: asignacion.analista,
    traductor: asignacion.traductor,
    logoImprimible: false,
    estado: asignacion.idEstado ?? 0,
    descripcionEstado: asignacion.estado || "-",
    colorLetra: asignacion.estadoColorLetra || "#475569",
    colorFondo: asignacion.estadoColorFondo || "#f1f5f9",
    vigencia: asignacion.porVencerTexto || "-",
    asignaciones: [],
  };
}

export function convertirAsignacionAAsignacionesIniciales(asignacion: AssignmentOrderEntry): AssignmentRoleSelection[] {
  return [
    {
      role: "analyst",
      assignee: tieneAsignadoAsignacion(asignacion.analista)
        ? {
            idUsuario: 0,
            nombre: asignacion.analista!,
            iniciales: obtenerInicialesAsignacion(asignacion.analista!),
            rol: "analyst",
            cantidadAsignaciones: 0,
          }
        : null,
    },
    {
      role: "translator",
      assignee: tieneAsignadoAsignacion(asignacion.traductor)
        ? {
            idUsuario: 0,
            nombre: asignacion.traductor!,
            iniciales: obtenerInicialesAsignacion(asignacion.traductor!),
            rol: "translator",
            cantidadAsignaciones: 0,
          }
        : null,
    },
  ];
}

export function esNuevaAsignacionDesdeListado(asignacion: AssignmentOrderEntry) {
  const estadoNormalizado = (asignacion.estado || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  return asignacion.idEstado === 4 && estadoNormalizado === "sin asignacion";
}

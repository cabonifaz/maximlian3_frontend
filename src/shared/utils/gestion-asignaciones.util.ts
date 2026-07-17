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
  const idsAgregados = new Set<number>();
  const agregarOpcion = (idAsignacion: number | undefined, idRol: number, etiqueta: string) => {
    if (!idAsignacion || idsAgregados.has(idAsignacion)) return;

    idsAgregados.add(idAsignacion);
    opciones.push({
      idEmpresa: 0,
      idTablaMaestra: null,
      idMaestro: 0,
      descripcion: "",
      num1: idAsignacion,
      num2: idRol,
      num3: null,
      string1: etiqueta,
      string2: null,
      string3: null,
      date1: null,
      date2: null,
      date3: null,
    });
  };

  if (tieneAsignadoAsignacion(asignacion.analista) && asignacion.analistaIdAsignacion) {
    agregarOpcion(
      asignacion.analistaIdAsignacion,
      ID_ROL_ANALISTA,
      `Analista - ${asignacion.analista}`,
    );
  }

  if (tieneAsignadoAsignacion(asignacion.traductor) && asignacion.traductorIdAsignacion) {
    agregarOpcion(
      asignacion.traductorIdAsignacion,
      ID_ROL_TRADUCTOR,
      `Traductor - ${asignacion.traductor}`,
    );
  }

  if (opciones.length === 0) {
    const idAsignacion = asignacion.idAsignacion
      ?? asignacion.analistaIdAsignacion
      ?? asignacion.traductorIdAsignacion;

    agregarOpcion(
      idAsignacion,
      0,
      asignacion.estado ? `Asignacion - ${asignacion.estado}` : "Asignacion",
    );
  }

  return opciones;
}

export function tieneIdAsignacionEliminable(asignacion: AssignmentOrderEntry) {
  return Boolean(
    asignacion.idAsignacion
      ?? asignacion.analistaIdAsignacion
      ?? asignacion.traductorIdAsignacion,
  );
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

import maximilianService from "./maximilianService";
import type { ApiResponse } from "@maximilian/shared/types/api.type";
import { MessageType } from "@maximilian/shared/types/api.type";
import type {
  AssignmentCandidate,
  AssignmentCandidateListParams,
  AssignmentListParams,
  AssignmentListResponse,
  AssignmentOrderEntry,
  AssignmentRole,
  AssignmentRoleSelection,
  CreateAssignmentRequest,
  DeleteAssignmentRequest,
  SaveAssignmentsRequest,
  UpdateAssignmentRequest,
} from "@maximilian/shared/types/assignment.type";

type RegistroGenerico = Record<string, unknown>;

const ESTADO_ASIGNACION_ANALISTA = 1;
const ESTADO_ASIGNACION_TRADUCTOR = 2;
const IDS_ROL_POR_TIPO: Record<AssignmentRole, number> = {
  translator: 3,
  analyst: 4,
};

function esRegistroGenerico(valor: unknown): valor is RegistroGenerico {
  return typeof valor === "object" && valor !== null;
}

function obtenerNumero(...valores: unknown[]): number | undefined {
  for (const valor of valores) {
    if (typeof valor === "number" && Number.isFinite(valor)) return valor;
    if (typeof valor === "string" && valor.trim() !== "") {
      const numero = Number(valor);
      if (Number.isFinite(numero)) return numero;
    }
  }
  return undefined;
}

function obtenerTexto(...valores: unknown[]): string | undefined {
  for (const valor of valores) {
    if (typeof valor === "string" && valor.trim() !== "") return valor.trim();
  }
  return undefined;
}

function obtenerBooleano(...valores: unknown[]): boolean | undefined {
  for (const valor of valores) {
    if (typeof valor === "boolean") return valor;
    if (typeof valor === "string") {
      if (valor.toLowerCase() === "true") return true;
      if (valor.toLowerCase() === "false") return false;
    }
  }
  return undefined;
}

function obtenerLista(registro: RegistroGenerico, claves: string[]): unknown[] {
  for (const clave of claves) {
    const valor = registro[clave];
    if (Array.isArray(valor)) return valor;
  }
  return [];
}

function obtenerIniciales(nombreCompleto: string): string {
  const partes = nombreCompleto
    .split(/\s+/)
    .map((parte) => parte.trim())
    .filter(Boolean)
    .slice(0, 2);

  return partes.map((parte) => parte.charAt(0).toUpperCase()).join("") || "?";
}

function separarNombreCompleto(nombreCompleto: string) {
  const partes = nombreCompleto
    .split(/\s+/)
    .map((parte) => parte.trim())
    .filter(Boolean);

  if (partes.length <= 2) {
    return {
      nombres: nombreCompleto,
      apellidos: "",
    };
  }

  return {
    nombres: partes.slice(0, -2).join(" "),
    apellidos: partes.slice(-2).join(" "),
  };
}

function normalizarRol(valor: unknown, esTraductor?: boolean): AssignmentRole {
  const texto = typeof valor === "string" ? valor.toLowerCase() : "";
  if (texto.includes("trad")) return "translator";
  if (texto.includes("anal")) return "analyst";
  return esTraductor ? "translator" : "analyst";
}

function extraerResultado<T>(respuesta: ApiResponse<T>): T {
  if (respuesta.idTipoMensaje !== MessageType.SUCCESS) {
    throw new Error(respuesta.mensaje || "No se pudo completar la operación de asignaciones");
  }
  return respuesta.result;
}

function normalizarVigencia(registro: RegistroGenerico) {
  const textoOriginal = obtenerTexto(
    registro.porVencerTexto,
    registro.descripcionVigencia,
    registro.porVencer,
    registro.vigenciaTexto,
    registro.vigencia,
  );
  const diasNumericos = obtenerNumero(
    registro.diasPorVencer,
    registro.diasVigencia,
    registro.vigenciaDias,
    registro.vigencia,
  );
  const esVencido =
    obtenerBooleano(registro.estaVencido, registro.esVencido) ??
    (textoOriginal ? textoOriginal.toLowerCase().includes("venc") : false) ??
    false;

  const diasTexto = diasNumericos !== undefined
    ? `${Math.abs(diasNumericos)} ${Math.abs(diasNumericos) === 1 ? "dia" : "dias"}`
    : textoOriginal?.match(/\d+/)?.[0]
      ? `${textoOriginal.match(/\d+/)?.[0]} dias`
      : undefined;

  return {
    porVencerTexto: textoOriginal || (diasTexto ?? "-"),
    porVencerColor: obtenerTexto(registro.porVencerColor, registro.colorLetra, registro.colorTextoVigencia)
      || (esVencido ? "#dc2626" : "#166534"),
    porVencerFondo: obtenerTexto(registro.porVencerFondo, registro.colorFondo, registro.colorFondoVigencia)
      || (esVencido ? "#fef2f2" : "#ecfdf5"),
    estaVencido: esVencido,
    diasTexto,
  };
}

function normalizarPedido(registro: unknown): AssignmentOrderEntry {
  const fila = esRegistroGenerico(registro) ? registro : {};
  const vigencia = normalizarVigencia(fila);

  return {
    idAsignacion: obtenerNumero(fila.idAsignacion, fila.IdAsignacion),
    idPedido: obtenerNumero(fila.idPedido, fila.IdPedido)!,
    idIdioma: obtenerNumero(fila.idIdioma, fila.IdIdioma),
    cliente: obtenerTexto(fila.cliente, fila.nombreCliente, fila.Cliente) || "-",
    investigado: obtenerTexto(
      fila.investigado,
      fila.investigarRazonSocialNombres,
      fila.nombreInvestigado,
      fila.Investigado,
    ) || "-",
    analista: obtenerTexto(
      fila.analista,
      fila.nombreAnalista,
      fila.usuarioAnalista,
      fila.analistaAsignado,
    ) || "-",
    traductor: obtenerTexto(
      fila.traductor,
      fila.nombreTraductor,
      fila.usuarioTraductor,
      fila.traductorAsignado,
    ) || "-",
    idEstado: obtenerNumero(fila.idEstado, fila.IdEstado),
    estado: obtenerTexto(
      fila.estado,
      fila.descripcionEstado,
      fila.nombreEstado,
      fila.estadoAsignacion,
    ) || "-",
    estadoColorLetra: obtenerTexto(
      fila.estadoColorLetra,
      fila.colorLetraEstado,
      fila.colorLetra,
    ) || "#475569",
    estadoColorFondo: obtenerTexto(
      fila.estadoColorFondo,
      fila.colorFondoEstado,
      fila.colorFondo,
    ) || "#f1f5f9",
    idiomaInforme: obtenerTexto(fila.idiomaInforme, fila.idioma, fila.descripcionIdioma, fila.Idioma) || "-",
    tipoTramite: obtenerTexto(
      fila.tipoTramite,
      fila.tipoServicio,
      fila.descripcionTipoTramite,
      fila.TipoTramite,
    ) || "-",
    diasMin: obtenerNumero(fila.diasMin, fila.diasMinimos, fila.minDias) ?? 0,
    diasMax: obtenerNumero(fila.diasMax, fila.diasMaximos, fila.maxDias) ?? 0,
    porVencerTexto: vigencia.porVencerTexto,
    porVencerColor: vigencia.porVencerColor,
    porVencerFondo: vigencia.porVencerFondo,
  };
}

function normalizarCandidato(registro: unknown, role: AssignmentRole): AssignmentCandidate {
  const fila = esRegistroGenerico(registro) ? registro : {};
  const nombre = obtenerTexto(
    fila.nombre,
    fila.nombreCompleto,
    fila.nombresCompletos,
    [fila.nombres, fila.apellidoPaterno, fila.apellidoMaterno].filter(Boolean).join(" "),
  ) || "Usuario";
  const { nombres, apellidos } = separarNombreCompleto(nombre);
  const rol = normalizarRol(
    obtenerTexto(fila.rol, fila.nombreRol, fila.descripcionRol),
    role === "translator",
  );

  return {
    idUsuario: obtenerNumero(fila.idUsuario, fila.IdUsuario)!,
    idRolAsignado: obtenerNumero(fila.idRol, fila.idRolAsignado, fila.IdRol, fila.IdRolAsignado) ?? IDS_ROL_POR_TIPO[rol],
    nombre,
    nombres,
    apellidos,
    cantidadIdiomas: obtenerNumero(
      fila.cantidadIdiomas,
      fila.cantIdiomas,
      fila.numeroIdiomas,
      fila.totalIdiomas,
    ) ?? 0,
    iniciales: obtenerTexto(fila.iniciales, fila.avatar) || obtenerIniciales(nombre),
    rol,
    cantidadAsignaciones: obtenerNumero(
      fila.cantidadAsignaciones,
      fila.totalAsignaciones,
      fila.asignacionesActivas,
      fila.numeroAsignaciones,
    ) ?? 0,
  };
}

function normalizarListaAsignaciones(resultado: unknown): AssignmentListResponse {
  if (Array.isArray(resultado)) {
    return {
      lstPedido: resultado.map(normalizarPedido),
      totalRegistros: resultado.length,
      totalPaginas: 1,
    };
  }

  const registro = esRegistroGenerico(resultado) ? resultado : {};
  const lista = obtenerLista(registro, ["lstPedido", "lstAsignacion", "lstAsignaciones", "lista", "result"]);

  return {
    lstPedido: lista.map(normalizarPedido),
    totalRegistros: obtenerNumero(registro.totalRegistros, registro.TotalRegistros, lista.length) ?? 0,
    totalPaginas: obtenerNumero(registro.totalPaginas, registro.TotalPaginas, 1) ?? 1,
  };
}

function construirPayloadCreacion(
  idPedidos: number[],
  assignments: AssignmentRoleSelection[],
): CreateAssignmentRequest {
  const asignados = assignments
    .filter((assignment) => (assignment.assignee?.idUsuario ?? 0) > 0)
    .map((assignment) => {
      const idRolAsignado = assignment.assignee?.idRolAsignado ?? IDS_ROL_POR_TIPO[assignment.role];

      if (!idRolAsignado) {
        throw new Error(`No se pudo identificar el rol para ${assignment.assignee?.nombre}`);
      }

      return {
        idUsuarioAsignado: assignment.assignee!.idUsuario,
        idRolAsignado,
        idEstado:
          assignment.role === "translator"
            ? ESTADO_ASIGNACION_TRADUCTOR
            : ESTADO_ASIGNACION_ANALISTA,
      };
    });

  return {
    idsPedido: idPedidos,
    asignados,
  };
}

export const assignmentService = {
  list: async (params: AssignmentListParams): Promise<AssignmentListResponse> => {
    const { data } = await maximilianService.get<ApiResponse<unknown>>("/api/Asignacion/listar", {
      params: {
        busqueda: params.busqueda,
        idEstado: params.idEstado,
        numPag: params.numPag,
      },
    });

    return normalizarListaAsignaciones(extraerResultado(data));
  },

  getById: async (idAsignacion: number): Promise<AssignmentOrderEntry | null> => {
    const { data } = await maximilianService.get<ApiResponse<unknown>>("/api/Asignacion/obtener", {
      params: { idAsignacion },
    });

    const resultado = extraerResultado(data);
    const registro = Array.isArray(resultado) ? resultado[0] : resultado;
    return registro ? normalizarPedido(registro) : null;
  },

  create: async (payload: CreateAssignmentRequest): Promise<void> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/Asignacion/crear", payload);
    extraerResultado(data);
  },

  update: async (payload: UpdateAssignmentRequest): Promise<void> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/Asignacion/editar", payload);
    extraerResultado(data);
  },

  delete: async (payload: DeleteAssignmentRequest): Promise<void> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/Asignacion/eliminar", payload);
    extraerResultado(data);
  },

  listCandidates: async ({ role, filtro, idiomasPedido }: AssignmentCandidateListParams): Promise<AssignmentCandidate[]> => {
    const idiomasUnicos = Array.from(
      new Set(
        (idiomasPedido ?? []).filter((idIdioma): idIdioma is number => Number.isFinite(idIdioma)),
      ),
    );

    const { data } = await maximilianService.get<ApiResponse<unknown>>("/api/Usuario/listaCortaAsignacion", {
      params: {
        idRolFiltro: IDS_ROL_POR_TIPO[role],
        filtro,
        esTraductor: role === "translator",
        idiomasPedido: idiomasUnicos,
      },
      paramsSerializer: {
        indexes: null,
      },
    });

    const resultado = extraerResultado(data);
    const lista = Array.isArray(resultado)
      ? resultado
      : obtenerLista(esRegistroGenerico(resultado) ? resultado : {}, [
        "lstUsuario",
        "lstUsuarios",
        "lstAsignacion",
        "lista",
        "result",
      ]);

    return lista
      .map((item) => normalizarCandidato(item, role))
      .sort((a, b) => {
        if (a.cantidadAsignaciones !== b.cantidadAsignaciones) {
          return a.cantidadAsignaciones - b.cantidadAsignaciones;
        }
        return (a.apellidos || a.nombre).localeCompare(b.apellidos || b.nombre, "es");
      });
  },

  saveAssignments: async ({ idPedidos, assignments }: SaveAssignmentsRequest): Promise<AssignmentRoleSelection[]> => {
    const payload = construirPayloadCreacion(idPedidos, assignments);

    await assignmentService.create(payload);

    return assignments;
  },
};

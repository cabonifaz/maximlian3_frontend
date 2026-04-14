export type AssignmentRole = "analyst" | "translator";

export interface AssignmentOrderEntry {
  idAsignacion?: number;
  idPedido: number;
  idIdioma?: number;
  cliente: string;
  investigado: string;
  analista?: string;
  traductor?: string;
  idEstado?: number;
  estado?: string;
  estadoColorLetra?: string;
  estadoColorFondo?: string;
  idiomaInforme: string;
  tipoTramite: string;
  diasMin: number;
  diasMax: number;
  porVencerTexto: string;
  porVencerColor: string;
  porVencerFondo: string;
}

export interface AssignmentListParams {
  busqueda?: string;
  idEstado?: number;
  numPag?: number;
}

export interface AssignmentListResponse {
  lstPedido: AssignmentOrderEntry[];
  totalRegistros: number;
  totalPaginas: number;
}

export interface AssignmentCandidate {
  idUsuario: number;
  idRolAsignado?: number;
  nombre: string;
  nombres?: string;
  apellidos?: string;
  cantidadIdiomas?: number;
  iniciales: string;
  rol: AssignmentRole;
  cantidadAsignaciones: number;
}

export interface AssignmentRoleSelection {
  role: AssignmentRole;
  assignee: AssignmentCandidate | null;
}

export interface SaveAssignmentsRequest {
  idPedidos: number[];
  assignments: AssignmentRoleSelection[];
}

export interface CreateAssignmentRequest {
  idUsuarioAsignado: number;
  idRolAsignado: number;
  idEstado: number;
  idsPedido: number[];
}

export interface UpdateAssignmentRequest {
  idUsuarioAsignado: number;
  idsPedido: number[];
}

export interface DeleteAssignmentRequest {
  idAsignacion: number;
}

export interface AssignmentCandidateListParams {
  role: AssignmentRole;
  filtro?: string;
  idiomasPedido?: number[];
}

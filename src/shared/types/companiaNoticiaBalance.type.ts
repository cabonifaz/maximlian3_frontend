import type { DetalleCuentasBalanceAnalista } from "./investigacion.type";

export interface CompaniaNoticiaBalanceListParams {
  idCompania?: number;
  busqueda?: string;
  numPag?: number;
}

export interface CompaniaNoticiaBalanceObtenerParams {
  idInformeBalance?: number;
  idCompania?: number;
}

export interface CompaniaNoticiaBalanceListaItem {
  idInformeBalance: number;
  idCompania: number;
  compania: string;
  pais: string;
  fecha: string;
  fechaFin?: string;
  tipo: string;
  estado: "Vigente" | "Expirado";
  detalleCuentas?: DetalleCuentasBalanceAnalista;
}

export interface CompaniaNoticiaBalanceListResponse {
  lstCompaniaNoticiaBalance: CompaniaNoticiaBalanceListaItem[];
  totalRegistros: number;
  totalPaginas: number;
}

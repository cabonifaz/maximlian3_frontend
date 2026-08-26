import type {
  ColaboradorDesempenoDashboard,
  InformeColaboradorDesempenoDashboard,
  RolColaboradorDesempenoDashboard,
} from "@maximilian/shared/types/dashboard.type";
import type { TableColumn } from "@maximilian/components/common/CustomTabla";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

export const COLABORADORES_DESEMPENO_DASHBOARD_MOCK: ColaboradorDesempenoDashboard[] = [
  { idColaborador: 1, colaborador: "Ana Ramírez", rol: "Analista", iniciales: "AR", colorLetra: "#2563eb", colorFondo: "#dbeafe" },
  { idColaborador: 2, colaborador: "Carlos Vega", rol: "Analista", iniciales: "CV", colorLetra: "#7c3aed", colorFondo: "#ede9fe" },
  { idColaborador: 3, colaborador: "Diana Flores", rol: "Analista", iniciales: "DF", colorLetra: "#059669", colorFondo: "#d1fae5" },
  { idColaborador: 4, colaborador: "Miguel Torres", rol: "Traductor", iniciales: "MT", colorLetra: "#d97706", colorFondo: "#fef3c7" },
  { idColaborador: 5, colaborador: "Sofía Castro", rol: "Traductor", iniciales: "SC", colorLetra: "#db2777", colorFondo: "#fce7f3" },
  { idColaborador: 6, colaborador: "Luis Herrera", rol: "Traductor", iniciales: "LH", colorLetra: "#0891b2", colorFondo: "#cffafe" },
];

export const INFORMES_COLABORADORES_DASHBOARD_MOCK: InformeColaboradorDesempenoDashboard[] = [
  { id: 1, idColaborador: 1, fechaEntrega: "2026-01-06", esTardio: false, tieneObservaciones: false, tieneInformacionFinanciera: true },
  { id: 2, idColaborador: 1, fechaEntrega: "2026-02-10", esTardio: false, tieneObservaciones: true, tieneInformacionFinanciera: false },
  { id: 3, idColaborador: 1, fechaEntrega: "2026-03-17", esTardio: true, tieneObservaciones: false, tieneInformacionFinanciera: true },
  { id: 4, idColaborador: 1, fechaEntrega: "2026-05-12", esTardio: false, tieneObservaciones: false, tieneInformacionFinanciera: false },
  { id: 5, idColaborador: 1, fechaEntrega: "2026-06-16", esTardio: false, tieneObservaciones: false, tieneInformacionFinanciera: true },
  { id: 6, idColaborador: 1, fechaEntrega: "2026-07-22", esTardio: false, tieneObservaciones: false, tieneInformacionFinanciera: true },

  { id: 7, idColaborador: 2, fechaEntrega: "2026-01-09", esTardio: true, tieneObservaciones: true, tieneInformacionFinanciera: false },
  { id: 8, idColaborador: 2, fechaEntrega: "2026-02-16", esTardio: false, tieneObservaciones: false, tieneInformacionFinanciera: true },
  { id: 9, idColaborador: 2, fechaEntrega: "2026-03-24", esTardio: true, tieneObservaciones: false, tieneInformacionFinanciera: false },
  { id: 10, idColaborador: 2, fechaEntrega: "2026-04-23", esTardio: false, tieneObservaciones: true, tieneInformacionFinanciera: false },
  { id: 11, idColaborador: 2, fechaEntrega: "2026-06-02", esTardio: false, tieneObservaciones: true, tieneInformacionFinanciera: false },
  { id: 12, idColaborador: 2, fechaEntrega: "2026-07-08", esTardio: true, tieneObservaciones: true, tieneInformacionFinanciera: true },

  { id: 13, idColaborador: 3, fechaEntrega: "2026-01-14", esTardio: false, tieneObservaciones: false, tieneInformacionFinanciera: true },
  { id: 14, idColaborador: 3, fechaEntrega: "2026-02-17", esTardio: true, tieneObservaciones: true, tieneInformacionFinanciera: true },
  { id: 15, idColaborador: 3, fechaEntrega: "2026-03-24", esTardio: false, tieneObservaciones: false, tieneInformacionFinanciera: true },
  { id: 16, idColaborador: 3, fechaEntrega: "2026-05-05", esTardio: false, tieneObservaciones: true, tieneInformacionFinanciera: false },
  { id: 17, idColaborador: 3, fechaEntrega: "2026-06-09", esTardio: true, tieneObservaciones: false, tieneInformacionFinanciera: true },
  { id: 18, idColaborador: 3, fechaEntrega: "2026-07-15", esTardio: false, tieneObservaciones: false, tieneInformacionFinanciera: false },

  { id: 19, idColaborador: 4, fechaEntrega: "2026-01-27", esTardio: true, tieneObservaciones: false, tieneInformacionFinanciera: true },
  { id: 20, idColaborador: 4, fechaEntrega: "2026-03-03", esTardio: false, tieneObservaciones: true, tieneInformacionFinanciera: false },
  { id: 21, idColaborador: 4, fechaEntrega: "2026-04-09", esTardio: true, tieneObservaciones: true, tieneInformacionFinanciera: true },
  { id: 22, idColaborador: 4, fechaEntrega: "2026-05-19", esTardio: false, tieneObservaciones: false, tieneInformacionFinanciera: false },
  { id: 23, idColaborador: 4, fechaEntrega: "2026-06-23", esTardio: false, tieneObservaciones: false, tieneInformacionFinanciera: true },
  { id: 24, idColaborador: 4, fechaEntrega: "2026-07-29", esTardio: false, tieneObservaciones: false, tieneInformacionFinanciera: false },

  { id: 25, idColaborador: 5, fechaEntrega: "2026-02-03", esTardio: false, tieneObservaciones: false, tieneInformacionFinanciera: false },
  { id: 26, idColaborador: 5, fechaEntrega: "2026-03-10", esTardio: false, tieneObservaciones: false, tieneInformacionFinanciera: true },
  { id: 27, idColaborador: 5, fechaEntrega: "2026-04-16", esTardio: false, tieneObservaciones: false, tieneInformacionFinanciera: false },
  { id: 28, idColaborador: 5, fechaEntrega: "2026-05-26", esTardio: false, tieneObservaciones: false, tieneInformacionFinanciera: true },
  { id: 29, idColaborador: 5, fechaEntrega: "2026-07-01", esTardio: false, tieneObservaciones: true, tieneInformacionFinanciera: false },
  { id: 30, idColaborador: 5, fechaEntrega: "2026-08-05", esTardio: true, tieneObservaciones: false, tieneInformacionFinanciera: true },

  { id: 31, idColaborador: 6, fechaEntrega: "2026-02-24", esTardio: false, tieneObservaciones: false, tieneInformacionFinanciera: false },
  { id: 32, idColaborador: 6, fechaEntrega: "2026-04-02", esTardio: false, tieneObservaciones: false, tieneInformacionFinanciera: true },
  { id: 33, idColaborador: 6, fechaEntrega: "2026-05-20", esTardio: true, tieneObservaciones: true, tieneInformacionFinanciera: false },
  { id: 34, idColaborador: 6, fechaEntrega: "2026-06-30", esTardio: false, tieneObservaciones: false, tieneInformacionFinanciera: true },
  { id: 35, idColaborador: 6, fechaEntrega: "2026-08-12", esTardio: false, tieneObservaciones: true, tieneInformacionFinanciera: false },
];

export const OPCIONES_COLABORADOR_DESEMPENO_DASHBOARD = COLABORADORES_DESEMPENO_DASHBOARD_MOCK.map(
  (colaborador) => ({ valor: colaborador.idColaborador, etiqueta: colaborador.colaborador }),
);

export const ID_ROL_ANALISTA_DESEMPENO_DASHBOARD = 3;
export const ID_ROL_TRADUCTOR_DESEMPENO_DASHBOARD = 4;

export const OPCIONES_ROL_COLABORADOR_DESEMPENO_DASHBOARD: EntradaTablaMaestra[] = [
  {
    idEmpresa: 0,
    idTablaMaestra: null,
    idMaestro: 0,
    descripcion: "ANALISTA",
    num1: ID_ROL_ANALISTA_DESEMPENO_DASHBOARD,
    num2: null,
    num3: null,
    string1: "Analista",
    string2: null,
    string3: null,
    date1: null,
    date2: null,
    date3: null,
  },
  {
    idEmpresa: 0,
    idTablaMaestra: null,
    idMaestro: 0,
    descripcion: "TRADUCTOR",
    num1: ID_ROL_TRADUCTOR_DESEMPENO_DASHBOARD,
    num2: null,
    num3: null,
    string1: "Traductor",
    string2: null,
    string3: null,
    date1: null,
    date2: null,
    date3: null,
  },
];

export const MAPA_ID_ROL_COLABORADOR_DESEMPENO_DASHBOARD: Record<number, RolColaboradorDesempenoDashboard> = {
  [ID_ROL_ANALISTA_DESEMPENO_DASHBOARD]: "Analista",
  [ID_ROL_TRADUCTOR_DESEMPENO_DASHBOARD]: "Traductor",
};

export const COLUMNAS_TABLA_DESEMPENO_COLABORADORES_DASHBOARD: TableColumn[] = [
  { label: "Colaborador", width: "20%" },
  { label: "Rol", className: "text-center", width: "12%" },
  { label: "Órdenes", className: "text-center", width: "11%" },
  { label: "Cumplimiento", className: "text-center", width: "13%" },
  { label: "Informes", className: "text-center", width: "11%" },
  { label: "Fuera de fecha", className: "text-center", width: "12%" },
  { label: "Observados", className: "text-center", width: "11%" },
  { label: "Info. financiera", className: "text-center", width: "10%" },
];

import type { TableColumn } from "@maximilian/components/common/CustomTabla";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

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

export const CANTIDAD_REINTENTOS_CONSULTA_DESEMPENO_COLABORADORES_DASHBOARD = 2;

export const PALETA_AVATAR_DESEMPENO_COLABORADORES_DASHBOARD: Array<{
  colorLetra: string;
  colorFondo: string;
}> = [
  { colorLetra: "#2563eb", colorFondo: "#dbeafe" },
  { colorLetra: "#7c3aed", colorFondo: "#ede9fe" },
  { colorLetra: "#059669", colorFondo: "#d1fae5" },
  { colorLetra: "#d97706", colorFondo: "#fef3c7" },
  { colorLetra: "#db2777", colorFondo: "#fce7f3" },
  { colorLetra: "#0891b2", colorFondo: "#cffafe" },
];

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

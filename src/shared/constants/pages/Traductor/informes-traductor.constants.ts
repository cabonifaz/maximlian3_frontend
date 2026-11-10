import type { TipoInformeRepositorio } from "@maximilian/shared/types/flujo-informe.type";

export type TabInformesTraductor = "repositorio" | "mis-complementos";

export const TABS_INFORMES_TRADUCTOR: { id: TabInformesTraductor; etiqueta: string }[] = [
  { id: "repositorio", etiqueta: "Repositorio de informes" },
  { id: "mis-complementos", etiqueta: "Mis complementos" },
];

export const OPCIONES_TIPO_REPOSITORIO: { valor: TipoInformeRepositorio | undefined; etiqueta: string }[] = [
  { valor: undefined, etiqueta: "Todos" },
  { valor: "informe", etiqueta: "Informes" },
  { valor: "complemento", etiqueta: "Complementos" },
];

export const COLUMNAS_REPOSITORIO_INFORMES = [
  { label: "Investigado", width: "22%" },
  { label: "Tipo", width: "12%" },
  { label: "Cliente", width: "16%" },
  { label: "Idioma", width: "10%" },
  { label: "Traductor", width: "14%" },
  { label: "Aprobado", width: "11%" },
  { label: "Acciones", className: "text-right", width: "13%" },
];

export const COLUMNAS_MIS_COMPLEMENTOS = [
  { label: "Investigado", width: "22%" },
  { label: "Base", width: "18%" },
  { label: "Cliente destino", width: "18%" },
  { label: "Estado", className: "text-center", width: "14%" },
  { label: "Última modificación", width: "12%" },
  { label: "Acciones", className: "text-right", width: "16%" },
];

export const DESCRIPCION_REPOSITORIO_INFORMES =
  "Informes que ya pasaron por traducción y complementos aprobados. Visible para todos los traductores.";

export const DESCRIPCION_NUEVO_COMPLEMENTO =
  "El complemento se crea como copia de la última versión aprobada de esta compañía (informe o complemento). No requiere un pedido y no se factura.";

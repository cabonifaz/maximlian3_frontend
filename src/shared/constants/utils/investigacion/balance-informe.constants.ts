export const ETIQUETAS_TIPO_ESTADO_FINANCIERO: Record<number, string> = {
  1: "Desagregado",
  2: "Totalizado",
  3: "Bancos",
  4: "Seguros",
  5: "Turquia",
};

export const CAMPOS_ESTADO_FINANCIERO_SIN_FORMATO = new Set([
  "balance-date",
  "balance-date-p",
  "currency",
  "currency-p",
  "currency-iso",
  "reliability-level",
]);

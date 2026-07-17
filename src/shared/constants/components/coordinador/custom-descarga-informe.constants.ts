import type { FormatoDescargaInforme } from "@maximilian/shared/types/informe.type";

export const FORMATOS: Array<{ valor: FormatoDescargaInforme; etiqueta: string }> = [
  { valor: ".pdf", etiqueta: "PDF" },
  { valor: ".docx", etiqueta: "DOCX" },
  { valor: ".xml", etiqueta: "XML" },
];

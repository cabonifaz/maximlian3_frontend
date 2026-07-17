export const ID_MAESTRO_ESTADO_CREDITO = 66;

export const ID_MAESTRO_ACTIVIDAD_ECONOMICA_EMPRESA = 48;

export const etiquetasPestanas: Record<PestanaBancoInformacion, string> = {
  noticias: "Noticias",
  credito: "Inf. Crediticia",
  empresas: "Empresas",
};
export type PestanaBancoInformacion = "noticias" | "credito" | "empresas";

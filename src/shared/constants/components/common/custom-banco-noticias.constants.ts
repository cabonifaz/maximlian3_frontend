import type { DatosFormularioNoticiaBancoInformacionEntrada } from "@maximilian/schemas/banco-informacion.schema";

export const MAX_CARACTERES_TITULO_NOTICIA = 200;
export const MAX_CARACTERES_DESCRIPCION_NOTICIA = 2000;

export const valoresIniciales: DatosFormularioNoticiaBancoInformacionEntrada = {
  idCompania: 0,
  titulo: "",
  descripcion: "",
  fechaNoticia: new Date().toISOString().slice(0, 10),
  categoria: "",
};

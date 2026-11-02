import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

export const IDIOMAS_TRADUCCION_NOTICIA = [
  { id: 1, etiqueta: "Español" },
  { id: 2, etiqueta: "English" },
  { id: 3, etiqueta: "Português" },
] as const;

export const OPCIONES_IDIOMA_NOTICIA: EntradaTablaMaestra[] = IDIOMAS_TRADUCCION_NOTICIA.map(
  (idioma) => ({
    idEmpresa: 0,
    idTablaMaestra: null,
    idMaestro: 0,
    descripcion: idioma.etiqueta,
    num1: idioma.id,
    num2: null,
    num3: null,
    string1: idioma.etiqueta,
    string2: null,
    string3: null,
    date1: null,
    date2: null,
    date3: null,
  }),
);

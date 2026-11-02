import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

export const ID_IDIOMA_OTROS_NOTICIA = 0;

export const IDIOMAS_TRADUCCION_NOTICIA = [
  { id: 1, etiqueta: "Español" },
  { id: 2, etiqueta: "English" },
  { id: 3, etiqueta: "Português" },
] as const;

function crearOpcionIdioma(id: number, etiqueta: string): EntradaTablaMaestra {
  return {
    idEmpresa: 0,
    idTablaMaestra: null,
    idMaestro: 0,
    descripcion: etiqueta,
    num1: id,
    num2: null,
    num3: null,
    string1: etiqueta,
    string2: null,
    string3: null,
    date1: null,
    date2: null,
    date3: null,
  };
}

export const OPCIONES_IDIOMA_NOTICIA: EntradaTablaMaestra[] = IDIOMAS_TRADUCCION_NOTICIA.map(
  (idioma) => crearOpcionIdioma(idioma.id, idioma.etiqueta),
);

export const OPCIONES_IDIOMA_CREACION_NOTICIA: EntradaTablaMaestra[] = [
  ...OPCIONES_IDIOMA_NOTICIA,
  crearOpcionIdioma(ID_IDIOMA_OTROS_NOTICIA, "Otros"),
];

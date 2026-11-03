import type { CompaniaNoticiaListaItem } from "@maximilian/shared/types/compania-noticia.type";
import { convertirFechaApiATextoFecha } from "./fecha-noticia.util";

interface ValoresNoticiaFormulario {
  idCompania: number | string;
  titulo: string;
  descripcion: string;
  fechaNoticia: string;
  categoria: string;
}

// El textarea normaliza \r\n a \n; sin igualarlos, un texto con \r\n guardado en BD parece modificado.
function normalizarTexto(texto: string) {
  return texto.replace(/\r\n?/g, "\n").trim();
}

export function noticiaTieneCambios(
  original: CompaniaNoticiaListaItem,
  actuales: ValoresNoticiaFormulario,
  hayArchivosNuevos: boolean,
) {
  return (
    hayArchivosNuevos
    || Number(actuales.idCompania) !== original.idCompania
    || normalizarTexto(actuales.titulo) !== normalizarTexto(original.titulo)
    || normalizarTexto(actuales.descripcion) !== normalizarTexto(original.descripcion)
    || normalizarTexto(actuales.categoria) !== normalizarTexto(original.categoria)
    || actuales.fechaNoticia !== convertirFechaApiATextoFecha(original.fechaNoticia)
  );
}

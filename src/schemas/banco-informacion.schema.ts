import { z } from "zod";
import {
  MAX_CARACTERES_DESCRIPCION_NOTICIA,
  MAX_CARACTERES_TITULO_NOTICIA,
} from "@maximilian/shared/constants/components/common/custom-banco-noticias.constants";

export const esquemaNoticiaBancoInformacion = z.object({
  idCompania: z.coerce
    .number()
    .int("Ingrese un ID válido")
    .min(1, "Seleccione una compañía"),
  titulo: z
    .string()
    .trim()
    .min(1, "Ingrese el título")
    .max(MAX_CARACTERES_TITULO_NOTICIA, `Máximo ${MAX_CARACTERES_TITULO_NOTICIA} caracteres`),
  descripcion: z
    .string()
    .trim()
    .min(1, "Ingrese la descripción")
    .max(MAX_CARACTERES_DESCRIPCION_NOTICIA, `Máximo ${MAX_CARACTERES_DESCRIPCION_NOTICIA} caracteres`),
  fechaNoticia: z.string().trim().min(1, "Ingrese la fecha"),
  categoria: z.string().trim().min(1, "Ingrese la categoría"),
});

export type DatosFormularioNoticiaBancoInformacionEntrada = z.input<
  typeof esquemaNoticiaBancoInformacion
>;
export type DatosFormularioNoticiaBancoInformacion = z.output<
  typeof esquemaNoticiaBancoInformacion
>;

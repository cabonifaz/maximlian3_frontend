import { z } from "zod";

export const esquemaNoticiaBancoInformacion = z.object({
  idCompania: z.coerce
    .number()
    .int("Ingrese un ID valido")
    .min(1, "Seleccione una compañía"),
  titulo: z.string().trim().min(1, "Ingrese el titulo"),
  descripcion: z.string().trim().min(1, "Ingrese la descripcion"),
  fechaNoticia: z.string().trim().min(1, "Ingrese la fecha"),
  categoria: z.string().trim().min(1, "Ingrese la categoria"),
});

export type DatosFormularioNoticiaBancoInformacionEntrada = z.input<
  typeof esquemaNoticiaBancoInformacion
>;
export type DatosFormularioNoticiaBancoInformacion = z.output<
  typeof esquemaNoticiaBancoInformacion
>;

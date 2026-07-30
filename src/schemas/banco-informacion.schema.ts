import { z } from "zod";

export const esquemaNoticiaBancoInformacion = z.object({
  idCompania: z.coerce
    .number()
    .int("Ingrese un ID válido")
    .min(1, "Seleccione una compañía"),
  titulo: z.string().trim().min(1, "Ingrese el título"),
  descripcion: z.string().trim().min(1, "Ingrese la descripción"),
  fechaNoticia: z.string().trim().min(1, "Ingrese la fecha"),
  categoria: z.string().trim().min(1, "Ingrese la categoría"),
});

export type DatosFormularioNoticiaBancoInformacionEntrada = z.input<
  typeof esquemaNoticiaBancoInformacion
>;
export type DatosFormularioNoticiaBancoInformacion = z.output<
  typeof esquemaNoticiaBancoInformacion
>;

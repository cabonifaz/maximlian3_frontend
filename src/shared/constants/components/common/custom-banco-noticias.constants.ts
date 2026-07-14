import { z } from "zod";

export const esquemaNoticia = z.object({
  idCompania: z.coerce
    .number()
    .int("Ingrese un ID valido")
    .min(1, "Seleccione una compania"),
  titulo: z.string().trim().min(1, "Ingrese el titulo"),
  descripcion: z.string().trim().min(1, "Ingrese la descripcion"),
  fechaNoticia: z.string().trim().min(1, "Ingrese la fecha"),
  categoria: z.string().trim().min(1, "Ingrese la categoria"),
});

export const valoresIniciales: z.input<typeof esquemaNoticia> = {
  idCompania: 0,
  titulo: "",
  descripcion: "",
  fechaNoticia: new Date().toISOString().slice(0, 10),
  categoria: "",
};

import { z } from "zod";

export const esquemaAsignarRolFlujo = z.object({
  idUsuarioAsignado: z.number().int().positive("Selecciona a la persona que se asignará"),
});

export type DatosFormularioAsignarRolFlujo = z.infer<typeof esquemaAsignarRolFlujo>;

export const esquemaNuevoComplemento = z.object({
  idClienteDestino: z.number().int().positive("El cliente destino es requerido"),
  idIdioma: z.number().int().positive("El idioma del complemento es requerido"),
  observacion: z.string().trim().max(500, "Máximo 500 caracteres").optional(),
});

export type DatosFormularioNuevoComplemento = z.infer<typeof esquemaNuevoComplemento>;

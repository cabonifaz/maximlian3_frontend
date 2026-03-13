import { z } from "zod";

export const clientDetailSchema = z.object({
  id: z.number().optional(),
  tipoPersona: z.union([z.string(), z.number()]).optional(),
  nombre: z.string().optional(),
  pais: z.union([z.string(), z.number()]).optional(),
  direccion: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefono: z.string().optional(),
  sitioWeb: z.string().url("URL inválida").optional().or(z.literal("")),
  tipoRegistroTributario: z.union([z.string(), z.number()]).optional(),
  representanteLegal: z.string().optional(),
  formatoInforme: z.union([z.string(), z.number()]).optional(),
  estado: z.string().optional(),
});

export const clientDetailContactSchema = z.object({
  id: z.number().optional(),
  tipoPersona: z.union([z.string(), z.number()]).optional(),
  tipoContacto: z.union([z.string(), z.number()]).optional(),
  codigoContacto: z.string().optional(),
  nombre: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefono: z.string().optional(),
  areaTrabajo: z.union([z.string(), z.number()]).optional(),
});

export type ClientDetailFormData = z.infer<typeof clientDetailSchema>;
export type ClientDetailContactFormData = z.infer<typeof clientDetailContactSchema>;

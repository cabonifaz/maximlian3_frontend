import { z } from "zod";

export const clientInfoSchema = z.object({
  tipoPersona: z.string().min(1, "El tipo de persona es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  pais: z.string().min(1, "El país es requerido"),
  direccion: z.string().min(1, "La dirección es requerida"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(1, "El teléfono es requerido"),
  sitioWeb: z.string().url("URL inválida").optional().or(z.literal("")),
  tipoRegistroTributario: z.string().min(1, "El tipo de registro tributario es requerido"),
  representanteLegal: z.string().min(1, "El representante legal es requerido"),
  formatoInforme: z.string().min(1, "El formato de informe es requerido"),
});

export const rateSchema = z.object({
  producto: z.string().min(1, "El producto es requerido"),
  pais: z.string().min(1, "El país es requerido"),
  moneda: z.string().min(1, "La moneda es requerida"),
  tramite: z.string().min(1, "El trámite es requerido"),
  diasMin: z.number().min(0, "Días mínimos debe ser mayor o igual a 0"),
  diasMax: z.number().min(0, "Días máximos debe ser mayor o igual a 0"),
  precio: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  penalidad: z.number().min(0, "La penalidad debe ser mayor o igual a 0"),
  tarifario: z.string().min(1, "El tarifario es requerido"),
});

export const contactSchema = z.object({
  tipoPersona: z.string().min(1, "El tipo de persona es requerido"),
  tipoContacto: z.string().min(1, "El tipo de contacto es requerido"),
  codigoContacto: z.string().min(1, "El código de contacto es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(1, "El teléfono es requerido"),
  areaTrabajo: z.string().min(1, "El área de trabajo es requerida"),
});

export type ClientInfoFormData = z.infer<typeof clientInfoSchema>;
export type RateFormData = z.infer<typeof rateSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;

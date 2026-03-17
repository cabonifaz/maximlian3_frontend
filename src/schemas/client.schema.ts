import { z } from "zod";

export const clientInfoSchema = z.object({
  tipoPersona: z.union([z.string(), z.number()]).refine(val => val !== "", "El tipo de persona es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  pais: z.union([z.string(), z.number()]).refine(val => val !== "", "El país es requerido"),
  direccion: z.string().min(1, "La dirección es requerida"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(1, "El teléfono es requerido"),
  sitioWeb: z.string().url("URL inválida").optional().or(z.literal("")),
  fax: z.string().optional(),
  tipoRegistroTributario: z.union([z.string(), z.number()]).refine(val => val !== "", "El tipo de registro tributario es requerido"),
  numRegistroTributario: z.string().min(1, "El registro tributario es requerido"),
  moneda: z.union([z.string(), z.number()]).refine(val => val !== "", "La moneda es requerida"),
  atendidoPor: z.union([z.string(), z.number()]).refine(val => val !== "", "El atendido por es requerido"),
  idioma: z.union([z.string(), z.number()]).refine(val => val !== "", "El idioma preferido es requerido"),
  idiomaFacturacion: z.union([z.string(), z.number()]).refine(val => val !== "", "El idioma de facturación es requerido"),
  formatoInforme: z.array(z.number()).min(1, "El formato de informe es requerido"),
  imprimeLogoSafety: z.boolean(),
  aplicaPenalidad: z.boolean(),
  recomendacion: z.string().optional(),
});

export const rateSchema = z.object({
  producto: z.union([z.string(), z.number()]).refine(val => val !== "", "El producto es requerido"),
  pais: z.union([z.string(), z.number()]).refine(val => val !== "", "El país es requerido"),
  moneda: z.union([z.string(), z.number()]).refine(val => val !== "", "La moneda es requerida"),
  tramite: z.union([z.string(), z.number()]).refine(val => val !== "", "El trámite es requerido"),
  diasMin: z.number().min(0, "Días mínimos debe ser mayor o igual a 0"),
  diasMax: z.number().min(0, "Días máximos debe ser mayor o igual a 0"),
  precio: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  penalidad: z.number().min(0, "La penalidad debe ser mayor o igual a 0"),
});

export const contactSchema = z.object({
  tipoPersona: z.union([z.string(), z.number()]).refine(val => val !== "", "El tipo de persona es requerido"),
  tipoContacto: z.union([z.string(), z.number()]).refine(val => val !== "", "El tipo de contacto es requerido"),
  codigoContacto: z.string().min(1, "El código de contacto es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(1, "El teléfono es requerido"),
  areaTrabajo: z.union([z.string(), z.number()]).refine(val => val !== "", "El área de trabajo es requerida"),
});

export type ClientInfoFormData = z.infer<typeof clientInfoSchema>;
export type RateFormData = z.infer<typeof rateSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;

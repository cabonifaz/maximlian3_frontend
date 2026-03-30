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
  plantillaInforme: z.number({ error: 'La plantilla de informe es requerida' }),
  imprimeLogoSafety: z.boolean(),
  aplicaPenalidad: z.boolean(),
  recomendacion: z.string().optional(),
});

export const rateSchema = z.object({
  producto: z.number({ error: "El producto es requerido" }),
  pais: z.number({ error: "El país es requerido" }),
  moneda: z.number({ error: "La moneda es requerida" }),
  tramite: z.number({ error: "El trámite es requerido" }),
  diasMin: z.number({ error: "Días mínimos es requerido" }).min(0, "Días mínimos debe ser mayor o igual a 0"),
  diasMax: z.number({ error: "Días máximos es requerido" }).min(0, "Días máximos debe ser mayor o igual a 0"),
  precio: z.number({ error: "El precio es requerido" }).min(0, "El precio debe ser mayor o igual a 0"),
  penalidad: z.preprocess(
    (val) => (typeof val === "number" && isNaN(val) ? undefined : val),
    z.number().min(0, "La penalidad debe ser mayor o igual a 0").optional()
  ) as unknown as z.ZodOptional<z.ZodNumber>,
}).superRefine((data, ctx) => {
  if (data.diasMax <= data.diasMin) {
    ctx.addIssue({
      code: "custom",
      message: "Días mínimos debe ser menor a días máximos",
      path: ["diasMin"],
    });
    ctx.addIssue({
      code: "custom",
      message: "Días máximos debe ser mayor a días mínimos",
      path: ["diasMax"],
    });
  }
});

export const contactSchema = z.object({
  tipoPersona: z.number({ error: "El tipo de persona es requerido" }),
  tipoContacto: z.number({ error: "El tipo de contacto es requerido" }),
  tipoContactoNuevo: z.string().optional(),
  codigoContacto: z.string().min(1, "El código de contacto es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(1, "El teléfono es requerido"),
  areaTrabajo: z.number({ error: "El área de trabajo es requerida" }),
  enviarCorreo: z.boolean(),
});

export type ClientInfoFormData = z.infer<typeof clientInfoSchema>;
export type RateFormData = z.infer<typeof rateSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;

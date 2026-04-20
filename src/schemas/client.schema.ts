import { z } from "zod";

const selectorRequerido = (mensaje: string) =>
  z.custom<string | number>(
    (valor) => typeof valor === "string" || typeof valor === "number",
    { message: mensaje },
  ).refine((valor) => valor !== "", mensaje);

const selectorMultipleRequerido = (mensaje: string) =>
  z.custom<number[]>(
    (valor) => Array.isArray(valor) && valor.every((item) => typeof item === "number"),
    { message: mensaje },
  ).refine((valor) => valor.length > 0, mensaje);

const textoRequerido = (mensaje: string) =>
  z.string({ error: mensaje }).min(1, mensaje);

export const clientInfoSchema = z.object({
  tipoPersona: selectorRequerido("El tipo de persona es requerido"),
  nombre: textoRequerido("El nombre es requerido"),
  pais: selectorRequerido("El país es requerido"),
  direccion: z.string().optional().or(z.literal("")),
  correo: textoRequerido("El email es requerido").email("Email inválido"),
  telefono: z.string().optional().or(z.literal("")),
  sitioWeb: z.string().url("URL inválida").optional().or(z.literal("")),
  fax: z.string().optional(),
  tipoRegistroTributario: selectorRequerido("El tipo de registro tributario es requerido"),
  numRegistroTributario: textoRequerido("El registro tributario es requerido"),
  moneda: selectorRequerido("La moneda es requerida"),
  atendidoPor: selectorRequerido("El atendido por es requerido"),
  idioma: selectorRequerido("El idioma preferido es requerido"),
  idiomaFacturacion: selectorRequerido("El idioma de facturación es requerido"),
  formatoInforme: selectorMultipleRequerido("El formato de informe es requerido"),
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
  codigoContacto: z.string().optional().or(z.literal("")),
  nombre: textoRequerido("El nombre es requerido"),
  correo: textoRequerido("El email es requerido").email("Email inválido"),
  telefono: z.string().optional().or(z.literal("")),
  areaTrabajo: z.number({ error: "El área de trabajo es requerida" }),
  enviarCorreo: z.boolean(),
});

export type ClientInfoFormData = z.infer<typeof clientInfoSchema>;
export type RateFormData = z.infer<typeof rateSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;

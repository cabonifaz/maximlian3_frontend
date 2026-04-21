import { z } from "zod";

const selectorMultipleRequerido = (mensaje: string) =>
  z.custom<number[]>(
    (valor) => Array.isArray(valor) && valor.every((item) => typeof item === "number"),
    { message: mensaje },
  ).refine((valor) => valor.length > 0, mensaje);

const textoRequerido = (mensaje: string) =>
  z.string({ error: mensaje }).min(1, mensaje);

export const clientDetailSchema = z.object({
  id: z.number().optional(),
  tipoPersona: z.number({ error: "El tipo de persona es requerido" }),
  nombre: textoRequerido("El nombre es requerido"),
  pais: z.number({ error: "El país es requerido" }),
  direccion: z.string().optional().or(z.literal("")),
  correo: textoRequerido("El email es requerido").email("Email inválido"),
  telefono: z.string().optional().or(z.literal("")),
  sitioWeb: z.string().url("URL inválida").optional().or(z.literal("")),
  fax: z.string().optional(),
  tipoRegistroTributario: z.number({ error: "El tipo de registro tributario es requerido" }),
  numRegistroTributario: z.string().optional(),
  moneda: z.number({ error: "La moneda es requerida" }),
  atendidoPor: z.number({ error: "El atendido por es requerido" }),
  idioma: z.number({ error: "El idioma preferido es requerido" }),
  idiomaFacturacion: z.number({ error: "El idioma de facturación es requerido" }),
  formatoInforme: selectorMultipleRequerido("El formato de informe es requerido"),
  plantillaInforme: z.number({ error: "La plantilla de informe es requerida" }),
  imprimeLogoSafety: z.boolean().optional(),
  aplicaPenalidad: z.boolean().optional(),
  recomendacion: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.tipoRegistroTributario && !data.numRegistroTributario) {
    ctx.addIssue({
      code: "custom",
      message: "El registro tributario es requerido",
      path: ["numRegistroTributario"],
    });
  }
});

export const clientDetailContactSchema = z.object({
  id: z.number().optional(),
  tipoPersona: z.union([z.string(), z.number()]).optional(),
  tipoContacto: z.union([z.string(), z.number()]).optional(),
  codigoContacto: z.string().optional(),
  nombre: z.string().optional(),
  correo: z.string().email("Email inválido").optional().or(z.literal("")),
  telefono: z.string().optional(),
  areaTrabajo: z.union([z.string(), z.number()]).optional(),
  enviarCorreo: z.boolean().optional(),
});

export type ClientDetailFormData = z.infer<typeof clientDetailSchema>;
export type ClientDetailContactFormData = z.infer<typeof clientDetailContactSchema>;

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
  tipoPersona: z.number({ error: "Campo requerido" }),
  nombre: textoRequerido("Campo requerido"),
  pais: z.number({ error: "Campo requerido" }),
  direccion: z.string().optional().or(z.literal("")),
  correo: textoRequerido("Campo requerido").email("Email inválido"),
  telefono: z.string().optional().or(z.literal("")),
  sitioWeb: z.string().url("URL inválida").optional().or(z.literal("")),
  fax: z.string().optional(),
  tipoRegistroTributario: z.number({ error: "Campo requerido" }),
  numRegistroTributario: z.string().optional(),
  moneda: z.number({ error: "Campo requerido" }),
  atendidoPor: z.number({ error: "Campo requerido" }),
  idioma: z.number({ error: "Campo requerido" }),
  idiomaFacturacion: z.number({ error: "Campo requerido" }),
  formatoInforme: selectorMultipleRequerido("Selecciona al menos un formato"),
  plantillaInforme: z.number({ error: "Campo requerido" }),
  imprimeLogoSafety: z.boolean().optional(),
  aplicaPenalidad: z.boolean().optional(),
  recomendacion: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.tipoRegistroTributario && !data.numRegistroTributario) {
    ctx.addIssue({
      code: "custom",
      message: "Campo requerido",
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

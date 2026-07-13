import { z } from "zod";

const selectorMultipleRequerido = (mensaje: string) =>
  z.custom<number[]>(
    (valor) => Array.isArray(valor) && valor.every((item) => typeof item === "number"),
    { message: mensaje },
  ).refine((valor) => valor.length > 0, mensaje);

const textoRequerido = (mensaje: string) =>
  z.string({ error: mensaje }).min(1, mensaje);

const selectorRequerido = (mensaje: string) =>
  z.custom<number>(
    (valor) => typeof valor === "number" && Number.isFinite(valor) && valor > 0,
    { message: mensaje },
  );

export const esquemaDetalleCliente = z.object({
  id: z.number().optional(),
  tipoPersona: selectorRequerido("El tipo de persona es requerido"),
  nombre: textoRequerido("El nombre es requerido"),
  pais: selectorRequerido("El país es requerido"),
  direccion: z.string().optional().or(z.literal("")),
  correo: textoRequerido("El correo es requerido").email("Correo inválido"),
  telefono: z.string().optional().or(z.literal("")),
  sitioWeb: z.string().url("URL inválida").optional().or(z.literal("")),
  fax: z.string().optional(),
  tipoRegistroTributario: selectorRequerido("El tipo de registro tributario es requerido"),
  numRegistroTributario: z.string().optional(),
  moneda: selectorRequerido("La moneda es requerida"),
  atendidoPor: selectorRequerido("El atendido por es requerido"),
  idioma: selectorRequerido("El idioma preferido es requerido"),
  idiomaFacturacion: selectorRequerido("El idioma de facturación es requerido"),
  formatoInforme: selectorMultipleRequerido("El formato de informe es requerido"),
  plantillaInforme: selectorRequerido("La plantilla de informe es requerida"),
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

export const esquemaContactoDetalleCliente = z.object({
  id: z.number().optional(),
  tipoPersona: z.union([z.string(), z.number()]).optional(),
  tipoContacto: z.union([z.string(), z.number()]).optional(),
  codigoContacto: z.string().optional(),
  nombre: z.string().optional(),
  correo: z.string().email("Correo inválido").optional().or(z.literal("")),
  telefono: z.string().optional(),
  areaTrabajo: z.union([z.string(), z.number()]).optional(),
  enviarCorreo: z.boolean().optional(),
});

export type DatosFormularioDetalleCliente = z.infer<typeof esquemaDetalleCliente>;
export type DatosFormularioContactoDetalleCliente = z.infer<typeof esquemaContactoDetalleCliente>;

import { z } from "zod";

const selectorRequerido = (mensaje: string) =>
  z.custom<string | number>(
    (valor) =>
      (typeof valor === "string" && valor !== "")
      || (typeof valor === "number" && Number.isFinite(valor) && valor > 0),
    { message: mensaje },
  );

const selectorMultipleRequerido = (mensaje: string) =>
  z.custom<number[]>(
    (valor) => Array.isArray(valor) && valor.every((item) => typeof item === "number"),
    { message: mensaje },
  ).refine((valor) => valor.length > 0, mensaje);

const textoRequerido = (mensaje: string) =>
  z.string({ error: mensaje }).min(1, mensaje);

const numeroRequerido = (mensaje: string) =>
  z.custom<number>(
    (valor) => typeof valor === "number" && Number.isFinite(valor),
    { message: mensaje },
  );

const idRequerido = (mensaje: string) =>
  z.custom<number>(
    (valor) => typeof valor === "number" && Number.isFinite(valor) && valor > 0,
    { message: mensaje },
  );

export const esquemaInformacionCliente = z.object({
  tipoPersona: selectorRequerido("El tipo de persona es requerido"),
  nombre: textoRequerido("El nombre es requerido"),
  pais: selectorRequerido("El país es requerido"),
  direccion: z.string().optional().or(z.literal("")),
  correo: textoRequerido("El correo es requerido").email("Correo inválido"),
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
  plantillaInforme: idRequerido("La plantilla de informe es requerida"),
  imprimeLogoSafety: z.boolean(),
  aplicaPenalidad: z.boolean(),
  emitirPrefactura: z.boolean(),
  recomendacion: z.string().optional(),
});

export const esquemaTarifa = z.object({
  producto: idRequerido("El producto es requerido"),
  pais: idRequerido("El país es requerido"),
  moneda: idRequerido("La moneda es requerida"),
  tramite: idRequerido("El trámite es requerido"),
  diasMin: numeroRequerido("Días mínimos es requerido").refine(
    (valor) => valor >= 0,
    "Días mínimos debe ser mayor o igual a 0",
  ),
  diasMax: numeroRequerido("Días máximos es requerido").refine(
    (valor) => valor >= 0,
    "Días máximos debe ser mayor o igual a 0",
  ),
  precio: numeroRequerido("El precio es requerido").refine(
    (valor) => valor >= 0,
    "El precio debe ser mayor o igual a 0",
  ),
  penalidad: z.preprocess(
    (val) => (typeof val === "number" && isNaN(val) ? undefined : val),
    z.number().min(0, "La penalidad debe ser mayor o igual a 0").optional()
  ) as unknown as z.ZodOptional<z.ZodNumber>,
}).superRefine((data, ctx) => {
  if (data.diasMax <= data.diasMin) {
    ctx.addIssue({
      code: "custom",
      message: "Días mínimos debe ser menor a días máximos",
      path: ["diasMax"],
    });
  }
});

export const esquemaContacto = z.object({
  tipoPersona: z.number({ error: "El tipo de persona es requerido" }),
  tipoContacto: z.number({ error: "El tipo de contacto es requerido" }),
  tipoContactoNuevo: z.string().optional(),
  codigoContacto: z.string().optional().or(z.literal("")),
  nombre: textoRequerido("El nombre es requerido"),
  correo: textoRequerido("El correo es requerido").email("Correo inválido"),
  telefono: z.string().optional().or(z.literal("")),
  areaTrabajo: z.number({ error: "El área de trabajo es requerida" }),
  enviarCorreo: z.boolean(),
});

export type DatosFormularioInformacionCliente = z.infer<typeof esquemaInformacionCliente>;
export type DatosFormularioTarifa = z.infer<typeof esquemaTarifa>;
export type DatosFormularioContacto = z.infer<typeof esquemaContacto>;

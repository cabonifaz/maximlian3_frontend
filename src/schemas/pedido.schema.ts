import { z } from "zod";

export const pedidoSchema = z.object({
  codigo: z.string().min(1, "El código es requerido"),
  idTipoPersona: z.number({ error: "El tipo de persona es requerido" }),
  idEmpresaAtencion: z.number({ error: "El atendido por es requerido" }),
  montoCredito: z.preprocess(
    (v) => {
      if (v === "" || v === undefined || v === null) return undefined;
      const n = Number(v as string);
      return isNaN(n) ? v : n;
    },
    z.number({ error: "El valor debe ser numérico" }).optional()
  ) as unknown as z.ZodOptional<z.ZodNumber>,
  plazoCredito: z.preprocess(
    (v) => {
      if (v === "" || v === undefined || v === null) return undefined;
      const n = Number(v as string);
      return isNaN(n) ? v : n;
    },
    z.number({ error: "El valor debe ser numérico" }).optional()
  ) as unknown as z.ZodOptional<z.ZodNumber>,
  idCliente: z.number({ error: "El cliente es requerido" }),
  nroDocumento: z.string().min(1, "El nro. de documento es requerido"),
  investigado: z.string().min(1, "El investigado es requerido"),
  idPais: z.number({ error: "El país del informe es requerido" }),
  idIdioma: z.number({ error: "El idioma del informe es requerido" }),
  idClaseInforme: z.number({ error: "La clase de informe es requerida" }),
  logoImprimible: z.boolean(),
  idPlantillaInforme: z.number({ error: "La plantilla de informe es requerida" }),
  nroReferencia: z.string().optional(),
  idTipoTramite: z.number({ error: "El tipo de trámite es requerido" }),
  fechaDesde: z.date({ error: "La fecha desde es requerida" }),
  fechaHasta: z.date({ error: "La fecha hasta es requerida" }),
});

export type PedidoFormData = z.infer<typeof pedidoSchema>;

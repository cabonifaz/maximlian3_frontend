import { z } from "zod";

export const pedidoSchema = z.object({
  idCliente: z.number({ error: "El cliente es requerido" }),
  investigado: z.string().min(1, "El investigado es requerido"),
  idPais: z.number().optional(),
  idIdioma: z.number({ error: "El idioma del informe es requerido" }),
  idClaseInforme: z.number({ error: "La clase de informe es requerida" }),
  logoImprimible: z.boolean(),
  razonSocial: z.string().min(1, "La razón social es requerida"),
  nroReferencia: z.string().optional(),
  idTipoTramite: z.number({ error: "El tipo de trámite es requerido" }),
});

export type PedidoFormData = z.infer<typeof pedidoSchema>;

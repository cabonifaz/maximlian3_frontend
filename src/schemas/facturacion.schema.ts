import { z } from "zod";

export const esquemaFormularioFactura = z.object({
  idTipoDocumentoMaestro: z.number().positive("El tipo de comprobante es requerido"),
  idMonedaMaestro: z.number().positive("La moneda es requerida"),
  idTipoOperacionMaestro: z.number().positive("El tipo de operación es requerido"),
  idFormaPago: z.number().positive("La forma de pago es requerida"),
  tipoCambio: z.number({ error: "Ingrese un tipo de cambio válido" })
    .positive("El tipo de cambio debe ser mayor a 0")
    .optional(),
  descuentos: z.record(
    z.string(),
    z.number({ error: "El descuento es requerido" })
      .min(0, "El descuento debe ser mayor o igual a 0")
      .max(100, "El descuento debe ser menor o igual a 100"),
  ),

  porcentajesIgv: z.record(
    z.string(),
    z.number({ error: "El IGV es requerido" })
      .min(0, "El IGV debe ser mayor o igual a 0")
      .max(100, "El IGV debe ser menor o igual a 100"),
  ),
  afectacionesIgv: z.record(
    z.string(),
    z.number({ error: "La afectacion IGV es requerida" })
      .positive("La afectacion IGV es requerida"),
  ),
  unidadesMedida: z.record(
    z.string(),
    z.number({ error: "La unidad de medida es requerida" })
      .positive("La unidad de medida es requerida"),
  ),
  descripciones: z.record(
    z.string(),
    z.string({ error: "La descripción es requerida" })
      .trim()
      .min(1, "La descripción es requerida"),
  ),
  valoresUnitarios: z.record(
    z.string(),
    z.number({ error: "El valor unitario es requerido" })
      .min(0, "El valor unitario debe ser mayor o igual a 0"),
  ),
  codigosProducto: z.record(
    z.string(),
    z.string({ error: "El código es requerido" })
      .trim()
      .min(1, "El código es requerido"),
  ),
  idMotivoMaestro: z.number().optional(),
});

export type DatosFormularioFactura = z.infer<typeof esquemaFormularioFactura>;

export const esquemaCuotaFactura = z.object({
  idMoneda: z.number({ error: "La moneda es requerida" }).positive("La moneda es requerida"),
  monto: z.number({ error: "El monto es requerido" }).min(0, "El monto debe ser mayor o igual a 0"),
  vencimiento: z.date({ error: "La fecha de vencimiento es requerida" }),
  estado: z.enum(["pendiente", "pagado"]),
});

export type DatosFormularioCuotaFactura = z.infer<typeof esquemaCuotaFactura>;

export const esquemaAnulacionFactura = z.object({
  fechaReferencia: z.date({ error: "La fecha de referencia es requerida" }),
  motivoDescripcion: z.string().trim().min(1, "El motivo es requerido"),
});

export type DatosFormularioAnulacionFactura = z.infer<
  typeof esquemaAnulacionFactura
>;

export const esquemaExportarLibroVentas = z.object({
  mes: z.date({ error: "El mes es requerido" }),
});

export type DatosFormularioExportarLibroVentas = z.infer<
  typeof esquemaExportarLibroVentas
>;

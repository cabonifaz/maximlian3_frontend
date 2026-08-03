import { z } from "zod";

const registroMontoFactura = z.record(
  z.string(),
  z.number({ error: "El valor es requerido" }).min(0, "El valor debe ser mayor o igual a 0"),
);

export const esquemaFormularioFactura = z.object({
  idTipoDocumentoMaestro: z.number().positive("El tipo de comprobante es requerido"),
  idMonedaMaestro: z.number().positive("La moneda es requerida"),
  idTipoOperacionMaestro: z.number().positive("El tipo de operación es requerido"),
  idFormaPago: z.number().positive("La forma de pago es requerida"),
  descuentos: z.record(
    z.string(),
    z.number({ error: "El descuento es requerido" })
      .min(0, "El descuento debe ser mayor o igual a 0")
      .max(100, "El descuento debe ser menor o igual a 100"),
  ),
  preciosUnitarios: registroMontoFactura,
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
});

export type DatosFormularioFactura = z.infer<typeof esquemaFormularioFactura>;

export const esquemaCuotaFactura = z.object({
  idMoneda: z.number({ error: "La moneda es requerida" }).positive("La moneda es requerida"),
  monto: z.number({ error: "El monto es requerido" }).min(0, "El monto debe ser mayor o igual a 0"),
  vencimiento: z.date({ error: "La fecha de vencimiento es requerida" }),
  estado: z.enum(["pendiente", "pagado"]),
});

export type DatosFormularioCuotaFactura = z.infer<typeof esquemaCuotaFactura>;

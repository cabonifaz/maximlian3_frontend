import { z } from "zod";

export const esquemaDescuentosFactura = z.object({
  descuentos: z.record(
    z.string(),
    z.number({ error: "El descuento es requerido" })
      .min(0, "El descuento debe ser mayor o igual a 0")
      .max(100, "El descuento debe ser menor o igual a 100"),
  ),
});

export type DatosFormularioDescuentosFactura = z.infer<typeof esquemaDescuentosFactura>;

export const esquemaCuotaFactura = z.object({
  idMoneda: z.number({ error: "La moneda es requerida" }).positive("La moneda es requerida"),
  monto: z.number({ error: "El monto es requerido" }).min(0, "El monto debe ser mayor o igual a 0"),
  vencimiento: z.date({ error: "La fecha de vencimiento es requerida" }),
  estado: z.enum(["pendiente", "pagado"]),
});

export type DatosFormularioCuotaFactura = z.infer<typeof esquemaCuotaFactura>;

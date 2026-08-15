export const CLASES_ESTADO_VERIFICACION_FACTURA: Record<string, string> = {
  Aceptado: "bg-emerald-100 text-emerald-700",
  Pendiente: "bg-amber-100 text-amber-700",
  Rechazado: "bg-red-100 text-red-700",
  Anulado: "bg-red-100 text-red-700",
};

export const CLASE_ESTADO_VERIFICACION_FACTURA_PREDETERMINADA =
  "bg-slate-100 text-slate-600";

export const CLASES_ESTADO_CUOTA_VERIFICACION_FACTURA: Record<string, string> = {
  Pendiente: "bg-amber-100 text-amber-700",
  Pagado: "bg-emerald-100 text-emerald-700",
};

export const ETIQUETAS_TIPO_DOCUMENTO_VERIFICACION_FACTURA: Record<string, string> = {
  "01": "Factura",
  "03": "Boleta de venta",
  "07": "Nota de crédito",
  "08": "Nota de débito",
};

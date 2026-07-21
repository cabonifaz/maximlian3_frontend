import type {
  EntradaProductoFacturable,
  EstadoFacturaCliente,
  EstadoFacturacionPrincipal,
} from "@maximilian/shared/types/facturacion.type";

export const COLUMNAS_FACTURACION = [
  { label: "Cliente" },
  { label: "Prefacturable", className: "text-center" },
  { label: "Total Pedidos", className: "text-center" },
  { label: "Total Facturados", className: "text-center" },
  { label: "Idioma", className: "text-center" },
  { label: "Estado", className: "text-center" },
  { label: "", className: "text-right w-16" },
];

export const ESTILOS_ESTADO_FACTURACION_PRINCIPAL: Record<
  EstadoFacturacionPrincipal,
  { texto: string; clase: string }
> = {
  finalizado: { texto: "Finalizado", clase: "bg-emerald-100 text-emerald-600" },
  pendiente: { texto: "Pendiente", clase: "bg-orange-100 text-orange-600" },
  "en-pre-factura": { texto: "En pre-factura", clase: "bg-blue-100 text-blue-600" },
};

export const ESTILOS_ESTADO_FACTURA_CLIENTE: Record<
  EstadoFacturaCliente,
  { texto: string; clase: string }
> = {
  ...ESTILOS_ESTADO_FACTURACION_PRINCIPAL,
  "pre-factura-aprobada": {
    texto: "Pre-factura aprobada",
    clase: "bg-cyan-100 text-cyan-700",
  },
  "pre-factura-rechazada": {
    texto: "Pre-factura rechazada",
    clase: "bg-red-100 text-red-600",
  },
};

export const OPCIONES_MODIFICAR_ESTADO_FACTURA: Array<{
  valor: Extract<
    EstadoFacturaCliente,
    "en-pre-factura" | "pre-factura-aprobada" | "pre-factura-rechazada"
  >;
  etiqueta: string;
}> = [
  { valor: "en-pre-factura", etiqueta: "En pre-factura" },
  { valor: "pre-factura-rechazada", etiqueta: "Pre-factura rechazada" },
  { valor: "pre-factura-aprobada", etiqueta: "Pre-factura aprobada" },
];

export const ESTILOS_TIPO_PRODUCTO_FACTURABLE: Record<
  EntradaProductoFacturable["tipo"],
  { texto: string; clase: string }
> = {
  express: { texto: "EXPRESS", clase: "bg-amber-100 text-amber-700" },
  normal: { texto: "NORMAL", clase: "bg-blue-100 text-blue-700" },
  "super-flash": { texto: "SUPER FLASH", clase: "bg-red-100 text-red-700" },
};

export const IDS_PRODUCTOS_FACTURA_SELECCIONADOS_INICIALES = [1, 2];

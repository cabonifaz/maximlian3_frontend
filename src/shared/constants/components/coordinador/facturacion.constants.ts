import type {
  EntradaProductoFacturable,
  EstadoFacturaCliente,
  IdEstadoFacturacionActualizable,
  EstadoFacturacionPrincipal,
} from "@maximilian/shared/types/facturacion.type";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

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
  "borrador-factura": {
    texto: "Borrador Factura",
    clase: "bg-amber-100 text-amber-700",
  },
  anulado: {
    texto: "Anulado",
    clase: "bg-slate-200 text-slate-600",
  },
};

export const OPCIONES_MODIFICAR_ESTADO_FACTURA: Array<{
  valor: Extract<
    EstadoFacturaCliente,
    "en-pre-factura" | "pre-factura-aprobada" | "pre-factura-rechazada"
  >;
  etiqueta: string;
  codigoEstado: IdEstadoFacturacionActualizable;
}> = [
  { valor: "en-pre-factura", etiqueta: "En pre-factura", codigoEstado: 2 },
  { valor: "pre-factura-rechazada", etiqueta: "Pre-factura rechazada", codigoEstado: 4 },
  { valor: "pre-factura-aprobada", etiqueta: "Pre-factura aprobada", codigoEstado: 3 },
];

export const CODIGOS_ESTADO_FACTURA_SOLO_LECTURA = [5, 6];

export const ID_FORMA_PAGO_CONTADO = 1;

export const ESTILOS_TIPO_PRODUCTO_FACTURABLE: Record<
  EntradaProductoFacturable["tipo"],
  { texto: string; clase: string }
> = {
  express: { texto: "EXPRESS", clase: "bg-amber-100 text-amber-700" },
  normal: { texto: "NORMAL", clase: "bg-blue-100 text-blue-700" },
  "super-flash": { texto: "SUPER FLASH", clase: "bg-red-100 text-red-700" },
};

export const OPCIONES_ESTADO_CUOTA: EntradaTablaMaestra[] = [
  {
    idEmpresa: 0,
    idTablaMaestra: null,
    idMaestro: 0,
    descripcion: "PENDIENTE",
    num1: 1,
    num2: null,
    num3: null,
    string1: "Pendiente",
    string2: null,
    string3: null,
    date1: null,
    date2: null,
    date3: null,
  },
  {
    idEmpresa: 0,
    idTablaMaestra: null,
    idMaestro: 0,
    descripcion: "PAGADO",
    num1: 2,
    num2: null,
    num3: null,
    string1: "Pagado",
    string2: null,
    string3: null,
    date1: null,
    date2: null,
    date3: null,
  },
];

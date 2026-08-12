import type {
  EntradaProductoFacturable,
  EstadoFacturaCliente,
  IdEstadoFacturacionActualizable,
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

export const PESTANAS_GESTION_FACTURACION = [
  { id: 'facturas', etiqueta: 'Facturas' },
  { id: 'clientes', etiqueta: 'Clientes' },
] as const;

export type PestanaGestionFacturacion =
  (typeof PESTANAS_GESTION_FACTURACION)[number]['id'];

export const COLUMNAS_LISTADO_FACTURAS = [
  { label: 'Número de documento', width: '14%' },
  { label: 'Tipo', width: '14%' },
  { label: 'Cliente', width: '19%' },
  { label: 'Fecha de emisión', className: 'text-center', width: '11%' },
  { label: 'Forma de pago', className: 'text-center', width: '11%' },
  { label: 'Importe total', className: 'text-right', width: '11%' },
  { label: 'Estado', className: 'text-center', width: '15%' },
  { label: '', className: 'text-right', width: '5%' },
];

export const OPCIONES_ESTADO_FACTURA_MOCK = [
  { valor: 'Aceptada', etiqueta: 'Aceptada' },
  { valor: 'Pendiente', etiqueta: 'Pendiente' },
  { valor: 'Rechazada', etiqueta: 'Rechazada' },
  { valor: 'Anulada', etiqueta: 'Anulada' },
];

export const OPCIONES_FORMA_PAGO_FACTURA_MOCK = [
  { valor: 'Contado', etiqueta: 'Contado' },
  { valor: 'Crédito', etiqueta: 'Crédito' },
];

export const CANTIDAD_FACTURAS_POR_PAGINA_MOCK = 5;
export const TAMANO_PAGINA_LISTADO_FACTURAS = 10;
export const ESTADO_CODIGO_FACTURA_ACEPTADA = "Aceptado";
export const ESTADO_CODIGO_DOCUMENTO_PENDIENTE_ENVIO = "Pendiente Envio";

export const ESTILOS_ESTADO_FACTURA_CLIENTE: Record<
  EstadoFacturaCliente,
  { texto: string; clase: string }
> = {
  "listo-para-facturacion": {
    texto: "Listo para facturación",
    clase: "bg-orange-100 text-orange-700",
  },
  "en-pre-factura": {
    texto: "En pre-factura",
    clase: "bg-blue-100 text-blue-600",
  },
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
  aprobado: {
    texto: "Aprobado",
    clase: "bg-emerald-100 text-emerald-700",
  },
  rechazado: {
    texto: "Rechazado",
    clase: "bg-red-100 text-red-700",
  },
  "pendiente-anulacion": {
    texto: "Pendiente Anulación",
    clase: "bg-amber-100 text-amber-700",
  },
  "anulacion-aprobada": {
    texto: "Anulación Aprobada",
    clase: "bg-slate-200 text-slate-700",
  },
  "anulacion-rechazada": {
    texto: "Anulación Rechazada",
    clase: "bg-rose-100 text-rose-700",
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

export const ID_ESTADO_FACTURA_APROBADA = 5;
export const ID_ESTADO_FACTURA_PENDIENTE_ANULACION = 7;

export const CODIGOS_ESTADO_FACTURA_SOLO_LECTURA = [
  ID_ESTADO_FACTURA_APROBADA,
  ID_ESTADO_FACTURA_PENDIENTE_ANULACION,
  9,
];
export const CODIGOS_ESTADO_FACTURA_EDITABLES = [6, 8, 10];
export const CODIGOS_ESTADO_FACTURA_EMITIBLES = [1, 3];
export const CODIGOS_ESTADO_FACTURA_MODIFICABLE: number[] = [2, 3, 4];
export const CODIGOS_ESTADO_FACTURA_SIN_VISUALIZACION = [1, 2, 3, 4];

export const CONFIGURACION_CONSULTA_FACTURACION = {
  staleTime: 0,
  gcTime: 0,
  refetchOnMount: "always",
} as const;

export const CODIGO_MONEDA_SUNAT_SOLES = "PEN";
export const ID_FORMA_PAGO_CONTADO = 1;
export const ID_TIPO_DOCUMENTO_SUNAT_RUC = 4;
export const IDS_TIPO_COMPROBANTE_CLIENTE_RUC = [1, 3] as const;
export const ID_TIPO_COMPROBANTE_BOLETA = 3;
export const ID_TIPO_NOTA_CREDITO = 7;
export const ID_TIPO_NOTA_DEBITO = 8;
export const CODIGO_SUNAT_NOTA_CREDITO = "07";
export const CODIGO_SUNAT_NOTA_DEBITO = "08";
export const ID_TIPO_OPERACION_SUNAT_EXPORTACION_SERVICIOS = 5;
export const ID_AFECTACION_IGV_PERU = 10;
export const ID_AFECTACION_IGV_EXTRANJERO = 40;
export const IDS_AFECTACION_IGV_DISPONIBLES = [
  ID_AFECTACION_IGV_PERU,
  ID_AFECTACION_IGV_EXTRANJERO,
] as const;
export const PORCENTAJE_IGV_PREDETERMINADO = 18;
export const LIMITE_CARACTERES_ORDEN_COMPRA = 20;
export const LIMITE_CARACTERES_CAMPO_EXTRA_FACTURA = 500;
export const ID_UNIDAD_MEDIDA_PREDETERMINADA = 1;
export const DESCRIPCION_UNIDAD_MEDIDA_PREDETERMINADA =
  "ZZ - Unidad de medida acordada entre las partes (servicios)";

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

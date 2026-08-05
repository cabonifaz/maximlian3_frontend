import type {
  EntradaListaFactura,
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

export const PESTANAS_GESTION_FACTURACION = [
  { id: 'facturas', etiqueta: 'Facturas' },
  { id: 'clientes', etiqueta: 'Clientes' },
] as const;

export type PestanaGestionFacturacion =
  (typeof PESTANAS_GESTION_FACTURACION)[number]['id'];

export const COLUMNAS_LISTADO_FACTURAS = [
  { label: 'Número de factura' },
  { label: 'Cliente' },
  { label: 'Fecha de emisión', className: 'text-center' },
  { label: 'Forma de pago', className: 'text-center' },
  { label: 'Importe total', className: 'text-right' },
  { label: 'Estado', className: 'text-center' },
  { label: '', className: 'w-16 text-right' },
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

export const FACTURAS_MOCK = [
  {
    idDocumentoElectronico: 101,
    numeroFactura: 'F001-00001234',
    cliente: 'Corporacion Andina S.A.C.',
    fechaEmision: '2026-08-04',
    formaPago: 'Contado',
    moneda: 'PEN',
    totalImporte: 2450,
    estado: 'Aceptada',
  },
  {
    idDocumentoElectronico: 102,
    numeroFactura: 'F001-00001233',
    cliente: 'Inversiones del Pacifico S.R.L.',
    fechaEmision: '2026-08-02',
    formaPago: 'Crédito',
    moneda: 'USD',
    totalImporte: 1860.5,
    estado: 'Pendiente',
  },
  {
    idDocumentoElectronico: 103,
    numeroFactura: 'F001-00001232',
    cliente: 'Servicios Integrales del Sur S.A.',
    fechaEmision: '2026-07-30',
    formaPago: 'Contado',
    moneda: 'PEN',
    totalImporte: 980,
    estado: 'Aceptada',
  },
  {
    idDocumentoElectronico: 104,
    numeroFactura: 'F001-00001231',
    cliente: 'Comercializadora Norte E.I.R.L.',
    fechaEmision: '2026-07-28',
    formaPago: 'Crédito',
    moneda: 'PEN',
    totalImporte: 3720,
    estado: 'Rechazada',
  },
  {
    idDocumentoElectronico: 105,
    numeroFactura: 'F001-00001230',
    cliente: 'Grupo Empresarial Los Andes',
    fechaEmision: '2026-07-25',
    formaPago: 'Contado',
    moneda: 'USD',
    totalImporte: 1250,
    estado: 'Anulada',
  },
  {
    idDocumentoElectronico: 106,
    numeroFactura: 'F001-00001229',
    cliente: 'Tecnologia y Gestion S.A.C.',
    fechaEmision: '2026-07-21',
    formaPago: 'Crédito',
    moneda: 'PEN',
    totalImporte: 4610.75,
    estado: 'Aceptada',
  },
  {
    idDocumentoElectronico: 107,
    numeroFactura: 'F001-00001228',
    cliente: 'Consultores Asociados del Peru',
    fechaEmision: '2026-07-18',
    formaPago: 'Contado',
    moneda: 'PEN',
    totalImporte: 730,
    estado: 'Pendiente',
  },
  {
    idDocumentoElectronico: 108,
    numeroFactura: 'F001-00001227',
    cliente: 'Distribuidora Central S.A.C.',
    fechaEmision: '2026-07-15',
    formaPago: 'Crédito',
    moneda: 'USD',
    totalImporte: 2195,
    estado: 'Aceptada',
  },
] satisfies EntradaListaFactura[];

export const CLASES_ESTADO_LISTADO_FACTURA: Record<string, string> = {
  Aceptada: 'bg-emerald-100 text-emerald-700',
  Pendiente: 'bg-amber-100 text-amber-700',
  Rechazada: 'bg-red-100 text-red-700',
  Anulada: 'bg-slate-200 text-slate-600',
};

export const URL_PUBLICA_FACTURA_MOCK =
  'https://facturacion.maximilian.pe/comprobante/';

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

export const ID_FORMA_PAGO_CONTADO = 1;
export const ID_TIPO_DOCUMENTO_SUNAT_RUC = 4;
export const IDS_TIPO_COMPROBANTE_CLIENTE_RUC = [1, 3] as const;
export const ID_TIPO_COMPROBANTE_BOLETA = 3;
export const PORCENTAJE_IGV_PREDETERMINADO = 18;
export const LIMITE_CARACTERES_ORDEN_COMPRA = 20;
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

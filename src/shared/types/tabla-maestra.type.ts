export const TablaMaestraId = {
  TIPO_PERSONA: 1,
  PAIS: 2,
  IDIOMA: 4,
  TIPO_TRAMITE: 6,
  ROLES: 8,
  TIPO_REG_TRIBUTARIO: 9,
  TIPO_FORMATO_INFORME: 11,
  MONEDA: 12,
  TIPO_CONTACTO: 14,
  AREA_TRABAJO: 35,
  ESTADO_CLIENTE: 36,
  PRODUCTO: 37,
  CLASE_INFORME: 37,
  FORMATO_ARCHIVO: 34,
  EMPRESA_ATENCION: 38,
  PLANTILLA_INFORME: 39,
  ESTADO_PEDIDO: 40,
  TIPO_DOCUMENTO: 41,
  TIPO_PLAZO_CREDITO: 42,
  TIPO_EMPRESA: 44,
  CIUDAD: 45,
  MES: 46,
  SECTOR_ECONOMICO: 47,
  ACTIVIDAD_ECONOMICA: 48,
  CATEGORIA_CIIU: 48,
  TIPO_LOCAL: 49,
  TIPO_BALANCE: 50,
  ESTADO_FINANCIERO: 51,
  TIPO_PROVEEDOR: 52,
  ESTADO_INFORME: 53,
  ETAPA_ASIGNACION: 53,
  TIPO_DOCUMENTO_IDENTIDAD: 54,
  ESTADO_CIVIL: 55,
  PROFESION: 56,
  CLASE_CIIU: 57,
  LIMITE_CREDITO_PROVEEDOR: 58,
  TIEMPO_CREDITO_VENTAS: 59,
  CARGO_EJECUTIVO: 60,
  CARGO_DIRECTORIO: 60,
  NIVEL_CONFIABILIDAD: 61,
  TIPO_EVIDENCIA: 62,
  FASE_EVIDENCIA: 63,
  OBLIGACION_BOLSA: 64,
  BOOLEAN: 64,
  EMITIR_PREFACTURA: 64,
  FORMATO_FECHA_INFORME: 65,
  CATEGORIA_NOTICIA: 66,
  ESTADO_INF_CREDITICIO: 66,
  ESTADO_FACTURACION: 67,
  TIPO_DOCUMENTO_SUNAT: 70,
  TIPO_DOCUMENTO_COMPROBANTE: 71,
  TIPO_OPERACION_SUNAT: 72,
  MONEDA_SUNAT: 73,
  FORMA_PAGO_SUNAT: 74,
  ESTADO_ASIGNACION: 98,
  PAGINACION_FRACTAL: 99,
  EFICIENCIA_CUMPLIMIENTO: 101,
} as const;

export type TablaMaestraId =
  (typeof TablaMaestraId)[keyof typeof TablaMaestraId];

export type EntradaTablaMaestra = {
  idEmpresa: number;
  idTablaMaestra: number | null;
  idMaestro: number;
  descripcion: string;
  num1: number | null;
  num2: number | null;
  num3: number | null;
  string1: string | null;
  string2: string | null;
  string3: string | null;
  string4?: string | null;
  string5?: string | null;
  string6?: string | null;
  string7?: string | null;
  date1: string | null;
  date2: string | null;
  date3: string | null;
};

export type MasterTableResponse = EntradaTablaMaestra[];

export interface ParametrosListadoTablaMaestra {
  idMaestro: number;
  busqueda?: string;
  numPag: number;
}

export interface RespuestaListadoTablaMaestra {
  listaTablaMaestra: EntradaTablaMaestra[];
  totalRegistros: number;
  totalPaginas: number;
}

export interface TablaMaestraCrearRequest {
  idMaestro: number;
  idIdioma?: number | null;
  inputText?: string | null;
  inputText2?: string | null;
  descripcion?: string;
  num1?: number | null;
  num2?: number | null;
  num3?: number | null;
  string1?: string | null;
  string2?: string | null;
  string3?: string | null;
  string4?: string | null;
  string5?: string | null;
  string6?: string | null;
  string7?: string | null;
  date1?: string | null;
  date2?: string | null;
  date3?: string | null;
}

export interface TablaMaestraEditarRequest extends TablaMaestraCrearRequest {
  idTablaMaestra?: number;
}

export interface TablaMaestraGuardarResponse {
  idTablaMaestra?: number;
  idMaestro?: number;
  idIdioma?: number | null;
  inputText?: string | null;
  inputText2?: string | null;
  descripcion?: string;
  num1?: number | null;
  num2?: number | null;
  num3?: number | null;
  string1?: string | null;
  string2?: string | null;
  string3?: string | null;
  string4?: string | null;
  string5?: string | null;
  string6?: string | null;
  string7?: string | null;
  date1?: string | null;
  date2?: string | null;
  date3?: string | null;
}

const descripcionesTablaMaestraPorId: Partial<Record<TablaMaestraId, string>> =
  {
    [TablaMaestraId.TIPO_PERSONA]: "TIPO PERSONA",
    [TablaMaestraId.PAIS]: "PAIS",
    [TablaMaestraId.IDIOMA]: "IDIOMA",
    [TablaMaestraId.TIPO_TRAMITE]: "TIPO DE TRAMITE",
    [TablaMaestraId.ROLES]: "ROLES",
    [TablaMaestraId.TIPO_REG_TRIBUTARIO]: "TIPO REG TRIBUTARIO",
    [TablaMaestraId.MONEDA]: "MONEDA",
    [TablaMaestraId.TIPO_CONTACTO]: "TIPO CONTACTO",
    [TablaMaestraId.AREA_TRABAJO]: "AREA TRABAJO",
    [TablaMaestraId.ESTADO_CLIENTE]: "ESTADO DEL CLIENTE",
    [TablaMaestraId.FORMATO_ARCHIVO]: "FORMATO ARCHIVO",
    [TablaMaestraId.EMPRESA_ATENCION]: "EMPRESA ATENCION",
    [TablaMaestraId.PLANTILLA_INFORME]: "PLANTILLA DOCUMENTO",
    [TablaMaestraId.ESTADO_PEDIDO]: "ESTADO PEDIDO",
    [TablaMaestraId.TIPO_DOCUMENTO]: "TIPO DOCUMENTO",
    [TablaMaestraId.TIPO_PLAZO_CREDITO]: "TIPO PLAZO CREDITO",
    [TablaMaestraId.TIPO_EMPRESA]: "TIPO EMPRESA",
    [TablaMaestraId.CIUDAD]: "CIUDAD",
    [TablaMaestraId.MES]: "MES",
    [TablaMaestraId.SECTOR_ECONOMICO]: "SECTOR ECONOMICO",
    [TablaMaestraId.ACTIVIDAD_ECONOMICA]: "CATEGORIA CIIU",
    [TablaMaestraId.TIPO_LOCAL]: "TIPO DE LOCAL",
    [TablaMaestraId.TIPO_BALANCE]: "TIPO DE BALANCE",
    [TablaMaestraId.ESTADO_FINANCIERO]: "ESTADO FINANCIERO",
    [TablaMaestraId.TIPO_PROVEEDOR]: "TIPO DE PROVEEDOR",
    [TablaMaestraId.TIPO_DOCUMENTO_IDENTIDAD]: "TIPO DOCUMENTO IDENTIDAD",
    [TablaMaestraId.ESTADO_CIVIL]: "ESTADO CIVIL",
    [TablaMaestraId.PROFESION]: "PROFESION",
    [TablaMaestraId.LIMITE_CREDITO_PROVEEDOR]: "LIMITE DE CREDITO PROVEEDOR",
    [TablaMaestraId.TIEMPO_CREDITO_VENTAS]: "TIEMPO CREDITO",
    [TablaMaestraId.CARGO_DIRECTORIO]: "CARGO EJECUTIVO",
    [TablaMaestraId.NIVEL_CONFIABILIDAD]: "NIVEL CONFIABILIDAD",
    [TablaMaestraId.TIPO_EVIDENCIA]: "TIPO ARCHIVO INFORME",
    [TablaMaestraId.FASE_EVIDENCIA]: "FASE INFORME",
    [TablaMaestraId.OBLIGACION_BOLSA]: "BOOLEAN",
    [TablaMaestraId.FORMATO_FECHA_INFORME]: "FORMATO FECHA INFORME",
    [TablaMaestraId.CATEGORIA_NOTICIA]: "ESTADO INF CREDITICIO",
    [TablaMaestraId.TIPO_DOCUMENTO_SUNAT]: "TIPO DOCUMENTO SUNAT",
    [TablaMaestraId.TIPO_DOCUMENTO_COMPROBANTE]: "TIPO DOCUMENTO COMPROBANTE",
    [TablaMaestraId.TIPO_OPERACION_SUNAT]: "TIPO OPERACION",
    [TablaMaestraId.MONEDA_SUNAT]: "SUNAT MONEDA",
    [TablaMaestraId.FORMA_PAGO_SUNAT]: "SUNAT FORMA PAGO",
    [TablaMaestraId.ESTADO_ASIGNACION]: "ESTADO ASIGNACION",
    [TablaMaestraId.ESTADO_INFORME]: "ESTADO INFORME",
    [TablaMaestraId.CLASE_CIIU]: "CLASE CIIU",
    [TablaMaestraId.PAGINACION_FRACTAL]: "PAGINACION FRACTAL",
    [TablaMaestraId.EFICIENCIA_CUMPLIMIENTO]: "CORTE % CUMPLIMIENTO",
  };

export function obtenerDescripcionTablaMaestra(
  idMaestro: number,
  descripcionBase?: string,
) {
  const descripcion =
    descripcionesTablaMaestraPorId[idMaestro as TablaMaestraId];
  return descripcion ?? descripcionBase?.trim().toUpperCase() ?? "";
}

export function obtenerSiguienteNumTablaMaestra(
  opciones: EntradaTablaMaestra[],
) {
  return (
    opciones.reduce((maximo, opcion) => Math.max(maximo, opcion.num1 ?? 0), 0) +
    1
  );
}

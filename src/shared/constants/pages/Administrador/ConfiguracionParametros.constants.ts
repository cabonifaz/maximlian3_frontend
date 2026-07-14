export const PARAMETROS_DISPONIBLES: ParametroDisponible[] = [
  { idMaestro: TablaMaestraId.MONEDA, etiqueta: "Tipo de moneda" },
  { idMaestro: TablaMaestraId.PAIS, etiqueta: "Pais" },
  { idMaestro: TablaMaestraId.IDIOMA, etiqueta: "Idioma" },
  { idMaestro: TablaMaestraId.TIPO_TRAMITE, etiqueta: "Tipo de tramite" },
  { idMaestro: TablaMaestraId.ROLES, etiqueta: "Roles" },
  {
    idMaestro: TablaMaestraId.TIPO_REG_TRIBUTARIO,
    etiqueta: "Tipo reg. tributario",
  },
  { idMaestro: TablaMaestraId.TIPO_CONTACTO, etiqueta: "Tipo contacto" },
  { idMaestro: TablaMaestraId.AREA_TRABAJO, etiqueta: "Area trabajo" },
  { idMaestro: TablaMaestraId.ESTADO_CLIENTE, etiqueta: "Estado del cliente" },
  { idMaestro: TablaMaestraId.PRODUCTO, etiqueta: "Producto" },
  { idMaestro: TablaMaestraId.EMPRESA_ATENCION, etiqueta: "Empresa atencion" },
  {
    idMaestro: TablaMaestraId.PLANTILLA_INFORME,
    etiqueta: "Plantilla informe",
  },
  { idMaestro: TablaMaestraId.TIPO_DOCUMENTO, etiqueta: "Tipo documento" },
  {
    idMaestro: TablaMaestraId.TIPO_PLAZO_CREDITO,
    etiqueta: "Tipo plazo credito",
  },
  { idMaestro: TablaMaestraId.TIPO_EMPRESA, etiqueta: "Tipo empresa" },
  { idMaestro: TablaMaestraId.CIUDAD, etiqueta: "Ciudad" },
  { idMaestro: TablaMaestraId.MES, etiqueta: "Mes" },
  { idMaestro: TablaMaestraId.SECTOR_ECONOMICO, etiqueta: "Sector economico" },
  {
    idMaestro: TablaMaestraId.CATEGORIA_CIIU,
    etiqueta: "Categoria CIIU",
  },
  { idMaestro: TablaMaestraId.TIPO_LOCAL, etiqueta: "Tipo de local" },
  { idMaestro: TablaMaestraId.TIPO_BALANCE, etiqueta: "Tipo de balance" },
  {
    idMaestro: TablaMaestraId.ESTADO_FINANCIERO,
    etiqueta: "Estado financiero",
  },
  { idMaestro: TablaMaestraId.TIPO_PROVEEDOR, etiqueta: "Tipo de proveedor" },
  {
    idMaestro: TablaMaestraId.TIPO_DOCUMENTO_IDENTIDAD,
    etiqueta: "Tipo documento identidad",
  },
  { idMaestro: TablaMaestraId.ESTADO_CIVIL, etiqueta: "Estado civil" },
  { idMaestro: TablaMaestraId.PROFESION, etiqueta: "Profesion" },
  { idMaestro: TablaMaestraId.ETAPA_ASIGNACION, etiqueta: "Fase asignacion" },
  { idMaestro: TablaMaestraId.CLASE_CIIU, etiqueta: "Clase CIIU" },
  {
    idMaestro: TablaMaestraId.LIMITE_CREDITO_PROVEEDOR,
    etiqueta: "Limite credito proveedor",
  },
  {
    idMaestro: TablaMaestraId.TIEMPO_CREDITO_VENTAS,
    etiqueta: "Tiempo credito",
  },
  { idMaestro: TablaMaestraId.CARGO_EJECUTIVO, etiqueta: "Cargo ejecutivo" },
  {
    idMaestro: TablaMaestraId.NIVEL_CONFIABILIDAD,
    etiqueta: "Nivel confiabilidad",
  },
  {
    idMaestro: TablaMaestraId.TIPO_EVIDENCIA,
    etiqueta: "Tipo archivo informe",
  },
  { idMaestro: TablaMaestraId.FASE_EVIDENCIA, etiqueta: "Fase informe" },
  {
    idMaestro: TablaMaestraId.BOOLEAN,
    etiqueta: "Boolean",
  },
  {
    idMaestro: TablaMaestraId.FORMATO_FECHA_INFORME,
    etiqueta: "Formato fecha informe",
  },
  {
    idMaestro: TablaMaestraId.ESTADO_INF_CREDITICIO,
    etiqueta: "Estado inf crediticio",
  },
];

export const REGISTROS_POR_PAGINA = 10;

export const CONFIGURACION_CAMPOS_POR_MAESTRO: Partial<
  Record<TablaMaestraId, ConfiguracionCamposParametro>
> = {
  [TablaMaestraId.ROLES]: {
    etiquetaCodigo: "Descripcion",
    codigoRequerido: true,
    etiquetaDescripcion: "Rol",
    codigoDespuesDescripcion: true,
  },
  [TablaMaestraId.MONEDA]: {
    etiquetaCodigo: "Codigo",
    etiquetaDetalle: "Simbolo",
  },
  [TablaMaestraId.SECTOR_ECONOMICO]: {
    etiquetaCodigo: "Codigo",
    codigoRequerido: true,
  },
  [TablaMaestraId.CIUDAD]: {
    etiquetaReferencia: "Pais",
    referenciaRequerida: true,
    idMaestroReferencia: TablaMaestraId.PAIS,
  },
  [TablaMaestraId.CATEGORIA_CIIU]: {
    etiquetaCodigo: "Codigo",
    codigoRequerido: true,
    etiquetaReferencia: "Sector padre",
    referenciaRequerida: true,
    idMaestroReferencia: TablaMaestraId.SECTOR_ECONOMICO,
    mostrarReferenciaConCodigo: true,
  },
  [TablaMaestraId.CLASE_CIIU]: {
    etiquetaCodigo: "Codigo",
    codigoRequerido: true,
    etiquetaReferencia: "Categoria padre",
    referenciaRequerida: true,
    idMaestroReferencia: TablaMaestraId.CATEGORIA_CIIU,
    mostrarReferenciaConCodigo: true,
  },
  [TablaMaestraId.FORMATO_FECHA_INFORME]: {
    etiquetaCodigo: "Formato",
    codigoRequerido: true,
  },
  [TablaMaestraId.ESTADO_ASIGNACION]: {
    etiquetaCodigo: "Color fondo",
    etiquetaDetalle: "Color texto",
  },
  [TablaMaestraId.ESTADO_INFORME]: {
    etiquetaCodigo: "Color fondo",
    etiquetaDetalle: "Color texto",
  },
};
import { TablaMaestraId, type EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";
import type { ConfiguracionCamposParametro } from "@maximilian/pages/Administrador/ConfiguracionParametros";

interface ParametroDisponible {
  idMaestro: number;
  etiqueta: string;
}

export const opcionesParametros: EntradaTablaMaestra[] = PARAMETROS_DISPONIBLES.map(
  (parametro) => ({
    idEmpresa: 0,
    idTablaMaestra: null,
    idMaestro: 0,
    descripcion: parametro.etiqueta,
    num1: parametro.idMaestro,
    num2: null,
    num3: null,
    string1: parametro.etiqueta,
    string2: null,
    string3: null,
    date1: null,
    date2: null,
    date3: null,
  }),
);

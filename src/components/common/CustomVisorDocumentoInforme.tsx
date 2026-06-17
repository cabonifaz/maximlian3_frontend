import type { DocumentoInformeBloque, DocumentoInformeGenerado } from "@maximilian/shared/types/informe.type";
import type { DatosInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

interface PropsCustomVisorDocumentoInforme {
  documento: DocumentoInformeGenerado;
  datosInvestigacion?: DatosInvestigacionAnalista;
  encabezado?: {
    pais: string;
    fecha: string;
    tipoSolicitud: string;
    analista: string;
    traductor: string;
  };
}

const alineacionClase: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
  justify: "text-justify",
};

type ValoresDocumento = Map<string, string>;
type ListasDocumento = Map<string, ValoresDocumento[]>;
type BloqueDocumentoRender = {
  bloque: DocumentoInformeBloque;
  valores: ValoresDocumento;
};
type EstilosDocumento = {
  style?: string;
  fontFamily?: string;
  fontSize?: number;
  lineSpacing?: number;
  align?: string;
  bold?: boolean;
  indent?: {
    left?: number;
    right?: number;
    unit?: string;
  };
  spaceBefore?: number;
  spaceAfter?: number;
  width?: number;
  widthUnit?: string;
  layout?: string;
  borders?: string;
  innerHorizontalBorders?: string;
  borderSize?: number;
  borderColor?: string;
  borderSpace?: number;
  cellBorders?: string;
  cellBorderValue?: string;
  cellMargins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  columnWidths?: number[];
  columnWidthsByCols?: Record<string, number[]>;
  headerAlign?: string;
  headerBold?: boolean;
  titleTextAlign?: string;
  titleSpaceBefore?: number;
  titleSpaceAfter?: number;
  tableAlign?: string;
  textAlign?: string;
  cellAlign?: string;
  headerTextAlign?: string;
  whiteSpace?: string;
};
type EstilosDocumentoCatalogo = DocumentoInformeGenerado["styles"];
type ConfiguracionPaginacionDocumento = NonNullable<DocumentoInformeGenerado["pagination"]>;

const paginacionDocumentoPorDefecto: Required<ConfiguracionPaginacionDocumento> = {
  maxPageWeightPortrait: 28,
  maxPageWeightLandscape: 20,
  maxTableWeightPortrait: 18,
  maxTableWeightLandscape: 13,
  keepTablesUnderRows: 0,
  tableMinWeight: 2.5,
  tableRowWeight: 0.78,
  tableHeaderWeight: 1.2,
  titleRowWeight: 2.35,
  longTextCharactersPerWeight: 85,
  longTextWeight: 0.78,
  maxSplitCharacters: 420,
  reserveEndTableWeight: 1.15,
  keepTitleWithNext: true,
  compactThreshold: 0.84,
};

function obtenerClaseAlineacion(alineacion?: string) {
  return alineacion ? alineacionClase[alineacion] ?? "text-left" : "text-left";
}

function limpiarTextoDocumento(texto: unknown) {
  if (texto === null || texto === undefined) return "\u00a0";
  const valor = String(texto).trim();
  return valor || "\u00a0";
}

function obtenerMargen(valor: number | undefined, respaldo: number) {
  return `${valor ?? respaldo}in`;
}

function obtenerDimensionImagen(valor: number | undefined, unidad?: string) {
  if (!valor) return undefined;
  if (unidad === "in" || unidad === "cm") return `${valor}${unidad}`;
  return `${valor}px`;
}

function obtenerDimensionDocumento(valor: number | undefined, unidad = "pt") {
  if (valor === undefined || valor === null) return undefined;
  if (unidad === "in" || unidad === "cm" || unidad === "px" || unidad === "pt") return `${valor}${unidad}`;
  return `${valor}pt`;
}

function obtenerGapDocumento(valor: number | undefined, unidad = "rem") {
  if (valor === undefined || valor === null) return undefined;
  if (unidad === "in" || unidad === "cm" || unidad === "px" || unidad === "pt" || unidad === "rem") return `${valor}${unidad}`;
  return `${valor}rem`;
}

function obtenerEstiloDocumento(estilos?: EstilosDocumento, respaldo?: EstilosDocumento): CSSProperties {
  const sangria = estilos?.indent ?? respaldo?.indent;
  return {
    fontFamily: estilos?.fontFamily ?? respaldo?.fontFamily,
    fontSize: obtenerDimensionDocumento(estilos?.fontSize ?? respaldo?.fontSize),
    lineHeight: estilos?.lineSpacing ?? respaldo?.lineSpacing,
    textAlign: (estilos?.align ?? respaldo?.align) as CSSProperties["textAlign"],
    marginLeft: obtenerDimensionDocumento(sangria?.left, sangria?.unit),
    marginRight: obtenerDimensionDocumento(sangria?.right, sangria?.unit),
    marginTop: obtenerDimensionDocumento(estilos?.spaceBefore ?? respaldo?.spaceBefore),
    marginBottom: obtenerDimensionDocumento(estilos?.spaceAfter ?? respaldo?.spaceAfter),
  };
}

function combinarEstilosDocumento(
  catalogo: EstilosDocumentoCatalogo | undefined,
  estilos?: EstilosDocumento,
  respaldo?: EstilosDocumento,
) {
  const estiloBase = catalogo?.default;
  const estiloNombrado = estilos?.style ? catalogo?.[estilos.style] : undefined;
  return {
    ...estiloBase,
    ...respaldo,
    ...estiloNombrado,
    ...estilos,
  } as EstilosDocumento;
}

function obtenerEstiloTablaDocumento(estilos: EstilosDocumento): CSSProperties {
  const alineacionTabla = estilos.tableAlign ?? estilos.align;
  const estiloBase = obtenerEstiloDocumento(estilos);
  const celdasSinBorde = estilos.cellBorders === "none" || estilos.cellBorderValue === "nil" || estilos.cellBorderValue === "none";
  const tieneBorde = estilos.borders === "single" && !celdasSinBorde;
  const tamanoBorde = tieneBorde ? Math.max((estilos.borderSize ?? 8) / 8, 1) : 0;
  return {
    ...estiloBase,
    width: obtenerDimensionDocumento(estilos.width, estilos.widthUnit),
    marginLeft: alineacionTabla === "center" || alineacionTabla === "right" ? "auto" : estiloBase.marginLeft,
    marginRight: alineacionTabla === "center" || alineacionTabla === "left" ? "auto" : estiloBase.marginRight,
    tableLayout: estilos.layout === "fixed" ? "fixed" : "auto",
    borderCollapse: "collapse",
    borderWidth: tamanoBorde,
    borderStyle: tieneBorde ? "solid" : "none",
    borderColor: estilos.borderColor ? `#${estilos.borderColor}` : undefined,
    textAlign: (estilos.textAlign ?? estilos.cellAlign ?? "left") as CSSProperties["textAlign"],
  };
}

function obtenerEstiloCeldaDocumento(
  estilos: EstilosDocumento,
  contexto?: { rowIndex?: number; rowCount?: number },
): CSSProperties {
  const margenes = estilos.cellMargins;
  const celdaSinBorde = estilos.cellBorders === "none" || estilos.cellBorderValue === "nil" || estilos.cellBorderValue === "none";
  const tieneBorde = estilos.borders === "single" && !celdaSinBorde;
  const tamanoBorde = tieneBorde ? Math.max((estilos.borderSize ?? 8) / 8, 1) : 0;
  const sinBordesHorizontalesInternos = estilos.innerHorizontalBorders === "none" && tieneBorde && contexto?.rowIndex !== undefined;
  const esPrimeraFila = contexto?.rowIndex === 0;
  const esUltimaFila = contexto?.rowIndex === (contexto?.rowCount ?? 0) - 1;
  return {
    paddingTop: obtenerDimensionDocumento(margenes?.top ?? 0, "in"),
    paddingBottom: obtenerDimensionDocumento(margenes?.bottom ?? 0, "in"),
    paddingLeft: obtenerDimensionDocumento(margenes?.left ?? 0.03, "in"),
    paddingRight: obtenerDimensionDocumento(margenes?.right ?? 0.03, "in"),
    borderWidth: tamanoBorde,
    borderTopWidth: sinBordesHorizontalesInternos && !esPrimeraFila ? 0 : tamanoBorde,
    borderBottomWidth: sinBordesHorizontalesInternos && !esPrimeraFila && !esUltimaFila ? 0 : tamanoBorde,
    borderStyle: tieneBorde ? "solid" : "none",
    borderColor: estilos.borderColor ? `#${estilos.borderColor}` : undefined,
    textAlign: (estilos.cellAlign ?? estilos.textAlign ?? "left") as CSSProperties["textAlign"],
    whiteSpace: estilos.whiteSpace as CSSProperties["whiteSpace"],
  };
}

function obtenerEstiloCeldaCabeceraDocumento(estilos: EstilosDocumento): CSSProperties {
  return {
    ...obtenerEstiloCeldaDocumento(estilos),
    textAlign: (estilos.headerTextAlign ?? estilos.headerAlign ?? estilos.cellAlign ?? estilos.textAlign ?? "left") as CSSProperties["textAlign"],
  };
}

function obtenerEstiloCeldaTituloDocumento(
  estilos: EstilosDocumento,
  contexto?: { rowIndex?: number; rowCount?: number },
): CSSProperties {
  const estiloBase = obtenerEstiloCeldaDocumento(estilos, contexto);
  return {
    ...estiloBase,
    paddingTop: obtenerDimensionDocumento(estilos.titleSpaceBefore) ?? estiloBase.paddingTop,
    paddingBottom: obtenerDimensionDocumento(estilos.titleSpaceAfter) ?? estiloBase.paddingBottom,
    textAlign: (estilos.titleTextAlign
      ?? estilos.cellAlign
      ?? estilos.textAlign
      ?? "left") as CSSProperties["textAlign"],
  };
}

function obtenerAnchosColumnasDocumento(estilos: EstilosDocumento, totalColumnas: number) {
  return estilos.columnWidths ?? estilos.columnWidthsByCols?.[String(totalColumnas)];
}

function obtenerColumnasTabla(bloque: Extract<DocumentoInformeBloque, { type: "table" }>) {
  const totalColumnas = bloque.cols ?? bloque.header?.length ?? bloque.rows?.[0]?.length ?? 1;
  return Math.max(totalColumnas, 1);
}

function esImagenDocumento(valor: unknown): valor is Extract<DocumentoInformeBloque, { type: "image" }> {
  return typeof valor === "object" && valor !== null && (valor as { type?: unknown }).type === "image";
}

function normalizarClaveDocumento(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.]/g, "")
    .toLowerCase();
}

function normalizarEtiquetaDocumento(texto: unknown) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toUpperCase();
}

function agregarValorDocumento(valores: Map<string, string>, clave: string, valor: unknown) {
  const texto = valor === null || valor === undefined ? "" : String(valor).trim();
  if (!texto) return;
  valores.set(normalizarClaveDocumento(clave), texto);
}

function convertirKebabACamel(clave: string) {
  return clave.replace(/-([a-z0-9])/g, (_, letra: string) => letra.toUpperCase());
}

function convertirCamelAPascal(clave: string) {
  return clave ? `${clave.charAt(0).toUpperCase()}${clave.slice(1)}` : clave;
}

function agregarAliasDocumento(valores: Map<string, string>, alias: string, valor: unknown) {
  agregarValorDocumento(valores, alias, valor);
}

function agregarVariantesClaveDocumento(valores: ValoresDocumento, clave: string, valor: unknown, prefijo?: string) {
  const camel = convertirKebabACamel(clave);
  const pascal = convertirCamelAPascal(camel);
  const claves = [clave, camel, pascal];

  claves.forEach((claveVariante) => {
    agregarValorDocumento(valores, claveVariante, valor);
    if (prefijo) agregarValorDocumento(valores, `${prefijo}.${claveVariante}`, valor);
  });
}

function agregarObjetoDocumento(valores: Map<string, string>, prefijo: string, registro: Record<string, unknown>) {
  Object.entries(registro).forEach(([clave, valor]) => {
    agregarValorDocumento(valores, clave, valor);
    agregarValorDocumento(valores, `${prefijo}.${clave}`, valor);
  });
}

function construirValoresDocumento(
  datosInvestigacion: DatosInvestigacionAnalista | undefined,
  encabezado: PropsCustomVisorDocumentoInforme["encabezado"],
) {
  const valores = new Map<string, string>();

  if (encabezado) {
    agregarAliasDocumento(valores, "pedido.Pais", encabezado.pais);
    agregarAliasDocumento(valores, "pedido.FechaSolicitud", encabezado.fecha);
    agregarAliasDocumento(valores, "pedido.TipoInforme", encabezado.tipoSolicitud);
    agregarAliasDocumento(valores, "pedido.Analista", encabezado.analista);
    agregarAliasDocumento(valores, "pedido.Traductor", encabezado.traductor);
  }

  if (!datosInvestigacion) return valores;

  agregarObjetoDocumento(valores, "resumen", datosInvestigacion.resumen as unknown as Record<string, unknown>);
  agregarObjetoDocumento(valores, "identificacion", datosInvestigacion.identificacion as unknown as Record<string, unknown>);
  agregarObjetoDocumento(valores, "aspectosLegales", datosInvestigacion.aspectosLegales as unknown as Record<string, unknown>);
  agregarObjetoDocumento(valores, "operacionPrincipal", datosInvestigacion.operacionPrincipal as unknown as Record<string, unknown>);
  agregarObjetoDocumento(valores, "informacionFinanciera", datosInvestigacion.informacionFinanciera as unknown as Record<string, unknown>);
  agregarObjetoDocumento(valores, "referencias", datosInvestigacion.referencias as unknown as Record<string, unknown>);
  agregarObjetoDocumento(valores, "datosGenerales", datosInvestigacion.datosGenerales as unknown as Record<string, unknown>);

  const { identificacion, aspectosLegales, operacionPrincipal, informacionFinanciera, referencias, datosGenerales } = datosInvestigacion;

  agregarAliasDocumento(valores, "Nombre", identificacion.nombreEmpresa);
  agregarAliasDocumento(valores, "NombreComercial", identificacion.nombreComercial);
  agregarAliasDocumento(valores, "Pais", identificacion.pais || datosInvestigacion.resumen.pais);
  agregarAliasDocumento(valores, "TaxIdType", identificacion.tipoIdentificacionFiscal);
  agregarAliasDocumento(valores, "TaxNum", identificacion.numeroIdentificacionFiscal);
  agregarAliasDocumento(valores, "IdEstadoManual", identificacion.estadoActual);
  agregarAliasDocumento(valores, "Direccion", identificacion.direccionPrincipal);
  agregarAliasDocumento(valores, "Ubigeo", identificacion.ciudadEstadoProvincia);
  agregarAliasDocumento(valores, "Telefono", identificacion.numeroTelefono);
  agregarAliasDocumento(valores, "Email", identificacion.correoElectronico);
  agregarAliasDocumento(valores, "PaginaWeb", identificacion.paginaWeb);
  agregarAliasDocumento(valores, "ObservacionesIdentificacion", identificacion.datosAdicionales);
  agregarAliasDocumento(valores, "OpinionCredito", datosGenerales.opinionCredito);
  agregarAliasDocumento(valores, "InformacionGeneral", datosGenerales.informacionGeneral);

  agregarAliasDocumento(valores, "IdTipoEmpresa", aspectosLegales.tipoEmpresa);
  agregarAliasDocumento(valores, "FechaConstitucion", aspectosLegales.fechaConstitucion);
  agregarAliasDocumento(valores, "IdCiudadRegistro", aspectosLegales.ciudadRegistro);
  agregarAliasDocumento(valores, "IdRegistro", aspectosLegales.registro);
  agregarAliasDocumento(valores, "IdPlazo", aspectosLegales.condiciones);
  agregarAliasDocumento(valores, "IdOperacionesCambioDivisas", aspectosLegales.operacionesCambioDivisas);
  agregarAliasDocumento(valores, "CapitalPagado", aspectosLegales.capitalDesembolsado);
  agregarAliasDocumento(valores, "FechaUltimoIncremento", aspectosLegales.ultimaAmpliacion);
  agregarAliasDocumento(valores, "PatrimonioNeto", aspectosLegales.patrimonioNeto);
  agregarAliasDocumento(valores, "CotizaBolsa", aspectosLegales.obligacionBolsa);
  agregarAliasDocumento(valores, "TipoCambio", aspectosLegales.tipoCambio);
  agregarAliasDocumento(valores, "Antecedentes", aspectosLegales.antecedentes);
  agregarAliasDocumento(valores, "AspectosLegales", aspectosLegales.aspectosLegales);
  agregarAliasDocumento(valores, "ComentariosAspectoLegal", aspectosLegales.comentariosEmpresasRelacionadas);

  agregarAliasDocumento(valores, "IdSector", operacionPrincipal.sector);
  agregarAliasDocumento(valores, "Actividad", operacionPrincipal.actividad);
  agregarAliasDocumento(valores, "IdIsicCategoria", operacionPrincipal.categoriaCiiu);
  agregarAliasDocumento(valores, "IdIsicClase", operacionPrincipal.claseCiiu);
  agregarAliasDocumento(valores, "ActividadPrincipal", operacionPrincipal.actividadPrincipal);
  agregarAliasDocumento(valores, "VentasContado", operacionPrincipal.ventasContadoPorcentaje);
  agregarAliasDocumento(valores, "VentasContadoText", operacionPrincipal.ventasContadoDetalle);
  agregarAliasDocumento(valores, "VentasCredito", operacionPrincipal.ventasCreditoPorcentaje);
  agregarAliasDocumento(valores, "VentasCreditoText", operacionPrincipal.ventasCreditoDetalle);
  agregarAliasDocumento(valores, "VentasNacionales", operacionPrincipal.territorioVentasPorcentaje);
  agregarAliasDocumento(valores, "VentasNacionalesText", operacionPrincipal.territorioVentasDetalle);
  agregarAliasDocumento(valores, "VentasInternacionales", operacionPrincipal.ventasExtranjeroPorcentaje);
  agregarAliasDocumento(valores, "NumeroEmpleados", operacionPrincipal.numeroEmpleados);
  agregarAliasDocumento(valores, "NumeroEmpleadosText", operacionPrincipal.numeroEmpleadosDetalle);
  agregarAliasDocumento(valores, "ComentariosOperaciones", operacionPrincipal.comentariosOperaciones);
  agregarAliasDocumento(valores, "DatosAdicionales", identificacion.datosAdicionales);

  agregarAliasDocumento(valores, "ContenidoInformacionFinanciera", informacionFinanciera.contenido);
  agregarAliasDocumento(valores, "ComentarioInformacionFinanciera", informacionFinanciera.comentariosFinancieros);
  agregarAliasDocumento(valores, "ActivosFijos", informacionFinanciera.activosFijos);
  agregarAliasDocumento(valores, "Seguros", informacionFinanciera.seguros);
  agregarAliasDocumento(valores, "ComentarioProveedor", referencias.comentariosProveedores);
  agregarAliasDocumento(valores, "ReferenciaBanco", referencias.referenciasBancos);
  agregarAliasDocumento(valores, "Litigios", referencias.litigios);
  agregarAliasDocumento(valores, "RiesgoPrincipal", referencias.riesgoPrincipal);

  return valores;
}

function construirContextoBalanceDocumento(balance: DatosInvestigacionAnalista["balances"][number]) {
  const valores: ValoresDocumento = new Map();

  agregarObjetoDocumento(valores, "balance", balance as unknown as Record<string, unknown>);
  agregarAliasDocumento(valores, "FechaBalance", balance.fechaInicio || balance.fecha);
  agregarAliasDocumento(valores, "FechaHasta", balance.fechaFin || balance.fecha);
  agregarAliasDocumento(valores, "Fecha", balance.fecha);
  agregarAliasDocumento(valores, "IdMoneda", balance.operacionCambio || balance.idMoneda);
  agregarAliasDocumento(valores, "TipoCambio", balance.tipoCambio);
  agregarAliasDocumento(valores, "FechaBalanceTexto", balance.fecha);

  const registros = balance.detalleCuentas?.registrosEstadoFinanciero ?? {};
  Object.entries(registros).forEach(([clave, valor]) => {
    agregarVariantesClaveDocumento(valores, clave, valor);
    agregarVariantesClaveDocumento(valores, clave, valor, "CuentaBalance");
  });

  const balanceGeneral = balance.detalleCuentas?.balanceGeneral;
  if (balanceGeneral) {
    agregarAliasDocumento(valores, "CuentaBalance.TotalActivoCorriente", balanceGeneral.totalCorrientes);
    agregarAliasDocumento(valores, "CuentaBalance.TotalActivoNoCorriente", balanceGeneral.totalNoCorrientes);
    agregarAliasDocumento(valores, "CuentaBalance.TotalActivo", balanceGeneral.totalActivos);
    agregarAliasDocumento(valores, "CuentaBalance.TotalPasivoCorriente", balanceGeneral.totalPasivosCorrientes);
    agregarAliasDocumento(valores, "CuentaBalance.TotalPasivoNoCorriente", balanceGeneral.totalPasivosNoCorrientes);
    agregarAliasDocumento(valores, "CuentaBalance.TotalPasivos", balanceGeneral.totalPasivos);
    agregarAliasDocumento(valores, "CuentaBalance.TotalPatrimonio", balanceGeneral.patrimonio);
    agregarAliasDocumento(valores, "CuentaBalance.TotalPasivoPatrimonio", balanceGeneral.totalPasivoPatrimonio);
  }

  const gananciasPerdidas = balance.detalleCuentas?.estadoGananciasPerdidas;
  if (gananciasPerdidas) {
    agregarAliasDocumento(valores, "CuentaBalance.IngresosOrdinarios", gananciasPerdidas.ventasNetas);
    agregarAliasDocumento(valores, "CuentaBalance.GananciaNeta", gananciasPerdidas.utilidadGanancia);
  }

  const ratios = balance.detalleCuentas?.ratios;
  if (ratios) {
    agregarAliasDocumento(valores, "CuentaBalance.IndiceLiquidez", ratios.liquidez);
    agregarAliasDocumento(valores, "CuentaBalance.CapitalTrabajo", ratios.capitalTrabajo);
    agregarAliasDocumento(valores, "CuentaBalance.RatioEndeudamiento", ratios.endeudamiento);
    agregarAliasDocumento(valores, "CuentaBalance.RatioRentabilidad", ratios.rentabilidad);
  }

  return valores;
}

function construirListasDocumento(datosInvestigacion: DatosInvestigacionAnalista | undefined) {
  const listas: ListasDocumento = new Map();
  if (!datosInvestigacion) return listas;

  listas.set(
    normalizarClaveDocumento("Balances"),
    datosInvestigacion.balances.map(construirContextoBalanceDocumento),
  );

  return listas;
}

const aliasPorEtiquetaDocumento: Record<string, string> = {
  "COUNTRY": "pedido.Pais",
  "DATE OF REQUEST": "pedido.FechaSolicitud",
  "TYPE OF REPORT": "pedido.TipoInforme",
  "ANALYST": "pedido.Analista",
  "TRASLATOR": "pedido.Traductor",
  "TRANSLATOR": "pedido.Traductor",
  "COMPANY NAME": "Nombre",
  "TRADE NAME": "NombreComercial",
  "TAX ID TYPE": "TaxIdType",
  "TAX ID NUMBER": "TaxNum",
  "CURRENT STATUS": "IdEstadoManual",
  "ADDRESS": "Direccion",
  "CITY PROVINCE STATE": "Ubigeo",
  "TELEPHONE": "Telefono",
  "EMAIL": "Email",
  "WEBSITE": "PaginaWeb",
  "REMARKS OF IDENTIFICATION": "ObservacionesIdentificacion",
  "TYPE OF COMPANY": "IdTipoEmpresa",
  "INCORPORATION DATE": "FechaConstitucion",
  "REGISTERED IN": "IdCiudadRegistro",
  "REGISTRATION": "IdRegistro",
  "DURATION": "IdPlazo",
  "PAID UP CAPITAL": "CapitalPagado",
  "LAST CAPITAL INCREASE": "FechaUltimoIncremento",
  "NET WORTH": "PatrimonioNeto",
  "LISTED AT STOCK EXCHANGE": "CotizaBolsa",
  "RATE OF EXCHANGE": "TipoCambio",
  "BACKGROUND": "Antecedentes",
  "LEGAL ASPECTS": "AspectosLegales",
  "COMMENTS ON RELATED COMPANIES": "ComentariosAspectoLegal",
  "SECTOR": "IdSector",
  "ACTIVITY": "Actividad",
  "ISIC CATEGORY": "IdIsicCategoria",
  "ISIC CLASS": "IdIsicClase",
  "MAIN ACTIVITY": "ActividadPrincipal",
  "N OF EMPLOYEES": "NumeroEmpleados",
  "COMMENTS AS TO OPERATIONS": "ComentariosOperaciones",
  "FINANCIAL COMMENTS": "ComentarioInformacionFinanciera",
  "FIXED ASSETS": "ActivosFijos",
  "INSURANCE": "Seguros",
  "COMMENTS OF SUPPLIERS": "ComentarioProveedor",
  "BANKS REFERENCES": "ReferenciaBanco",
  "LITIGATIONS": "Litigios",
};

function resolverTextoDocumento(texto: unknown, valores: Map<string, string>, etiquetaFila?: unknown) {
  if (texto === null || texto === undefined) return "";
  if (typeof texto === "object") return "";
  let contenido = String(texto);

  contenido = contenido.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, clave: string) => {
    return valores.get(normalizarClaveDocumento(clave)) ?? "";
  });

  const etiquetaNormalizada = normalizarEtiquetaDocumento(etiquetaFila);
  const clavePorEtiqueta = aliasPorEtiquetaDocumento[etiquetaNormalizada];
  const valorPorEtiqueta = clavePorEtiqueta ? valores.get(normalizarClaveDocumento(clavePorEtiqueta)) : undefined;
  if (valorPorEtiqueta && /^\s*:?\s*\d+\s*$/.test(contenido)) {
    contenido = contenido.replace(/\d+/, valorPorEtiqueta);
  }

  return contenido
    .replace(/\s+\(\s*\)/g, "")
    .replace(/^\s*:\s*$/g, "")
    .replace(/^\s*:\s+/, ": ")
    .trim();
}

function tieneContenidoCelda(celda: unknown, valores: Map<string, string>) {
  if (esImagenDocumento(celda) && celda.src) return true;
  return limpiarTextoDocumento(resolverTextoDocumento(celda, valores)) !== "\u00a0";
}

function esFilaTitulo(fila: unknown[], totalColumnas: number, valores: Map<string, string>) {
  if (fila.some(esImagenDocumento)) return false;
  const celdasConContenido = fila.filter((celda) => tieneContenidoCelda(celda, valores));
  if (totalColumnas === 1) {
    const celda = celdasConContenido[0];
    const textoPlantilla = String(celda ?? "").trim();
    if (textoPlantilla.includes("{{")) return false;
    const texto = resolverTextoDocumento(celda, valores).trim();
    return texto.length > 0 && texto.length <= 80 && texto === texto.toLocaleUpperCase();
  }
  return celdasConContenido.length === 1 || fila.length < totalColumnas;
}

function obtenerPesoBloqueDocumento(
  bloque: DocumentoInformeBloque,
  paginacion: Required<ConfiguracionPaginacionDocumento>,
): number {
  if (bloque.type === "table") {
    return Math.max(
      paginacion.tableMinWeight,
      (bloque.rows?.length ?? 0) * paginacion.tableRowWeight + (bloque.header?.length ? paginacion.tableHeaderWeight : 0),
    );
  }
  if (bloque.type === "paragraph") return bloque.bold ? 0.85 : 0.7;
  if (bloque.type === "image") return 2;
  if (bloque.type === "each") {
    return (bloque.blocks ?? []).reduce((total, item) => total + obtenerPesoBloqueDocumento(item, paginacion), 0);
  }
  return 1;
}

function obtenerPesoFilaTablaDocumento(
  fila: unknown[],
  totalColumnas: number,
  valores: ValoresDocumento,
  paginacion: Required<ConfiguracionPaginacionDocumento>,
) {
  const celdas = Array.from({ length: totalColumnas }).map((_, indiceCelda) =>
    resolverTextoDocumento(fila[indiceCelda], valores, fila[0]),
  );
  const longitudMaxima = Math.max(...celdas.map((celda) => celda.length), 0);
  const esFilaTitulo = totalColumnas > 1 && celdas.slice(1).every((celda) => !celda.trim());
  const base = esFilaTitulo ? Math.min(paginacion.tableRowWeight, 0.65) : paginacion.tableRowWeight;
  return base
    + Math.max(0, Math.ceil(longitudMaxima / paginacion.longTextCharactersPerWeight) - 1) * paginacion.longTextWeight;
}

function dividirTextoEnPartesDocumento(texto: string, longitudMaxima: number) {
  if (texto.length <= longitudMaxima) return [texto];

  const partes: string[] = [];
  let restante = texto;

  while (restante.length > longitudMaxima) {
    const corteBase = restante.slice(0, longitudMaxima);
    const ultimoSalto = corteBase.lastIndexOf("\n");
    const ultimoEspacio = corteBase.lastIndexOf(" ");
    const indiceCorte = ultimoSalto > longitudMaxima * 0.45
      ? ultimoSalto + 1
      : ultimoEspacio > longitudMaxima * 0.65
        ? ultimoEspacio
        : longitudMaxima;
    partes.push(restante.slice(0, indiceCorte).trim());
    restante = restante.slice(indiceCorte).trim();
  }

  if (restante) partes.push(restante);
  return partes;
}

function dividirParrafoDocumento(
  bloque: Extract<DocumentoInformeBloque, { type: "paragraph" }>,
  valores: ValoresDocumento,
  longitudMaxima = 950,
): DocumentoInformeBloque[] {
  const textoResuelto = resolverTextoDocumento(bloque.text, valores);
  if (textoResuelto.length <= longitudMaxima) return [bloque];

  return dividirTextoEnPartesDocumento(textoResuelto, longitudMaxima).map((texto) => ({
    ...bloque,
    text: texto,
  }));
}

function dividirFilasLargasDocumento(
  bloque: Extract<DocumentoInformeBloque, { type: "table" }>,
  valores: ValoresDocumento,
  paginacion: Required<ConfiguracionPaginacionDocumento>,
) {
  const filas = bloque.rows ?? [];
  const totalColumnas = obtenerColumnasTabla(bloque);
  if (totalColumnas !== 1) return filas;

  const longitudMaxima = Math.max(paginacion.maxSplitCharacters, 220);

  return filas.flatMap((fila) => {
    if (esFilaTitulo(fila, totalColumnas, valores)) return [fila];
    const texto = resolverTextoDocumento(fila[0], valores, fila[0]);
    if (texto.length <= longitudMaxima) return [fila];
    return dividirTextoEnPartesDocumento(texto, longitudMaxima).map((parte) => [parte]);
  });
}

function dividirTablaDocumento(
  bloque: Extract<DocumentoInformeBloque, { type: "table" }>,
  valores: ValoresDocumento,
  maximoPeso: number,
  paginacion: Required<ConfiguracionPaginacionDocumento>,
): DocumentoInformeBloque[] {
  const filas = dividirFilasLargasDocumento(bloque, valores, paginacion);
  const totalColumnas = obtenerColumnasTabla(bloque);
  const pesoTotalTabla = filas.reduce(
    (total, fila) => total + obtenerPesoFilaTablaDocumento(fila, totalColumnas, valores, paginacion),
    bloque.header?.length ? paginacion.tableHeaderWeight : 0,
  );
  if (paginacion.keepTablesUnderRows > 0 && filas.length <= paginacion.keepTablesUnderRows && pesoTotalTabla <= maximoPeso) {
    return [{ ...bloque, rows: filas }];
  }

  const reservaFinTabla = paginacion.reserveEndTableWeight;
  const tablas: DocumentoInformeBloque[] = [];
  let filasTabla: unknown[][] = [];
  let pesoTabla = bloque.header?.length ? paginacion.tableHeaderWeight : 0;
  const obtenerGrupoFilas = (indice: number) => {
    const fila = filas[indice];
    if (!fila) return [];
    return esFilaTitulo(fila, totalColumnas, valores) && filas[indice + 1] ? [fila, filas[indice + 1]] : [fila];
  };
  const obtenerPesoGrupo = (grupoFilas: unknown[][]) => {
    const pesoConConfig = grupoFilas.reduce(
      (total, filaGrupo) => total + obtenerPesoFilaTablaDocumento(filaGrupo, totalColumnas, valores, paginacion),
      0,
    );
    const esRotuloSolo = grupoFilas.length === 1 && esFilaTitulo(grupoFilas[0], totalColumnas, valores);
    return esRotuloSolo ? Math.max(pesoConConfig, paginacion.titleRowWeight) : pesoConConfig;
  };

  for (let indiceFila = 0; indiceFila < filas.length; indiceFila += 1) {
    const grupoFilas = obtenerGrupoFilas(indiceFila);
    const pesoGrupo = obtenerPesoGrupo(grupoFilas);
    const indiceSiguienteFila = indiceFila + grupoFilas.length;
    const grupoSiguiente = obtenerGrupoFilas(indiceSiguienteFila);
    const reservaSiguienteFila = grupoSiguiente.length > 0
      ? obtenerPesoGrupo(grupoSiguiente)
      : reservaFinTabla;
    if (filasTabla.length > 0 && pesoTabla + pesoGrupo + reservaSiguienteFila > maximoPeso) {
      tablas.push({
        ...bloque,
        rows: filasTabla,
      });
      filasTabla = [];
      pesoTabla = bloque.header?.length ? paginacion.tableHeaderWeight : 0;
    }
    filasTabla.push(...grupoFilas);
    pesoTabla += pesoGrupo;
    indiceFila += grupoFilas.length - 1;
  }

  if (filasTabla.length > 0) {
    tablas.push({
      ...bloque,
      rows: filasTabla,
    });
  }

  return tablas.length > 0 ? tablas : [bloque];
}

function expandirBloquesDocumento(
  bloques: DocumentoInformeBloque[] | undefined,
  valores: ValoresDocumento,
  listas: ListasDocumento,
  maximoPesoTabla: number,
  paginacion: Required<ConfiguracionPaginacionDocumento>,
): BloqueDocumentoRender[] {
  const bloquesRender: BloqueDocumentoRender[] = [];

  (bloques ?? []).forEach((bloque) => {
    if (bloque.type === "each") {
      const contextos = bloque.source ? listas.get(normalizarClaveDocumento(bloque.source)) ?? [] : [];
      if (bloque.source && contextos.length === 0) return;

      (contextos.length > 0 ? contextos : [new Map<string, string>()]).forEach((contexto) => {
        const valoresContexto = new Map([...valores, ...contexto]);
        bloquesRender.push(...expandirBloquesDocumento(bloque.blocks, valoresContexto, listas, maximoPesoTabla, paginacion));
      });
      return;
    }

    if (bloque.type === "table") {
      dividirTablaDocumento(bloque, valores, maximoPesoTabla, paginacion).forEach((tabla) => {
        bloquesRender.push({ bloque: tabla, valores });
      });
      return;
    }

    if (bloque.type === "paragraph") {
      dividirParrafoDocumento(bloque, valores).forEach((parrafo) => {
        bloquesRender.push({ bloque: parrafo, valores });
      });
      return;
    }

    bloquesRender.push({ bloque, valores });
  });

  return bloquesRender;
}

function paginarBloquesDocumento(
  bloques: BloqueDocumentoRender[],
  maximoPeso: number,
  paginacion: Required<ConfiguracionPaginacionDocumento>,
) {
  const paginas: BloqueDocumentoRender[][] = [];
  let paginaActual: BloqueDocumentoRender[] = [];
  let pesoActual = 0;

  bloques.forEach((bloqueRender, indiceBloque) => {
    const { bloque } = bloqueRender;
    const peso = bloque.type === "table"
      ? (bloque.rows ?? []).reduce(
          (total, fila) => total + obtenerPesoFilaTablaDocumento(fila, obtenerColumnasTabla(bloque), bloqueRender.valores, paginacion),
          bloque.header?.length ? paginacion.tableHeaderWeight : 0,
        )
      : obtenerPesoBloqueDocumento(bloque, paginacion);
    const siguienteBloque = bloques[indiceBloque + 1];
    const debeMantenerConSiguiente = Boolean(paginacion.keepTitleWithNext) && esTituloSeccionDocumento(bloqueRender) && Boolean(siguienteBloque);
    const pesoGrupo = debeMantenerConSiguiente
      ? peso + obtenerPesoBloqueRenderDocumento(siguienteBloque, paginacion)
      : peso;
    if (debeMantenerConSiguiente && paginaActual.length > 0 && pesoActual + pesoGrupo > maximoPeso) {
      paginas.push(paginaActual);
      paginaActual = [];
      pesoActual = 0;
    }
    if (paginaActual.length > 0 && pesoActual + peso > maximoPeso) {
      paginas.push(paginaActual);
      paginaActual = [];
      pesoActual = 0;
    }
    paginaActual.push(bloqueRender);
    pesoActual += peso;
  });

  if (paginaActual.length > 0) paginas.push(paginaActual);
  return paginas.length > 0 ? paginas : [[]];
}

function esTituloSeccionDocumento(bloqueRender: BloqueDocumentoRender) {
  const { bloque, valores } = bloqueRender;
  if (bloque.type !== "paragraph" || !bloque.bold) return false;
  const texto = resolverTextoDocumento(bloque.text, valores);
  return texto.length > 0 && texto.length <= 80;
}

function obtenerPesoBloqueRenderDocumento(
  bloqueRender: BloqueDocumentoRender,
  paginacion: Required<ConfiguracionPaginacionDocumento>,
) {
  const { bloque, valores } = bloqueRender;

  if (bloque.type === "table") {
    return (bloque.rows ?? []).reduce(
      (total, fila) => total + obtenerPesoFilaTablaDocumento(fila, obtenerColumnasTabla(bloque), valores, paginacion),
      bloque.header?.length ? paginacion.tableHeaderWeight : 0,
    );
  }

  if (bloque.type === "paragraph") {
    const texto = resolverTextoDocumento(bloque.text, valores);
    return (bloque.bold ? 0.95 : 0.7) + Math.max(0, Math.ceil(texto.length / 260) - 1) * 0.55;
  }

  if (bloque.type === "image") return 1.4;

  return obtenerPesoBloqueDocumento(bloque, paginacion);
}

function compactarPaginasDocumento(
  paginas: BloqueDocumentoRender[][],
  maximoPeso: number,
  paginacion: Required<ConfiguracionPaginacionDocumento>,
) {
  const pesoMaximoCompactado = maximoPeso * paginacion.compactThreshold;
  const paginasCompactadas = paginas.map((pagina) => [...pagina]);

  for (let indice = 0; indice < paginasCompactadas.length - 1; indice += 1) {
    let pesoActual = paginasCompactadas[indice].reduce((total, bloque) => total + obtenerPesoBloqueRenderDocumento(bloque, paginacion), 0);
    let siguiente = paginasCompactadas[indice + 1];

    while (siguiente.length > 0) {
      const bloquesMovimiento =
        esTituloSeccionDocumento(siguiente[0]) && siguiente[1] ? siguiente.slice(0, 2) : [siguiente[0]];
      const pesoMovimiento = bloquesMovimiento.reduce(
        (total, bloque) => total + obtenerPesoBloqueRenderDocumento(bloque, paginacion),
        0,
      );
      if (pesoActual + pesoMovimiento > pesoMaximoCompactado) break;

      paginasCompactadas[indice].push(...siguiente.splice(0, bloquesMovimiento.length));
      pesoActual += pesoMovimiento;
    }
  }

  return paginasCompactadas.filter((pagina) => pagina.length > 0);
}

function CustomContenidoCeldaDocumento({
  celda,
  valores,
  etiquetaFila,
}: {
  celda: unknown;
  valores: ValoresDocumento;
  etiquetaFila?: unknown;
}) {
  if (esImagenDocumento(celda)) {
    return celda.src ? (
      <div
        className={`flex ${
          celda.align === "right" ? "justify-end" : celda.align === "center" ? "justify-center" : "justify-start"
        }`}
      >
        <img
          src={celda.src}
          alt=""
          referrerPolicy="no-referrer"
          className="block max-h-20 max-w-full object-contain"
          style={{
            width: obtenerDimensionImagen(celda.width, celda.unit),
            height: obtenerDimensionImagen(celda.height, celda.unit),
          }}
        />
      </div>
    ) : null;
  }

  return <>{limpiarTextoDocumento(resolverTextoDocumento(celda, valores, etiquetaFila))}</>;
}

function CustomBloqueDocumentoInforme({
  bloque,
  indice,
  valores,
  listas,
  estilosSeccion,
  catalogoEstilos,
}: {
  bloque: DocumentoInformeBloque;
  indice: number;
  valores: ValoresDocumento;
  listas: ListasDocumento;
  estilosSeccion?: EstilosDocumento;
  catalogoEstilos?: EstilosDocumentoCatalogo;
}) {
  const estilosBloque = combinarEstilosDocumento(catalogoEstilos, bloque as EstilosDocumento, estilosSeccion);

  if (bloque.type === "paragraph") {
    return (
      <p
        className={`text-slate-900 ${obtenerClaseAlineacion(estilosBloque.align)} ${
          bloque.bold || estilosBloque.bold ? "font-bold" : "font-normal"
        } ${bloque.italic ? "italic" : ""}`}
        style={obtenerEstiloDocumento(estilosBloque)}
      >
        {limpiarTextoDocumento(resolverTextoDocumento(bloque.text, valores))}
      </p>
    );
  }

  if (bloque.type === "image") {
    return (
      <div className={`flex ${bloque.align === "right" ? "justify-end" : bloque.align === "center" ? "justify-center" : "justify-start"}`}>
        {bloque.src ? (
          <img
            src={bloque.src}
            alt=""
            referrerPolicy="no-referrer"
            className="block h-16 max-h-20 min-h-12 max-w-56 object-contain"
            style={{
              width: obtenerDimensionImagen(bloque.width, bloque.unit),
              height: obtenerDimensionImagen(bloque.height, bloque.unit),
            }}
          />
        ) : null}
      </div>
    );
  }

  if (bloque.type === "table") {
    const totalColumnas = obtenerColumnasTabla(bloque);
    const filas = bloque.rows ?? [];
    const anchosColumnas = obtenerAnchosColumnasDocumento(estilosBloque, totalColumnas);

    if (filas.length === 0 && !bloque.header?.length) return null;

    return (
      <table
        className="border-collapse leading-snug text-slate-900"
        style={obtenerEstiloTablaDocumento(estilosBloque)}
      >
        {anchosColumnas?.length ? (
          <colgroup>
            {Array.from({ length: totalColumnas }).map((_, indiceColumna) => (
              <col
                key={`${indice}-col-${indiceColumna}`}
                style={{ width: obtenerDimensionDocumento(anchosColumnas[indiceColumna], estilosBloque.widthUnit) }}
              />
            ))}
          </colgroup>
        ) : null}
        {bloque.header?.length ? (
          <thead>
            <tr>
              {bloque.header.map((celda, indiceCelda) => (
                <th
                  key={`${indice}-${indiceCelda}`}
                  className={`${estilosBloque.headerBold === false ? "font-normal" : "font-bold"}`}
                  style={obtenerEstiloCeldaCabeceraDocumento(estilosBloque)}
                >
                  <CustomContenidoCeldaDocumento celda={celda} valores={valores} />
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {filas.map((fila, indiceFila) => {
            const celdasResueltas = Array.from({ length: totalColumnas }).map((_, indiceCelda) =>
              resolverTextoDocumento(fila[indiceCelda], valores, fila[0]),
            );
            const filaSinValor = celdasResueltas.length > 1
              && tieneContenidoCelda(celdasResueltas[0], valores)
              && celdasResueltas.slice(1).every((celda) => !tieneContenidoCelda(celda, valores));
            const filaTitulo = filaSinValor || esFilaTitulo(fila, totalColumnas, valores);
            const contextoFila = { rowIndex: indiceFila, rowCount: filas.length };
            const estiloCelda = obtenerEstiloCeldaDocumento(estilosBloque, contextoFila);
            return (
              <tr key={`${indice}-${indiceFila}`}>
                {filaTitulo ? (
                  <td colSpan={totalColumnas} className="font-bold" style={obtenerEstiloCeldaTituloDocumento(estilosBloque, contextoFila)}>
                    <CustomContenidoCeldaDocumento
                      celda={filaSinValor ? celdasResueltas[0] : fila.find((celda) => tieneContenidoCelda(celda, valores)) ?? fila[0]}
                      valores={valores}
                      etiquetaFila={fila[0]}
                    />
                  </td>
                ) : (
                  Array.from({ length: totalColumnas }).map((_, indiceCelda) => (
                    <td
                      key={`${indice}-${indiceFila}-${indiceCelda}`}
                      className={`align-top ${
                        indiceCelda === 0 && totalColumnas > 1 ? "font-semibold text-slate-800" : "text-slate-900"
                      }`}
                      style={estiloCelda}
                    >
                      <CustomContenidoCeldaDocumento celda={fila[indiceCelda]} valores={valores} etiquetaFila={fila[0]} />
                    </td>
                  ))
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  if (bloque.type === "each") {
    const contextos = bloque.source ? listas.get(normalizarClaveDocumento(bloque.source)) ?? [] : [];
    if (bloque.source && contextos.length === 0) return null;

    return (
      <div className="space-y-3">
        {(contextos.length > 0 ? contextos : [new Map<string, string>()]).map((contexto, indiceContexto) => {
          const valoresContexto = new Map([...valores, ...contexto]);
          return (
            <div key={`${indice}-${bloque.source ?? "each"}-${indiceContexto}`} className="space-y-3">
              {(bloque.blocks ?? []).map((bloqueInterno, indiceInterno) => (
                <CustomBloqueDocumentoInforme
                  key={`${indice}-${indiceContexto}-${indiceInterno}`}
                  bloque={bloqueInterno}
                  indice={indiceInterno}
                  valores={valoresContexto}
                  listas={listas}
                  estilosSeccion={estilosSeccion}
                  catalogoEstilos={catalogoEstilos}
                />
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}

function CustomSeccionDocumentoInforme({
  tabla,
  bloques,
  valores,
  listas,
  estilos,
  catalogoEstilos,
  gap,
}: {
  tabla?: Extract<DocumentoInformeBloque, { type: "table" }>;
  bloques?: DocumentoInformeBloque[];
  valores: ValoresDocumento;
  listas: ListasDocumento;
  estilos?: EstilosDocumento;
  catalogoEstilos?: EstilosDocumentoCatalogo;
  gap?: string;
}) {
  if (!tabla && !bloques?.length) return null;
  const estilosSeccion = combinarEstilosDocumento(catalogoEstilos, estilos);

  return (
    <div className="flex flex-col" style={{ ...obtenerEstiloDocumento(estilosSeccion), gap }}>
      {tabla ? (
        <CustomBloqueDocumentoInforme
          bloque={tabla}
          indice={0}
          valores={valores}
          listas={listas}
          estilosSeccion={estilosSeccion}
          catalogoEstilos={catalogoEstilos}
        />
      ) : null}
      {(tabla ? [] : bloques ?? []).map((bloque, indice) => (
        <CustomBloqueDocumentoInforme
          key={`${bloque.type}-${indice}`}
          bloque={bloque}
          indice={indice}
          valores={valores}
          listas={listas}
          estilosSeccion={estilosSeccion}
          catalogoEstilos={catalogoEstilos}
        />
      ))}
    </div>
  );
}

function CustomSeccionDocumentoRender({
  bloques,
  listas,
  estilos,
  catalogoEstilos,
  gap,
}: {
  bloques: BloqueDocumentoRender[];
  listas: ListasDocumento;
  estilos?: EstilosDocumento;
  catalogoEstilos?: EstilosDocumentoCatalogo;
  gap?: string;
}) {
  if (!bloques.length) return null;
  const estilosSeccion = combinarEstilosDocumento(catalogoEstilos, estilos);

  return (
    <div className="flex flex-col" style={{ gap }}>
      {bloques.map(({ bloque, valores }, indice) => (
        <CustomBloqueDocumentoInforme
          key={`${bloque.type}-${indice}`}
          bloque={bloque}
          indice={indice}
          valores={valores}
          listas={listas}
          estilosSeccion={estilosSeccion}
          catalogoEstilos={catalogoEstilos}
        />
      ))}
    </div>
  );
}

export function CustomVisorDocumentoInforme(props: PropsCustomVisorDocumentoInforme) {
  if (props.documento.html) {
    return (
      <div className="overflow-x-auto pb-4">
        <div
          className="mx-auto min-w-[760px]"
          dangerouslySetInnerHTML={{ __html: props.documento.html }}
        />
      </div>
    );
  }

  return <CustomVisorDocumentoJsonInforme {...props} />;
}

function CustomVisorDocumentoJsonInforme({ documento, datosInvestigacion, encabezado }: PropsCustomVisorDocumentoInforme) {
  const mainRefs = useRef<Array<HTMLElement | null>>([]);
  const margenes = documento.pageSetup?.margins;
  const orientacion = documento.pageSetup?.orientation ?? "portrait";
  const anchoPagina = orientacion === "landscape" ? "11.69in" : "8.27in";
  const altoMinimo = orientacion === "landscape" ? "8.27in" : "11.69in";
  const distanciaHeader = obtenerDimensionDocumento(documento.pageSetup?.headerDistance ?? 0.5, "in");
  const distanciaFooter = obtenerDimensionDocumento(documento.pageSetup?.footerDistance ?? 0.5, "in");
  const gapBloques = obtenerGapDocumento(documento.layout?.blockGap, documento.layout?.unit ?? "rem");
  const gapSeccion = obtenerGapDocumento(documento.layout?.sectionGap, documento.layout?.unit ?? "rem");
  const valores = useMemo(() => construirValoresDocumento(datosInvestigacion, encabezado), [datosInvestigacion, encabezado]);
  const listas = useMemo(() => construirListasDocumento(datosInvestigacion), [datosInvestigacion]);
  const paginasBase = useMemo(() => {
    const paginacion = { ...paginacionDocumentoPorDefecto, ...documento.pagination };
    const maximoPesoPagina = orientacion === "landscape" ? paginacion.maxPageWeightLandscape : paginacion.maxPageWeightPortrait;
    const maximoPesoTabla = orientacion === "landscape" ? paginacion.maxTableWeightLandscape : paginacion.maxTableWeightPortrait;
    const bloquesRender = expandirBloquesDocumento(documento.body, valores, listas, maximoPesoTabla, paginacion);
    return compactarPaginasDocumento(
      paginarBloquesDocumento(bloquesRender, maximoPesoPagina, paginacion),
      maximoPesoPagina,
      paginacion,
    );
  }, [documento, listas, orientacion, valores]);
  const [paginas, setPaginas] = useState(paginasBase);

  useEffect(() => {
    setPaginas(paginasBase);
  }, [paginasBase]);

  useLayoutEffect(() => {
    setPaginas((paginasActuales) => {
      for (let indicePagina = 0; indicePagina < paginasActuales.length; indicePagina += 1) {
        const main = mainRefs.current[indicePagina];
        if (!main || main.scrollHeight <= main.clientHeight + 2 || paginasActuales[indicePagina].length <= 1) continue;

        const paginasSiguientes = paginasActuales.map((pagina) => [...pagina]);
        const bloqueMovido = paginasSiguientes[indicePagina].pop();
        if (!bloqueMovido) return paginasActuales;
        if (!paginasSiguientes[indicePagina + 1]) paginasSiguientes[indicePagina + 1] = [];
        paginasSiguientes[indicePagina + 1].unshift(bloqueMovido);
        return paginasSiguientes;
      }

      return paginasActuales;
    });
  }, [paginas]);

  return (
    <div className="space-y-6 overflow-x-auto pb-4">
      {paginas.map((bloquesPagina, indicePagina) => (
        (() => {
          const valoresPagina = new Map(valores);
          agregarAliasDocumento(valoresPagina, "pageNumber", indicePagina + 1);
          agregarAliasDocumento(valoresPagina, "totalPages", paginas.length);
          return (
        <article
          key={indicePagina}
          className="mx-auto flex min-w-[760px] flex-col bg-white text-slate-950 shadow-[0_18px_45px_rgba(15,23,42,0.16)]"
          style={{
            width: anchoPagina,
            height: altoMinimo,
            boxSizing: "border-box",
            paddingTop: obtenerMargen(margenes?.top, 0.5),
            paddingBottom: obtenerMargen(margenes?.bottom, 0.5),
            paddingLeft: obtenerMargen(margenes?.left, 0.5),
            paddingRight: obtenerMargen(margenes?.right, 0.5),
          }}
        >
          <header className="min-h-16 shrink-0" style={{ marginBottom: distanciaHeader }}>
            <CustomSeccionDocumentoInforme
              tabla={documento.header?.table}
              bloques={documento.header?.blocks}
              valores={valores}
              listas={listas}
              estilos={documento.header}
              catalogoEstilos={documento.styles}
              gap={gapSeccion}
            />
          </header>

          <main
            ref={(elemento) => {
              mainRefs.current[indicePagina] = elemento;
            }}
            className="min-h-0 grow"
          >
            <CustomSeccionDocumentoRender
              bloques={bloquesPagina}
              listas={listas}
              estilos={documento.styles?.default}
              catalogoEstilos={documento.styles}
              gap={gapBloques}
            />
          </main>

          <footer className="shrink-0 text-slate-600" style={{ marginTop: distanciaFooter }}>
            <CustomSeccionDocumentoInforme
              tabla={documento.footer?.table}
              bloques={documento.footer?.blocks}
              valores={valoresPagina}
              listas={listas}
              estilos={documento.footer}
              catalogoEstilos={documento.styles}
              gap={gapSeccion}
            />
          </footer>
        </article>
          );
        })()
      ))}
    </div>
  );
}

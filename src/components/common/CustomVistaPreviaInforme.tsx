import { type ReactNode, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import type { DatosInvestigacionAnalista, IdSeccionInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";
import { seccionesInvestigacionAnalista } from "@maximilian/shared/utils/datos-simulados-investigacion";
import { servicioTablaMaestra } from "@maximilian/services/tablaMaestra.service";
import { informeService } from "@maximilian/services/informe.service";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { CustomVisorDocumentoInforme } from "@maximilian/components/common/CustomVisorDocumentoInforme";
import PantallaCarga from "@maximilian/components/common/PantallaCarga";

interface FilaVistaPreviaInforme {
  etiqueta: string;
  etiquetaTraducida: string;
  valorOriginal: string;
  valorTraducido: string;
  subValorOriginal?: string;
  subValorTraducido?: string;
}

interface BloqueVistaPreviaInforme {
  id: string;
  titulo: string;
  filas: FilaVistaPreviaInforme[];
  layout?: "columna" | "activos-pasivos" | "dos-columnas";
}

interface GrupoBloquesVistaPreviaInforme {
  id: string;
  titulo: string;
  subtitulo?: string;
  bloques: BloqueVistaPreviaInforme[];
}

export interface SeccionVistaPreviaInforme {
  id: IdSeccionInvestigacionAnalista;
  titulo: string;
  bloques: BloqueVistaPreviaInforme[];
  grupos?: GrupoBloquesVistaPreviaInforme[];
  observaciones?: string;
}

export interface EncabezadoVistaPreviaInforme {
  pais: string;
  fecha: string;
  tipoSolicitud: string;
  analista: string;
  traductor: string;
}

type IdTabVistaPreviaInforme = "vista-general" | IdSeccionInvestigacionAnalista;

interface PropsTabsVistaPreviaInforme {
  idTabActiva: IdTabVistaPreviaInforme;
  onTabChange: (idTab: IdTabVistaPreviaInforme) => void;
}

interface PropsTarjetaVistaPreviaInforme {
  titulo: string;
  indicador: string;
  encabezado: EncabezadoVistaPreviaInforme;
  secciones: SeccionVistaPreviaInforme[];
  mostrarTituloSeccion: boolean;
  mostrarValorTraducido: boolean;
}

interface PropsVistaPreviaInformeComparado {
  datosInvestigacion?: DatosInvestigacionAnalista;
  encabezado: EncabezadoVistaPreviaInforme;
  idInforme?: number;
  idPedido?: number;
  indicadorReporteTraducido?: string;
  mostrarInformeTraducido?: boolean;
  className?: string;
  contenidoEntreTabsYTarjetas?: ReactNode;
}

function humanizarEtiquetaVistaPrevia(texto: string) {
  return texto
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (valor) => valor.toUpperCase());
}

function formatearValorVistaPrevia(valor: unknown): string {
  if (typeof valor === "string") {
    const texto = valor.trim();
    return texto ? texto : "-";
  }

  if (typeof valor === "number") {
    return Number.isFinite(valor) ? String(valor) : "-";
  }

  if (typeof valor === "boolean") {
    return valor ? "Si" : "No";
  }

  if (valor == null) {
    return "-";
  }

  return String(valor);
}

const traduccionesVistaPreviaInforme: Record<string, string> = {
  "Aprobado": "Approved",
  "Activo": "Active",
  "Ano": "Year",
  "Aspectos Legales": "Legal Aspects",
  "Balance general": "Balance sheet",
  "Bancos-Proveedores": "Banks-Suppliers",
  "Categoria CIIU": "ISIC category",
  "Ciudad / Estado / Provincia": "City / State / Province",
  "Codigo": "Code",
  "Comentario": "Comment",
  "Comentarios legales": "Legal comments",
  "Comentarios operaciones": "Operations comments",
  "Compania relacionada": "Related company",
  "Contacto": "Contact",
  "Correo electronico": "Email",
  "Datos Generales": "General Data",
  "Datos de identificación": "Identification data",
  "Detalle": "Detail",
  "Direccion": "Address",
  "Direccion principal": "Main address",
  "Ejecutivo": "Executive",
  "Empresa": "Company",
  "Estado actual": "Current status",
  "Estados Unidos": "United States",
  "Fecha": "Date",
  "Fecha de constitucion": "Date of incorporation",
  "Identificación": "Identification",
  "Imagen principal": "Main image",
  "Importacion": "Import",
  "Información Financiera": "Financial Information",
  "Informacion financiera": "Financial information",
  "Investigación Normal": "Standard Investigation",
  "Jurídica": "Legal entity",
  "Mes": "Month",
  "Moneda": "Currency",
  "Nacional": "Domestic",
  "Nombre comercial": "Trade name",
  "Nombre de empresa": "Company name",
  "Numero de cuenta": "Account number",
  "Numero de empleados": "Number of employees",
  "Numero de identificacion fiscal": "Tax identification number",
  "Operación principal": "Main operation",
  "Operacion principal": "Main operation",
  "Pais": "Country",
  "Paises": "Countries",
  "Periodo": "Period",
  "Proveedor": "Supplier",
  "Ramo Operaciones": "Line of Business",
  "Referencias": "References",
  "Sector": "Sector",
  "Sede Principal": "Headquarters",
  "Si": "Yes",
  "Sin balances registrados.": "No balances registered.",
  "Sin datos de productos": "No product data",
  "Sin registros.": "No records.",
  "Telefono": "Phone",
  "Tipo": "Type",
  "Tipo de empresa": "Company type",
  "Tipo de identificacion fiscal": "Tax identification type",
  "Tipo de local": "Premises type",
  "Tipo de persona": "Person type",
  "Tipo de proveedor": "Supplier type",
  "Total de imagenes": "Total images",
  "Ventas netas": "Net sales",
};

function traducirTextoVistaPrevia(texto: string): string {
  return traduccionesVistaPreviaInforme[texto] ?? texto;
}

function crearFilaVistaPrevia(etiqueta: string, valor: unknown): FilaVistaPreviaInforme {
  const valorTexto = formatearValorVistaPrevia(valor);

  return {
    etiqueta,
    etiquetaTraducida: traducirTextoVistaPrevia(etiqueta),
    valorOriginal: valorTexto,
    valorTraducido: traducirTextoVistaPrevia(valorTexto),
  };
}

function crearFilasDesdeRegistro(
  registro: Record<string, unknown>,
  etiquetasPersonalizadas: Record<string, string> = {},
  clavesOmitidas: string[] = [],
) {
  return Object.entries(registro)
    .filter(([clave]) => !clavesOmitidas.includes(clave))
    .filter(([, valor]) => valor !== null && valor !== undefined && valor !== "")
    .map(([clave, valor]) => crearFilaVistaPrevia(etiquetasPersonalizadas[clave] ?? humanizarEtiquetaVistaPrevia(clave), valor));
}

function crearBloqueDesdeRegistro(
  id: string,
  titulo: string,
  registro: Record<string, unknown>,
  etiquetasPersonalizadas: Record<string, string> = {},
  clavesOmitidas: string[] = [],
  layout?: BloqueVistaPreviaInforme["layout"],
): BloqueVistaPreviaInforme {
  return {
    id,
    titulo,
    filas: crearFilasDesdeRegistro(registro, etiquetasPersonalizadas, clavesOmitidas),
    layout,
  };
}

function crearBloquesDesdeLista(
  prefijo: string,
  tituloBase: string,
  registros: Record<string, unknown>[],
  etiquetasPersonalizadas: Record<string, string> = {},
  clavesOmitidas: string[] = [],
) {
  if (registros.length === 0) {
    return [{
      id: `${prefijo}-vacio`,
      titulo: tituloBase,
      filas: [crearFilaVistaPrevia("Detalle", "Sin registros.")],
    }];
  }

  return registros.map((registro, indice) => ({
    id: `${prefijo}-${indice}`,
    titulo: `${tituloBase} ${indice + 1}`,
    filas: crearFilasDesdeRegistro(registro, etiquetasPersonalizadas, clavesOmitidas),
  }));
}

const etiquetasTurquia: Record<string, string> = {
  "year": "Año",
  "balance-date": "Fecha de balance",
  "balance-date-p": "Fecha de balance (P/G)",
  "currency": "Moneda",
  "currency-iso": "ISO de moneda",
  "currency-p": "Moneda (P/G)",
  "length-period": "Duracion del periodo",
  "reliability-level": "Nivel de confiabilidad",
  "exchange-rate": "Tipo de cambio",
  "exchange-rate-p": "Tipo de cambio (P/G)",
  "cash": "Efectivo",
  "stocks": "Existencias",
  "creditors": "Deudores",
  "current-total": "Total corriente",
  "tangible-assets": "Bienes tangibles",
  "intangible-assets": "Activos intangibles",
  "net-fixed": "Activo fijo neto",
  "total-assets-turquia": "Total activos",
  "loans": "Prestamos",
  "debtors": "Acreedores",
  "current-liabilities": "Pasivos corrientes",
  "non-current-liabilities": "Pasivos no corrientes",
  "long-term-liabilities": "Pasivos de largo plazo",
  "total-non-current-liabilities": "Total pasivos no corrientes",
  "total-liabilities": "Total pasivos",
  "capital": "Capital",
  "reserves": "Reservas",
  "retained-earnings": "Resultados acumulados",
  "profit-loss-for-year": "Resultado del ejercicio",
  "other-accounts": "Otras cuentas",
  "total-equity": "Total patrimonio",
  "total-liabilities-equity": "Total pasivos y patrimonio",
  "turnover": "Ventas netas",
  "costs-goods-sold": "Costo de ventas",
  "material-costs": "Costo de materiales",
  "gross-profit": "Ganancia bruta",
  "other-operating-expenses": "Otros gastos operativos",
  "costs-employees": "Costo de empleados",
  "depreciation": "Depreciacion",
  "financial-revenue": "Ingresos financieros",
  "financial-expenses": "Gastos financieros",
  "interest-paid": "Intereses pagados",
  "financial-pl": "P/L financiero",
  "extra-other-revenue": "Ingresos extraordinarios y otros",
  "extra-other-expenses": "Gastos extraordinarios y otros",
  "extra-other-pl": "P/L extraordinario y otros",
  "profit-loss-before-taxes": "Ganancia antes de impuestos",
  "taxation": "Impuestos",
  "profit-loss-after-taxes": "Ganancia/Perdida neta",
  "ebit": "EBIT",
  "ebitda": "EBITDA",
  "profit": "Ganancia",
  "liquidity-index": "Ratio de liquidez",
  "working-capital": "Capital de trabajo",
  "indebtedness-ratio": "Ratio de endeudamiento",
  "profitability-ratio-turquia": "Ratio de rentabilidad",
};

function esEtiquetaImportante(etiqueta: string): boolean {
  const t = etiqueta.toLowerCase();
  return (
    t.startsWith("total") ||
    t.includes("total") ||
    t === "patrimonio" ||
    t.includes("ganancia") ||
    t.includes("utilidad") ||
    t === "ebit" ||
    t === "ebitda"
  );
}

const etiquetasActivosBalanceGeneral = new Set([
  "Total corrientes",
  "Total no corrientes",
  "Otros activos",
  "Total activos",
]);

function crearFilaConSub(etiqueta: string, valorPrincipal: unknown, valorSecundario: unknown): FilaVistaPreviaInforme {
  const principal = formatearValorVistaPrevia(valorPrincipal);
  const secundario = formatearValorVistaPrevia(valorSecundario);
  return {
    etiqueta,
    etiquetaTraducida: traducirTextoVistaPrevia(etiqueta),
    valorOriginal: principal,
    valorTraducido: traducirTextoVistaPrevia(principal),
    subValorOriginal: secundario !== "-" ? secundario : undefined,
    subValorTraducido: secundario !== "-" ? traducirTextoVistaPrevia(secundario) : undefined,
  };
}

type OpcionTiempo = { num1: number | null; string1: string | null };

function resolverTiempoCredito(valor: unknown, opciones: OpcionTiempo[] | undefined): string {
  if (valor === null || valor === undefined || valor === "") return "";
  const str = String(valor);
  const id = Number(str);
  if (!Number.isNaN(id) && Number.isFinite(id) && id > 0) {
    return opciones?.find((o) => Number(o.num1) === id)?.string1?.trim() ?? str;
  }
  return str;
}

function agregarSimple(filas: FilaVistaPreviaInforme[], op: Record<string, unknown>, clave: string, etiqueta: string) {
  const valor = op[clave];
  if (valor === null || valor === undefined || valor === "") return;
  filas.push(crearFilaVistaPrevia(etiqueta, valor));
}

function agregarPar(filas: FilaVistaPreviaInforme[], op: Record<string, unknown>, clavePct: string, claveDetalle: string, etiqueta: string) {
  const pct = op[clavePct];
  const detalle = op[claveDetalle];
  if ((pct === null || pct === undefined || pct === "") && (detalle === null || detalle === undefined || detalle === "")) return;
  const pctStr = pct !== null && pct !== undefined && pct !== "" ? `${pct}%` : pct;
  filas.push(crearFilaConSub(etiqueta, pctStr, detalle));
}

function agregarCreditoCompras(
  filas: FilaVistaPreviaInforme[],
  op: Record<string, unknown>,
  clavePct: string,
  claveDetalle: string,
  claveTiempo: string,
  etiquetaCredito: string,
  etiquetaTiempo: string,
  opciones: OpcionTiempo[] | undefined,
) {
  const pct = op[clavePct];
  if (pct !== null && pct !== undefined && pct !== "") {
    filas.push(crearFilaVistaPrevia(etiquetaCredito, `${pct}%`));
  }
  const tiempoLabel = resolverTiempoCredito(op[claveTiempo], opciones);
  const detalle = op[claveDetalle];
  const detalleStr = detalle !== null && detalle !== undefined && detalle !== "" ? String(detalle) : "";
  const combinado = [detalleStr, tiempoLabel].filter(Boolean).join(" ");
  if (combinado) {
    filas.push(crearFilaVistaPrevia(etiquetaTiempo, combinado));
  }
}

function crearBloqueOperacionPrincipal(
  operacionPrincipal: Record<string, unknown>,
  opcionesTiempoCredito: OpcionTiempo[] | undefined,
): BloqueVistaPreviaInforme {
  const op = operacionPrincipal;
  const filas: FilaVistaPreviaInforme[] = [];

  agregarSimple(filas, op, "sector", "Sector");
  agregarSimple(filas, op, "actividad", "Actividad");
  agregarSimple(filas, op, "categoriaCiiu", "Categoria CIIU");
  agregarSimple(filas, op, "claseCiiu", "Clase CIIU");
  agregarSimple(filas, op, "actividadPrincipal", "Actividad principal");

  agregarPar(filas, op, "ventasContadoPorcentaje", "ventasContadoDetalle", "Ventas al Contado");
  agregarCreditoCompras(filas, op, "ventasCreditoPorcentaje", "ventasCreditoDetalle", "ventasCreditoTiempo", "Ventas a Credito", "Tiempo de credito ventas", opcionesTiempoCredito);
  agregarPar(filas, op, "territorioVentasPorcentaje", "territorioVentasDetalle", "Ventas Nacionales");
  agregarPar(filas, op, "ventasExtranjeroPorcentaje", "ventasExtranjeroDetalle", "Ventas Extranjero");

  agregarPar(filas, op, "comprasNacionalesPorcentaje", "comprasNacionalesDetalle", "Compras Nacionales");
  agregarPar(filas, op, "comprasContadoNacionalesPorcentaje", "comprasContadoNacionalesDetalle", "Compras al Contado Nacionales");
  agregarCreditoCompras(filas, op, "comprasCreditoNacionalesPorcentaje", "comprasCreditoNacionalesDetalle", "comprasCreditoNacionalesTiempo", "Compras a Credito Nacionales", "Tiempo de credito compras nacionales", opcionesTiempoCredito);

  agregarPar(filas, op, "comprasExtranjeroPorcentaje", "comprasExtranjeroDetalle", "Compras Extranjero");
  agregarPar(filas, op, "comprasContadoInternacionalesPorcentaje", "comprasContadoInternacionalesDetalle", "Compras al Contado Extranjero");
  agregarCreditoCompras(filas, op, "comprasCreditoInternacionalesPorcentaje", "comprasCreditoInternacionalesDetalle", "comprasCreditoInternacionalesTiempo", "Compras a Credito Extranjero", "Tiempo de credito compras extranjero", opcionesTiempoCredito);

  agregarSimple(filas, op, "numeroEmpleados", "Numero de empleados");
  agregarSimple(filas, op, "numeroEmpleadosDetalle", "Detalle empleados");
  agregarSimple(filas, op, "comentariosOperaciones", "Comentarios operaciones");

  return { id: "operacion-principal", titulo: "Operacion principal", filas };
}

export function obtenerSeccionesVistaPreviaInforme(datosInvestigacion: DatosInvestigacionAnalista, opcionesTiempoCredito?: OpcionTiempo[]): SeccionVistaPreviaInforme[] {
  const seccionesPorId = new Map<IdSeccionInvestigacionAnalista, SeccionVistaPreviaInforme>();

  seccionesPorId.set("identificacion", {
    id: "identificacion",
    titulo: "Identificación",
    bloques: [
      crearBloqueDesdeRegistro(
        "identificacion-principal",
        "Datos de identificación",
        datosInvestigacion.identificacion as unknown as Record<string, unknown>,
        {
          tipoPersona: "Tipo de persona",
          nombreEmpresa: "Nombre de empresa",
          nombreComercial: "Nombre comercial",
          pais: "Pais",
          operacionesCambio: "Operaciones cambio",
          tipoIdentificacionFiscal: "Tipo de identificacion fiscal",
          numeroIdentificacionFiscal: "Numero de identificacion fiscal",
          direccionPrincipal: "Direccion principal",
          ciudadEstadoProvincia: "Ciudad / Estado / Provincia",
          numeroTelefono: "Telefono",
          numeroFax: "Fax",
          correoElectronico: "Correo electronico",
          paginaWeb: "Pagina web",
          estadoActual: "Estado actual",
        },
        ["datosAdicionales"],
      ),
    ],
    observaciones: datosInvestigacion.identificacion.datosAdicionales,
  });

  seccionesPorId.set("aspectos-legales", {
    id: "aspectos-legales",
    titulo: "Aspectos Legales",
    bloques: [
      crearBloqueDesdeRegistro(
        "aspectos-legales-principal",
        "Aspectos legales",
        datosInvestigacion.aspectosLegales as unknown as Record<string, unknown>,
        {
          tipoEmpresa: "Tipo de empresa",
          fechaConstitucion: "Fecha de constitucion",
          ciudadRegistro: "Ciudad de registro",
          notaria: "Notaria",
          notario: "Notario",
          registro: "Registro",
          condiciones: "Condiciones",
          operacionesCambioDivisas: "Operaciones cambio divisas",
          monedaTipoCambio: "Moneda tipo de cambio",
          capitalInicial: "Capital inicial",
          capitalDesembolsado: "Capital desembolsado",
          ultimaAmpliacion: "Ultima ampliacion",
          patrimonioNeto: "Patrimonio neto",
          tipoAcciones: "Tipo de acciones",
          valorAcciones: "Valor de acciones",
          obligacionBolsa: "Obligacion en bolsa",
          tipoCambio: "Tipo de cambio",
          antecedentes: "Antecedentes",
          aspectosLegales: "Comentarios legales",
          comentariosEmpresasRelacionadas: "Comentarios empresas relacionadas",
        },
      ),
      ...crearBloquesDesdeLista(
        "companias-relacionadas",
        "Compania relacionada",
        datosInvestigacion.companiasRelacionadas as unknown as Record<string, unknown>[],
        {
          empresa: "Empresa",
          idFiscal: "Id fiscal",
          pais: "Pais",
        },
        ["idInformeCompaniaRelacionada", "idCompania"],
      ),
    ],
  });

  seccionesPorId.set("ramo-operaciones", {
    id: "ramo-operaciones",
    titulo: "Ramo Operaciones",
    bloques: [
      crearBloqueOperacionPrincipal(datosInvestigacion.operacionPrincipal as unknown as Record<string, unknown>, opcionesTiempoCredito),
      ...crearBloquesDesdeLista(
        "importaciones",
        "Importacion",
        datosInvestigacion.importaciones as unknown as Record<string, unknown>[],
        {
          anio: "Año",
          mes: "Mes",
          moneda: "Moneda",
          paises: "Paises",
          productos: "Productos",
          monto: "Monto",
          operaciones: "Operaciones",
        },
        ["idInformeExportacionImportacion", "idMesInicio", "idMesFin", "idMoneda"],
      ),
      ...crearBloquesDesdeLista(
        "exportaciones",
        "Exportacion",
        datosInvestigacion.exportaciones as unknown as Record<string, unknown>[],
        {
          anio: "Año",
          mes: "Mes",
          moneda: "Moneda",
          paises: "Paises",
          productos: "Productos",
          monto: "Monto",
          operaciones: "Operaciones",
        },
        ["idInformeExportacionImportacion", "idMesInicio", "idMesFin", "idMoneda"],
      ),
      ...crearBloquesDesdeLista(
        "locales",
        "Local",
        datosInvestigacion.locales.map((local) => ({
          tipoLocal: local.tipoLocal,
          direccion: local.direccion,
          comentario: local.comentario,
          imagen: local.imagen,
          totalImagenes: local.imagenes?.length ?? 0,
        })) as unknown as Record<string, unknown>[],
        {
          tipoLocal: "Tipo de local",
          direccion: "Direccion",
          comentario: "Comentario",
          imagen: "Imagen principal",
          totalImagenes: "Total de imagenes",
        },
      ),
    ],
  });

  seccionesPorId.set("informacion-financiera", {
    id: "informacion-financiera",
    titulo: "Información Financiera",
    bloques: [
      crearBloqueDesdeRegistro(
        "informacion-financiera-principal",
        "Informacion financiera",
        datosInvestigacion.informacionFinanciera as unknown as Record<string, unknown>,
        {
          contenido: "Contenido",
          comentariosFinancieros: "Comentarios financieros",
          activosFijos: "Activos fijos",
          seguros: "Seguros",
        },
      ),
    ],
  });

  seccionesPorId.set("balances", {
    id: "balances",
    titulo: "Balances",
    bloques: [],
    grupos: datosInvestigacion.balances.length > 0
      ? datosInvestigacion.balances.map((balance, indice) => {
          const tituloGrupo = [balance.tipoEstadoFinanciero, balance.tipoBalance]
            .filter(Boolean)
            .join(" · ") || `Balance ${indice + 1}`;
          const subtituloGrupo = [
            balance.fecha ? `Fecha: ${balance.fecha}` : null,
            balance.operacionCambio ? `Moneda: ${balance.operacionCambio}` : null,
            balance.tipoCambio ? `TC: ${balance.tipoCambio}` : null,
            balance.esActual ? "Actual" : null,
          ].filter(Boolean).join("  ·  ");

          const bloques: BloqueVistaPreviaInforme[] = [
            crearBloqueDesdeRegistro(
              `balance-${indice}`,
              "Datos generales",
              {
                fecha: balance.fecha,
                fechaInicio: balance.fechaInicio,
                fechaFin: balance.fechaFin,
                tipoCambio: balance.tipoCambio,
                operacionCambio: balance.operacionCambio,
              },
              {
                fecha: "Fecha",
                fechaInicio: "Fecha inicio",
                fechaFin: "Fecha fin",
                tipoCambio: "Tipo de cambio",
                operacionCambio: "Moneda",
              },
            ),
          ];

          if (balance.detalleCuentas) {
            bloques.push(
              crearBloqueDesdeRegistro(
                `balance-general-${indice}`,
                "Balance general",
                balance.detalleCuentas.balanceGeneral as unknown as Record<string, unknown>,
                {
                  totalCorrientes: "Total corrientes",
                  totalNoCorrientes: "Total no corrientes",
                  otrosActivos: "Otros activos",
                  totalActivos: "Total activos",
                  totalPasivosCorrientes: "Total pasivos corrientes",
                  totalPasivosNoCorrientes: "Total pasivos no corrientes",
                  otrosPasivos: "Otros pasivos",
                  totalPasivos: "Total pasivos",
                  patrimonio: "Patrimonio",
                  totalPasivoPatrimonio: "Total pasivo y patrimonio",
                },
                [],
                "activos-pasivos",
              ),
            );

            bloques.push(
              crearBloqueDesdeRegistro(
                `balance-ganancias-${indice}`,
                "Estado de ganancias y perdidas",
                balance.detalleCuentas.estadoGananciasPerdidas as unknown as Record<string, unknown>,
                {
                  ventasNetas: "Ventas netas",
                  utilidadGanancia: "Utilidad / ganancia",
                },
              ),
            );

            const esBancoOSeguro = balance.idTipoEstadoFinanciero === 3 || balance.idTipoEstadoFinanciero === 4;
            if (!esBancoOSeguro) {
              bloques.push(
                crearBloqueDesdeRegistro(
                  `balance-ratios-${indice}`,
                  "Ratios financieros",
                  balance.detalleCuentas.ratios as unknown as Record<string, unknown>,
                  {
                    liquidez: "Liquidez",
                    capitalTrabajo: "Capital de trabajo",
                    endeudamiento: "Endeudamiento",
                    rentabilidad: "Rentabilidad",
                  },
                ),
              );
            }

            if (balance.detalleCuentas.registrosEstadoFinanciero && Object.keys(balance.detalleCuentas.registrosEstadoFinanciero).length > 0) {
              const esTurquia = balance.idTipoEstadoFinanciero === 5 || (balance.tipoEstadoFinanciero ?? "").toLowerCase().includes("turqu");
              bloques.push(
                crearBloqueDesdeRegistro(
                  `balance-registros-${indice}`,
                  "Registros configurados",
                  balance.detalleCuentas.registrosEstadoFinanciero,
                  esTurquia ? etiquetasTurquia : {},
                  [],
                  "dos-columnas",
                ),
              );
            }
          }

          return { id: `grupo-balance-${indice}`, titulo: tituloGrupo, subtitulo: subtituloGrupo, bloques };
        })
      : undefined,
  });

  seccionesPorId.set("bancos-proveedores", {
    id: "bancos-proveedores",
    titulo: "Bancos-Proveedores",
    bloques: [
      crearBloqueDesdeRegistro(
        "referencias-principales",
        "Referencias",
        datosInvestigacion.referencias as unknown as Record<string, unknown>,
        {
          comentariosProveedores: "Comentarios proveedores",
          referenciasBancos: "Referencias bancos",
          litigios: "Litigios",
          riesgoPrincipal: "Riesgo principal",
          superintendencia: "Superintendencia",
        },
      ),
      ...crearBloquesDesdeLista(
        "proveedores",
        "Proveedor",
        datosInvestigacion.proveedores as unknown as Record<string, unknown>[],
        {
          nombreEmpresa: "Nombre de empresa",
          contacto: "Contacto",
          tipoProveedor: "Tipo de proveedor",
          tipoPersona: "Tipo de persona",
          pais: "Pais",
          taxIdType: "Tipo tax ID",
          taxIdNumber: "Numero tax ID",
          telefono: "Telefono",
          comienzoNegociaciones: "Comienzo negociaciones",
          tieneReferenciaComercial: "Referencia comercial",
          operacionCambioMoneda: "Moneda",
          tipoCambio: "Tipo de cambio",
          limiteCredito: "Limite de credito",
          promedioMensual: "Promedio mensual",
        },
        ["idInformeProveedor", "idTipoProveedor", "idPais", "idTipoDocumento", "idMoneda", "idLimiteCredito", "idPlazoCredito", "esTieneReferenciaComercial"],
      ),
      ...crearBloquesDesdeLista(
        "bancos",
        "Banco",
        datosInvestigacion.bancos as unknown as Record<string, unknown>[],
        {
          banco: "Banco",
          numeroCuenta: "Numero de cuenta",
          sector: "Sector",
          telefono: "Telefono",
          sectoristaJefeCuenta: "Sectorista / jefe de cuenta",
          pais: "Pais",
        },
        ["idInformeBanco", "idBanco", "idPais", "idSector"],
      ),
    ],
  });

  seccionesPorId.set("datos-generales", {
    id: "datos-generales",
    titulo: "Datos Generales",
    bloques: [
      crearBloqueDesdeRegistro(
        "datos-generales-principal",
        "Datos generales",
        datosInvestigacion.datosGenerales as unknown as Record<string, unknown>,
        {
          informacionGeneral: "Informacion general",
          opinionCredito: "Opinion de credito",
        },
      ),
    ],
  });

  seccionesPorId.set("directorio-ejecutivo", {
    id: "directorio-ejecutivo",
    titulo: "Directorio Ejecutivo",
    bloques: crearBloquesDesdeLista(
      "directorio-ejecutivo",
      "Ejecutivo",
      datosInvestigacion.directorioEjecutivo as unknown as Record<string, unknown>[],
      {
        nombreCompleto: "Nombre completo",
        cargo: "Cargo",
        tipoPersona: "Tipo de persona",
        pais: "Pais",
        porcentaje: "Participacion %",
        vinculadoDesde: "Vinculado desde",
        companiaAnterior: "Compania anterior",
        esParteDirectorio: "Es parte del directorio",
        lista: "Aparece en lista",
        detalleEjecutivo: "Imprime detalle",
        descripcionBusqueda: "Referencias",
      },
      ["idInformeDirectorioEjecutivo", "id", "idDirectorioEjecutivo", "idCargo", "ejecutivo", "orden"],
    ),
  });

  return seccionesInvestigacionAnalista
    .map((seccion) => seccionesPorId.get(seccion.id))
    .filter((seccion): seccion is SeccionVistaPreviaInforme => Boolean(seccion));
}

function CustomTabsVistaPreviaInforme({ idTabActiva, onTabChange }: PropsTabsVistaPreviaInforme) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 pt-4 shadow-sm">
      <div className="flex flex-wrap gap-0 border-b border-gray-200">
        <button
          type="button"
          onClick={() => onTabChange("vista-general")}
          className={`-mb-px border-b-2 px-6 py-3 text-sm font-bold transition-all ${
            idTabActiva === "vista-general"
              ? "border-brand-black text-brand-black"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Vista general
        </button>
        {seccionesInvestigacionAnalista.map((seccion) => (
          <button
            key={seccion.id}
            type="button"
            onClick={() => onTabChange(seccion.id)}
            className={`-mb-px border-b-2 px-6 py-3 text-sm font-bold transition-all ${
              idTabActiva === seccion.id
                ? "border-brand-black text-brand-black"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {seccion.titulo}
          </button>
        ))}
      </div>
    </div>
  );
}

function CustomTarjetaVistaPreviaInforme({
  titulo,
  indicador,
  encabezado,
  secciones,
  mostrarTituloSeccion,
  mostrarValorTraducido,
}: PropsTarjetaVistaPreviaInforme) {
  return (
    <article className="min-h-[600px] overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      {/* Cabecera del documento */}
      <div className="border-b border-gray-200 bg-slate-50 px-8 py-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-slate-400" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{titulo}</p>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {indicador}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-[11px]">
          <div className="flex gap-2">
            <span className="w-24 shrink-0 font-semibold text-slate-400">{mostrarValorTraducido ? "Country" : "País"}:</span>
            <span className="text-slate-700">{encabezado.pais || "-"}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-24 shrink-0 font-semibold text-slate-400">{mostrarValorTraducido ? "Date" : "Fecha"}:</span>
            <span className="text-slate-700">{encabezado.fecha}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-24 shrink-0 font-semibold text-slate-400">{mostrarValorTraducido ? "Type" : "Tipo"}:</span>
            <span className="text-slate-700">{encabezado.tipoSolicitud || "-"}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-24 shrink-0 font-semibold text-slate-400">{mostrarValorTraducido ? "Analyst" : "Analista"}:</span>
            <span className="text-slate-700">{encabezado.analista}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-24 shrink-0 font-semibold text-slate-400">{mostrarValorTraducido ? "Translator" : "Traductor"}:</span>
            <span className="text-slate-700">{encabezado.traductor}</span>
          </div>
        </div>
      </div>

      {/* Cuerpo del documento */}
      <div className="px-8 py-6">
        <div className="space-y-8">
          {secciones.map((seccion) => (
            <section key={seccion.id}>
              {mostrarTituloSeccion ? (
                <div className="mb-5 border-b-2 border-slate-700 pb-1.5">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-700">
                    {mostrarValorTraducido ? traducirTextoVistaPrevia(seccion.titulo) : seccion.titulo}
                  </h3>
                </div>
              ) : null}

              {seccion.grupos && seccion.grupos.length > 0 ? (
                <div className="space-y-4">
                  {seccion.grupos.map((grupo) => (
                    <div key={grupo.id} className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                      <div className="border-b border-slate-600 bg-slate-700 px-4 py-2.5">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-white">{grupo.titulo}</p>
                        {grupo.subtitulo ? (
                          <p className="mt-0.5 text-[10px] text-slate-300">{grupo.subtitulo}</p>
                        ) : null}
                      </div>
                      <div className="divide-y divide-slate-100">
                        {grupo.bloques.filter((b) => b.filas.length > 0).map((bloque) => {
                          const tituloBloque = mostrarValorTraducido ? traducirTextoVistaPrevia(bloque.titulo) : bloque.titulo;

                          if (bloque.layout === "activos-pasivos") {
                            const filasActivos = bloque.filas.filter((f) => etiquetasActivosBalanceGeneral.has(f.etiqueta));
                            const filasPasivos = bloque.filas.filter((f) => !etiquetasActivosBalanceGeneral.has(f.etiqueta));
                            const renderFilaContable = (fila: FilaVistaPreviaInforme, indice: number) => {
                              const etiqueta = mostrarValorTraducido ? fila.etiquetaTraducida : fila.etiqueta;
                              const valor = mostrarValorTraducido ? fila.valorTraducido : fila.valorOriginal;
                              const esImportante = esEtiquetaImportante(etiqueta);
                              return (
                                <div key={fila.etiqueta} className={`flex items-baseline justify-between gap-2 px-2 py-1 text-xs ${indice % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}>
                                  <span className={`font-semibold ${esImportante ? "uppercase text-slate-700" : "text-slate-500"}`}>{etiqueta}</span>
                                  <span className={`shrink-0 tabular-nums font-mono ${esImportante ? "font-bold text-slate-900" : "text-slate-700"}`}>{valor}</span>
                                </div>
                              );
                            };
                            return (
                              <div key={bloque.id} className="px-3 py-2">
                                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">{tituloBloque}</p>
                                <div className="grid grid-cols-2 divide-x divide-slate-100 overflow-hidden rounded-md border border-slate-100">
                                  <div>
                                    <div className="border-b border-slate-100 bg-slate-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">Activos</div>
                                    {filasActivos.map((fila, i) => renderFilaContable(fila, i))}
                                  </div>
                                  <div>
                                    <div className="border-b border-slate-100 bg-slate-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">Pasivos y Patrimonio</div>
                                    {filasPasivos.map((fila, i) => renderFilaContable(fila, i))}
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          if (bloque.layout === "dos-columnas") {
                            const pares: [FilaVistaPreviaInforme, FilaVistaPreviaInforme | null][] = [];
                            for (let i = 0; i < bloque.filas.length; i += 2) {
                              pares.push([bloque.filas[i], bloque.filas[i + 1] ?? null]);
                            }
                            const renderCeldaDosCol = (fila: FilaVistaPreviaInforme | null, filaIndice: number) => {
                              if (!fila) return <div key={`vacia-${filaIndice}`} className="px-2 py-1" />;
                              const etiqueta = mostrarValorTraducido ? fila.etiquetaTraducida : fila.etiqueta;
                              const valor = mostrarValorTraducido ? fila.valorTraducido : fila.valorOriginal;
                              const esImportante = esEtiquetaImportante(etiqueta);
                              return (
                                <div key={fila.etiqueta} className="flex items-baseline justify-between gap-2 px-2 py-1 text-xs">
                                  <span className={`font-semibold ${esImportante ? "uppercase text-slate-700" : "text-slate-500"}`}>{etiqueta}</span>
                                  <span className={`shrink-0 tabular-nums font-mono ${esImportante ? "font-bold text-slate-900" : "text-slate-700"}`}>{valor}</span>
                                </div>
                              );
                            };
                            return (
                              <div key={bloque.id} className="px-3 py-2">
                                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">{tituloBloque}</p>
                                <div className="overflow-hidden rounded-md border border-slate-100">
                                  {pares.map((par, i) => (
                                    <div key={i} className={`grid grid-cols-2 divide-x divide-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}>
                                      {renderCeldaDosCol(par[0], i * 2)}
                                      {renderCeldaDosCol(par[1], i * 2 + 1)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div key={bloque.id} className="px-3 py-2">
                              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">{tituloBloque}</p>
                              <div className="overflow-hidden rounded-md border border-slate-100">
                                {bloque.filas.map((fila, indice) => {
                                  const etiqueta = mostrarValorTraducido ? fila.etiquetaTraducida : fila.etiqueta;
                                  const valor = mostrarValorTraducido ? fila.valorTraducido : fila.valorOriginal;
                                  const esImportante = esEtiquetaImportante(etiqueta);
                                  const esNumero = /^-?[\d.,]+$/.test(valor.trim());
                                  return (
                                    <div
                                      key={`${bloque.id}-${fila.etiqueta}`}
                                      className={`flex items-baseline gap-3 text-xs ${indice % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}
                                    >
                                      <p className={`shrink-0 basis-[55%] border-r border-slate-100 px-3 py-1.5 font-semibold ${
                                        esImportante ? "uppercase text-slate-700" : "text-slate-500"
                                      }`}>
                                        {etiqueta}
                                      </p>
                                      <p className={`min-w-0 flex-1 px-3 py-1.5 leading-relaxed tabular-nums ${
                                        esImportante
                                          ? `font-bold text-slate-900 ${esNumero ? "text-right font-mono" : ""}`
                                          : `text-slate-800 ${esNumero ? "text-right font-mono" : ""}`
                                      }`}>
                                        {valor}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : seccion.bloques.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
                  Sin registros.
                </div>
              ) : (
                <div className="space-y-5">
                  {seccion.bloques.map((bloque) => (
                    <div key={bloque.id}>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {mostrarValorTraducido ? traducirTextoVistaPrevia(bloque.titulo) : bloque.titulo}
                      </p>
                      <div className="overflow-hidden rounded-lg border border-slate-100">
                        {bloque.filas.map((fila, indice) => {
                          const etiqueta = mostrarValorTraducido ? fila.etiquetaTraducida : fila.etiqueta;
                          const valor = mostrarValorTraducido ? fila.valorTraducido : fila.valorOriginal;
                          const subValor = mostrarValorTraducido ? fila.subValorTraducido : fila.subValorOriginal;
                          return (
                            <div
                              key={`${bloque.id}-${fila.etiqueta}`}
                              className={`grid text-xs md:grid-cols-[200px_minmax(0,1fr)] ${
                                indice % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                              }`}
                            >
                              <p className="border-r border-slate-100 px-4 py-2.5 font-semibold text-slate-500">
                                {etiqueta}
                              </p>
                              <div className="px-4 py-2 leading-relaxed text-slate-800">
                                <span>{valor}</span>
                                {subValor ? (
                                  <p className="mt-0.5 text-[11px] text-slate-500">{subValor}</p>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {seccion.observaciones ? (
                <div className="mt-4 border-l-2 border-slate-300 bg-slate-50/50 py-3 pl-4 pr-4">
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {mostrarValorTraducido ? "Observations" : "Observaciones"} · {mostrarValorTraducido ? traducirTextoVistaPrevia(seccion.titulo) : seccion.titulo}
                  </p>
                  <p className="text-xs leading-relaxed text-slate-600">{seccion.observaciones}</p>
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}

export function CustomVistaPreviaInformeComparado({
  datosInvestigacion,
  encabezado,
  idInforme,
  idPedido,
  indicadorReporteTraducido = "En traducción",
  mostrarInformeTraducido = true,
  className = "space-y-6",
  contenidoEntreTabsYTarjetas,
}: PropsVistaPreviaInformeComparado) {
  const [idTabActiva, setIdTabActiva] = useState<IdTabVistaPreviaInforme>("vista-general");
  const idInformeDocumento = Number(idInforme);
  const idPedidoDocumento = Number(idPedido);
  const puedeMostrarDocumento = Number.isFinite(idInformeDocumento) && idInformeDocumento > 0
    && Number.isFinite(idPedidoDocumento) && idPedidoDocumento > 0;

  const {
    data: documentoGenerado,
    isLoading: estaCargandoDocumento,
    isError: errorDocumento,
  } = useQuery({
    queryKey: ["informe-documento-generado", idInformeDocumento, idPedidoDocumento],
    queryFn: () => informeService.previsualizarDocumento(idInformeDocumento, idPedidoDocumento),
    enabled: puedeMostrarDocumento,
    staleTime: 15 * 60 * 1000,
  });

  const { data: opcionesTiempoCredito } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIEMPO_CREDITO_VENTAS],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIEMPO_CREDITO_VENTAS),
    enabled: !puedeMostrarDocumento && Boolean(datosInvestigacion),
    staleTime: Infinity,
  });

  const seccionesVistaPrevia = useMemo(
    () => datosInvestigacion
      ? obtenerSeccionesVistaPreviaInforme(datosInvestigacion, opcionesTiempoCredito)
      : [],
    [datosInvestigacion, opcionesTiempoCredito],
  );

  const seccionesVisibles = useMemo(
    () => (idTabActiva === "vista-general"
      ? seccionesVistaPrevia
      : seccionesVistaPrevia.filter((seccion) => seccion.id === idTabActiva)),
    [idTabActiva, seccionesVistaPrevia],
  );

  if (puedeMostrarDocumento) {
    return (
      <div className={className}>
        {contenidoEntreTabsYTarjetas}
        {estaCargandoDocumento ? (
          <div className="min-h-[calc(100vh-12rem)] rounded-3xl border border-slate-200 bg-white shadow-sm">
            <PantallaCarga message="Generando vista previa del documento..." />
          </div>
        ) : documentoGenerado ? (
          <CustomVisorDocumentoInforme
            documento={documentoGenerado}
            datosInvestigacion={datosInvestigacion}
            encabezado={encabezado}
          />
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-sm">
            {errorDocumento ? "No se pudo generar la vista previa del documento." : "No hay documento disponible para mostrar."}
          </div>
        )}
      </div>
    );
  }

  if (!datosInvestigacion) {
    return (
      <div className={className}>
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-sm">
          No hay informacion disponible para mostrar.
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <CustomTabsVistaPreviaInforme idTabActiva={idTabActiva} onTabChange={setIdTabActiva} />
      {contenidoEntreTabsYTarjetas}

      <div className={`grid gap-6 ${mostrarInformeTraducido ? "xl:grid-cols-2" : ""}`}>
        <CustomTarjetaVistaPreviaInforme
          titulo="Reporte original (español)"
          indicador="Original"
          encabezado={encabezado}
          secciones={seccionesVisibles}
          mostrarTituloSeccion={idTabActiva === "vista-general"}
          mostrarValorTraducido={false}
        />
        {mostrarInformeTraducido ? (
          <CustomTarjetaVistaPreviaInforme
            titulo="Reporte traducido (inglés)"
            indicador={indicadorReporteTraducido}
            encabezado={encabezado}
            secciones={seccionesVisibles}
            mostrarTituloSeccion={idTabActiva === "vista-general"}
            mostrarValorTraducido
          />
        ) : null}
      </div>
    </div>
  );
}

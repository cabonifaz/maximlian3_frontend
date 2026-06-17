import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { CustomModalBalanceAnalista } from "@maximilian/components/investigacion/CustomModalBalanceInforme";
import { CustomModalBancoAnalista, CustomModalCrearBancoAnalista } from "@maximilian/components/investigacion/CustomModalBancoInforme";
import type { BancoListaItem } from "@maximilian/shared/types/banco.type";
import { CustomModalArchivosInvestigacionAnalista } from "@maximilian/components/investigacion/CustomModalArchivosInforme";
import { CustomModalBuscarEjecutivoAnalista } from "@maximilian/components/investigacion/CustomModalBuscarEjecutivo";
import { CustomModalDetalleCuentasAnalista } from "@maximilian/components/investigacion/CustomModalDetalleCuentasInforme";
import { CustomModalFinalizarInvestigacionAnalista } from "@maximilian/components/investigacion/CustomModalFinalizarInforme";
import { CustomModalVistaPreviaInforme } from "@maximilian/components/common/CustomModalVistaPreviaInforme";
import { CustomModalExtraccionInformacionAnalista } from "@maximilian/components/investigacion/CustomModalProcesamientoInforme";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import PantallaCarga from "@maximilian/components/common/PantallaCarga";
import { CustomModalConfirmacionAccion } from "@maximilian/components/common/CustomModalConfirmacionAccion";
import { CustomModalConfirmacionEliminacion } from "@maximilian/components/common/CustomModalConfirmacionEliminacion";
import { CustomModalListaPersonasAnalista } from "@maximilian/components/investigacion/CustomModalListaPersonas";
import {
  CustomModalRegistroEmpresaRelacionadaAnalista,
  type RegistroPersonaAnalista,
} from "@maximilian/components/investigacion/CustomModalRegistroEmpresaRelacionada";
import { CustomModalLocalAnalista } from "@maximilian/components/investigacion/CustomModalLocalInforme";
import { CustomModalOperacionAnalista } from "@maximilian/components/investigacion/CustomModalOperacionInforme";
import { CustomModalProveedorAnalista } from "@maximilian/components/investigacion/CustomModalProveedorInforme";
import { CustomModalRegistroEjecutivoAnalista } from "@maximilian/components/investigacion/CustomModalRegistroEjecutivo";
import { CustomModalRegistroPersonaDirectorioAnalista } from "@maximilian/components/investigacion/CustomModalRegistroPersonaDirectorio";
import {
  CustomModalRevisionCompaniasExtraccion,
  type CompaniaRelacionadaExtraccionNueva,
} from "@maximilian/components/investigacion/CustomModalRevisionCompaniasExtraccion";
import { CustomModalRevisionEjecutivosExtraccion } from "@maximilian/components/investigacion/CustomModalRevisionEjecutivosExtraccion";
import { CustomModalRevisionBancosExtraccion } from "@maximilian/components/investigacion/CustomModalRevisionBancosExtraccion";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { MultiCustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscableMultiple";
import {
  AreaInvestigacionAnalista,
  CampoInvestigacionAnalista,
  ContenedorSeccionInvestigacionAnalista,
  MenuSeccionesInvestigacionAnalista,
  PestanasInvestigacionAnalista,
  ResumenPedidoInvestigacionAnalista,
  SelectorMaestroConAltaInvestigacionAnalista,
} from "@maximilian/components/investigacion/ControlesInforme";
import { informeService } from "@maximilian/services/informe.service";
import { servicioBanco } from "@maximilian/services/banco.service";
import { servicioCompania } from "@maximilian/services/compania.service";
import { pedidoService } from "@maximilian/services/pedido.service";
import { servicioAsignacion } from "@maximilian/services/asignacion.service";
import { servicioTablaMaestra } from "@maximilian/services/tablaMaestra.service";
import {
  obtenerDatosInvestigacionAnalista,
  seccionesInvestigacionAnalista,
} from "@maximilian/shared/utils/datos-simulados-investigacion";
import type {
  AlcanceExtraccionInforme,
  InformeBalanceBancoRequest,
  InformeBalanceDesagregadoRequest,
  InformeBalanceSeguroRequest,
  InformeBalanceTotalizadoRequest,
  InformeBalanceTurquiaRequest,
  InformeConfiguracionExtraccion,
  InformeCrearRequest,
  InformeSeccionExtraccionDisponible,
} from "@maximilian/shared/types/informe.type";
import type {
  ArchivoInvestigacionAnalista,
  DatosPedidoNavegacionInvestigacion,
  DatosInvestigacionAnalista,
  EmpresaRelacionadaAnalista,
  IdSeccionInvestigacionAnalista,
  ModoInvestigacionAnalista,
  PestanaAspectosLegales,
  PestanaBancosProveedores,
  PestanaRamoOperaciones,
  RegistroBancoAnalista,
  RegistroBalanceAnalista,
  RegistroDirectorioEjecutivoAnalista,
  RegistroPersonaDirectorioAnalista,
  RegistroProveedorAnalista,
} from "@maximilian/shared/types/investigacion.type";
import {
  TablaMaestraId,
  obtenerDescripcionTablaMaestra,
} from "@maximilian/shared/types/tabla-maestra.type";
import {
  normalizarMontoDosDecimales,
  normalizarMontoDecimales,
  obtenerNumeroDesdeMonto,
  obtenerNumeroOpcionalDesdeMonto,
  sanitizarMontoDecimales,
  seleccionarTextoCampoEditable,
} from "@maximilian/shared/utils/formato-monto.util";
import {
  obtenerClaveEstadoFinanciero,
  obtenerValorCampoEstadoFinanciero,
} from "@maximilian/shared/utils/estados-financieros.util";

interface PropsPantallaInvestigacionAnalista {
  idPedido?: string;
  idInforme?: number;
  modo: ModoInvestigacionAnalista;
  datosPedidoNavegacion?: DatosPedidoNavegacionInvestigacion;
}

interface PropsContenidoPantallaInvestigacionAnalista extends PropsPantallaInvestigacionAnalista {
  datosIniciales: DatosInvestigacionAnalista;
  archivosIniciales?: ArchivoInvestigacionAnalista[];
  idTipoPersonaInicial?: number;
  idPaisInicial?: number;
  idTipoRegTributarioInicial?: number;
  idEstadoActualInicial?: number;
  idTipoEmpresaInicial?: number;
  idCiudadRegistroInicial?: number;
  idSectorInicial?: number;
  idActividadInicial?: number;
}

interface CambioExtraccionPendiente {
  ruta: string[];
  etiqueta: string;
  valorOriginal: string;
  valorNuevo: string;
  alAplicar?: () => void;
}

interface CiudadExtraccionPendiente {
  valor: string;
  idPais: number;
  pais: string;
}

interface ValorExtraidoNormalizado {
  valor: string;
  valorFormulario?: string;
  alAplicar?: () => void;
  omitirActualizacion?: boolean;
  confirmarConValorVacio?: boolean;
}

const FILAS_POR_PAGINA_INVESTIGACION = 5;
const ID_ESTADO_PEDIDO_BORRADOR = 3;
const ID_ESTADO_PEDIDO_FINALIZADO = 5;
function obtenerTotalPaginas(totalRegistros: number) {
  return Math.max(1, Math.ceil(totalRegistros / FILAS_POR_PAGINA_INVESTIGACION));
}

function paginarRegistros<T>(registros: T[], paginaActual: number) {
  const inicio = (paginaActual - 1) * FILAS_POR_PAGINA_INVESTIGACION;
  return registros.slice(inicio, inicio + FILAS_POR_PAGINA_INVESTIGACION);
}

function obtenerPorcentajeNumerico(valor?: string) {
  const numero = Number.parseFloat((valor ?? "").replace("%", "").replace(",", ".").trim());
  return Number.isNaN(numero) ? 0 : numero;
}

function formatearPorcentajeOchoDecimales(valor: number) {
  return `${valor.toFixed(8)}%`;
}

function enmascararNumeroCuenta(valor: string) {
  const numeroCuenta = valor.trim();
  if (!numeroCuenta) return "-";
  if (numeroCuenta.length <= 4) return numeroCuenta;
  return `${"*".repeat(numeroCuenta.length - 4)}${numeroCuenta.slice(-4)}`;
}

function obtenerNumeroDesdeTexto(valor?: string) {
  return obtenerNumeroDesdeMonto(valor);
}

function obtenerNumeroOpcionalDesdeTexto(valor?: string) {
  return obtenerNumeroOpcionalDesdeMonto(valor);
}

function obtenerEnteroDesdeTexto(valor?: string) {
  if (!valor) return 0;
  const numero = Number.parseInt(valor.replace(/\D/g, ""), 10);
  return Number.isFinite(numero) ? numero : 0;
}

function convertirFechaIso(valor?: string) {
  if (!valor?.trim()) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return `${valor}T00:00:00.000Z`;

  const partes = valor.split("/");
  if (partes.length !== 3) return null;

  const [dia, mes, ano] = partes;
  if (!dia || !mes || !ano) return null;

  return `${ano.padStart(4, "0")}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}T00:00:00.000Z`;
}

function obtenerIdPorTexto(opciones: { num1: number | null; string1: string | null }[] | undefined, valor: string) {
  return opciones?.find((opcion) => opcion.string1?.trim().toLowerCase() === valor.trim().toLowerCase())?.num1 ?? 0;
}

function obtenerIdPorTextoONumero(opciones: { num1: number | null; string1: string | null }[] | undefined, valor: string) {
  const id = obtenerEnteroDesdeTexto(valor);
  if (id > 0) return id;
  return obtenerIdPorTexto(opciones, valor);
}

function obtenerIdCiiuPorValor(
  opciones: { num1: number | null; string1: string | null; string2?: string | null }[] | undefined,
  valor: string,
) {
  const texto = valor.trim().toLowerCase();
  if (!texto) return 0;
  const id = Number.parseInt(valor.trim(), 10);
  if (Number.isFinite(id) && opciones?.some((opcion) => opcion.num1 === id)) return id;
  const codigo = valor.match(/^\d+/)?.[0] ?? "";

  return opciones?.find((opcion) => {
    const textoCompuesto = [opcion.string2?.trim(), opcion.string1?.trim()].filter(Boolean).join(" - ").toLowerCase();
    return textoCompuesto === texto
      || opcion.string1?.trim().toLowerCase() === texto
      || (!!codigo && opcion.string2?.trim() === codigo);
  })?.num1 ?? 0;
}

function obtenerTextoPorId(opciones: { num1: number | null; string1: string | null }[] | undefined, id?: number) {
  if (!id) return "";
  return opciones?.find((opcion) => Number(opcion.num1) === Number(id))?.string1?.trim() ?? "";
}

function obtenerIdMoneda(valor: string) {
  const monedaNormalizada = valor.trim().toLowerCase();
  if (monedaNormalizada === "us dollar") return 1;
  if (monedaNormalizada === "euro") return 2;
  if (monedaNormalizada === "sol") return 3;
  return 0;
}

function obtenerIdTipoBalance(valor?: string) {
  const texto = valor?.trim().toLowerCase() ?? "";
  if (texto === "balance general") return 1;
  if (texto === "balance consolidado") return 2;
  return 0;
}

function obtenerIdTipoArchivo(valor?: string) {
  const texto = valor?.trim().toLowerCase() ?? "";
  if (texto.startsWith("image/")) return 1;
  if (texto === "application/pdf") return 2;
  return 0;
}

function obtenerNumeroMes(valor: string) {
  const meses: Record<string, number> = {
    enero: 1,
    febrero: 2,
    marzo: 3,
    abril: 4,
    mayo: 5,
    junio: 6,
    julio: 7,
    agosto: 8,
    septiembre: 9,
    setiembre: 9,
    octubre: 10,
    noviembre: 11,
    diciembre: 12,
  };

  return meses[valor.trim().toLowerCase()] ?? 0;
}

function esTextoAfirmativo(valor?: string) {
  const texto = valor?.trim().toLowerCase() ?? "";
  return texto === "si" || texto === "sí" || texto === "true" || texto === "1";
}

function obtenerIdObligacionBolsa(valor?: string) {
  const texto = valor?.trim().toLowerCase() ?? "";
  if (texto === "si" || texto === "sí" || texto === "true" || texto === "1") return 1;
  if (texto === "no" || texto === "false" || texto === "2") return 2;
  return undefined;
}

function obtenerTextoObligacionBolsa(valor?: string) {
  const id = obtenerIdObligacionBolsa(valor);
  if (id === 1) return "Sí";
  if (id === 2) return "No";
  return "";
}

const opcionesBooleanasBolsa = [
  { idEmpresa: 0, idTablaMaestra: null, idMaestro: 0, descripcion: "", num1: 1, num2: null, num3: null, string1: "Sí", string2: null, string3: null, date1: null, date2: null, date3: null },
  { idEmpresa: 0, idTablaMaestra: null, idMaestro: 0, descripcion: "", num1: 2, num2: null, num3: null, string1: "No", string2: null, string3: null, date1: null, date2: null, date3: null },
];

const CAMPOS_MONETARIOS_EXTRACCION = new Set([
  "aspectosLegales.capitalInicial",
  "aspectosLegales.capitalDesembolsado",
  "aspectosLegales.patrimonioNeto",
  "aspectosLegales.valorAcciones",
  "aspectosLegales.tipoCambio",
]);

type CampoPorcentajeOperacion =
  | "ventasContadoPorcentaje"
  | "ventasCreditoPorcentaje"
  | "territorioVentasPorcentaje"
  | "ventasExtranjeroPorcentaje"
  | "comprasNacionalesPorcentaje"
  | "comprasExtranjeroPorcentaje"
  | "comprasContadoNacionalesPorcentaje"
  | "comprasCreditoNacionalesPorcentaje"
  | "comprasContadoInternacionalesPorcentaje"
  | "comprasCreditoInternacionalesPorcentaje";

const CAMPOS_PORCENTAJE_EXTRACCION = new Set<CampoPorcentajeOperacion>([
  "ventasContadoPorcentaje",
  "ventasCreditoPorcentaje",
  "territorioVentasPorcentaje",
  "ventasExtranjeroPorcentaje",
  "comprasNacionalesPorcentaje",
  "comprasExtranjeroPorcentaje",
  "comprasContadoNacionalesPorcentaje",
  "comprasCreditoNacionalesPorcentaje",
  "comprasContadoInternacionalesPorcentaje",
  "comprasCreditoInternacionalesPorcentaje",
]);

const CAMPOS_PORCENTAJE_COMPLEMENTARIO: Record<CampoPorcentajeOperacion, CampoPorcentajeOperacion> = {
  ventasContadoPorcentaje: "ventasCreditoPorcentaje",
  ventasCreditoPorcentaje: "ventasContadoPorcentaje",
  territorioVentasPorcentaje: "ventasExtranjeroPorcentaje",
  ventasExtranjeroPorcentaje: "territorioVentasPorcentaje",
  comprasNacionalesPorcentaje: "comprasExtranjeroPorcentaje",
  comprasExtranjeroPorcentaje: "comprasNacionalesPorcentaje",
  comprasContadoNacionalesPorcentaje: "comprasCreditoNacionalesPorcentaje",
  comprasCreditoNacionalesPorcentaje: "comprasContadoNacionalesPorcentaje",
  comprasContadoInternacionalesPorcentaje: "comprasCreditoInternacionalesPorcentaje",
  comprasCreditoInternacionalesPorcentaje: "comprasContadoInternacionalesPorcentaje",
};

const ETIQUETAS_SECCIONES_EXTRACCION: Record<string, string> = {
  identificacion: "Identificación",
  legales: "Aspectos Legales",
  aspectosLegales: "Aspectos Legales",
  companiasRelacionadas: "Compañías Relacionadas",
  operacionPrincipal: "Ramo Operaciones",
  ramoOperaciones: "Ramo Operaciones",
  importaciones: "Importaciones",
  exportaciones: "Exportaciones",
  locales: "Locales",
  informacionFinanciera: "Información Financiera",
  balances: "Balances",
  referencias: "Referencias",
  proveedores: "Proveedores",
  bancos: "Bancos",
  datosGenerales: "Datos Generales",
  directorioEjecutivo: "Directorio Ejecutivo",
};

const CONFIGURACION_EXTRACCION_POR_SECCION: Record<IdSeccionInvestigacionAnalista, Record<string, string[]>> = {
  identificacion: {
    identificacion: [
      "tipoPersona",
      "nombreEmpresa",
      "nombreComercial",
      "pais",
      "operacionesCambio",
      "tipoIdentificacionFiscal",
      "numeroIdentificacionFiscal",
      "direccionPrincipal",
      "ciudadEstadoProvincia",
      "numeroTelefono",
      "numeroFax",
      "correoElectronico",
      "paginaWeb",
      "estadoActual",
      "datosAdicionales",
    ],
  },
  "aspectos-legales": {
    legales: [
      "antecedentes",
      "aspectosLegales",
      "capitalDesembolsado",
      "capitalInicial",
      "ciudadRegistro",
      "comentariosEmpresasRelacionadas",
      "condiciones",
      "fechaConstitucion",
      "monedaTipoCambio",
      "notaria",
      "notario",
      "obligacionBolsa",
      "operacionesCambioDivisas",
      "patrimonioNeto",
      "registro",
      "tipoAcciones",
      "tipoCambio",
      "tipoEmpresa",
      "ultimaAmpliacion",
      "valorAcciones",
      "companiasRelacionadas",
    ],
  },
  "ramo-operaciones": {
    ramoOperaciones: [
      "actividad",
      "actividadPrincipal",
      "categoriaCiiu",
      "claseCiiu",
      "comentariosOperaciones",
      "comprasContadoInternacionalesDetalle",
      "comprasContadoInternacionalesPorcentaje",
      "comprasCreditoInternacionalesDetalle",
      "comprasCreditoInternacionalesPorcentaje",
      "comprasExtranjeroDetalles",
      "comprasExtranjeroPorcentaje",
      "comprasContadoNacionalesDetalle",
      "comprasContadoNacionalesPorcentaje",
      "comprasCreditoNacionalesDetalle",
      "comprasCreditoNacionalesPorcentaje",
      "comprasNacionalesDetalles",
      "comprasNacionalesPorcentaje",
      "direccion",
      "exportaciones",
      "importaciones",
      "locales",
      "numeroEmpleados",
      "numeroEmpleadosDetalle",
      "sector",
      "ventasContadoDetalle",
      "ventasContadoPorcentaje",
      "ventasCreditoDetalle",
      "ventasCreditoPorcentaje",
      "ventasNacionalesDetalle",
      "ventasNacionalesPorcentaje",
      "ventasExtranjeroDetalle",
      "ventasExtranjeroPorcentaje",
    ],
  },
  "informacion-financiera": {
    informacionFinanciera: ["contenido", "comentariosFinancieros", "activosFijos", "seguros"],
  },
  balances: {},
  "bancos-proveedores": {
    bancosProveedores: [
      "comentariosProveedores",
      "referenciasBancos",
      "litigios",
      "riesgoPrincipal",
      "superintendencia",
      "proveedores",
      "bancos",
    ],
  },
  "datos-generales": {
    datosGenerales: ["informacionGeneral", "opinionCredito"],
  },
  "directorio-ejecutivo": {
    directorioEjecutivo: [
      "ejecutivo",
      "cargoEjecutivo",
      "vinculadoDesde",
      "companiaAnterior",
      "participacion",
      "formaParteDirectorioEjecutivo",
      "figuraListadoEjecutivos",
      "existenDetallesEjecutivo",
    ],
  },
};

const SECCIONES_LISTA_EXTRACCION = new Set([
  "companiasRelacionadas",
  "importaciones",
  "exportaciones",
  "locales",
  "proveedores",
  "bancos",
]);

const ETIQUETAS_CAMPOS_EXTRACCION: Record<string, string> = {
  porcentaje: "Porcentaje de participacion",
  esParteDirectorio: "¿Forma parte del directorio Ejecutivo?",
  lista: "¿Figura en el listado de ejecutivos?",
  detalleEjecutivo: "¿Se tiene los detalles del Ejecutivo?",
};

function humanizarClaveExtraccion(valor: string) {
  const texto = valor
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .trim();

  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : valor;
}

function construirSeccionesDisponiblesExtraccion(alcance: AlcanceExtraccionInforme): InformeSeccionExtraccionDisponible[] {
  const entradasConfiguracion = alcance === "general"
    ? Object.entries(CONFIGURACION_EXTRACCION_POR_SECCION)
    : [[alcance, CONFIGURACION_EXTRACCION_POR_SECCION[alcance]]] as [IdSeccionInvestigacionAnalista, Record<string, string[]>][];

  return entradasConfiguracion.map(([claveGrupo, configuracion]) => {
    const campos = Object.entries(configuracion).flatMap(([claveSeccion, camposSeccion]) => {
      const etiquetaSeccion = ETIQUETAS_SECCIONES_EXTRACCION[claveSeccion] ?? humanizarClaveExtraccion(claveSeccion);

      if (SECCIONES_LISTA_EXTRACCION.has(claveSeccion)) {
        return [{
          id: 0,
          claveCampo: claveSeccion,
          etiquetaCampo: etiquetaSeccion,
          claveSeccionExtraccion: claveSeccion,
          clavesCamposExtraccion: camposSeccion,
        }];
      }

      return camposSeccion.map((campo) => ({
        id: 0,
        claveCampo: campo,
        etiquetaCampo: ETIQUETAS_CAMPOS_EXTRACCION[campo] ?? humanizarClaveExtraccion(campo),
        claveSeccionExtraccion: claveSeccion,
      }));
    });

    return {
      claveSeccion: claveGrupo,
      etiquetaSeccion: ETIQUETAS_SECCIONES_EXTRACCION[claveGrupo] ?? humanizarClaveExtraccion(claveGrupo),
      campos: campos.map((campo, indice) => ({
        ...campo,
        id: indice + 1,
      })),
    };
  }).filter((seccion) => seccion.campos.length > 0);
}

function esRegistroPlano(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function obtenerOpcionTablaMaestraPorId(
  opciones: { num1: number | null; string1: string | null }[] | undefined,
  valor: unknown,
) {
  const numero = typeof valor === "number"
    ? valor
    : typeof valor === "string" && valor.trim() !== "" && !Number.isNaN(Number(valor))
      ? Number(valor)
      : null;

  if (numero == null) return undefined;
  return opciones?.find((opcion) => opcion.num1 === numero);
}

function obtenerOpcionTablaMaestraPorTexto(
  opciones: { num1: number | null; string1: string | null }[] | undefined,
  valor: unknown,
) {
  const texto = normalizarTextoExtraccion(typeof valor === "string" ? valor : "");
  if (!texto) return undefined;
  return opciones?.find((opcion) => normalizarTextoExtraccion(opcion.string1 ?? "") === texto);
}

function normalizarTextoExtraccion(valor: string) {
  return valor.trim().toLowerCase();
}

function actualizarValorEnRuta<T>(valorActual: T, ruta: string[], valorNuevo: unknown): T {
  if (ruta.length === 0) return valorNuevo as T;

  const [claveActual, ...restoRuta] = ruta;
  const registroActual = (esRegistroPlano(valorActual) ? valorActual : {}) as Record<string, unknown>;

  return {
    ...registroActual,
    [claveActual]: restoRuta.length === 0
      ? valorNuevo
      : actualizarValorEnRuta(registroActual[claveActual], restoRuta, valorNuevo),
  } as T;
}

function construirListasDetalleBalance(balances: RegistroBalanceAnalista[]) {
  const lstBalancesDesagregado: InformeBalanceDesagregadoRequest[] = [];
  const lstBalancesTotalizado: InformeBalanceTotalizadoRequest[] = [];
  const lstBalancesBanco: InformeBalanceBancoRequest[] = [];
  const lstBalancesSeguro: InformeBalanceSeguroRequest[] = [];
  const lstBalancesTurquia: InformeBalanceTurquiaRequest[] = [];

  balances.forEach((balance, index) => {
    const id = index + 1;
    const tipoEstadoFinanciero = balance.tipoEstadoFinanciero
      || ({ 1: "desagregado", 2: "totalizado", 3: "bancos", 4: "seguros", 5: "turquia" }[balance.idTipoEstadoFinanciero ?? 0] ?? balance.tipo);
    const tipo = balance.idTipoEstadoFinanciero ?? ({
      desagregado: 1,
      totalizado: 2,
      bancos: 3,
      seguros: 4,
      turquia: 5,
    } as Record<string, number>)[obtenerClaveEstadoFinanciero(tipoEstadoFinanciero)];
    const r = balance.detalleCuentas?.registrosEstadoFinanciero ?? {};
    const d = (campo: string, ...alternativos: Array<string | undefined>) => obtenerNumeroOpcionalDesdeTexto(
      obtenerValorCampoEstadoFinanciero(r, campo, tipoEstadoFinanciero)
        || alternativos.find((valor) => valor?.trim()),
    ) ?? 0;
    const i = (campo: string): number | null => {
      const v = obtenerValorCampoEstadoFinanciero(r, campo, tipoEstadoFinanciero);
      if (!v) return null;
      const num = Number.parseInt(v.replace(/[^\d-]/g, ""), 10);
      return Number.isFinite(num) ? num : null;
    };

    if (tipo === 1) {
      lstBalancesDesagregado.push({
        id,
        efectivoEquivalente: d("efectivoEquivalente"),
        otrosActivosFinancierosCorriente: d("otrosActivosFinancierosCorriente"),
        cuentasCobrarCorriente: d("cuentasCobrarCorriente"),
        inventariosCorriente: d("inventariosCorriente"),
        activosBiologicosCorriente: d("activosBiologicosCorriente"),
        activosImpuestosGanancias: d("activosImpuestosGanancias"),
        otrosActivosNoFinancierosCorriente: d("otrosActivosNoFinancierosCorriente"),
        totalActivoCorriente: d("totalActivoCorriente"),
        otrosActivosFinancierosNoCorriente: d("otrosActivosFinancierosNoCorriente"),
        inversionesSubsidiarias: d("inversionesSubsidiarias"),
        cuentasCobrarNoCorriente: d("cuentasCobrarNoCorriente"),
        inventariosNoCorriente: d("inventariosNoCorriente"),
        activosBiologicosNoCorriente: d("activosBiologicosNoCorriente"),
        propiedadesInversion: d("propiedadesInversion"),
        propiedadesPlantaEquipo: d("propiedadesPlantaEquipo"),
        intangibles: d("intangibles"),
        activosImpuestosDiferidos: d("activosImpuestosDiferidos"),
        activosImpuestosCorrientes: d("activosImpuestosCorrientes"),
        plusvalia: d("plusvalia"),
        otrosActivosNoFinancierosNoCorriente: d("otrosActivosNoFinancierosNoCorriente"),
        totalActivoNoCorriente: d("totalActivoNoCorriente"),
        totalActivo: d("totalActivo", balance.detalleCuentas?.balanceGeneral.totalActivos),
        otrosPasivosFinancierosCorriente: d("otrosPasivosFinancierosCorriente"),
        cuentasPagarCorriente: d("cuentasPagarCorriente"),
        beneficiosEmpleadosCorriente: d("beneficiosEmpleadosCorriente"),
        otrasProvisionesCorriente: d("otrasProvisionesCorriente"),
        impuestosGananciasCorriente: d("impuestosGananciasCorriente"),
        otrosPasivosNoFinancierosCorriente: d("otrosPasivosNoFinancierosCorriente"),
        totalPasivoCorriente: d("totalPasivoCorriente"),
        otrosPasivosFinancierosNoCorriente: d("otrosPasivosFinancierosNoCorriente"),
        cuentasPagarNoCorriente: d("cuentasPagarNoCorriente"),
        beneficiosEmpleadosNoCorriente: d("beneficiosEmpleadosNoCorriente"),
        otrasProvisionesNoCorriente: d("otrasProvisionesNoCorriente"),
        impuestosDiferidosNoCorriente: d("impuestosDiferidosNoCorriente"),
        impuestosCorrientesNoCorriente: d("impuestosCorrientesNoCorriente"),
        otrosPasivosNoFinancierosNoCorriente: d("otrosPasivosNoFinancierosNoCorriente"),
        totalPasivoNoCorriente: d("totalPasivoNoCorriente"),
        totalPasivos: d("totalPasivos", balance.detalleCuentas?.balanceGeneral.totalPasivos),
        capitalEmitido: d("capitalEmitido"),
        primasEmision: d("primasEmision"),
        accionesInversion: d("accionesInversion"),
        accionesCartera: d("accionesCartera"),
        otrasReservasCapital: d("otrasReservasCapital"),
        resultadosAcumulados: d("resultadosAcumulados"),
        otrasReservasPatrimonio: d("otrasReservasPatrimonio"),
        totalPatrimonio: d("totalPatrimonio"),
        totalPasivoPatrimonio: d("totalPasivoPatrimonio", balance.detalleCuentas?.balanceGeneral.totalPasivoPatrimonio),
        ingresosOrdinarios: d("ingresosOrdinarios"),
        costoVentas: d("costoVentas"),
        gananciaBruta: d("gananciaBruta"),
        gastosVentas: d("gastosVentas"),
        gastosAdministracion: d("gastosAdministracion"),
        otrosIngresosOperativos: d("otrosIngresosOperativos"),
        otrosGastosOperativos: d("otrosGastosOperativos"),
        otrasGananciasPerdidas: d("otrasGananciasPerdidas"),
        gananciaOperativa: d("gananciaOperativa"),
        ingresosFinancieros: d("ingresosFinancieros"),
        ingresosIntereses: d("ingresosIntereses"),
        gastosFinancieros: d("gastosFinancieros"),
        deterioroValor: d("deterioroValor"),
        otrosIngresosSubsidiarias: d("otrosIngresosSubsidiarias"),
        diferenciasCambio: d("diferenciasCambio"),
        gananciaAntesImpuestos: d("gananciaAntesImpuestos"),
        ingresoGastoImpuesto: d("ingresoGastoImpuesto"),
        operacionesDescontinuadas: d("operacionesDescontinuadas"),
        gananciaNeta: d("gananciaNeta"),
        indiceLiquidez: d("indiceLiquidez", balance.detalleCuentas?.ratios.liquidez),
        capitalTrabajo: d("capitalTrabajo", balance.detalleCuentas?.ratios.capitalTrabajo),
        ratioEndeudamiento: d("ratioEndeudamiento", balance.detalleCuentas?.ratios.endeudamiento),
        ratioRentabilidad: d("ratioRentabilidad", balance.detalleCuentas?.ratios.rentabilidad),
      });
    } else if (tipo === 2) {
      lstBalancesTotalizado.push({
        id,
        totalActivoCorriente: d("totalActivoCorriente", balance.detalleCuentas?.balanceGeneral.totalCorrientes),
        totalActivoNoCorriente: d("totalActivoNoCorriente", balance.detalleCuentas?.balanceGeneral.totalNoCorrientes),
        totalActivo: d("totalActivo", balance.detalleCuentas?.balanceGeneral.totalActivos),
        totalPasivoCorriente: d("totalPasivoCorriente", balance.detalleCuentas?.balanceGeneral.totalPasivosCorrientes),
        totalPasivoNoCorriente: d("totalPasivoNoCorriente", balance.detalleCuentas?.balanceGeneral.totalPasivosNoCorrientes),
        totalPasivos: d("totalPasivos", balance.detalleCuentas?.balanceGeneral.totalPasivos),
        totalPatrimonio: d("totalPatrimonio", balance.detalleCuentas?.balanceGeneral.patrimonio),
        totalPasivoPatrimonio: d("totalPasivoPatrimonio", balance.detalleCuentas?.balanceGeneral.totalPasivoPatrimonio),
        ingresosOrdinarios: d("ingresosOrdinarios", balance.detalleCuentas?.estadoGananciasPerdidas.ventasNetas),
        gananciaNeta: d("gananciaNeta", balance.detalleCuentas?.estadoGananciasPerdidas.utilidadGanancia),
        indiceLiquidez: d("indiceLiquidez", balance.detalleCuentas?.ratios.liquidez),
        capitalTrabajo: d("capitalTrabajo", balance.detalleCuentas?.ratios.capitalTrabajo),
        ratioEndeudamiento: d("ratioEndeudamiento", balance.detalleCuentas?.ratios.endeudamiento),
        ratioRentabilidad: d("ratioRentabilidad", balance.detalleCuentas?.ratios.rentabilidad),
      });
    } else if (tipo === 3) {
      lstBalancesBanco.push({
        id,
        disponible: d("disponible"),
        fondosInterbancarios: d("fondosInterbancarios"),
        inversionesValorRazonable: d("inversionesValorRazonable"),
        carteraCreditos: d("carteraCreditos"),
        derivadosNegociacionActivo: d("derivadosNegociacionActivo"),
        derivadosCoberturaActivo: d("derivadosCoberturaActivo"),
        bienesRealizables: d("bienesRealizables"),
        participacionesSubsidiarias: d("participacionesSubsidiarias"),
        inmuebleMobiliarioEquipo: d("inmuebleMobiliarioEquipo"),
        impuestoRentaDiferido: d("impuestoRentaDiferido"),
        otrosActivos: d("otrosActivos"),
        totalActivos: d("totalActivos"),
        obligacionesPublico: d("obligacionesPublico"),
        fondosInterbancariosPasivo: d("fondosInterbancariosPasivo"),
        adeudosFinancieras: d("adeudosFinancieras"),
        derivadosNegociacionPasivo: d("derivadosNegociacionPasivo"),
        derivadosCoberturaPasivo: d("derivadosCoberturaPasivo"),
        cuentasPagarProvisiones: d("cuentasPagarProvisiones"),
        totalPasivo: d("totalPasivo"),
        capitalSocial: d("capitalSocial"),
        reservas: d("reservas"),
        resultadosNoRealizados: d("resultadosNoRealizados"),
        resultadoEjercicio: d("resultadoEjercicio"),
        totalPatrimonio: d("totalPatrimonio"),
        totalPasivoPatrimonio: d("totalPasivoPatrimonio"),
        ingresosIntereses: d("ingresosIntereses"),
        utilidadEjercicio: d("utilidadEjercicio"),
      });
    } else if (tipo === 4) {
      lstBalancesSeguro.push({
        id,
        efectivoDisponible: d("efectivoDisponible"),
        inversionesFinancieras: d("inversionesFinancieras"),
        prestamosInteresesNetos: d("prestamosInteresesNetos"),
        primasCobrar: d("primasCobrar"),
        deudasReaseguradores: d("deudasReaseguradores"),
        activosVenta: d("activosVenta"),
        propiedadesInversion: d("propiedadesInversion"),
        propiedadPlantaEquipo: d("propiedadPlantaEquipo"),
        otrosActivos: d("otrosActivos"),
        totalActivos: d("totalActivos"),
        obligacionesAsegurados: d("obligacionesAsegurados"),
        reservasSiniestros: d("reservasSiniestros"),
        reservasTecnicas: d("reservasTecnicas"),
        obligacionesReaseguradores: d("obligacionesReaseguradores"),
        obligacionesFinancieras: d("obligacionesFinancieras"),
        cuentasPagar: d("cuentasPagar"),
        otrosPasivos: d("otrosPasivos"),
        totalPasivo: d("totalPasivo"),
        capitalSocial: d("capitalSocial"),
        aportesCapitalNoCapitalizados: d("aportesCapitalNoCapitalizados"),
        resultadosAcumulados: d("resultadosAcumulados"),
        patrimonioRestringido: d("patrimonioRestringido"),
        totalPatrimonio: d("totalPatrimonio"),
        totalPasivoPatrimonio: d("totalPasivoPatrimonio"),
        primasGanadasNetas: d("primasGanadasNetas"),
        utilidadNeta: d("utilidadNeta"),
      });
    } else if (tipo === 5) {
      const numeroTurquia = (campo: string) => d(campo) ?? 0;
      lstBalancesTurquia.push({
        id,
        ano: i("ano"),
        fechaBalance: convertirFechaIso(
          obtenerValorCampoEstadoFinanciero(r, "fechaBalance", tipoEstadoFinanciero),
        ),
        idMoneda: balance.idMoneda ?? i("idMoneda"),
        duracionPeriodo: i("duracionPeriodo"),
        idNivelConfiabilidad: {
          ACTUAL: 1,
          PRELIMINAR: 2,
          ESTIMADO: 3,
        }[obtenerValorCampoEstadoFinanciero(r, "idNivelConfiabilidad", tipoEstadoFinanciero).toUpperCase()] ?? i("idNivelConfiabilidad"),
        tipoCambio: numeroTurquia("tipoCambio"),
        efectivo: numeroTurquia("efectivo"),
        existencias: numeroTurquia("existencias"),
        deudores: numeroTurquia("deudores"),
        totalCorriente: numeroTurquia("totalCorriente"),
        bienesTongibles: numeroTurquia("bienesTongibles"),
        activosIntangibles: numeroTurquia("activosIntangibles"),
        activoFijoNeto: numeroTurquia("activoFijoNeto"),
        totalActivos: numeroTurquia("totalActivos"),
        prestamos: numeroTurquia("prestamos"),
        acreedores: numeroTurquia("acreedores"),
        pasivosCorrientes: numeroTurquia("pasivosCorrientes"),
        pasivosNoCorrientes: numeroTurquia("pasivosNoCorrientes"),
        pasivosLargoPlazo: numeroTurquia("pasivosLargoPlazo"),
        totalPasivosNoCorrientes: numeroTurquia("totalPasivosNoCorrientes"),
        totalPasivos: numeroTurquia("totalPasivos"),
        capital: numeroTurquia("capital"),
        reservas: numeroTurquia("reservas"),
        resultadosAcumulados: numeroTurquia("resultadosAcumulados"),
        resultadoEjercicio: numeroTurquia("resultadoEjercicio"),
        otrasCuentas: numeroTurquia("otrasCuentas"),
        patrimonio: numeroTurquia("totalPatrimonio"),
        totalPatrimonio: numeroTurquia("totalPatrimonio"),
        totalPasivosPatrimonio: numeroTurquia("totalPasivosPatrimonio"),
        ventasNetas: numeroTurquia("ventasNetas"),
        costoVentas: numeroTurquia("costoVentas"),
        costoMateriales: numeroTurquia("costoMateriales"),
        gananciaBruta: numeroTurquia("gananciaBruta"),
        otrosGastosOperativos: numeroTurquia("otrosGastosOperativos"),
        costoEmpleados: numeroTurquia("costoEmpleados"),
        depreciacion: numeroTurquia("depreciacion"),
        ingresosFinancieros: numeroTurquia("ingresosFinancieros"),
        gastosFinancieros: numeroTurquia("gastosFinancieros"),
        interesesPagados: numeroTurquia("interesesPagados"),
        plFinanciero: numeroTurquia("plFinanciero"),
        ingresosExtraordinarios: numeroTurquia("ingresosExtraordinarios"),
        gastosExtraordinarios: numeroTurquia("gastosExtraordinarios"),
        plExtraordinario: numeroTurquia("plExtraordinario"),
        gananciaAntesImpuestos: numeroTurquia("gananciaAntesImpuestos"),
        impuestos: numeroTurquia("impuestos"),
        gananciaNeta: numeroTurquia("gananciaNeta"),
        ebit: numeroTurquia("ebit"),
        ebitda: numeroTurquia("ebitda"),
        ganancia: numeroTurquia("ganancia"),
        indiceLiquidez: numeroTurquia("indiceLiquidez"),
        capitalTrabajo: numeroTurquia("capitalTrabajo"),
        ratioEndeudamiento: numeroTurquia("ratioEndeudamiento"),
        ratioRentabilidad: numeroTurquia("ratioRentabilidad"),
      });
    }
  });

  return { lstBalancesDesagregado, lstBalancesTotalizado, lstBalancesBanco, lstBalancesSeguro, lstBalancesTurquia };
}

function depurarPayloadInforme(valor: unknown): unknown {
  if (Array.isArray(valor)) {
    return valor
      .map((item) => depurarPayloadInforme(item))
      .filter((item) => item !== undefined);
  }

  if (valor && typeof valor === "object") {
    const entradas = Object.entries(valor)
      .map(([clave, contenido]) => [clave, depurarPayloadInforme(contenido)] as const)
      .filter(([, contenido]) => contenido !== undefined);

    if (entradas.length === 0) return undefined;
    return Object.fromEntries(entradas);
  }

  if (typeof valor === "string") {
    const texto = valor.trim();
    return texto ? texto : undefined;
  }

  if (valor == null) return undefined;

  return valor;
}

function construirPayloadCrearInforme({
  idPedido,
  idInforme,
  idEstadoInforme,
  datosInvestigacion,
  opcionesTipoPersona,
  opcionesPais,
  opcionesEstadoCliente,
  opcionesTipoRegTributario,
  opcionesCiudad,
  opcionesTipoEmpresa,
  opcionesMoneda,
  opcionesSectorEconomico,
  opcionesActividadEconomica,
  opcionesClaseCiiu,
  opcionesTipoLocal,
  opcionesTipoProveedor,
}: {
  idPedido: number;
  idInforme?: number;
  idEstadoInforme: number;
  datosInvestigacion: DatosInvestigacionAnalista;
  opcionesTipoPersona: { num1: number | null; string1: string | null }[] | undefined;
  opcionesPais: { num1: number | null; string1: string | null }[] | undefined;
  opcionesEstadoCliente: { num1: number | null; string1: string | null }[] | undefined;
  opcionesTipoRegTributario: { num1: number | null; string1: string | null }[] | undefined;
  opcionesCiudad: { num1: number | null; string1: string | null }[] | undefined;
  opcionesTipoEmpresa: { num1: number | null; string1: string | null }[] | undefined;
  opcionesMoneda: { num1: number | null; string1: string | null }[] | undefined;
  opcionesSectorEconomico: { num1: number | null; string1: string | null }[] | undefined;
  opcionesActividadEconomica: { num1: number | null; string1: string | null; string2?: string | null }[] | undefined;
  opcionesClaseCiiu: { num1: number | null; string1: string | null; string2?: string | null }[] | undefined;
  opcionesTipoLocal: { num1: number | null; string1: string | null }[] | undefined;
  opcionesTipoProveedor: { num1: number | null; string1: string | null }[] | undefined;
}): InformeCrearRequest {
  const { identificacion, aspectosLegales, operacionPrincipal, informacionFinanciera, referencias, datosGenerales } = datosInvestigacion;
  const esEdicion = typeof idInforme === "number" && idInforme > 0;

  return depurarPayloadInforme({
    ...(esEdicion ? { idInforme } : {}),
    idPedido,
    idTipoPersona: obtenerIdPorTexto(opcionesTipoPersona, identificacion.tipoPersona),
    nombre: identificacion.nombreEmpresa,
    nombreComercial: identificacion.nombreComercial,
    idPais: obtenerIdPorTexto(opcionesPais, identificacion.pais),
    operacionesTCMoneda: obtenerIdPorTextoONumero(opcionesMoneda, aspectosLegales.operacionesCambioDivisas),
    taxIdType: obtenerIdPorTexto(opcionesTipoRegTributario, identificacion.tipoIdentificacionFiscal),
    taxNum: identificacion.numeroIdentificacionFiscal,
    direccion: identificacion.direccionPrincipal,
    ubigeo: identificacion.ciudadEstadoProvincia,
    codigoPostal: "",
    telefono: identificacion.numeroTelefono,
    fax: identificacion.numeroFax,
    email: identificacion.correoElectronico,
    paginaWeb: identificacion.paginaWeb,
    idEstadoManual: obtenerIdPorTexto(opcionesEstadoCliente, identificacion.estadoActual),
    idEstadoInforme,
    datosAdicionales: identificacion.datosAdicionales,
    observacionesIdentificacion: "",
    idTipoEmpresa: obtenerIdPorTexto(opcionesTipoEmpresa, aspectosLegales.tipoEmpresa),
    fechaConstitucion: convertirFechaIso(aspectosLegales.fechaConstitucion),
    idCiudadRegistro: obtenerIdPorTexto(opcionesCiudad, aspectosLegales.ciudadRegistro),
    idNotaria: aspectosLegales.notaria,
    idNotario: aspectosLegales.notario,
    idRegistro: aspectosLegales.registro,
    idPlazo: aspectosLegales.condiciones,
    idOperacionesCambioDivisas: obtenerIdPorTextoONumero(opcionesMoneda, aspectosLegales.operacionesCambioDivisas),
    capitalInicial: obtenerNumeroDesdeTexto(aspectosLegales.capitalInicial),
    capitalPagado: obtenerNumeroDesdeTexto(aspectosLegales.capitalDesembolsado),
    fechaUltimoIncremento: convertirFechaIso(aspectosLegales.ultimaAmpliacion),
    idTipoIncremento: 0,
    patrimonioNeto: obtenerNumeroDesdeTexto(aspectosLegales.patrimonioNeto),
    tipoAcciones: aspectosLegales.tipoAcciones,
    valorAcciones: obtenerNumeroDesdeTexto(aspectosLegales.valorAcciones),
    cotizaBolsa: esTextoAfirmativo(aspectosLegales.obligacionBolsa),
    idTipoCambio: obtenerIdPorTextoONumero(opcionesMoneda, aspectosLegales.monedaTipoCambio),
    tipoCambio: obtenerNumeroDesdeTexto(aspectosLegales.tipoCambio),
    antecedentes: aspectosLegales.antecedentes,
    aspectosLegales: aspectosLegales.aspectosLegales,
    comentariosAspectoLegal: aspectosLegales.comentariosEmpresasRelacionadas,
    idSector: obtenerIdPorTexto(opcionesSectorEconomico, operacionPrincipal.sector),
    actividad: operacionPrincipal.actividad,
    idIsicCategoria: obtenerIdCiiuPorValor(opcionesActividadEconomica, operacionPrincipal.categoriaCiiu),
    idIsicClase: obtenerIdCiiuPorValor(opcionesClaseCiiu, operacionPrincipal.claseCiiu),
    actividadPrincipal: operacionPrincipal.actividadPrincipal,
    ventasContado: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.ventasContadoPorcentaje),
    ventasContadoText: operacionPrincipal.ventasContadoDetalle,
    ventasCredito: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.ventasCreditoPorcentaje),
    ventasCreditoText: operacionPrincipal.ventasCreditoDetalle,
    idVentasCreditoTiempo: obtenerEnteroDesdeTexto(operacionPrincipal.ventasCreditoTiempo),
    ventasNacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.territorioVentasPorcentaje),
    ventasNacionalesText: operacionPrincipal.territorioVentasDetalle,
    ventasInternacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.ventasExtranjeroPorcentaje),
    ventasInternacionalesText: operacionPrincipal.ventasExtranjeroDetalle,
    comprasNacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.comprasNacionalesPorcentaje),
    comprasNacionalesText: operacionPrincipal.comprasNacionalesDetalle,
    comprasContadoNacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.comprasContadoNacionalesPorcentaje),
    comprasContadoNacionalesText: operacionPrincipal.comprasContadoNacionalesDetalle,
    comprasCreditoNacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.comprasCreditoNacionalesPorcentaje),
    comprasCreditoNacionalesText: operacionPrincipal.comprasCreditoNacionalesDetalle,
    idComprasCreditoNacionalesTiempo: obtenerEnteroDesdeTexto(operacionPrincipal.comprasCreditoNacionalesTiempo),
    comprasInternacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.comprasExtranjeroPorcentaje),
    comprasInternacionalesText: operacionPrincipal.comprasExtranjeroDetalle,
    comprasContadoInternacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.comprasContadoInternacionalesPorcentaje),
    comprasContadoInternacionalesText: operacionPrincipal.comprasContadoInternacionalesDetalle,
    comprasCreditoInternacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.comprasCreditoInternacionalesPorcentaje),
    comprasCreditoInternacionalesText: operacionPrincipal.comprasCreditoInternacionalesDetalle,
    idComprasCreditoInternacionalesTiempo: obtenerEnteroDesdeTexto(operacionPrincipal.comprasCreditoInternacionalesTiempo),
    numeroEmpleados: obtenerEnteroDesdeTexto(operacionPrincipal.numeroEmpleados),
    numeroEmpleadosText: operacionPrincipal.numeroEmpleadosDetalle,
    comentariosOperaciones: operacionPrincipal.comentariosOperaciones,
    contenidoInformacionFinanciera: informacionFinanciera.contenido,
    comentarioInformacionFinanciera: informacionFinanciera.comentariosFinancieros,
    activosFijos: informacionFinanciera.activosFijos,
    seguros: informacionFinanciera.seguros,
    comentarioProveedor: referencias.comentariosProveedores,
    referenciaBanco: referencias.referenciasBancos,
    litigios: referencias.litigios,
    riesgoPrincipal: referencias.riesgoPrincipal,
    superintendecia: referencias.superintendencia,
    informacionGeneral: datosGenerales.informacionGeneral,
    opinionCredito: datosGenerales.opinionCredito,
    flgTieneInformacion: true,
    lstBalances: datosInvestigacion.balances.map((balance) => ({
      ...(esEdicion ? { idInformeBalance: balance.idInformeBalance ?? 0 } : {}),
      fechaBalance: convertirFechaIso(balance.fechaInicio ?? balance.fecha),
      fechaHasta: balance.esActual ? null : convertirFechaIso(balance.fechaFin),
      flgActualidad: balance.esActual ?? false,
      tipoCambio: obtenerNumeroDesdeTexto(balance.tipoCambio),
      idMoneda: balance.idMoneda ?? (obtenerIdPorTexto(opcionesMoneda, balance.operacionCambio ?? "") || obtenerIdMoneda(balance.operacionCambio ?? "")),
      idTipoBalance: (balance.idTipoBalance ?? obtenerIdPorTextoONumero(undefined, balance.tipoBalance ?? "")) || obtenerIdTipoBalance(balance.tipoBalance),
      idTipoEstadoFinanciero: balance.idTipoEstadoFinanciero ?? ({
        desagregado: 1,
        totalizado: 2,
        bancos: 3,
        seguros: 4,
        turquia: 5,
      } as Record<string, number>)[obtenerClaveEstadoFinanciero(balance.tipoEstadoFinanciero ?? balance.tipo)] ?? 0,
    })),
    ...construirListasDetalleBalance(datosInvestigacion.balances),
    lstBancos: datosInvestigacion.bancos.map((banco) => ({
      ...(esEdicion ? { idInformeBanco: banco.idInformeBanco ?? 0 } : {}),
      idBanco: banco.idBanco ?? 0,
      numeroCuenta: banco.numeroCuenta,
      idSector: banco.idSector ?? obtenerIdPorTexto(opcionesSectorEconomico, banco.sector),
      sectorista: banco.sectoristaJefeCuenta ?? "",
      referenciaBanco: banco.telefono,
    })),
    lstCompaniasRelacionadas: datosInvestigacion.companiasRelacionadas.map((empresa) => ({
      ...(esEdicion ? { idInformeCompaniaRelacionada: empresa.idInformeCompaniaRelacionada ?? 0 } : {}),
      idCompania: empresa.idCompania ?? 0,
    })),
    lstExportacionesImportaciones: [
      ...datosInvestigacion.importaciones.map((registro) => ({
        ...(esEdicion ? { idInformeExportacionImportacion: 0 } : {}),
        anio: obtenerEnteroDesdeTexto(registro.anio),
        mesInicio: registro.idMesInicio ?? obtenerNumeroMes(registro.mes),
        mesFin: registro.idMesFin ?? registro.idMesInicio ?? obtenerNumeroMes(registro.mes),
        idMoneda: (registro.idMoneda ?? obtenerIdPorTexto(opcionesMoneda, registro.moneda)) || obtenerIdMoneda(registro.moneda),
        paises: registro.paises,
        monto: obtenerNumeroDesdeTexto(registro.monto),
        productos: registro.productos,
        idTipoOperacion: 1,
        numOperaciones: obtenerEnteroDesdeTexto(registro.operaciones),
      })),
      ...datosInvestigacion.exportaciones.map((registro) => ({
        ...(esEdicion ? { idInformeExportacionImportacion: 0 } : {}),
        anio: obtenerEnteroDesdeTexto(registro.anio),
        mesInicio: registro.idMesInicio ?? obtenerNumeroMes(registro.mes),
        mesFin: registro.idMesFin ?? registro.idMesInicio ?? obtenerNumeroMes(registro.mes),
        idMoneda: (registro.idMoneda ?? obtenerIdPorTexto(opcionesMoneda, registro.moneda)) || obtenerIdMoneda(registro.moneda),
        paises: registro.paises,
        monto: obtenerNumeroDesdeTexto(registro.monto),
        productos: registro.productos,
        idTipoOperacion: 2,
        numOperaciones: obtenerEnteroDesdeTexto(registro.operaciones),
      })),
    ],
    lstProveedores: datosInvestigacion.proveedores.map((proveedor) => ({
      ...(esEdicion ? { idInformeProveedor: proveedor.idInformeProveedor ?? 0 } : {}),
      idBancoProveedor: 0,
      idTipoPersona: proveedor.idTipoProveedor ?? obtenerIdPorTextoONumero(opcionesTipoProveedor, proveedor.tipoProveedor),
      nombre: proveedor.nombreEmpresa,
      idPais: proveedor.idPais ?? obtenerIdPorTexto(opcionesPais, proveedor.pais),
      idTipoDocumento: proveedor.idTipoDocumento ?? obtenerIdPorTextoONumero(opcionesTipoRegTributario, proveedor.taxIdType),
      numeroDocumento: proveedor.taxIdNumber,
      idMoneda: proveedor.idMoneda ?? (obtenerIdPorTexto(opcionesMoneda, proveedor.operacionCambioMoneda ?? "") || obtenerIdMoneda(proveedor.operacionCambioMoneda ?? "")),
      fechaInicio: convertirFechaIso(proveedor.comienzoNegociaciones),
      idLimiteCredito: proveedor.idLimiteCredito ?? proveedor.idPlazoCredito ?? 0,
      promedioMensual: obtenerNumeroDesdeTexto(proveedor.promedioMensual),
      tipoCambio: obtenerNumeroDesdeTexto(proveedor.tipoCambio),
      plazoCredito: proveedor.limiteCredito ?? "",
      productos: proveedor.tipoProveedor,
      idCalificacion: 0,
      comentarios: "",
      esTieneReferenciaComercial: proveedor.esTieneReferenciaComercial ?? proveedor.tieneReferenciaComercial,
      nombreContacto: proveedor.contacto,
      telefono: proveedor.telefono,
      comienzoNegociaciones: proveedor.comienzoNegociaciones ?? "",
      idPlazoCredito: proveedor.idPlazoCredito ?? proveedor.idLimiteCredito ?? 0,
    })),
    lstDirectoriosEjecutivos: datosInvestigacion.directorioEjecutivo.map((ejecutivo) => ({
      ...(esEdicion ? { idInformeDirectorioEjecutivo: ejecutivo.idInformeDirectorioEjecutivo ?? 0 } : {}),
      idDirectorioEjecutivo: ejecutivo.idDirectorioEjecutivo ?? ejecutivo.id,
      idCargo: ejecutivo.idCargo ?? 0,
      vinculadoDesde: convertirFechaIso(ejecutivo.vinculadoDesde),
      companiaAnterior: ejecutivo.companiaAnterior,
      participacion: obtenerNumeroDesdeTexto(ejecutivo.porcentaje),
      orden: obtenerEnteroDesdeTexto(ejecutivo.orden),
      esParticipanteDirectiva: ejecutivo.esParteDirectorio,
      apareceImpresoLista: ejecutivo.lista,
      imprimeDatosEjecutivos: ejecutivo.detalleEjecutivo,
    })),
    lstLocales: datosInvestigacion.locales.map((local) => ({
      idInformeLocal: local.idInformeLocal ?? 0,
      idTipoLocal: local.idTipoLocal ?? obtenerIdPorTextoONumero(opcionesTipoLocal, local.tipoLocal),
      comentario: local.comentario,
      imagenes: (local.imagenes ?? []).map((imagen) => ({
        idInformeLocalImagen: imagen.idInformeLocalImagen ?? 0,
        idTipoArchivo: imagen.idTipoArchivo ?? obtenerIdTipoArchivo(imagen.tipo ?? local.imagenTipo),
        nombre: imagen.nombre,
      })),
    })),
  }) as InformeCrearRequest;
}

function PaginacionInvestigacion({
  paginaActual,
  totalRegistros,
  onPaginaChange,
  etiquetaRegistros,
  contenidoCentro,
}: {
  paginaActual: number;
  totalRegistros: number;
  onPaginaChange: (pagina: number) => void;
  etiquetaRegistros: string;
  contenidoCentro?: ReactNode;
}) {
  const totalPaginas = obtenerTotalPaginas(totalRegistros);
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const mostrando = totalRegistros === 0
    ? 0
    : Math.min(FILAS_POR_PAGINA_INVESTIGACION, totalRegistros - ((paginaSegura - 1) * FILAS_POR_PAGINA_INVESTIGACION));

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-white px-4 py-3">
      <p className="text-xs font-medium text-slate-400">
        Mostrando {mostrando} de {totalRegistros} {etiquetaRegistros}
      </p>

      {contenidoCentro ? (
        <div className="text-xs font-semibold text-slate-500">{contenidoCentro}</div>
      ) : <div />}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onPaginaChange(Math.max(1, paginaSegura - 1))}
          disabled={paginaSegura === 1}
          className="flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-brand-black disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowLeft size={14} />
          Anterior
        </button>
        <span className="text-xs font-medium text-slate-400">
          {paginaSegura}/{totalPaginas}
        </span>
        <button
          type="button"
          onClick={() => onPaginaChange(Math.min(totalPaginas, paginaSegura + 1))}
          disabled={paginaSegura === totalPaginas}
          className="flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-brand-black disabled:cursor-not-allowed disabled:opacity-30"
        >
          Siguiente
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

function IndicadorCambioExtraccion({
  visible,
  onClick,
}: {
  visible: boolean;
  onClick: () => void;
}) {
  if (!visible) return null;

  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onClick();
        }}
        className="inline-flex items-center text-amber-500 transition-colors hover:text-amber-600"
      >
        <AlertTriangle size={16} />
      </button>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-52 -translate-x-1/2 rounded-lg bg-brand-black px-3 py-2 text-center text-xs font-medium text-white shadow-lg group-hover:block">
        Hay un posible cambio por la extraccion del documento
      </span>
    </span>
  );
}

function PantallaInvestigacionAnalista({
  idPedido,
  idInforme,
  modo,
  datosPedidoNavegacion,
  datosIniciales,
  archivosIniciales = [],
  idTipoPersonaInicial,
  idPaisInicial,
  idTipoRegTributarioInicial,
  idEstadoActualInicial,
  idTipoEmpresaInicial,
  idCiudadRegistroInicial,
  idSectorInicial,
  idActividadInicial,
}: PropsContenidoPantallaInvestigacionAnalista) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const esSoloLectura = modo === "detalle";
  const contenedorPantallaRef = useRef<HTMLDivElement>(null);
  const paisExtraccionRef = useRef<{ idPais?: number; pais?: string; aplicado: boolean }>({ aplicado: false });
  const ciudadExtraccionPendienteRef = useRef<CiudadExtraccionPendiente | null>(null);

  const [datosInvestigacion, setDatosInvestigacion] = useState<DatosInvestigacionAnalista>(datosIniciales);
  const [idInformeActual, setIdInformeActual] = useState<number | undefined>(idInforme);
  const [idSeccionActiva, setIdSeccionActiva] = useState<IdSeccionInvestigacionAnalista>("identificacion");
  const [pestanaAspectosLegales, setPestanaAspectosLegales] = useState<PestanaAspectosLegales>("data");
  const [pestanaRamoOperaciones, setPestanaRamoOperaciones] = useState<PestanaRamoOperaciones>("operaciones");
  const [pestanaBancosProveedores, setPestanaBancosProveedores] = useState<PestanaBancosProveedores>("referencias");
  const [estadoSecciones, setEstadoSecciones] = useState<Partial<Record<IdSeccionInvestigacionAnalista, "borrador" | "completado">>>({});
  const [idTipoPersonaSeleccionado, setIdTipoPersonaSeleccionado] = useState<number | undefined>(undefined);
  const [idPaisSeleccionado, setIdPaisSeleccionado] = useState<number | undefined>(undefined);
  const [estaAbiertoModalCompanias, setEstaAbiertoModalCompanias] = useState(false);
  const [companiasExtraccionPendientes, setCompaniasExtraccionPendientes] = useState<CompaniaRelacionadaExtraccionNueva[]>([]);
  const [indiceCompaniaExtraccionEdicion, setIndiceCompaniaExtraccionEdicion] = useState<number | null>(null);
  const [estaAbiertoModalRevisionCompaniasExtraccion, setEstaAbiertoModalRevisionCompaniasExtraccion] = useState(false);
  const [ejecutivosExtraccionPendientes, setEjecutivosExtraccionPendientes] = useState<RegistroDirectorioEjecutivoAnalista[]>([]);
  const [indiceEjecutivoExtraccionEdicion, setIndiceEjecutivoExtraccionEdicion] = useState<number | null>(null);
  const [indiceEjecutivoExtraccionAprobacion, setIndiceEjecutivoExtraccionAprobacion] = useState<number | null>(null);
  const [indiceEjecutivoExtraccionBusqueda, setIndiceEjecutivoExtraccionBusqueda] = useState<number | null>(null);
  const [estaAbiertoModalRevisionEjecutivosExtraccion, setEstaAbiertoModalRevisionEjecutivosExtraccion] = useState(false);
  const [bancosExtraccionPendientes, setBancosExtraccionPendientes] = useState<RegistroBancoAnalista[]>([]);
  const [colaExistentesExtraccion, setColaExistentesExtraccion] = useState<RegistroBancoAnalista[]>([]);
  const [indiceBancoExtraccionEdicion, setIndiceBancoExtraccionEdicion] = useState<number | null>(null);
  const [bancoRecienCreado, setBancoRecienCreado] = useState<BancoListaItem | null>(null);
  const [estaAbiertoModalRevisionBancosExtraccion, setEstaAbiertoModalRevisionBancosExtraccion] = useState(false);
  const [estaAbiertoModalOperacion, setEstaAbiertoModalOperacion] = useState(false);
  const [estaAbiertoModalLocal, setEstaAbiertoModalLocal] = useState(false);
  const [estaAbiertoVistaLocal, setEstaAbiertoVistaLocal] = useState(false);
  const [estaAbiertoModalBalance, setEstaAbiertoModalBalance] = useState(false);
  const [estaAbiertoModalDetalleBalance, setEstaAbiertoModalDetalleBalance] = useState(false);
  const [estaAbiertoModalProveedor, setEstaAbiertoModalProveedor] = useState(false);
  const [estaAbiertoModalBanco, setEstaAbiertoModalBanco] = useState(false);
  const [indiceOperacionSeleccionada, setIndiceOperacionSeleccionada] = useState<number | null>(null);
  const [indiceLocalSeleccionado, setIndiceLocalSeleccionado] = useState<number | null>(null);
  const [indiceVistaLocal, setIndiceVistaLocal] = useState<number | null>(null);
  const [indiceBalanceSeleccionado, setIndiceBalanceSeleccionado] = useState<number | null>(null);
  const [indiceBalanceAEliminar, setIndiceBalanceAEliminar] = useState<number | null>(null);
  const [indiceProveedorSeleccionado, setIndiceProveedorSeleccionado] = useState<number | null>(null);
  const [indiceProveedorAEliminar, setIndiceProveedorAEliminar] = useState<number | null>(null);
  const [indiceBancoSeleccionado, setIndiceBancoSeleccionado] = useState<number | null>(null);
  const [indiceBancoAEliminar, setIndiceBancoAEliminar] = useState<number | null>(null);
  const [indiceCompaniaAEliminar, setIndiceCompaniaAEliminar] = useState<number | null>(null);
  const [busquedaBalances, setBusquedaBalances] = useState("");
  const [paginaCompanias, setPaginaCompanias] = useState(1);
  const [paginaOperaciones, setPaginaOperaciones] = useState(1);
  const [paginaBalances, setPaginaBalances] = useState(1);
  const [paginaProveedores, setPaginaProveedores] = useState(1);
  const [paginaBancos, setPaginaBancos] = useState(1);
  const [paginaEjecutivos, setPaginaEjecutivos] = useState(1);
  const [filtroProveedorNombre, setFiltroProveedorNombre] = useState("");
  const [filtroProveedorTipo, setFiltroProveedorTipo] = useState("Todos");
  const [filtroProveedorContacto, setFiltroProveedorContacto] = useState("");
  const [filtroProveedorTelefono, setFiltroProveedorTelefono] = useState("");
  const [filtroBancoNombre, setFiltroBancoNombre] = useState("");
  const [filtroBancoCuenta, setFiltroBancoCuenta] = useState("");
  const [filtroBancoTelefono, setFiltroBancoTelefono] = useState("");
  const [idsFiltroBancoSector, setIdsFiltroBancoSector] = useState<number[]>([]);
  const [codigoNuevaCategoriaCiiu, setCodigoNuevaCategoriaCiiu] = useState("");
  const [textoNuevaCategoriaCiiu, setTextoNuevaCategoriaCiiu] = useState("");
  const [codigoNuevaClaseCiiu, setCodigoNuevaClaseCiiu] = useState("");
  const [textoNuevaClaseCiiu, setTextoNuevaClaseCiiu] = useState("");
  const [claveAltaCiiuGuardando, setClaveAltaCiiuGuardando] = useState<string | null>(null);
  const [mostrarFormCategoriaCiiu, setMostrarFormCategoriaCiiu] = useState(false);
  const [mostrarFormClaseCiiu, setMostrarFormClaseCiiu] = useState(false);
  const [estaAbiertoModalFinalizarInvestigacion, setEstaAbiertoModalFinalizarInvestigacion] = useState(false);
  const [estaAbiertoVistaPreviaFinalizar, setEstaAbiertoVistaPreviaFinalizar] = useState(false);
  const [estaAbiertoModalConfirmacionPrimerBorrador, setEstaAbiertoModalConfirmacionPrimerBorrador] = useState(false);
  const [estaAbiertoModalEjecutivo, setEstaAbiertoModalEjecutivo] = useState(false);
  const [estaAbiertoModalBuscarEjecutivo, setEstaAbiertoModalBuscarEjecutivo] = useState(false);
  const [estaAbiertoModalRegistroPersona, setEstaAbiertoModalRegistroPersona] = useState(false);
  const [estaAbiertoModalExtraccionInformacion, setEstaAbiertoModalExtraccionInformacion] = useState(false);
  const [estaAbiertoModalArchivosInvestigacion, setEstaAbiertoModalArchivosInvestigacion] = useState(false);
  const [alcanceExtraccionInformacion, setAlcanceExtraccionInformacion] = useState<AlcanceExtraccionInforme>("general");
  const [tituloSeccionExtraccion, setTituloSeccionExtraccion] = useState("");
  const [cambiosExtraccionPendientes, setCambiosExtraccionPendientes] = useState<Record<string, CambioExtraccionPendiente>>({});
  const [idCambioExtraccionActivo, setIdCambioExtraccionActivo] = useState<string | null>(null);
  const [ciudadExtraccionPendiente, setCiudadExtraccionPendiente] = useState<CiudadExtraccionPendiente | null>(null);
  const [archivosInvestigacion, setArchivosInvestigacion] = useState<ArchivoInvestigacionAnalista[]>(archivosIniciales);
  const [indiceEjecutivoSeleccionado, setIndiceEjecutivoSeleccionado] = useState<number | null>(null);
  const [indiceEjecutivoAEliminar, setIndiceEjecutivoAEliminar] = useState<number | null>(null);
  const [busquedaEjecutivo, setBusquedaEjecutivo] = useState("");
  const [debeVolverABandejaTrasGuardarBorrador, setDebeVolverABandejaTrasGuardarBorrador] = useState(false);
  const [personaDirectorioSeleccionada, setPersonaDirectorioSeleccionada] = useState<RegistroPersonaDirectorioAnalista | null>(null);
  const [registrosPersonaDirectorio, setRegistrosPersonaDirectorio] = useState<RegistroPersonaDirectorioAnalista[]>([
    {
      id: 1,
      tipoPersona: "Natural",
      nombres: "Juan Espinoza",
      pais: "México",
      direccionPrincipal: "Saltillo Centro",
      ciudadProvinciaEstado: "Coahuila",
      codigoPostal: "",
      nacionalidad: "Mexicana",
      tipoDocumentoIdentidad: "DNI",
      numeroDocumentoIdentidad: "48752145",
      tipoIdFiscal: "RUC",
      numeroIdFiscal: "MX-2048752145",
      fechaNacimiento: "1985-03-04",
      estadoCivil: "Casado/a",
      profesion: "Administrador",
      referenciaAdicional: "",
    },
    {
      id: 2,
      tipoPersona: "Natural",
      nombres: "Reyes Andrade",
      pais: "México",
      direccionPrincipal: "Monterrey",
      ciudadProvinciaEstado: "Nuevo León",
      codigoPostal: "",
      nacionalidad: "Mexicana",
      tipoDocumentoIdentidad: "DNI",
      numeroDocumentoIdentidad: "45871239",
      tipoIdFiscal: "RFC",
      numeroIdFiscal: "RANM850304",
      fechaNacimiento: "1988-08-12",
      estadoCivil: "Soltero/a",
      profesion: "Ingeniero",
      referenciaAdicional: "",
    },
  ]);

  const { data: opcionesTipoPersona } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_PERSONA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_PERSONA),
    staleTime: Infinity,
  });

  const { data: opcionesPais } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.PAIS],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.PAIS),
    staleTime: Infinity,
  });

  const { data: opcionesTipoRegTributario } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_REG_TRIBUTARIO],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_REG_TRIBUTARIO),
    staleTime: Infinity,
  });

  const { data: opcionesEstadoCliente } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.ESTADO_CLIENTE],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.ESTADO_CLIENTE),
    staleTime: Infinity,
  });

  const { data: opcionesCiudad } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.CIUDAD],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.CIUDAD),
    staleTime: Infinity,
  });

  const { data: opcionesTipoEmpresa } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_EMPRESA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_EMPRESA),
    staleTime: Infinity,
  });

  const { data: opcionesMoneda } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.MONEDA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.MONEDA),
    staleTime: Infinity,
  });

  const { data: opcionesMes } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.MES],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.MES),
    staleTime: Infinity,
  });

  const { data: opcionesSectorEconomico } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.SECTOR_ECONOMICO],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.SECTOR_ECONOMICO),
    staleTime: Infinity,
  });

  const { data: opcionesActividadEconomica } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.ACTIVIDAD_ECONOMICA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.ACTIVIDAD_ECONOMICA),
    staleTime: Infinity,
  });

  const { data: opcionesClaseCiiu } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.CLASE_CIIU],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.CLASE_CIIU),
    staleTime: Infinity,
  });

  const { data: opcionesTipoLocal } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_LOCAL],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_LOCAL),
    staleTime: Infinity,
  });

  const { data: opcionesTipoProveedor } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_PROVEEDOR],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_PROVEEDOR),
    staleTime: Infinity,
  });

  const { data: opcionesTiempoCreditoVentas } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIEMPO_CREDITO_VENTAS],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIEMPO_CREDITO_VENTAS),
    staleTime: Infinity,
  });

  const { data: opcionesPlantillaInforme } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.PLANTILLA_INFORME],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.PLANTILLA_INFORME),
    staleTime: Infinity,
  });

  const { data: opcionesCargoDirectorio } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.CARGO_DIRECTORIO],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.CARGO_DIRECTORIO),
    enabled: idSeccionActiva === "directorio-ejecutivo" || datosInvestigacion.directorioEjecutivo.length > 0,
    staleTime: Infinity,
  });

  const { data: registroPedidoSeleccionado } = useQuery({
    queryKey: ["pedido-obtener-analista", idPedido],
    queryFn: async () => {
      if (!idPedido?.trim()) return null;
      return pedidoService.getById(Number(idPedido));
    },
    enabled: Boolean(idPedido),
  });

  const { data: registroAsignacionPedido } = useQuery({
    queryKey: ["asignacion-resumen-analista", idPedido],
    queryFn: async () => {
      if (!idPedido?.trim()) return null;

      const respuesta = await servicioAsignacion.bandeja({
        busqueda: idPedido,
        numPag: 1,
      });

      return respuesta.lstPedido.find((registro) => String(registro.idPedido) === idPedido) ?? null;
    },
    enabled: Boolean(idPedido),
  });

  const { data: registroPedidoListado } = useQuery({
    queryKey: ["pedido-lista-resumen-analista", idPedido],
    queryFn: async () => {
      if (!idPedido?.trim()) return null;
      const respuesta = await pedidoService.list({ idPedido: Number(idPedido), numPag: 1 });
      return respuesta.lstPedido.find((registro) => registro.idPedido === Number(idPedido)) ?? null;
    },
    enabled: Boolean(idPedido),
  });

  const crearCiudadExtraccionMutation = useMutation({
    mutationFn: async (ciudad: CiudadExtraccionPendiente) => {
      const opcionesActuales = await queryClient.fetchQuery({
        queryKey: ["masterTable", TablaMaestraId.CIUDAD],
        queryFn: () => servicioTablaMaestra.list(TablaMaestraId.CIUDAD),
        staleTime: 0,
      });

      await servicioTablaMaestra.crear({
        idMaestro: TablaMaestraId.CIUDAD,
        descripcion: obtenerDescripcionTablaMaestra(TablaMaestraId.CIUDAD),
        string1: ciudad.valor,
        num1: opcionesActuales.reduce((maximo, opcion) => Math.max(maximo, opcion.num1 ?? 0), 0) + 1,
        num2: ciudad.idPais,
        num3: null,
        string2: null,
        string3: null,
        date1: null,
        date2: null,
        date3: null,
      });

      await queryClient.invalidateQueries({ queryKey: ["masterTable", TablaMaestraId.CIUDAD] });
      return ciudad.valor;
    },
    onSuccess: (valor) => {
      actualizarCampoInvestigacion(["identificacion", "ciudadEstadoProvincia"], valor);
      ciudadExtraccionPendienteRef.current = null;
      setCiudadExtraccionPendiente(null);
    },
  });

  const crearTiempoCreditoExtraccionMutation = useMutation({
    mutationFn: async ({ tiempoCredito, campoDest }: { tiempoCredito: string; campoDest: string }) => {
      const opcionesActuales = await queryClient.fetchQuery({
        queryKey: ["masterTable", TablaMaestraId.TIEMPO_CREDITO_VENTAS],
        queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIEMPO_CREDITO_VENTAS),
        staleTime: 0,
      });
      const opcionExistente = obtenerOpcionTablaMaestraPorTexto(opcionesActuales, tiempoCredito);
      if (opcionExistente?.num1 != null) return { id: opcionExistente.num1, campoDest };

      const siguienteNumero = opcionesActuales.reduce(
        (maximo, opcion) => Math.max(maximo, opcion.num1 ?? 0),
        0,
      ) + 1;

      await servicioTablaMaestra.crear({
        idMaestro: TablaMaestraId.TIEMPO_CREDITO_VENTAS,
        descripcion: obtenerDescripcionTablaMaestra(TablaMaestraId.TIEMPO_CREDITO_VENTAS),
        string1: tiempoCredito,
        num1: siguienteNumero,
        num2: null,
        num3: null,
        string2: null,
        string3: null,
        date1: null,
        date2: null,
        date3: null,
      });
      await queryClient.invalidateQueries({
        queryKey: ["masterTable", TablaMaestraId.TIEMPO_CREDITO_VENTAS],
      });

      return { id: siguienteNumero, campoDest };
    },
    onSuccess: ({ id, campoDest }) => {
      actualizarCampoInvestigacion(
        ["operacionPrincipal", campoDest],
        String(id),
      );
    },
  });

  const marcarSeccionActivaComoBorrador = () => {
    setEstadoSecciones((anterior) => ({
      ...anterior,
      [idSeccionActiva]: "borrador",
    }));
  };

  const guardarBorrador = (debeRedirigirABandeja: boolean) => {
    marcarSeccionActivaComoBorrador();
    setDebeVolverABandejaTrasGuardarBorrador(debeRedirigirABandeja);
    guardarInformeMutation.mutate(ID_ESTADO_PEDIDO_BORRADOR);
  };

  const archivosImagenesNuevosRef = useRef<Map<string, File>>(new Map());

  const guardarInformeMutation = useMutation({
    mutationFn: async (idEstadoInforme: number) => {
      const idPedidoNumerico = Number(idPedido);

      if (!Number.isFinite(idPedidoNumerico) || idPedidoNumerico <= 0) {
        throw new Error("No se encontró un pedido válido para crear el informe.");
      }

      const mapaArchivos = new Map<string, File>();
      const contadorNombres = new Map<string, number>();
      const localesConNombresDeduplicados = datosInvestigacion.locales.map((local) => ({
        ...local,
        imagenes: (local.imagenes ?? []).map((imagen) => {
          if (!imagen.archivo) return imagen;
          const nombreOriginal = imagen.nombre;
          const cuenta = contadorNombres.get(nombreOriginal) ?? 0;
          contadorNombres.set(nombreOriginal, cuenta + 1);
          let nombreFinal = nombreOriginal;
          if (cuenta > 0) {
            const punto = nombreOriginal.lastIndexOf(".");
            const sinExt = punto >= 0 ? nombreOriginal.slice(0, punto) : nombreOriginal;
            const ext = punto >= 0 ? nombreOriginal.slice(punto) : "";
            nombreFinal = `${sinExt} (${cuenta})${ext}`;
          }
          mapaArchivos.set(nombreFinal, imagen.archivo);
          return { ...imagen, nombre: nombreFinal };
        }),
      }));
      archivosImagenesNuevosRef.current = mapaArchivos;

      const payload = construirPayloadCrearInforme({
        idPedido: idPedidoNumerico,
        idInforme: idInformeActual,
        idEstadoInforme,
        datosInvestigacion: { ...datosInvestigacion, locales: localesConNombresDeduplicados },
        opcionesTipoPersona,
        opcionesPais,
        opcionesEstadoCliente,
        opcionesTipoRegTributario,
        opcionesCiudad,
        opcionesTipoEmpresa,
        opcionesMoneda,
        opcionesSectorEconomico,
        opcionesActividadEconomica,
        opcionesClaseCiiu,
        opcionesTipoLocal,
        opcionesTipoProveedor,
      });

      if (modo === "continuar" || (idInformeActual && idInformeActual > 0)) {
        return informeService.editar(payload);
      }

      return informeService.create(payload);
    },
    onSuccess: async (respuesta, idEstado) => {
      const idsExistentes = datosInvestigacion.locales.flatMap((local) =>
        (local.imagenes ?? [])
          .filter((img) => (img.idInformeLocalImagen ?? 0) > 0)
          .map((img) => img.idInformeLocalImagen!),
      );

      const imagenesPendientes = respuesta.imagenesPendientes ?? [];
      const idsSubidosOk: number[] = [];

      if (imagenesPendientes.length > 0) {
        const toastId = toast.loading("Subiendo imágenes de locales...");
        for (const imagenPendiente of imagenesPendientes) {
          const archivo = archivosImagenesNuevosRef.current.get(imagenPendiente.nombre);
          if (!archivo) {
            idsSubidosOk.push(imagenPendiente.idInformeLocalImagen);
            continue;
          }
          try {
            await informeService.subirArchivoUrlPrefirmada(imagenPendiente.uploadUrl, archivo);
            idsSubidosOk.push(imagenPendiente.idInformeLocalImagen);
          } catch {
            toast.error(`No se pudo subir la imagen "${imagenPendiente.nombre}".`, { id: toastId });
          }
        }
        toast.dismiss(toastId);
        archivosImagenesNuevosRef.current = new Map();

        const idsPorNombre = new Map(
          imagenesPendientes.map((img) => [img.nombre, img.idInformeLocalImagen]),
        );
        setDatosInvestigacion((anterior) => ({
          ...anterior,
          locales: anterior.locales.map((local) => ({
            ...local,
            imagenes: (local.imagenes ?? []).map((imagen) => {
              if (!imagen.archivo) return imagen;
              const idAsignado = idsPorNombre.get(imagen.nombre);
              if (!idAsignado) return imagen;
              return { ...imagen, idInformeLocalImagen: idAsignado };
            }),
          })),
        }));
      }

      const todosLosIds = [...new Set([...idsExistentes, ...idsSubidosOk])];
      if (todosLosIds.length > 0) {
        await informeService.actualizarEstadoCargaImagenes(todosLosIds);
      }
      const idInformeResultado = respuesta.idInforme ?? idInformeActual;

      if (idInformeResultado && idInformeResultado > 0) {
        setIdInformeActual(idInformeResultado);
      }

      queryClient.invalidateQueries({ queryKey: ["informes"] });
      queryClient.invalidateQueries({ queryKey: ["asignaciones-bandeja-analista"] });
      setEstaAbiertoModalFinalizarInvestigacion(false);
      setEstaAbiertoModalConfirmacionPrimerBorrador(false);

      if (idEstado === ID_ESTADO_PEDIDO_FINALIZADO) {
        setDebeVolverABandejaTrasGuardarBorrador(false);
        navigate("/analista");
        return;
      }

      if (idEstado === ID_ESTADO_PEDIDO_BORRADOR && debeVolverABandejaTrasGuardarBorrador) {
        setDebeVolverABandejaTrasGuardarBorrador(false);
        navigate("/analista/bandeja");
        return;
      }

      setDebeVolverABandejaTrasGuardarBorrador(false);

      if (modo === "iniciar" && idInformeResultado && idPedido) {
        navigate(`/analista/investigacion/${idPedido}?modo=continuar&idInforme=${idInformeResultado}`, {
          replace: true,
          state: {
            datosPedidoInvestigacion: datosPedidoNavegacion,
          },
        });
      }
    },
  });

  const indiceSeccionActiva = seccionesInvestigacionAnalista.findIndex(
    (seccion) => seccion.id === idSeccionActiva,
  );
  const seccionActual = seccionesInvestigacionAnalista[indiceSeccionActiva];
  const nombrePaisInforme = useMemo(
    () => opcionesPais?.find((opcion) => opcion.num1 === idPaisInicial)?.string1 ?? "",
    [idPaisInicial, opcionesPais],
  );
  const paisPedido = useMemo(
    () => (
      datosPedidoNavegacion?.pais
      || registroAsignacionPedido?.pais
      || nombrePaisInforme
      || ""
    ).trim(),
    [datosPedidoNavegacion?.pais, nombrePaisInforme, registroAsignacionPedido?.pais],
  );
  const opcionesCiudadIdentificacion = useMemo(() => {
    if (!idPaisSeleccionado) return opcionesCiudad;
    return opcionesCiudad?.filter((opcion) => opcion.num2 === idPaisSeleccionado);
  }, [idPaisSeleccionado, opcionesCiudad]);
  const resumenEncabezado = useMemo(
    () => ({
      ...datosInvestigacion.resumen,
      nombreSolicitado:
        datosPedidoNavegacion?.investigado
        || registroPedidoSeleccionado?.investigarRazonSocialNombres
        || registroAsignacionPedido?.investigado
        || datosInvestigacion.resumen.nombreSolicitado,
      pais:
        datosPedidoNavegacion?.pais
        || registroAsignacionPedido?.pais
        || nombrePaisInforme
        || datosInvestigacion.identificacion.pais
        || datosInvestigacion.resumen.pais,
      prioridad:
        datosPedidoNavegacion?.tipoTramite
        || registroAsignacionPedido?.tipoTramite
        || registroPedidoListado?.tipoTramite
        || datosInvestigacion.resumen.prioridad,
    }),
    [datosInvestigacion.identificacion.pais, datosInvestigacion.resumen, datosPedidoNavegacion, nombrePaisInforme, registroAsignacionPedido, registroPedidoListado, registroPedidoSeleccionado],
  );
  const nombrePlantilla = useMemo(() => {
    const idPlantilla = datosPedidoNavegacion?.idPlantilla ?? registroPedidoSeleccionado?.idPlantilla;
    if (!idPlantilla) return "";

    return opcionesPlantillaInforme?.find(
      (opcion) => opcion.num1 === idPlantilla,
    )?.string1 ?? "";
  }, [datosPedidoNavegacion?.idPlantilla, opcionesPlantillaInforme, registroPedidoSeleccionado?.idPlantilla]);

  useEffect(() => {
    if (idTipoPersonaInicial && idTipoPersonaSeleccionado == null) {
      setIdTipoPersonaSeleccionado(idTipoPersonaInicial);
    }
  }, [idTipoPersonaInicial, idTipoPersonaSeleccionado]);

  useEffect(() => {
    if (idPaisInicial && idPaisSeleccionado == null) {
      setIdPaisSeleccionado(idPaisInicial);
    }
  }, [idPaisInicial, idPaisSeleccionado]);

  useEffect(() => {
    if (idPaisInicial || idPaisSeleccionado != null || !paisPedido || !opcionesPais) return;

    const opcionPaisPedido = obtenerOpcionTablaMaestraPorTexto(opcionesPais, paisPedido);
    if (!opcionPaisPedido?.num1) return;

    setIdPaisSeleccionado(opcionPaisPedido.num1);
    setDatosInvestigacion((anterior) => ({
      ...anterior,
      identificacion: {
        ...anterior.identificacion,
        pais: opcionPaisPedido.string1 ?? paisPedido,
      },
    }));
  }, [idPaisInicial, idPaisSeleccionado, opcionesPais, paisPedido]);

  useEffect(() => {
    if (!idTipoPersonaInicial || datosInvestigacion.identificacion.tipoPersona || !opcionesTipoPersona) return;
    const etiqueta = opcionesTipoPersona.find((opcion) => opcion.num1 === idTipoPersonaInicial)?.string1 ?? "";
    if (!etiqueta) return;

    setDatosInvestigacion((anterior) => ({
      ...anterior,
      identificacion: {
        ...anterior.identificacion,
        tipoPersona: etiqueta,
      },
    }));
  }, [datosInvestigacion.identificacion.tipoPersona, idTipoPersonaInicial, opcionesTipoPersona]);

  useEffect(() => {
    if (datosInvestigacion.identificacion.pais || !opcionesPais) return;
    const etiqueta = idPaisInicial
      ? opcionesPais.find((opcion) => opcion.num1 === idPaisInicial)?.string1 ?? ""
      : paisPedido;
    if (!etiqueta) return;

    setDatosInvestigacion((anterior) => ({
      ...anterior,
      identificacion: {
        ...anterior.identificacion,
        pais: etiqueta,
      },
    }));
  }, [datosInvestigacion.identificacion.pais, idPaisInicial, opcionesPais, paisPedido]);

  useEffect(() => {
    if (!idTipoRegTributarioInicial || datosInvestigacion.identificacion.tipoIdentificacionFiscal || !opcionesTipoRegTributario) return;
    const etiqueta = opcionesTipoRegTributario.find((opcion) => opcion.num1 === idTipoRegTributarioInicial)?.string1 ?? "";
    if (!etiqueta) return;

    setDatosInvestigacion((anterior) => ({
      ...anterior,
      identificacion: {
        ...anterior.identificacion,
        tipoIdentificacionFiscal: etiqueta,
      },
    }));
  }, [datosInvestigacion.identificacion.tipoIdentificacionFiscal, idTipoRegTributarioInicial, opcionesTipoRegTributario]);

  useEffect(() => {
    if (!idEstadoActualInicial || datosInvestigacion.identificacion.estadoActual || !opcionesEstadoCliente) return;
    const etiqueta = opcionesEstadoCliente.find((opcion) => opcion.num1 === idEstadoActualInicial)?.string1 ?? "";
    if (!etiqueta) return;

    setDatosInvestigacion((anterior) => ({
      ...anterior,
      identificacion: {
        ...anterior.identificacion,
        estadoActual: etiqueta,
      },
    }));
  }, [datosInvestigacion.identificacion.estadoActual, idEstadoActualInicial, opcionesEstadoCliente]);

  useEffect(() => {
    if (!idTipoEmpresaInicial || datosInvestigacion.aspectosLegales.tipoEmpresa || !opcionesTipoEmpresa) return;
    const etiqueta = opcionesTipoEmpresa.find((opcion) => opcion.num1 === idTipoEmpresaInicial)?.string1 ?? "";
    if (!etiqueta) return;

    setDatosInvestigacion((anterior) => ({
      ...anterior,
      aspectosLegales: {
        ...anterior.aspectosLegales,
        tipoEmpresa: etiqueta,
      },
    }));
  }, [datosInvestigacion.aspectosLegales.tipoEmpresa, idTipoEmpresaInicial, opcionesTipoEmpresa]);

  useEffect(() => {
    if (!idCiudadRegistroInicial || datosInvestigacion.aspectosLegales.ciudadRegistro || !opcionesCiudad) return;
    const etiqueta = opcionesCiudad.find((opcion) => opcion.num1 === idCiudadRegistroInicial)?.string1 ?? "";
    if (!etiqueta) return;

    setDatosInvestigacion((anterior) => ({
      ...anterior,
      aspectosLegales: {
        ...anterior.aspectosLegales,
        ciudadRegistro: etiqueta,
      },
    }));
  }, [datosInvestigacion.aspectosLegales.ciudadRegistro, idCiudadRegistroInicial, opcionesCiudad]);

  useEffect(() => {
    if (!idSectorInicial || datosInvestigacion.operacionPrincipal.sector || !opcionesSectorEconomico) return;
    const etiqueta = opcionesSectorEconomico.find((opcion) => opcion.num1 === idSectorInicial)?.string1 ?? "";
    if (!etiqueta) return;

    setDatosInvestigacion((anterior) => ({
      ...anterior,
      operacionPrincipal: {
        ...anterior.operacionPrincipal,
        sector: etiqueta,
      },
    }));
  }, [datosInvestigacion.operacionPrincipal.sector, idSectorInicial, opcionesSectorEconomico]);

  useEffect(() => {
    if (!idActividadInicial || datosInvestigacion.operacionPrincipal.actividad || !opcionesActividadEconomica) return;
    const etiqueta = opcionesActividadEconomica.find((opcion) => opcion.num1 === idActividadInicial)?.string1 ?? "";
    if (!etiqueta) return;

    setDatosInvestigacion((anterior) => ({
      ...anterior,
      operacionPrincipal: {
        ...anterior.operacionPrincipal,
        actividad: etiqueta,
      },
    }));
  }, [datosInvestigacion.operacionPrincipal.actividad, idActividadInicial, opcionesActividadEconomica]);

  useEffect(() => {
    if (colaExistentesExtraccion.length === 0) return;
    const items = colaExistentesExtraccion;
    setColaExistentesExtraccion([]);
    Promise.all(
      items.map((item) =>
        servicioBanco.obtener({ idBanco: item.idBanco }).then(
          (banco): RegistroBancoAnalista | null => {
            if (!banco) return null;
            return {
              idBanco: banco.idBanco,
              idPais: banco.idPais,
              pais: banco.pais,
              banco: banco.nombre,
              telefono: item.telefono || banco.telefono,
              numeroCuenta: item.numeroCuenta,
              idSector: item.idSector,
              sector: item.sector || banco.sector || "",
              sectoristaJefeCuenta: item.sectoristaJefeCuenta,
            };
          },
        ).catch(() => null),
      ),
    ).then((registros) => {
      const validos = registros.filter((r): r is RegistroBancoAnalista => r !== null);
      if (validos.length === 0) return;
      setDatosInvestigacion((anterior) => ({
        ...anterior,
        bancos: [...validos, ...anterior.bancos],
      }));
    });
  }, [colaExistentesExtraccion]);

  const opcionesFiltroTipoProveedor = useMemo(
    () => [
      { idEmpresa: 0, idTablaMaestra: null, idMaestro: 0, descripcion: "", num1: 0, num2: null, num3: null, string1: "Todos", string2: null, string3: null, date1: null, date2: null, date3: null },
      ...(opcionesTipoProveedor ?? []),
    ],
    [opcionesTipoProveedor],
  );

  const actualizarIdentificacion = (campo: keyof DatosInvestigacionAnalista["identificacion"], valor: string) => {
    setDatosInvestigacion((anterior) => ({
      ...anterior,
      identificacion: {
        ...anterior.identificacion,
        [campo]: valor,
      },
    }));
  };

  const actualizarAspectosLegales = (campo: keyof DatosInvestigacionAnalista["aspectosLegales"], valor: string) => {
    setDatosInvestigacion((anterior) => ({
      ...anterior,
      aspectosLegales: {
        ...anterior.aspectosLegales,
        [campo]: valor,
      },
    }));
  };

  const actualizarOperacionPrincipal = (campo: keyof DatosInvestigacionAnalista["operacionPrincipal"], valor: string) => {
    setDatosInvestigacion((anterior) => ({
      ...anterior,
      operacionPrincipal: {
        ...anterior.operacionPrincipal,
        [campo]: valor,
      },
    }));
  };

  const formatearPorcentajeComplementario = (valor: number) => valor.toFixed(2);

  const esPorcentajeMayorACero = (valor?: string) => {
    const numero = Number.parseFloat((valor ?? "").trim().replace(",", "."));
    return !Number.isNaN(numero) && numero > 0;
  };

  const actualizarPorcentajesComplementarios = (
    campoOrigen: CampoPorcentajeOperacion,
    campoComplementario: CampoPorcentajeOperacion,
    valor: string,
  ) => {
    const valorLimpio = valor.trim();

    setDatosInvestigacion((anterior) => {
      const operacionPrincipal = {
        ...anterior.operacionPrincipal,
        [campoOrigen]: valor,
      };

      if (!valorLimpio) {
        operacionPrincipal[campoComplementario] = "";
        return {
          ...anterior,
          operacionPrincipal,
        };
      }

      const numero = Number.parseFloat(valorLimpio.replace(",", "."));
      if (Number.isNaN(numero) || numero < 0 || numero > 100) {
        return {
          ...anterior,
          operacionPrincipal,
        };
      }

      operacionPrincipal[campoComplementario] = formatearPorcentajeComplementario(100 - numero);

      return {
        ...anterior,
        operacionPrincipal,
      };
    });
  };

  const aplicarPorcentajeExtraccion = (campoOrigen: CampoPorcentajeOperacion, valor: string) => {
    const numero = Number.parseFloat(valor.replace(",", "."));
    if (Number.isNaN(numero) || numero < 0 || numero > 100) return;

    const valorFormateado = numero.toFixed(2);
    const campoComplementario = CAMPOS_PORCENTAJE_COMPLEMENTARIO[campoOrigen];
    const valorComplementario = formatearPorcentajeComplementario(100 - numero);

    setDatosInvestigacion((anterior) => ({
      ...anterior,
      operacionPrincipal: {
        ...anterior.operacionPrincipal,
        [campoOrigen]: valorFormateado,
        [campoComplementario]: valorComplementario,
      },
    }));

    const idComplementario = `operacionPrincipal.${campoComplementario}`;
    setCambiosExtraccionPendientes((anterior) => {
      const cambioComplementario = anterior[idComplementario];
      if (!cambioComplementario) return anterior;

      const siguientes = { ...anterior };
      const valorExtraidoComplementario = Number.parseFloat(cambioComplementario.valorNuevo.replace(",", "."));
      if (!Number.isNaN(valorExtraidoComplementario) && valorExtraidoComplementario.toFixed(2) === valorComplementario) {
        delete siguientes[idComplementario];
      } else {
        siguientes[idComplementario] = {
          ...cambioComplementario,
          valorOriginal: valorComplementario,
        };
      }
      return siguientes;
    });
  };

  const actualizarInformacionFinanciera = (
    campo: keyof DatosInvestigacionAnalista["informacionFinanciera"],
    valor: string,
  ) => {
    setDatosInvestigacion((anterior) => ({
      ...anterior,
      informacionFinanciera: {
        ...anterior.informacionFinanciera,
        [campo]: valor,
      },
    }));
  };

  const actualizarReferencias = (campo: keyof DatosInvestigacionAnalista["referencias"], valor: string) => {
    setDatosInvestigacion((anterior) => ({
      ...anterior,
      referencias: {
        ...anterior.referencias,
        [campo]: valor,
      },
    }));
  };

  const actualizarDatosGenerales = (campo: keyof DatosInvestigacionAnalista["datosGenerales"], valor: string) => {
    setDatosInvestigacion((anterior) => ({
      ...anterior,
      datosGenerales: {
        ...anterior.datosGenerales,
        [campo]: valor,
      },
    }));
  };

  const actualizarCampoInvestigacion = (ruta: string[], valor: unknown) => {
    setDatosInvestigacion((anterior) => actualizarValorEnRuta(anterior, ruta, valor));
  };

  const asignarCiudadExtraccionPendiente = (
    ciudad: CiudadExtraccionPendiente | null,
    debeMostrar: boolean,
  ) => {
    ciudadExtraccionPendienteRef.current = ciudad;
    setCiudadExtraccionPendiente(debeMostrar ? ciudad : null);
  };

  const obtenerCiudadExistenteParaPais = (valor: string, idPais: number) => {
    const textoNormalizado = normalizarTextoExtraccion(valor);
    return opcionesCiudad?.find((opcion) =>
      normalizarTextoExtraccion(opcion.string1 ?? "") === textoNormalizado
      && opcion.num2 === idPais
    );
  };

  const procesarCiudadExtraida = (
    valor: unknown,
    paisForzado?: CiudadExtraccionPendiente,
  ) => {
    const valorTexto = valor == null ? "" : String(valor).trim();
    if (!valorTexto) return;

    const opcionPaisActual = opcionesPais?.find((opcion) => opcion.num1 === idPaisSeleccionado)
      ?? obtenerOpcionTablaMaestraPorTexto(opcionesPais, datosInvestigacion.identificacion.pais);
    const paisActual = paisForzado
      ?? (
        paisExtraccionRef.current.idPais
          ? {
              valor: valorTexto,
              idPais: paisExtraccionRef.current.idPais,
              pais: paisExtraccionRef.current.pais ?? "",
            }
          : opcionPaisActual?.num1
            ? {
                valor: valorTexto,
                idPais: opcionPaisActual.num1,
                pais: opcionPaisActual.string1 ?? datosInvestigacion.identificacion.pais,
              }
            : null
      );

    if (!paisActual?.idPais) {
      return;
    }

    const paisEstaAplicado = Boolean(paisForzado || paisExtraccionRef.current.aplicado || (!paisExtraccionRef.current.idPais && opcionPaisActual?.num1));

    if (!paisEstaAplicado) {
      asignarCiudadExtraccionPendiente(
        {
          valor: valorTexto,
          idPais: paisActual.idPais,
          pais: paisActual.pais,
        },
        false,
      );
      return;
    }

    const opcionCiudad = obtenerCiudadExistenteParaPais(valorTexto, paisActual.idPais);
    const valorExtraido = opcionCiudad?.string1 ?? valorTexto;
    const valorActual = datosInvestigacion.identificacion.ciudadEstadoProvincia.trim();

    if (opcionCiudad?.string1) {
      registrarCambioExtraccion({
        id: "identificacion.ciudadEstadoProvincia",
        ruta: ["identificacion", "ciudadEstadoProvincia"],
        etiqueta: "Identificación - Ciudad Estado Provincia",
        valorActual,
        valorExtraido,
        onAplicar: () => actualizarCampoInvestigacion(["identificacion", "ciudadEstadoProvincia"], valorExtraido),
      });
      return;
    }

    asignarCiudadExtraccionPendiente(
      {
        valor: valorTexto,
        idPais: paisActual.idPais,
        pais: paisActual.pais,
      },
      true,
    );
  };

  const procesarCiudadPendienteDespuesPais = () => {
    const ciudadPendiente = ciudadExtraccionPendienteRef.current;
    if (!ciudadPendiente) return;

    asignarCiudadExtraccionPendiente(null, false);
    procesarCiudadExtraida(ciudadPendiente.valor, ciudadPendiente);
  };

  const normalizarValorExtraido = (ruta: string[], valor: unknown): ValorExtraidoNormalizado => {
    const rutaTexto = ruta.join(".");
    const valorTexto = valor == null ? "" : String(valor).trim();
    const normalizarPorTablaMaestra = (
      opciones: { num1: number | null; string1: string | null }[] | undefined,
    ) => {
      const opcionPorId = obtenerOpcionTablaMaestraPorId(opciones, valor);
      if (opcionPorId?.string1) return opcionPorId.string1;

      const opcionPorTexto = obtenerOpcionTablaMaestraPorTexto(opciones, valor);
      if (opcionPorTexto?.string1) return opcionPorTexto.string1;

      return valorTexto;
    };
    const normalizarCiiuPorTablaMaestra = (
      opciones: { num1: number | null; string1: string | null; string2?: string | null }[] | undefined,
    ) => {
      if (esRegistroPlano(valor)) {
        const codigoExtraido = String(valor.codigo ?? valor.Codigo ?? valor.string2 ?? "").trim();
        const descripcionExtraida = String(valor.descripcion ?? valor.Descripcion ?? valor.string1 ?? "").trim();
        const opcionPorCodigo = codigoExtraido
          ? opciones?.find((opcion) => opcion.string2?.trim() === codigoExtraido)
          : undefined;
        if (opcionPorCodigo) return [opcionPorCodigo.string2?.trim(), opcionPorCodigo.string1?.trim()].filter(Boolean).join(" - ");

        const descripcionNormalizada = normalizarTextoExtraccion(descripcionExtraida);
        const opcionPorDescripcion = descripcionNormalizada
          ? opciones?.find((opcion) => normalizarTextoExtraccion(opcion.string1 ?? "") === descripcionNormalizada)
          : undefined;
        if (opcionPorDescripcion) return [opcionPorDescripcion.string2?.trim(), opcionPorDescripcion.string1?.trim()].filter(Boolean).join(" - ");

        return [codigoExtraido, descripcionExtraida].filter(Boolean).join(" - ");
      }

      const idValor = typeof valor === "number"
        ? valor
        : typeof valor === "string" && valor.trim() !== "" && !Number.isNaN(Number(valor))
          ? Number(valor)
          : null;
      const opcionPorId = idValor == null ? undefined : opciones?.find((opcion) => opcion.num1 === idValor);
      if (opcionPorId) return [opcionPorId.string2?.trim(), opcionPorId.string1?.trim()].filter(Boolean).join(" - ");

      const texto = valorTexto.trim();
      const codigo = texto.match(/^\d+/)?.[0] ?? "";
      const opcionPorCodigo = codigo ? opciones?.find((opcion) => opcion.string2?.trim() === codigo) : undefined;
      if (opcionPorCodigo) return [opcionPorCodigo.string2?.trim(), opcionPorCodigo.string1?.trim()].filter(Boolean).join(" - ");

      const textoNormalizado = normalizarTextoExtraccion(valorTexto);
      const opcionPorTexto = opciones?.find((opcion) => normalizarTextoExtraccion(opcion.string1 ?? "") === textoNormalizado);
      if (opcionPorTexto) return [opcionPorTexto.string2?.trim(), opcionPorTexto.string1?.trim()].filter(Boolean).join(" - ");

      return valorTexto;
    };
    const obtenerCiiuExtraido = (
      opciones: { num1: number | null; string1: string | null; string2?: string | null }[] | undefined,
    ) => {
      const valorNormalizado = normalizarCiiuPorTablaMaestra(opciones);
      const [codigoCompuesto, ...descripcionCompuesta] = valorNormalizado.split(" - ");
      const codigo = esRegistroPlano(valor)
        ? String(valor.codigo ?? valor.Codigo ?? valor.string2 ?? "").trim()
        : valorNormalizado.match(/^\d+/)?.[0] ?? "";
      const texto = esRegistroPlano(valor)
        ? String(valor.descripcion ?? valor.Descripcion ?? valor.string1 ?? "").trim()
        : descripcionCompuesta.join(" - ").trim();
      const codigoFinal = codigo || (/^\d+$/.test(codigoCompuesto.trim()) ? codigoCompuesto.trim() : "");
      const textoFinal = texto || (codigoFinal ? valorNormalizado.replace(new RegExp(`^${codigoFinal}\\s*-\\s*`), "").trim() : valorNormalizado);
      const existe = opciones?.some((opcion) =>
        (!!codigoFinal && opcion.string2?.trim() === codigoFinal)
        || (!!textoFinal && normalizarTextoExtraccion(opcion.string1 ?? "") === normalizarTextoExtraccion(textoFinal))
      ) ?? false;

      return {
        valor: valorNormalizado,
        codigo: codigoFinal,
        texto: textoFinal,
        existe,
      };
    };

    if (!valorTexto) return { valor: "" };

    if (CAMPOS_MONETARIOS_EXTRACCION.has(rutaTexto)) {
      return { valor: normalizarMontoDosDecimales(valorTexto) };
    }

    const campoPorcentaje = rutaTexto.startsWith("operacionPrincipal.")
      ? rutaTexto.replace("operacionPrincipal.", "") as CampoPorcentajeOperacion
      : null;
    if (campoPorcentaje && CAMPOS_PORCENTAJE_EXTRACCION.has(campoPorcentaje)) {
      const numero = Number.parseFloat(valorTexto.replace(",", "."));
      if (Number.isNaN(numero) || numero < 0 || numero > 100) return { valor: "" };
      const valorPorcentaje = numero.toFixed(2);
      return {
        valor: valorPorcentaje,
        alAplicar: () => aplicarPorcentajeExtraccion(campoPorcentaje, valorPorcentaje),
        omitirActualizacion: true,
      };
    }

    if (rutaTexto === "identificacion.tipoPersona") {
      const opcionPorId = obtenerOpcionTablaMaestraPorId(opcionesTipoPersona, valor);
      if (opcionPorId?.string1) {
        return {
          valor: opcionPorId.string1,
          alAplicar: () => setIdTipoPersonaSeleccionado(opcionPorId.num1 ?? undefined),
        };
      }

      const opcionPorTexto = obtenerOpcionTablaMaestraPorTexto(opcionesTipoPersona, valor);
      if (opcionPorTexto?.string1) {
        return {
          valor: opcionPorTexto.string1,
          alAplicar: () => setIdTipoPersonaSeleccionado(opcionPorTexto.num1 ?? undefined),
        };
      }

      return {
        valor: valorTexto,
        alAplicar: () => setIdTipoPersonaSeleccionado(undefined),
      };
    }

    if (rutaTexto === "identificacion.pais") {
      const opcionPorId = obtenerOpcionTablaMaestraPorId(opcionesPais, valor);
      if (opcionPorId?.string1) {
        const nombrePais = opcionPorId.string1;
        paisExtraccionRef.current = {
          idPais: opcionPorId.num1 ?? undefined,
          pais: nombrePais,
          aplicado: normalizarTextoExtraccion(datosInvestigacion.identificacion.pais) === normalizarTextoExtraccion(nombrePais),
        };
        return {
          valor: nombrePais,
          alAplicar: () => {
            setIdPaisSeleccionado(opcionPorId.num1 ?? undefined);
            paisExtraccionRef.current = {
              idPais: opcionPorId.num1 ?? undefined,
              pais: nombrePais,
              aplicado: true,
            };
            procesarCiudadPendienteDespuesPais();
          },
        };
      }

      const opcionPorTexto = obtenerOpcionTablaMaestraPorTexto(opcionesPais, valor);
      if (opcionPorTexto?.string1) {
        const nombrePais = opcionPorTexto.string1;
        paisExtraccionRef.current = {
          idPais: opcionPorTexto.num1 ?? undefined,
          pais: nombrePais,
          aplicado: normalizarTextoExtraccion(datosInvestigacion.identificacion.pais) === normalizarTextoExtraccion(nombrePais),
        };
        return {
          valor: nombrePais,
          alAplicar: () => {
            setIdPaisSeleccionado(opcionPorTexto.num1 ?? undefined);
            paisExtraccionRef.current = {
              idPais: opcionPorTexto.num1 ?? undefined,
              pais: nombrePais,
              aplicado: true,
            };
            procesarCiudadPendienteDespuesPais();
          },
        };
      }

      return {
        valor: valorTexto,
        alAplicar: () => {
          setIdPaisSeleccionado(undefined);
          paisExtraccionRef.current = { aplicado: false };
          asignarCiudadExtraccionPendiente(null, false);
        },
      };
    }

    if (rutaTexto === "aspectosLegales.tipoEmpresa") {
      return { valor: normalizarPorTablaMaestra(opcionesTipoEmpresa) };
    }

    if (rutaTexto === "aspectosLegales.ciudadRegistro") {
      return { valor: normalizarPorTablaMaestra(opcionesCiudad) };
    }

    if (rutaTexto === "aspectosLegales.operacionesCambioDivisas") {
      return { valor: normalizarPorTablaMaestra(opcionesMoneda) };
    }

    if (rutaTexto === "aspectosLegales.monedaTipoCambio") {
      return { valor: normalizarPorTablaMaestra(opcionesMoneda) };
    }

    if (rutaTexto === "aspectosLegales.obligacionBolsa") {
      const texto = valorTexto.toLowerCase();
      if (texto === "no" || texto === "false" || texto === "2") return { valor: "No", valorFormulario: "false" };
      if (texto === "si" || texto === "sí" || texto === "true" || texto === "1") return { valor: "Sí", valorFormulario: "true" };
      return { valor: valorTexto };
    }

    if (rutaTexto === "operacionPrincipal.sector") {
      return { valor: normalizarPorTablaMaestra(opcionesSectorEconomico) };
    }

    if (rutaTexto === "operacionPrincipal.actividad") {
      return { valor: normalizarPorTablaMaestra(opcionesActividadEconomica) };
    }

    if (
      rutaTexto === "operacionPrincipal.ventasCreditoTiempo"
      || rutaTexto === "operacionPrincipal.comprasCreditoNacionalesTiempo"
      || rutaTexto === "operacionPrincipal.comprasCreditoInternacionalesTiempo"
    ) {
      const campoDest = rutaTexto.replace("operacionPrincipal.", "");
      const opcionPorId = obtenerOpcionTablaMaestraPorId(opcionesTiempoCreditoVentas, valor);
      if (opcionPorId?.num1 != null) {
        return {
          valor: opcionPorId.string1 ?? valorTexto,
          valorFormulario: String(opcionPorId.num1),
        };
      }

      const opcionPorTexto = obtenerOpcionTablaMaestraPorTexto(opcionesTiempoCreditoVentas, valor);
      if (opcionPorTexto?.num1 != null) {
        return {
          valor: opcionPorTexto.string1 ?? valorTexto,
          valorFormulario: String(opcionPorTexto.num1),
        };
      }

      return {
        valor: valorTexto,
        alAplicar: () => crearTiempoCreditoExtraccionMutation.mutate({ tiempoCredito: valorTexto, campoDest }),
        omitirActualizacion: true,
        confirmarConValorVacio: true,
      };
    }

    if (rutaTexto === "operacionPrincipal.categoriaCiiu") {
      const ciiu = obtenerCiiuExtraido(opcionesActividadEconomica);
      return {
        valor: ciiu.valor,
        alAplicar: ciiu.existe ? undefined : () => {
          setCodigoNuevaCategoriaCiiu(ciiu.codigo);
          setTextoNuevaCategoriaCiiu(ciiu.texto);
          setMostrarFormCategoriaCiiu(true);
        },
        omitirActualizacion: !ciiu.existe,
      };
    }

    if (rutaTexto === "operacionPrincipal.claseCiiu") {
      const ciiu = obtenerCiiuExtraido(opcionesClaseCiiu);
      return {
        valor: ciiu.valor,
        alAplicar: ciiu.existe ? undefined : () => {
          setCodigoNuevaClaseCiiu(ciiu.codigo);
          setTextoNuevaClaseCiiu(ciiu.texto);
          setMostrarFormClaseCiiu(true);
        },
        omitirActualizacion: !ciiu.existe,
      };
    }

    if (rutaTexto === "identificacion.estadoActual") {
      const opcionPorId = obtenerOpcionTablaMaestraPorId(opcionesEstadoCliente, valor);
      if (opcionPorId?.string1) {
        return { valor: opcionPorId.string1 };
      }

      const opcionPorTexto = obtenerOpcionTablaMaestraPorTexto(opcionesEstadoCliente, valor);
      if (opcionPorTexto?.string1) {
        return { valor: opcionPorTexto.string1 };
      }
    }

    if (rutaTexto === "identificacion.tipoIdentificacionFiscal") {
      const opcionPorId = obtenerOpcionTablaMaestraPorId(opcionesTipoRegTributario, valor);
      if (opcionPorId?.string1) {
        return { valor: opcionPorId.string1 };
      }

      const opcionPorTexto = obtenerOpcionTablaMaestraPorTexto(opcionesTipoRegTributario, valor);
      if (opcionPorTexto?.string1) {
        return { valor: opcionPorTexto.string1 };
      }
    }

    return { valor: valorTexto };
  };

  const aplicarCambioExtraccion = (idCambio: string, onAplicar: () => void) => {
    onAplicar();
    setCambiosExtraccionPendientes((anterior) => {
      const siguientes = { ...anterior };
      delete siguientes[idCambio];
      return siguientes;
    });
    setIdCambioExtraccionActivo((valorActual) => (valorActual === idCambio ? null : valorActual));
  };

  const registrarCambioExtraccion = ({
    id,
    ruta,
    etiqueta,
    valorActual,
    valorExtraido,
    onAplicar,
    confirmarConValorVacio = false,
  }: {
    id: string;
    ruta: string[];
    etiqueta: string;
    valorActual: string;
    valorExtraido: string;
    onAplicar: () => void;
    confirmarConValorVacio?: boolean;
  }) => {
    const esPorcentaje = id.startsWith("operacionPrincipal.")
      && CAMPOS_PORCENTAJE_EXTRACCION.has(id.replace("operacionPrincipal.", "") as CampoPorcentajeOperacion);
    const valorAnteriorBase = esPorcentaje && valorActual.trim()
      ? Number.parseFloat(valorActual.replace(",", ".")).toFixed(2)
      : valorActual.trim();
    const valorNuevoBase = esPorcentaje
      ? Number.parseFloat(valorExtraido.replace(",", ".")).toFixed(2)
      : valorExtraido.trim();
    const valorAnteriorLimpio = CAMPOS_MONETARIOS_EXTRACCION.has(id) && /^0+(?:[.,]0+)?$/.test(valorAnteriorBase)
      ? ""
      : valorAnteriorBase;
    const valorNuevoLimpio = valorNuevoBase;

    if (!valorNuevoLimpio || valorAnteriorLimpio === valorNuevoLimpio) return;

    if (!valorAnteriorLimpio && !confirmarConValorVacio) {
      onAplicar();
      return;
    }

    setCambiosExtraccionPendientes((anterior) => ({
      ...anterior,
      [id]: {
        ruta,
        etiqueta,
        valorOriginal: valorAnteriorLimpio,
        valorNuevo: valorNuevoLimpio,
        alAplicar: onAplicar,
      },
    }));
  };

  const aplicarResultadosExtraccion = (
    seccionActual: unknown,
    seccionExtraida: unknown,
    rutaBase: string[] = [],
  ) => {
    if (Array.isArray(seccionActual)) {
      if (!Array.isArray(seccionExtraida) || seccionExtraida.length === 0) return;
      actualizarCampoInvestigacion(rutaBase, seccionExtraida);
      return;
    }

    if (esRegistroPlano(seccionActual) && esRegistroPlano(seccionExtraida)) {
      const entradas = Object.entries(seccionExtraida).sort(([claveA], [claveB]) => {
        if (rutaBase.join(".") !== "identificacion") return 0;
        if (claveA === "pais") return -1;
        if (claveB === "pais") return 1;
        if (claveA === "ciudadEstadoProvincia") return 1;
        if (claveB === "ciudadEstadoProvincia") return -1;
        return 0;
      });

      entradas.forEach(([clave, valor]) => {
        if (!(clave in seccionActual)) return;
        aplicarResultadosExtraccion(
          (seccionActual as Record<string, unknown>)[clave],
          valor,
          [...rutaBase, clave],
        );
      });
      return;
    }

    if (rutaBase.join(".") === "identificacion.ciudadEstadoProvincia") {
      procesarCiudadExtraida(seccionExtraida);
      return;
    }

    const {
      valor: valorExtraido,
      valorFormulario,
      alAplicar,
      omitirActualizacion,
      confirmarConValorVacio,
    } = normalizarValorExtraido(rutaBase, seccionExtraida);
    const valorActual = seccionActual == null ? "" : String(seccionActual).trim();
    if (!valorExtraido) return;

    const etiquetaSeccion = ETIQUETAS_SECCIONES_EXTRACCION[rutaBase[0] ?? ""] ?? humanizarClaveExtraccion(rutaBase[0] ?? "");
    const etiquetaCampo = humanizarClaveExtraccion(rutaBase[rutaBase.length - 1] ?? "");
    const etiquetaCompleta = rutaBase.length > 1 ? `${etiquetaSeccion} - ${etiquetaCampo}` : etiquetaCampo;
    const idCambio = rutaBase.join(".");

    registrarCambioExtraccion({
      id: idCambio,
      ruta: rutaBase,
      etiqueta: etiquetaCompleta,
      valorActual,
      valorExtraido,
      confirmarConValorVacio,
      onAplicar: () => {
        alAplicar?.();
        if (!omitirActualizacion) {
          actualizarCampoInvestigacion(rutaBase, valorFormulario ?? valorExtraido);
        }
      },
    });
  };

  const construirCompaniaRelacionadaExtraccion = (valor: unknown): EmpresaRelacionadaAnalista | null => {
    if (typeof valor === "number" || (typeof valor === "string" && valor.trim() && !Number.isNaN(Number(valor)))) {
      const idCompania = Number(valor);
      return {
        idCompania,
        empresa: `Compañía ${idCompania}`,
        idFiscal: "",
        pais: "",
      };
    }

    if (!esRegistroPlano(valor)) return null;

    const idCompania = obtenerNumeroOpcionalDesdeTexto(String(valor.idCompania ?? valor.IdCompania ?? valor.id ?? ""));
    const empresa = String(valor.empresa ?? valor.nombreEmpresa ?? valor.nombre ?? valor.nombreCompleto ?? (idCompania ? `Compañía ${idCompania}` : "")).trim();
    if (!empresa && !idCompania) return null;

    return {
      ...(idCompania ? { idCompania } : {}),
      empresa,
      idFiscal: String(valor.idFiscal ?? valor.numeroIdentificacionFiscal ?? valor.numeroDocumento ?? "").trim(),
      pais: String(valor.pais ?? "").trim(),
    };
  };

  const construirCompaniaNuevaExtraccion = (valor: unknown): CompaniaRelacionadaExtraccionNueva | null => {
    if (!esRegistroPlano(valor)) return null;

    const compania = construirCompaniaRelacionadaExtraccion(valor);
    if (!compania) return null;
    const idTipoPersona = obtenerOpcionTablaMaestraPorId(opcionesTipoPersona, valor.tipoPersona)?.num1
      ?? obtenerOpcionTablaMaestraPorTexto(opcionesTipoPersona, valor.tipoPersona)?.num1
      ?? undefined;
    const idPais = obtenerOpcionTablaMaestraPorId(opcionesPais, valor.pais)?.num1
      ?? obtenerOpcionTablaMaestraPorTexto(opcionesPais, valor.pais)?.num1
      ?? undefined;
    const idTipoDocumento = obtenerOpcionTablaMaestraPorId(undefined, valor.IdTipoDocumento ?? valor.idTipoDocumento)?.num1
      ?? (typeof valor.IdTipoDocumento === "number" ? valor.IdTipoDocumento : typeof valor.idTipoDocumento === "number" ? valor.idTipoDocumento : undefined);

    return {
      ...compania,
      idTipoPersona,
      idTipoDocumento,
      idPais,
      tipoPersona: String(valor.tipoPersona ?? "").trim(),
      tipoDocumento: String(valor.IdTipoDocumento ?? valor.idTipoDocumento ?? valor.tipoDocumento ?? "").trim(),
      telefono: String(valor.telefono ?? "").trim(),
      direccion: String(valor.direccion ?? "").trim(),
      ubigeo: String(valor.ubigeo ?? valor.ciudadEstadoProvincia ?? "").trim(),
      codigoPostal: String(valor.codigoPostal ?? "").trim(),
    };
  };

  const aplicarCompaniasRelacionadasExtraccion = (valor: unknown) => {
    if (Array.isArray(valor)) {
      aplicarResultadosExtraccion(datosInvestigacion.companiasRelacionadas, valor, ["companiasRelacionadas"]);
      return;
    }

    if (!esRegistroPlano(valor)) return;

    const existentes = Array.isArray(valor.existentes) ? valor.existentes : [];
    const nuevas = Array.isArray(valor.nuevas) ? valor.nuevas : [];
    const companiasExistentes = existentes
      .map(construirCompaniaRelacionadaExtraccion)
      .filter((compania): compania is EmpresaRelacionadaAnalista => Boolean(compania));
    const companiasNuevas = nuevas
      .map(construirCompaniaNuevaExtraccion)
      .filter((compania): compania is CompaniaRelacionadaExtraccionNueva => Boolean(compania));

    companiasExistentes.forEach((compania) => {
      if (compania.idCompania && (!compania.empresa || compania.empresa === `Compañía ${compania.idCompania}`)) {
        void servicioCompania.obtener({ idCompania: compania.idCompania })
          .then((detalle) => {
            agregarCompaniaRelacionada({
              idCompania: compania.idCompania,
              empresa: detalle?.nombreCompleto || compania.empresa,
              idFiscal: detalle?.numeroDocumento || compania.idFiscal,
              pais: detalle?.pais || compania.pais,
            });
          })
          .catch(() => agregarCompaniaRelacionada(compania));
        return;
      }

      agregarCompaniaRelacionada(compania);
    });
    if (companiasNuevas.length > 0) {
      setCompaniasExtraccionPendientes((anteriores) => [...anteriores, ...companiasNuevas]);
      setEstaAbiertoModalRevisionCompaniasExtraccion(true);
    }
  };

  const normalizarOperacionesExteriorExtraccion = (valor: unknown) => {
    const obtenerTextoOpcion = (
      opciones: { num1: number | null; string1: string | null }[] | undefined,
      contenido: unknown,
    ) => obtenerOpcionTablaMaestraPorId(opciones, contenido)?.string1 ?? String(contenido ?? "").trim();

    if (Array.isArray(valor)) {
      return valor.map((item) => {
        if (!esRegistroPlano(item)) return item;
        const idMoneda = typeof item.idMoneda === "number"
          ? item.idMoneda
          : typeof item.operacionesDeCambio === "number"
            ? item.operacionesDeCambio
            : undefined;

        return {
          idMesInicio: typeof item.idMesInicio === "number" ? item.idMesInicio : undefined,
          idMesFin: typeof item.idMesFin === "number" ? item.idMesFin : undefined,
          idMoneda,
          anio: String(item.anio ?? item.ano ?? item["año"] ?? "").trim(),
          mes: obtenerTextoOpcion(opcionesMes, item.idMesInicio ?? item.mes),
          moneda: obtenerTextoOpcion(opcionesMoneda, idMoneda ?? item.moneda ?? item.operacionesDeCambio),
          paises: String(item.paises ?? item.pais ?? "").trim(),
          productos: String(item.productos ?? item.producto ?? "").trim(),
          monto: normalizarMontoDosDecimales(String(item.monto ?? "").trim()),
          operaciones: String(item.operaciones ?? item.numOperaciones ?? "").trim(),
        };
      });
    }
    if (typeof valor !== "string" || !valor.trim()) return valor;

    return valor.split("|").map((segmento) => {
      const texto = segmento.trim();
      const anio = texto.match(/\b(20\d{2}|19\d{2})\b/)?.[1] ?? "";
      const monto = texto.match(/(?:U\.?S\.?\$|US\$|\$)\s*([0-9.,]+)/i)?.[1] ?? "";
      const operaciones = texto.match(/(\d+)\s+operaciones?/i)?.[1] ?? "";
      const paises = texto
        .replace(/^\d{4}[^:]*:\s*/i, "")
        .replace(/(?:U\.?S\.?\$|US\$|\$)\s*[0-9.,]+/i, "")
        .replace(/\b\d+\s+operaciones?\b/i, "")
        .replace(/\s+/g, " ")
        .trim();

      return {
        anio,
        mes: "",
        moneda: "US Dollar",
        paises,
        productos: "",
        monto: normalizarMontoDosDecimales(monto),
        operaciones,
      };
    });
  };

  const obtenerTextoExtraccionSeguro = (valor: unknown) => String(valor ?? "").trim();

  const obtenerIdExtraccion = (valor: unknown) => {
    const numero = typeof valor === "number" ? valor : Number(obtenerTextoExtraccionSeguro(valor));
    return Number.isFinite(numero) && numero > 0 ? numero : undefined;
  };

  const obtenerTextoTablaMaestraExtraccion = (
    opciones: { num1: number | null; string1: string | null }[] | undefined,
    valor: unknown,
  ) => obtenerOpcionTablaMaestraPorId(opciones, valor)?.string1 ?? obtenerTextoExtraccionSeguro(valor);

  const obtenerBooleanoExtraccion = (valor: unknown) => {
    if (typeof valor === "boolean") return valor;
    if (typeof valor === "number") return valor === 1;
    const texto = obtenerTextoExtraccionSeguro(valor).toLowerCase();
    return ["1", "true", "si", "sí", "s", "yes"].includes(texto);
  };

  const normalizarProveedoresExtraccion = (valor: unknown): RegistroProveedorAnalista[] | unknown => {
    if (!Array.isArray(valor)) return valor;

    return valor
      .filter(esRegistroPlano)
      .map((proveedor): RegistroProveedorAnalista => {
        const idTipoProveedor = obtenerIdExtraccion(proveedor.tipoProveedor ?? proveedor.idTipoProveedor);
        const idPais = obtenerIdExtraccion(proveedor.idPais);
        const idTipoDocumento = obtenerIdExtraccion(proveedor.idTipoDocumento);
        const idMoneda = obtenerIdExtraccion(proveedor.operacionesCambioMoneda ?? proveedor.idMoneda);
        const idLimiteCredito = obtenerIdExtraccion(proveedor.limiteCredito ?? proveedor.idLimiteCredito ?? proveedor.idPlazoCredito);
        const tieneReferenciaComercial = obtenerBooleanoExtraccion(proveedor.referenciaComercial ?? proveedor.esTieneReferenciaComercial ?? proveedor.tieneReferenciaComercial);

        return {
          idTipoProveedor,
          nombreEmpresa: obtenerTextoExtraccionSeguro(proveedor.nombreEmpresa ?? proveedor.nombre),
          contacto: obtenerTextoExtraccionSeguro(proveedor.contacto ?? proveedor.nombreContacto),
          tipoProveedor: obtenerTextoTablaMaestraExtraccion(opcionesTipoProveedor, idTipoProveedor ?? proveedor.tipoProveedor),
          telefono: obtenerTextoExtraccionSeguro(proveedor.telefono),
          tipoPersona: "",
          idPais,
          pais: obtenerTextoTablaMaestraExtraccion(opcionesPais, idPais ?? proveedor.pais),
          idTipoDocumento,
          taxIdType: obtenerTextoTablaMaestraExtraccion(opcionesTipoRegTributario, idTipoDocumento ?? proveedor.taxIdType),
          taxIdNumber: obtenerTextoExtraccionSeguro(proveedor.taxIdNumber ?? proveedor.numeroIdentificacion ?? proveedor.numeroDocumento),
          tieneReferenciaComercial,
          esTieneReferenciaComercial: tieneReferenciaComercial,
          comienzoNegociaciones: obtenerTextoExtraccionSeguro(proveedor.comienzoNegociaciones),
          idMoneda,
          operacionCambioMoneda: obtenerTextoTablaMaestraExtraccion(opcionesMoneda, idMoneda ?? proveedor.operacionesCambioMoneda ?? proveedor.operacionCambioMoneda),
          tipoCambio: proveedor.tipoCambio == null ? "" : normalizarMontoDecimales(obtenerTextoExtraccionSeguro(proveedor.tipoCambio), 6),
          idLimiteCredito,
          idPlazoCredito: idLimiteCredito,
          limiteCredito: obtenerTextoTablaMaestraExtraccion(undefined, idLimiteCredito ?? proveedor.limiteCredito),
          promedioMensual: proveedor.promedioMensual == null ? "" : normalizarMontoDosDecimales(obtenerTextoExtraccionSeguro(proveedor.promedioMensual)),
        };
      });
  };

  const aplicarResultadosLegalesExtraccion = (seccionExtraida: unknown) => {
    if (Array.isArray(seccionExtraida)) {
      aplicarCompaniasRelacionadasExtraccion(seccionExtraida);
      return;
    }

    if (!esRegistroPlano(seccionExtraida)) return;

    const camposAspectosLegales = Object.entries(seccionExtraida).reduce<Record<string, unknown>>(
      (acumulado, [clave, valor]) => {
        if (clave in datosInvestigacion.aspectosLegales) {
          acumulado[clave] = valor;
        }
        return acumulado;
      },
      {},
    );

    if (Object.keys(camposAspectosLegales).length > 0) {
      aplicarResultadosExtraccion(
        datosInvestigacion.aspectosLegales,
        camposAspectosLegales,
        ["aspectosLegales"],
      );
    }

    const companiasExtraidas = seccionExtraida.companiasRelacionadas;
    if (companiasExtraidas === undefined) return;
    aplicarCompaniasRelacionadasExtraccion(companiasExtraidas);
  };

  const aplicarResultadosRamoOperacionesExtraccion = (seccionExtraida: unknown) => {
    if (!esRegistroPlano(seccionExtraida)) return;

    const ventasCreditoDetalleExtraido = esRegistroPlano(seccionExtraida.ventasCreditoDetalle)
      ? seccionExtraida.ventasCreditoDetalle
      : null;
    const comprasCreditoNacionalesDetalleExtraido = esRegistroPlano(seccionExtraida.comprasCreditoNacionalesDetalle)
      ? seccionExtraida.comprasCreditoNacionalesDetalle
      : null;
    const comprasCreditoInternacionalesDetalleExtraido = esRegistroPlano(seccionExtraida.comprasCreditoInternacionalesDetalle)
      ? seccionExtraida.comprasCreditoInternacionalesDetalle
      : null;
    const camposOperacionPrincipal = {
      ...seccionExtraida,
      ventasCreditoDetalle: ventasCreditoDetalleExtraido?.creditoDetalle ?? seccionExtraida.ventasCreditoDetalle,
      ventasCreditoTiempo: ventasCreditoDetalleExtraido?.creditoTiempo,
      comprasNacionalesDetalle: seccionExtraida.comprasNacionalesDetalle ?? seccionExtraida.comprasNacionalesDetalles,
      comprasContadoNacionalesDetalle: seccionExtraida.comprasContadoNacionalesDetalle,
      comprasContadoNacionalesPorcentaje: seccionExtraida.comprasContadoNacionalesPorcentaje,
      comprasCreditoNacionalesDetalle: comprasCreditoNacionalesDetalleExtraido?.creditoDetalle ?? seccionExtraida.comprasCreditoNacionalesDetalle,
      comprasCreditoNacionalesTiempo: comprasCreditoNacionalesDetalleExtraido?.creditoTiempo,
      comprasCreditoNacionalesPorcentaje: seccionExtraida.comprasCreditoNacionalesPorcentaje,
      comprasExtranjeroDetalle: seccionExtraida.comprasExtranjeroDetalle ?? seccionExtraida.comprasExtranjeroDetalles,
      comprasContadoInternacionalesDetalle: seccionExtraida.comprasContadoInternacionalesDetalle,
      comprasContadoInternacionalesPorcentaje: seccionExtraida.comprasContadoInternacionalesPorcentaje,
      comprasCreditoInternacionalesDetalle: comprasCreditoInternacionalesDetalleExtraido?.creditoDetalle ?? seccionExtraida.comprasCreditoInternacionalesDetalle,
      comprasCreditoInternacionalesTiempo: comprasCreditoInternacionalesDetalleExtraido?.creditoTiempo,
      comprasCreditoInternacionalesPorcentaje: seccionExtraida.comprasCreditoInternacionalesPorcentaje,
      territorioVentasDetalle: seccionExtraida.ventasNacionalesDetalle ?? seccionExtraida.territorioVentasDetalle,
      territorioVentasPorcentaje: seccionExtraida.ventasNacionalesPorcentaje ?? seccionExtraida.territorioVentasPorcentaje,
    };

    aplicarResultadosExtraccion(datosInvestigacion.operacionPrincipal, camposOperacionPrincipal, ["operacionPrincipal"]);

    if (seccionExtraida.importaciones !== undefined) {
      aplicarResultadosExtraccion(datosInvestigacion.importaciones, normalizarOperacionesExteriorExtraccion(seccionExtraida.importaciones), ["importaciones"]);
    }

    if (seccionExtraida.exportaciones !== undefined) {
      aplicarResultadosExtraccion(datosInvestigacion.exportaciones, normalizarOperacionesExteriorExtraccion(seccionExtraida.exportaciones), ["exportaciones"]);
    }

    if (seccionExtraida.locales !== undefined) {
      const localesExtraidos = Array.isArray(seccionExtraida.locales)
        ? seccionExtraida.locales
            .filter(esRegistroPlano)
            .map((local) => {
              const valorTipoLocal = local.tipoLocal ?? local.idTipoLocal;
              const idTipoLocal = typeof valorTipoLocal === "number"
                ? valorTipoLocal
                : typeof valorTipoLocal === "string" && valorTipoLocal.trim() && !Number.isNaN(Number(valorTipoLocal))
                  ? Number(valorTipoLocal)
                  : null;
              const tipoLocal = obtenerOpcionTablaMaestraPorId(opcionesTipoLocal, idTipoLocal)?.string1
                ?? String(local.tipoLocal ?? "");

              return {
                ...local,
                idTipoLocal: idTipoLocal ?? undefined,
                tipoLocal,
              };
            })
        : [];
      aplicarResultadosExtraccion(datosInvestigacion.locales, localesExtraidos, ["locales"]);
      return;
    }

    const localExtraido = {
      tipoLocal: obtenerOpcionTablaMaestraPorId(opcionesTipoLocal, seccionExtraida.tipoLocal)?.string1 ?? seccionExtraida.tipoLocal,
      direccion: seccionExtraida.direccion,
      comentario: seccionExtraida.comentario,
      imagenUrl: seccionExtraida.imagenUrl ?? seccionExtraida.imageUrl,
      imagenTipo: seccionExtraida.imagenTipo,
    };
    if (Object.values(localExtraido).some((valor) => valor !== undefined)) {
      aplicarResultadosExtraccion(datosInvestigacion.locales, [localExtraido], ["locales"]);
    }
  };

  const aplicarResultadosBancosProveedoresExtraccion = (seccionExtraida: unknown) => {
    if (!esRegistroPlano(seccionExtraida)) return;

    aplicarResultadosExtraccion(datosInvestigacion.referencias, seccionExtraida, ["referencias"]);

    if (seccionExtraida.proveedores !== undefined) {
      aplicarResultadosExtraccion(datosInvestigacion.proveedores, normalizarProveedoresExtraccion(seccionExtraida.proveedores), ["proveedores"]);
    }

    if (seccionExtraida.bancos !== undefined) {
      aplicarBancosExtraccion(seccionExtraida.bancos);
    }
  };

  const obtenerIndicadorCambioExtraccion = (id: string) => (
    <IndicadorCambioExtraccion
      visible={Boolean(cambiosExtraccionPendientes[id])}
      onClick={() => setIdCambioExtraccionActivo(id)}
    />
  );

  const obtenerValorOriginalCambioExtraccion = () => {
    const idCambio = idCambioExtraccionActivo ?? "";
    const cambio = cambiosExtraccionPendientes[idCambio];
    if (!cambio) return "-";

    if (
      idCambio === "operacionPrincipal.ventasCreditoTiempo"
      || idCambio === "operacionPrincipal.comprasCreditoNacionalesTiempo"
      || idCambio === "operacionPrincipal.comprasCreditoInternacionalesTiempo"
    ) {
      const opcionTiempoCredito = obtenerOpcionTablaMaestraPorId(
        opcionesTiempoCreditoVentas,
        cambio.valorOriginal,
      ) ?? obtenerOpcionTablaMaestraPorTexto(
        opcionesTiempoCreditoVentas,
        cambio.valorOriginal,
      );

      return opcionTiempoCredito?.string1?.trim() || cambio.valorOriginal || "-";
    }

    const opcionesCiiu = idCambio === "operacionPrincipal.categoriaCiiu"
      ? opcionesActividadEconomica
      : idCambio === "operacionPrincipal.claseCiiu"
        ? opcionesClaseCiiu
        : undefined;
    if (!opcionesCiiu) return cambio.valorOriginal || "-";

    const valorOriginal = cambio.valorOriginal.trim();
    const valorNormalizado = valorOriginal.toLowerCase();
    const opcion = opcionesCiiu.find((item) => {
      const etiquetaCompleta = [item.string2?.trim(), item.string1?.trim()]
        .filter(Boolean)
        .join(" - ")
        .toLowerCase();

      return String(item.num1 ?? "") === valorOriginal
        || item.string2?.trim().toLowerCase() === valorNormalizado
        || item.string1?.trim().toLowerCase() === valorNormalizado
        || etiquetaCompleta === valorNormalizado;
    });

    if (!opcion?.string1?.trim()) return cambio.valorOriginal || "-";
    return [opcion.string2?.trim(), opcion.string1.trim()].filter(Boolean).join(" - ");
  };

  const agregarCompaniaRelacionada = (empresaNueva: DatosInvestigacionAnalista["companiasRelacionadas"][number]) => {
    setDatosInvestigacion((anterior) => {
      const indiceExistente = anterior.companiasRelacionadas.findIndex(
        (empresa) => (
          (empresa.idCompania != null && empresaNueva.idCompania != null && empresa.idCompania === empresaNueva.idCompania)
          || empresa.empresa === empresaNueva.empresa
        ),
      );

      if (indiceExistente >= 0) {
        const companiasRelacionadas = [...anterior.companiasRelacionadas];
        companiasRelacionadas[indiceExistente] = empresaNueva;
        return {
          ...anterior,
          companiasRelacionadas,
        };
      }

      return {
        ...anterior,
        companiasRelacionadas: [...anterior.companiasRelacionadas, empresaNueva],
      };
    });
  };

  const crearCompaniaExtraccionMutation = useMutation({
    mutationFn: async ({ compania }: { indice: number; compania: CompaniaRelacionadaExtraccionNueva }) => {
      const respuesta = await servicioCompania.crear({
        idTipoPersona: compania.idTipoPersona ?? 0,
        idTipoDocumento: compania.idTipoDocumento ?? 0,
        numeroDocumento: compania.idFiscal ?? "",
        nombreCompleto: compania.empresa,
        idPais: compania.idPais ?? 0,
        telefono: compania.telefono ?? "",
        existeInformacion: true,
      });

      return {
        ...compania,
        idCompania: respuesta.idCompania,
      };
    },
    onSuccess: (companiaCreada, variables) => {
      agregarCompaniaRelacionada({
        idCompania: companiaCreada.idCompania,
        empresa: companiaCreada.empresa,
        idFiscal: companiaCreada.idFiscal,
        pais: companiaCreada.pais,
      });
      setCompaniasExtraccionPendientes((anteriores) => anteriores.filter((_, indiceActual) => indiceActual !== variables.indice));
    },
  });

  const aprobarCompaniaExtraccion = (indice: number) => {
    const compania = companiasExtraccionPendientes[indice];
    if (!compania || crearCompaniaExtraccionMutation.isPending) return;
    crearCompaniaExtraccionMutation.mutate({ indice, compania });
  };

  const rechazarCompaniaExtraccion = (indice: number) => {
    setCompaniasExtraccionPendientes((anteriores) => anteriores.filter((_, indiceActual) => indiceActual !== indice));
  };

  const aplicarDirectorioEjecutivoExtraccion = (valor: unknown) => {
    if (!Array.isArray(valor)) return;
    const existentes = datosInvestigacion.directorioEjecutivo;
    const nuevos = valor
      .filter((item): item is Record<string, unknown> => {
        if (!esRegistroPlano(item)) return false;
        const nombre = String(item.ejecutivo ?? item.nombreCompleto ?? "").trim().toLowerCase();
        return Boolean(nombre) && !existentes.some(
          (e) => e.ejecutivo.toLowerCase() === nombre || (e.nombreCompleto ?? "").toLowerCase() === nombre,
        );
      })
      .map((item): RegistroDirectorioEjecutivoAnalista => {
        const valorCargo = item.cargoEjecutivo ?? item.idCargo;
        const valorParticipacion = item.participacion ?? item.porcentaje;
        const idCargo = valorCargo == null ? Number.NaN : Number(valorCargo);
        const participacion = valorParticipacion == null ? Number.NaN : Number(valorParticipacion);

        return {
          id: Date.now() + Math.random(),
          ejecutivo: String(item.ejecutivo ?? item.nombreCompleto ?? "").trim(),
          nombreCompleto: String(item.nombreCompleto ?? item.ejecutivo ?? "").trim(),
          idCargo: Number.isFinite(idCargo) && idCargo > 0 ? idCargo : undefined,
          cargo: obtenerTextoPorId(opcionesCargoDirectorio, idCargo) || String(item.cargo ?? "").trim(),
          porcentaje: Number.isFinite(participacion) ? formatearPorcentajeOchoDecimales(participacion) : "",
          lista: Boolean(item.figuraListadoEjecutivos ?? item.lista),
          detalleEjecutivo: Boolean(item.existenDetallesEjecutivo ?? item.detalleEjecutivo),
          orden: "1",
          vinculadoDesde: String(item.vinculadoDesde ?? "").trim(),
          companiaAnterior: String(item.companiaAnterior ?? "").trim(),
          esParteDirectorio: Boolean(item.formaParteDirectorioEjecutivo ?? item.esParteDirectorio),
          pais: String(item.pais ?? "").trim(),
          tipoPersona: String(item.tipoPersona ?? "Natural").trim(),
          descripcionBusqueda: String(item.ejecutivo ?? item.nombreCompleto ?? "").trim(),
        };
      });

    if (nuevos.length > 0) {
      setEjecutivosExtraccionPendientes((anteriores) => [...anteriores, ...nuevos]);
      setEstaAbiertoModalRevisionEjecutivosExtraccion(true);
    }
  };

  const aplicarBancosExtraccion = (valor: unknown) => {
    const mapearItem = (item: Record<string, unknown>): RegistroBancoAnalista => ({
      idBanco: typeof item.idBanco === "number" && item.idBanco > 0 ? item.idBanco : undefined,
      banco: String(item.nombre ?? item.banco ?? "").trim(),
      numeroCuenta: String(item.numeroCuenta ?? "").trim(),
      idSector: typeof item.listaSectores === "number" ? item.listaSectores : undefined,
      sector: String(item.sector ?? "").trim(),
      telefono: String(item.numerosTelefono ?? item.telefono ?? "").trim(),
      sectoristaJefeCuenta: String(item.sectoristaJefeCuenta ?? "").trim() || undefined,
      pais: String(item.pais ?? "").trim() || undefined,
    });

    const bancosEnTabla = datosInvestigacion.bancos;
    const procesarItems = (items: unknown[]) => {
      const existentesExtraccion: RegistroBancoAnalista[] = [];
      const nuevos: RegistroBancoAnalista[] = [];
      for (const item of items) {
        if (!esRegistroPlano(item)) continue;
        const idBanco = typeof item.idBanco === "number" && item.idBanco > 0 ? item.idBanco : null;
        if (idBanco) {
          existentesExtraccion.push(mapearItem(item));
        } else {
          const nombre = String(item.nombre ?? item.banco ?? "").trim().toLowerCase();
          if (nombre && !bancosEnTabla.some((b) => b.banco.toLowerCase() === nombre)) {
            nuevos.push(mapearItem(item));
          }
        }
      }
      return { existentesExtraccion, nuevos };
    };

    let resultado = { existentesExtraccion: [] as RegistroBancoAnalista[], nuevos: [] as RegistroBancoAnalista[] };
    if (esRegistroPlano(valor) && Array.isArray(valor.nuevos)) {
      resultado = procesarItems(valor.nuevos);
    } else if (Array.isArray(valor)) {
      resultado = procesarItems(valor);
    }

    if (resultado.existentesExtraccion.length > 0) {
      setColaExistentesExtraccion((anteriores) => [...anteriores, ...resultado.existentesExtraccion]);
    }
    if (resultado.nuevos.length > 0) {
      setBancosExtraccionPendientes((anteriores) => [...anteriores, ...resultado.nuevos]);
      setEstaAbiertoModalRevisionBancosExtraccion(true);
    }
  };

  const aprobarEjecutivoExtraccion = (indice: number) => {
    if (!ejecutivosExtraccionPendientes[indice]) return;
    setEstaAbiertoModalRevisionEjecutivosExtraccion(false);
    setIndiceEjecutivoExtraccionAprobacion(indice);
    setIndiceEjecutivoExtraccionEdicion(indice);
  };

  const rechazarEjecutivoExtraccion = (indice: number) => {
    setEjecutivosExtraccionPendientes((anteriores) => anteriores.filter((_, i) => i !== indice));
  };

  const guardarEdicionEjecutivoExtraccion = (registro: Omit<RegistroDirectorioEjecutivoAnalista, "id">) => {
    if (indiceEjecutivoExtraccionEdicion == null) return;

    if (indiceEjecutivoExtraccionAprobacion === indiceEjecutivoExtraccionEdicion) {
      setDatosInvestigacion((anterior) => ({
        ...anterior,
        directorioEjecutivo: [{ ...registro, id: Date.now() }, ...anterior.directorioEjecutivo],
      }));
      setEjecutivosExtraccionPendientes((anteriores) =>
        anteriores.filter((_, indice) => indice !== indiceEjecutivoExtraccionEdicion),
      );
      setIndiceEjecutivoExtraccionAprobacion(null);
      setIndiceEjecutivoExtraccionEdicion(null);
      setIndiceEjecutivoExtraccionBusqueda(null);
      if (ejecutivosExtraccionPendientes.length > 1) {
        setEstaAbiertoModalRevisionEjecutivosExtraccion(true);
      }
      return;
    }

    setEjecutivosExtraccionPendientes((anteriores) =>
      anteriores.map((ejecutivo, i) =>
        i === indiceEjecutivoExtraccionEdicion ? { ...ejecutivo, ...registro } : ejecutivo,
      ),
    );
    setIndiceEjecutivoExtraccionEdicion(null);
  };

  const iniciarCreacionBancoExtraccion = (indice: number) => {
    if (!bancosExtraccionPendientes[indice]) return;
    setEstaAbiertoModalRevisionBancosExtraccion(false);
    setIndiceBancoExtraccionEdicion(indice);
  };

  const aprobarBancoExtraccion = (indice: number) => iniciarCreacionBancoExtraccion(indice);

  const rechazarBancoExtraccion = (indice: number) => {
    setBancosExtraccionPendientes((anteriores) => anteriores.filter((_, i) => i !== indice));
  };

  const onBancoExtraccionCreado = (banco: BancoListaItem) => {
    if (indiceBancoExtraccionEdicion == null) return;
    setBancosExtraccionPendientes((anteriores) => anteriores.filter((_, i) => i !== indiceBancoExtraccionEdicion));
    setIndiceBancoExtraccionEdicion(null);
    setBancoRecienCreado(banco);
  };

  const guardarCuentaBancariaExtraccion = (registro: RegistroBancoAnalista) => {
    setDatosInvestigacion((anterior) => ({
      ...anterior,
      bancos: [registro, ...anterior.bancos],
    }));
    setBancosExtraccionPendientes((anteriores) => {
      if (anteriores.length > 0) {
        setEstaAbiertoModalRevisionBancosExtraccion(true);
      }
      return anteriores;
    });
    setBancoRecienCreado(null);
  };

  const convertirCompaniaExtraccionARegistro = (
    compania: CompaniaRelacionadaExtraccionNueva,
    indice: number,
  ): RegistroPersonaAnalista => ({
    id: indice + 1,
    idTipoPersona: compania.idTipoPersona,
    idTipoDocumento: compania.idTipoDocumento,
    idPais: compania.idPais,
    tipoPersona: compania.tipoPersona ?? "",
    nombres: compania.empresa,
    tipoDocumento: compania.tipoDocumento ? `${compania.tipoDocumento} - ${compania.idFiscal}` : compania.idFiscal,
    numeroDocumento: compania.idFiscal,
    pais: compania.pais,
    telefono: compania.telefono ?? "",
    direccion: compania.direccion,
    ubigeo: compania.ubigeo,
    codigoPostal: compania.codigoPostal,
    existeInformacion: true,
  });

  const guardarEdicionCompaniaExtraccion = (registro: RegistroPersonaAnalista) => {
    if (indiceCompaniaExtraccionEdicion == null) return;

    setCompaniasExtraccionPendientes((anteriores) => anteriores.map((compania, indice) => (
      indice === indiceCompaniaExtraccionEdicion
        ? {
            ...compania,
            idTipoPersona: registro.idTipoPersona,
            idTipoDocumento: registro.idTipoDocumento,
            idPais: registro.idPais,
            empresa: registro.nombres,
            idFiscal: registro.numeroDocumento ?? "",
            pais: registro.pais,
            telefono: registro.telefono,
            direccion: registro.direccion,
            ubigeo: registro.ubigeo,
            codigoPostal: registro.codigoPostal,
          }
        : compania
    )));
    setIndiceCompaniaExtraccionEdicion(null);
  };

  const pestanaRamoOperacionesVisible =
    pestanaRamoOperaciones === "exportaciones" && !esPorcentajeMayorACero(datosInvestigacion.operacionPrincipal.ventasExtranjeroPorcentaje)
      ? "operaciones"
      : pestanaRamoOperaciones === "importaciones" && !esPorcentajeMayorACero(datosInvestigacion.operacionPrincipal.comprasContadoInternacionalesPorcentaje) && !esPorcentajeMayorACero(datosInvestigacion.operacionPrincipal.comprasCreditoInternacionalesPorcentaje)
        ? "operaciones"
        : pestanaRamoOperaciones;

  const registrosOperacionActivos =
    pestanaRamoOperacionesVisible === "importaciones"
      ? datosInvestigacion.importaciones
      : pestanaRamoOperacionesVisible === "exportaciones"
        ? datosInvestigacion.exportaciones
        : [];

  const guardarOperacion = (registro: DatosInvestigacionAnalista["importaciones"][number]) => {
    setDatosInvestigacion((anterior) => {
      const clave = pestanaRamoOperacionesVisible === "importaciones" ? "importaciones" : "exportaciones";
      const listaActual = [...anterior[clave]];

      if (indiceOperacionSeleccionada != null) {
        listaActual[indiceOperacionSeleccionada] = registro;
      } else {
        listaActual.unshift(registro);
      }

      return {
        ...anterior,
        [clave]: listaActual,
      };
    });
    setIndiceOperacionSeleccionada(null);
    setEstaAbiertoModalOperacion(false);
  };

  const guardarLocal = (registro: DatosInvestigacionAnalista["locales"][number]) => {
    setDatosInvestigacion((anterior) => {
      const listaActual = [...anterior.locales];

      if (indiceLocalSeleccionado != null) {
        const localExistente = listaActual[indiceLocalSeleccionado];
        listaActual[indiceLocalSeleccionado] = {
          ...registro,
          idInformeLocal: localExistente?.idInformeLocal,
        };
      } else {
        listaActual.unshift(registro);
      }

      return {
        ...anterior,
        locales: listaActual,
      };
    });
    setIndiceLocalSeleccionado(null);
    setEstaAbiertoModalLocal(false);
  };

  const generarCodigoBalance = (balances: RegistroBalanceAnalista[]) => {
    const mayorCodigo = balances.reduce((mayor, balance) => {
      const numero = Number.parseInt(balance.codigo, 10);
      return Number.isNaN(numero) ? mayor : Math.max(mayor, numero);
    }, 0);

    return String(mayorCodigo + 1);
  };

  const guardarBalance = (
    registro: Omit<RegistroBalanceAnalista, "codigo" | "periodo" | "balanceGeneral" | "perdidaGanancia" | "cuentas" | "detalleCuentas">,
  ) => {
    setDatosInvestigacion((anterior) => {
      const balances = [...anterior.balances];
      const tipoEstadoFinanciero = registro.tipoEstadoFinanciero ?? registro.tipo;
      const esGananciaPerdida = tipoEstadoFinanciero.includes("PG");
      const esBalanceGeneral = tipoEstadoFinanciero.includes("GN");

      const balanceActualizado: RegistroBalanceAnalista = indiceBalanceSeleccionado != null
        ? {
            ...balances[indiceBalanceSeleccionado],
            ...registro,
            periodo: registro.fechaInicio?.split("/")[2] ?? balances[indiceBalanceSeleccionado].periodo,
            balanceGeneral: esBalanceGeneral,
            perdidaGanancia: esGananciaPerdida,
            cuentas: true,
          }
        : {
            codigo: generarCodigoBalance(balances),
            periodo: registro.fechaInicio?.split("/")[2] ?? "",
            fecha: registro.fecha,
            tipo: registro.tipo,
            fechaInicio: registro.fechaInicio,
            fechaFin: registro.fechaFin,
            esActual: registro.esActual,
            idTipoEstadoFinanciero: registro.idTipoEstadoFinanciero,
            tipoEstadoFinanciero: registro.tipoEstadoFinanciero,
            tipoCambio: registro.tipoCambio,
            idMoneda: registro.idMoneda,
            operacionCambio: registro.operacionCambio,
            idTipoBalance: registro.idTipoBalance,
            tipoBalance: registro.tipoBalance,
            balanceGeneral: esBalanceGeneral,
            perdidaGanancia: esGananciaPerdida,
            cuentas: true,
          };

      if (indiceBalanceSeleccionado != null) {
        balances[indiceBalanceSeleccionado] = balanceActualizado;
      } else {
        balances.unshift(balanceActualizado);
      }

      return {
        ...anterior,
        balances,
      };
    });

    setIndiceBalanceSeleccionado(null);
    setEstaAbiertoModalBalance(false);
  };

  const guardarDetalleCuentasBalance = (
    detalleCuentas: NonNullable<RegistroBalanceAnalista["detalleCuentas"]>,
  ) => {
    if (indiceBalanceSeleccionado == null) return;

    setDatosInvestigacion((anterior) => {
      const balances = [...anterior.balances];
      const balance = balances[indiceBalanceSeleccionado];

      if (!balance) {
        return anterior;
      }

      balances[indiceBalanceSeleccionado] = {
        ...balance,
        cuentas: true,
        detalleCuentas,
      };

      return {
        ...anterior,
        balances,
      };
    });

    setEstaAbiertoModalDetalleBalance(false);
  };

  const guardarProveedor = (registro: RegistroProveedorAnalista) => {
    setDatosInvestigacion((anterior) => {
      const proveedores = [...anterior.proveedores];
      if (indiceProveedorSeleccionado != null) {
        proveedores[indiceProveedorSeleccionado] = registro;
      } else {
        proveedores.unshift(registro);
      }

      return {
        ...anterior,
        proveedores,
      };
    });

    setIndiceProveedorSeleccionado(null);
    setEstaAbiertoModalProveedor(false);
  };

  const guardarBanco = (registro: RegistroBancoAnalista) => {
    setDatosInvestigacion((anterior) => {
      const bancos = [...anterior.bancos];
      if (indiceBancoSeleccionado != null) {
        const idInformeBancoExistente = bancos[indiceBancoSeleccionado]?.idInformeBanco;
        bancos[indiceBancoSeleccionado] = registro;
        bancos[indiceBancoSeleccionado].idInformeBanco = registro.idInformeBanco ?? idInformeBancoExistente;
      } else {
        bancos.unshift(registro);
      }

      return {
        ...anterior,
        bancos,
      };
    });

    setIndiceBancoSeleccionado(null);
    setEstaAbiertoModalBanco(false);
  };

  const eliminarOperacionSeleccionada = () => {
    if (pestanaRamoOperacionesVisible === "locales") {
      if (indiceLocalSeleccionado == null) return;
      setDatosInvestigacion((anterior) => ({
        ...anterior,
        locales: anterior.locales.filter((_, indice) => indice !== indiceLocalSeleccionado),
      }));
      setIndiceLocalSeleccionado(null);
      return;
    }

    if (indiceOperacionSeleccionada == null) return;

    setDatosInvestigacion((anterior) => {
      const clave = pestanaRamoOperacionesVisible === "importaciones" ? "importaciones" : "exportaciones";
      return {
        ...anterior,
        [clave]: anterior[clave].filter((_, indice) => indice !== indiceOperacionSeleccionada),
      };
    });
    setIndiceOperacionSeleccionada(null);
  };

  const balancesFiltrados = datosInvestigacion.balances.filter((balance) => {
    const termino = busquedaBalances.trim().toLowerCase();
    if (!termino) return true;

    return [
      balance.codigo,
      balance.periodo,
      balance.fecha,
      balance.tipo,
    ].some((valor) => valor.toLowerCase().includes(termino));
  });

  const proveedoresFiltrados = datosInvestigacion.proveedores.filter((proveedor) => {
    const coincideNombre = !filtroProveedorNombre.trim() || proveedor.nombreEmpresa.toLowerCase().includes(filtroProveedorNombre.trim().toLowerCase());
    const coincideTipo = filtroProveedorTipo === "Todos" || proveedor.tipoProveedor === filtroProveedorTipo;
    const coincideContacto = !filtroProveedorContacto.trim() || proveedor.contacto.toLowerCase().includes(filtroProveedorContacto.trim().toLowerCase());
    const coincideTelefono = !filtroProveedorTelefono.trim() || proveedor.telefono.toLowerCase().includes(filtroProveedorTelefono.trim().toLowerCase());

    return coincideNombre && coincideTipo && coincideContacto && coincideTelefono;
  });

  const bancosFiltrados = datosInvestigacion.bancos.filter((banco) => {
    const coincideNombre = !filtroBancoNombre.trim() || banco.banco.toLowerCase().includes(filtroBancoNombre.trim().toLowerCase());
    const coincideCuenta = !filtroBancoCuenta.trim() || banco.numeroCuenta.toLowerCase().includes(filtroBancoCuenta.trim().toLowerCase());
    const coincideTelefono = !filtroBancoTelefono.trim() || banco.telefono.toLowerCase().includes(filtroBancoTelefono.trim().toLowerCase());
    const sectorBanco = banco.sector || opcionesSectorEconomico?.find((opcion) => opcion.num1 === banco.idSector)?.string1 || "";
    const sectoresSeleccionados = (opcionesSectorEconomico ?? [])
      .filter((opcion) => opcion.num1 != null && idsFiltroBancoSector.includes(opcion.num1))
      .map((opcion) => opcion.string1?.toLowerCase() ?? "")
      .filter(Boolean);
    const coincideSector = sectoresSeleccionados.length === 0
      || sectoresSeleccionados.some((sectorSeleccionado) => sectorBanco.toLowerCase() === sectorSeleccionado);

    return coincideNombre && coincideCuenta && coincideTelefono && coincideSector;
  });

  const exportacionesHabilitadas = esPorcentajeMayorACero(datosInvestigacion.operacionPrincipal.ventasExtranjeroPorcentaje);
  const importacionesHabilitadas =
    esPorcentajeMayorACero(datosInvestigacion.operacionPrincipal.comprasContadoInternacionalesPorcentaje) ||
    esPorcentajeMayorACero(datosInvestigacion.operacionPrincipal.comprasCreditoInternacionalesPorcentaje);

  const irASeccion = (direccion: "anterior" | "siguiente") => {
    const nuevoIndice = direccion === "anterior" ? indiceSeccionActiva - 1 : indiceSeccionActiva + 1;
    const seccionDestino = seccionesInvestigacionAnalista[nuevoIndice];
    if (seccionDestino) {
      if (direccion === "siguiente") {
        setEstadoSecciones((anterior) => ({
          ...anterior,
          [idSeccionActiva]: "completado",
        }));
      }
      setIdSeccionActiva(seccionDestino.id);
      requestAnimationFrame(() => {
        const contenedorPrincipal = document.querySelector("main");
        if (contenedorPrincipal instanceof HTMLElement) {
          contenedorPrincipal.scrollTo({ top: 0, behavior: "smooth" });
        }
        contenedorPantallaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  const guardarEjecutivo = (registro: Omit<RegistroDirectorioEjecutivoAnalista, "id">) => {
    const porcentajeRegistro = obtenerPorcentajeNumerico(registro.porcentaje);
    const directorioActual = datosInvestigacion.directorioEjecutivo;
    const indiceOtros = directorioActual.findIndex((ejecutivo) => ejecutivo.nombreCompleto === "Otros");
    const indiceRegistroActual = indiceEjecutivoSeleccionado;
    const esEdicionDeOtros = indiceRegistroActual != null && directorioActual[indiceRegistroActual]?.nombreCompleto === "Otros";

    const totalSinOtrosNiRegistroActual = directorioActual.reduce((total, ejecutivo, indice) => {
      if (indice === indiceOtros) {
        return total;
      }
      if (indiceRegistroActual != null && indice === indiceRegistroActual) {
        return total;
      }
      return total + obtenerPorcentajeNumerico(ejecutivo.porcentaje);
    }, 0);

    const tieneOtrosDisponible = indiceOtros >= 0 && !esEdicionDeOtros;
    const nuevoPorcentajeOtros = tieneOtrosDisponible
      ? 100 - totalSinOtrosNiRegistroActual - porcentajeRegistro
      : 0;

    if (tieneOtrosDisponible && nuevoPorcentajeOtros < 0) {
      toast.error("El porcentaje de 'Otros' no alcanza para ajustar este ejecutivo.");
      return;
    }

    if (!tieneOtrosDisponible) {
      const totalSinRegistroActual = directorioActual.reduce((total, ejecutivo, indice) => {
        if (indiceRegistroActual != null && indice === indiceRegistroActual) {
          return total;
        }
        return total + obtenerPorcentajeNumerico(ejecutivo.porcentaje);
      }, 0);

      if (totalSinRegistroActual + porcentajeRegistro > 100) {
        toast.error("La suma del porcentaje de participación no puede ser mayor a 100.");
        return;
      }
    }

    setDatosInvestigacion((anterior) => {
      const directorioEjecutivo = [...anterior.directorioEjecutivo];

      if (indiceRegistroActual != null) {
        directorioEjecutivo[indiceRegistroActual] = {
          ...directorioEjecutivo[indiceRegistroActual],
          ...registro,
        };
      } else {
        const idDirectorioEjecutivo = registro.idDirectorioEjecutivo;
        directorioEjecutivo.unshift({
          id: idDirectorioEjecutivo ?? Date.now(),
          ...registro,
          idDirectorioEjecutivo,
          orden: String(directorioEjecutivo.length + 1),
        });
      }

      if (tieneOtrosDisponible && indiceOtros >= 0) {
        directorioEjecutivo[indiceOtros] = {
          ...directorioEjecutivo[indiceOtros],
          porcentaje: formatearPorcentajeOchoDecimales(nuevoPorcentajeOtros),
        };
      }

      return {
        ...anterior,
        directorioEjecutivo,
      };
    });

    setIndiceEjecutivoSeleccionado(null);
    setPersonaDirectorioSeleccionada(null);
    setEstaAbiertoModalEjecutivo(false);
  };

  const completarPorcentajeEjecutivos = () => {
    if (datosInvestigacion.directorioEjecutivo.length === 0 || porcentajeRestanteEjecutivos <= 0) {
      return;
    }

    setDatosInvestigacion((anterior) => {
      const directorioEjecutivo = anterior.directorioEjecutivo.filter((ejecutivo) => ejecutivo.nombreCompleto !== "Otros");
      directorioEjecutivo.unshift({
        id: Date.now(),
        ejecutivo: "Otros",
        cargo: "-",
        porcentaje: formatearPorcentajeOchoDecimales(porcentajeRestanteEjecutivos),
        lista: false,
        detalleEjecutivo: false,
        orden: String(directorioEjecutivo.length + 1),
        vinculadoDesde: "",
        companiaAnterior: "",
        esParteDirectorio: false,
        pais: "",
        tipoPersona: "",
        descripcionBusqueda: "Otros",
        nombreCompleto: "Otros",
      });

      return {
        ...anterior,
        directorioEjecutivo,
      };
    });
  };

  const guardarPersonaDirectorio = (registro: RegistroPersonaDirectorioAnalista) => {
    const nuevoRegistro = {
      ...registro,
      id: registro.id || registro.idDirectorioEjecutivo || Date.now(),
      idDirectorioEjecutivo: registro.idDirectorioEjecutivo || registro.id,
    };

    setRegistrosPersonaDirectorio((anterior) => [nuevoRegistro, ...anterior]);
    if (indiceEjecutivoExtraccionBusqueda != null) {
      setEjecutivosExtraccionPendientes((anteriores) =>
        anteriores.map((ejecutivo, indice) => (
          indice === indiceEjecutivoExtraccionBusqueda
            ? {
                ...ejecutivo,
                idDirectorioEjecutivo: nuevoRegistro.idDirectorioEjecutivo,
                ejecutivo: nuevoRegistro.nombres,
                nombreCompleto: nuevoRegistro.nombres,
                pais: nuevoRegistro.pais,
                tipoPersona: nuevoRegistro.tipoPersona,
                descripcionBusqueda: nuevoRegistro.nombres,
              }
            : ejecutivo
        )),
      );
      setEstaAbiertoModalRegistroPersona(false);
      setEstaAbiertoModalBuscarEjecutivo(false);
      setIndiceEjecutivoExtraccionBusqueda(null);
      return;
    }
    setPersonaDirectorioSeleccionada(nuevoRegistro);
    setEstaAbiertoModalRegistroPersona(false);
    setEstaAbiertoModalBuscarEjecutivo(false);
    setEstaAbiertoModalEjecutivo(true);
  };

  const ejecutivosFiltrados = datosInvestigacion.directorioEjecutivo.filter((ejecutivo) => {
    const termino = busquedaEjecutivo.trim().toLowerCase();
    if (!termino) return true;

    return [
      ejecutivo.ejecutivo,
      ejecutivo.cargo,
      obtenerTextoPorId(opcionesCargoDirectorio, ejecutivo.idCargo),
      ejecutivo.nombreCompleto,
      ejecutivo.descripcionBusqueda,
    ].some((valor) => valor.toLowerCase().includes(termino));
  });

  const companiasPaginadas = paginarRegistros(
    datosInvestigacion.companiasRelacionadas,
    Math.min(paginaCompanias, obtenerTotalPaginas(datosInvestigacion.companiasRelacionadas.length)),
  );
  const registrosLocalesPaginados = paginarRegistros(
    datosInvestigacion.locales,
    Math.min(paginaOperaciones, obtenerTotalPaginas(datosInvestigacion.locales.length)),
  );
  const registrosImportacionExportacionTabla = pestanaRamoOperacionesVisible === "importaciones"
    ? datosInvestigacion.importaciones
    : pestanaRamoOperacionesVisible === "exportaciones"
      ? datosInvestigacion.exportaciones
      : [];
  const registrosImportacionExportacionPaginados = paginarRegistros(
    registrosImportacionExportacionTabla,
    Math.min(paginaOperaciones, obtenerTotalPaginas(registrosImportacionExportacionTabla.length)),
  );
  const balancesPaginados = paginarRegistros(
    balancesFiltrados,
    Math.min(paginaBalances, obtenerTotalPaginas(balancesFiltrados.length)),
  );
  const proveedoresPaginados = paginarRegistros(
    proveedoresFiltrados,
    Math.min(paginaProveedores, obtenerTotalPaginas(proveedoresFiltrados.length)),
  );
  const bancosPaginados = paginarRegistros(
    bancosFiltrados,
    Math.min(paginaBancos, obtenerTotalPaginas(bancosFiltrados.length)),
  );
  const ejecutivosPaginados = paginarRegistros(
    ejecutivosFiltrados,
    Math.min(paginaEjecutivos, obtenerTotalPaginas(ejecutivosFiltrados.length)),
  );
  const totalPorcentajeEjecutivos = datosInvestigacion.directorioEjecutivo.reduce(
    (total, ejecutivo) => total + obtenerPorcentajeNumerico(ejecutivo.porcentaje),
    0,
  );
  const porcentajeRestanteEjecutivos = Math.max(0, 100 - totalPorcentajeEjecutivos);
  const seccionesDisponiblesExtraccion = useMemo(
    () => construirSeccionesDisponiblesExtraccion(alcanceExtraccionInformacion),
    [alcanceExtraccionInformacion],
  );
  const abrirModalExtraccionInformacion = (
    alcance: AlcanceExtraccionInforme,
    tituloSeccion?: string,
  ) => {
    setAlcanceExtraccionInformacion(alcance);
    setTituloSeccionExtraccion(tituloSeccion ?? "");
    setEstaAbiertoModalExtraccionInformacion(true);
  };

  const reiniciarPendientesExtraccion = (configuracion: InformeConfiguracionExtraccion) => {
    if (configuracion.legales) {
      setCompaniasExtraccionPendientes([]);
      setIndiceCompaniaExtraccionEdicion(null);
      setEstaAbiertoModalRevisionCompaniasExtraccion(false);
    }

    if (configuracion.directorioEjecutivo) {
      setEjecutivosExtraccionPendientes([]);
      setIndiceEjecutivoExtraccionEdicion(null);
      setIndiceEjecutivoExtraccionAprobacion(null);
      setIndiceEjecutivoExtraccionBusqueda(null);
      setEstaAbiertoModalRevisionEjecutivosExtraccion(false);
    }

    if (configuracion.bancosProveedores || configuracion.bancos) {
      setBancosExtraccionPendientes([]);
      setColaExistentesExtraccion([]);
      setIndiceBancoExtraccionEdicion(null);
      setBancoRecienCreado(null);
      setEstaAbiertoModalRevisionBancosExtraccion(false);
    }
  };

  const extraerInformacionDocumento = async (
    archivos: File[],
    alcance: AlcanceExtraccionInforme,
    especificaciones: string,
    configuracionSecciones: InformeConfiguracionExtraccion,
  ) => {
    if (archivos.length === 0) return;

    const promptBase = alcance === "general"
      ? "Extrae la mayor cantidad posible de informacion util del documento y responde unicamente con las secciones solicitadas."
      : `Extrae unicamente la informacion necesaria para completar la seccion ${tituloSeccionExtraccion || "solicitada"} y responde solo con esa estructura.`;
    const prompt = especificaciones.trim()
      ? `${promptBase} Considera tambien estas indicaciones del usuario: ${especificaciones.trim()}`
      : promptBase;
    const toastId = toast.loading(
      alcance === "general"
        ? "Extrayendo información del documento..."
        : `Extrayendo información de ${tituloSeccionExtraccion || "la sección"}...`,
    );

    try {
      paisExtraccionRef.current = { aplicado: false };
      asignarCiudadExtraccionPendiente(null, false);
      reiniciarPendientesExtraccion(configuracionSecciones);
      const totalArchivos = archivos.length;

      for (const [indiceArchivo, archivo] of archivos.entries()) {
        const etiquetaArchivo = totalArchivos > 1
          ? ` (${indiceArchivo + 1}/${totalArchivos})`
          : "";
        const mimeType = archivo.type || "application/octet-stream";

        toast.loading(`Preparando archivo${etiquetaArchivo}...`, { id: toastId });
        const { uploadUrl, fileKey } = await informeService.obtenerUrlPrefirmada({
          fileName: archivo.name,
          mimeType,
        });

        toast.loading(`Subiendo archivo${etiquetaArchivo}...`, { id: toastId });
        await informeService.subirArchivoUrlPrefirmada(uploadUrl, archivo);

        toast.loading(`Procesando información${etiquetaArchivo}...`, { id: toastId });
        const respuestaExtraccion = await informeService.autocompletar({
          fileKey,
          mimeType,
          secciones: configuracionSecciones,
          prompt,
        });

        const camposExtraidos = respuestaExtraccion.camposExtraidos
          ?? respuestaExtraccion.extractedFields
          ?? respuestaExtraccion.secciones
          ?? respuestaExtraccion.result;

        if (!camposExtraidos) continue;

        Object.entries(configuracionSecciones).forEach(([claveSeccion]) => {
          if (claveSeccion === "legales") {
            const campos = camposExtraidos as Record<string, unknown>;
            aplicarResultadosLegalesExtraccion(campos[claveSeccion] ?? campos.companiasRelacionadas);
            return;
          }

          if (claveSeccion === "ramoOperaciones") {
            const campos = camposExtraidos as Record<string, unknown>;
            aplicarResultadosRamoOperacionesExtraccion(campos[claveSeccion] ?? campos.operacionPrincipal);
            return;
          }

          if (claveSeccion === "bancosProveedores") {
            const campos = camposExtraidos as Record<string, unknown>;
            aplicarResultadosBancosProveedoresExtraccion(campos[claveSeccion] ?? campos);
            return;
          }

          if (claveSeccion === "directorioEjecutivo") {
            aplicarDirectorioEjecutivoExtraccion((camposExtraidos as Record<string, unknown>)[claveSeccion]);
            return;
          }

          if (claveSeccion === "bancos") {
            aplicarBancosExtraccion((camposExtraidos as Record<string, unknown>)[claveSeccion]);
            return;
          }

          const seccionActualDatos = (datosInvestigacion as unknown as Record<string, unknown>)[claveSeccion];
          const seccionExtraida = (camposExtraidos as Record<string, unknown>)[claveSeccion];
          if (seccionActualDatos === undefined || seccionExtraida === undefined) return;
          aplicarResultadosExtraccion(seccionActualDatos, seccionExtraida, [claveSeccion]);
        });
      }

      toast.dismiss(toastId);
    } catch (error) {
      toast.error("No se pudo extraer la información del documento.", { id: toastId });
      throw error;
    }
  };

  const permiteExtraccionSeccion = idSeccionActiva !== "balances";

  const botonExtraSeccion = !esSoloLectura && permiteExtraccionSeccion ? (
    <CustomButton
      variant="secondary"
      size="sm"
      className="border-blue-300 text-blue-600"
      onClick={() => abrirModalExtraccionInformacion(idSeccionActiva, seccionActual.titulo)}
    >
      <Sparkles size={14} />
      Extraer Información
    </CustomButton>
  ) : undefined;

  const renderizarIdentificacion = () => (
    <div className="grid gap-5 md:grid-cols-2">
      <CustomSelectorBuscable
        label={<span className="inline-flex items-center gap-2"><span>Tipo de Persona</span>{obtenerIndicadorCambioExtraccion("identificacion.tipoPersona")}</span>}
        options={opcionesTipoPersona}
        value={idTipoPersonaSeleccionado}
        displayValue={idTipoPersonaSeleccionado == null ? datosInvestigacion.identificacion.tipoPersona : undefined}
        onChange={(valor) => {
          setIdTipoPersonaSeleccionado(valor);
          const etiqueta = opcionesTipoPersona?.find((opcion) => opcion.num1 === valor)?.string1 ?? "";
          actualizarIdentificacion("tipoPersona", etiqueta);
        }}
        onClear={() => {
          setIdTipoPersonaSeleccionado(undefined);
          actualizarIdentificacion("tipoPersona", "");
        }}
        optional
        mostrarTextoOpcionalEnLabel={false}
        disabled={esSoloLectura}
      />
      <CampoInvestigacionAnalista etiqueta="Nombre de la Empresa" valor={datosInvestigacion.identificacion.nombreEmpresa} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("identificacion.nombreEmpresa")} onChange={(valor) => actualizarIdentificacion("nombreEmpresa", valor)} />
      <CampoInvestigacionAnalista etiqueta="Nombre Comercial" valor={datosInvestigacion.identificacion.nombreComercial} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("identificacion.nombreComercial")} onChange={(valor) => actualizarIdentificacion("nombreComercial", valor)} />
      <CustomSelectorBuscable
        label={<span className="inline-flex items-center gap-2"><span>País</span>{obtenerIndicadorCambioExtraccion("identificacion.pais")}</span>}
        options={opcionesPais}
        value={idPaisSeleccionado}
        displayValue={idPaisSeleccionado == null ? datosInvestigacion.identificacion.pais : undefined}
        onChange={(valor) => {
          setIdPaisSeleccionado(valor);
          const etiqueta = opcionesPais?.find((opcion) => opcion.num1 === valor)?.string1 ?? "";
          setDatosInvestigacion((anterior) => ({
            ...anterior,
            identificacion: {
              ...anterior.identificacion,
              pais: etiqueta,
              ciudadEstadoProvincia: "",
            },
          }));
        }}
        onClear={() => {
          setIdPaisSeleccionado(undefined);
          setDatosInvestigacion((anterior) => ({
            ...anterior,
            identificacion: {
              ...anterior.identificacion,
              pais: "",
              ciudadEstadoProvincia: "",
            },
          }));
        }}
        optional
        mostrarTextoOpcionalEnLabel={false}
        disabled={esSoloLectura}
      />
      <SelectorMaestroConAltaInvestigacionAnalista
        etiqueta="Tipo de Identificación Fiscal"
        valor={datosInvestigacion.identificacion.tipoIdentificacionFiscal}
        soloLectura={esSoloLectura}
        opcionesTablaMaestra={opcionesTipoRegTributario}
        idMaestro={TablaMaestraId.TIPO_REG_TRIBUTARIO}
        marcador="Seleccione tipo de identificacion fiscal"
        adicionalEtiqueta={obtenerIndicadorCambioExtraccion("identificacion.tipoIdentificacionFiscal")}
        onChange={(valor) => actualizarIdentificacion("tipoIdentificacionFiscal", valor)}
      />
      <CampoInvestigacionAnalista etiqueta="Número de Identificación Fiscal" valor={datosInvestigacion.identificacion.numeroIdentificacionFiscal} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("identificacion.numeroIdentificacionFiscal")} onChange={(valor) => actualizarIdentificacion("numeroIdentificacionFiscal", valor)} />
      <CampoInvestigacionAnalista etiqueta="Dirección Principal" valor={datosInvestigacion.identificacion.direccionPrincipal} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("identificacion.direccionPrincipal")} onChange={(valor) => actualizarIdentificacion("direccionPrincipal", valor)} />
      <SelectorMaestroConAltaInvestigacionAnalista
        etiqueta="Ciudad/Estado/Provincia"
        valor={datosInvestigacion.identificacion.ciudadEstadoProvincia}
        soloLectura={esSoloLectura}
        opcionesTablaMaestra={opcionesCiudadIdentificacion}
        idMaestro={TablaMaestraId.CIUDAD}
        permiteAltaNueva
        num2AltaNueva={idPaisSeleccionado ?? null}
        conservarOpcionesLocales={false}
        marcador="Seleccione o agregue ciudad/estado/provincia"
        adicionalEtiqueta={obtenerIndicadorCambioExtraccion("identificacion.ciudadEstadoProvincia")}
        onChange={(valor) => actualizarIdentificacion("ciudadEstadoProvincia", valor)}
      />
      <CampoInvestigacionAnalista etiqueta="Número de Teléfono" valor={datosInvestigacion.identificacion.numeroTelefono} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("identificacion.numeroTelefono")} onChange={(valor) => actualizarIdentificacion("numeroTelefono", valor)} />
      <CampoInvestigacionAnalista etiqueta="Número de Fax" valor={datosInvestigacion.identificacion.numeroFax} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("identificacion.numeroFax")} onChange={(valor) => actualizarIdentificacion("numeroFax", valor)} />
      <CampoInvestigacionAnalista etiqueta="Correo Electrónico" valor={datosInvestigacion.identificacion.correoElectronico} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("identificacion.correoElectronico")} onChange={(valor) => actualizarIdentificacion("correoElectronico", valor)} />
      <CampoInvestigacionAnalista etiqueta="Página Web" valor={datosInvestigacion.identificacion.paginaWeb} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("identificacion.paginaWeb")} onChange={(valor) => actualizarIdentificacion("paginaWeb", valor)} />
      <SelectorMaestroConAltaInvestigacionAnalista
        etiqueta="Estado Actual"
        valor={datosInvestigacion.identificacion.estadoActual}
        soloLectura={esSoloLectura}
        opcionesTablaMaestra={opcionesEstadoCliente}
        idMaestro={TablaMaestraId.ESTADO_CLIENTE}
        permiteAltaNueva
        marcador="Seleccione o agregue estado actual"
        adicionalEtiqueta={obtenerIndicadorCambioExtraccion("identificacion.estadoActual")}
        onChange={(valor) => actualizarIdentificacion("estadoActual", valor)}
      />
      <AreaInvestigacionAnalista etiqueta="Datos Adicionales" valor={datosInvestigacion.identificacion.datosAdicionales} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("identificacion.datosAdicionales")} className="md:col-span-2" onChange={(valor) => actualizarIdentificacion("datosAdicionales", valor)} />
    </div>
  );

  const renderizarAspectosLegales = () => {
    if (pestanaAspectosLegales === "companias") {
      return (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative w-full max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input className="h-10 w-full rounded-xl border border-gray-200 pl-9 pr-3 text-sm text-slate-500 outline-none" placeholder="Buscar compañía..." />
            </label>
            <div className="flex flex-wrap gap-2">
              {companiasExtraccionPendientes.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setEstaAbiertoModalRevisionCompaniasExtraccion(true)}
                  className="rounded-xl border border-brand-wine/30 px-4 py-2 text-sm font-bold text-brand-wine transition-all hover:bg-brand-wine/5"
                >
                  Revisar detectadas ({companiasExtraccionPendientes.length})
                </button>
              ) : null}
              <button
                type="button"
                disabled={esSoloLectura}
                onClick={() => setEstaAbiertoModalCompanias(true)}
                className="rounded-xl bg-brand-black px-4 py-2 text-sm font-bold text-white transition-all hover:scale-[1.02] hover:bg-brand-black/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                + Agregar Compañía
              </button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="min-w-[720px] w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
                <tr>
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">ID Fiscal</th>
                  <th className="px-4 py-3">País</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {companiasPaginadas.map((empresa, indicePagina) => {
                  const indiceReal = (paginaCompanias - 1) * FILAS_POR_PAGINA_INVESTIGACION + indicePagina;
                  return (
                  <tr key={`${empresa.idCompania ?? empresa.empresa}-${empresa.idFiscal}`} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-4 text-sm font-semibold text-slate-700">{empresa.empresa}</td>
                    <td className="px-4 py-4 text-sm text-slate-400">{empresa.idFiscal}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{empresa.pais}</td>
                    <td className="px-4 py-4 text-right text-slate-400">
                      <button
                        type="button"
                        disabled={esSoloLectura}
                        onClick={() => setIndiceCompaniaAEliminar(indiceReal)}
                        className="ml-auto inline-flex text-red-600 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:text-slate-300"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <PaginacionInvestigacion
            paginaActual={paginaCompanias}
            totalRegistros={datosInvestigacion.companiasRelacionadas.length}
            onPaginaChange={setPaginaCompanias}
            etiquetaRegistros="companias"
          />
        </div>
      );
    }

    const isoOperacionesCambioDivisas = opcionesMoneda?.find(
      (opcion) =>
        opcion.string1 === datosInvestigacion.aspectosLegales.operacionesCambioDivisas
        || String(opcion.num1 ?? "") === datosInvestigacion.aspectosLegales.operacionesCambioDivisas,
    )?.string2?.trim() ?? "";
    const opcionMonedaTipoCambioSeleccionada = opcionesMoneda?.find(
      (opcion) =>
        opcion.string1 === datosInvestigacion.aspectosLegales.monedaTipoCambio
        || String(opcion.num1 ?? "") === datosInvestigacion.aspectosLegales.monedaTipoCambio,
    );

    return (
      <div className="grid gap-5 md:grid-cols-2">
        <SelectorMaestroConAltaInvestigacionAnalista
          etiqueta="Tipo de Empresa"
          valor={datosInvestigacion.aspectosLegales.tipoEmpresa}
          soloLectura={esSoloLectura}
          opcionesTablaMaestra={opcionesTipoEmpresa}
          idMaestro={TablaMaestraId.TIPO_EMPRESA}
          permiteAltaNueva
          marcador="Seleccione tipo de empresa"
          adicionalEtiqueta={obtenerIndicadorCambioExtraccion("aspectosLegales.tipoEmpresa")}
          onChange={(valor) => actualizarAspectosLegales("tipoEmpresa", valor)}
        />
        <CampoInvestigacionAnalista
          etiqueta="Fecha de Constitucion"
          valor={datosInvestigacion.aspectosLegales.fechaConstitucion}
          soloLectura={esSoloLectura}
          tipoEntrada="fecha"
          adicionalEtiqueta={obtenerIndicadorCambioExtraccion("aspectosLegales.fechaConstitucion")}
          onChange={(valor) => actualizarAspectosLegales("fechaConstitucion", valor)}
        />
        <SelectorMaestroConAltaInvestigacionAnalista
          etiqueta="Ciudad de Registro"
          valor={datosInvestigacion.aspectosLegales.ciudadRegistro}
          soloLectura={esSoloLectura}
          opcionesTablaMaestra={opcionesCiudad}
          idMaestro={TablaMaestraId.CIUDAD}
          permiteAltaNueva
          marcador="Seleccione ciudad de registro"
          adicionalEtiqueta={obtenerIndicadorCambioExtraccion("aspectosLegales.ciudadRegistro")}
          onChange={(valor) => actualizarAspectosLegales("ciudadRegistro", valor)}
        />
        <CampoInvestigacionAnalista etiqueta="Notaría" valor={datosInvestigacion.aspectosLegales.notaria} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("aspectosLegales.notaria")} onChange={(valor) => actualizarAspectosLegales("notaria", valor)} />
        <CampoInvestigacionAnalista etiqueta="Notario" valor={datosInvestigacion.aspectosLegales.notario} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("aspectosLegales.notario")} onChange={(valor) => actualizarAspectosLegales("notario", valor)} />
        <CampoInvestigacionAnalista etiqueta="Registro" valor={datosInvestigacion.aspectosLegales.registro} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("aspectosLegales.registro")} onChange={(valor) => actualizarAspectosLegales("registro", valor)} />
        <CampoInvestigacionAnalista etiqueta="Condiciones" valor={datosInvestigacion.aspectosLegales.condiciones} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("aspectosLegales.condiciones")} onChange={(valor) => actualizarAspectosLegales("condiciones", valor)} />
        <SelectorMaestroConAltaInvestigacionAnalista
          etiqueta="Operaciones de Cambio Divisas"
          valor={datosInvestigacion.aspectosLegales.operacionesCambioDivisas === "0" ? "" : datosInvestigacion.aspectosLegales.operacionesCambioDivisas}
          soloLectura={esSoloLectura}
          opcionesTablaMaestra={opcionesMoneda}
          marcador="Seleccione moneda"
          obtenerValorOpcion={(opcion) => String(opcion.num1 ?? "")}
          adicionalEtiqueta={obtenerIndicadorCambioExtraccion("aspectosLegales.operacionesCambioDivisas")}
          onChange={(valor) => actualizarAspectosLegales("operacionesCambioDivisas", valor)}
        />
        <CampoInvestigacionAnalista etiqueta="Capital Inicial" valor={datosInvestigacion.aspectosLegales.capitalInicial} soloLectura={esSoloLectura} tipoEntrada="decimal" adornoFinal={isoOperacionesCambioDivisas} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("aspectosLegales.capitalInicial")} onChange={(valor) => actualizarAspectosLegales("capitalInicial", valor)} />
        <CampoInvestigacionAnalista etiqueta="Capital Desembolsado" valor={datosInvestigacion.aspectosLegales.capitalDesembolsado} soloLectura={esSoloLectura} tipoEntrada="decimal" adornoFinal={isoOperacionesCambioDivisas} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("aspectosLegales.capitalDesembolsado")} onChange={(valor) => actualizarAspectosLegales("capitalDesembolsado", valor)} />
        <CampoInvestigacionAnalista etiqueta="Última Ampliación" valor={datosInvestigacion.aspectosLegales.ultimaAmpliacion} soloLectura={esSoloLectura} tipoEntrada="fecha" adicionalEtiqueta={obtenerIndicadorCambioExtraccion("aspectosLegales.ultimaAmpliacion")} onChange={(valor) => actualizarAspectosLegales("ultimaAmpliacion", valor)} />
        <CampoInvestigacionAnalista etiqueta="Patrimonio Neto" valor={datosInvestigacion.aspectosLegales.patrimonioNeto} soloLectura={esSoloLectura} tipoEntrada="decimal" adornoFinal={isoOperacionesCambioDivisas} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("aspectosLegales.patrimonioNeto")} onChange={(valor) => actualizarAspectosLegales("patrimonioNeto", valor)} />
        <CampoInvestigacionAnalista etiqueta="Tipo de Acciones" valor={datosInvestigacion.aspectosLegales.tipoAcciones} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("aspectosLegales.tipoAcciones")} onChange={(valor) => actualizarAspectosLegales("tipoAcciones", valor)} />
        <CampoInvestigacionAnalista etiqueta="Valor de las Acciones" valor={datosInvestigacion.aspectosLegales.valorAcciones} soloLectura={esSoloLectura} tipoEntrada="decimal" adornoFinal={isoOperacionesCambioDivisas} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("aspectosLegales.valorAcciones")} onChange={(valor) => actualizarAspectosLegales("valorAcciones", valor)} />
        <CustomSelectorBuscable
          label={<span className="inline-flex items-center gap-2"><span>Obligación en Bolsa</span>{obtenerIndicadorCambioExtraccion("aspectosLegales.obligacionBolsa")}</span>}
          options={opcionesBooleanasBolsa}
          value={obtenerIdObligacionBolsa(datosInvestigacion.aspectosLegales.obligacionBolsa)}
          displayValue={obtenerTextoObligacionBolsa(datosInvestigacion.aspectosLegales.obligacionBolsa)}
          onChange={(valor) => actualizarAspectosLegales("obligacionBolsa", valor === 1 ? "true" : "false")}
          onClear={() => actualizarAspectosLegales("obligacionBolsa", "")}
          optional
          mostrarTextoOpcionalEnLabel={false}
          placeholder="Seleccione valor"
          disabled={esSoloLectura}
        />
        <div className="space-y-2">
          <CustomLabel as="p" className="text-sm font-bold text-gray-700">
            <span className="inline-flex items-center gap-2">
              <span>Tipo de Cambio</span>
              {obtenerIndicadorCambioExtraccion("aspectosLegales.monedaTipoCambio")}
              {obtenerIndicadorCambioExtraccion("aspectosLegales.tipoCambio")}
            </span>
          </CustomLabel>
          <div className="grid gap-3 md:grid-cols-[190px_minmax(0,1fr)]">
            <CustomSelectorBuscable
              options={opcionesMoneda}
              value={opcionMonedaTipoCambioSeleccionada?.num1 ?? undefined}
              displayValue={
                opcionMonedaTipoCambioSeleccionada?.string1
                ?? (datosInvestigacion.aspectosLegales.monedaTipoCambio === "0" ? "" : datosInvestigacion.aspectosLegales.monedaTipoCambio)
              }
              onChange={(valor) => actualizarAspectosLegales("monedaTipoCambio", String(valor))}
              onClear={() => actualizarAspectosLegales("monedaTipoCambio", "")}
              optional
              mostrarTextoOpcionalEnLabel={false}
              disabled={esSoloLectura}
              placeholder="Seleccione moneda"
            />
            <div className="relative">
              <input
                value={datosInvestigacion.aspectosLegales.tipoCambio}
                readOnly={esSoloLectura}
                onChange={(event) => actualizarAspectosLegales("tipoCambio", sanitizarMontoDecimales(event.target.value, 6))}
                onBlur={(event) => actualizarAspectosLegales("tipoCambio", normalizarMontoDecimales(event.target.value, 6))}
                onFocus={seleccionarTextoCampoEditable}
                placeholder="0.000000"
                className={`h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5 read-only:bg-slate-50 read-only:text-slate-400 ${isoOperacionesCambioDivisas ? "pr-20" : ""}`}
              />
              {isoOperacionesCambioDivisas ? (
                <span className="pointer-events-none absolute right-2 top-1/2 flex h-7 -translate-y-1/2 items-center rounded-md bg-slate-900 px-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
                  {isoOperacionesCambioDivisas}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <AreaInvestigacionAnalista etiqueta="Antecedentes" valor={datosInvestigacion.aspectosLegales.antecedentes} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("aspectosLegales.antecedentes")} className="md:col-span-2" onChange={(valor) => actualizarAspectosLegales("antecedentes", valor)} />
        <AreaInvestigacionAnalista etiqueta="Aspectos Legales" valor={datosInvestigacion.aspectosLegales.aspectosLegales} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("aspectosLegales.aspectosLegales")} className="md:col-span-2" onChange={(valor) => actualizarAspectosLegales("aspectosLegales", valor)} />
        <AreaInvestigacionAnalista etiqueta="Comentarios sobre Empresas Relacionadas" valor={datosInvestigacion.aspectosLegales.comentariosEmpresasRelacionadas} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("aspectosLegales.comentariosEmpresasRelacionadas")} className="md:col-span-2" onChange={(valor) => actualizarAspectosLegales("comentariosEmpresasRelacionadas", valor)} />
      </div>
    );
  };

  const renderizarRamoOperaciones = () => {
    if (pestanaRamoOperacionesVisible === "importaciones" || pestanaRamoOperacionesVisible === "exportaciones" || pestanaRamoOperacionesVisible === "locales") {
      const tituloBoton = pestanaRamoOperacionesVisible === "locales" ? "Agregar Local" : "Nuevo";
      return (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <CustomButton
              size="sm"
              disabled={esSoloLectura}
              onClick={() => {
                if (pestanaRamoOperacionesVisible === "locales") {
                  setIndiceLocalSeleccionado(null);
                  setEstaAbiertoModalLocal(true);
                  return;
                }

                setIndiceOperacionSeleccionada(null);
                setEstaAbiertoModalOperacion(true);
              }}
            >
              <Plus size={14} />
              {tituloBoton}
            </CustomButton>
            <CustomButton
              size="sm"
              disabled={
                esSoloLectura ||
                (pestanaRamoOperacionesVisible === "locales"
                  ? indiceLocalSeleccionado == null
                  : indiceOperacionSeleccionada == null)
              }
              onClick={() => {
                if (pestanaRamoOperacionesVisible === "locales") {
                  setEstaAbiertoModalLocal(true);
                  return;
                }

                setEstaAbiertoModalOperacion(true);
              }}
            >
              <Pencil size={14} />
              Editar
            </CustomButton>
            <CustomButton
              size="sm"
              disabled={
                esSoloLectura ||
                (pestanaRamoOperacionesVisible === "locales"
                  ? indiceLocalSeleccionado == null
                  : indiceOperacionSeleccionada == null)
              }
              onClick={eliminarOperacionSeleccionada}
            >
              <Trash2 size={14} />
              Eliminar
            </CustomButton>
            <label className="ml-auto flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-300">
              Buscar
              <input className="h-10 rounded-xl border border-gray-200 px-3 text-sm normal-case tracking-normal text-slate-500 outline-none" />
            </label>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className={`${pestanaRamoOperacionesVisible === "locales" ? "min-w-[720px]" : "min-w-[980px]"} w-full text-left`}>
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
                {pestanaRamoOperacionesVisible === "locales" ? (
                  <tr>
                    <th className="px-4 py-3">Tipo Local</th>
                    <th className="px-4 py-3">Comentario</th>
                    <th className="px-4 py-3">Ver Detalle</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-4 py-3">Año</th>
                    <th className="px-4 py-3">Mes</th>
                    <th className="px-4 py-3">Moneda</th>
                    <th className="px-4 py-3">Países</th>
                    <th className="px-4 py-3">Productos</th>
                    <th className="px-4 py-3">Monto</th>
                    <th className="px-4 py-3">Operaciones</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {(pestanaRamoOperacionesVisible === "locales"
                  ? datosInvestigacion.locales.length
                  : registrosImportacionExportacionTabla.length) === 0 ? (
                  <tr>
                    <td colSpan={pestanaRamoOperacionesVisible === "locales" ? 3 : 7} className="px-4 py-10 text-center text-sm text-slate-300">
                      Sin registros disponibles.
                    </td>
                  </tr>
                ) : pestanaRamoOperacionesVisible === "locales" ? (
                  registrosLocalesPaginados.map((local) => {
                    const estaSeleccionado = indiceLocalSeleccionado === datosInvestigacion.locales.findIndex(
                      (item) => item.tipoLocal === local.tipoLocal && item.comentario === local.comentario,
                    );
                    return (
                    <tr
                      key={`${local.tipoLocal}-${local.comentario}`}
                      className={`cursor-pointer transition-colors ${estaSeleccionado ? "bg-brand-wine/5" : "hover:bg-slate-50"}`}
                      onClick={() => setIndiceLocalSeleccionado(datosInvestigacion.locales.findIndex((item) => item.tipoLocal === local.tipoLocal && item.comentario === local.comentario))}
                    >
                      <td className="relative px-4 py-4">
                        <span className={`pointer-events-none absolute inset-y-0 left-0 w-[3px] rounded-r-full transition-colors ${estaSeleccionado ? "bg-brand-wine" : ""}`} />
                        <span className={`text-sm font-semibold ${estaSeleccionado ? "text-brand-wine" : "text-slate-700"}`}>{local.tipoLocal}</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500">{local.comentario}</td>
                      <td className="px-4 py-4">
                        <CustomButton
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            const indiceReal = datosInvestigacion.locales.findIndex(
                              (item) => item.tipoLocal === local.tipoLocal && item.comentario === local.comentario,
                            );
                            setIndiceVistaLocal(indiceReal);
                            setEstaAbiertoVistaLocal(true);
                          }}
                          title="Ver detalle del local"
                          aria-label="Ver detalle del local"
                          className="text-slate-400 hover:text-slate-700"
                        >
                          <Eye size={16} />
                        </CustomButton>
                      </td>
                    </tr>
                    );
                  })
                ) : (
                  registrosImportacionExportacionPaginados.map((registro) => {
                    const mesRegistro = obtenerTextoPorId(opcionesMes, registro.idMesInicio) || registro.mes;
                    const monedaRegistro = obtenerTextoPorId(opcionesMoneda, registro.idMoneda) || registro.moneda;
                    const indiceRegistro = registrosOperacionActivos.findIndex((item) =>
                      item.anio === registro.anio
                      && (item.idMesInicio ?? 0) === (registro.idMesInicio ?? 0)
                      && item.mes === registro.mes
                      && item.paises === registro.paises
                      && item.monto === registro.monto
                    );

                    return (
                      <tr
                        key={`${registro.anio}-${registro.idMesInicio ?? registro.mes}-${registro.paises}-${registro.monto}`}
                        className={`cursor-pointer transition-colors ${indiceOperacionSeleccionada === indiceRegistro ? "bg-brand-wine/5" : "hover:bg-slate-50"}`}
                        onClick={() => setIndiceOperacionSeleccionada(indiceRegistro)}
                      >
                        <td className="relative px-4 py-4 text-sm">
                          <span className={`pointer-events-none absolute inset-y-0 left-0 w-[3px] rounded-r-full transition-colors ${indiceOperacionSeleccionada === indiceRegistro ? "bg-brand-wine" : ""}`} />
                          <span className={indiceOperacionSeleccionada === indiceRegistro ? "text-brand-wine" : "text-slate-500"}>{registro.anio}</span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500">{mesRegistro || "-"}</td>
                        <td className="px-4 py-4 text-sm text-slate-500">{monedaRegistro || "-"}</td>
                        <td className="px-4 py-4 text-sm text-slate-500">{registro.paises}</td>
                        <td className="px-4 py-4 text-sm italic text-slate-300">{registro.productos}</td>
                        <td className="px-4 py-4 text-sm text-slate-500">{registro.monto}</td>
                        <td className="px-4 py-4 text-sm text-slate-500">{registro.operaciones}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <PaginacionInvestigacion
            paginaActual={paginaOperaciones}
            totalRegistros={pestanaRamoOperacionesVisible === "locales" ? datosInvestigacion.locales.length : registrosImportacionExportacionTabla.length}
            onPaginaChange={setPaginaOperaciones}
            etiquetaRegistros="registros"
          />
        </div>
      );
    }

    const obtenerEtiquetaCompuestaTablaMaestra = (opcion: { string1: string | null; string2: string | null }) =>
      [opcion.string2?.trim(), opcion.string1?.trim()].filter(Boolean).join(" - ");
    const obtenerValorCiiu = (opcion: { string1: string | null; string2: string | null }) =>
      obtenerEtiquetaCompuestaTablaMaestra(opcion) || opcion.string1?.trim() || "";
    const existeCodigoCiiu = (
      opciones: { string2: string | null }[] | undefined,
      codigo: string,
    ) => {
      const codigoLimpio = codigo.trim().toLowerCase();
      return !!codigoLimpio && (opciones?.some((opcion) => opcion.string2?.trim().toLowerCase() === codigoLimpio) ?? false);
    };
    const ordenarPorCodigo = <T extends { string2: string | null }>(opciones: T[] | undefined) =>
      [...(opciones ?? [])].sort((a, b) => {
        const numeroA = Number(a.string2);
        const numeroB = Number(b.string2);
        if (Number.isFinite(numeroA) && Number.isFinite(numeroB)) return numeroA - numeroB;
        return (a.string2 ?? "").localeCompare(b.string2 ?? "");
      });
    const opcionSectorSeleccionado = opcionesSectorEconomico?.find((opcion) =>
      opcion.string1 === datosInvestigacion.operacionPrincipal.sector
      || obtenerEtiquetaCompuestaTablaMaestra(opcion) === datosInvestigacion.operacionPrincipal.sector
    );
    const opcionesCategoriaCiiuBase = ordenarPorCodigo(
      opcionSectorSeleccionado?.num1
        ? opcionesActividadEconomica?.filter((opcion) => opcion.num2 === opcionSectorSeleccionado.num1)
        : opcionesActividadEconomica,
    );
    const opcionCategoriaSeleccionada = opcionesActividadEconomica?.find((opcion) =>
      obtenerValorCiiu(opcion) === datosInvestigacion.operacionPrincipal.categoriaCiiu
      || opcion.string1 === datosInvestigacion.operacionPrincipal.categoriaCiiu
      || opcion.string2 === datosInvestigacion.operacionPrincipal.categoriaCiiu
      || String(opcion.num1 ?? "") === datosInvestigacion.operacionPrincipal.categoriaCiiu
    );
    const opcionesCategoriaCiiu = opcionCategoriaSeleccionada && !opcionesCategoriaCiiuBase.some((opcion) => opcion.num1 === opcionCategoriaSeleccionada.num1)
      ? ordenarPorCodigo([...opcionesCategoriaCiiuBase, opcionCategoriaSeleccionada])
      : opcionesCategoriaCiiuBase;
    const opcionesClaseCiiuBase = ordenarPorCodigo(
      opcionCategoriaSeleccionada?.num1
        ? opcionesClaseCiiu?.filter((opcion) => opcion.num2 === opcionCategoriaSeleccionada.num1)
        : opcionesClaseCiiu,
    );
    const opcionClaseSeleccionada = opcionesClaseCiiu?.find((opcion) =>
      obtenerValorCiiu(opcion) === datosInvestigacion.operacionPrincipal.claseCiiu
      || opcion.string1 === datosInvestigacion.operacionPrincipal.claseCiiu
      || opcion.string2 === datosInvestigacion.operacionPrincipal.claseCiiu
      || String(opcion.num1 ?? "") === datosInvestigacion.operacionPrincipal.claseCiiu
    );
    const opcionesClaseCiiuFiltradas = opcionClaseSeleccionada && !opcionesClaseCiiuBase.some((opcion) => opcion.num1 === opcionClaseSeleccionada.num1)
      ? ordenarPorCodigo([...opcionesClaseCiiuBase, opcionClaseSeleccionada])
      : opcionesClaseCiiuBase;
    const codigoCategoriaCiiuDuplicado = existeCodigoCiiu(opcionesActividadEconomica, codigoNuevaCategoriaCiiu);
    const codigoClaseCiiuDuplicado = existeCodigoCiiu(opcionesClaseCiiu, codigoNuevaClaseCiiu);
    const crearAltaCiiu = async ({
      clave,
      idMaestro,
      idPadre,
      codigo,
      texto,
      campo,
      limpiar,
    }: {
      clave: string;
      idMaestro: number;
      idPadre?: number | null;
      codigo: string;
      texto: string;
      campo: "categoriaCiiu" | "claseCiiu";
      limpiar: () => void;
    }) => {
      const codigoLimpio = codigo.trim();
      const textoLimpio = texto.trim();
      if (!codigoLimpio || !textoLimpio || !idPadre || claveAltaCiiuGuardando) return;

      setClaveAltaCiiuGuardando(clave);
      try {
        const opcionesActuales = await queryClient.fetchQuery({
          queryKey: ["masterTable", idMaestro],
          queryFn: () => servicioTablaMaestra.list(idMaestro),
          staleTime: 0,
        });

        if (existeCodigoCiiu(opcionesActuales, codigoLimpio)) return;

        await servicioTablaMaestra.crear({
          idMaestro,
          descripcion: obtenerDescripcionTablaMaestra(idMaestro),
          string1: textoLimpio,
          string2: codigoLimpio,
          string3: null,
          num1: opcionesActuales.reduce((maximo, opcion) => Math.max(maximo, opcion.num1 ?? 0), 0) + 1,
          num2: idPadre,
          num3: null,
          date1: null,
          date2: null,
          date3: null,
        });

        await queryClient.invalidateQueries({ queryKey: ["masterTable", idMaestro] });
        actualizarOperacionPrincipal(campo, `${codigoLimpio} - ${textoLimpio}`);
        limpiar();
      } finally {
        setClaveAltaCiiuGuardando(null);
      }
    };
    const renderizarAltaCiiu = ({
      codigo,
      texto,
      onCodigoChange,
      onTextoChange,
      onAgregar,
      onOcultar,
      deshabilitado,
      codigoDuplicado,
      guardando,
      mensajeAdvertencia,
    }: {
      codigo: string;
      texto: string;
      onCodigoChange: (valor: string) => void;
      onTextoChange: (valor: string) => void;
      onAgregar: () => void;
      onOcultar?: () => void;
      deshabilitado: boolean;
      codigoDuplicado: boolean;
      guardando: boolean;
      mensajeAdvertencia?: string;
    }) => (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-3">
        <div className="grid gap-3 md:grid-cols-[96px_minmax(0,1fr)_auto]">
          <input
            value={codigo}
            onChange={(event) => onCodigoChange(event.target.value)}
            readOnly={esSoloLectura}
            placeholder="Código"
            aria-invalid={codigoDuplicado}
            className={`h-10 w-24 rounded-lg border bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 ${
              codigoDuplicado
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                : "border-slate-200 focus:border-brand-black focus:ring-brand-black/5"
            }`}
          />
          <input
            value={texto}
            onChange={(event) => onTextoChange(event.target.value)}
            readOnly={esSoloLectura}
            placeholder="Texto"
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
          />
          <div className="flex gap-2">
            <CustomButton
              type="button"
              size="sm"
              variant="wine"
              disabled={deshabilitado || codigoDuplicado || esSoloLectura}
              loading={guardando}
              loadingText="Agregando..."
              onClick={onAgregar}
            >
              Agregar
            </CustomButton>
            {onOcultar && (
              <CustomButton
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Cancelar alta CIIU"
                title="Cancelar"
                onClick={onOcultar}
              >
                <X size={18} className="text-slate-500" />
              </CustomButton>
            )}
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Se agregará como <span className="font-semibold text-slate-700">{codigo.trim() || "-"}</span>
          {" - "}
          <span className="font-semibold text-slate-700">{texto.trim() || "-"}</span>
        </div>
        {codigoDuplicado ? (
          <p className="mt-2 text-xs font-semibold text-red-600">Este código ya existe en la tabla maestra.</p>
        ) : mensajeAdvertencia ? (
          <p className="mt-2 text-xs font-semibold text-amber-600">{mensajeAdvertencia}</p>
        ) : null}
      </div>
    );

    return (
      <div className="grid gap-5 md:grid-cols-2">
        <SelectorMaestroConAltaInvestigacionAnalista
          etiqueta="Sector"
          valor={datosInvestigacion.operacionPrincipal.sector}
          soloLectura={esSoloLectura}
          opcionesTablaMaestra={opcionesSectorEconomico}
          idMaestro={TablaMaestraId.SECTOR_ECONOMICO}
          permiteAltaNueva
          marcador="Seleccione sector"
          obtenerEtiquetaOpcion={obtenerEtiquetaCompuestaTablaMaestra}
          adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.sector")}
          onChange={(valor) => actualizarOperacionPrincipal("sector", valor)}
        />
        <CampoInvestigacionAnalista
          etiqueta="Actividad"
          valor={datosInvestigacion.operacionPrincipal.actividad}
          soloLectura={esSoloLectura}
          adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.actividad")}
          onChange={(valor) => actualizarOperacionPrincipal("actividad", valor)}
        />
        <div className="space-y-2">
          <CustomLabel as="p" className="text-sm font-bold text-gray-700">
            <span className="inline-flex items-center gap-2">
              <span>Categoría CIIU</span>
              {obtenerIndicadorCambioExtraccion("operacionPrincipal.categoriaCiiu")}
            </span>
          </CustomLabel>
          <div className="grid gap-3 md:grid-cols-[120px_minmax(0,1fr)]">
            <SelectorMaestroConAltaInvestigacionAnalista
              etiqueta="Código"
              valor={datosInvestigacion.operacionPrincipal.categoriaCiiu}
              soloLectura={esSoloLectura}
              opcionesTablaMaestra={opcionesCategoriaCiiu}
              idMaestro={TablaMaestraId.ACTIVIDAD_ECONOMICA}
              conservarOpcionesLocales={false}
              marcador="Código"
              obtenerEtiquetaOpcion={(opcion) => opcion.string2?.trim() || opcion.string1?.trim() || ""}
              obtenerValorOpcion={obtenerValorCiiu}
              ocultarEtiqueta
              onChange={(valor) => actualizarOperacionPrincipal("categoriaCiiu", valor)}
            />
            <SelectorMaestroConAltaInvestigacionAnalista
              etiqueta="Categoría"
              valor={datosInvestigacion.operacionPrincipal.categoriaCiiu}
              soloLectura={esSoloLectura}
              opcionesTablaMaestra={opcionesCategoriaCiiu}
              idMaestro={TablaMaestraId.ACTIVIDAD_ECONOMICA}
              conservarOpcionesLocales={false}
              marcador="Seleccione categoría"
              obtenerEtiquetaOpcion={(opcion) => opcion.string1?.trim() || ""}
              obtenerValorOpcion={obtenerValorCiiu}
              ocultarEtiqueta
              onChange={(valor) => actualizarOperacionPrincipal("categoriaCiiu", valor)}
            />
          </div>
          {!esSoloLectura && !mostrarFormCategoriaCiiu && (
            <button
              type="button"
              onClick={() => setMostrarFormCategoriaCiiu(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-wine transition-colors hover:text-brand-wine/80 cursor-pointer"
            >
              + Agregar Categoría CIIU
            </button>
          )}
          {mostrarFormCategoriaCiiu && renderizarAltaCiiu({
            codigo: codigoNuevaCategoriaCiiu,
            texto: textoNuevaCategoriaCiiu,
            onCodigoChange: setCodigoNuevaCategoriaCiiu,
            onTextoChange: setTextoNuevaCategoriaCiiu,
            deshabilitado: !codigoNuevaCategoriaCiiu.trim() || !textoNuevaCategoriaCiiu.trim() || !opcionSectorSeleccionado?.num1,
            mensajeAdvertencia: !opcionSectorSeleccionado?.num1 ? "Debe seleccionar un Sector para agregar una nueva categoría CIIU." : undefined,
            codigoDuplicado: codigoCategoriaCiiuDuplicado,
            guardando: claveAltaCiiuGuardando === "categoria",
            onOcultar: () => { setMostrarFormCategoriaCiiu(false); setCodigoNuevaCategoriaCiiu(""); setTextoNuevaCategoriaCiiu(""); },
            onAgregar: () => void crearAltaCiiu({
              clave: "categoria",
              idMaestro: TablaMaestraId.ACTIVIDAD_ECONOMICA,
              idPadre: opcionSectorSeleccionado?.num1,
              codigo: codigoNuevaCategoriaCiiu,
              texto: textoNuevaCategoriaCiiu,
              campo: "categoriaCiiu",
              limpiar: () => {
                setCodigoNuevaCategoriaCiiu("");
                setTextoNuevaCategoriaCiiu("");
                setMostrarFormCategoriaCiiu(false);
              },
            }),
          })}
        </div>
        <div className="space-y-2">
          <CustomLabel as="p" className="text-sm font-bold text-gray-700">
            <span className="inline-flex items-center gap-2">
              <span>Clase CIIU</span>
              {obtenerIndicadorCambioExtraccion("operacionPrincipal.claseCiiu")}
            </span>
          </CustomLabel>
          <div className="grid gap-3 md:grid-cols-[120px_minmax(0,1fr)]">
            <SelectorMaestroConAltaInvestigacionAnalista
              etiqueta="Código"
              valor={datosInvestigacion.operacionPrincipal.claseCiiu}
              soloLectura={esSoloLectura}
              opcionesTablaMaestra={opcionesClaseCiiuFiltradas}
              idMaestro={TablaMaestraId.CLASE_CIIU}
              conservarOpcionesLocales={false}
              marcador="Código"
              obtenerEtiquetaOpcion={(opcion) => opcion.string2?.trim() || opcion.string1?.trim() || ""}
              obtenerValorOpcion={obtenerValorCiiu}
              ocultarEtiqueta
              onChange={(valor) => actualizarOperacionPrincipal("claseCiiu", valor)}
            />
            <SelectorMaestroConAltaInvestigacionAnalista
              etiqueta="Clase"
              valor={datosInvestigacion.operacionPrincipal.claseCiiu}
              soloLectura={esSoloLectura}
              opcionesTablaMaestra={opcionesClaseCiiuFiltradas}
              idMaestro={TablaMaestraId.CLASE_CIIU}
              conservarOpcionesLocales={false}
              marcador="Seleccione clase"
              obtenerEtiquetaOpcion={(opcion) => opcion.string1?.trim() || ""}
              obtenerValorOpcion={obtenerValorCiiu}
              ocultarEtiqueta
              onChange={(valor) => actualizarOperacionPrincipal("claseCiiu", valor)}
            />
          </div>
          {!esSoloLectura && !mostrarFormClaseCiiu && (
            <button
              type="button"
              onClick={() => setMostrarFormClaseCiiu(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-wine transition-colors hover:text-brand-wine/80 cursor-pointer"
            >
              + Agregar Clase CIIU
            </button>
          )}
          {mostrarFormClaseCiiu && renderizarAltaCiiu({
            codigo: codigoNuevaClaseCiiu,
            texto: textoNuevaClaseCiiu,
            onCodigoChange: setCodigoNuevaClaseCiiu,
            onTextoChange: setTextoNuevaClaseCiiu,
            deshabilitado: !codigoNuevaClaseCiiu.trim() || !textoNuevaClaseCiiu.trim() || !opcionCategoriaSeleccionada?.num1,
            mensajeAdvertencia: !opcionCategoriaSeleccionada?.num1 ? "Debe seleccionar una Categoría CIIU para agregar una nueva clase CIIU." : undefined,
            codigoDuplicado: codigoClaseCiiuDuplicado,
            guardando: claveAltaCiiuGuardando === "clase",
            onOcultar: () => { setMostrarFormClaseCiiu(false); setCodigoNuevaClaseCiiu(""); setTextoNuevaClaseCiiu(""); },
            onAgregar: () => void crearAltaCiiu({
              clave: "clase",
              idMaestro: TablaMaestraId.CLASE_CIIU,
              idPadre: opcionCategoriaSeleccionada?.num1,
              codigo: codigoNuevaClaseCiiu,
              texto: textoNuevaClaseCiiu,
              campo: "claseCiiu",
              limpiar: () => {
                setCodigoNuevaClaseCiiu("");
                setTextoNuevaClaseCiiu("");
                setMostrarFormClaseCiiu(false);
              },
            }),
          })}
        </div>
        <AreaInvestigacionAnalista etiqueta="Actividad Principal" valor={datosInvestigacion.operacionPrincipal.actividadPrincipal} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.actividadPrincipal")} className="md:col-span-2" onChange={(valor) => actualizarOperacionPrincipal("actividadPrincipal", valor)} />
        <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-4 border-b border-slate-100 pb-3 text-xs font-bold uppercase tracking-widest text-slate-700">Ventas</p>
          <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">Al Contado</p>
              <CampoInvestigacionAnalista etiqueta="Ventas al Contado (%)" valor={datosInvestigacion.operacionPrincipal.ventasContadoPorcentaje} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.ventasContadoPorcentaje")} onChange={(valor) => actualizarPorcentajesComplementarios("ventasContadoPorcentaje", "ventasCreditoPorcentaje", valor)} />
              <CampoInvestigacionAnalista className="mt-5" etiqueta="Detalle Ventas al Contado" valor={datosInvestigacion.operacionPrincipal.ventasContadoDetalle} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.ventasContadoDetalle")} onChange={(valor) => actualizarOperacionPrincipal("ventasContadoDetalle", valor)} />
            </div>
            <div className="md:border-l md:border-slate-200 md:pl-6">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">A Crédito</p>
              <CampoInvestigacionAnalista etiqueta="Ventas a Crédito (%)" valor={datosInvestigacion.operacionPrincipal.ventasCreditoPorcentaje} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.ventasCreditoPorcentaje")} onChange={(valor) => actualizarPorcentajesComplementarios("ventasCreditoPorcentaje", "ventasContadoPorcentaje", valor)} />
              <CampoInvestigacionAnalista className="mt-5" etiqueta="Detalle Ventas a Crédito" valor={datosInvestigacion.operacionPrincipal.ventasCreditoDetalle} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.ventasCreditoDetalle")} onChange={(valor) => actualizarOperacionPrincipal("ventasCreditoDetalle", valor)} />
              <SelectorMaestroConAltaInvestigacionAnalista
                className="mt-5"
                etiqueta="Tiempo de Crédito"
                valor={datosInvestigacion.operacionPrincipal.ventasCreditoTiempo}
                soloLectura={esSoloLectura}
                opcionesTablaMaestra={opcionesTiempoCreditoVentas}
                idMaestro={TablaMaestraId.TIEMPO_CREDITO_VENTAS}
                permiteAltaNueva
                marcador="Seleccione tiempo"
                obtenerValorOpcion={(opcion) => String(opcion.num1 ?? "")}
                adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.ventasCreditoTiempo")}
                onChange={(valor) => actualizarOperacionPrincipal("ventasCreditoTiempo", valor)}
              />
            </div>
          </div>
          <div className="mt-5 grid gap-x-6 gap-y-5 border-t border-slate-200 pt-5 md:grid-cols-2">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">Ventas Nacionales</p>
              <CampoInvestigacionAnalista etiqueta="(%) Ventas Nacionales" valor={datosInvestigacion.operacionPrincipal.territorioVentasPorcentaje} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.territorioVentasPorcentaje")} onChange={(valor) => actualizarPorcentajesComplementarios("territorioVentasPorcentaje", "ventasExtranjeroPorcentaje", valor)} />
              <CampoInvestigacionAnalista className="mt-5" etiqueta="Detalle Ventas Nacionales" valor={datosInvestigacion.operacionPrincipal.territorioVentasDetalle} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.territorioVentasDetalle")} onChange={(valor) => actualizarOperacionPrincipal("territorioVentasDetalle", valor)} />
            </div>
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">Ventas en el Extranjero</p>
              <CampoInvestigacionAnalista etiqueta="(%) Ventas en el Extranjero" valor={datosInvestigacion.operacionPrincipal.ventasExtranjeroPorcentaje} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.ventasExtranjeroPorcentaje")} onChange={(valor) => actualizarPorcentajesComplementarios("ventasExtranjeroPorcentaje", "territorioVentasPorcentaje", valor)} />
              <CampoInvestigacionAnalista className="mt-5" etiqueta="Detalle Ventas Extranjero" valor={datosInvestigacion.operacionPrincipal.ventasExtranjeroDetalle} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.ventasExtranjeroDetalle")} onChange={(valor) => actualizarOperacionPrincipal("ventasExtranjeroDetalle", valor)} />
            </div>
          </div>
        </div>
        <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-4 border-b border-slate-100 pb-3 text-xs font-bold uppercase tracking-widest text-slate-700">Compras Nacionales</p>
          <div className="mb-5 grid gap-5 md:grid-cols-2">
            <CampoInvestigacionAnalista etiqueta="(%) Compras Nacionales" valor={datosInvestigacion.operacionPrincipal.comprasNacionalesPorcentaje} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.comprasNacionalesPorcentaje")} onChange={(valor) => actualizarPorcentajesComplementarios("comprasNacionalesPorcentaje", "comprasExtranjeroPorcentaje", valor)} />
            <CampoInvestigacionAnalista etiqueta="Detalle Compras Nacionales" valor={datosInvestigacion.operacionPrincipal.comprasNacionalesDetalle} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.comprasNacionalesDetalle")} onChange={(valor) => actualizarOperacionPrincipal("comprasNacionalesDetalle", valor)} />
          </div>
          <div className="grid gap-x-6 gap-y-5 border-t border-slate-200 pt-5 md:grid-cols-2">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">Al Contado Nacionales</p>
              <CampoInvestigacionAnalista etiqueta="Compras al Contado (%)" marcador="Ej. 20%" valor={datosInvestigacion.operacionPrincipal.comprasContadoNacionalesPorcentaje} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.comprasContadoNacionalesPorcentaje")} onChange={(valor) => actualizarPorcentajesComplementarios("comprasContadoNacionalesPorcentaje", "comprasCreditoNacionalesPorcentaje", valor)} />
              <CampoInvestigacionAnalista className="mt-5" etiqueta="Detalle Compras al Contado" marcador="Describa cómo se realizan las compras al contado nacionales" valor={datosInvestigacion.operacionPrincipal.comprasContadoNacionalesDetalle} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.comprasContadoNacionalesDetalle")} onChange={(valor) => actualizarOperacionPrincipal("comprasContadoNacionalesDetalle", valor)} />
            </div>
            <div className="md:border-l md:border-slate-200 md:pl-6">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">A Crédito Nacionales</p>
              <CampoInvestigacionAnalista etiqueta="Compras a Crédito (%)" marcador="Ej. 80%" valor={datosInvestigacion.operacionPrincipal.comprasCreditoNacionalesPorcentaje} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.comprasCreditoNacionalesPorcentaje")} onChange={(valor) => actualizarPorcentajesComplementarios("comprasCreditoNacionalesPorcentaje", "comprasContadoNacionalesPorcentaje", valor)} />
              <CampoInvestigacionAnalista className="mt-5" etiqueta="Detalle Compras a Crédito" marcador="Describa cómo se realizan las compras a crédito nacionales" valor={datosInvestigacion.operacionPrincipal.comprasCreditoNacionalesDetalle} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.comprasCreditoNacionalesDetalle")} onChange={(valor) => actualizarOperacionPrincipal("comprasCreditoNacionalesDetalle", valor)} />
              <SelectorMaestroConAltaInvestigacionAnalista
                className="mt-5"
                etiqueta="Tiempo de Crédito"
                valor={datosInvestigacion.operacionPrincipal.comprasCreditoNacionalesTiempo}
                soloLectura={esSoloLectura}
                opcionesTablaMaestra={opcionesTiempoCreditoVentas}
                idMaestro={TablaMaestraId.TIEMPO_CREDITO_VENTAS}
                permiteAltaNueva
                marcador="Seleccione tiempo"
                obtenerValorOpcion={(opcion) => String(opcion.num1 ?? "")}
                adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.comprasCreditoNacionalesTiempo")}
                onChange={(valor) => actualizarOperacionPrincipal("comprasCreditoNacionalesTiempo", valor)}
              />
            </div>
          </div>
        </div>
        <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-4 border-b border-slate-100 pb-3 text-xs font-bold uppercase tracking-widest text-slate-700">Compras en el Extranjero</p>
          <div className="mb-5 grid gap-5 md:grid-cols-2">
            <CampoInvestigacionAnalista etiqueta="(%) Compras en el Extranjero" valor={datosInvestigacion.operacionPrincipal.comprasExtranjeroPorcentaje} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.comprasExtranjeroPorcentaje")} onChange={(valor) => actualizarPorcentajesComplementarios("comprasExtranjeroPorcentaje", "comprasNacionalesPorcentaje", valor)} />
            <CampoInvestigacionAnalista etiqueta="Detalle Compras Extranjero" valor={datosInvestigacion.operacionPrincipal.comprasExtranjeroDetalle} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.comprasExtranjeroDetalle")} onChange={(valor) => actualizarOperacionPrincipal("comprasExtranjeroDetalle", valor)} />
          </div>
          <div className="grid gap-x-6 gap-y-5 border-t border-slate-200 pt-5 md:grid-cols-2">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">Al Contado Extranjero</p>
              <CampoInvestigacionAnalista etiqueta="Compras al Contado (%)" marcador="Ej. 20%" valor={datosInvestigacion.operacionPrincipal.comprasContadoInternacionalesPorcentaje} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.comprasContadoInternacionalesPorcentaje")} onChange={(valor) => actualizarPorcentajesComplementarios("comprasContadoInternacionalesPorcentaje", "comprasCreditoInternacionalesPorcentaje", valor)} />
              <CampoInvestigacionAnalista className="mt-5" etiqueta="Detalle Compras al Contado" marcador="Describa cómo se realizan las compras al contado en el extranjero" valor={datosInvestigacion.operacionPrincipal.comprasContadoInternacionalesDetalle} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.comprasContadoInternacionalesDetalle")} onChange={(valor) => actualizarOperacionPrincipal("comprasContadoInternacionalesDetalle", valor)} />
            </div>
            <div className="md:border-l md:border-slate-200 md:pl-6">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">A Crédito Extranjero</p>
              <CampoInvestigacionAnalista etiqueta="Compras a Crédito (%)" marcador="Ej. 80%" valor={datosInvestigacion.operacionPrincipal.comprasCreditoInternacionalesPorcentaje} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.comprasCreditoInternacionalesPorcentaje")} onChange={(valor) => actualizarPorcentajesComplementarios("comprasCreditoInternacionalesPorcentaje", "comprasContadoInternacionalesPorcentaje", valor)} />
              <CampoInvestigacionAnalista className="mt-5" etiqueta="Detalle Compras a Crédito" marcador="Describa cómo se realizan las compras a crédito en el extranjero" valor={datosInvestigacion.operacionPrincipal.comprasCreditoInternacionalesDetalle} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.comprasCreditoInternacionalesDetalle")} onChange={(valor) => actualizarOperacionPrincipal("comprasCreditoInternacionalesDetalle", valor)} />
              <SelectorMaestroConAltaInvestigacionAnalista
                className="mt-5"
                etiqueta="Tiempo de Crédito"
                valor={datosInvestigacion.operacionPrincipal.comprasCreditoInternacionalesTiempo}
                soloLectura={esSoloLectura}
                opcionesTablaMaestra={opcionesTiempoCreditoVentas}
                idMaestro={TablaMaestraId.TIEMPO_CREDITO_VENTAS}
                permiteAltaNueva
                marcador="Seleccione tiempo"
                obtenerValorOpcion={(opcion) => String(opcion.num1 ?? "")}
                adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.comprasCreditoInternacionalesTiempo")}
                onChange={(valor) => actualizarOperacionPrincipal("comprasCreditoInternacionalesTiempo", valor)}
              />
            </div>
          </div>
        </div>
        <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-4 border-b border-slate-100 pb-3 text-xs font-bold uppercase tracking-widest text-slate-700">Empleados</p>
          <div className="grid gap-5 md:grid-cols-2">
            <CampoInvestigacionAnalista etiqueta="N. de Empleados" valor={datosInvestigacion.operacionPrincipal.numeroEmpleados} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.numeroEmpleados")} onChange={(valor) => actualizarOperacionPrincipal("numeroEmpleados", valor)} />
            <CampoInvestigacionAnalista etiqueta="Detalle Empleados" valor={datosInvestigacion.operacionPrincipal.numeroEmpleadosDetalle} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.numeroEmpleadosDetalle")} onChange={(valor) => actualizarOperacionPrincipal("numeroEmpleadosDetalle", valor)} />
          </div>
        </div>
        <AreaInvestigacionAnalista etiqueta="Comentarios sobre las Operaciones" valor={datosInvestigacion.operacionPrincipal.comentariosOperaciones} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("operacionPrincipal.comentariosOperaciones")} className="md:col-span-2" onChange={(valor) => actualizarOperacionPrincipal("comentariosOperaciones", valor)} />
      </div>
    );
  };

  const renderizarInformacionFinanciera = () => (
    <div className="space-y-5">
      <AreaInvestigacionAnalista etiqueta="Contenido" valor={datosInvestigacion.informacionFinanciera.contenido} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("informacionFinanciera.contenido")} filas={5} onChange={(valor) => actualizarInformacionFinanciera("contenido", valor)} />
      <AreaInvestigacionAnalista etiqueta="Comentarios Financieros" valor={datosInvestigacion.informacionFinanciera.comentariosFinancieros} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("informacionFinanciera.comentariosFinancieros")} filas={5} onChange={(valor) => actualizarInformacionFinanciera("comentariosFinancieros", valor)} />
      <AreaInvestigacionAnalista etiqueta="Activos" valor={datosInvestigacion.informacionFinanciera.activosFijos} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("informacionFinanciera.activosFijos")} filas={5} onChange={(valor) => actualizarInformacionFinanciera("activosFijos", valor)} />
      <AreaInvestigacionAnalista etiqueta="Seguros" valor={datosInvestigacion.informacionFinanciera.seguros} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("informacionFinanciera.seguros")} filas={5} onChange={(valor) => actualizarInformacionFinanciera("seguros", valor)} />
    </div>
  );

  const renderizarBalances = () => (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            value={busquedaBalances}
            onChange={(event) => setBusquedaBalances(event.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 pl-9 pr-3 text-sm text-slate-500 outline-none"
            placeholder="Buscar balances..."
          />
        </label>
        <CustomButton variant="secondary" size="sm">Buscar</CustomButton>
        <CustomButton
          size="sm"
          disabled={esSoloLectura}
          onClick={() => {
            setIndiceBalanceSeleccionado(null);
            setEstaAbiertoModalBalance(true);
          }}
        >
          <Plus size={14} />
          Agregar Balance
        </CustomButton>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="min-w-[960px] w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Tipo de Balance</th>
              <th className="px-4 py-3">Tipo de Estado Financiero</th>
              <th className="px-4 py-3">Balance General</th>
              <th className="px-4 py-3">Perdida Ganancia</th>
              <th className="px-4 py-3">Cuentas</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {balancesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-300">
                  Sin balances registrados.
                </td>
              </tr>
            ) : balancesPaginados.map((balance) => {
              const indiceReal = datosInvestigacion.balances.findIndex(
                (registro) => registro.codigo === balance.codigo && registro.periodo === balance.periodo,
              );

              return (
                <tr key={`${balance.codigo}-${balance.periodo}`} className="hover:bg-slate-50">
                  <td className="px-4 py-4 text-sm font-semibold text-slate-700">{balance.codigo}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{balance.fecha}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{balance.tipoBalance || "-"}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{balance.tipoEstadoFinanciero || balance.tipo}</td>
                  <td className="px-4 py-4">
                    {balance.balanceGeneral ? (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <Check size={12} />
                      </span>
                    ) : (
                      <span className="text-sm text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {balance.perdidaGanancia ? (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <Check size={12} />
                      </span>
                    ) : (
                      <span className="text-sm text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-slate-400 transition-colors hover:border-brand-black hover:text-brand-black"
                      onClick={() => {
                        setIndiceBalanceSeleccionado(indiceReal);
                        setEstaAbiertoModalDetalleBalance(true);
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </td>
                  <td className="px-4 py-4 text-right text-slate-400">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        className="cursor-pointer transition-colors hover:text-slate-600"
                        onClick={() => {
                          setIndiceBalanceSeleccionado(indiceReal);
                          setEstaAbiertoModalBalance(true);
                        }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="cursor-pointer transition-colors hover:text-slate-600"
                        onClick={() => setIndiceBalanceAEliminar(indiceReal)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <PaginacionInvestigacion
        paginaActual={paginaBalances}
        totalRegistros={balancesFiltrados.length}
        onPaginaChange={setPaginaBalances}
        etiquetaRegistros="balances"
      />
    </div>
  );

  const renderizarBancosProveedores = () => (
    <div className="space-y-5">
      <PestanasInvestigacionAnalista
        opciones={[
          { id: "referencias", etiqueta: "Referencias" },
          { id: "proveedores", etiqueta: "Proveedores" },
          { id: "bancos", etiqueta: "Bancos" },
        ]}
        valorActivo={pestanaBancosProveedores}
        onChange={(valor) => setPestanaBancosProveedores(valor as PestanaBancosProveedores)}
      />
      {pestanaBancosProveedores === "referencias" ? (
        <>
          <AreaInvestigacionAnalista etiqueta="Comentarios de los Proveedores" valor={datosInvestigacion.referencias.comentariosProveedores} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("referencias.comentariosProveedores")} filas={4} onChange={(valor) => actualizarReferencias("comentariosProveedores", valor)} />
          <AreaInvestigacionAnalista etiqueta="Referencias de Bancos" valor={datosInvestigacion.referencias.referenciasBancos} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("referencias.referenciasBancos")} filas={4} onChange={(valor) => actualizarReferencias("referenciasBancos", valor)} />
          <AreaInvestigacionAnalista etiqueta="Litigios" valor={datosInvestigacion.referencias.litigios} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("referencias.litigios")} filas={4} onChange={(valor) => actualizarReferencias("litigios", valor)} />
          <AreaInvestigacionAnalista etiqueta="Riesgo Principal" valor={datosInvestigacion.referencias.riesgoPrincipal} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("referencias.riesgoPrincipal")} filas={4} onChange={(valor) => actualizarReferencias("riesgoPrincipal", valor)} />
          <AreaInvestigacionAnalista etiqueta="Superintendencia" valor={datosInvestigacion.referencias.superintendencia} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("referencias.superintendencia")} filas={4} onChange={(valor) => actualizarReferencias("superintendencia", valor)} />
        </>
      ) : null}

      {pestanaBancosProveedores === "proveedores" ? (
        <div className="space-y-5">
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Búsqueda y filtros</p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">Proveedores registrados</h3>
                
              </div>
              <div className="flex flex-wrap gap-2">
                <CustomButton
                  variant="secondary"
                  size="sm"
                  className="h-9 rounded-xl px-4"
                  onClick={() => {
                    setFiltroProveedorNombre("");
                    setFiltroProveedorTipo("Todos");
                    setFiltroProveedorContacto("");
                    setFiltroProveedorTelefono("");
                  }}
                >
                  <RotateCcw size={14} />
                  Limpiar filtros
                </CustomButton>
                <CustomButton
                  size="sm"
                  disabled={esSoloLectura}
                  className="h-9 rounded-xl px-4"
                  onClick={() => {
                    setIndiceProveedorSeleccionado(null);
                    setEstaAbiertoModalProveedor(true);
                  }}
                >
                  <Plus size={14} />
                  Agregar Proveedor
                </CustomButton>
              </div>
            </div>

            <div className="grid gap-4 px-5 py-5 md:grid-cols-[1.25fr_0.85fr_1fr_0.7fr]">
              <div className="space-y-2">
                <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Nombre de Proveedor</CustomLabel>
                <div className="relative">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input value={filtroProveedorNombre} onChange={(event) => setFiltroProveedorNombre(event.target.value)} placeholder="Ej. Schneider Electric" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:border-brand-black focus:ring-2 focus:ring-brand-black/5" />
                </div>
              </div>
              <div className="space-y-2">
                <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Tipo de Proveedor</CustomLabel>
                <CustomSelectorBuscable
                  options={opcionesFiltroTipoProveedor}
                  value={opcionesFiltroTipoProveedor.find((opcion) => opcion.string1 === filtroProveedorTipo)?.num1 ?? undefined}
                  onChange={(valor) => setFiltroProveedorTipo(opcionesFiltroTipoProveedor.find((opcion) => opcion.num1 === valor)?.string1 ?? "")}
                  onClear={() => setFiltroProveedorTipo("")}
                  optional
                  mostrarTextoOpcionalEnLabel={false}
                  placeholder="Todos los tipos"
                />
              </div>
              <div className="space-y-2">
                <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Nombre de Contacto</CustomLabel>
                <div className="relative">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input value={filtroProveedorContacto} onChange={(event) => setFiltroProveedorContacto(event.target.value)} placeholder="Nombre completo" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:border-brand-black focus:ring-2 focus:ring-brand-black/5" />
                </div>
              </div>
              <div className="space-y-2">
                <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Teléfono</CustomLabel>
                <div className="relative">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input value={filtroProveedorTelefono} onChange={(event) => setFiltroProveedorTelefono(event.target.value)} placeholder="+52..." className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:border-brand-black focus:ring-2 focus:ring-brand-black/5" />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-gray-100 bg-white shadow-sm">
            <table className="min-w-[860px] w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
                <tr>
                  <th className="px-4 py-3">Nombre Proveedor</th>
                  <th className="px-4 py-3">Contacto</th>
                  <th className="px-4 py-3 text-center">Tipo</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {proveedoresPaginados.map((proveedor) => {
                  const indiceReal = datosInvestigacion.proveedores.findIndex((item) => item.nombreEmpresa === proveedor.nombreEmpresa && item.telefono === proveedor.telefono);
                  return (
                    <tr key={`${proveedor.nombreEmpresa}-${proveedor.telefono}`}>
                      <td className="px-4 py-4 text-sm font-semibold leading-4 text-slate-700">{proveedor.nombreEmpresa}</td>
                      <td className="px-4 py-4 text-sm leading-4 text-slate-500">{proveedor.contacto || "-"}</td>
                      <td className="px-4 py-4 text-center text-sm">
                        <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-bold uppercase ${proveedor.tipoProveedor === "Nacional" ? "bg-green-50 text-green-600" : "bg-purple-50 text-purple-600"}`}>
                          {proveedor.tipoProveedor}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm leading-4 text-slate-500">{proveedor.telefono || "-"}</td>
                      <td className="px-4 py-4 text-right text-slate-400">
                        <div className="flex justify-end gap-3">
                          <button type="button" className="cursor-pointer transition-colors hover:text-slate-600" onClick={() => { setIndiceProveedorSeleccionado(indiceReal); setEstaAbiertoModalProveedor(true); }}><Pencil size={14} /></button>
                          <button type="button" className="cursor-pointer transition-colors hover:text-slate-600" onClick={() => setIndiceProveedorAEliminar(indiceReal)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <PaginacionInvestigacion
            paginaActual={paginaProveedores}
            totalRegistros={proveedoresFiltrados.length}
            onPaginaChange={setPaginaProveedores}
            etiquetaRegistros="proveedores"
          />
        </div>
      ) : null}

      {pestanaBancosProveedores === "bancos" ? (
        <div className="space-y-5">
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Búsqueda y filtros</p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">Cuentas bancarias</h3>
                
              </div>
              <div className="flex flex-wrap gap-2">
                {bancosExtraccionPendientes.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setEstaAbiertoModalRevisionBancosExtraccion(true)}
                    className="rounded-xl border border-brand-wine/30 px-4 py-2 text-sm font-bold text-brand-wine transition-all hover:bg-brand-wine/5"
                  >
                    Revisar detectados ({bancosExtraccionPendientes.length})
                  </button>
                ) : null}
                <CustomButton
                  variant="secondary"
                  size="sm"
                  className="h-9 rounded-xl px-4"
                  onClick={() => {
                    setFiltroBancoNombre("");
                    setFiltroBancoCuenta("");
                    setFiltroBancoTelefono("");
                    setIdsFiltroBancoSector([]);
                  }}
                >
                  <RotateCcw size={14} />
                  Limpiar filtros
                </CustomButton>
                <CustomButton
                  size="sm"
                  disabled={esSoloLectura}
                  className="h-9 rounded-xl px-4"
                  onClick={() => {
                    setIndiceBancoSeleccionado(null);
                    setEstaAbiertoModalBanco(true);
                  }}
                >
                  <Plus size={14} />
                  Agregar Cuenta Bancaria
                </CustomButton>
              </div>
            </div>

            <div className="grid gap-4 px-5 py-5 md:grid-cols-[1.2fr_0.7fr_0.7fr]">
              <div className="space-y-2">
                <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Nombre del Banco</CustomLabel>
                <div className="relative">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input value={filtroBancoNombre} onChange={(event) => setFiltroBancoNombre(event.target.value)} placeholder="Buscar banco..." className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:border-brand-black focus:ring-2 focus:ring-brand-black/5" />
                </div>
              </div>
              <div className="space-y-2">
                <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Número de Cuenta</CustomLabel>
                <div className="relative">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input value={filtroBancoCuenta} onChange={(event) => setFiltroBancoCuenta(event.target.value)} placeholder="0000 0000 0..." className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:border-brand-black focus:ring-2 focus:ring-brand-black/5" />
                </div>
              </div>
              <div className="space-y-2">
                <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Teléfono</CustomLabel>
                <div className="relative">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input value={filtroBancoTelefono} onChange={(event) => setFiltroBancoTelefono(event.target.value)} placeholder="Número..." className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:border-brand-black focus:ring-2 focus:ring-brand-black/5" />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 px-5 pb-2">
              <MultiCustomSelectorBuscable
                label="Sectores"
                idMaster={TablaMaestraId.SECTOR_ECONOMICO}
                value={idsFiltroBancoSector}
                onChange={setIdsFiltroBancoSector}
                placeholder="Filtrar por sectores"
                resumirSelecciones
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-gray-100 bg-white shadow-sm">
            <table className="min-w-[980px] w-full table-fixed text-left">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
                <tr>
                  <th className="w-[220px] px-4 py-3">Banco</th>
                  <th className="w-[180px] px-4 py-3">Número de Cuenta</th>
                  <th className="w-[170px] px-4 py-3 text-center">Sector</th>
                  <th className="w-[220px] px-4 py-3">Sectorista / Jefe de Cuenta</th>
                  <th className="w-[130px] px-4 py-3">Teléfono</th>
                  <th className="w-[120px] px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {bancosPaginados.map((banco) => {
                  const indiceReal = datosInvestigacion.bancos.findIndex((item) => item.banco === banco.banco && item.numeroCuenta === banco.numeroCuenta);
                  const sectorBanco = banco.sector || opcionesSectorEconomico?.find((opcion) => opcion.num1 === banco.idSector)?.string1 || "";
                  return (
                    <tr key={`${banco.banco}-${banco.numeroCuenta}`}>
                      <td className="px-4 py-4 text-sm font-semibold leading-4 text-slate-700"><span className="block truncate">{banco.banco}</span></td>
                      <td className="px-4 py-4 text-sm leading-4 text-slate-500">
                        <span className="block truncate">{enmascararNumeroCuenta(banco.numeroCuenta)}</span>
                      </td>
                      <td className="px-4 py-4 text-center text-sm">
                        <span className={`inline-flex max-w-full items-center overflow-hidden rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                          sectorBanco.toLowerCase().includes("finanzas")
                            ? "bg-blue-50 text-blue-600"
                            : sectorBanco.toLowerCase().includes("comercio")
                              ? "bg-slate-100 text-slate-600"
                              : sectorBanco.toLowerCase().includes("energia")
                                ? "bg-green-50 text-green-600"
                                : "bg-orange-50 text-orange-600"
                        }`} title={sectorBanco || "-"}>
                          <span className="block truncate">{sectorBanco || "-"}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm leading-4 text-slate-500"><span className="block truncate">{banco.sectoristaJefeCuenta || "-"}</span></td>
                      <td className="px-4 py-4 text-sm leading-4 text-slate-500"><span className="block truncate">{banco.telefono}</span></td>
                      <td className="px-4 py-4 text-right text-slate-400">
                        <div className="flex justify-end gap-3">
                          <button type="button" className="cursor-pointer transition-colors hover:text-slate-600" onClick={() => { setIndiceBancoSeleccionado(indiceReal); setEstaAbiertoModalBanco(true); }}><Pencil size={14} /></button>
                          <button type="button" className="cursor-pointer transition-colors hover:text-slate-600" onClick={() => setIndiceBancoAEliminar(indiceReal)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <PaginacionInvestigacion
            paginaActual={paginaBancos}
            totalRegistros={bancosFiltrados.length}
            onPaginaChange={setPaginaBancos}
            etiquetaRegistros="bancos"
          />
        </div>
      ) : null}
    </div>
  );

  const renderizarDatosGenerales = () => (
    <div className="space-y-5">
      <AreaInvestigacionAnalista etiqueta="Información General" valor={datosInvestigacion.datosGenerales.informacionGeneral} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("datosGenerales.informacionGeneral")} filas={8} onChange={(valor) => actualizarDatosGenerales("informacionGeneral", valor)} />
      <AreaInvestigacionAnalista etiqueta="Opinión de Crédito" valor={datosInvestigacion.datosGenerales.opinionCredito} soloLectura={esSoloLectura} adicionalEtiqueta={obtenerIndicadorCambioExtraccion("datosGenerales.opinionCredito")} filas={8} onChange={(valor) => actualizarDatosGenerales("opinionCredito", valor)} />
    </div>
  );

  const renderizarDirectorioEjecutivo = () => (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative flex-1 lg:max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            value={busquedaEjecutivo}
            onChange={(event) => setBusquedaEjecutivo(event.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 pl-9 pr-3 text-sm text-slate-500 outline-none"
            placeholder="Buscar ejecutivo..."
          />
        </label>
        <div className="flex flex-wrap gap-3">
          {ejecutivosExtraccionPendientes.length > 0 ? (
            <button
              type="button"
              onClick={() => setEstaAbiertoModalRevisionEjecutivosExtraccion(true)}
              className="rounded-xl border border-brand-wine/30 px-4 py-2 text-sm font-bold text-brand-wine transition-all hover:bg-brand-wine/5"
            >
              Revisar detectados ({ejecutivosExtraccionPendientes.length})
            </button>
          ) : null}
          <CustomButton
            variant="secondary"
            size="sm"
            disabled={esSoloLectura || datosInvestigacion.directorioEjecutivo.length === 0 || porcentajeRestanteEjecutivos <= 0}
            onClick={completarPorcentajeEjecutivos}
          >
            Completar porcentaje
          </CustomButton>
          <CustomButton
            size="sm"
            disabled={esSoloLectura}
            onClick={() => {
              setIndiceEjecutivoSeleccionado(null);
              setPersonaDirectorioSeleccionada(null);
              setEstaAbiertoModalEjecutivo(true);
            }}
          >
            <Plus size={14} />
            Agregar Ejecutivo
          </CustomButton>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="min-w-[860px] w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
            <tr>
              <th className="px-4 py-3">Ejecutivo</th>
              <th className="px-4 py-3">Cargo</th>
              <th className="px-4 py-3">% Part.</th>
              <th className="px-4 py-3">Lista</th>
              <th className="px-4 py-3">Detalle_Ejecutivo</th>
              <th className="px-4 py-3">Orden</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {ejecutivosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-300">
                  Sin ejecutivos registrados.
                </td>
              </tr>
            ) : ejecutivosPaginados.map((ejecutivo) => {
              const indiceReal = datosInvestigacion.directorioEjecutivo.findIndex((item) => item.id === ejecutivo.id);
              const idCargoDirectorio = ejecutivo.idCargo ?? Number(ejecutivo.cargo);
              const cargoDirectorio = obtenerTextoPorId(opcionesCargoDirectorio, idCargoDirectorio)
                || (Number.isNaN(Number(ejecutivo.cargo)) ? ejecutivo.cargo : "-");

              return (
                <tr key={ejecutivo.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 text-sm font-semibold text-slate-700">{ejecutivo.ejecutivo}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{cargoDirectorio}</td>
                  <td className="px-4 py-4 text-sm text-slate-400">{ejecutivo.porcentaje || "0.00000000%"}</td>
                  <td className="px-4 py-4">
                    {ejecutivo.lista ? <Check size={16} className="text-green-500" /> : <span className="text-slate-300">-</span>}
                  </td>
                  <td className="px-4 py-4">
                    {ejecutivo.detalleEjecutivo ? <Check size={16} className="text-green-500" /> : <span className="text-slate-300">-</span>}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-500">{ejecutivo.orden}</td>
                  <td className="px-4 py-4 text-right text-slate-400">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        className="cursor-pointer transition-colors hover:text-slate-600"
                        disabled={esSoloLectura}
                        onClick={() => {
                          setIndiceEjecutivoSeleccionado(indiceReal);
                          setPersonaDirectorioSeleccionada(null);
                          setEstaAbiertoModalEjecutivo(true);
                        }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button type="button" className="cursor-pointer transition-colors hover:text-slate-600" disabled={esSoloLectura} onClick={() => setIndiceEjecutivoAEliminar(indiceReal)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <PaginacionInvestigacion
        paginaActual={paginaEjecutivos}
        totalRegistros={ejecutivosFiltrados.length}
        onPaginaChange={setPaginaEjecutivos}
        etiquetaRegistros="ejecutivos"
        contenidoCentro={`Total % participación: ${formatearPorcentajeOchoDecimales(Math.min(totalPorcentajeEjecutivos, 100))}`}
      />
    </div>
  );

  const renderizarContenidoSeccion = () => {
    switch (idSeccionActiva) {
      case "identificacion":
        return renderizarIdentificacion();
      case "aspectos-legales":
        return (
          <div className="space-y-5">
            <PestanasInvestigacionAnalista
              opciones={[
                { id: "data", etiqueta: "Data" },
                { id: "companias", etiqueta: "Compañías Relacionadas" },
              ]}
              valorActivo={pestanaAspectosLegales}
              onChange={(valor) => setPestanaAspectosLegales(valor as PestanaAspectosLegales)}
            />
            {renderizarAspectosLegales()}
          </div>
        );
      case "ramo-operaciones":
        return (
          <div className="space-y-5">
            <PestanasInvestigacionAnalista
              opciones={[
                { id: "operaciones", etiqueta: "Operaciones" },
                {
                  id: "importaciones",
                  etiqueta: "Importaciones",
                  disabled: !importacionesHabilitadas,
                  tooltip: "Se habilitará cuando completes el porcentaje de compras en el extranjero.",
                },
                {
                  id: "exportaciones",
                  etiqueta: "Exportaciones",
                  disabled: !exportacionesHabilitadas,
                  tooltip: "Se habilitará cuando completes el porcentaje de ventas en el extranjero.",
                },
                { id: "locales", etiqueta: "Locales" },
              ]}
              valorActivo={pestanaRamoOperacionesVisible}
              onChange={(valor) => {
                setPestanaRamoOperaciones(valor as PestanaRamoOperaciones);
                setIndiceOperacionSeleccionada(null);
                setIndiceLocalSeleccionado(null);
              }}
            />
            {renderizarRamoOperaciones()}
          </div>
        );
      case "informacion-financiera":
        return renderizarInformacionFinanciera();
      case "balances":
        return renderizarBalances();
      case "bancos-proveedores":
        return renderizarBancosProveedores();
      case "datos-generales":
        return renderizarDatosGenerales();
      case "directorio-ejecutivo":
        return renderizarDirectorioEjecutivo();
    }
  };

  return (
    <div ref={contenedorPantallaRef} className="space-y-6">
      <ResumenPedidoInvestigacionAnalista
        idPedido={String(datosPedidoNavegacion?.idPedido ?? idPedido ?? "")}
        plantilla={nombrePlantilla}
        resumen={resumenEncabezado}
        esSoloLectura={esSoloLectura}
        mostrarBotonFinalizar={idSeccionActiva === "datos-generales" && !esSoloLectura}
        onFinalizarInvestigacion={() => setEstaAbiertoModalFinalizarInvestigacion(true)}
        onExtraerInformacion={permiteExtraccionSeccion ? () => abrirModalExtraccionInformacion("general") : undefined}
        onAbrirArchivos={() => setEstaAbiertoModalArchivosInvestigacion(true)}
      />

      <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
        <MenuSeccionesInvestigacionAnalista
          idSeccionActiva={idSeccionActiva}
          onSeleccionar={setIdSeccionActiva}
          estadoSecciones={estadoSecciones}
          secciones={seccionesInvestigacionAnalista}
        />

        <div className="space-y-5">
          <ContenedorSeccionInvestigacionAnalista numero={seccionActual.indice} titulo={seccionActual.titulo} botonExtra={botonExtraSeccion}>
            {renderizarContenidoSeccion()}
          </ContenedorSeccionInvestigacionAnalista>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
            <CustomButton
              variant="secondary"
              size="sm"
              disabled={esSoloLectura}
              onClick={() => setEstaAbiertoModalConfirmacionPrimerBorrador(true)}
            >
              Guardar Borrador
            </CustomButton>

            <div className="flex gap-3">
              <CustomButton
                variant="secondary"
                size="sm"
                disabled={indiceSeccionActiva === 0}
                onClick={() => irASeccion("anterior")}
              >
                <ArrowLeft size={14} />
                Anterior
              </CustomButton>

              {indiceSeccionActiva === seccionesInvestigacionAnalista.length - 1 ? (
                <CustomButton
                  size="sm"
                  disabled={esSoloLectura}
                  onClick={() => setEstaAbiertoModalFinalizarInvestigacion(true)}
                >
                  <Check size={14} />
                  Finalizar Reporte
                </CustomButton>
              ) : (
                <CustomButton size="sm" onClick={() => irASeccion("siguiente")}>
                  Siguiente
                  <ArrowRight size={14} />
                </CustomButton>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate("/analista/bandeja")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition-colors hover:text-slate-700"
      >
        <ArrowLeft size={16} />
        Volver a la bandeja {idPedido ? `#${idPedido}` : ""}
      </button>

      <CustomModalListaPersonasAnalista
        estaAbierto={estaAbiertoModalCompanias}
        opcionesTipoPersona={opcionesTipoPersona}
        opcionesPais={opcionesPais}
        onCerrar={() => setEstaAbiertoModalCompanias(false)}
        onGuardar={agregarCompaniaRelacionada}
      />

      <CustomModalExtraccionInformacionAnalista
        estaAbierto={estaAbiertoModalExtraccionInformacion}
        alcance={alcanceExtraccionInformacion}
        tituloSeccion={tituloSeccionExtraccion}
        seccionesDisponibles={seccionesDisponiblesExtraccion}
        onCerrar={() => setEstaAbiertoModalExtraccionInformacion(false)}
        onExtraer={extraerInformacionDocumento}
      />

      <CustomModalArchivosInvestigacionAnalista
        estaAbierto={estaAbiertoModalArchivosInvestigacion}
        idPedido={Number.isFinite(Number(idPedido)) ? Number(idPedido) : undefined}
        idInforme={idInformeActual}
        archivos={archivosInvestigacion}
        onCerrar={() => setEstaAbiertoModalArchivosInvestigacion(false)}
        onInformeCreado={(nuevoIdInforme) => {
          setIdInformeActual(nuevoIdInforme);
          const parametros = new URLSearchParams(window.location.search);
          parametros.set("modo", "continuar");
          parametros.set("idInforme", String(nuevoIdInforme));
          window.history.replaceState(
            window.history.state,
            "",
            `${window.location.pathname}?${parametros.toString()}`,
          );
        }}
        onArchivosChange={setArchivosInvestigacion}
      />

      <CustomModalOperacionAnalista
        key={`operacion-${pestanaRamoOperacionesVisible}-${indiceOperacionSeleccionada ?? "nuevo"}-${estaAbiertoModalOperacion ? "abierto" : "cerrado"}`}
        estaAbierto={estaAbiertoModalOperacion}
        titulo={
          indiceOperacionSeleccionada != null
            ? (pestanaRamoOperacionesVisible === "importaciones" ? "Editar Importación" : "Editar Exportación")
            : (pestanaRamoOperacionesVisible === "importaciones" ? "Nueva Importación" : "Nueva Exportación")
        }
        subtitulo="Registro de operaciones"
        registroInicial={indiceOperacionSeleccionada != null ? registrosOperacionActivos[indiceOperacionSeleccionada] : null}
        onCerrar={() => {
          setIndiceOperacionSeleccionada(null);
          setEstaAbiertoModalOperacion(false);
        }}
        onGuardar={guardarOperacion}
      />

      <CustomModalLocalAnalista
        key="local-modal"
        estaAbierto={estaAbiertoModalLocal}
        registroInicial={indiceLocalSeleccionado != null ? datosInvestigacion.locales[indiceLocalSeleccionado] : null}
        onCerrar={() => {
          setIndiceLocalSeleccionado(null);
          setEstaAbiertoModalLocal(false);
        }}
        onGuardar={guardarLocal}
      />

      <CustomModalLocalAnalista
        key="local-vista"
        estaAbierto={estaAbiertoVistaLocal}
        registroInicial={indiceVistaLocal != null ? datosInvestigacion.locales[indiceVistaLocal] : null}
        soloLectura
        onCerrar={() => {
          setIndiceVistaLocal(null);
          setEstaAbiertoVistaLocal(false);
        }}
        onGuardar={() => {}}
      />

      <CustomModalBalanceAnalista
        key={`balance-${indiceBalanceSeleccionado ?? "nuevo"}-${estaAbiertoModalBalance ? "abierto" : "cerrado"}`}
        estaAbierto={estaAbiertoModalBalance}
        registroInicial={indiceBalanceSeleccionado != null ? datosInvestigacion.balances[indiceBalanceSeleccionado] : null}
        onCerrar={() => {
          setIndiceBalanceSeleccionado(null);
          setEstaAbiertoModalBalance(false);
        }}
        onGuardar={guardarBalance}
      />

      <CustomModalDetalleCuentasAnalista
        key={`${indiceBalanceSeleccionado ?? "sin-balance"}-${estaAbiertoModalDetalleBalance ? "abierto" : "cerrado"}`}
        estaAbierto={estaAbiertoModalDetalleBalance}
        detalleInicial={indiceBalanceSeleccionado != null ? datosInvestigacion.balances[indiceBalanceSeleccionado]?.detalleCuentas : undefined}
        tipoEstadoFinanciero={indiceBalanceSeleccionado != null ? datosInvestigacion.balances[indiceBalanceSeleccionado]?.tipoEstadoFinanciero : undefined}
        onCerrar={() => {
          setIndiceBalanceSeleccionado(null);
          setEstaAbiertoModalDetalleBalance(false);
        }}
        onGuardar={guardarDetalleCuentasBalance}
      />

      <CustomModalConfirmacionEliminacion
        isOpen={indiceBalanceAEliminar !== null}
        onClose={() => setIndiceBalanceAEliminar(null)}
        onConfirm={() => {
          if (indiceBalanceAEliminar == null) return;
          setDatosInvestigacion((anterior) => ({
            ...anterior,
            balances: anterior.balances.filter((_, indice) => indice !== indiceBalanceAEliminar),
          }));
          setIndiceBalanceAEliminar(null);
        }}
        title="Eliminar Balance"
      >
        <p><span className="font-bold">Código:</span> {indiceBalanceAEliminar != null ? datosInvestigacion.balances[indiceBalanceAEliminar]?.codigo ?? "-" : "-"}</p>
        <p><span className="font-bold">Periodo:</span> {indiceBalanceAEliminar != null ? datosInvestigacion.balances[indiceBalanceAEliminar]?.periodo ?? "-" : "-"}</p>
      </CustomModalConfirmacionEliminacion>

      <CustomModalProveedorAnalista
        key={`proveedor-${indiceProveedorSeleccionado ?? "nuevo"}-${estaAbiertoModalProveedor ? "abierto" : "cerrado"}`}
        estaAbierto={estaAbiertoModalProveedor}
        registroInicial={indiceProveedorSeleccionado != null ? datosInvestigacion.proveedores[indiceProveedorSeleccionado] : null}
        onCerrar={() => {
          setIndiceProveedorSeleccionado(null);
          setEstaAbiertoModalProveedor(false);
        }}
        onGuardar={guardarProveedor}
      />

      <CustomModalBancoAnalista
        key={`banco-${indiceBancoSeleccionado ?? "nuevo"}-${estaAbiertoModalBanco ? "abierto" : "cerrado"}`}
        estaAbierto={estaAbiertoModalBanco}
        registroInicial={indiceBancoSeleccionado != null ? datosInvestigacion.bancos[indiceBancoSeleccionado] : null}
        onCerrar={() => {
          setIndiceBancoSeleccionado(null);
          setEstaAbiertoModalBanco(false);
        }}
        onGuardar={guardarBanco}
      />

      <CustomModalConfirmacionEliminacion
        isOpen={indiceProveedorAEliminar !== null}
        onClose={() => setIndiceProveedorAEliminar(null)}
        onConfirm={() => {
          if (indiceProveedorAEliminar == null) return;
          setDatosInvestigacion((anterior) => ({
            ...anterior,
            proveedores: anterior.proveedores.filter((_, indice) => indice !== indiceProveedorAEliminar),
          }));
          setIndiceProveedorAEliminar(null);
        }}
        title="Eliminar Proveedor"
      >
        <p><span className="font-bold">Proveedor:</span> {indiceProveedorAEliminar != null ? datosInvestigacion.proveedores[indiceProveedorAEliminar]?.nombreEmpresa ?? "-" : "-"}</p>
      </CustomModalConfirmacionEliminacion>

      <CustomModalConfirmacionEliminacion
        isOpen={indiceBancoAEliminar !== null}
        onClose={() => setIndiceBancoAEliminar(null)}
        onConfirm={() => {
          if (indiceBancoAEliminar == null) return;
          setDatosInvestigacion((anterior) => ({
            ...anterior,
            bancos: anterior.bancos.filter((_, indice) => indice !== indiceBancoAEliminar),
          }));
          setIndiceBancoAEliminar(null);
        }}
        title="Eliminar Banco"
      >
        <p><span className="font-bold">Banco:</span> {indiceBancoAEliminar != null ? datosInvestigacion.bancos[indiceBancoAEliminar]?.banco ?? "-" : "-"}</p>
      </CustomModalConfirmacionEliminacion>

      <CustomModalConfirmacionEliminacion
        isOpen={indiceCompaniaAEliminar !== null}
        onClose={() => setIndiceCompaniaAEliminar(null)}
        onConfirm={() => {
          if (indiceCompaniaAEliminar == null) return;
          setDatosInvestigacion((anterior) => ({
            ...anterior,
            companiasRelacionadas: anterior.companiasRelacionadas.filter((_, indice) => indice !== indiceCompaniaAEliminar),
          }));
          setIndiceCompaniaAEliminar(null);
        }}
        title="Eliminar Compañía Relacionada"
      >
        <p><span className="font-bold">Empresa:</span> {indiceCompaniaAEliminar != null ? datosInvestigacion.companiasRelacionadas[indiceCompaniaAEliminar]?.empresa ?? "-" : "-"}</p>
        <p><span className="font-bold">ID Fiscal:</span> {indiceCompaniaAEliminar != null ? datosInvestigacion.companiasRelacionadas[indiceCompaniaAEliminar]?.idFiscal ?? "-" : "-"}</p>
      </CustomModalConfirmacionEliminacion>

      {estaAbiertoModalRevisionCompaniasExtraccion ? (
        <CustomModalRevisionCompaniasExtraccion
          companias={companiasExtraccionPendientes}
          indiceAprobando={crearCompaniaExtraccionMutation.variables?.indice ?? null}
          onEditar={setIndiceCompaniaExtraccionEdicion}
          onAprobar={aprobarCompaniaExtraccion}
          onRechazar={rechazarCompaniaExtraccion}
          onCerrar={() => setEstaAbiertoModalRevisionCompaniasExtraccion(false)}
        />
      ) : null}

      <CustomModalRegistroEmpresaRelacionadaAnalista
        key={`compania-extraccion-${indiceCompaniaExtraccionEdicion ?? "cerrado"}`}
        estaAbierto={indiceCompaniaExtraccionEdicion !== null}
        opcionesTipoPersona={opcionesTipoPersona}
        opcionesPais={opcionesPais}
        registroInicial={
          indiceCompaniaExtraccionEdicion == null
            ? null
            : convertirCompaniaExtraccionARegistro(
                companiasExtraccionPendientes[indiceCompaniaExtraccionEdicion],
                indiceCompaniaExtraccionEdicion,
              )
        }
        tipoCreacion="compania"
        soloEdicionLocal
        onCerrar={() => setIndiceCompaniaExtraccionEdicion(null)}
        onGuardar={guardarEdicionCompaniaExtraccion}
      />

      {estaAbiertoModalRevisionEjecutivosExtraccion ? (
        <CustomModalRevisionEjecutivosExtraccion
          ejecutivos={ejecutivosExtraccionPendientes}
          opcionesCargo={opcionesCargoDirectorio}
          onAprobar={aprobarEjecutivoExtraccion}
          onRechazar={rechazarEjecutivoExtraccion}
          onCerrar={() => setEstaAbiertoModalRevisionEjecutivosExtraccion(false)}
        />
      ) : null}

      <CustomModalRegistroEjecutivoAnalista
        key={`ejecutivo-extraccion-${indiceEjecutivoExtraccionEdicion ?? "cerrado"}-${indiceEjecutivoExtraccionEdicion == null ? "" : ejecutivosExtraccionPendientes[indiceEjecutivoExtraccionEdicion]?.idDirectorioEjecutivo ?? ejecutivosExtraccionPendientes[indiceEjecutivoExtraccionEdicion]?.nombreCompleto ?? ""}`}
        estaAbierto={indiceEjecutivoExtraccionEdicion !== null}
        registroInicial={indiceEjecutivoExtraccionEdicion != null ? ejecutivosExtraccionPendientes[indiceEjecutivoExtraccionEdicion] : null}
        mensajeBusquedaEjecutivo={
          indiceEjecutivoExtraccionAprobacion !== null
            ? "El nombre fue detectado en el documento. Presione Buscar y seleccione un resultado o registre una empresa o persona antes de guardar."
            : undefined
        }
        requiereEjecutivoRegistrado={indiceEjecutivoExtraccionAprobacion !== null}
        onCerrar={() => {
          setIndiceEjecutivoExtraccionEdicion(null);
          setIndiceEjecutivoExtraccionAprobacion(null);
          setIndiceEjecutivoExtraccionBusqueda(null);
          if (ejecutivosExtraccionPendientes.length > 0) {
            setEstaAbiertoModalRevisionEjecutivosExtraccion(true);
          }
        }}
        onBuscarEjecutivo={() => {
          setIndiceEjecutivoExtraccionBusqueda(indiceEjecutivoExtraccionEdicion);
          setEstaAbiertoModalBuscarEjecutivo(true);
        }}
        onGuardar={guardarEdicionEjecutivoExtraccion}
      />

      {estaAbiertoModalRevisionBancosExtraccion ? (
        <CustomModalRevisionBancosExtraccion
          bancos={bancosExtraccionPendientes}
          onAprobar={aprobarBancoExtraccion}
          onRechazar={rechazarBancoExtraccion}
          onCerrar={() => setEstaAbiertoModalRevisionBancosExtraccion(false)}
        />
      ) : null}

      <CustomModalCrearBancoAnalista
        key={`banco-extraccion-crear-${indiceBancoExtraccionEdicion ?? "cerrado"}`}
        estaAbierto={indiceBancoExtraccionEdicion !== null}
        bancoInicial={indiceBancoExtraccionEdicion != null ? {
          idBanco: 0,
          nombre: bancosExtraccionPendientes[indiceBancoExtraccionEdicion]?.banco ?? "",
          telefono: bancosExtraccionPendientes[indiceBancoExtraccionEdicion]?.telefono ?? "",
          pais: bancosExtraccionPendientes[indiceBancoExtraccionEdicion]?.pais ?? "",
          idPais: opcionesPais?.find((op) => op.string1 === bancosExtraccionPendientes[indiceBancoExtraccionEdicion]?.pais)?.num1 ?? undefined,
        } : null}
        onCerrar={() => {
          setIndiceBancoExtraccionEdicion(null);
          if (bancosExtraccionPendientes.length > 0) {
            setEstaAbiertoModalRevisionBancosExtraccion(true);
          }
        }}
        onBancoCreado={onBancoExtraccionCreado}
      />

      <CustomModalBancoAnalista
        key={`banco-extraccion-cuenta-${bancoRecienCreado?.idBanco ?? "cerrado"}`}
        estaAbierto={bancoRecienCreado !== null}
        registroInicial={bancoRecienCreado ? {
          idBanco: bancoRecienCreado.idBanco,
          idPais: bancoRecienCreado.idPais,
          pais: bancoRecienCreado.pais,
          banco: bancoRecienCreado.nombre,
          telefono: bancoRecienCreado.telefono,
          numeroCuenta: "",
          sector: "",
        } : null}
        onCerrar={() => setBancoRecienCreado(null)}
        onGuardar={guardarCuentaBancariaExtraccion}
      />

      <CustomModalConfirmacionAccion
        isOpen={estaAbiertoModalConfirmacionPrimerBorrador}
        onClose={() => setEstaAbiertoModalConfirmacionPrimerBorrador(false)}
        onConfirm={() => guardarBorrador(true)}
        title="Guardar borrador"
        descripcion="Se registrará el informe como borrador y volverás a Mi Bandeja para retomarlo después."
        isSubmitting={guardarInformeMutation.isPending}
        textoConfirmar="Guardar y volver"
        textoCargandoConfirmar="Guardando..."
        varianteConfirmar="primary"
      >
        <p><span className="font-bold">Accion:</span> Se guardará el avance actual del informe.</p>
        <p><span className="font-bold">Destino:</span> Serás redirigido a Mi Bandeja.</p>
      </CustomModalConfirmacionAccion>

      <CustomModalConfirmacionAccion
        isOpen={ciudadExtraccionPendiente != null}
        onClose={() => asignarCiudadExtraccionPendiente(null, false)}
        onConfirm={() => {
          if (!ciudadExtraccionPendiente) return;
          crearCiudadExtraccionMutation.mutate(ciudadExtraccionPendiente);
        }}
        title="Agregar ciudad/estado/provincia"
        descripcion={`Está seguro de querer añadir esta ciudad/estado/provincia al país ${ciudadExtraccionPendiente?.pais ?? ""}?`}
        isSubmitting={crearCiudadExtraccionMutation.isPending}
        textoConfirmar="Añadir"
        textoCargandoConfirmar="Añadiendo..."
        varianteConfirmar="primary"
      >
        <p><span className="font-bold">País:</span> {ciudadExtraccionPendiente?.pais ?? "-"}</p>
        <p><span className="font-bold">Ciudad/Estado/Provincia:</span> {ciudadExtraccionPendiente?.valor ?? "-"}</p>
      </CustomModalConfirmacionAccion>

      <CustomModalConfirmacionAccion
        isOpen={idCambioExtraccionActivo != null}
        onClose={() => setIdCambioExtraccionActivo(null)}
        onConfirm={() => {
          if (!idCambioExtraccionActivo) return;

          const cambio = cambiosExtraccionPendientes[idCambioExtraccionActivo];
          if (!cambio) return;

          aplicarCambioExtraccion(
            idCambioExtraccionActivo,
            () => cambio.alAplicar?.(),
          );
        }}
        title="Reemplazo de valor extraido"
        descripcion={`Desea reemplazar el valor del campo ${cambiosExtraccionPendientes[idCambioExtraccionActivo ?? ""]?.etiqueta ?? ""}?`}
        textoConfirmar="Reemplazar"
        textoCargandoConfirmar="Reemplazando..."
        varianteConfirmar="secondary"
      >
        <div>
          <span className="font-bold">Original:</span>
          <div className="mt-1 max-h-20 overflow-y-auto break-words">{obtenerValorOriginalCambioExtraccion()}</div>
        </div>
        <div>
          <span className="font-bold">Reemplazar por:</span>
          <div className="mt-1 max-h-20 overflow-y-auto break-words">{cambiosExtraccionPendientes[idCambioExtraccionActivo ?? ""]?.valorNuevo ?? "-"}</div>
        </div>
      </CustomModalConfirmacionAccion>

      <CustomModalFinalizarInvestigacionAnalista
        estaAbierto={estaAbiertoModalFinalizarInvestigacion}
        estaGuardando={guardarInformeMutation.isPending}
        onCerrar={() => setEstaAbiertoModalFinalizarInvestigacion(false)}
        onConfirmar={() => guardarInformeMutation.mutate(ID_ESTADO_PEDIDO_FINALIZADO)}
        onVerVistaPreviaInforme={() => setEstaAbiertoVistaPreviaFinalizar(true)}
      />

      <CustomModalVistaPreviaInforme
        estaAbierto={estaAbiertoVistaPreviaFinalizar}
        datosInvestigacion={datosInvestigacion}
        idPedido={Number.isFinite(Number(idPedido)) ? Number(idPedido) : undefined}
        encabezado={{
          pais: resumenEncabezado.pais || "-",
          fecha: new Date().toLocaleDateString("es-PE"),
          tipoSolicitud: resumenEncabezado.prioridad || "-",
          analista: "-",
          traductor: "-",
        }}
        onCerrar={() => setEstaAbiertoVistaPreviaFinalizar(false)}
      />

      <CustomModalRegistroEjecutivoAnalista
        key={`ejecutivo-${indiceEjecutivoSeleccionado ?? "nuevo"}-${personaDirectorioSeleccionada?.id ?? "sin-persona"}-${estaAbiertoModalEjecutivo ? "abierto" : "cerrado"}`}
        estaAbierto={estaAbiertoModalEjecutivo}
        registroInicial={indiceEjecutivoSeleccionado != null ? datosInvestigacion.directorioEjecutivo[indiceEjecutivoSeleccionado] : null}
        personaSeleccionada={personaDirectorioSeleccionada}
        onCerrar={() => {
          setIndiceEjecutivoSeleccionado(null);
          setPersonaDirectorioSeleccionada(null);
          setEstaAbiertoModalEjecutivo(false);
        }}
        onBuscarEjecutivo={() => setEstaAbiertoModalBuscarEjecutivo(true)}
        onGuardar={guardarEjecutivo}
      />

      <CustomModalBuscarEjecutivoAnalista
        key={`buscar-ejecutivo-${indiceEjecutivoExtraccionBusqueda ?? "manual"}-${estaAbiertoModalBuscarEjecutivo ? "abierto" : "cerrado"}`}
        estaAbierto={estaAbiertoModalBuscarEjecutivo}
        registros={registrosPersonaDirectorio}
        busquedaInicial={
          indiceEjecutivoExtraccionBusqueda == null
            ? ""
            : ejecutivosExtraccionPendientes[indiceEjecutivoExtraccionBusqueda]?.nombreCompleto
              ?? ejecutivosExtraccionPendientes[indiceEjecutivoExtraccionBusqueda]?.ejecutivo
              ?? ""
        }
        onCerrar={() => {
          setEstaAbiertoModalBuscarEjecutivo(false);
          setIndiceEjecutivoExtraccionBusqueda(null);
        }}
        onSeleccionar={(registro) => {
          if (indiceEjecutivoExtraccionBusqueda != null) {
            setEjecutivosExtraccionPendientes((anteriores) =>
              anteriores.map((ejecutivo, indice) => (
                indice === indiceEjecutivoExtraccionBusqueda
                  ? {
                      ...ejecutivo,
                      idDirectorioEjecutivo: registro.idDirectorioEjecutivo ?? registro.id,
                      ejecutivo: registro.nombres,
                      nombreCompleto: registro.nombres,
                      pais: registro.pais,
                      tipoPersona: registro.tipoPersona,
                      descripcionBusqueda: registro.nombres,
                    }
                  : ejecutivo
              )),
            );
            setEstaAbiertoModalBuscarEjecutivo(false);
            setIndiceEjecutivoExtraccionBusqueda(null);
            return;
          }
          setPersonaDirectorioSeleccionada(registro);
          setEstaAbiertoModalBuscarEjecutivo(false);
          setEstaAbiertoModalEjecutivo(true);
        }}
        onAgregarEmpresaPersona={() => setEstaAbiertoModalRegistroPersona(true)}
      />

      <CustomModalRegistroPersonaDirectorioAnalista
        key={`registro-persona-${indiceEjecutivoExtraccionBusqueda ?? "manual"}-${estaAbiertoModalRegistroPersona ? "abierto" : "cerrado"}`}
        estaAbierto={estaAbiertoModalRegistroPersona}
        nombreInicial={
          indiceEjecutivoExtraccionBusqueda == null
            ? undefined
            : ejecutivosExtraccionPendientes[indiceEjecutivoExtraccionBusqueda]?.nombreCompleto
              ?? ejecutivosExtraccionPendientes[indiceEjecutivoExtraccionBusqueda]?.ejecutivo
        }
        onCerrar={() => setEstaAbiertoModalRegistroPersona(false)}
        onGuardar={guardarPersonaDirectorio}
      />

      <CustomModalConfirmacionEliminacion
        isOpen={indiceEjecutivoAEliminar !== null}
        onClose={() => setIndiceEjecutivoAEliminar(null)}
        onConfirm={() => {
          if (indiceEjecutivoAEliminar == null) return;
          setDatosInvestigacion((anterior) => ({
            ...anterior,
            directorioEjecutivo: anterior.directorioEjecutivo.filter((_, indice) => indice !== indiceEjecutivoAEliminar),
          }));
          setIndiceEjecutivoAEliminar(null);
        }}
        title="Eliminar Ejecutivo"
      >
        <p><span className="font-bold">Ejecutivo:</span> {indiceEjecutivoAEliminar != null ? datosInvestigacion.directorioEjecutivo[indiceEjecutivoAEliminar]?.nombreCompleto ?? "-" : "-"}</p>
      </CustomModalConfirmacionEliminacion>
    </div>
  );
}

export default function InvestigacionAnalista() {
  const { idPedido } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const modo = (searchParams.get("modo") as ModoInvestigacionAnalista | null) ?? "iniciar";
  const idInforme = searchParams.get("idInforme");
  const idCarga = searchParams.get("carga") ?? "sin-carga";
  const datosPedidoNavegacion = (location.state as { datosPedidoInvestigacion?: DatosPedidoNavegacionInvestigacion } | null)?.datosPedidoInvestigacion;
  const idPedidoNumerico = Number(idPedido);
  const idInformeClave = idInforme ?? "sin-informe";
  const idInformeNumerico = Number(idInforme);
  const usaDatosBackend = modo !== "iniciar" && Number.isFinite(idPedidoNumerico) && idPedidoNumerico > 0;
  const datosBaseInvestigacion = useMemo(() => obtenerDatosInvestigacionAnalista("iniciar"), []);
  const datosEjemploInvestigacion = useMemo(() => obtenerDatosInvestigacionAnalista(modo), [modo]);

  const { data: informeObtenido, isLoading: estaCargandoInforme } = useQuery({
    queryKey: ["informe-obtener-analista", idPedidoNumerico, idCarga],
    queryFn: () => informeService.obtener({
      idPedido: idPedidoNumerico,
    }),
    enabled: usaDatosBackend,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });

  const datosIniciales = (() => {
    if (modo === "iniciar") return datosBaseInvestigacion;
    if (informeObtenido?.datosInvestigacion) return informeObtenido.datosInvestigacion;
    if (usaDatosBackend) return datosBaseInvestigacion;
    return datosEjemploInvestigacion;
  })();

  const claveDatos = usaDatosBackend ? String(informeObtenido?.idInforme ?? "cargando") : "local";

  if (usaDatosBackend && estaCargandoInforme) {
    return <PantallaCarga message="Cargando informacion del informe..." />;
  }

  return (
    <PantallaInvestigacionAnalista
      key={`${idPedido ?? "sin-id"}-${modo}-${idInformeClave}-${idCarga}-${claveDatos}`}
      idPedido={idPedido}
      idInforme={
        Number.isFinite(idInformeNumerico) && idInformeNumerico > 0
          ? idInformeNumerico
          : informeObtenido?.idInforme
      }
      modo={modo}
      datosPedidoNavegacion={datosPedidoNavegacion}
      datosIniciales={datosIniciales}
      archivosIniciales={informeObtenido?.archivosInvestigacion}
      idTipoPersonaInicial={informeObtenido?.idTipoPersona}
      idPaisInicial={informeObtenido?.idPais}
      idTipoRegTributarioInicial={informeObtenido?.taxIdType}
      idEstadoActualInicial={informeObtenido?.idEstadoManual}
      idTipoEmpresaInicial={informeObtenido?.idTipoEmpresa}
      idCiudadRegistroInicial={informeObtenido?.idCiudadRegistro}
      idSectorInicial={informeObtenido?.idSector}
      idActividadInicial={informeObtenido?.idActividad}
    />
  );
}

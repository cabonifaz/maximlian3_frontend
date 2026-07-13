import { ENDPOINTS_COMPANIA_NOTICIA_BALANCE } from "@maximilian/shared/constants/endpoints/compania-noticia-balance.endpoint";
import maximilianService, { esRespuestaOkCompatibilidad } from "./maximilianService";
import { ErrorRespuestaApi, type ApiResponse } from "@maximilian/shared/types/api.type";
import type {
  CompaniaNoticiaBalanceListaItem,
  CompaniaNoticiaBalanceListParams,
  CompaniaNoticiaBalanceListResponse,
  CompaniaNoticiaBalanceObtenerParams,
} from "@maximilian/shared/types/companiaNoticiaBalance.type";
import {
  adaptarCuentaBalanceDesdeApi,
  esCampoEnteroEstadoFinanciero,
  obtenerClaveEstadoFinanciero,
} from "@maximilian/shared/utils/estados-financieros.util";
import { formatearMontoDecimales } from "@maximilian/shared/utils/formato-monto.util";

function obtenerNumero(...valores: unknown[]): number | undefined {
  for (const valor of valores) {
    if (typeof valor === "number" && Number.isFinite(valor)) return valor;
    if (typeof valor === "string" && valor.trim() !== "") {
      const numero = Number(valor);
      if (Number.isFinite(numero)) return numero;
    }
  }

  return undefined;
}

function obtenerTexto(...valores: unknown[]): string {
  for (const valor of valores) {
    if (typeof valor === "string") {
      const texto = valor.trim();
      if (texto) return texto;
    }
  }

  return "";
}

function obtenerRegistro(...valores: unknown[]): Record<string, unknown> {
  for (const valor of valores) {
    if (typeof valor === "object" && valor !== null && !Array.isArray(valor)) {
      return valor as Record<string, unknown>;
    }
  }

  return {};
}

function obtenerLista(...valores: unknown[]): unknown[] {
  for (const valor of valores) {
    if (Array.isArray(valor)) return valor;
  }

  return [];
}

function normalizarBalance(item: unknown): CompaniaNoticiaBalanceListaItem {
  const registroBase = obtenerRegistro(item);
  const registro = obtenerRegistro(
    registroBase.companiaNoticiaBalance,
    registroBase.CompaniaNoticiaBalance,
    registroBase.informeBalance,
    registroBase.InformeBalance,
    registroBase.balance,
    registroBase.Balance,
    registroBase.result,
    registroBase.Result,
    registroBase,
  );
  const cuentaBalance = obtenerRegistro(
    registro.cuentaBalance,
    registro.CuentaBalance,
    registro.detalleBalance,
    registro.DetalleBalance,
    registro.detalleCuentas,
    registro.DetalleCuentas,
    registro.cuentas,
    registro.Cuentas,
    registro,
  );
  const idCompania = obtenerNumero(registro.idCompania, registro.IdCompania) ?? 0;
  const fecha = obtenerTexto(
    registro.fecha,
    registro.Fecha,
    registro.fechaInicio,
    registro.FechaInicio,
    registro.fechaBalance,
    registro.FechaBalance,
    registro.fechaInforme,
    registro.FechaInforme,
  );
  const fechaFin = obtenerTexto(registro.fechaFin, registro.FechaFin);
  const estado = obtenerTexto(registro.estado, registro.Estado);

  const tipo = obtenerTexto(
    registro.tipoEstadoFinanciero,
    registro.TipoEstadoFinanciero,
    registro.tipo,
    registro.Tipo,
    registro.tipoBalance,
    registro.TipoBalance,
  ) || "Balance";

  return {
    idInformeBalance: obtenerNumero(
      registro.idInformeBalance,
      registro.IdInformeBalance,
      registro.idCompaniaNoticiaBalance,
      registro.IdCompaniaNoticiaBalance,
      registro.id,
      registro.Id,
    ) ?? 0,
    idCompania,
    compania: obtenerTexto(
      registro.compania,
      registro.Compania,
      registro.nombreCompania,
      registro.NombreCompania,
      registro.nombreCompleto,
      registro.NombreCompleto,
      registro.empresa,
      registro.Empresa,
      registro.razonSocial,
      registro.RazonSocial,
    ) || (idCompania ? `Compania ${idCompania}` : "-"),
    pais: obtenerTexto(registro.pais, registro.Pais, registro.nombrePais, registro.NombrePais) || "-",
    fecha,
    fechaFin,
    tipo,
    estado: normalizarEstado(estado, fechaFin || fecha),
    detalleCuentas: Object.keys(cuentaBalance).length > 0
      ? normalizarDetalleCuentas(cuentaBalance, tipo)
      : undefined,
  };
}

function normalizarLista(resultado: unknown): CompaniaNoticiaBalanceListResponse {
  if (Array.isArray(resultado)) {
    return {
      lstCompaniaNoticiaBalance: resultado.map(normalizarBalance),
      totalRegistros: resultado.length,
      totalPaginas: 1,
    };
  }

  const registro = obtenerRegistro(resultado);
  const lista = obtenerLista(
    registro.lstCompaniaNoticiaBalance,
    registro.LstCompaniaNoticiaBalance,
    registro.lstCompaniaNoticiaBalances,
    registro.LstCompaniaNoticiaBalances,
    registro.lstCompaniaNoticiasBalance,
    registro.LstCompaniaNoticiasBalance,
    registro.lstCompaniaNoticiasBalances,
    registro.LstCompaniaNoticiasBalances,
    registro.lstBalances,
    registro.LstBalances,
    registro.balances,
    registro.Balances,
    registro.result,
  );

  return {
    lstCompaniaNoticiaBalance: lista.map(normalizarBalance),
    totalRegistros: obtenerNumero(registro.totalRegistros, registro.TotalRegistros, lista.length) ?? 0,
    totalPaginas: obtenerNumero(registro.totalPaginas, registro.TotalPaginas, 1) ?? 1,
  };
}

function normalizarEstado(estado: string, fecha: string): "Vigente" | "Expirado" {
  const estadoNormalizado = estado.toLowerCase();
  if (estadoNormalizado.includes("expir") || estadoNormalizado.includes("venc")) return "Expirado";
  if (estadoNormalizado.includes("vig")) return "Vigente";

  if (!fecha) return "Vigente";

  const fechaParseada = new Date(fecha);
  if (Number.isNaN(fechaParseada.getTime())) return "Vigente";

  const hoy = new Date();
  const diferenciaDias = (hoy.getTime() - fechaParseada.getTime()) / 86_400_000;

  return diferenciaDias > 365 ? "Expirado" : "Vigente";
}

function normalizarDetalleCuentas(cuentaBalance: Record<string, unknown>, tipoEstadoFinanciero: string) {
  const registrosEstadoFinanciero = adaptarCuentaBalanceDesdeApi(cuentaBalance, tipoEstadoFinanciero);
  const claveEstadoFinanciero = obtenerClaveEstadoFinanciero(tipoEstadoFinanciero);
  const valorCuenta = (...claves: string[]) => obtenerValorRegistro(cuentaBalance, ...claves);

  return {
    balanceGeneral: {
      totalCorrientes: formatearMonto(valorCuenta("totalCorriente", "totalActivoCorriente"), 2),
      totalNoCorrientes: formatearMonto(valorCuenta("totalNoCorriente", "totalActivoNoCorriente"), 2),
      otrosActivos: formatearMonto(valorCuenta("otrosActivos"), 2),
      totalActivos: formatearMonto(valorCuenta("totalActivos", "totalActivo"), 2),
      totalPasivosCorrientes: formatearMonto(valorCuenta("totalPasivosCorrientes", "totalPasivoCorriente"), 2),
      totalPasivosNoCorrientes: formatearMonto(valorCuenta("totalPasivosNoCorrientes", "totalPasivoNoCorriente"), 2),
      otrosPasivos: formatearMonto(valorCuenta("otrosPasivos"), 2),
      totalPasivos: formatearMonto(valorCuenta("totalPasivos", "totalPasivo"), 2),
      patrimonio: formatearMonto(valorCuenta("patrimonio", "totalPatrimonio"), 2),
      totalPasivoPatrimonio: formatearMonto(valorCuenta("totalPasivoPatrimonio", "totalPasivosPatrimonio"), 2),
    },
    estadoGananciasPerdidas: {
      ventasNetas: formatearMonto(valorCuenta("ventasNetas", "ingresosOrdinarios", "ingresosIntereses", "primasGanadasNetas"), 2),
      utilidadGanancia: formatearMonto(valorCuenta("utilidadPerdida", "gananciaNeta", "utilidadEjercicio", "utilidadNeta"), 2),
    },
    ratios: {
      liquidez: formatearNumero(valorCuenta("indiceLiquidez"), 2),
      capitalTrabajo: formatearMonto(valorCuenta("capitalTrabajo"), 2),
      endeudamiento: formatearPorcentaje(valorCuenta("ratioEndeudamiento")),
      rentabilidad: formatearPorcentaje(valorCuenta("ratioRentabilidad")),
    },
    tipoBalanceTurquia: claveEstadoFinanciero === "turquia"
      ? obtenerTexto(cuentaBalance.tipoBalanceTurquia, cuentaBalance.TipoBalanceTurquia).toUpperCase() === "C" ? "C" as const : "I" as const
      : undefined,
    registrosHabilitados: true,
    totalesHabilitados: true,
    registrosEstadoFinanciero: Object.fromEntries(
      Object.entries(registrosEstadoFinanciero).map(([clave, valor]) => {
        if (["balance-date", "balance-date-p", "currency", "currency-p", "currency-iso", "reliability-level"].includes(clave)) {
          return [clave, valor];
        }
        if (esCampoEnteroEstadoFinanciero(clave, tipoEstadoFinanciero)) {
          return [clave, valor];
        }
        if (/(indebtedness|profitability)/.test(clave)) {
          return [clave, formatearPorcentaje(valor)];
        }
        const esRatioNumero = claveEstadoFinanciero !== "turquia" && /liquidity/.test(clave);
        return [clave, esRatioNumero ? formatearNumero(valor, 2) : formatearMonto(valor, 2)];
      }),
    ),
  };
}

function obtenerValorRegistro(registro: Record<string, unknown>, ...claves: string[]) {
  for (const clave of claves) {
    const valor = registro[clave] ?? registro[capitalizarClave(clave)];
    if (valor != null && valor !== "") return valor;
  }

  return undefined;
}

function capitalizarClave(clave: string) {
  return clave.charAt(0).toUpperCase() + clave.slice(1);
}

function formatearMonto(valor: unknown, decimales: number) {
  if (valor == null || valor === "") return "";
  return formatearMontoDecimales(String(valor), decimales);
}

function formatearNumero(valor: unknown, decimales: number) {
  if (valor == null || valor === "") return "";
  return formatearMontoDecimales(String(valor), decimales);
}

function formatearPorcentaje(valor: unknown) {
  if (valor == null || valor === "") return "";
  return formatearMontoDecimales(String(valor), 2);
}

export const servicioCompaniaNoticiaBalance = {
  list: async (params: CompaniaNoticiaBalanceListParams): Promise<CompaniaNoticiaBalanceListResponse> => {
    const { data } = await maximilianService.get<ApiResponse<unknown>>(ENDPOINTS_COMPANIA_NOTICIA_BALANCE.listar, {
      params: {
        IdCompania: params.idCompania,
        Busqueda: params.busqueda,
        NumPag: params.numPag,
        TipoEstadoFinanciero: params.tipoEstadoFinanciero,
        Estado: params.estado,
      },
    });

    if (!esRespuestaOkCompatibilidad(data, ENDPOINTS_COMPANIA_NOTICIA_BALANCE.listar)) {
      throw new ErrorRespuestaApi(data);
    }

    return normalizarLista(data.result);
  },

  obtener: async (params: CompaniaNoticiaBalanceObtenerParams): Promise<CompaniaNoticiaBalanceListaItem | null> => {
    const { data } = await maximilianService.get<ApiResponse<unknown>>(ENDPOINTS_COMPANIA_NOTICIA_BALANCE.obtener, {
      params: {
        IdInformeBalance: params.idInformeBalance,
        IdCompania: params.idCompania,
      },
    });

    if (!esRespuestaOkCompatibilidad(data, ENDPOINTS_COMPANIA_NOTICIA_BALANCE.obtener)) {
      throw new ErrorRespuestaApi(data);
    }

    const lista = normalizarLista(data.result).lstCompaniaNoticiaBalance;
    if (lista.length > 0) return lista[0];

    const registro = obtenerRegistro(data.result);
    if (Object.keys(registro).length > 0) return normalizarBalance(registro);

    return null;
  },
};

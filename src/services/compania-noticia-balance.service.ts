import { ENDPOINTS_COMPANIA_NOTICIA_BALANCE } from "@maximilian/shared/constants/endpoints/compania-noticia-balance.endpoint";
import maximilianService, { esRespuestaOkCompatibilidad } from "./maximilian-service";
import { ErrorRespuestaApi, type ApiResponse } from "@maximilian/shared/types/api.type";
import type {
  CompaniaNoticiaBalanceListaItem,
  CompaniaNoticiaBalanceListParams,
  CompaniaNoticiaBalanceListResponse,
  CompaniaNoticiaBalanceObtenerParams,
} from "@maximilian/shared/types/compania-noticia-balance.type";
import {
  adaptarCuentaBalanceDesdeApi,
  esCampoEnteroEstadoFinanciero,
  obtenerClaveEstadoFinanciero,
} from "@maximilian/shared/utils/estados-financieros.util";
import { obtenerTextoNumerico } from "@maximilian/shared/utils/formato-monto.util";
import {
  obtenerLista,
  obtenerNumeroOpcional as obtenerNumero,
  obtenerRegistro,
  obtenerTexto,
} from "@maximilian/shared/utils/normalizacion-respuesta.util";

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
    ) || (idCompania ? `Compañía ${idCompania}` : "-"),
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
      totalCorrientes: obtenerTextoNumerico(valorCuenta("totalCorriente", "totalActivoCorriente")),
      totalNoCorrientes: obtenerTextoNumerico(valorCuenta("totalNoCorriente", "totalActivoNoCorriente")),
      otrosActivos: obtenerTextoNumerico(valorCuenta("otrosActivos")),
      totalActivos: obtenerTextoNumerico(valorCuenta("totalActivos", "totalActivo")),
      totalPasivosCorrientes: obtenerTextoNumerico(valorCuenta("totalPasivosCorrientes", "totalPasivoCorriente")),
      totalPasivosNoCorrientes: obtenerTextoNumerico(valorCuenta("totalPasivosNoCorrientes", "totalPasivoNoCorriente")),
      otrosPasivos: obtenerTextoNumerico(valorCuenta("otrosPasivos")),
      totalPasivos: obtenerTextoNumerico(valorCuenta("totalPasivos", "totalPasivo")),
      patrimonio: obtenerTextoNumerico(valorCuenta("patrimonio", "totalPatrimonio")),
      totalPasivoPatrimonio: obtenerTextoNumerico(valorCuenta("totalPasivoPatrimonio", "totalPasivosPatrimonio")),
    },
    estadoGananciasPerdidas: {
      ventasNetas: obtenerTextoNumerico(valorCuenta("ventasNetas", "ingresosOrdinarios", "ingresosIntereses", "primasGanadasNetas")),
      utilidadGanancia: obtenerTextoNumerico(valorCuenta("utilidadPerdida", "gananciaNeta", "utilidadEjercicio", "utilidadNeta")),
    },
    ratios: {
      liquidez: obtenerTextoNumerico(valorCuenta("indiceLiquidez")),
      capitalTrabajo: obtenerTextoNumerico(valorCuenta("capitalTrabajo")),
      endeudamiento: obtenerTextoNumerico(valorCuenta("ratioEndeudamiento")),
      rentabilidad: obtenerTextoNumerico(valorCuenta("ratioRentabilidad")),
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
          return [clave, obtenerTextoNumerico(valor)];
        }
        return [clave, obtenerTextoNumerico(valor)];
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

export const servicioCompaniaNoticiaBalance = {
  list: async (params: CompaniaNoticiaBalanceListParams): Promise<CompaniaNoticiaBalanceListResponse> => {
    const { data } = await maximilianService.get<ApiResponse<unknown>>(ENDPOINTS_COMPANIA_NOTICIA_BALANCE.listar, {
      params: {
        IdCompania: params.idCompania,
        Busqueda: params.busqueda,
        NumPag: params.numPag,
        TipoEstadoFinanciero: params.tipoEstadoFinanciero,
        Estado: params.estado,
        FchInicio: params.fechaInicio,
        FchFin: params.fechaFin,
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

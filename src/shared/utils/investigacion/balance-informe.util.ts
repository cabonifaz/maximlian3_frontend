import {
  CAMPOS_ESTADO_FINANCIERO_SIN_FORMATO,
  ETIQUETAS_TIPO_ESTADO_FINANCIERO,
} from "@maximilian/shared/constants/utils/investigacion/balance-informe.constants";
import type { RegistroBalanceAnalista } from "@maximilian/shared/types/investigacion.type";
import {
  adaptarCuentaBalanceDesdeApi,
  esCampoEnteroEstadoFinanciero,
  obtenerClaveEstadoFinanciero,
} from "@maximilian/shared/utils/estados-financieros.util";
import { formatearFechaIsoADdMmYyyy } from "@maximilian/shared/utils/fecha.util";
import { obtenerTextoNumerico } from "@maximilian/shared/utils/formato-monto.util";
import {
  obtenerNumeroOpcional,
  obtenerRegistro,
  obtenerTexto,
  obtenerValorRegistro,
} from "@maximilian/shared/utils/normalizacion-respuesta.util";

export function convertirBalanceApiARegistroInvestigacion(
  item: unknown,
  indice: number,
): RegistroBalanceAnalista {
  const balance = obtenerRegistro(item);
  const cuentaBalance = obtenerRegistro(balance.cuentaBalance, balance.CuentaBalance);
  const idTipoBalance = obtenerNumeroOpcional(balance.idTipoBalance, balance.IdTipoBalance, balance.tipoBalance, balance.TipoBalance);
  const idTipoEstadoFinanciero = obtenerNumeroOpcional(
    balance.idTipoEstadoFinanciero,
    balance.IdTipoEstadoFinanciero,
    balance.tipoEstadoFinanciero,
    balance.TipoEstadoFinanciero,
  );
  const idMoneda = obtenerNumeroOpcional(balance.idMoneda, balance.IdMoneda);
  const tipoEstadoFinanciero = obtenerTexto(balance.tipoEstadoFinanciero, balance.TipoEstadoFinanciero)
    || (ETIQUETAS_TIPO_ESTADO_FINANCIERO[idTipoEstadoFinanciero ?? 0] ?? "");
  const claveEstadoFinanciero = obtenerClaveEstadoFinanciero(tipoEstadoFinanciero);
  const registrosEstadoFinanciero = adaptarCuentaBalanceDesdeApi(cuentaBalance, tipoEstadoFinanciero);
  const valorCuenta = (...claves: string[]) => obtenerValorRegistro(cuentaBalance, ...claves);
  const fechaBalance = formatearFechaIsoADdMmYyyy(obtenerTexto(balance.fechaBalance, balance.FechaBalance), "");

  return {
    idInformeBalance: obtenerNumeroOpcional(balance.idInformeBalance, balance.IdInformeBalance, balance.idIformeBalance, balance.IdIformeBalance),
    codigo: obtenerTexto(balance.codigo, balance.Codigo) || `${indice + 1}`,
    periodo: obtenerTexto(balance.periodo, balance.Periodo),
    fecha: obtenerTexto(balance.fechaTexto, balance.FechaTexto) || fechaBalance,
    fechaInicio: fechaBalance || undefined,
    tipo: obtenerTexto(balance.tipo, balance.Tipo),
    idTipoEstadoFinanciero,
    tipoEstadoFinanciero,
    tipoCambio: obtenerTextoNumerico(balance.tipoCambio),
    idMoneda,
    operacionCambio: obtenerTexto(balance.moneda, balance.Moneda),
    idTipoBalance,
    tipoBalance: obtenerTexto(balance.tipoBalanceDescripcion, balance.TipoBalanceDescripcion)
      || (idTipoBalance ? String(idTipoBalance) : ""),
    balanceGeneral: true,
    perdidaGanancia: true,
    cuentas: Object.keys(cuentaBalance).length > 0,
    detalleCuentas: Object.keys(cuentaBalance).length > 0
      ? {
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
            ? (
                obtenerTexto(
                  cuentaBalance.tipoBalanceTurquia,
                  cuentaBalance.TipoBalanceTurquia,
                  balance.tipoBalanceTurquia,
                  balance.TipoBalanceTurquia,
                ).toUpperCase() === "C"
                  ? "C"
                  : "I"
              )
            : undefined,
          registrosHabilitados: true,
          registrosEstadoFinanciero: Object.fromEntries(
            Object.entries(registrosEstadoFinanciero).map(([clave, valor]) => {
              if (CAMPOS_ESTADO_FINANCIERO_SIN_FORMATO.has(clave)) return [clave, valor];
              if (esCampoEnteroEstadoFinanciero(clave, tipoEstadoFinanciero)) return [clave, valor];
              return [clave, obtenerTextoNumerico(valor)];
            }),
          ),
        }
      : undefined,
  };
}

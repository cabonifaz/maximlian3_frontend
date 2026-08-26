import type {
  ColaboradorDesempenoDashboard,
  EvolucionInformesColaboradoresDashboard,
  FiltrosDesempenoColaboradoresDashboard,
  GranularidadTiempoDashboard,
  InformeColaboradorDesempenoDashboard,
  ResumenColaboradorDesempenoDashboard,
} from "@maximilian/shared/types/dashboard.type";
import { formatearFechaIsoLocal } from "@maximilian/shared/utils/fecha.util";
import { obtenerClavePeriodo, obtenerEtiquetaPeriodo } from "@maximilian/shared/utils/dashboard-tiempo.util";
import { MAPA_ID_ROL_COLABORADOR_DESEMPENO_DASHBOARD } from "@maximilian/shared/constants/components/gerente/desempeno-colaboradores-dashboard.constants";

export function filtrarInformesColaboradores(
  informes: InformeColaboradorDesempenoDashboard[],
  colaboradores: ColaboradorDesempenoDashboard[],
  filtros: FiltrosDesempenoColaboradoresDashboard,
) {
  const fechaDesdeIso = filtros.fechaDesde ? formatearFechaIsoLocal(filtros.fechaDesde) : undefined;
  const fechaHastaIso = filtros.fechaHasta ? formatearFechaIsoLocal(filtros.fechaHasta) : undefined;
  const colaboradoresPorId = new Map(
    colaboradores.map((colaborador) => [colaborador.idColaborador, colaborador]),
  );

  return informes.filter((informe) => {
    if (fechaDesdeIso && informe.fechaEntrega < fechaDesdeIso) return false;
    if (fechaHastaIso && informe.fechaEntrega > fechaHastaIso) return false;
    if (filtros.idColaborador !== undefined && informe.idColaborador !== filtros.idColaborador) return false;
    if (
      filtros.idRol !== undefined
      && colaboradoresPorId.get(informe.idColaborador)?.rol !== MAPA_ID_ROL_COLABORADOR_DESEMPENO_DASHBOARD[filtros.idRol]
    ) return false;
    return true;
  });
}

export function agruparEvolucionInformesColaboradores(
  informes: InformeColaboradorDesempenoDashboard[],
  granularidad: GranularidadTiempoDashboard,
): EvolucionInformesColaboradoresDashboard[] {
  const totalesPorPeriodo = new Map<string, number>();

  informes.forEach((informe) => {
    const periodo = obtenerClavePeriodo(informe.fechaEntrega, granularidad);
    totalesPorPeriodo.set(periodo, (totalesPorPeriodo.get(periodo) ?? 0) + 1);
  });

  return [...totalesPorPeriodo.entries()]
    .sort(([periodoA], [periodoB]) => periodoA.localeCompare(periodoB))
    .map(([periodo, cantidadInformes]) => ({
      periodo,
      etiqueta: obtenerEtiquetaPeriodo(periodo, granularidad),
      cantidadInformes,
    }));
}

export function construirResumenColaboradores(
  informes: InformeColaboradorDesempenoDashboard[],
  colaboradores: ColaboradorDesempenoDashboard[],
): ResumenColaboradorDesempenoDashboard[] {
  const colaboradoresPorId = new Map(
    colaboradores.map((colaborador) => [colaborador.idColaborador, colaborador]),
  );
  const porColaborador = new Map<number, ResumenColaboradorDesempenoDashboard>();

  informes.forEach((informe) => {
    const colaborador = colaboradoresPorId.get(informe.idColaborador);
    if (!colaborador) return;

    const acumulado = porColaborador.get(informe.idColaborador);
    if (acumulado) {
      acumulado.cantidadOrdenes += 1;
      acumulado.cantidadInformes += 1;
      acumulado.cantidadTardios += informe.esTardio ? 1 : 0;
      acumulado.cantidadObservados += informe.tieneObservaciones ? 1 : 0;
      acumulado.cantidadConInformacionFinanciera += informe.tieneInformacionFinanciera ? 1 : 0;
      return;
    }

    porColaborador.set(informe.idColaborador, {
      idColaborador: colaborador.idColaborador,
      colaborador: colaborador.colaborador,
      rol: colaborador.rol,
      iniciales: colaborador.iniciales,
      colorLetra: colaborador.colorLetra,
      colorFondo: colaborador.colorFondo,
      cantidadOrdenes: 1,
      porcentajeCumplimiento: 0,
      cantidadInformes: 1,
      cantidadTardios: informe.esTardio ? 1 : 0,
      cantidadObservados: informe.tieneObservaciones ? 1 : 0,
      cantidadConInformacionFinanciera: informe.tieneInformacionFinanciera ? 1 : 0,
    });
  });

  return [...porColaborador.values()]
    .map((resumen) => ({
      ...resumen,
      porcentajeCumplimiento:
        resumen.cantidadOrdenes > 0
          ? Math.round(
              ((resumen.cantidadOrdenes - resumen.cantidadTardios) / resumen.cantidadOrdenes) * 1000,
            ) / 10
          : 0,
    }))
    .sort((a, b) => b.cantidadInformes - a.cantidadInformes);
}

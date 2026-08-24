import { ETIQUETAS_MES_CORTO_ES } from "@maximilian/shared/constants/pages/Gerente/dashboard-tiempo.constants";
import type { GranularidadTiempoDashboard } from "@maximilian/shared/types/dashboard.type";

export function obtenerClavePeriodo(
  fechaIso: string,
  granularidad: GranularidadTiempoDashboard,
): string {
  if (granularidad === "dia") return fechaIso.slice(0, 10);
  if (granularidad === "semana") return obtenerClaveSemanaIso(fechaIso);
  if (granularidad === "ano") return fechaIso.slice(0, 4);
  return fechaIso.slice(0, 7);
}

export function obtenerEtiquetaPeriodo(
  clave: string,
  granularidad: GranularidadTiempoDashboard,
): string {
  if (granularidad === "dia") {
    const [, mes, dia] = clave.split("-");
    return `${dia}/${mes}`;
  }
  if (granularidad === "semana") {
    const semana = clave.split("-W")[1];
    return `Sem ${semana}`;
  }
  if (granularidad === "ano") return clave;

  return ETIQUETAS_MES_CORTO_ES[Number(clave.slice(5, 7)) - 1] ?? clave;
}

function obtenerClaveSemanaIso(fechaIso: string): string {
  const fecha = new Date(`${fechaIso}T00:00:00Z`);
  const diaSemana = (fecha.getUTCDay() + 6) % 7;
  fecha.setUTCDate(fecha.getUTCDate() - diaSemana + 3);

  const primerJueves = new Date(Date.UTC(fecha.getUTCFullYear(), 0, 4));
  const diaPrimerJueves = (primerJueves.getUTCDay() + 6) % 7;
  primerJueves.setUTCDate(primerJueves.getUTCDate() - diaPrimerJueves + 3);

  const numeroSemana =
    1 + Math.round((fecha.getTime() - primerJueves.getTime()) / (7 * 86400000));

  return `${fecha.getUTCFullYear()}-W${String(numeroSemana).padStart(2, "0")}`;
}

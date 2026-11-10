import type { OpcionClienteDestino } from "@maximilian/shared/types/flujo-informe.type";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

export function convertirClientesDestinoAOpciones(clientes: OpcionClienteDestino[]): EntradaTablaMaestra[] {
  return clientes.map((cliente) => ({
    idEmpresa: 0,
    idTablaMaestra: null,
    idMaestro: 0,
    descripcion: cliente.nombre,
    num1: cliente.idCliente,
    num2: null,
    num3: null,
    string1: cliente.nombre,
    string2: null,
    string3: null,
    date1: null,
    date2: null,
    date3: null,
  }));
}

const MILISEGUNDOS_POR_HORA = 60 * 60 * 1000;

export function construirTextoVencimiento(fechaVencimientoIso: string, ahora = new Date()) {
  const horasRestantes = (new Date(fechaVencimientoIso).getTime() - ahora.getTime()) / MILISEGUNDOS_POR_HORA;

  if (horasRestantes < 0) {
    const diasVencido = Math.max(1, Math.ceil(-horasRestantes / 24));
    return { texto: `Vencido ${diasVencido}`, colorTexto: undefined, colorFondo: undefined };
  }

  if (horasRestantes < 24) {
    return { texto: `${Math.max(1, Math.round(horasRestantes))} h`, colorTexto: "#b45309", colorFondo: "#fffbeb" };
  }

  const dias = Math.floor(horasRestantes / 24);
  return { texto: `${dias} ${dias === 1 ? "día" : "días"}`, colorTexto: undefined, colorFondo: undefined };
}

export function formatearFechaHoraCorta(fechaIso: string | null | undefined) {
  if (!fechaIso) return "-";
  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) return "-";
  return fecha.toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

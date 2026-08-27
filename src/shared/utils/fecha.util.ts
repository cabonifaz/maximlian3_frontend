export function formatearFechaDdMmYyyy(fecha: Date) {
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${fecha.getFullYear()}`;
}

export function obtenerPrimerDiaMesActual() {
  const fechaActual = new Date();
  return new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
}

export function formatearFechaIsoLocal(fecha: Date) {
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export function formatearFechaIsoADdMmYyyy(valor?: string | null, fallback = "-", anoCorto = false) {
  const texto = valor?.trim() ?? "";
  if (!texto || texto.startsWith("0001-01-01")) return fallback;

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) return texto;

  const coincidenciaIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!coincidenciaIso) return texto;

  const [, ano, mes, dia] = coincidenciaIso;
  return `${dia}/${mes}/${anoCorto ? ano.slice(-2) : ano}`;
}

export function convertirTextoAFecha(valor: string): Date | undefined {
  const texto = valor.trim();
  if (!texto) return undefined;

  const coincidenciaIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const partes = coincidenciaIso
    ? [Number(coincidenciaIso[3]), Number(coincidenciaIso[2]), Number(coincidenciaIso[1])]
    : texto.split("/").map(Number);
  const [dia, mes, ano] = partes;
  if (!dia || !mes || !ano) return undefined;

  const fecha = new Date(ano, mes - 1, dia);
  return Number.isNaN(fecha.getTime()) ? undefined : fecha;
}

export function formatearFechaVisual(
  valor: string | null | undefined,
  opciones: Intl.DateTimeFormatOptions,
  locale = "es",
  fallback = "-",
) {
  if (!valor) return fallback;

  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;

  return new Intl.DateTimeFormat(locale, opciones).format(fecha);
}

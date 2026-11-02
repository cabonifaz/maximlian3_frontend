export function convertirFechaApiATextoFecha(fecha: string) {
  if (!fecha) return new Date().toISOString().slice(0, 10);

  const fechaParseada = new Date(fecha);
  if (Number.isNaN(fechaParseada.getTime())) {
    return fecha.slice(0, 10);
  }

  const ano = fechaParseada.getFullYear();
  const mes = String(fechaParseada.getMonth() + 1).padStart(2, "0");
  const dia = String(fechaParseada.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

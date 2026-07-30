export function normalizarTextoBusqueda(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function enmascararNumeroCuenta(valor: string) {
  const numeroCuenta = valor.trim();
  if (!numeroCuenta) return "-";
  if (numeroCuenta.length <= 4) return numeroCuenta;
  return `${"*".repeat(numeroCuenta.length - 4)}${numeroCuenta.slice(-4)}`;
}

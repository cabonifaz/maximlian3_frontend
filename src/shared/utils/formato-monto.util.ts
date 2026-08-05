export function obtenerNumeroDesdeMonto(valor?: string) {
  if (!valor?.trim()) return 0;

  const textoNormalizado = valor.replace(/,/g, "").trim();
  const numero = Number.parseFloat(textoNormalizado);
  return Number.isFinite(numero) ? numero : 0;
}

export function obtenerNumeroOpcionalDesdeMonto(valor?: string) {
  if (!valor?.trim()) return null;

  const numero = obtenerNumeroDesdeMonto(valor);
  return Number.isFinite(numero) ? numero : null;
}

export function obtenerTextoNumerico(valor: unknown) {
  if (typeof valor === "number") return Number.isFinite(valor) ? String(valor) : "";
  if (typeof valor === "string") return valor.trim();
  return "";
}

export function formatearMontoDosDecimales(valor: string | number) {
  return formatearMontoDecimales(valor, 2);
}

export function formatearMontoConSimbolo(valor: string | number, simbolo: string) {
  return [simbolo.trim(), formatearMontoDosDecimales(valor)]
    .filter(Boolean)
    .join(" ");
}

export function formatearMontoDecimales(valor: string | number, decimales: number) {
  const numero = typeof valor === "number" ? valor : obtenerNumeroDesdeMonto(valor);
  if (!Number.isFinite(numero)) return typeof valor === "string" ? valor : "";

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(numero);
}

export function sanitizarMontoDosDecimales(valor: string, permitirNegativo = false) {
  return sanitizarMontoDecimales(valor, 2, permitirNegativo);
}

export function sanitizarMontoDecimales(valor: string, decimales: number, permitirNegativo = false) {
  const textoSinComas = valor.replace(/,/g, "");
  let valorNormalizado = textoSinComas.replace(permitirNegativo ? /[^0-9.-]/g : /[^0-9.]/g, "");

  if (permitirNegativo) {
    const tieneNegativoInicial = valorNormalizado.startsWith("-");
    valorNormalizado = valorNormalizado.replace(/-/g, "");
    valorNormalizado = `${tieneNegativoInicial ? "-" : ""}${valorNormalizado}`;
  }

  const signo = valorNormalizado.startsWith("-") ? "-" : "";
  const valorSinSigno = signo ? valorNormalizado.slice(1) : valorNormalizado;
  const partes = valorSinSigno.split(".");
  const entero = partes[0] ?? "";
  const decimal = partes[1] ?? "";
  const enteroFormateado = entero ? Number(entero).toLocaleString("en-US") : "";
  const monto = partes.length > 1 ? `${enteroFormateado}.${decimal.slice(0, decimales)}` : enteroFormateado;

  return `${signo}${monto}`;
}

export function normalizarMontoDosDecimales(valor: string, permitirNegativo = false) {
  return normalizarMontoDecimales(valor, 2, permitirNegativo);
}

export function normalizarMontoDecimales(valor: string, decimales: number, permitirNegativo = false) {
  const valorLimpio = valor.trim();
  if (!valorLimpio || (permitirNegativo && ["-", "-."].includes(valorLimpio))) return "";

  const numero = obtenerNumeroDesdeMonto(valorLimpio);
  if (Number.isNaN(numero)) return valor;

  return formatearMontoDecimales(numero, decimales);
}

export function sanitizarPorcentajeDecimales(valor: string, decimales: number) {
  const valorNormalizado = valor.replace(",", ".").replace(/[^0-9.]/g, "");
  const partes = valorNormalizado.split(".");
  const entero = partes[0] ?? "";
  const decimal = partes[1] ?? "";
  const valorCompuesto = partes.length > 1 ? `${entero}.${decimal.slice(0, decimales)}` : entero;

  if (!valorCompuesto) return "";

  if (entero && Number.parseInt(entero, 10) > 100) {
    return "100";
  }

  if (valorCompuesto === "100" || valorCompuesto.startsWith("100.")) {
    return "100";
  }

  return valorCompuesto;
}

export function normalizarPorcentajeDecimales(valor: string, decimales: number) {
  const valorLimpio = valor.trim().replace("%", "").replace(",", ".");
  if (!valorLimpio) return "";

  const numero = Number.parseFloat(valorLimpio);
  if (Number.isNaN(numero)) return valor;

  return numero.toFixed(decimales);
}

export function obtenerPorcentajeNumerico(valor?: string) {
  const numero = Number.parseFloat((valor ?? "").replace("%", "").replace(",", ".").trim());
  return Number.isNaN(numero) ? 0 : numero;
}

export function obtenerPorcentajeNumericoOpcional(valor?: string) {
  const texto = (valor ?? "").replace("%", "").replace(",", ".").trim();
  if (!texto) return null;

  const numero = Number.parseFloat(texto);
  return Number.isNaN(numero) ? null : numero;
}

export function formatearPorcentajeDecimales(valor: number, decimales: number, quitarCerosFinales = false) {
  const porcentaje = valor.toFixed(decimales);
  return `${quitarCerosFinales ? porcentaje.replace(/\.?0+$/, "") : porcentaje}%`;
}

export function formatearTextoNumericoDecimales(valor: unknown, decimales: number) {
  const texto = obtenerTextoNumerico(valor);
  if (!texto) return "";

  const numero = Number.parseFloat(texto.replace("%", "").replace(",", "."));
  if (Number.isNaN(numero)) return texto;

  return numero.toFixed(decimales);
}

export function seleccionarTextoCampoEditable(event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  const tipo = event.currentTarget instanceof HTMLInputElement ? event.currentTarget.type : "";
  if (["checkbox", "radio", "file", "date"].includes(tipo)) return;
  event.currentTarget.select();
}

export function seleccionarTextoEditableEnContenedor(event: FocusEvent<HTMLElement>) {
  const elemento = event.target;
  if (!(elemento instanceof HTMLInputElement) && !(elemento instanceof HTMLTextAreaElement)) return;

  const tipo = elemento instanceof HTMLInputElement ? elemento.type : "";
  if (["checkbox", "radio", "file", "date"].includes(tipo)) return;
  elemento.select();
}
import type { FocusEvent } from "react";

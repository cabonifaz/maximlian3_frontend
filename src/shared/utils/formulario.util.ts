import type { FieldErrors, FieldValues } from "react-hook-form";

export function extraerMensajesError(errores: FieldErrors<FieldValues>): string[] {
  const mensajes = new Set<string>();

  const recorrer = (valor: unknown) => {
    if (!valor || typeof valor !== "object") return;

    const objeto = valor as Record<string, unknown>;
    if (typeof objeto.message === "string" && objeto.message) {
      mensajes.add(objeto.message);
      return;
    }

    Object.values(objeto).forEach(recorrer);
  };

  recorrer(errores);
  return Array.from(mensajes);
}

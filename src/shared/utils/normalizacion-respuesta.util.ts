export type RegistroRespuesta = Record<string, unknown>;

export function esRegistroRespuesta(valor: unknown): valor is RegistroRespuesta {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

export function obtenerRegistro(...valores: unknown[]): RegistroRespuesta {
  return valores.find(esRegistroRespuesta) ?? {};
}

export function obtenerRegistroOpcional(
  ...valores: unknown[]
): RegistroRespuesta | undefined {
  return valores.find(esRegistroRespuesta);
}

export function obtenerNumeroOpcional(...valores: unknown[]): number | undefined {
  for (const valor of valores) {
    if (typeof valor === "number" && Number.isFinite(valor)) return valor;
    if (typeof valor === "string" && valor.trim() !== "") {
      const numero = Number(valor);
      if (Number.isFinite(numero)) return numero;
    }
  }

  return undefined;
}

export function obtenerNumero(...valores: unknown[]): number {
  return obtenerNumeroOpcional(...valores) ?? 0;
}

export function obtenerTexto(...valores: unknown[]): string {
  for (const valor of valores) {
    if (typeof valor === "string") {
      const texto = valor.trim();
      if (texto) return texto;
    }
  }

  return "";
}

export function obtenerTextoOpcional(...valores: unknown[]): string | undefined {
  return obtenerTexto(...valores) || undefined;
}

export function obtenerTextoSinRecortar(...valores: unknown[]): string {
  return valores.find((valor): valor is string => typeof valor === "string") ?? "";
}

export function obtenerTextoONumero(...valores: unknown[]): string {
  for (const valor of valores) {
    const texto = obtenerTexto(valor);
    if (texto) return texto;
    if (typeof valor === "number" && Number.isFinite(valor)) return String(valor);
  }

  return "";
}

export function obtenerLista(...valores: unknown[]): unknown[] {
  return valores.find(Array.isArray) ?? [];
}

export function obtenerListaPorClaves(
  registro: RegistroRespuesta,
  claves: string[],
): unknown[] {
  return obtenerLista(...claves.map((clave) => registro[clave]));
}

export function obtenerIndicadorBinario(...valores: unknown[]): 0 | 1 {
  for (const valor of valores) {
    if (valor === 1 || valor === "1" || valor === true) return 1;
    if (valor === 0 || valor === "0" || valor === false) return 0;
  }

  return 0;
}

export function obtenerBooleanoEstricto(...valores: unknown[]): boolean {
  return valores.find((valor): valor is boolean => typeof valor === "boolean") ?? false;
}

export function obtenerBooleanoBinario(...valores: unknown[]): boolean {
  for (const valor of valores) {
    if (typeof valor === "boolean") return valor;
    if (typeof valor === "number") return valor === 1;
    if (typeof valor === "string") {
      const texto = valor.trim().toLowerCase();
      if (texto === "true" || texto === "1") return true;
      if (texto === "false" || texto === "0") return false;
    }
  }

  return false;
}

export function obtenerBooleanoTextoOpcional(
  ...valores: unknown[]
): boolean | undefined {
  for (const valor of valores) {
    if (typeof valor === "boolean") return valor;
    if (typeof valor === "string") {
      const texto = valor.toLowerCase();
      if (texto === "true") return true;
      if (texto === "false") return false;
    }
  }

  return undefined;
}

export function obtenerBooleanoFlexible(...valores: unknown[]): boolean {
  for (const valor of valores) {
    if (typeof valor === "boolean") return valor;
    if (typeof valor === "number") return valor === 1;
    if (typeof valor === "string") {
      const texto = valor.trim().toLowerCase();
      if (["1", "true", "si", "sí", "s"].includes(texto)) return true;
      if (["0", "false", "no", "n"].includes(texto)) return false;
    }
  }

  return false;
}

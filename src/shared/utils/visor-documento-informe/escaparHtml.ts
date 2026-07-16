export function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function escaparAtributo(texto: string): string {
  return escaparHtml(texto).replace(/'/g, "&#39;");
}

export function escaparScriptJson(valor: string): string {
  return JSON.stringify(valor).replace(/</g, "\\u003c");
}

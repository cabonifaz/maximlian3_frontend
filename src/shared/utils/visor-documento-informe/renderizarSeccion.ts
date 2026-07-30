import type { PlantillaSeccion } from "@maximilian/shared/types/informe.type";
import { escaparHtml } from "./escaparHtml";

export function renderizarSeccion(seccion: PlantillaSeccion): string {
  const sec = seccion as Record<string, unknown>;
  const secStyle = sec.style
    ? ` style="${sec.style}"`
    : "";
  let html = "";

  switch (seccion.type) {
    case "heading": {
      const tag = seccion.level === 1 ? "h1" : "h2";
      html = `<${tag}${secStyle}>${escaparHtml(seccion.text)}</${tag}>`;
      break;
    }

    case "subtitle":
      html = `<div${secStyle}>${escaparHtml(seccion.text)}</div>`;
      break;

    case "text":
      html = `<div${secStyle}>${escaparHtml(seccion.field)}</div>`;
      break;

    case "inline": {
      const runs = (seccion.runs ?? []).map((r) =>
        r.style
          ? `<span style="${r.style}">${escaparHtml(r.text)}</span>`
          : escaparHtml(r.text)
      ).join("");
      html = `<div${secStyle}>${runs}</div>`;
      break;
    }

    case "keyValue": {
      const kv = seccion as Record<string, unknown>;
      const kvStyle = kv.style ? ` style="${kv.style}"` : "";
      html = `<table${kvStyle}><tbody>${seccion.rows
        .map(
          (row) =>
            `<tr>${row.map((cell) => {
              const attrs = [
                cell.colspan && cell.colspan > 1 ? `colspan="${cell.colspan}"` : "",
                cell.style ? `style="${cell.style}"` : "",
              ].filter(Boolean).join(" ");
              return `<td${attrs ? ` ${attrs}` : ""}>${escaparHtml(cell.text)}</td>`;
            }).join("")}</tr>`,
        )
        .join("")}</tbody></table>`;
      break;
    }

    case "borderedBox": {
      const box = seccion as Record<string, unknown>;
      const boxStyle = box.style ? ` style="${box.style}"` : "";
      const lblStyle = box.labelStyle ? ` style="${box.labelStyle}"` : "";
      const valStyle = box.valueStyle ? ` style="${box.valueStyle}"` : "";
      const titleStyle = box.titleStyle ? ` style="${box.titleStyle}"` : "";
      const rows = (box.rows ?? []) as Record<string, unknown>[];
      let filas = `<tr><td colspan="2"${titleStyle}>${escaparHtml(seccion.title)}</td></tr>`;
      const cellStyle = box.cellStyle ? ` style="${box.cellStyle}"` : "";
      if (seccion.content) {
        filas += `<tr><td colspan="2"${cellStyle}>${escaparHtml(seccion.content)}</td></tr>`;
      }
      filas += rows
        .map((f) => {
          const rowLbl = f.style ? ` style="${f.style}"` : lblStyle;
          return `<tr><td${rowLbl}>${escaparHtml(String(f.label ?? ""))}</td><td${valStyle}>${escaparHtml(String(f.value ?? ""))}</td></tr>`;
        })
        .join("");
      html = `<table${boxStyle}><tbody>${filas}</tbody></table>`;
      break;
    }

    // El "referenceBox" es similar al "borderedBox" pero con un diseño específico para referencias, con un título destacado y una lista de ítems debajo.
    case "referenceBox": {
      const ref = seccion as Record<string, unknown>;
      const refStyle = ref.style ? ` style="${ref.style}"` : "";
      const refTitleStyle = ref.titleStyle ? ` style="${ref.titleStyle}"` : "";
      const refCellStyle = ref.cellStyle ? ` style="${ref.cellStyle}"` : "";
      html = `<table${refStyle}><tbody>
        <tr><td${refTitleStyle}>${escaparHtml(seccion.title)}</td></tr>
        ${seccion.items.map((item, i) => `<tr><td${i === seccion.items.length - 1 ? (ref.lastCellStyle ? ` style="${ref.lastCellStyle}"` : refCellStyle) : refCellStyle}>${escaparHtml(item)}</td></tr>`).join("")}
      </tbody></table>`;
      break;
    }

    case "dataTable": {
      const dtStyleAttr = seccion.style ? ` style="${seccion.style}"` : "";
      const dtCellStyle = seccion.cellStyle
        ? ` style="${seccion.cellStyle}"`
        : "";
      const dtHeaderStyle = seccion.headerStyle
        ? `;${seccion.headerStyle}`
        : "";
      const colgroup = seccion.columnWidths
        ? `<colgroup>${seccion.columnWidths.map((w) => `<col style="width:${w}">`).join("")}</colgroup>`
        : "";
      html = `<table${dtStyleAttr}>${colgroup}<thead><tr>${seccion.columns
        .map(
          (c) =>
            `<th style="${(seccion.cellStyle ?? "") + dtHeaderStyle}">${escaparHtml(c.header)}</th>`,
        )
        .join("")}</tr></thead><tbody>${(seccion.rows ?? [])
        .map((fila) => {
          const celdas = Array.isArray(fila)
            ? fila
            : Object.values(fila as Record<string, unknown>).map(String);
          return `<tr>${celdas.map((celda) => `<td${dtCellStyle}>${escaparHtml(String(celda ?? ""))}</td>`).join("")}</tr>`;
        })
        .join("")}</tbody></table>`;
      break;
    }

    case "repeat":
      html = seccion.sections.map(renderizarSeccion).join("");
      break;

    case "repeatDetail": {
      const rd = seccion as Record<string, unknown>;
      const rdTitleStyle = rd.titleStyle ? ` style="${rd.titleStyle}"` : "";
      const rdContentStyle = rd.contentStyle
        ? ` style="${rd.contentStyle}"`
        : "";
      html = (seccion.items ?? [])
        .map(
          (item) =>
            `<div${rdTitleStyle}>${escaparHtml(item.title)}</div><div${rdContentStyle}>${escaparHtml(item.content)}</div>`,
        )
        .join("");
      break;
    }

    case "spacer":
      html = `<div style="height:${seccion.height ?? "0.3in"}"></div>`;
      break;
  }

  return seccion.pageBreak
    ? `<div class="sr-salto-pagina" aria-hidden="true">&nbsp;</div>${html}`
    : html;
}

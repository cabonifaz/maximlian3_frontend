import type {
  FooterCell,
  PlantillaDocumentoConfig,
  PlantillaSeccion,
} from "@maximilian/shared/types/informe.type";
import { escaparHtml } from "./escaparHtml";
import { renderizarSeccion } from "./renderizarSeccion";

export function construirHtmlContenido(
  config: PlantillaDocumentoConfig,
  secciones: PlantillaSeccion[],
): string {
  const logoUrl = config.header?.logo;
  const logoW = config.header?.logoWidth ?? "1.3in";
  const logoH = config.header?.logoHeight ?? "0.55in";
  const pieTexto = config.footer?.text ?? "";

  const encabezado = logoUrl
    ? `<div class="sr-encabezado-logo"><img src="${logoUrl}" style="width:${logoW};height:${logoH};object-fit:contain;" /></div>`
    : `<div class="sr-encabezado-logo"></div>`;

  const renderFooterCell = (cell: FooterCell): string => {
    const attrs = [
      cell.class ? `class="${cell.class}"` : "",
      cell.style ? `style="${cell.style}"` : "",
      cell.colspan ? `colspan="${cell.colspan}"` : "",
    ].filter(Boolean).join(" ");
    let content = "";
    if (cell.rows) {
      content = `<table style="width:100%;border-collapse:collapse;table-layout:fixed"><tbody>${cell.rows.map(r => `<tr>${r.cells.map(renderFooterCell).join("")}</tr>`).join("")}</tbody></table>`;
    } else if (cell.image) {
      content = `<img src="${cell.image}" style="width:${cell.imageWidth ?? "auto"};height:${cell.imageHeight ?? "auto"};object-fit:contain;" />`;
    } else {
      content = escaparHtml(cell.text ?? "");
    }
    return `<td${attrs ? ` ${attrs}` : ""}>${content}</td>`;
  };
  const pie = config.footer?.layout === "table"
    ? `<div class="sr-pie-pagina"><table class="sr-pie-tabla"><tbody>${(config.footer.rows ?? []).map(row => `<tr>${row.cells.map(renderFooterCell).join("")}</tr>`).join("")}</tbody></table></div>`
    : `<div class="sr-pie-pagina"><span class="sr-pie-texto">${escaparHtml(pieTexto)}</span></div>`;

  const pieP1 = config.firstPageFooter?.layout === "table" && config.firstPageFooter.rows
    ? `<div class="sr-pie-pagina-p1"><table class="sr-pie-tabla"><tbody>${config.firstPageFooter.rows.map(row => `<tr>${row.cells.map(renderFooterCell).join("")}</tr>`).join("")}</tbody></table></div>`
    : config.firstPageFooter
    ? `<div class="sr-pie-pagina-p1"></div>`
    : "";

  const cuerpo = secciones.map(renderizarSeccion).join("\n");

  return `${encabezado}${pie}${pieP1}<div class="sr-contenido">${cuerpo}</div>`;
}
